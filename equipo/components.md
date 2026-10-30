# Component registry

Everything contributed outside the planned design (bots, scripts, helper agents, prompts, tools). Rules: `equipo/README.md`. Add a row in the same commit as the code; anyone may edit, peer review checks it. Planned components live in `diseno/` and are not listed here.

| Name | Owner | Path | Purpose | Run command | Status | Design doc |
|---|---|---|---|---|---|---|
| task.sh | all (infra, Helmut) | `scripts/task.sh`, `equipo/tasks/` | Per-role task tracking: list, next, start, done, block, add; CI check `scripts/check-pr-tasks.sh`; Stop hook `.claude/hooks/tasks-on-stop.sh` | `bash scripts/task.sh next <A-D>` | works | `equipo/README.md` |

| Shell bridge | A, Isabel | `codigo/apps/shell/bridge/` | Ids-only job intake, decision polling, deliver/withhold and settlement events | `cd codigo && npm run test -w @shelfie/shell` | works: fake-engine tests, starter adapter (`starter-answer.js`) and one unpaid Sokosumi Task through the starter on fakes (2026-10-30) | `diseno/contracts.md` §1.6 |
| Starter Windows patch | A, Isabel | `codigo/apps/shell/starter.patch` | Makes the pinned Masumi starter's worker call the Sokosumi CLI on Windows (`sokosumi.cmd`) and switches its `answer` to the shell bridge when `SHELL_TOKEN` is set | `git -C codigo/apps/shell/starter apply ../starter.patch` (setup: `codigo/apps/shell/README.md`) | works (hub, 2026-10-30) | `codigo/docs/verified.md` |
| Web test helpers | D, Helmut | `codigo/apps/web/src/testing.ts` | Injectable fixtures, fetch mock and fake EventSource | `cd codigo && npm test -w @shelfie/web` | works in component tests | `diseno/webapps.md` |
| Smoke | B, Fernando | `codigo/scripts/smoke.ts` | Wrong-code, PASS, OOS, geofence, intake, idempotency and ledger checks against fake engine | `cd codigo && npm run smoke` | implemented; runtime blocked by Codex sandbox EPERM, rerun on hub | `diseno/repo-layout.md` §4 |
| Hub launcher | B + A, Fernando + Isabel | `codigo/scripts/hub-up.sh` | Engine/verifier/web lifecycle and optional engine-only tunnel; fake mode does not read env file | `cd codigo && npm run hub-up -- --fake` (stop: `npm run hub-up -- stop`) | implemented; venue lifecycle and tunnel pending | `preparacion/hub-laptop.md` |
| Funding check | B, Fernando | `codigo/scripts/fund-check.ts` | Validate public addresses and read preprod balances; no-key dry run | `cd codigo && node --import tsx scripts/fund-check.ts` | dry path available; Blockfrost run pending | `diseno/contracts.md` §5.6 |
| Payout once | B, Fernando | `codigo/scripts/payout-once.ts` | One real preprod transfer from W-PAY with the queue's adapter; settles ADR-04 (B-04) and checks find()/confirmations() | `cd codigo && node --env-file=<local env> --import tsx scripts/payout-once.ts --to addr_test1... [--send]` | wip; not run on preprod yet | `diseno/decisions.md` ADR-04 |
| Eval runner | C, Lorenz | `codigo/eval/src/cli.ts`, `execute.ts`, `run.ts` | In-process evaluate, stub/live/replay reports; REWE draft awaits review | `cd codigo && npm run eval -w @shelfie/eval -- --mode stub` | implemented; real photo/provider evaluation pending | `diseno/verifier-rules.md` §7 |
| Ledger verifier CLI | D, Helmut | `codigo/packages/evidence/src/cli.ts` | Verify append-only JSONL evidence chain; nonzero exit if broken | `cd codigo && npm run verify-ledger -w @shelfie/evidence -- apps/engine/data/evidence-ledger.jsonl` | works in ledger tests | `diseno/contracts.md` §1.4 |

Status: `idea`, `wip`, `works`, `broken`, `retired`.
