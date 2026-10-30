# Public repo: pre-push audit (ADR 0003)

Not legal advice. Decision (Helmut, 2026-10-29, `docs/adr/0003-public-repo-from-the-start.md`): the GitHub repo is **public from the first push** on Friday. There is no private phase and no export. Git history is permanent, so everything below happens BEFORE the first push; after it, every commit is public the moment it lands.

## 1. Hackathon requirement (verify)

`investigacion/tracks-oficiales-2026-10-29.md` states the common submission needs a video <= 2.5 min, a detailed description on Devfolio, and a PUBLIC repo before the deadline (Sat 31-10 15:00, `tum.devfolio.co`) with an install-and-run README. A public repo from Friday satisfies this. Verify on Devfolio or via `hackathon@tum-blockchain.com` only if a doubt remains.

## 2. What is public, what stays out

Public (committed): design, runbooks, research notes, pitch, `docs/ai-log.md`, `AGENTS.md`, `.claude/` rules/hooks/agents, `equipo/`. Accepted trade-off: judges and competitors can read strategy notes (ADR 0003).

Never committed (git-ignored, verify with `git check-ignore -v`): `.env*` except `*.example`, keys, `invoice/`, `downloads-blockchain-website/`, `investigacion/prizes.html` and `chunk.txt` (third-party saves), `*.jsonl`, `codigo/**/data/`, evidence photos.

Content rules for anything that will be committed:
- Names: team first names and GitHub handles only. No surnames, emails, phone numbers, home or study addresses, student ids. The organisers' contact addresses (`hackathon@`, `sponsors@tum-blockchain.com`) are public on their site and allowed.
- No client or employer names from freelance work; write "a previous project".
- No absolute local paths (`/home/<user>/...`); use repo-relative paths.
- No keys, tokens, mnemonics, Blockfrost ids, Masumi `ADMIN_KEY`/`ENCRYPTION_KEY`. Testnet addresses and tx hashes are public on-chain and allowed in evidence.
- No photos of people; no raw worker coordinates.
- No files over 1 MB except the two kept PDFs (`basic-knowledge/main.pdf`, `pitch/slides/shelfie.pdf`).
- Commit messages, PR text and issues are public too.

## 3. Pre-push checklist (Fri 09:30, owner D with Helmut; repeat Sat before submission)

Run from the repo root, before `git init` (launch script does this).

1. Hooks and scanner on every laptop that will push: `bash scripts/install-githooks.sh`, and install gitleaks (`mise use -g gitleaks` or the distro package; verify `gitleaks version`). Each person confirms in the group chat BEFORE the first push; nobody pushes without it.
2. Secret scan of the tree: `gitleaks detect --no-git --source . --redact -v` (fallback: the grep patterns in `docs/github-setup.md` section 2).
3. Sensitive words: `grep -rniE "synlab|kijini|/home/|@gmail|@tum\.de" . --exclude-dir=invoice --exclude-dir=downloads-blockchain-website` shows only intended hits. Old `docs/ai-log.md` entries are append-only: if one names a client, Helmut decides whether to keep it.
4. Ignore rules: `git check-ignore -v invoice/ downloads-blockchain-website/ .env .env.local .claude/settings.local.json investigacion/prizes.html` prints a rule for each.
5. Staging set: `git add -A --dry-run | head -200`; no `invoice/`, `.env`, downloads, PDFs/HTML other than the two kept PDFs.
6. Large or binary files: `find . -path ./.git -prune -o -type f -size +500k -print`.
7. Read the public-facing files once: `README.md`, `AGENTS.md`, `docs/ai-log.md`, `pitch/devfolio-description.md`.
8. After the push: check logged out that the repo is public and `invoice/` is absent; enable secret scanning, push protection and branch protection (`scripts/launch-github.sh --protect`, `docs/github-setup.md`); record what the settings page offered in `codigo/docs/verified.md`.

If a secret reached a pushed commit: rotate it first (`docs/github-setup.md` section 8); deleting the commit does not un-leak it. If the history is badly polluted, use the fallback in section 6.

## 4. Licenses (informational)

- No license: all rights reserved; others may view (on GitHub, forking within the platform is allowed by ToS) but not reuse. Safest for a business.
- MIT / Apache-2.0: permissive; Apache adds an explicit patent grant. Anyone may use commercially.
- BUSL / other source-available: code visible, commercial use restricted for a period; not OSI open source. Check each license's terms before choosing.
- Source: https://choosealicense.com (verify).

## 5. Team IP and ownership

Before going public, selling, or starting a company, the four members agree IN WRITING (a short signed or emailed document is better than nothing): who owns the code, whether contributions are shared equally, how a sale or revenue is split, who may use it commercially, what happens if someone leaves. Also check whether TUM, an employer or client (e.g. from earlier freelance work) or the hackathon rules claim any rights over the work. Not legal advice; consult a lawyer or TUM's founder services before a sale.

## 6. Fallback: fresh public repo from an export (deprecated)

`scripts/export-public.sh <target-outside-repo>` copies an allowlisted tree without history and scans it. It is kept only for the case that history has to be abandoned (a leak that cannot be cleaned). Its allowlist predates ADR 0003 and excludes most docs; edit it before use.

## 7. Checklist

- [ ] Pre-push audit (section 3) done, gitleaks clean (task D: "Pre-push public audit")
- [ ] Every teammate has hooks and gitleaks installed before the first push
- [ ] Repo created public, protection and secret scanning set or "not available" recorded
- [x] License chosen: BUSL-1.1 ([ADR 0004](adr/0004-license-busl-1.1-source-available.md)); parameters proposed pending the IP agreement
- [ ] Written IP agreement: draft in [docs/ip-agreement.md](ip-agreement.md), pending confirmation by all four (section 5)
- [ ] README with install and run steps tested on a clean checkout
- [ ] Repo URL added to Devfolio before Sat 15:00
