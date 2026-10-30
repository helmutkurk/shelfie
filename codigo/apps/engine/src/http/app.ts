import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppError, isAppError, systemClock } from "@shelfie/core";
import type { Clock, EngineEnv, FeedEvent, Logger } from "@shelfie/core";
import express from "express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Engine } from "../engine.js";
import {
  FailLock,
  RateLimiter,
  hostGuard,
  isAdminToken,
  originGuard,
  parseAllowedOrigins,
  rateLimit,
  requireAdmin,
  requireShellOrAdmin,
  securityHeaders,
} from "./security.js";

export interface AppOptions {
  engine: Engine;
  env: EngineEnv;
  logger: Logger;
  clock?: Clock;
  /** Extra Host names to accept (LAN IP, tunnel host). PUBLIC_BASE_URL host is always accepted. */
  extraHosts?: readonly string[];
  /** Requests per minute per IP; `null` disables a limiter (tests). */
  limits?: { worker: number | null; claim: number | null; submit: number | null };
  webDist?: string | undefined;
  sseMaxPerIp?: number;
}

type Handler = (req: Request, res: Response) => unknown;

/** Express 4 does not catch async rejections: route everything through this. */
const h =
  (fn: Handler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve()
      .then(() => fn(req, res))
      .catch(next);
  };

function param(req: Request, name: string): string {
  const v = req.params[name];
  return typeof v === "string" ? v : "";
}

function sseOpen(req: Request, res: Response): void {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  res.write("retry: 3000\n\n");
  req.socket.setKeepAlive(true);
}

function sseSend(res: Response, name: string, data: unknown): void {
  res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}

function feedPayload(e: FeedEvent): unknown {
  const { type: _type, ...rest } = e;
  return rest;
}

