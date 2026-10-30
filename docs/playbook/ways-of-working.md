# Ways of working

## Roles
Roles A-D and their folders are in `diseno/repo-layout.md` section 2 (summary in `AGENTS.md`). One owner per folder; the owner merges. The mapping of names to letters is fixed Friday morning in `.github/CODEOWNERS` and the first `docs/ai-log.md` entry.

## Rhythm (Fri 30-10 and Sat 31-10)
| When | What |
|---|---|
| Fri 09:00 | Kick-off: roles, repo created, branch protection, everyone runs `agent-setup.md` |
| Every milestone | Owner posts the tx hash; evidence logged same hour (`/log-evidence`) |
| Every 3 hours | 5-minute sync: blockers, contract changes, who needs what; update `docs/ai-log.md` |
| Fri 22:00 | M4 go/no-go (`diseno/repo-layout.md`) |
| Sat 13:00 | Last paid cycle started; code freeze after final smoke run |
| Sat 14:30 | Video uploaded, public repo ready; submit before 15:00 |

Times follow `diseno/repo-layout.md` and `preparacion/`; if they differ, those files win.

## Working on a task
1. Take or create an issue (template `task`). Name the milestone.
2. Start from `dev`; create `feature/<role>-<short>`, `fix/...` or `docs/...` there. Agent plans, you approve.
3. Fakes first so you do not wait for neighbours; real components when they come online.
4. PR into `dev` with the template; reviewer agent first (`reviewer`), then one review from the pair or a code owner.
5. Squash merge feature/fix/docs PRs into `dev`; delete the branch. Never push directly to `dev` or `main`, and never force-push either.

## Release and hotfix
- Release with a `dev` -> `main` PR only after `npm run check` and `npm run smoke` pass on `dev` and Helmut (D) approves. Use a merge commit, then fast-forward `dev` to the same commit if needed.
- Start hotfixes from `main`, PR them into `main`, then open and merge a follow-up PR from `main` into `dev` within the same hour.

## Shared contracts
`packages/core` and `diseno/contracts.md` change together. Announce in chat before changing; the consuming owner reviews.

## Handoff
When you stop or switch with someone: write in `docs/ai-log.md` the branch, state, exact next command, open questions with owner, evidence still to capture. The next session reads the last two entries first. `/sync-context` does this.

## AI log
Append-only, one entry per work block: Done, Worked, Failed, TODO, Handoff. "Failed" entries that repeat become a rule change (AGENTS.md, a rule file, a hook) in a PR, and a line in `lessons-from-previous-projects.md`-style notes if lasting.

## Decisions
Technical decisions that affect more than one role: ADR in `docs/adr/` (`/adr`). Design changes: edit `diseno/` and `diseno/decisions.md`.

## Evidence
Every milestone ends with evidence in `codigo/docs/evidence/` (hash, link, screenshot, who). Check with `/milestone-check Mn`.
