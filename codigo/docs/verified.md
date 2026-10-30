# Verified

Answers to every "verify Friday" item from the design. Add a row as soon as an item is confirmed. Do not delete rows; mark superseded answers.

| Item | Answer | Who | Evidence |
|---|---|---|---|
| | | | |

## Masumi / Sokosumi starter on the hub (Isabel A, 2026-10-30)

Hub = Isabel's laptop, Windows 11 Home x64, 31.5 GB RAM, Node 24.22.1, Postgres 16 as a Windows service (no Docker). Times UTC. Tx hashes: `evidence/tx-hashes.md`.

| Item | Answer | Who | Evidence |
|---|---|---|---|
| Starter pin | `tum-hackathon-quickstart` at `d93783b907a5b0b7008c67496c6e093faa70553f` (committed 2026-10-26); organisers' starter, our diff is `apps/shell/starter.patch` | Isabel A + Claude | `git -C apps/shell/starter log -1` |
| Starter on Windows | Worker crashed at boot with `spawnSync sokosumi ENOENT` (npm shim is `sokosumi.cmd`); fixed by `apps/shell/starter.patch`. Starter `npm test`: 3 failures before and after the patch, all POSIX path or file-mode expectations | Isabel A + Claude | worker log; `npm test` in the starter |
| Sokosumi CLI 1.0.4 Personal Workspace | `coworkers register --personal` and `coworkers connect --personal` return 404 `route_not_found` on `GET /v1/users/me/workspace-access` (preprod). Used instead: `coworkers provision`, then `coworkers connect --workspace-id <TUM org>`; access was PENDING until a TUM admin approved it, then GRANTED. So M3/M4 ran in the TUM Workspace, not the Personal one | Isabel A + Claude | CLI JSON output |
| Sokosumi login on Windows | `sokosumi auth login` opens the OAuth URL with `cmd /c start`, which cuts it at the first `&`, so the callback never arrives. Workaround: call the CLI's own `runAuthLogin` with an `openUrl` that prints the full URL (local helper, not committed) | Isabel A + Claude | login completed after the workaround |
| Model provider | Vercel AI Gateway (`https://ai-gateway.vercel.sh/v1`, `openai/gpt-4o-mini`) returns 403 `customer_verification_required` until a card is on file, even for the free monthly credit. Eve needs `ZAI_CONTEXT_WINDOW_TOKENS=128000` for this model (not in its catalog) | Isabel A + Claude | HTTP 403, then 200 |
| M3 unpaid Task | Task `01a18c00-6853-722c-a809-4e36d00155fc` COMPLETED in ~11 s, 0 credits, starter prompt (team names), not yet our bridge | Isabel A + Claude | `sokosumi --preprod tasks get <id> --organization-slug <slug> --json` |
| MPS version and seed | masumi-payment-service `a846392` (v0.30.0) run with `pnpm run dev` on Node 24.22.1. Seeded hot wallets have `collectionAddress` `""`, so `POST /api/v1/payment` fails 400 "sellerReturnAddress must be a Cardano base or enterprise address with a payment key credential". Fix: `PATCH /api/v1/wallet` with `newCollectionAddress: null` (funds stay in the selling wallet) | Isabel A + Claude | MPS log and replay of the request |
| Faucet limit | Cardano faucet answered "Rate limit exceeded" on the second request in about a day; W-MPS was funded with 200 tADA from W-VBUY instead | Isabel A + Claude | evidence row |
| Registration | `payment-registration.mjs register` went RegistrationRequested to RegistrationConfirmed in about 6 min; fee 0.268422 tADA. Registered with the starter's name "Hackathon Team Name Finder"; Shelfie needs its own registration for the demo | Isabel A + Claude | MPS registry; evidence row |
| M4 paid Task timing | Task `01a18c5e-3a58-766b-9346-128e951370b1`: payment requested 10:35:02 (1 test USDM, shown as 100 Sokosumi credits), FundsLocked tx 10:37:09, ResultSubmitted tx 10:37:58, Task COMPLETED. Starter escrow times: payBy 5 min, submitResult 20, unlock 36, externalDispute 52. Settlement to W-MPS not yet observed at time of writing | Isabel A + Claude | worker journal, evidence rows |
| Repo tooling on Windows | `scripts/task.sh` exits with `ModuleNotFoundError: No module named 'fcntl'` (Windows Python). `npm run check`: 355/356, the failure is `eval/src/eval.test.ts` building a path from `URL.pathname` (`C:\C:\...`) | Isabel A + Claude | command output |

## Local integration facts (Codex, 2026-10-30)

These confirm code behaviour only; no paid request, real model call or preprod transaction was made.

| Item | Answer | Who | Evidence |
|---|---|---|---|
| Env integration | Engine switches, seller pin/daily cap, verifier payment/call cap, web proxy and funding-address names are in core schemas and contracts §5; malformed settings fail early | Codex for Helmut D | `packages/core/src/integration.sec.test.ts`; payment-off boot tests |
| Public package imports | Core browser slice and evidence explorer subpath build without aliases/shims; browser graph and production bundle exclude server secret names and Node imports | Codex for Helmut D | `npm run build -w @shelfie/web`; core graph test; built JS scan |
| Fake evidence integration | Queue file defaults beside engine journal; runtime-wired Engine puts verify and payout hashes once in the job ledger and reaches PAID | Codex for Helmut D | `apps/engine/src/wiring.test.ts` (no sockets, visibly fake hashes) |
| Tooling | Node 24.22.2; scripts typechecked by root check; shell bridge runner included in root test; fake hub does not read env files | Codex for Helmut D | package scripts and local typecheck/lint; [integration report](integration-2026-10-30.md) |
| Runtime validation | Not confirmed: this sandbox refuses TCP/Unix sockets. Hub/smoke attempted and processes stopped; full HTTP suite fails EPERM | Codex for Helmut D | [integration report](integration-2026-10-30.md); rerun on hub laptop |
