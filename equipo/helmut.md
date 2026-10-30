# Helmut - role D

- Role and pair: D, pair with Lorenz (C)
- GitHub: helmutkurk
- Reviews: pair reviews each other's PRs first

## Current focus

Dev integration / main release branch model implemented in docs, CI, protection script and guards (Codex, 2026-10-30; D-30 done). D-28 remains blocked solely on unrestricted runtime validation; do not mark it done from fake tests. Resume with the [team guide](../docs/START-HERE-TEAM.md).

## Active branch

`docs/d-dev-workflow`, based on `origin/dev`. Working tree has uncommitted edits; no git write, commit or push was run. The user asked to leave the branch checked out.

## Components I added or integrated

| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Worker/dashboard | `codigo/apps/web` | Camera/GPS worker flow and live job/ledger views; public package subpaths | `cd codigo && npm run dev -w @shelfie/web` | build and component tests pass; real-phone QA pending | engine, core/browser, evidence/explorer |
| Evidence ledger + CLI | `codigo/packages/evidence` | Append-only hash chain and explorer helpers; queue/verdict ledger integration | `npm run verify-ledger -w @shelfie/evidence -- <ledger-path>` from codigo | local tests pass; no real tx evidence | core |
| Team/run handoff | `docs/START-HERE-TEAM.md`, `codigo/README.md` | First 30 minutes, tasks/times, fake/real commands, verify-Friday register | read | complete | component READMEs and canonical design |
| Branch model | `docs/adr/0005-branch-model-dev-integration-main-final.md`, contributor docs, `.github/`, `.claude/`, `scripts/launch-github.sh` | `dev` integration and gated `dev` -> `main` releases | read | docs and guards updated; Fernando review and live GitHub protection remain | ADR-0005 |

## What runs / next command

`bash .claude/hooks/test-hooks.sh`: 108 passed, 0 failed. Ruby parsed all workflow YAML files; 66 relative links resolved in 20 changed Markdown files; `bash -n`, protection JSON, `jq empty .claude/settings.json` and `git diff --check` passed. `npm run check` was not run for this docs/config-only task. GitHub settings were not changed; run the protection script after both branches exist and the PR is merged.

Exact next task command: `bash scripts/task.sh next D`. For branch-model closeout, Fernando (B) reviews the change to `scripts/launch-github.sh`; after merge, Helmut runs `scripts/launch-github.sh --protect` once `dev` and `main` exist, then verifies both settings in GitHub. D-28 runtime validation remains separate and must run on the unrestricted hub before D-28 can be done.

## Open questions / evidence

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

2026-10-30 by Codex for Helmut (D).
