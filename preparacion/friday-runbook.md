# Friday runbook (09:00 to night)

Base context: the organisers' agent prompt, filled in for Shelfie, in [official-agent-prompt](../investigacion/cardano/official-agent-prompt.md); paste it into every coding-agent session. Commands: see [masumi-runbook](../investigacion/cardano/masumi-runbook.md) and [x402-runbook](../investigacion/cardano/x402-runbook.md). Times are targets, estimates. Log every tx hash in the evidence log immediately.

Roles (as in `../diseno/repo-layout.md` section 2): A Sokosumi/Masumi operator, shell and engine. B Payments, x402 wrapper, wallets. C Verifier gate, vision, domain pack, 20-photo evaluation. D Worker page, dashboard, evidence, pitch.

Hub laptop (Isabel's; operator A, backup B): first check RAM >= 16 GB, disk >= 20 GB, OS, then setup per [hub-laptop.md](hub-laptop.md).

## Shelfie component map
| Component | Owner | Milestone |
|---|---|---|
| Shell (`apps/shell`, JS fork of the starter) and engine (`apps/engine`, TS) | A | M3, M2 |
| Verifier behind x402 (`apps/verifier`) | B (x402 wrapper) + C (gate `evaluate`, pack, vision) | M1, M2 |
| Payout (`packages/payments`, plain transfer from `W-PAY`) | B | M2 |
| Worker mobile page | D | M6 |
| Brand dashboard | D | M6 |
| Evidence ledger | D | all |
| Masumi escrow (job fee, refund) | B + A | M4, M5 |

## Timeline
| Time | A | B | C | D |
|---|---|---|---|---|
| 08:45 | Meet, laptops, hotspot | same | same | same |
| 09:00 | Clone `tum-hackathon-quickstart` at the pinned commit; Coworker + worker; smoke task | Clone `x402-express`; `npm run wallet`; fund; `npm run demo` | Read `diseno/contracts.md` sections 3, 5, 6; start `packages/core` types with A; verifier skeleton against the contract | Repo skeleton, README skeleton, evidence log, mock of worker page |
| 09:30 | Book Masumi 1:1 slot now (earliest available) | Ask workshop question list ready | Capture the evaluation set: 20 price photos plus 8 out-of-stock photos (`diseno/verifier-rules.md` section 7; out-of-stock prop in `demo-props.md`) | Print check: tags and cards ready |
| 10:30 | Cardano workshop (A + D) | Keep M1 going | Verifier skeleton: G1 image, G2 code, G3 readable parse | Workshop |
| 11:00 | API3 workshop: skip unless a second track is chosen | M1 target | Vision extraction prototype | Worker page: live task feed (SSE) + camera sheet (live camera only, location at shutter) per `diseno/ui-design.md` |
| 11:30 | BSV workshop: skip. Swap our prompt in the starter: **M3 by 13:00** | **M1 by 11:30 (go/no-go: if no tx, ask a mentor immediately)** | Verifier endpoint returns pass/fail JSON | Challenge-code display |
| 12:30 | Lunch in shifts; never leave the worker unattended | | | |
| 13:00 | **M3 done** (Coworker task COMPLETED) | Verifier placed behind x402 (seller route, price in lovelace) | Verifier rules G1-G7 complete | Dashboard v0 on fake data |
| 14:00 | Help B: Masumi Payment Service (Postgres, seed, registration) | Masumi Payment Service up (60-120 min); start registration; engine `VerifyClient` calls the verifier via `fetchWithPayment` with cap | Run the 20-photo evaluation; real vision in `evaluate`; engine (A) splits jobs into tasks and calls the verifier -> **M2 by 15:00** | Wire worker page to task API; brand request form with catalog dropdowns (`GET /api/catalog`) |
| 15:00 | Masumi 1:1 (if booked): see mentor-questions; job decision (N=1, K=1), intake rejection and withheld-result path in the shell bridge (M5 code, with C); also ask: can an escrowed task be declined at intake, and the submit deadline | Payout transfer from `W-PAY` (SDK; the ADR-04 check is due by 13:00 and the transfer is part of **M2**, due 15:00); verify tx | Tune thresholds from the evaluation | Dashboard on real task data + ledger |
| 17:00 | **Checkpoint:** M1, M2, M3 done? If not, drop everything else | | | |
| 18:00 | Start first paid Masumi cycle (**M4**, needs >=60 min) with a real job | Watch settlement; record receipt | Failing run (single-photo job, no passing photo before the window closes): decision `WITHHOLD` -> hash withheld (**M5**), start the clock | Record rough demo takes |
| 20:00 | M4 target; save Task ID, receipt, hash | | | Live-demo rehearsal #1 with props |
| 22:00 | **Escrow go/no-go** | | | |
| 22:30 | Night: either stabilise (if go) or freeze escrow and keep M1-M3 + M6 | | | |

## Go/no-go checkpoints
- **11:30 M1:** first x402 payment with Cardanoscan link. No -> B asks the Cardano mentor, others keep going; do not wait past 12:30.
- **13:00 M3:** unpaid Coworker task COMPLETED. No -> A uses the Masumi 1:1 early.
- **15:00 M2:** engine pays the verifier via x402 inside the job flow and a payout tx confirms. No -> demo the payment from a script and explain; escrow proceeds in parallel. If plain transfers from the SDK are not possible by 13:00, apply the ADR-04 fallback and tell everyone.
- **17:00:** state check. If M2 is missing, M4 pauses and all hands on M2.
- **22:00 escrow go/no-go:** M4 settled with `settled:true` and tx hash, or a cycle running with an expected settle before 04:00? Go. Otherwise freeze escrow: show lock tx only, and present refund/settlement as evidence from the one completed run, or as roadmap. M1/M2 satisfy the requirement.
- Plan B trigger: if by 17:00 the vision verifier cannot read the printed tags reliably (see risk register R4), switch to the manual-override demo mode (clearly labelled) rather than switching idea.

## Verify Friday, ADR-17 additions
| Item | Owner | When | Fallback |
|---|---|---|---|
| Sokosumi/Masumi input schema supports option/select fields for store and product | A (Masumi 1:1) | 15:00 | Free text reaches the shell; intake filter rejects it |
| `getUserMedia` and geolocation on the two venue phones (iOS Safari, Android Chrome) over the tunnel; accuracy at the shelf; geofence 150 m enough | D, C | before 14:00 | Larger demo radius in the catalog (`geofenceRadiusM`), flagged |
| Secure LAN option works (mkcert on phones, or `adb reverse`), else LAN stays read-only | D | 13:00 | Tunnel on mobile data |
| Mobile wallet browsers expose CIP-30 (`window.cardano`) | D | 12:00 | Paste address (default) |
| Out-of-stock prompt reads the shelf label and empty facing on the prop shelf | C | with the evaluation | Tighten frame guidance on the worker page |
| Race: two phones claim the same task, one wins, the other's feed drops it | A, D | with M6 | Polling fallback |

## Night (22:30 on)
- Stop coding by 01:00 at the latest; sleep in turns. Keep the Masumi worker running on one machine that stays awake and plugged in.
- Before sleeping: commit and push (keys excluded), update the evidence log, write a 5-line status in the team chat.
- Start the refund-path cycle (M5) before sleeping if not done; the refund queues about 30 min after the submit deadline, so it lands by morning.

## Rules during the day
- One owner for the single running worker (A). Do not restart it without telling A.
- Never debug payments by retrying blindly: a 402 timeout may still settle; check the address on Cardanoscan first.
- One wallet cannot pay concurrently; serialise verifier calls or use separate wallets (`W-VBUY`, `W-PAY`, `W-SELL`, `W-MPS`).
- Ask a mentor after 20 minutes stuck, not 2 hours.
