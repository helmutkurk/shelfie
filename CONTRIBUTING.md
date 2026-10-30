# Contributing

Four people, one weekend, many agents. These rules keep parallel work from colliding. Agent rules: [AGENTS.md](AGENTS.md). Step-by-step setup: [docs/playbook/agent-setup.md](docs/playbook/agent-setup.md).

## Branches
- `main` is protected: no direct pushes, PR only. See [docs/github-setup.md](docs/github-setup.md) for the settings.
- Work on `feature/<role>-<short>` (example `feature/c-gate-g2`). Fixes: `fix/<role>-<short>`. Docs: `docs/<short>`.
- Keep branches short (hours, not days). Rebase or merge `main` often.

## Commits
Conventional commits: `type(scope): summary`. Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`. Scopes: `shell`, `engine`, `verifier`, `payments`, `web`, `core`, `vision`, `evidence`, `eval`, `scripts`.
Commit small and often. Never commit secrets: history is public later. Do not rewrite shared history.

## Pull requests
1. `npm run check` passes in `codigo/` (CI runs it too; it skips while no `package.json` exists).
2. Fill the PR template: what, milestone, role folder, docs updated, dependencies, evidence, risks.
3. One review from a code owner (`.github/CODEOWNERS`); your pair (A+B, C+D) reviews first. The author does not merge their own PR unless the team agrees in chat during crunch time; never skip CI.
4. Squash merge; the PR title becomes the commit message (conventional form).
5. Shared contract (`packages/core`): announce in chat, reviewed by the consumer owner, mirrored in `diseno/contracts.md` in the same PR.

## Tests
Per component: `diseno/repo-layout.md` section 4. Payout changes need a fault-injection test; each verifier reason code needs a fixture test.

## Working with agents
- Claude Code and Codex read the same rules (`AGENTS.md`). Open the repo root, not a subfolder.
- Trust the project hooks when asked on first start; they are the guardrails ([docs/playbook/guardrails.md](docs/playbook/guardrails.md)).
- Review agent output like a teammate's PR: run the checks yourself, read the diff.
- Never paste secrets into a prompt. Never ask an agent to read `.env`.
- Current state per person and registry of extra bots/scripts: `equipo/` (update your own file; register new components in the same PR).
- End each work block with `/sync-context` (Claude) or by appending to `docs/ai-log.md` (Codex).

## The repo is the source of truth
- Design lives in `diseno/`. Change code and design in the same PR.
- Decisions: ADR in `docs/adr/`. Facts learned: `codigo/docs/verified.md`. Proof: `codigo/docs/evidence/`. Log: `docs/ai-log.md`.
- Chat decisions that are not written down did not happen.

## Dependencies
Exact pinned versions; do not bump during the event; one-line reason per new dependency in the PR.

## Local setup
Node 24, `jq` (hooks need it), `git`, `gh`. Copy `.env.example` to `.env` inside the app folders and fill values locally; never commit them.
