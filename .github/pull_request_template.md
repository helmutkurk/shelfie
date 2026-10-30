<!-- This template is for the ONE release PR: dev -> main (ADR-0006). Changes to dev are pushed directly and peer-reviewed (scripts/peer-review.sh); do not open other PRs. -->
## What is released
<!-- 2-5 lines: milestones reached, user-visible changes. -->

## Release checklist
- [ ] Base `main`, head `dev`; merge with a merge commit (not squash), then fast-forward `dev` if needed
- [ ] `npm run check` on `dev`: ____
- [ ] `npm run smoke` on `dev`: ____
- [ ] `bash scripts/peer-review.sh status` is clean (exit 0, no open `issue`): ____
- [ ] Three approvals from the teammates who did not open this PR (GitHub enforces 3; the opener is the 4th)
- [ ] Emergency admin bypass used? No / Yes (only in the last hour before Sat 15:00; said in chat and in `docs/ai-log.md`)

## Context and purpose
<!-- Required, checked by CI (job `context-gate`). Fill every line; no placeholders. -->
- Files read: <list the files you and your agent actually read>
- Milestone / design section: M_ and diseno/<file> section ...
- Purpose impact: none | ADR-<id> | minor: <reason>  (AGENTS.md, CLAUDE.md, ideas/decision.md, diseno/, .claude/, .github/, .githooks/, scripts/team.conf need ADR-<id> or minor: <reason>)

## Tasks
<!-- Required, checked by CI (job `task-status`). Ids from equipo/tasks/ (`bash scripts/task.sh list <role> --open`). -->
- Tasks: <none | A-05 (doing), A-06 (done)>

## Release content
- Milestones: M_ / none
- Contracts (`packages/core`, `diseno/contracts.md`) changed? announced in chat: yes / no / n.a.
- New dependencies (pinned, reason in the commit message): none / ...
- Evidence: tx hashes in `codigo/docs/evidence/tx-hashes.md` (or: none)
- No secrets, no mainnet, no `invoice/`, no large images; payment paths: idempotency key, lovelace integers, preprod only
- New bot/script/tool/helper agent registered in `equipo/components.md` (or: none); `docs/ai-log.md` and ADRs up to date

## Risks and follow-ups
