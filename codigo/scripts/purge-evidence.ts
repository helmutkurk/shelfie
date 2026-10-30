// GDPR purge after the event (task B-12, security.md 4.9): deletes the worker photos and the
// engine records that hold worker data (claims: payout address and display name; submissions:
// capture location and image reference; payouts: worker address), plus the payout queue entries.
// Keeps jobs, tasks, verdicts and settlements, and never touches the evidence ledger (checked by
// hash) or docs/evidence/ (outside the data dir).
//   node --env-file=.env --import tsx scripts/purge-evidence.ts            (dry run: counts only)
//   node --env-file=.env --import tsx scripts/purge-evidence.ts --confirm  (delete)
// Refuses while the engine answers on ENGINE_PORT (it would rewrite the journal) and while a
// payout is not final (money in flight). Run after the event only: the engine cannot replay
// claims and submissions afterwards. Exit 0 ok, 1 refused, 2 error.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { AppError, EngineEnvSchema, PayoutSchema, loadEnv } from "@shelfie/core";
import type { EngineEnv } from "@shelfie/core";
import { z } from "zod";

/** A payout's address may only be deleted once nothing can move anymore. */
const FINAL_PAYOUT_STATES = new Set(["CONFIRMED", "FAILED_FINAL"]);

function refuse(msg: string): never {
  process.stderr.write(`refused: ${msg}\n`);
  process.exit(1);
}
const out = (line: string): void => {
  process.stdout.write(`${line}\n`);
};
const sha = (path: string): string | null =>
  existsSync(path) ? createHash("sha256").update(readFileSync(path)).digest("hex") : null;

/** Atomic rewrite (tmp + rename), owner-only. */
function rewrite(path: string, body: string): void {
  const tmp = `${path}.purge.tmp`;
  writeFileSync(tmp, body, { mode: 0o600 });
  renameSync(tmp, path);
}

async function engineRunning(port: number): Promise<boolean> {
  try {
    await fetch(`http://127.0.0.1:${String(port)}/api/health`, {
      signal: AbortSignal.timeout(2_000),
    });
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const { values: args } = parseArgs({
    options: { confirm: { type: "boolean", default: false } },
    strict: true,
  });
  let env: EngineEnv;
  try {
    env = loadEnv(EngineEnvSchema, process.env);
  } catch (err) {
    if (err instanceof AppError) refuse(err.message);
    throw err;
  }

  const dataDir = resolve(dirname(env.STORE_PATH));
  const imageDir = join(dataDir, "images");
  const journal = resolve(env.STORE_PATH);
  const queueFile = resolve(env.PAYOUT_STORE_PATH ?? join(dataDir, "payout-queue.json"));
  const ledger = resolve(env.LEDGER_PATH);
  if (imageDir.includes(`${sep}docs${sep}evidence`))
    refuse("the data dir is inside docs/evidence; refusing.");
  if (await engineRunning(env.ENGINE_PORT))
    refuse("the engine is running; stop it first (hub-up.sh stop).");

  // payout queue: every payout must be final before its address is deleted
  const queue = existsSync(queueFile)
    ? z.array(PayoutSchema).parse(JSON.parse(readFileSync(queueFile, "utf8")))
    : [];
  const open = queue.filter((p) => !FINAL_PAYOUT_STATES.has(p.state));
  if (open.length > 0)
    refuse(
      `${String(open.length)} payout(s) not final (QUEUED/SENDING/SUBMITTED/UNKNOWN); finish them first.`,
    );

  const photos = existsSync(imageDir) ? readdirSync(imageDir) : [];
  const lines = existsSync(journal)
    ? readFileSync(journal, "utf8")
        .split("\n")
        .filter((l) => l.trim() !== "")
    : [];
  const keep: string[] = [];
  const dropped = { claims: 0, submissions: 0, payouts: 0 };
  for (const line of lines) {
    const c = (JSON.parse(line) as { c?: unknown }).c;
    if (c === "claims" || c === "submissions" || c === "payouts") dropped[c]++;
    else keep.push(line);
  }

  out(`data dir      ${dataDir}`);
  out(`photos        ${String(photos.length)} file(s) in images/`);
  out(
    `journal       drop claims ${String(dropped.claims)}, submissions ${String(dropped.submissions)}, payouts ${String(dropped.payouts)}; keep ${String(keep.length)} line(s)`,
  );
  out(`payout queue  ${String(queue.length)} final payout(s) with worker addresses`);
  out(`ledger        untouched (${existsSync(ledger) ? "present" : "absent"})`);
  if (!args.confirm) {
    out("DRY RUN: nothing deleted. Add --confirm after the event.");
    return;
  }

  const ledgerBefore = sha(ledger);
  for (const f of photos) rmSync(join(imageDir, f), { force: true, recursive: true });
  if (lines.length > 0) rewrite(journal, keep.length > 0 ? `${keep.join("\n")}\n` : "");
  if (queue.length > 0) rewrite(queueFile, "[]");
  const ledgerAfter = sha(ledger);
  if (ledgerBefore !== ledgerAfter) {
    process.stderr.write("ERROR: the evidence ledger changed during the purge; check it now.\n");
    process.exit(2);
  }
  out(
    `purged: ${String(photos.length)} photo(s), ${String(dropped.claims + dropped.submissions + dropped.payouts)} journal record(s), ${String(queue.length)} queue entr(ies); ledger hash unchanged`,
  );
}

main().catch((err: unknown) => {
  process.stderr.write(`purge-evidence error: ${err instanceof Error ? err.name : "unknown"}\n`);
  process.exit(2);
});
