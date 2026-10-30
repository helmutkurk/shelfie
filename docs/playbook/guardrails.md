# Guardrails

Layers: permissions (`.claude/settings.json`) decide allow/ask/deny; hooks (`.claude/hooks/`) are a second line because permission rules do not catch everything (for example `cat .env` through Bash). Neither is a sandbox. Codex has none of these: it relies on `AGENTS.md` and human review.

## Hooks
| Hook | Event | What it does | Why |
|---|---|---|---|
| `session-context.sh` | SessionStart | Prints branch, protected-branch warning (`main`), peer-review reminder, build-window time left, open TODO/Handoff lines | Agents start oriented; no code before the window, freeze at Sat 13:00 |
| `prompt-guard.sh` | UserPromptSubmit | Blocks private keys, Anthropic/Blockfrost/Cardano key patterns, `ADMIN_KEY=...` style literals; warns on a 24-word mnemonic shape | A pasted secret reaches a third party and chat history |
| `guard-bash.sh` | PreToolUse Bash | Blocks any `.env*` token (not `.env.example`) including globs; push to `main`, force push (also `--force-with-lease` to `dev`), delete/mirror, implicit push from `main` (push to `dev` is allowed); mainnet flags/URLs; `curl \| sh`; `--no-verify`; `gh repo` changes, secrets, admin merge from the agent; key files and `invoice/`. Asks on new npm dependencies and recursive greps | Secrets, protected branches, real money, supply chain |
| `protect-files.sh` | PreToolUse Read/Edit/Write/Grep/Glob | Blocks `.env*` (allows `.env.example`), `*.pem/*.key/*.skey`, `invoice/`, mnemonic files; blocks edits of lockfiles and `.git/` | Same, for the file tools |
| `format-file.sh` | PostToolUse Edit/Write | Prettier on the edited file; does nothing until `codigo/package.json` and Prettier exist | Consistent style without noise |
| `typecheck-on-stop.sh` | Stop | Typecheck if TS files changed; does nothing before `codigo/package.json` | Catch breakage before handoff |
| `context-gate.sh` | PreToolUse Edit/Write/MultiEdit/NotebookEdit/Bash | Blocks changes until the session ran `scripts/context-ack.sh` (see Context gate below) | Agents load purpose/design before changing it |
| `test-hooks.sh` | manual | stdin-JSON cases for the hooks | Prove the guards still work |

## Permissions (summary)
| Rule | Entries | Why |
|---|---|---|
| allow | `npm ci`, `npm run check/typecheck/lint/test/build`, read-only git and gh, a few doc domains | Daily loop without prompts |
| ask | `git push/commit/merge/rebase/pull/clean`, `gh pr create/merge/comment`, `npm install <pkg>`, `npx`, `curl`, `wget`, `rm -rf` | Human decides outward-facing or hard-to-undo steps |
| deny | read/edit `.env*` variants, key files, `invoice/`; `git push` to `main` or forced; `git reset --hard`; `git config`; `gh repo` edit/create/delete, `gh secret`; `npm publish`; `sudo`; `docker` | Secrets, protected branches, publishing, root-equivalent access |
| `disableBypassPermissionsMode` | disable | No agent mode that skips all checks |

## CI and GitHub
| Item | Why |
|---|---|
| `ci.yml` check job | `npm ci` + `npm run check` once `codigo/package.json` exists; skips before |
| CI and Security workflows | Checks, secret scans and dependency audit on every push to `dev`/`main` and on the release PR |
| Peer review (`scripts/peer-review.sh`, `.claude/agents/reviewer.md`) | Each person's agent reviews the commits the others pushed to `dev`; `status` gates the release PR. Convention, not enforced by GitHub |
| Branch protection (see `docs/github-setup.md`) | `dev`: no force push, no deletion. `main`: PR with 3 approvals + required checks, no force push, no deletion. CODEOWNERS is informational |
| `.gitignore` | `.env*` except example, `settings.local.json`, `invoice/`, large evidence images, LaTeX aux files |

## Context gate (4 layers, Helmut 2026-10-29)
Goal: no agent changes purpose, design, files or code before loading the project context. Ack = `scripts/context-ack.sh` writes `.claude/state/ack-<session>` (git-ignored) with a hash of `AGENTS.md` + `ideas/decision.md` + `diseno/decisions.md`; it expires when those change.
| Layer | What it does | Stops | Cannot stop |
|---|---|---|---|
| 1 Claude Code hook `context-gate.sh` | Blocks Edit/Write/MultiEdit/NotebookEdit and write-type Bash (redirects, `sed -i`, `mv`, `rm`, `git commit`, `npm install`...) until the session ran the ack script. Reads are never blocked | An unprimed Claude session changing anything through normal tools | Unusual shell writes (`python -c`, `node -e`), a person editing `settings.local.json`, running outside Claude, or an agent that runs the ack without reading. It cannot verify reading |
| 2 `AGENTS.md` "Context gate" | Procedure and first-reply rule (purpose, role, files read) for Codex and others. No `.codex/` config: project-level Codex hook support not verified | Nothing technically | Everything: it is an instruction only. Verify Codex hooks Friday |
| 3 `.githooks/` (`install-githooks.sh`) | `pre-commit`: needs a current ack. `commit-msg`: commits touching purpose files need `Purpose-impact: ADR-<id>` or `minor: <reason>` (`none` refused). Works for any tool | Commits by any agent in a configured clone | Not installed, `--no-verify` (blocked only for Claude), `git commit` from another clone |
| 4 GitHub: commit-msg trailer + CI secret scan on push + peer review on `dev`; release PR template + CI `context-gate` + 3 approvals | Every push is secret-scanned; other people's agents see every `dev` commit; the release PR must fill "Context and purpose", purpose files need ADR or declared minor, `context-gate` is required, three teammates approve | Merging to `main` without declared context/impact or without all four having checked | Wrong but well-formed answers (a lie in the PR); peer review is a convention; admin bypass (emergency only, ADR-0006) |
Chosen trailer rule: one trailer, only when purpose files are touched, so ordinary commits cost one ack per session and nothing else.
The local layers are bypassable by the person at the keyboard; only layer 4 is hard (release PR and CI), and peer review on `dev` is as strong as the agents' and humans' attention.

## Known limits
- A hook can be bypassed by a creative command; keep reviewing diffs.
- The `.env` token check also blocks harmless text such as `git commit -m "fix .env"`; rephrase.
- Hooks read `jq`; without it, they block with a message.
- Settings precedence: managed > CLI > local > project > user. A local override can weaken project rules; reviewers check `settings.local.json` is not committed.
