# Lorenz - role C
- Role and pair: C, pair with Helmut (D)
- GitHub: 04Lenz04
- Reviews: pair reviews each other's commits first (peer review, `scripts/peer-review.sh`)

## Current focus
Real vision: first live eval run (C-05 real call, C-09), then the photo set (C-03: 6 of 28, no photo with a challenge code yet, no OOS photo). Gates, endpoints and injection tests are done (C-02, C-04, C-06, C-07, C-12, C-15).

## Active branch
`feature/c-live-vision`, merged into `dev` and pushed (live vision eval, `set-secret.sh`, safe provider errors, G7 test C-15).

## Components I added
| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Eval runner | `codigo/eval/` | Labelled photos through `evaluate()`, stub/live/replay reports | `cd codigo && npm run eval -w @shelfie/eval -- --mode live` | works in stub; live pending keys | `@shelfie/verifier` |
| set-secret | `codigo/scripts/set-secret.sh` | Key once into git-ignored `codigo/.env`, hidden input | `cd codigo && bash scripts/set-secret.sh VISION_API_KEY` | works | - |

## Open questions
- Exact Gemini/OpenAI model ids and base URLs for the live run (verify Friday, Lorenz).
- Real OOS photos on the props shelf (C-08), with Helmut (D).

## Last updated
2026-10-30 15:35 by Claude Opus 5.5 (Lorenz's session)
