import { createHash } from "node:crypto";
import {
  AppError,
  CreateOrderRequestSchema,
  OrderIdSchema,
  OrderIdempotencyKeySchema,
  parseOrThrow,
} from "@shelfie/core";
import type { Clock, EngineEnv, IdGenerator, OrderRecord, OrderView } from "@shelfie/core";
import type { Engine } from "./engine.js";
import type { SokosumiClient } from "./sokosumi.js";
import type { Store } from "./store.js";

interface OrderDeps {
  engine: Engine;
  env: EngineEnv;
  store: Store;
  clock: Clock;
  ids: IdGenerator;
  client: SokosumiClient;
}

export class Orders {
  private readonly active = new Set<string>();
  constructor(private readonly d: OrderDeps) {}

  async create(body: unknown, key?: string): Promise<OrderView> {
    const req = parseOrThrow(CreateOrderRequestSchema, body);
    if (
      this.d.env.SOKOSUMI_CLIENT === "fake" &&
      (!this.d.env.FAKE_PAYMENTS ||
        (this.d.env.VERIFY_CLIENT ?? "fake") !== "fake" ||
        this.d.env.EVIDENCE_RUN_LOCKED)
    ) {
      throw new AppError(
        "forbidden",
        "Fake orders require fake payments and verifier, outside evidence runs.",
      );
    }
    const requestHash = createHash("sha256")
      .update(
        JSON.stringify({
          productEan: req.productEan,
          storeIds: [...req.storeIds].sort(),
          note: req.note ?? "",
        }),
      )
      .digest("hex");
    if (key !== undefined) {
      parseOrThrow(OrderIdempotencyKeySchema, key);
      const prior = this.d.store.orders.all().find((o) => o.idempotencyKey === key);
      if (prior) {
        if (prior.requestHash !== requestHash)
          throw new AppError(
            "invalid_request",
            "Idempotency key already used for a different order.",
            409,
          );
        if (
          prior.jobs.some((j) => j.status === "SOKOSUMI_UNAVAILABLE" || j.status === "SUBMITTING")
        )
          throw this.unavailable(prior.id);
        return this.get(prior.id);
      }
    }
    if (req.storeIds.length > this.d.env.ORDER_MAX_STORES)
      throw new AppError("order_cap_reached", "Too many stores in one order.");
    const rejected = req.storeIds
      .map((storeId) => ({
        storeId,
        reasons: this.d.engine.intakeReasons({
          productEan: req.productEan,
          stores: [{ id: storeId }],
        }),
      }))
      .filter((s) => s.reasons.length > 0);
    if (rejected.length > 0)
      throw new AppError(
        "intake_rejected",
        "Some stores or the product are outside the supported catalog.",
        422,
        { stores: rejected },
      );
    const now = this.d.clock.nowIso();
    const day = now.slice(0, 10);
    // BigInt prevents arithmetic overflow near the safe-integer env limit.
    const reserve = BigInt(req.storeIds.length) * BigInt(this.d.env.SOKOSUMI_MAX_CREDITS_PER_TASK);
    const spent = this.d.store.orders
      .all()
      .filter((o) => o.createdAt.slice(0, 10) === day)
      .reduce((sum, o) => sum + BigInt(o.reservedCredits), 0n);
    if (spent + reserve > BigInt(this.d.env.ORDER_DAILY_CREDIT_CAP))
      throw new AppError("daily_cap_reached", "Daily order credit cap reached.");
    let id: string;
    do {
      id = OrderIdSchema.parse(this.d.ids.next("ord"));
    } while (this.d.store.orders.get(id));
    const order: OrderRecord = {
      id,
      productEan: req.productEan,
      createdAt: now,
      fake: this.d.env.SOKOSUMI_CLIENT === "fake",
      idempotencyKey: key ?? `order-${id}`,
      requestHash,
      reservedCredits: Number(reserve),
      jobs: req.storeIds.map((storeId) => ({
        storeId,
        sokosumiTaskId: null,
        jobId: null,
        status: "SUBMITTING",
      })),
    };
    // Synchronous durable reservation before the first await; concurrent requests see this spend.
    this.d.store.orders.put(order);
    this.active.add(id);
    for (const storeId of req.storeIds) {
      try {
        const { taskId } = await this.d.client.createTask(
          {
            orderId: id,
            storeId,
            productEan: req.productEan,
            maxCredits: this.d.env.SOKOSUMI_MAX_CREDITS_PER_TASK,
          },
          (taskId) => {
            const current = this.must(id);
            this.d.store.orders.put({
              ...current,
              jobs: current.jobs.map((j) =>
                j.storeId === storeId ? { ...j, sokosumiTaskId: taskId } : j,
              ),
            });
          },
        );
        const current = this.must(id);
        const row = current.jobs.find((j) => j.storeId === storeId)!;
        if (row.sokosumiTaskId && row.sokosumiTaskId !== taskId) throw this.unavailable(id);
        this.d.store.orders.put({
          ...current,
          jobs: current.jobs.map((j) =>
            j.storeId === storeId ? { ...j, sokosumiTaskId: taskId, status: "AWAITING_SHELL" } : j,
          ),
        });
      } catch {
        const current = this.must(id);
        this.d.store.orders.put({
          ...current,
          jobs: current.jobs.map((j) =>
            j.status === "SUBMITTING" ? { ...j, status: "SOKOSUMI_UNAVAILABLE" } : j,
          ),
        });
        this.active.delete(id);
        throw this.unavailable(id);
      }
    }
    this.active.delete(id);
    return this.get(id);
  }

  private unavailable(id: string): AppError {
    return new AppError(
      "sokosumi_unavailable",
      "Order outcome needs reconciliation. Do not place it again.",
      502,
      { orderId: id },
    );
  }
  private must(id: string): OrderRecord {
    const parsed = OrderIdSchema.safeParse(id);
    const order = parsed.success ? this.d.store.orders.get(parsed.data) : undefined;
    if (!order) throw new AppError("not_found", "Order not found.");
    return order;
  }
  get(id: string): OrderView {
    const order = this.must(id);
    return {
      orderId: order.id,
      productEan: order.productEan,
      createdAt: order.createdAt,
      fake: order.fake,
      jobs: order.jobs.map((row) => {
        // Read-time derivation also sweeps job windows, using the engine's existing lifecycle.
        const job =
          row.jobId && this.d.store.jobs.get(row.jobId)
            ? this.d.engine.getJob(row.jobId)
            : undefined;
        const active = job?.job.state === "COLLECTING" ? job.tasks[0]?.state : undefined;
        return {
          ...row,
          status:
            active ??
            job?.job.state ??
            (row.status === "SUBMITTING" && !this.active.has(id)
              ? "SOKOSUMI_UNAVAILABLE"
              : row.status),
        };
      }),
    };
  }
  list(): { orders: OrderView[] } {
    return {
      orders: this.d.store.orders
        .all()
        .slice()
        .reverse()
        .map((o) => this.get(o.id)),
    };
  }
}
