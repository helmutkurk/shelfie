## What and why
<!-- 2-3 lines. Link the issue or milestone. -->

## Context and purpose
<!-- Required, checked by CI (job `context-gate`). Fill every line; no placeholders. -->
- Files read: <list the files you and your agent actually read>
- Milestone / design section: M_ and diseno/<file> section ...
- Purpose impact: none | ADR-<id> | minor: <reason>  (AGENTS.md, CLAUDE.md, ideas/decision.md, diseno/, .claude/, .github/, .githooks/, scripts/team.conf need ADR-<id> or minor: <reason>)

## Tasks
<!-- Required, checked by CI (job `task-status`). Ids from equipo/tasks/ (`bash scripts/task.sh list <role> --open`). Update with scripts/task.sh in this PR. -->
- Tasks: <none | A-05 (doing), A-06 (done)>

## Milestone and role
- Milestone: M_ / none
- Role folder(s) touched: A / B / C / D (if not yours, say who agreed)

## Checklist
- [ ] `npm run check` passes in `codigo/` (or: no code in this PR)
- [ ] Design docs updated in this PR (`diseno/`, `.env.example`); contract change in `packages/core` mirrored in `diseno/contracts.md`
- [ ] New dependency? Pinned exact version + one-line reason: ...
- [ ] No secrets, no mainnet, no `invoice/`, no large images
- [ ] Payment paths: idempotency key, lovelace integers, preprod only
- [ ] Evidence: tx hashes added to `codigo/docs/evidence/tx-hashes.md` (or: none)
- [ ] New bot/script/tool/helper agent? Registered in `equipo/components.md`; my `equipo/<name>.md` refreshed (or: none)
- [ ] `docs/ai-log.md` entry added; decisions recorded as ADR if needed

## How tested
<!-- Commands and results. State what was not run. -->

## Risks and follow-ups
