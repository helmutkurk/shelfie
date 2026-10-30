# Helmut - role D

- Role and pair: D, pair with Lorenz (C)
- GitHub: helmutkurk
- Reviews: pair reviews each other's PRs first

## Current focus

Role and technology skills plus the role index, start pointers, and ADR-17 camera-rule alignment completed (Codex, 2026-10-30; D-29). Relative Markdown links and skill frontmatter/length checks passed. D-28 remains blocked on unrestricted runtime validation. See the [skills index](../docs/playbook/skills.md) and [team guide](../docs/START-HERE-TEAM.md).

## Active branch

feature/d-agent-skills (provided by Helmut; not inspected with Git, per instruction).

## Components I added or integrated

| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Role skills and index | `.claude/skills/*/SKILL.md`, `docs/playbook/skills.md` | Role and technology guidance plus session-start skill map | Read docs/playbook/skills.md | works | canonical design and runbooks |
| Worker/dashboard | `codigo/apps/web` | Camera/GPS worker flow and live job/ledger views; public package subpaths | `cd codigo && npm run dev -w @shelfie/web` | build and component tests pass; real-phone QA pending | engine, core/browser, evidence/explorer |
| Evidence ledger + CLI | `codigo/packages/evidence` | Append-only hash chain and explorer helpers; queue/verdict ledger integration | `npm run verify-ledger -w @shelfie/evidence -- <ledger-path>` from codigo | local tests pass; no real tx evidence | core |
| Team/run handoff | `docs/START-HERE-TEAM.md`, `codigo/README.md` | First 30 minutes, tasks/times, fake/real commands, verify-Friday register | read | complete | component READMEs and canonical design |

## What runs / next command

This block changed skills and docs only. Relative-link, frontmatter, and line-limit validation passed; no code tests, phone/tunnel checks, paid requests, or on-chain transactions were run.

Exact next root command: `bash scripts/task.sh next D`. The user-provided branch name is feature/d-agent-skills; it was not inspected. I issued no direct Git commands, but the initial task.sh add/start calls queried git config user.name internally before TASK_ACTOR=Codex was set.

## Open questions / evidence

- D-29 has no open items. Link validation passed; no code checks were requested or run for this docs-only block.
- Helmut: approve or reject pre-existing sharp 0.34.5 in verifier/eval. No external package was added by this pass.
- Lorenz: review ten REWE draft labels (blurry photos are intentional negatives; no challenge-code evidence), complete 20 price + 8 OOS eval, verify real models/options.
- Isabel + Fernando: starter bridge and escrow/refund semantics, paid x402 and plain preprod transfer, W-VBUY balance, ledger observer failure handling.
- Session cookie is explicitly deferred; workerId is still in the request body. Real phone camera/GPS/CIP-30, secure LAN, tunnel headers and screenshot/explorer evidence remain to capture.
- [Full open register and validation](../codigo/docs/integration-2026-10-30.md). Task statuses remain in `equipo/tasks/`; only D-28 was changed here.

## Laptop setup (done 2026-10-29)

Node 24.22.2 via mise (global stays 26.8.2), Sokosumi CLI 1.0.4, logged in to preprod.

## Last updated

2026-10-30 12:12 Europe/Berlin by Codex for Helmut (D).
