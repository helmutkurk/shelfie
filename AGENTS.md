# AGENTS.md - shared rules for every coding agent (Claude Code, Codex, others)

Read this first. Claude Code gets it via `CLAUDE.md` (`@AGENTS.md`); Codex reads it natively. One rule file, no copies.

## The project in 5 lines
- **Shelfie**: verified shelf checks, paid only when the photo is true. Built for the TUM Blockchain & AI Hackathon 2026, Cardano track (Agentic Commerce on Cardano).
- A brand hires the Shelfie agent on Sokosumi (fee in Masumi escrow). The agent offers the task to all workers in Munich; the first to claim it photographs one shelf price tag with the live in-app camera (or the empty shelf spot if the product is not there). MVP: one job = one store, one product, one photo; brands pick them from catalog dropdowns and an intake filter backs this up (ADR-16, ADR-17).
- A verifier service (sold per check via x402) runs deterministic gates G1-G7 on every price photo (a separate gate set for out-of-stock photos), after the engine has checked the photo location against the store; passing photos trigger an on-chain payout to the worker.
- The job result is delivered (escrow settles) only if the photo passes (N=1, K=1; K-of-N is roadmap, ADR-16); if no photo passes by the window end it is withheld and the buyer is refunded.
- Cardano **preprod** only. Test ADA only. Team: Helmut, Isabel, Fernando, Lorenz (roles A-D).

## Build window
The core build happens during the hackathon: Fri 2026-10-30 09:00 to Sat 2026-10-31 15:00 (Devfolio deadline), feature freeze Sat 11:00, last paid escrow cycle started by Sat 13:00, code freeze after the final smoke run. Everything before that is docs and config only. Organisers' starter templates are allowed; note each one used in `codigo/docs/verified.md` with its pinned commit.

