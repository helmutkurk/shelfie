# Fernando - role B
- Role and pair: B, pair with Isabel (A)
- GitHub: Fmayo444
- Reviews: pair reviews each other's PRs first

## Current focus
B-04 (ADR-04): one real W-PAY plain transfer on preprod with `scripts/payout-once.ts`, then B-07 (payout queue, reconcile work in review). Next: B-01 -> B-03 (M1 paid x402 request), B-10 (spend caps, incl. `VERIFY_RUN_CAP_LOVELACE`).

## Active branch
- `feature/b-payout-once`: PR open, review Isabel. payout-once script, security-reviewer pass done (safe to push); main merged in (gitleaks hook fix).
- `fix/b-payout-reconcile`: PR to `main`, review Isabel. Auto-reconcile of UNKNOWN payouts, stale alert, space-in-path fix. B-07 doing.

## Components I added
| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Payout once | `codigo/scripts/payout-once.ts` | One real preprod transfer from W-PAY; checks confirmations and `find()` (ADR-04) | `cd codigo && node --env-file=<local env> --import tsx scripts/payout-once.ts --to addr_test1... [--send]` | wip, not run on preprod | funded W-PAY, Blockfrost preprod key |
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
