import { createHash } from "node:crypto";
import {
  AppError,
  BrandIdSchema,
  BrandProfileSchema,
  CreateOrderRequestSchema,
  DEMO_BRAND_ID,
  OrderIdSchema,
  OrderIdempotencyKeySchema,
  parseOrThrow,
} from "@shelfie/core";
import type {
  BrandProfile,
  Clock,
  EngineEnv,
  IdGenerator,
  OrderRecord,
  OrderView,
} from "@shelfie/core";
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

/** Owner of an order; records written before per-brand codes belong to the demo brand. */
const ownerOf = (order: OrderRecord): string => order.brandId ?? DEMO_BRAND_ID;

export class Orders {
  private readonly active = new Set<string>();
  constructor(private readonly d: OrderDeps) {}

  async create(body: unknown, key: string | undefined, brandId: string): Promise<OrderView> {
    const req = parseOrThrow(CreateOrderRequestSchema, body);
    const brand = parseOrThrow(BrandIdSchema, brandId);
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
        // A key used by another brand is treated like a key used for a different order.
        if (ownerOf(prior) !== brand || prior.requestHash !== requestHash)
          throw new AppError(
            "invalid_request",
            "Idempotency key already used for a different order.",
            409,
          );
        if (
          prior.jobs.some((j) => j.status === "SOKOSUMI_UNAVAILABLE" || j.status === "SUBMITTING")
        )
          throw this.unavailable(prior.id);
        return this.get(prior.id, brand);
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
      brandId: brand,
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
    return this.get(id, brand);
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
  /** Another brand's order is indistinguishable from a missing one (ADR-21). */
  private owned(id: string, brandId: string): OrderRecord {
    const order = this.must(id);
    if (ownerOf(order) !== brandId) throw new AppError("not_found", "Order not found.");
    return order;
  }
  get(id: string, brandId: string): OrderView {
    const order = this.owned(id, brandId);
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
  list(brandId: string): { orders: OrderView[] } {
    return {
      orders: this.d.store.orders
        .all()
        .filter((o) => ownerOf(o) === brandId)
        .slice()
        .reverse()
        .map((o) => this.get(o.id, brandId)),
    };
  }

  /**
   * GET /api/brand/me (ADR-21). Credits reserved today are this brand's orders on the current UTC
   * day; the caps are global (one daily cap for the engine), shown here for the brand's view.
   */
  profile(brand: { id: string; name: string; walletAddress: string | null }): BrandProfile {
    const day = this.d.clock.nowIso().slice(0, 10);
    const reservedToday = this.d.store.orders
      .all()
      .filter((o) => ownerOf(o) === brand.id && o.createdAt.slice(0, 10) === day)
      .reduce((sum, o) => sum + BigInt(o.reservedCredits), 0n);
    return BrandProfileSchema.parse({
      brandId: brand.id,
      name: brand.name,
      walletAddress: brand.walletAddress,
      creditsReservedToday: Number(reservedToday),
      dailyCreditCap: this.d.env.ORDER_DAILY_CREDIT_CAP,
      maxCreditsPerTask: this.d.env.SOKOSUMI_MAX_CREDITS_PER_TASK,
      maxStores: this.d.env.ORDER_MAX_STORES,
      fake: this.d.env.SOKOSUMI_CLIENT === "fake",
    });
  }
}
