import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, expect, it } from "vitest";
import type { Express } from "express";
import { createLogger } from "@shelfie/core";
import { createApp } from "./http/app.js";
import { orderRig } from "./orders-testkit.js";
import { EAN } from "./testkit.js";

/** Actual Express middleware/JSON parsing with Node HTTP messages; no listening socket. */
function request(
  app: Express,
  method: string,
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = url;
    const text = body === undefined ? "" : JSON.stringify(body);
    req.headers = {
      host: "localhost",
      ...(body === undefined
        ? {}
        : {
            "content-type": "application/json",
            "content-length": String(Buffer.byteLength(text)),
          }),
      ...headers,
    };
    const res = new ServerResponse(req);
    res.end = ((chunk: string | Buffer) => {
      try {
        const body: unknown = JSON.parse(
          typeof chunk === "string" ? chunk : chunk.toString("utf8"),
        );
        res.emit("finish");
        resolve({ status: res.statusCode, body });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Invalid response"));
      }
      socket.destroy();
      return res;
    }) as typeof res.end;
    app(req, res);
    req.push(text || null);
    if (text) req.push(null);
  });
}

describe("order HTTP security without sockets", () => {
  it("protects every route, applies caps/intake/rate limiting and never logs headers or query secrets", async () => {
    const r = orderRig({ ORDER_MAX_STORES: "1", ORDER_DAILY_CREDIT_CAP: "100" });
    const app = createApp({
      engine: r.engine,
      orders: r.orders,
      env: r.env,
      clock: r.clock,
      logger: createLogger({ sink: (line) => r.logs.push(line) }),
    });
    const input = { productEan: EAN, storeIds: ["s1"] };
    const token = { "x-brand-token": r.env.BRAND_TOKEN! };
    for (const path of ["/api/orders", "/api/orders/ord_01"]) {
      expect((await request(app, "GET", path)).status).toBe(401);
      expect(
        (await request(app, "GET", path, undefined, { "x-brand-token": "wrong" })).status,
      ).toBe(401);
    }
    expect(
      (await request(app, "POST", `/api/orders?token=${r.env.BRAND_TOKEN!}`, input)).status,
    ).toBe(401);
    expect(
      (await request(app, "POST", "/api/orders", { ...input, storeIds: ["unknown"] }, token))
        .status,
    ).toBe(422);
    expect(r.store.orders.all()).toHaveLength(0);
    expect(
      (await request(app, "POST", "/api/orders", { ...input, storeIds: ["s1", "s2"] }, token))
        .status,
    ).toBe(429);
    const created = await request(app, "POST", "/api/orders", input, token);
    expect(created.status).toBe(201);
    expect((await request(app, "GET", "/api/orders", undefined, token)).body).toMatchObject({
      orders: [created.body],
    });
    expect((await request(app, "GET", "/api/orders/ord_01", undefined, token)).body).toEqual(
      created.body,
    );
    expect((await request(app, "POST", "/api/orders", input, token)).body).toMatchObject({
      error: { code: "daily_cap_reached" },
    });
    for (let i = 0; i < 3; i++) await request(app, "POST", "/api/orders", input, token);
    expect((await request(app, "POST", "/api/orders", input, token)).body).toMatchObject({
      error: { code: "rate_limited" },
    });
    const logs = r.logs.join("\n");
    expect(logs).not.toContain(r.env.BRAND_TOKEN!);
    expect(logs).not.toContain("?token");
  });
});
