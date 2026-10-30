# GitHub setup runbook (Friday morning, executed by Helmut)

Goal: create ONE **public** repo from this folder (ADR 0003, `docs/adr/0003-public-repo-from-the-start.md`) and give the 3 teammates access. Nothing here was executed during preparation. History is permanent: finish the pre-push audit (`docs/public-release.md` section 3) and the hooks step below BEFORE the first push.

**Fast path (prepared 29-10):** handles live in `scripts/team.conf` (Helmut `helmutkurk`, Isabel `mariaisabel16`, Fernando `Fmayo444`, Lorenz `04lenz04`). Then:

```bash
scripts/launch-github.sh            # pre-flight only, changes nothing
scripts/launch-github.sh --go       # init, commit, create PUBLIC repo helmutkurk/shelfie, push, invite 3
scripts/launch-github.sh --protect  # after the first CI run: branch protection + secret scanning + push protection
```

After the initial repo creation, follow section 3 to create `dev` from `main` and set `dev` as the default branch before regular work starts.

Roles A-D: fill `ROLE_A..ROLE_D` in `scripts/team.conf`, run `scripts/assign-roles.sh`, commit `.github/CODEOWNERS` in a PR. The manual steps below are the same, step by step.

Timestamps: commits carry their real times. Prep docs were written Thursday 29-10, before the event; this is allowed (docs and config only). Application code starts Fri 30-10 09:00. Never backdate commits or rewrite dates.

## 0. Plan and features (read first)

