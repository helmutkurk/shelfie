# Evidence log (template)

Copy to the working repo. One row per proof; fill immediately, never later. Do not write mnemonics or keys here. Explorer: https://preprod.cardanoscan.io/transaction/<hash>. Screenshots: folder `docs/evidence/screenshots/` (index in `docs/evidence/tx-hashes.md`, `../diseno/repo-layout.md` section 5) with names `YYYYMMDD-HHMM-short-name.png` in local time, or `fri-1430-m1-payment.png` (weekday style).

| # | Weekday + time | Milestone | What happened | Tx hash | Task / job ID | Explorer URL | Screenshot path | What it proves | Recorded by |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Fri 11:20 | M1 | x402 paid request (buyer -> seller `W-SELL`) | | n/a | | evidence/ | Cardano payment on preprod | |
| 2 | | M2 | Engine (`W-VBUY`) pays verifier via x402 | | | | | Agent pays agent | |
| 3 | | M3 | Coworker task COMPLETED (unpaid) | n/a | | | | Hired through Sokosumi | |
| 4 | | M4 | Escrow lock | | | | | Fee held in escrow | |
| 5 | | M4 | Result submitted / settlement receipt (`settled:true`) | | | | | Payment tied to result | |
| 6 | | M2 | Payout to worker after verifier pass (`W-PAY` to worker address) | | | | | Human paid on pass | |
| 7 | | M2 | Rejected cheat attempt (verify tx only, no payout) | | | | | Gate works | |
| 8 | | M5 | Refund after withheld result (no passing photo, N=1) | | | | | Refund path | |

Notes: explicitly mark rows that are mock/override. Lock or registration hash alone does not prove settlement. Keep the Sokosumi receipt JSON (`sokosumi --preprod runtime receipt TASK_ID --coworker-id ID --json`) next to row 5.
