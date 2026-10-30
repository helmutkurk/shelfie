import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SequentialIdGenerator } from "@shelfie/core";
import { MemoryStore } from "./store.js";
import { Orders } from "./orders.js";
import { RealSokosumiClient } from "./sokosumi.js";
import type { SokosumiClient } from "./sokosumi.js";
import { ADDR_A, EAN, STORE_POS, photoB64 } from "./testkit.js";
import { orderRig } from "./orders-testkit.js";

const input = { productEan: EAN, storeIds: ["s1", "s2"] };

describe("orders", () => {
  it("creates one fake shell job per store, deduplicates retries and follows delivery/settlement", async () => {
    const r = orderRig();
    const order = await r.orders.create(input, "request-01");
    expect(order.fake).toBe(true);
    expect(order.jobs).toHaveLength(2);
    expect(order.jobs.every((j) => j.jobId && j.sokosumiTaskId?.startsWith("fake-"))).toBe(true);
    expect((await r.orders.create(input, "request-01")).orderId).toBe(order.orderId);
    expect(r.store.jobs.all()).toHaveLength(2);
    await expect(
      r.orders.create({ ...input, storeIds: ["s1"] }, "request-01"),
    ).rejects.toMatchObject({ status: 409 });
    const jobId = order.jobs[0]!.jobId!;
    const task = r.store.tasks.all().find((t) => t.jobId === jobId)!;
    r.engine.claimTask(task.id, {
      workerId: "wrk_aaa",
      payoutAddress: ADDR_A,
      location: STORE_POS,
    });
    expect(r.orders.get(order.orderId).jobs[0]?.status).toBe("CLAIMED");
    const claim = r.store.claims.all()[0]!;
    r.engine.submitPhoto(
      task.id,
      {
        claimId: claim.id,
        imageBase64: photoB64(),
        mimeType: "image/jpeg",
        location: { ...STORE_POS, accuracyM: 18, fixAgeMs: 0 },
        clientMeta: { captureMode: "getUserMedia" },
      },
      { adminAuthed: false },
    );
    await r.engine.idle();
    expect(r.orders.get(order.orderId).jobs[0]?.status).toBe("DELIVERABLE");
    r.engine.settlementEvent(jobId, { event: "RESULT_SUBMITTED" });
    r.engine.settlementEvent(jobId, { event: "SETTLED" });
    expect(r.orders.get(order.orderId).jobs[0]?.status).toBe("SETTLED");
    r.clock.advance(1000_000);
    r.engine.tick();
    expect(r.orders.get(order.orderId).jobs[1]?.status).toBe("WITHHELD");
    r.engine.settlementEvent(order.jobs[1]!.jobId!, { event: "WITHHELD" });
    r.engine.settlementEvent(order.jobs[1]!.jobId!, { event: "REFUND_OBSERVED" });
    expect(r.orders.get(order.orderId).jobs[1]?.status).toBe("REFUNDED");
  });

  it("reserves the daily cap before awaiting I/O, survives replay and reset, and never retries ambiguity", async () => {
    let calls = 0;
    const client: SokosumiClient = {
      createTask: () => {
        calls++;
        return Promise.reject(new Error("unknown purchase"));
      },
    };
    const r = orderRig({ ORDER_DAILY_CREDIT_CAP: "200" }, client);
    const results = await Promise.allSettled([r.orders.create(input), r.orders.create(input)]);
    expect(results.every((v) => v.status === "rejected")).toBe(true);
    expect(calls).toBe(1); // remaining store is left unsubmitted after the first ambiguous failure
    const saved = r.store.orders.all()[0]!;
    expect(r.orders.get(saved.id).jobs[0]?.status).toBe("SOKOSUMI_UNAVAILABLE");
    await expect(r.orders.create(input, saved.idempotencyKey)).rejects.toMatchObject({
      status: 502,
    });
    const replay = new MemoryStore(join(r.dir, "store.jsonl"));
    const next = new Orders({
      engine: r.engine,
      env: r.env,
      store: replay,
      clock: r.clock,
      ids: new SequentialIdGenerator(),
      client,
    });
    r.engine.adminReset();
    expect(r.store.orders.all()).toHaveLength(1);
    await expect(next.create(input)).rejects.toMatchObject({ code: "daily_cap_reached" });
    r.clock.advance(86400_000);
    await expect(next.create(input)).rejects.toMatchObject({ status: 502 });
    expect(new Set(replay.orders.all().map((o) => o.id)).size).toBe(2);
  });

  it("retains a known upstream Task id after a later purchase failure", async () => {
    const r = orderRig(
      {},
      {
        createTask: (_input, created) => {
          created?.("upstream-task");
          return Promise.reject(new Error("later failure"));
        },
      },
    );
    await expect(r.orders.create({ ...input, storeIds: ["s1"] })).rejects.toMatchObject({
      status: 502,
    });
    expect(r.orders.list().orders[0]?.jobs[0]).toMatchObject({
      sokosumiTaskId: "upstream-task",
      status: "SOKOSUMI_UNAVAILABLE",
    });
  });
  it("links a real asynchronous shell pickup by order/store ids and rejects mismatches", async () => {
    const r = orderRig({}, { createTask: () => Promise.resolve({ taskId: "real-task" }) });
    const order = await r.orders.create({ ...input, storeIds: ["s1"] });
    expect(order.jobs[0]?.status).toBe("AWAITING_SHELL");
    const body = {
      packId: "shelf-check",
      source: "shell",
      externalRef: "real-task",
      input: { productEan: EAN, stores: [{ id: "s1" }] },
      orderRef: { orderId: order.orderId, storeId: "s1" },
    };
    r.engine.createJob(body, "shell");
    r.engine.createJob(body, "shell");
    expect(r.orders.get(order.orderId).jobs[0]?.jobId).toBe(r.store.jobs.all()[0]?.id);
    expect(r.store.jobs.all()).toHaveLength(1);
    expect(() => r.engine.createJob({ ...body, externalRef: "other-task" }, "shell")).toThrow();
    expect(() =>
      r.engine.createJob({ ...body, input: { productEan: EAN, stores: [{ id: "s2" }] } }, "shell"),
    ).toThrow();
  });
});

