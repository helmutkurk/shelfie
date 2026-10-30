---
name: pr-description
description: Draft the release PR description (dev to main) from the commit range. Use when the user asks for the release PR text; there is no other PR in the flow (ADR-0006).
disable-model-invocation: true
---
# Release PR description

The only PR in the flow is `dev` -> `main` (ADR-0006). Changes to `dev` are pushed directly and peer-reviewed, so no per-change PR text is needed.

1. Run `git fetch origin`, `git diff origin/main...origin/dev --stat`, `git log origin/main..origin/dev --oneline`, and `bash scripts/peer-review.sh status` (must exit 0); read the changed files.
2. Fill `.github/pull_request_template.md`: what is released (milestones M1-M6), `npm run check` and `npm run smoke` results on `dev`, peer-review status, contracts or design docs changed, new dependencies with their reason (from the commit messages), evidence added (tx hashes), risks. Fill "Context and purpose" and "Tasks:" (CI checks both).
3. Facts only from the diff and commands. If a check was not run, say so.
4. Title: `release: <summary>` (or `type(scope): summary`).
5. Output the text; do not run `gh pr create` unless asked. The three teammates who did not open the PR approve; merge commit, not squash.