## Context gate (mandatory, before any change)
Applies to every agent (Claude Code, Codex, others) and to humans using one. Before you create, edit, move or delete any file, run a command that writes, or commit:
1. Run `bash scripts/context-ack.sh --session <id-or-label> --who <isabel|fernando|lorenz|helmut>` (Claude Code: the id is in the SessionStart text and in the hook's block message; other agents: use a label such as `codex`). It prints the context card and records an ack that expires when `AGENTS.md`, `ideas/decision.md` or `diseno/decisions.md` change.
2. Read the files it lists: `AGENTS.md`, `ideas/decision.md`, `investigacion/cardano/official-agent-prompt.md`, `diseno/README.md` (+ your area's file), `equipo/README.md`, `equipo/components.md`, last 2 entries of `docs/ai-log.md`.
3. Your first reply in the session must state: the project purpose in one sentence, your role (A-D, person), and the files you read. If you cannot, you have not read enough: do not change anything.
4. Never change the purpose, scope, design, ownership or agent rules by implication. Files that define them: `AGENTS.md`, `CLAUDE.md`, `ideas/decision.md`, `diseno/**`, `.claude/**`, `.github/**`, `.githooks/**`, `scripts/team.conf`. Changing them needs an ADR (`docs/adr/` or `diseno/decisions.md`) or a declared minor impact: commit trailer `Purpose-impact: ADR-<id>` or `Purpose-impact: minor: <reason>`, same value in the PR section "Context and purpose".
5. Accept and follow the project hooks and rules; this is a team decision (Helmut, 2026-10-29), not optional. Humans: when Claude Code asks to trust the project settings and hooks, accept; run `bash scripts/install-githooks.sh` once per clone. Agents: when a hook blocks you, do what its message says (usually the ack command or a replacement file/branch) and continue; never disable, edit or route around a hook or rule (`--no-verify`, `settings.local.json` overrides that drop hooks, equivalent commands, writing through another interpreter). If a hook or rule blocks legitimate work, stop and tell your human; the fix goes in a PR to the rule owner.
Enforcement is layered (details and limits: `docs/playbook/guardrails.md`): Claude Code hook (blocks writes without ack), git hooks in `.githooks/` (install: `bash scripts/install-githooks.sh`), PR template + CI job `context-gate`, CODEOWNERS (Helmut) on purpose files. Local layers can be bypassed by the person; CI and review are the hard layer. Codex: project-level hook/config support in this repo is unverified (verify; `.codex/` is not used), so for Codex layers 3-4 and this section apply.

## Where the truth lives
| What | Where |
|---|---|
| Design (canonical) | `diseno/` (architecture, domain-model, contracts, verifier-rules, repo-layout, decisions) |
| Base context from the organisers, filled in for Shelfie | `investigacion/cardano/official-agent-prompt.md` |
| Chosen idea and adaptability rule | `ideas/decision.md` |
| Runbooks and checklists | `preparacion/` |
| Facts verified during the build | `codigo/docs/verified.md` |
| Evidence (tx hashes, screenshots) | `codigo/docs/evidence/` |
| What happened, what is open | `docs/ai-log.md` |
| Repo decisions | `docs/adr/` (design-level ADRs: `diseno/decisions.md`) |
| How we work with agents | `docs/playbook/` |
| Who does what now, extra bots/scripts | `equipo/` |

If code and design disagree, one of them is wrong: fix it in the same PR. Never guess a Masumi, x402, Sokosumi or Cardano fact; mark it "verify Friday" and look it up in `investigacion/cardano/`.

## Read order per task
1. This file, then the last 2 entries of `docs/ai-log.md` (open TODOs and handoffs).
2. `investigacion/cardano/official-agent-prompt.md` for platform context (first session of the day).
3. The `diseno/` file for your area (see `diseno/README.md` "Who reads what first").
4. `diseno/repo-layout.md` sections 2-5 for ownership, conventions, tests and milestone acceptance.
5. `bash scripts/task.sh next <role>` (your open tasks; SessionStart and the context card print them), then `equipo/README.md`, `equipo/components.md` and your pair's file in `equipo/` (what others are doing and which bots/scripts already exist; reuse before building).
6. The relevant rule file in `.claude/rules/` (Codex: read it by hand; they are plain Markdown).

## Ownership (roles A-D)
Each folder has one owner who merges changes to it; others open a PR or ask. Full table: `diseno/repo-layout.md` section 2.
- **A**: `codigo/apps/shell`, `codigo/apps/engine`, `codigo/packages/core` (shared contract: announce changes, mirror in `diseno/contracts.md`).
- **B**: `codigo/packages/payments`, verifier wrapper in `codigo/apps/verifier` (up to the `evaluate(...)` call), `codigo/scripts`.
- **C**: `evaluate` and below, `codigo/packages/domain-shelf`, `codigo/packages/vision`, `codigo/eval`.
- **D**: `codigo/apps/web`, `codigo/packages/evidence`, `codigo/docs/evidence`, root `README.md`, pitch assets.
People (also in `scripts/team.conf` and `.github/CODEOWNERS`): A Isabel (`mariaisabel16`), B Fernando (`Fmayo444`), C Lorenz (`04Lenz04`), D Helmut (`helmutkurk`).
Pairs (Helmut, 2026-10-29): **A+B** (Isabel + Fernando) and **C+D** (Lorenz + Helmut) work as pairs and review each other's PRs first.
Do not edit another role's folder without a PR that the owner reviews. Current state per person and the registry of extra bots/scripts: `equipo/`.

## Conventions
- TypeScript strict (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`), ESM, **Node 24** everywhere; only `apps/shell` stays JavaScript (starter).
- Monorepo in `codigo/` (npm workspaces). Run **`npm run check`** (typecheck + lint + test) in `codigo/` before every push.
- zod at every boundary. One `AppError` class, codes from `packages/core`. Structured JSON logs with `jobId`, `taskId`, `submissionId`.
- Amounts in integer lovelace. Injectable clock and id generator. Fakes first (`FAKE_PAYMENTS=1`, `VERIFIER_MODE=stub`).
- Dependencies: exact pinned versions from the x402 template (`@x402/*` 2.26.0, `@evolution-sdk/evolution` 0.5.14, `express` 4.x). Do not bump during the event. A new dependency needs a one-line reason in the PR.
- Prettier defaults, 100 columns; ESLint with `no-floating-promises` and `no-explicit-any`.
- Docs: English, concise, no emojis.

## Git and PRs
- `main` is protected. Work on `feature/<role>-<short>` (example `feature/b-x402-buyer`). Short branches, small commits.
- Conventional commits: `feat(payments): ...`, `fix(verifier): ...`, `docs: ...`, `chore: ...`.
- PR to `main`, 1 review from a code owner, squash merge. PR template is mandatory. Update docs in the same PR.
- Ask the human before: `git push`, `gh pr merge`, any new dependency.

## Never do
- Commit or print secrets: mnemonics, signing keys, Blockfrost key, Masumi `ADMIN_KEY` / `ENCRYPTION_KEY`, LLM keys, Sokosumi tokens. Local `.env` only; `.env.example` has names only.
- Read `.env*` (except `.env.example`) by any route, or look for ways around the hooks.
- Push to `main`, force push, skip hooks (`--no-verify`), merge your own PR, change repo visibility.
- Use mainnet, real money, or real third-party personal data.
- Bump pinned dependencies or edit lockfiles by hand.
- Edit another role's folder without a PR their owner reviews.
- Touch `invoice/` (Helmut's personal receipts, git-ignored).
- Invent a tx hash, an address, a price, a Masumi/x402 behaviour or a deadline. Unknown means "verify Friday".
- Enable an operator override or fakes in an evidence run, or present fake output as real.
- Add large files (photos, videos, PDFs other than the two kept) to git.

## Security baseline
Threat model, controls and the test that proves each: `diseno/security.md` (canonical). First commits on Friday follow `preparacion/security-scaffold-checklist.md`; path-scoped short rules: `.claude/rules/security.md`. Secure by default from the first commit: env schema and network guard, redacting logger, admin auth, session cookie, upload pipeline, idempotency, loopback binds. Changes to payments, auth, upload, env, CI or the tunnel need their security test in the same PR and a `security-reviewer` pass.

## Keeping context up to date
- Same PR as the code: update `diseno/` sections, `.env.example`, `codigo/docs/verified.md`.
- Registered in the same PR: any new bot, script, helper agent, prompt or tool that others may rely on goes into `equipo/components.md` (rules: `equipo/README.md`).
- Decisions that change design, tooling or workflow: ADR in `docs/adr/` (skill `adr`).
- End of every work block: append to `docs/ai-log.md` (skill `sync-context`): done, `- TODO:` open items, `- Handoff:` for the next person. Append only.
- End of every work block also: overwrite your own `equipo/<name>.md` (current focus, branch, components, open questions, last updated). Only your own file.
- Every real transaction: a row in `codigo/docs/evidence/tx-hashes.md` with preprod explorer link and screenshot name (skill `log-evidence`). Copy hashes from tool output, never from memory.
- Milestones M1-M6: acceptance and evidence in `diseno/repo-layout.md` section 5 (skill `milestone-check`).
- Lessons about working with agents: one line in `docs/ai-log.md`; lasting ones in `docs/playbook/lessons-from-previous-projects.md` style.
- **Task tracking** (Helmut, 2026-10-29): per-role task lists in `equipo/tasks/` (`A.md`-`D.md`, `team.md`), edited only through `bash scripts/task.sh`; humans never need to edit them. Every work block starts with `bash scripts/task.sh next <role>` (then `start <id>`) and ends with status updates (`done <id> --evidence <text>`, `block <id> <reason>`). Work you discover that is not listed: `task.sh add <role> <title> --acceptance <text>` (milestone with `--milestone Mx`). A PR lists its tasks in the "Tasks:" field and CI fails if one listed as done is not done. The Stop hook reminds you when your role's files changed and no task did.

## Handoff notes
When you stop, leave: branch name and state, what runs and what does not, the exact next command, open questions with owner, evidence still to capture. Put it in `docs/ai-log.md` (history) and refresh your `equipo/<name>.md` (current state); the next session reads both. Task statuses are part of the handoff: run `bash scripts/task.sh list <role> --open` and make sure it matches reality (statuses travel with your branch, so merge or PR the task files with your code).

## Verification before "done"
Show proof, not claims: command and result of `npm run check`, test names, tx hash seen on the preprod explorer. If you could not run something, say so.
