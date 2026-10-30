import { describe, expect, it } from "vitest";
import type { Request, Response } from "express";
import { EngineEnvSchema, collectSecretValues, createLogger, loadEnv } from "@shelfie/core";
import { requireBrand } from "./http/security.js";
import { orderRig } from "./orders-testkit.js";
import { EAN } from "./testkit.js";

const brand = "b".repeat(40);
const body = { productEan: EAN, storeIds: ["s1"] };
function auth(
  headers: Record<string, string> = {},
  query: Record<string, string> = {},
  configured: string | undefined = brand,
) {
  let error: unknown;
  requireBrand(configured)(
    { headers, query } as unknown as Request,
    {} as Response,
    (err?: unknown) => {
      error = err;
    },
  );
  return error;
}

describe("order trust boundary", () => {
  it("returns 401 without a header, rejects query tokens, wrong codes and absent server configuration", () => {
    expect(auth()).toMatchObject({ status: 401, code: "brand_token_missing" });
    expect(auth({}, { "X-Brand-Token": brand, token: brand })).toMatchObject({
      status: 401,
      code: "brand_token_missing",
    });
    expect(auth({ "x-brand-token": "wrong" })).toMatchObject({
      status: 401,
      code: "brand_token_invalid",
    });
    expect(auth({ "x-brand-token": brand })).toBeUndefined();
    const guard = requireBrand(undefined);
    let err: unknown;
    guard(
      { headers: { "x-brand-token": brand } } as unknown as Request,
      {} as Response,
      (e?: unknown) => {
        err = e;
      },
    );
    expect(err).toMatchObject({ status: 401 });
  });
  it("refuses out-of-catalog stores/products before any Sokosumi call, with per-store reasons", async () => {
    let calls = 0;
    const r = orderRig(
      {},
      {
        createTask: () => {
          calls++;
          return Promise.resolve({ taskId: "unexpected" });
        },
      },
    );
    await expect(r.orders.create({ ...body, storeIds: ["s1", "unknown"] })).rejects.toMatchObject({
      status: 422,
      details: { stores: [{ storeId: "unknown", reasons: [{ code: "unknown_store" }] }] },
    });
    await expect(r.orders.create({ ...body, productEan: "9999999999999" })).rejects.toMatchObject({
      code: "intake_rejected",
    });
    await expect(r.orders.create({ ...body, storeIds: ["b1"] })).rejects.toMatchObject({
      code: "intake_rejected",
    });
    expect(calls).toBe(0);
    expect(r.store.orders.all()).toHaveLength(0);
  });
  it("enforces store/daily caps as 429 before spending, and rejects duplicate ids and extra fields", async () => {
    let calls = 0;
    const r = orderRig(
      { ORDER_MAX_STORES: "1", ORDER_DAILY_CREDIT_CAP: "100" },
      {
        createTask: () => {
          calls++;
          return Promise.resolve({ taskId: "task-1" });
        },
      },
    );
    await expect(r.orders.create({ ...body, storeIds: ["s1", "s2"] })).rejects.toMatchObject({
      status: 429,
      code: "order_cap_reached",
    });
    await r.orders.create(body);
    await expect(r.orders.create(body)).rejects.toMatchObject({
      status: 429,
      code: "daily_cap_reached",
    });
    await expect(r.orders.create({ ...body, storeIds: ["s1", "s1"] })).rejects.toMatchObject({
      status: 422,
    });
    await expect(r.orders.create({ ...body, token: brand })).rejects.toMatchObject({ status: 422 });
    expect(calls).toBe(1);
  });
  it("never forwards notes/tokens into Task input or stores/logs and scrubs env secrets", async () => {
    const inputs: unknown[] = [];
    const note = "synthetic-private-note";
    const r = orderRig(
      {},
      {
        createTask: (input) => {
          inputs.push(input);
          return Promise.resolve({ taskId: "task-1" });
        },
      },
    );
    await r.orders.create({ ...body, note });
    const output = JSON.stringify([inputs, r.store.orders.all(), r.logs]);
    expect(output).not.toContain(note);
    expect(output).not.toContain(brand);
    const logs: string[] = [];
    const source = { BRAND_TOKEN: brand, SOKOSUMI_API_TOKEN: "synthetic-api-token" };
    createLogger({
      sink: (line) => logs.push(line),
      secretValues: collectSecretValues(source),
    }).info("purchase", { token: brand, authorization: "Bearer synthetic-api-token" });
    expect(logs.join()).not.toContain(brand);
    expect(logs.join()).not.toContain(source.SOKOSUMI_API_TOKEN);
  });
  it("refuses fake orders in evidence or with a real verifier/payment mode and marks their ledger provenance", async () => {
    for (const vars of [{ EVIDENCE_RUN_LOCKED: "1" }, { VERIFY_CLIENT: "real" }] as Record<
      string,
      string
    >[]) {
      const r = orderRig(vars);
      await expect(r.orders.create(body)).rejects.toMatchObject({ code: "forbidden" });
      expect(r.store.orders.all()).toHaveLength(0);
    }
    const r = orderRig();
    // Verify the guard without needing a wallet or reading secrets.
    r.env.FAKE_PAYMENTS = false;
    await expect(r.orders.create(body)).rejects.toMatchObject({ code: "forbidden" });
    r.env.FAKE_PAYMENTS = true;
    const order = await r.orders.create(body);
    const entries = r.engine.ledger
      .all()
      .filter((entry) => entry.refs["jobId"] === order.jobs[0]?.jobId);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.flags["fakeSokosumi"] === true)).toBe(true);
    expect(r.engine.configView(true).orders?.fake).toBe(true);
    expect(
      orderRig({
        SOKOSUMI_CLIENT: "real",
        SOKOSUMI_API_TOKEN: "synthetic-api-token",
        SOKOSUMI_COWORKER_ID: "coworker-1",
        SOKOSUMI_ORGANIZATION_SLUG: "org-slug",
      }).engine.configView(true).orders?.enabled,
    ).toBe(false);
  });
  it("fails closed on real-mode credentials, weak brand codes and non-preprod URLs", () => {
    for (const vars of [
      { SOKOSUMI_CLIENT: "real" },
      { BRAND_TOKEN: "short" },
      { SOKOSUMI_API_URL: "https://example.invalid" },
      {
        SOKOSUMI_CLIENT: "real",
        SOKOSUMI_API_TOKEN: "synthetic-api-token",
        SOKOSUMI_AGENT_ID: "agent-1",
      },
    ]) {
      expect(() => loadEnv(EngineEnvSchema, { FAKE_PAYMENTS: "1", ...vars })).toThrow();
    }
  });
});