Decided (Helmut, 2026-10-29): public repo from the start. On public repos, GitHub documents protected branches, required reviews and required status checks as available on the Free plan, and secret scanning plus push protection as free for public repositories (docs: https://docs.github.com/en/code-security/getting-started/github-security-features, https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches). **Verify in repo settings Friday** (Settings > Branches, Settings > Code security): the docs were read on 29-10 and not tested on this account. Helmut also has GitHub Pro via the Student Developer Pack; if the Free-plan behaviour differs, Pro covers it. Standard Actions runners are free on public repos.

If protection cannot be enforced: convention without enforcement (branches, PR, one review, nobody directly pushes or force-pushes `dev` or `main`; CODEOWNERS still requests reviews and CI shows red/green).

## 1. Prerequisites

```bash
gh --version
gh auth status            # if not logged in:  gh auth login   (GitHub.com, HTTPS or SSH, browser)
git config --global user.name
git config --global user.email   # use the email tied to your GitHub account (or the noreply address)
```

Teammates need GitHub accounts; handles: @mariaisabel16 (Isabel), @Fmayo444 (Fernando), Lorenz to confirm (see `scripts/team.conf`).

## 2. Pre-flight checks (must all pass before first commit)

First, hooks and scanner on every laptop that will push (each person, before the first push; Helmut confirms in the group chat):

```bash
bash scripts/install-githooks.sh   # sets core.hooksPath=.githooks (context gate + gitleaks pre-commit)
gitleaks version                   # install if missing: mise use -g gitleaks, or your package manager
```

Then the audit in `docs/public-release.md` section 3. Commands:

Run from the repo root, before `git init` where possible.

```bash
# 2.1 Secret scan. Preferred: gitleaks (if installed)
gitleaks detect --no-git --source . -v
# Fallback: grep patterns
grep -rIEn --exclude-dir=.git --exclude-dir=invoice \
  -e 'preprod[A-Za-z0-9]{32}' -e 'sk-[A-Za-z0-9_-]{16,}' \
  -e 'ADMIN_KEY=[^[:space:]]+' -e 'ENCRYPTION_KEY=[^[:space:]]+' \
  -e 'BEGIN [A-Z ]*PRIVATE KEY' -e 'addr_test1[a-z0-9]{20,}' . || echo "no hits"

# 2.2 Files that must stay out of git (after git init, step 3)
git check-ignore -v invoice/ downloads-blockchain-website/ investigacion/prizes.html .env .env.local .claude/settings.local.json
#   each path must print a matching .gitignore rule. Empty output = NOT ignored: fix .gitignore first.

# 2.3 What would be committed
git status --ignored
git add -A --dry-run | head -100      # skim: no invoice/, no .env, no PDFs with personal data

# 2.4 Large files (GitHub rejects > 100 MB; warns > 50 MB)
find . -path ./.git -prune -o -type f -size +50M -print
```

If a secret or invoice file appears in the index: `git rm --cached <file>`, fix `.gitignore`, re-check. Do this BEFORE the first commit so it never enters history.

## 3. Create and push

```bash
git init -b main
git add -A
git status --short | head -50         # last look
git commit -m "Add team context: design docs, agent config, runbooks"
gh repo create shelfie --public --source . --remote origin --push
```

`shelfie` is a suggested name; change freely. Verify logged out (private window): `gh repo view --web` shows the "Public" badge, and `invoice/`, `downloads-blockchain-website/` and `.env` are not listed.

Create `dev` from the initial `main` branch using GitHub's branch creation UI, then set `dev` as the default branch. The branch protections below assume both `dev` and `main` already exist.

## 4. Invite collaborators (write access)

```bash
OWNER=helmutkurk; REPO=shelfie
for U in mariaisabel16 Fmayo444 04lenz04; do
  gh api "repos/$OWNER/$REPO/collaborators/$U" -X PUT -f permission=push
done
gh api "repos/$OWNER/$REPO/invitations" --jq '.[].invitee.login'
```

Each teammate must accept the emailed invitation (or at https://github.com/OWNER/REPO/invitations). Personal-repo collaborator limits on Free: verify (GitHub docs list no cap for private collaborators; not re-verified).

Note: CODEOWNERS owners need explicit write access, else they are not assigned (code-owners doc above).

## 5. Protect `dev` and `main`, secret scanning, push protection

`scripts/launch-github.sh --protect` applies the same rules to both branches (below is the manual version). Classic branch protection (public repo, any plan; verify Friday):

In Settings > General > Pull Requests, allow squash merges and merge commits: use squash for feature/fix/docs PRs into `dev` and a merge commit for release PRs into `main`.

```bash
cat > /tmp/protection.json <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["check", "secret-scan", "security", "context-gate"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
for BRANCH in main dev; do
  gh api "repos/$OWNER/$REPO/branches/$BRANCH/protection" -X PUT --input /tmp/protection.json
done
```

The contexts are the job names in `.github/workflows/ci.yml` (`check`, `secret-scan`), `.github/workflows/security.yml` (`security`) and `.github/workflows/context-gate.yml` (`context-gate`). CI and Security run on pushes and PRs targeting both `dev` and `main`. **`context-gate` is a required status check**: it fails a PR whose "Context and purpose" section is empty, or that changes purpose files without `ADR-<id>` or `minor: <reason>`. Each check must have run once before it can be required. CODEOWNERS requires Helmut on purpose files (`AGENTS.md`, `CLAUDE.md`, `ideas/decision.md`, `diseno/`, `.claude/`, `.github/`, `.githooks/`, `scripts/team.conf`); GitHub does not let an author approve their own PR, so for a PR authored by Helmut on those files use the admin bypass (`enforce_admins:false`). Hackathon note: `enforce_admins:false` lets Helmut bypass in an emergency; with 1 approval, a 4-person team merges quickly.

Ruleset alternative (Team, or Pro if your Settings > Rules allows it):

```bash
cat > /tmp/ruleset.json <<'JSON'
{
  "name": "dev-and-main-protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main", "refs/heads/dev"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [ { "context": "check" }, { "context": "secret-scan" }, { "context": "security" }, { "context": "context-gate" } ] } }
  ]
}
JSON
gh api "repos/$OWNER/$REPO/rulesets" -X POST --input /tmp/ruleset.json
```

If the API answers 403, the plan or repo visibility does not allow it: use the convention fallback (section 0). Do not use only one of classic/ruleset unless the other is unavailable; verify the JSON field names against https://docs.github.com/en/rest/branches/branch-protection and https://docs.github.com/en/rest/repos/rules (not tested).

Secret scanning and push protection (public repos; verify the response Friday):

```bash
gh api "repos/$OWNER/$REPO" -X PATCH --input - <<'JSON'
{ "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" } } }
JSON
gh api "repos/$OWNER/$REPO" --jq '.security_and_analysis'
```

Record in `codigo/docs/verified.md` what the settings showed. gitleaks (pre-commit and CI `secret-scan`) stays the primary control either way.

## 6. Actions, secrets, Dependabot

- CI runs on GitHub-hosted runners (free on public repos). Linux only. The CI workflow skips when no `package.json` exists.
- Actions secrets: none needed now. If ever needed: `gh secret set NAME` (never paste values into files, issues or chats).
- Dependabot alerts: enable in Settings > Code security (available on all repos). Dependabot version updates are optional; skip during the hackathon.
- Secret scanning / push protection: see section 5. Local guard hooks (`.claude/`), the gitleaks pre-commit and CI remain the base layer.

## 6b. Friday setup, local git hooks (each person, once)

```bash
bash scripts/install-githooks.sh
.claude/hooks/test-hooks.sh        # Claude Code users
```
Then each session: `bash scripts/context-ack.sh --session <label> --who <name>`.

## 7. Teammate onboarding

Each person:

```bash
gh auth login
gh repo clone OWNER/REPO && cd REPO
git switch dev
cp .env.example .env     # fill locally, never commit
```

Then set up their agent (Claude Code and/or Codex) following `docs/playbook/agent-setup.md`. Read `AGENTS.md` first (Claude imports it from `CLAUDE.md`). Create each feature/fix/docs branch from `dev` and PR it into `dev`; see [CONTRIBUTING.md](../CONTRIBUTING.md) for release and hotfix flows. Never push directly to `dev` or `main`.

## 8. Rotate a leaked key

1. Revoke/rotate at the provider immediately (Blockfrost project key, Masumi `ADMIN_KEY`/`ENCRYPTION_KEY`, LLM provider key, Sokosumi token). Deleting the commit does NOT un-leak the key.
2. If it is a wallet mnemonic: move funds (testnet tADA is low value, still replace), generate a new wallet, update addresses in `.env` and docs.
3. Update local `.env` of all four people; tell the team in the group chat.
4. Remove from the repo: `git rm --cached` + fix; the repo is public, so assume the value is already copied: rotating is mandatory and sufficient; rewriting history is optional and needs all clones reset. If history is badly polluted, the fallback is a fresh repo (`docs/public-release.md` section 6).
5. Record the incident in `docs/ai-log.md` only as "key X rotated at HH:MM", never the value.

## 9. Open items

- [ ] Protection for `dev` and `main`, and secret scanning confirmed available (or convention fallback chosen): ______
- [ ] Repo name and owner account: ______
- [ ] Teammates' GitHub handles collected: 04lenz04
- [ ] CI job names confirmed (`check`, `secret-scan`, `security`, `context-gate`)
- [ ] Every teammate ran `bash scripts/install-githooks.sh` and has gitleaks before the first push