describe("real Sokosumi transport (mocked, B-15 still open)", () => {
  it("probes the real schema with server credentials but never purchases before B-15 verifies the Task boundary", async () => {
    const calls: RequestInit[] = [];
    const urls: string[] = [];
    const env = orderRig({
      SOKOSUMI_CLIENT: "real",
      SOKOSUMI_API_TOKEN: "synthetic-api-token",
      SOKOSUMI_AGENT_ID: "agent-1",
    }).env;
    const client = new RealSokosumiClient(env, (url, init) => {
      urls.push(url instanceof Request ? url.url : String(url));
      calls.push(init!);
      return Promise.resolve(Response.json({ data: { input_data: [] } }));
    });
    await expect(
      client.createTask({ orderId: "ord_01", storeId: "s1", productEan: EAN, maxCredits: 100 }),
    ).rejects.toMatchObject({
      code: "sokosumi_unavailable",
      message: "Real Task purchases are blocked pending the B-15 capped REST spike.",
    });
    expect(urls).toEqual(["https://api.preprod.sokosumi.com/v1/agents/agent-1/input-schema"]);
    expect(calls[0]?.method).toBe("GET");
    expect(calls[0]?.body).toBeUndefined();
    expect(calls[0]?.signal).toBeInstanceOf(AbortSignal);
    expect(calls[0]?.redirect).toBe("error");
  });

  it("hides upstream bodies, errors and malformed responses; does not retry", async () => {
    const env = orderRig({
      SOKOSUMI_CLIENT: "real",
      SOKOSUMI_API_TOKEN: "synthetic-api-token",
      SOKOSUMI_AGENT_ID: "agent-1",
    }).env;
    for (const response of [
      new Response("synthetic-api-token", { status: 401 }),
      Response.json({ data: "invalid schema" }),
    ]) {
      let count = 0;
      const client = new RealSokosumiClient(env, () => {
        count++;
        return Promise.resolve(response);
      });
      await expect(
        client.createTask({ orderId: "ord_01", storeId: "s1", productEan: EAN, maxCredits: 100 }),
      ).rejects.toMatchObject({
        code: "sokosumi_unavailable",
        message: "Sokosumi request could not be confirmed.",
      });
      expect(count).toBe(1);
    }
  });
});
