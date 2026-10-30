# Helmut - role D

- Role and pair: D, pair with Lorenz (C)
- GitHub: helmutkurk
- Reviews: pair reviews each other's PRs first

## Current focus

Boilerplate integration and run/team docs implemented (Codex, 2026-10-30). Helmut authorised this pass across all codigo folders and the named docs. D-28 is blocked solely on unrestricted runtime validation; do not mark it done from the fake tests. Resume with the [team guide](../docs/START-HERE-TEAM.md).

## Active branch

Not inspected or changed: Helmut explicitly prohibited git commands for this pass. Initial task.sh updates read Git identity; subsequent ones set TASK_ACTOR=Codex. No git mutation, commit or push. Use the repository's feature-branch workflow before committing.

## Components I added or integrated

| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Worker/dashboard | `codigo/apps/web` | Camera/GPS worker flow and live job/ledger views; public package subpaths | `cd codigo && npm run dev -w @shelfie/web` | build and component tests pass; real-phone QA pending | engine, core/browser, evidence/explorer |
| Evidence ledger + CLI | `codigo/packages/evidence` | Append-only hash chain and explorer helpers; queue/verdict ledger integration | `npm run verify-ledger -w @shelfie/evidence -- <ledger-path>` from codigo | local tests pass; no real tx evidence | core |
| Team/run handoff | `docs/START-HERE-TEAM.md`, `codigo/README.md` | First 30 minutes, tasks/times, fake/real commands, verify-Friday register | read | complete | component READMEs and canonical design |

## What runs / next command

Node 24.22.2 production web build, 244 socket-free tests and stub eval run locally. Final npm run check: typecheck/lint pass, 277 tests pass and 79 fail with socket errors. The sandbox refuses TCP and Unix sockets (EPERM), blocking full HTTP check, hub and smoke. No paid or real-provider path was run. All stack processes started by this pass were terminated; no listeners were visible on 4000-4021/5173 afterward.

Exact next validation on the unrestricted hub: `cd codigo && npm run check`; then `npm run build -w @shelfie/web`, `npm run hub-up -- --fake`, `npm run smoke`, `npm run hub-up -- stop`. Inspect service descendants/listeners after stop; existing hub stop only targets immediate children. D-28 may be done only after these checks pass.

## Open questions / evidence

- Helmut: approve or reject pre-existing sharp 0.34.5 in verifier/eval. No external package was added by this pass.
- Lorenz: review ten REWE draft labels (blurry photos are intentional negatives; no challenge-code evidence), complete 20 price + 8 OOS eval, verify real models/options.
- Isabel + Fernando: starter bridge and escrow/refund semantics, paid x402 and plain preprod transfer, W-VBUY balance, ledger observer failure handling.
- Session cookie is explicitly deferred; workerId is still in the request body. Real phone camera/GPS/CIP-30, secure LAN, tunnel headers and screenshot/explorer evidence remain to capture.
- [Full open register and validation](../codigo/docs/integration-2026-10-30.md). Task statuses remain in `equipo/tasks/`; only D-28 was changed here.

## Laptop setup (done 2026-10-29)

Node 24.22.2 via mise (global stays 26.8.2), Sokosumi CLI 1.0.4, logged in to preprod.

## Last updated

2026-10-30 by Codex for Helmut (D).
