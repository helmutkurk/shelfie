# Contributing

Four people, one weekend, many agents. These rules keep parallel work from colliding. Agent rules: [AGENTS.md](AGENTS.md). Step-by-step setup: [docs/playbook/agent-setup.md](docs/playbook/agent-setup.md).

## Branches
- `dev` is the integration branch: everyone pushes directly to it (ADR-0006). `main` is the final demo/submission state and changes only through the release PR. Never force-push or delete either branch.
- Before pushing to `dev`: `git pull --rebase origin dev`, then `npm run check` in `codigo/` (when `package.json` exists).
- Feature branches are optional (risky or long work): `feature/<role>-<short>` from `dev`, merge into `dev` locally and push; no PR.
- Hotfixes: fix on `dev`, then a release PR. No hotfix branches from `main`.
- Keep branches short (hours, not days). See [docs/github-setup.md](docs/github-setup.md) for branch settings.

## Commits
Conventional commits: `type(scope): summary`. Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`. Scopes: `shell`, `engine`, `verifier`, `payments`, `web`, `core`, `vision`, `evidence`, `eval`, `scripts`.
Commit small and often; reference the task, e.g. `feat(shell): wire the bridge (A-10)`. Never commit secrets: history is public later. Do not rewrite shared history.

## Peer review on dev
Each person's agent reviews the commits the OTHER people pushed, so the agents converge. No PR per change.
1. Start of every work block: `bash scripts/peer-review.sh pending`; for each commit `show <sha>`, check against `diseno/` and `ideas/decision.md` (run `npm run check` if code changed), then `ok <sha>` or `issue <sha> <note>`. Keep it quick. Procedure: `.claude/agents/reviewer.md`.
2. Small and obvious problem: the reviewer fixes it in a new commit on `dev` referencing the sha. Otherwise `issue`, and the author's agent fixes it in its next block.
3. Agents disagree: the humans decide in chat and write it down (ADR or `diseno/decisions.md`).
4. Folder ownership is "who knows this area"; you may edit another role's folder and the owner's agent sees it in peer review. Shared contract (`packages/core`, `diseno/contracts.md`): announce in chat and mirror in `diseno/contracts.md` in the same commit.

## Release PR (the only PR)
`dev` -> `main`, when all four have checked what is on `dev`:
1. `npm run check` and `npm run smoke` pass on `dev`; `bash scripts/peer-review.sh status` exits 0 (no open `issue` in the range).
2. Open the PR with the template (`/pr-description`). The three teammates who did not open it approve; GitHub enforces 3 approvals on `main`.
3. Merge commit, not squash; then fast-forward `dev` to `main` if needed.
4. Helmut (admin) may bypass only for an emergency fix in the last hour before the Sat 15:00 deadline, and says so in chat and in `docs/ai-log.md`.

## Tests
Per component: `diseno/repo-layout.md` section 4. Payout changes need a fault-injection test; each verifier reason code needs a fixture test.

## Working with agents
- Claude Code and Codex read the same rules (`AGENTS.md`). Open the repo root, not a subfolder.
- Trust the project hooks when asked on first start; they are the guardrails ([docs/playbook/guardrails.md](docs/playbook/guardrails.md)).
- Review agent output like a teammate's commit: run the checks yourself, read the diff.
- Never paste secrets into a prompt. Never ask an agent to read `.env`.
- Current state per person and registry of extra bots/scripts: `equipo/` (update your own file; register new components in the same commit).
- End each work block with `/sync-context` (Claude) or by appending to `docs/ai-log.md` (Codex).

## The repo is the source of truth
- Design lives in `diseno/`. Change code and design in the same commit.
- Decisions: ADR in `docs/adr/`. Facts learned: `codigo/docs/verified.md`. Proof: `codigo/docs/evidence/`. Log: `docs/ai-log.md`.
- Chat decisions that are not written down did not happen.

## Dependencies
Exact pinned versions; do not bump during the event; one-line reason per new dependency in the commit message.

## Local setup
Node 24, `jq` (hooks need it), `git`, `gh`. Copy `.env.example` to `.env` inside the app folders and fill values locally; never commit them.
