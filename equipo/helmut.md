# Helmut - role D

- Role and pair: D, pair with Lorenz (C)
- GitHub: helmutkurk
- Reviews: pair reviews each other's commits first (peer review, `scripts/peer-review.sh`)

## Current focus

Photo-free real-engine M6 checks implemented in `codigo/scripts/live-check.ts` (Codex, 2026-10-31, D-17). Seven local tests, typecheck and lint pass. Live run and two-phone evidence are pending; D-17 is blocked rather than marked complete. No engine/web/payment behavior changed; no dependencies added.

## Previous focus (2026-10-30)

ADR-20 customer orders implemented on fakes in `/dashboard` per Helmut's amendment (Codex, 2026-10-30 evening). D-36 done; B-16 blocked on B-15's real capped REST Task/authority/identity proof. Real adapter probes the schema and refuses purchases; shared deployments remain on their existing real-payment configuration. [Validation and handoff](../codigo/docs/adr20-validation.md).

## Update 2026-10-30 evening (Claude for Helmut)
Public deployment is live (dev.shelfieapp.fyi, app.shelfieapp.fyi, api and api-dev through the Cloudflare tunnel; engine and verifier on this laptop, systemd --user, auto-update every 60 s; details in `docs/deploy.md` and `equipo/components.md`). Field test on phones passed claim/release; two 422 submissions unexplained until the access log carries `errorCode`. Keep the laptop on. Next: first release PR dev -> main, real-payment env switch with Fernando, tx hashes into `codigo/docs/evidence/tx-hashes.md`.

## Active branch

`dev`, with this session's uncommitted changes. `git switch -c feature/live-checks` failed because `.git` is mounted read-only in this sandbox; branch creation and the requested commit are pending. Nothing pushed. On the unrestricted hub, create the branch from this `dev` worktree and commit with `feat(scripts): add photo-free live engine checks (D-17)`; note that D edited B-owned scripts in the commit body.

## Components I added or integrated

| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Live checks | `codigo/scripts/live-check.ts`, `live-check.sec.test.ts` | Real API health/feed/claims/location/no-payment checks; release/reclaim and cleanup | From `codigo/`: export `ADMIN_TOKEN`, `WORKER_ADDRS`; `ENGINE_URL=https://api-dev.shelfieapp.fyi npx tsx scripts/live-check.ts` | local validation passes; live run pending | production engine; 2-3 distinct teammate preprod addresses |
| Worker/dashboard | `codigo/apps/web` | Camera/GPS worker flow and live job/ledger views; public package subpaths | `cd codigo && npm run dev -w @shelfie/web` | build and component tests pass; real-phone QA pending | engine, core/browser, evidence/explorer |
| Evidence ledger + CLI | `codigo/packages/evidence` | Append-only hash chain and explorer helpers; queue/verdict ledger integration | `npm run verify-ledger -w @shelfie/evidence -- <ledger-path>` from codigo | local tests pass; no real tx evidence | core |
| Team/run handoff | `docs/START-HERE-TEAM.md`, `codigo/README.md` | First 30 minutes, tasks/times, fake/real commands, verify-Friday register | read | complete | component READMEs and canonical design |
| Branch model | `docs/adr/0005-branch-model-dev-integration-main-final.md`, contributor docs, `.github/`, `.claude/`, `scripts/launch-github.sh` | `dev` integration and gated `dev` -> `main` releases | read | docs and guards updated; Fernando review and live GitHub protection remain | ADR-0005 |

## What runs / next command

Current block: Node 24 workspace/scripts typecheck, root lint, seven new script tests, redacted gitleaks scans and diff whitespace check pass. Full `npm run check` reached existing engine/payment/vision/verifier tests, repeatedly timed out on HTTP-based tests and was interrupted (exit 130); it is not a passing full check. No deployed run was attempted (sandbox cannot open sockets). Usage and manual M6 gaps: `codigo/scripts/README.md`.

Exact next command at repo root on the unrestricted hub: `git switch -c feature/live-checks`. Then `cd codigo && npm run check`; with operator token and `WORKER_ADDRS` exported, run `ENGINE_URL=https://api-dev.shelfieapp.fyi npx tsx scripts/live-check.ts`. Authenticate `gh` before peer review (`pending` currently fails authentication). Capture real phone/browser evidence separately before closing D-17.

Previous-block validation and handoff (2026-10-30):

Node 24 typecheck, ESLint, web production build, 113 targeted tests, three shell test files, 113 hook tests, redacted source scans and diff whitespace check pass. Full-suite socket listeners hit sandbox EPERM; details in [ADR-20 validation](../codigo/docs/adr20-validation.md). Fake order lifecycle includes delivery, withholding and observed refund; no real order was placed. Peer-review lookup requires authenticated gh on hub.

Exact next command on the unrestricted hub: `cd codigo && npm run check`. Fernando: follow `codigo/docs/verified.md` TODO B-15 to establish one capped Task purchase mechanism and the Task/agent Job/starter id mapping; then replace the fail-closed real probe, test one real 1-2-store order and close B-16. Keep A-24/D-37 separate. For unrelated D tasks: `bash scripts/task.sh next D`.

## Open questions / evidence

- Fernando (B-15/B-16): real Task cap enforcement, workspace/coworker authority, actual schema/quote and Task id -> starter journal -> engine externalRef. Real buying remains disabled; env names and exact spike are in verified.md. No prices/txs invented.
- Helmut/orchestrator: integrate the uncommitted feature after hub checks and authenticated peer review. No push was performed here.

- Helmut: approve or reject pre-existing sharp 0.34.5 in verifier/eval. No external package was added by this pass.
- Lorenz: review ten REWE draft labels (blurry photos are intentional negatives; no challenge-code evidence), complete 20 price + 8 OOS eval, verify real models/options.
- Isabel + Fernando: starter bridge and escrow/refund semantics, paid x402 and plain preprod transfer, W-VBUY balance, ledger observer failure handling.
- Session cookie is explicitly deferred; workerId is still in the request body. Real phone camera/GPS/CIP-30, secure LAN, tunnel headers and screenshot/explorer evidence remain to capture.
- [Full open register and validation](../codigo/docs/integration-2026-10-30.md). Task statuses remain in `equipo/tasks/`; D-28 remains blocked; D-29 (skills) and D-30 (branch model) are done.
- Fernando (B): review the `scripts/launch-github.sh` protection loop because `scripts/` is B-owned.
- Helmut: apply and verify the live `dev`/`main` protection settings after the PR is merged; this work only changed the script and guidance.
- Seed task D-05 still says the repo skeleton is merged to `main`; `scripts/task.sh` has no task-edit command. Update its acceptance before starting D-05 through an approved task-tracker change.

## Laptop setup (done 2026-10-29)

Node 24.22.2 via mise (global stays 26.8.2), Sokosumi CLI 1.0.4, logged in to preprod.

## Last updated

2026-10-31 by Codex for Helmut (D).
