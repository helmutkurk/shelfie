// Evidence-run preflight (task B-12, security.md section 5 and P6): one command that fails when
// anything fake, dry or overridden would make a recording or a milestone run invalid evidence.
//   node --env-file=.env --import tsx scripts/evidence-preflight.ts [--since <iso>] [--no-engine]
// Checks the env of the engine and the verifier (same env file), then the running engine's
// /api/health, then the evidence ledger (no demo override or operator mark-paid in the run).
// Prints names and pass/fail only, never values. Exit 0 = all pass, 1 = a check failed.
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import {
  AppError,
  EngineEnvSchema,
  HealthResponseSchema,
  LedgerEventSchema,
  VerifierEnvSchema,
  loadEnv,
} from "@shelfie/core";

const out = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

/** Ledger flags that mean "not real evidence" (operatorAlert is an alert, not a fake). */
const FORBIDDEN_FLAGS = ["demoOverride", "operatorMarkedPaid"] as const;

async function main(): Promise<void> {
  const { values: args } = parseArgs({
    options: { since: { type: "string" }, "no-engine": { type: "boolean", default: false } },
    strict: true,
  });
  const since = args.since === undefined ? null : Date.parse(args.since);
  if (since !== null && !Number.isFinite(since)) {
    out("FAIL  --since must be an ISO timestamp");
    process.exit(1);
  }

  const results: { ok: boolean; name: string }[] = [];
  const check = (ok: boolean, name: string): void => {
    results.push({ ok, name });
  };

  let engine: ReturnType<typeof loadEnv<typeof EngineEnvSchema>> | null = null;
  let verifier: ReturnType<typeof loadEnv<typeof VerifierEnvSchema>> | null = null;
  try {
    engine = loadEnv(EngineEnvSchema, process.env);
  } catch (err) {
    check(false, `engine env valid (${err instanceof AppError ? err.message : "invalid"})`);
  }
  try {
    verifier = loadEnv(VerifierEnvSchema, process.env);
  } catch (err) {
    check(false, `verifier env valid (${err instanceof AppError ? err.message : "invalid"})`);
  }

  if (engine) {
    check(engine.NETWORK === "preprod", "NETWORK=preprod");
    check(!engine.FAKE_PAYMENTS, "FAKE_PAYMENTS off");
    check(engine.VERIFIER_PAYMENT === "on", "VERIFIER_PAYMENT=on (engine pays the verifier)");
    check(engine.VERIFY_CLIENT !== "fake", "VERIFY_CLIENT not fake");
    check(!engine.ALLOW_DEMO_OVERRIDE, "ALLOW_DEMO_OVERRIDE off");
    check(!engine.ALLOW_TEST_UPLOAD, "ALLOW_TEST_UPLOAD off");
    check(engine.LOCATION_CHECK === "on", "LOCATION_CHECK=on");
  }
  if (verifier) {
    check(verifier.VERIFIER_MODE !== "stub", "VERIFIER_MODE not stub (real vision)");
    check(!verifier.ENABLE_DRY, "ENABLE_DRY off (dry and extract routes absent)");
    check(verifier.X_ENGINE_TOKEN_REQUIRED, "X_ENGINE_TOKEN_REQUIRED on");
  }

  if (engine && !args["no-engine"]) {
    try {
      const res = await fetch(`http://127.0.0.1:${String(engine.ENGINE_PORT)}/api/health`, {
        signal: AbortSignal.timeout(5_000),
        redirect: "error",
      });
      const h = HealthResponseSchema.parse(await res.json());
      check(h.ok, "engine /api/health ok");
      check(!h.fakes.payments && !h.fakes.verifier, "engine /api/health reports no fakes");
      check(h.verifier === "up", "engine sees the verifier up");
    } catch {
      check(false, "engine /api/health reachable (start the engine or pass --no-engine)");
    }
  }

  if (engine) {
    let flagged = 0;
    let lines = 0;
    let readable = true;
    try {
      const raw = readFileSync(engine.LEDGER_PATH, "utf8");
      for (const line of raw.split("\n")) {
        if (line.trim() === "") continue;
        const e = LedgerEventSchema.parse(JSON.parse(line));
        if (since !== null && Date.parse(e.ts) < since) continue;
        lines++;
        if (FORBIDDEN_FLAGS.some((f) => e.flags[f] === true)) flagged++;
      }
    } catch (err) {
      // a missing ledger is a fresh run; an unreadable one is a failure
      readable = err instanceof Error && "code" in err && err.code === "ENOENT";
    }
    check(readable, "evidence ledger readable");
    check(
      flagged === 0,
      `no demo override or operator mark-paid in the ledger (${String(lines)} entries checked)`,
    );
  }

  for (const r of results) out(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  const failed = results.filter((r) => !r.ok).length;
  out(failed === 0 ? "evidence preflight: PASS" : `evidence preflight: FAIL (${String(failed)})`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err: unknown) => {
  process.stderr.write(
    `evidence-preflight error: ${err instanceof Error ? err.name : "unknown"}\n`,
  );
  process.exit(1);
});
