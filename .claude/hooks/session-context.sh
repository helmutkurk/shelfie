#!/usr/bin/env bash
# SessionStart: stdout is added to Claude's context. Keep it short.
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
sid=""; if [[ ! -t 0 ]] && command -v jq >/dev/null; then sid=$(timeout 1 cat 2>/dev/null | jq -r '.session_id // ""' 2>/dev/null); fi
[[ "$sid" =~ ^[A-Za-z0-9._-]+$ ]] || sid="<session-id>"
echo "CONTEXT GATE: edits, writes and write-type Bash commands are blocked until you run: bash scripts/context-ack.sh --session ${sid} --who <isabel|fernando|lorenz|helmut> , read the files it lists, and state purpose + role + files read in your first reply."
branch=$(git branch --show-current 2>/dev/null)
[[ -z "$branch" ]] && branch="detached HEAD ($(git rev-parse --short HEAD 2>/dev/null || echo unknown))"
echo "Current branch: ${branch}."
case "$branch" in
  main|dev|master)
    echo "You are on protected '${branch}'. Start feature/fix/docs work on a short branch from dev; see CONTRIBUTING.md for releases and hotfixes." ;;
esac
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
[[ "$dirty" != "0" ]] && echo "Working tree has ${dirty} uncommitted change(s)."

# Build window: starts Fri 2026-10-30 09:00, Devfolio deadline Sat 2026-10-31 15:00 (Europe/Berlin).
now=$(date +%s)
start=$(TZ=Europe/Berlin date -d '2026-10-30 09:00' +%s 2>/dev/null)
end=$(TZ=Europe/Berlin date -d '2026-10-31 15:00' +%s 2>/dev/null)
if [[ -n "$start" && -n "$end" ]]; then
  if (( now < start )); then
    echo "Time: build window not open yet (opens Fri 30-10 09:00). No application code before then; docs and config only."
  elif (( now < end )); then
    left=$(( (end - now) / 60 ))
    echo "Time: build window open. $((left / 60)) h $((left % 60)) min to the Sat 31-10 15:00 deadline. Code freeze Sat 13:00."
  else
    echo "Time: deadline passed (Sat 31-10 15:00). Only submission fixes and docs."
  fi
fi

if [[ -f docs/ai-log.md ]]; then
  todo=$(tail -n 60 docs/ai-log.md | grep -E '^- (TODO|Handoff|Blocked):' | tail -n 6)
  if [[ -n "$todo" ]]; then
    echo "Open items from the tail of docs/ai-log.md:"
    echo "$todo"
  fi
fi
if compgen -G "equipo/*.md" >/dev/null 2>&1; then
  focus=$(for f in equipo/isabel.md equipo/fernando.md equipo/lorenz.md equipo/helmut.md; do
    [[ -f "$f" ]] && printf '%s: %s\n' "$(basename "$f" .md)" "$(awk '/^## Current focus/{g=1;next} /^## /{g=0} g&&NF{print;exit}' "$f" | cut -c1-120)"
  done)
  if [[ -n "$focus" ]]; then
    echo "Team focus (equipo/, read equipo/README.md and components.md):"
    echo "$focus"
  fi
fi
if [[ -f scripts/task.sh && -d equipo/tasks ]]; then
  # Own role from SHELFIE_WHO or the newest ack on this laptop; otherwise all roles compactly.
  read -r trole _ < <(timeout 5 bash scripts/task.sh who --session "$sid" 2>/dev/null)
  [[ "$trole" =~ ^[A-D]$ ]] || trole=""
  timeout 5 bash scripts/task.sh brief $trole 2>/dev/null | head -n 14
fi
echo "Reminders: preprod only, never read .env, evidence tx hashes go to codigo/docs/evidence/tx-hashes.md, run 'npm run check' in codigo/ before pushing."
exit 0
