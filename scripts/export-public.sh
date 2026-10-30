#!/usr/bin/env bash
# DEPRECATED (ADR 0003: the repo is public from the first push). Fallback only, if history must be abandoned.
# Export an allowlisted snapshot of this repo into a NEW directory (no git history).
# Usage: scripts/export-public.sh <target-dir>
# Does NOT run git init/commit/push. Review the target by hand, then init a fresh repo there.
set -euo pipefail

# ---- EDIT HERE: allowlist (paths relative to repo root; files or directories) ----
ALLOWLIST=(
  "README.md"
  "LICENSE"
  "codigo"
  "diseno"
  ".gitignore"
  ".editorconfig"
  ".env.example"
)

# ---- Denylist: never copied, even if inside an allowlisted directory ----
DENYLIST=(
  "basic-knowledge" "ideas" "investigacion" "pitch" "preparacion" "review" "invoice"
  "docs/ai-log.md" ".claude" ".git" ".github/CODEOWNERS"
  "node_modules" ".next" "dist" "build" "coverage" ".turbo"
  "CLAUDE.md" "AGENTS.md" "settings.local.json"
  "diseno/product-roadmap.md"   # business strategy stays private
)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"

[ $# -eq 1 ] || { echo "Usage: $0 <target-dir>" >&2; exit 2; }
# Resolve the target without creating it, so a refusal leaves no trace.
TPARENT="$(dirname -- "$1")"
[ -d "$TPARENT" ] || { echo "Refusing: parent of target does not exist." >&2; exit 1; }
TARGET="$(cd "$TPARENT" && pwd -P)/$(basename -- "$1")"

case "$TARGET/" in
  "$ROOT"/*) echo "Refusing: target is inside the repo ($ROOT)." >&2; exit 1 ;;
esac
if [ -d "$TARGET" ] && [ -n "$(ls -A "$TARGET")" ]; then
  echo "Refusing: target '$TARGET' is not empty." >&2; exit 1
fi
mkdir -p "$TARGET"

# Build rsync-free copy: use tar with excludes.
EXCLUDES=()
for d in "${DENYLIST[@]}"; do EXCLUDES+=(--exclude="$d"); done
EXCLUDES+=(--exclude=".env" --exclude=".env.*" --exclude="*.pem" --exclude="*.key" --exclude="*.log")

copied=0
for p in "${ALLOWLIST[@]}"; do
  if [ -e "$ROOT/$p" ]; then
    (cd "$ROOT" && tar -cf - "${EXCLUDES[@]}" "$p") | (cd "$TARGET" && tar -xf -)
    echo "copied: $p"; copied=$((copied+1))
  else
    echo "skipped (missing): $p"
  fi
done

# .env.example is allowed (names only): restore it after the .env.* exclude.
if [ -f "$ROOT/.env.example" ] && [[ " ${ALLOWLIST[*]} " == *" .env.example "* ]]; then
  cp "$ROOT/.env.example" "$TARGET/.env.example"
fi
# Strip any other .env* that slipped through.
find "$TARGET" -type f \( -name ".env" -o -name ".env.*" \) ! -name ".env.example" -print -delete | sed 's/^/stripped: /'

# ---- Secret pattern scan on the result ----
echo "--- secret scan ---"
hits=0
scan() { # label, grep -E pattern
  local out
  out="$(grep -rIEn --exclude-dir=.git -e "$2" "$TARGET" 2>/dev/null || true)"
  if [ -n "$out" ]; then echo "[$1]"; echo "$out" | head -20; hits=$((hits+1)); fi
}
scan "preprod key"        'preprod[A-Za-z0-9]{32}'
scan "sk- token"          'sk-[A-Za-z0-9_-]{16,}'
scan "ADMIN_KEY value"    'ADMIN_KEY=[^[:space:]]+'
scan "ENCRYPTION_KEY val" 'ENCRYPTION_KEY=[^[:space:]]+'
scan "24-word mnemonic"   '(^|[^a-z])([a-z]{3,8} ){23}[a-z]{3,8}([^a-z]|$)'
scan "private key block"  'BEGIN [A-Z ]*PRIVATE KEY'
echo "--- flagged for manual review (allowed, but check) ---"
out="$(grep -rIEn --exclude-dir=.git 'addr_test1[a-z0-9]{20,}' "$TARGET" 2>/dev/null || true)"
[ -n "$out" ] && { echo "[addr_test1 addresses]"; echo "$out" | head -20; }

echo "--- summary ---"
echo "target:      $TARGET"
echo "files:       $(find "$TARGET" -type f | wc -l)"
echo "size:        $(du -sh "$TARGET" | cut -f1)"
echo "scan hits:   $hits"
if [ "$hits" -gt 0 ]; then
  echo "RESULT: secret-like patterns found. Fix before publishing." >&2; exit 3
fi
echo "RESULT: no pattern hits (patterns are simple; also run gitleaks). Review by hand, then 'git init' in the target yourself."
