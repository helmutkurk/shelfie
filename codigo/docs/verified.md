# Verified

Answers to every "verify Friday" item from the design. Add a row as soon as an item is confirmed. Do not delete rows; mark superseded answers.

| Item | Answer | Who | Evidence |
|---|---|---|---|
| | | | |

## Local integration facts (Codex, 2026-10-30)

These confirm code behaviour only; no paid request, real model call or preprod transaction was made.

| Item | Answer | Who | Evidence |
|---|---|---|---|
| Env integration | Engine switches, seller pin/daily cap, verifier payment/call cap, web proxy and funding-address names are in core schemas and contracts §5; malformed settings fail early | Codex for Helmut D | `packages/core/src/integration.sec.test.ts`; payment-off boot tests |
| Public package imports | Core browser slice and evidence explorer subpath build without aliases/shims; browser graph and production bundle exclude server secret names and Node imports | Codex for Helmut D | `npm run build -w @shelfie/web`; core graph test; built JS scan |
| Fake evidence integration | Queue file defaults beside engine journal; runtime-wired Engine puts verify and payout hashes once in the job ledger and reaches PAID | Codex for Helmut D | `apps/engine/src/wiring.test.ts` (no sockets, visibly fake hashes) |
| Tooling | Node 24.22.2; scripts typechecked by root check; shell bridge runner included in root test; fake hub does not read env files | Codex for Helmut D | package scripts and local typecheck/lint; [integration report](integration-2026-10-30.md) |
| Runtime validation | Not confirmed: this sandbox refuses TCP/Unix sockets. Hub/smoke attempted and processes stopped; full HTTP suite fails EPERM | Codex for Helmut D | [integration report](integration-2026-10-30.md); rerun on hub laptop |