export function createApp(opts: AppOptions): express.Express {
  const { engine, env, logger } = opts;
  const clock = opts.clock ?? systemClock;
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", "loopback");

  const tokens = { admin: env.ADMIN_TOKEN, shell: env.SHELL_TOKEN };
  const lock = new FailLock(clock);
  const adminOnly = requireAdmin(tokens, lock);
  const shellOrAdmin = requireShellOrAdmin(tokens, lock);
  const lim = opts.limits ?? { worker: 90, claim: 6, submit: 6 };
  const mk = (n: number | null): RequestHandler =>
    rateLimit(n === null ? null : new RateLimiter(n, clock));
  const workerLimit = mk(lim.worker);
  const claimLimit = mk(lim.claim);
  const submitLimit = mk(lim.submit);
  const sseMax = opts.sseMaxPerIp ?? 10;
  const ledgerStreams = new Map<string, number>();

  const hosts = new Set([
    "localhost",
    "127.0.0.1",
    "[::1]",
    "::1",
    ...(opts.extraHosts ?? []).map((x) => x.toLowerCase()),
  ]);
  const originHosts = new Set<string>();
  if (env.PUBLIC_BASE_URL) {
    const u = new URL(env.PUBLIC_BASE_URL);
    hosts.add(u.hostname.toLowerCase());
    originHosts.add(u.host.toLowerCase());
  }

  // request id + access log (method, route pattern, status, duration; no bodies, no query, no IPs)
  app.use((req, res, next) => {
    const started = clock.nowMs();
    const requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
    res.locals["requestId"] = requestId;
    res.on("finish", () => {
      const route =
        typeof req.route === "object" && req.route !== null
          ? (((req.route as { path?: unknown }).path as string | undefined) ?? "")
          : "unmatched";
      logger.info("http", {
        requestId,
        method: req.method,
        route,
        status: res.statusCode,
        ms: clock.nowMs() - started,
      });
    });
    next();
  });
  app.use(securityHeaders());
  app.use(hostGuard(hosts));
  app.use(originGuard(originHosts, parseAllowedOrigins(env.ALLOWED_ORIGINS)));

  const smallJson = express.json({ limit: "16kb", strict: true });
  const photoLimit = Math.ceil((env.MAX_IMAGE_BYTES * 4) / 3) + 4096;
  const bigJson = express.json({ limit: photoLimit, strict: true });
  const isSubmission = (req: Request): boolean =>
    req.method === "POST" && /^\/api\/tasks\/[^/]+\/submissions$/.test(req.path);
  app.use((req, res, next) => (isSubmission(req) ? next() : smallJson(req, res, next)));

  // ---------------------------------------------------------------- public reads
  app.get(
    "/api/health",
    h(async (_req, res) => res.json(await engine.health())),
  );
  app.get(
    "/api/config",
    h((req, res) => {
      const host = (req.hostname || "").toLowerCase();
      const secure =
        req.secure ||
        req.headers["x-forwarded-proto"] === "https" ||
        host === "localhost" ||
        host === "127.0.0.1";
      res.json(engine.configView(secure));
    }),
  );
  app.get(
    "/api/catalog",
    workerLimit,
    h((_req, res) => res.json(engine.catalogView())),
  );
  app.get(
    "/api/jobs",
    h((_req, res) => res.json(engine.listJobs())),
  );

  // ---------------------------------------------------------------- jobs (shell or admin)
  app.post(
    "/api/jobs",
    shellOrAdmin,
    h((req, res) => {
      const out = engine.createJob(req.body, isAdminToken(req, tokens) ? "admin" : "shell");
      res.status(out.status).json(out.body);
    }),
  );
  app.get(
    "/api/jobs/:jobId",
    h((req, res) => res.json(engine.getJob(param(req, "jobId")))),
  );
  app.get(
    "/api/jobs/:jobId/decision",
    shellOrAdmin,
    h(async (req, res) => {
      res.json(await engine.decision(param(req, "jobId"), req.query));
    }),
  );
  app.post(
    "/api/jobs/:jobId/settlement-events",
    shellOrAdmin,
    h((req, res) => {
      const out = engine.settlementEvent(param(req, "jobId"), req.body);
      res.status(out.status).json(out.body);
    }),
  );
  app.post(
    "/api/jobs/:jobId/cancel",
    adminOnly,
    h((req, res) => res.json(engine.cancelJob(param(req, "jobId")))),
  );

  // ---------------------------------------------------------------- tasks and claims
  app.get(
    "/api/tasks",
    workerLimit,
    h((req, res) => res.json(engine.listTasks(req.query))),
  );
  app.get(
    "/api/tasks/stream",
    h((req, res) => {
      const city = engine.streamCity(req.query);
      const ip = req.ip ?? "unknown";
      const unsubscribe = engine.feed.subscribe(
        {
          city,
          send: (e) => {
            sseSend(res, e.type, feedPayload(e));
          },
        },
        ip,
        sseMax,
      );
      if (!unsubscribe) throw new AppError("rate_limited", "Too many open streams.");
      sseOpen(req, res);
      const timer = setInterval(() => {
        sseSend(res, "ping", {});
      }, 15_000);
      req.on("close", () => {
        clearInterval(timer);
        unsubscribe();
      });
    }),
  );
  app.post(
    "/api/tasks/:taskId/claim",
    claimLimit,
    h((req, res) => {
      const out = engine.claimTask(param(req, "taskId"), req.body);
      res.status(out.status).json(out.body);
    }),
  );
  app.post(
    "/api/claims/:claimId/release",
    workerLimit,
    h((req, res) => res.json(engine.releaseClaim(param(req, "claimId")))),
  );

  // ---------------------------------------------------------------- submissions
  app.post(
    "/api/tasks/:taskId/submissions",
    submitLimit,
    bigJson,
    h((req, res) => {
      const out = engine.submitPhoto(param(req, "taskId"), req.body, {
        adminAuthed: isAdminToken(req, tokens),
      });
      res.status(out.status).json(out.body);
    }),
  );
  app.get(
    "/api/submissions/:submissionId",
    workerLimit,
    h((req, res) => res.json(engine.getSubmission(param(req, "submissionId")))),
  );

  // ---------------------------------------------------------------- payouts, ledger
  app.get(
    "/api/payouts",
    h((req, res) => res.json(engine.listPayouts(req.query))),
  );
  app.get(
    "/api/ledger",
    h((req, res) => res.json(engine.ledgerView(req.query))),
  );
  app.get(
    "/api/ledger/stream",
    h((req, res) => {
      const ip = req.ip ?? "unknown";
      const n = ledgerStreams.get(ip) ?? 0;
      if (n >= sseMax) throw new AppError("rate_limited", "Too many open streams.");
      ledgerStreams.set(ip, n + 1);
      sseOpen(req, res);
      const unsub = engine.ledger.subscribe((entry) => {
        sseSend(res, "entry", entry);
      });
      const timer = setInterval(() => {
        res.write(": ping\n\n");
      }, 15_000);
      req.on("close", () => {
        clearInterval(timer);
        unsub();
        ledgerStreams.set(ip, Math.max(0, (ledgerStreams.get(ip) ?? 1) - 1));
      });
    }),
  );

  // ---------------------------------------------------------------- admin: one router, auth applied once
  const admin = express.Router();
  admin.use(adminOnly);
  admin.post(
    "/submissions/:id/override",
    h((req, res) => {
      const out = engine.adminOverride(param(req, "id"), req.body);
      res.status(out.status).json(out.body);
    }),
  );
  admin.post(
    "/payouts/:id/reconcile",
    h(async (req, res) => res.json(await engine.adminReconcile(param(req, "id")))),
  );
  admin.post(
    "/payouts/:id/retry",
    h(async (req, res) => res.json(await engine.adminRetry(param(req, "id")))),
  );
  admin.post(
    "/payouts/:id/mark-paid",
    h(async (req, res) => res.json(await engine.adminMarkPaid(param(req, "id"), req.body))),
  );
  admin.post(
    "/jobs/:id/finalize",
    h((req, res) => {
      const out = engine.finalizeJob(param(req, "id"));
      res.status(out.status).json(out.body);
    }),
  );
  admin.post(
    "/reset",
    h((_req, res) => res.json(engine.adminReset())),
  );
  app.use("/api/admin", admin);
  (app.locals as { adminRouter?: express.Router }).adminRouter = admin;

  // ---------------------------------------------------------------- static web app (optional)
  const dist = opts.webDist;
  if (dist && existsSync(join(dist, "index.html"))) {
    app.use(express.static(dist, { index: "index.html" }));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(join(dist, "index.html"));
    });
  }

  // ---------------------------------------------------------------- 404 and errors
  app.use((_req, _res, next) => {
    next(new AppError("not_found", "Not found."));
  });
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    const requestId = String(res.locals["requestId"] ?? "");
    let app_: AppError;
    const e = err as { type?: string; status?: number } | null;
    if (isAppError(err)) app_ = err;
    else if (e?.type === "entity.too.large")
      app_ = new AppError("image_too_large", "The request body is too large.");
    else if (
      e?.type === "entity.parse.failed" ||
      e?.type === "encoding.unsupported" ||
      e?.type === "charset.unsupported"
    ) {
      app_ = new AppError("invalid_request", "The request body is not valid JSON.");
    } else {
      app_ = new AppError("internal", "Internal error.", 500, { requestId });
      logger.error("unhandled_error", {
        requestId,
        name: err instanceof Error ? err.name : "unknown",
      });
    }
    res.status(app_.status).json(app_.toBody());
  });

  return app;
}
