# Fernando - role B
- Role and pair: B, pair with Isabel (A)
- GitHub: Fmayo444
- Reviews: pair reviews each other's commits first (peer review, `scripts/peer-review.sh`)

## Current focus
B-01, B-02, B-04 done (ADR-04 answered: SDK payout tx `60d49a3a...`). Next: B-03 (M1 paid x402 request from W-VBUY), B-07 (payout queue on preprod: confirmed payout plus no double pay on the same key), B-10 (spend caps, incl. `VERIFY_RUN_CAP_LOVELACE`).

## Active branch
- `dev`: payout-once and the payout reconcile (auto-reconcile of UNKNOWN, stale alert, space-in-path fix) merged and pushed (ADR-0006), security-reviewer passes done; awaiting peer review by Isabel's agent. B-04 and B-07 doing.

## Components I added
| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Payout once | `codigo/scripts/payout-once.ts` | One real preprod transfer from W-PAY; checks confirmations and `find()` (ADR-04) | `cd codigo && node --env-file=<local env> --import tsx scripts/payout-once.ts --to addr_test1... [--send]` | works: tx `60d49a3a...` (B-04) | funded W-PAY, Blockfrost preprod key |
| Smoke | `codigo/scripts/smoke.ts` | End-to-end checks against the engine on fakes | `cd codigo && npm run smoke` | works (fake mode, my laptop) | running engine on fakes |
| Hub launcher | `codigo/scripts/hub-up.sh` | Starts engine, verifier, web, optional tunnel | `cd codigo && npm run hub-up -- --fake` | implemented; venue and tunnel pending | - |
| Funding check | `codigo/scripts/fund-check.ts` | Preprod balances for public wallet addresses | `cd codigo && node --import tsx scripts/fund-check.ts` | dry path only | Blockfrost preprod key |

## Open questions
- Is a self-operated verifier paid over x402 acceptable for "agents hiring agents"? (mentor-questions C2, M8; Fernando)
- Sokosumi credits: balance, credits per job at 1 test USDM, refund on withhold; nothing tracks them yet (Isabel, verify Friday).
- Does Sokosumi need to reach the agent API publicly (mentor question M6)? Conflicts with the engine-only tunnel (Isabel, Helmut).
- Evolution SDK default tx TTL, to decide whether stale SUBMITTED payouts may move to UNKNOWN (me, verify Friday).

## Last updated
2026-10-30 by Claude Opus 5.5 (Fernando's session)
