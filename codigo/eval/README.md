# eval

Status: implemented; works in stub mode, waiting for the photo set (Fri 30-10). Links point to the canonical design in `diseno/` at the repo root (one source of truth).

## Purpose

20-photo evaluation of the verifier: labels, photos, runner and results.

## Owner and starting point

- Owner role: C (person per role: `scripts/team.conf` and `.github/CODEOWNERS`).
- Starts from: Scratch.

## Responsibilities

- `labels.json`, the photo set (large files not committed), runner against the dry endpoint, `results/`.
- Staged cheat cases from [verifier-rules.md](../../diseno/verifier-rules.md).

## Interfaces

- [verifier-rules.md section 7](../../diseno/verifier-rules.md); verifier `POST /v1/verify-dry` and `/v1/extract` (contracts section 3.2).

## Milestones

- First report with M2 (Fri 15:00); final before the freeze (Sat 13:00).

## Definition of done

- Report with per-gate precision on the 20 photos saved to `docs/evidence/`.

## Do not

- Do not commit private photos with people; shelves and price tags only.
- Do not use dry verdicts as evidence.

## What exists
- `labels.json`: schema `LabelsFileSchema` in `src/labels.ts` (case, outcome, expectedCode, product, truth, expect, optional `duplicateOf` / `claimOffsetSec` / `stubScenario`). The committed file has 3 placeholder entries and no photos.
- `src/run.ts`: runs `evaluate` in-process over every label (same function as `/v1/verify-dry`), in file order so `duplicateOf` and near-duplicate memory work. `src/report.ts`: confusion matrix, acceptance table from verifier-rules section 7, per-case and per-reason counts, latency. `src/execute.ts` / `src/cli.ts`: modes and output.
- Output: `results/<timestamp>.json` (labels, verdicts, raw extractions, thresholds, models) and `results/<timestamp>.md`. `results/*.json` and `photos/` are git-ignored. The design says `<commit>.json`; use `--note <commit>` and rename when you keep a result.

## Run
```
cd codigo
npm run eval -w @shelfie/eval                       # stub mode, synthetic stand-in photos, no keys
npm run eval -w @shelfie/eval -- --mode live --note <git-commit> --cost-per-check 0.004   # VISION_* from env, photos in eval/photos/
npm run eval -w @shelfie/eval -- --mode replay --replay results/<file>.json               # re-tune thresholds offline, no model call
```
Stub and synthetic runs are marked "NOT evidence" in the report. Live runs: put photos in `eval/photos/` (shelves and tags only, no people), add one label per photo, run once per provider (set `VISION_PROVIDER`, `VISION_MODEL`, `VISION_BASE_URL`, `VISION_API_KEY`).

## TODO
- Capture the 20 + 8 photos and write their labels (cases in `CaseSchema`).
- Cost per check is recorded only if passed with `--cost-per-check`.
- No HTTP runner: the runner calls `evaluate` directly. If you want to test the running service, post the same fixtures to `POST /v1/verify-dry` (needs `ENABLE_DRY=true`).
- The first report goes to `docs/evidence/` with the commit hash after the real run.
