# Ways of working

## Roles
Roles A-D and their folders are in `diseno/repo-layout.md` section 2 (summary in `AGENTS.md`). One owner per folder = who knows that area; it blocks nothing (ADR-0006). The mapping of names to letters is in `scripts/team.conf` (`.github/CODEOWNERS` is informational) and the first `docs/ai-log.md` entry.

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
2. Start of the block: `bash scripts/peer-review.sh pending`, review what it lists (agent `reviewer`), then `bash scripts/task.sh next <role>`. Work on `dev`; a feature branch is optional for risky or long work. Agent plans, you approve.
3. Fakes first so you do not wait for neighbours; real components when they come online.
4. Before pushing: `git pull --rebase origin dev` and `npm run check` in `codigo/`. Push straight to `dev`; no PR, no required human review. Reference the task in the commit message, e.g. `(A-10)`.
5. Never force-push or delete `dev`/`main`; never rewrite shared history. Problems found by another agent: fixed by the reviewer if small and obvious (new commit referencing the sha), else marked `issue` and fixed by the author's agent in its next block. Agents disagree: humans decide in chat and write it down.

## Release and hotfix
- One release PR `dev` -> `main`, only after `npm run check` and `npm run smoke` pass on `dev`, `bash scripts/peer-review.sh status` is clean, and the three teammates who did not open it approve (GitHub enforces 3). Merge commit, then fast-forward `dev` to the same commit if needed.
- Helmut (admin) may bypass only for an emergency fix in the last hour before the Sat 15:00 deadline, and says so in chat and in `docs/ai-log.md`.
- Hotfixes: fix on `dev`, then a release PR. No hotfix branches from `main`.

## Shared contracts
`packages/core` and `diseno/contracts.md` change together. Announce in chat before changing; the consuming owner's agent checks it in peer review.

## Handoff
When you stop or switch with someone: write in `docs/ai-log.md` the branch, state, exact next command, open questions with owner, evidence still to capture. The next session reads the last two entries first. `/sync-context` does this.

## AI log
Append-only, one entry per work block: Done, Worked, Failed, TODO, Handoff. "Failed" entries that repeat become a rule change (AGENTS.md, a rule file, a hook) in a commit, and a line in `lessons-from-previous-projects.md`-style notes if lasting.

## Decisions
Technical decisions that affect more than one role: ADR in `docs/adr/` (`/adr`). Design changes: edit `diseno/` and `diseno/decisions.md`.

## Evidence
Every milestone ends with evidence in `codigo/docs/evidence/` (hash, link, screenshot, who). Check with `/milestone-check Mn`.
