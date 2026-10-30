---
name: pr-description
description: Draft the pull request description from the current branch diff. Use when the user asks for a PR description or before opening a PR.
disable-model-invocation: true
---
# PR description

1. Read the PR template's Base branch selection. Run `git diff <base>...HEAD --stat` and `git log <base>..HEAD --oneline` (`dev` for feature/fix/docs; `main` for release/hotfix); read the changed files.
2. Fill `.github/pull_request_template.md`: what and why (2-3 lines), milestone (M1-M6 or none), owner role touched, contracts or design docs changed, new dependencies with one-line reason, how tested (`npm run check` result), evidence added (tx hashes), risks.
3. Facts only from the diff. If a check was not run, say so.
4. Title in conventional commit form: `type(scope): summary`.
5. Output the text; do not run `gh pr create` unless asked.
