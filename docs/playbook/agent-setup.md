# Agent setup (per teammate)

Goal: every agent on every laptop loads the same rules and the same guardrails.

See the [role skills index](skills.md): Claude Code discovers skills under .claude/skills; Codex reads the role's SKILL.md by hand.

## 1. Prerequisites
- Node 24, `git`, `gh` (logged in), `jq` (required by the hooks).
- One agent: **Claude Code** (`claude`) or **Codex** (`codex`). Install per vendor docs; do not install extra plugins or MCP servers for this project.
- Never use a mode that disables approvals or sandboxing (bypass, "yolo", `--dangerously-*`).

## 2. Clone and open
1. `git clone` the repo; before your first push run `bash scripts/install-githooks.sh` and install gitleaks (the repo is public); `cd` into the **repo root** (not `codigo/`), then `git switch dev`.
2. Create your local env files from `.env.example` when you start your component. They stay local and git-ignored.
3. Branch before you edit: from `dev`, run `git switch -c feature/<role>-<short>` (or `fix/...` / `docs/...`).

3. Install the git hooks once per clone: `bash scripts/install-githooks.sh` (sets `core.hooksPath=.githooks`). Then, each session, run `bash scripts/context-ack.sh --session <label> --who <name>` before committing (Claude Code is prompted to by the context gate).

## 3. Claude Code
1. Run `claude` in the repo root.
2. On first start it asks to trust the project settings and hooks. Read `.claude/settings.json` and `.claude/hooks/` once, then accept. If you decline, the guardrails do not run: do not work without them.
3. What loads automatically: `CLAUDE.md` (which imports `AGENTS.md`), path-scoped rules in `.claude/rules/` when you touch matching files, hooks, subagents, skills. `codigo/CLAUDE.md` loads when you work in `codigo/`.
4. SessionStart prints your branch, time left, and open TODO/Handoff lines. Check it.
5. The context gate blocks edits until you (the agent) run `scripts/context-ack.sh` and read the files it lists. Verify the hooks on your machine: `.claude/hooks/test-hooks.sh` (all lines PASS).
6. Personal tweaks go in `.claude/settings.local.json` (git-ignored); do not weaken the deny list.
7. Start your first prompt with: "Read AGENTS.md and the last two entries of docs/ai-log.md, then ..."; the base context is `investigacion/cardano/official-agent-prompt.md`.

## 4. Codex
1. Run `codex` in the repo root. Codex reads `AGENTS.md` natively; it does not run the Claude hooks.
2. Keep Codex on approvals for shell commands and network. Do not allow it to read `.env*`, push, or merge.
3. Tell it once per session: "Follow AGENTS.md, section Context gate: run `bash scripts/context-ack.sh --session codex --who <name>`, read the listed files, and state purpose, role and files read in your first reply. Follow AGENTS.md; rules per area are in .claude/rules/*.md; the base context is investigacion/cardano/official-agent-prompt.md."
4. You are the guardrail: review its diff, run `npm run check` yourself, run a `git diff --stat` before commit.

## 5. Task tracking
Per-role task lists live in `equipo/tasks/` and are edited only through `bash scripts/task.sh` (the agent does it; you do not hand-edit). Your agent starts a block with `bash scripts/task.sh next <role>` and ends it with `start`/`done`/`block`/`add`. SessionStart and `scripts/context-ack.sh --who <name>` print your open tasks; set `SHELFIE_WHO=<name>` (optional) to pin your role. Claude Code is reminded by the Stop hook; Codex has no hook, so tell it once per session: "Run `bash scripts/task.sh next <role>` before work and update task statuses at the end". Statuses travel with your branch: put the task files in the same PR. Allow prompt: add `Bash(bash scripts/task.sh *)` to your `.claude/settings.local.json` if you do not want a prompt per call.

## 6. Never do
- Paste a mnemonic, key or token into a prompt, issue, PR or screenshot.
- Let an agent open `.env*` or push directly to `dev` or `main`. Do not bypass a blocking hook; read its message and use the replacement.
- Commit `invoice/`, large images, or `.claude/settings.local.json`.
- Bump pinned dependencies.

## 7. Daily loop
Pull `dev` -> create a short branch -> work with the agent in small steps -> `npm run check` -> review the diff -> PR into `dev` -> `/sync-context` (Claude) or append to `docs/ai-log.md` (Codex). Releases and hotfixes follow [CONTRIBUTING.md](../../CONTRIBUTING.md).

## 8. When something fails
- Hook blocks a legitimate action: ask in chat; a fix to the hook goes in a PR (owners: root config owners). Do not edit your local copy and continue.
- `jq: command not found`: install `jq`.
- Agent invents a fact: tell it "verify Friday", point it to `investigacion/cardano/`, and record the real answer in `codigo/docs/verified.md`.
