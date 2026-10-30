#!/usr/bin/env bash
# One-shot launch of the PUBLIC team repo (ADR 0003) (runbook: docs/github-setup.md). Run by Helmut, from anywhere:
#   scripts/launch-github.sh            pre-flight only (changes nothing)
#   scripts/launch-github.sh --go       pre-flight, git init, first commit, create PUBLIC repo, push, invite
#   scripts/launch-github.sh --protect  protect main + enable secret scanning and push protection (run after the first CI run)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT"
# shellcheck source=/dev/null
source scripts/team.conf
MODE="${1:-check}"
fail=0
ok()   { printf '  ok    %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; fail=1; }
warn() { printf '  warn  %s\n' "$*"; }

preflight() {
  echo "== Pre-flight"
  command -v gh >/dev/null && ok "gh installed" || bad "gh missing"
  gh auth status >/dev/null 2>&1 && ok "gh logged in as $(gh api user --jq .login)" || bad "gh not logged in: run gh auth login"
  [ -n "$(git config --global user.email || true)" ] && ok "git email $(git config --global user.email)" || bad "git user.email not set"
  for u in "$HELMUT" "$ISABEL" "$FERNANDO" "$LORENZ"; do
    gh api "users/$u" >/dev/null 2>&1 && ok "GitHub user $u exists" || bad "GitHub user '$u' not found: fix scripts/team.conf"
  done
  gh repo view "$OWNER/$REPO" >/dev/null 2>&1 && bad "repo $OWNER/$REPO already exists" || ok "repo name $OWNER/$REPO is free"
  # Secret patterns (simple; gitleaks is better if installed)
  if command -v gitleaks >/dev/null; then
    gitleaks detect --no-git --source . --redact --no-banner -l error && ok "gitleaks clean" || bad "gitleaks found something"
  else
    bad "gitleaks missing: install it (public repo, history is permanent) before the first push"
  fi
  # Sensitive words that must not go public (docs/public-release.md section 3)
  words="$(grep -rIliE --exclude-dir=.git --exclude-dir=invoice --exclude-dir=downloads-blockchain-website --exclude-dir=node_modules \
      --exclude=launch-github.sh --exclude=public-release.md --exclude=0003-public-repo-from-the-start.md --exclude=ai-log.md \
      -e 'synlab' -e 'kijini' -e '/home/[a-z]' . || true)"
  [ -z "$words" ] && ok "no client names or local paths" || bad "client names or local paths in: $words"
  hits="$(grep -rIlE --exclude-dir=.git --exclude-dir=invoice --exclude-dir=node_modules \
      --exclude=launch-github.sh --exclude=export-public.sh --exclude=test-hooks.sh --exclude=guard-bash.sh --exclude=prompt-guard.sh \
      -e 'preprod[A-Za-z0-9]{32}' -e 'sk-ant-[A-Za-z0-9_-]{16,}' -e 'sk-[A-Za-z0-9]{32,}' \
      -e 'ADMIN_KEY=[A-Za-z0-9]{8,}' -e 'ENCRYPTION_KEY=[A-Za-z0-9]{8,}' -e 'BEGIN [A-Z ]*PRIVATE KEY' . || true)"
  [ -z "$hits" ] && ok "no secret patterns" || bad "secret-like patterns in: $hits"
  envs="$(find . -path ./.git -prune -o -name '.env*' ! -name '.env.example' -print)"
  [ -z "$envs" ] && ok "no .env files" || warn ".env files present (must be ignored): $envs"
  big="$(find . -path ./.git -prune -o -type f -size +50M -print)"
  [ -z "$big" ] && ok "no files > 50 MB" || bad "large files: $big"
  echo "  note  every teammate must have run scripts/install-githooks.sh and have gitleaks BEFORE the first push (confirm in chat)"
  if [ -d .git ]; then bad ".git already exists: launch was started before; finish by hand (docs/github-setup.md)"; fi
}

ignored_check() {
  echo "== Ignore rules"
  for p in invoice/ downloads-blockchain-website/ investigacion/prizes.html .env .env.local .claude/settings.local.json; do
    git check-ignore -q "$p" && ok "ignored: $p" || bad "NOT ignored: $p"
  done
  if git add -A --dry-run | grep -qE "invoice/|(^|/)\.env($|\.local)"; then bad "invoice/ or .env would be committed"; else ok "staging set clean"; fi
}

case "$MODE" in
  check)
    preflight
    [ "$fail" -eq 0 ] && echo "Pre-flight passed. Run: scripts/launch-github.sh --go" || { echo "Fix the FAIL lines first."; exit 1; }
    ;;
  --go)
    preflight; [ "$fail" -eq 0 ] || { echo "Pre-flight failed; nothing changed."; exit 1; }
    scripts/assign-roles.sh
    git init -q -b main
    ignored_check
    if [ "$fail" -ne 0 ]; then rm -rf .git; echo "Ignore check failed; removed .git, nothing published."; exit 1; fi
    git add -A
    echo "== Files to commit: $(git diff --cached --name-only | wc -l)"
    git diff --cached --name-only | sed 's#/.*##' | sort | uniq -c
    read -r -p "Create PUBLIC repo $OWNER/$REPO and push (history is permanent; teammates have hooks + gitleaks)? Type 'yes': " ans
    [ "$ans" = "yes" ] || { echo "Stopped before commit. .git kept; rerun the remaining steps by hand or rm -rf .git"; exit 1; }
    git commit -q -m "Add team context: design docs, agent config, runbooks (no application code)"
    gh repo create "$OWNER/$REPO" --public --source . --remote origin --push
    [ "$(gh repo view "$OWNER/$REPO" --json visibility --jq .visibility)" = "PUBLIC" ] && ok "repo is PUBLIC" || bad "repo is NOT public: check now"
    echo "== Inviting collaborators (write access)"
    for u in "$ISABEL" "$FERNANDO" "$LORENZ"; do
      gh api "repos/$OWNER/$REPO/collaborators/$u" -X PUT -f permission=push >/dev/null && ok "invited $u" || bad "invite failed for $u"
    done
    echo "Done. Teammates accept at https://github.com/$OWNER/$REPO/invitations and follow docs/playbook/agent-setup.md."
    echo "Next: wait for the first CI run, then scripts/launch-github.sh --protect."
    ;;
  --protect)
    tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
    cat > "$tmp" <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["check", "secret-scan", "context-gate"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1, "require_code_owner_reviews": true, "dismiss_stale_reviews": true },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
    if gh api "repos/$OWNER/$REPO/branches/main/protection" -X PUT --input "$tmp" >/dev/null; then
      ok "main protected (PR + 1 code-owner review + checks check, secret-scan; no force push)"
    else
      warn "protection refused. Verify the plan in repo settings; fallback: team convention in CONTRIBUTING.md."
    fi
    if gh api "repos/$OWNER/$REPO" -X PATCH --input - >/dev/null 2>&1 <<'JSON'
{ "security_and_analysis": { "secret_scanning": { "status": "enabled" }, "secret_scanning_push_protection": { "status": "enabled" } } }
JSON
    then ok "secret scanning + push protection requested"; else warn "secret scanning / push protection not enabled (verify in Settings > Code security)"; fi
    gh api "repos/$OWNER/$REPO" --jq '"security_and_analysis: \(.security_and_analysis)"' || true
    ;;
  *) echo "usage: $0 [--go|--protect]"; exit 2 ;;
esac
