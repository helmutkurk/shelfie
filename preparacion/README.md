# Preparation — Shelfie

Product: **Shelfie** (see [../ideas/decision.md](../ideas/decision.md)). Track: Cardano (main). Plan B: Behoerde Brief Decoder (same architecture).

Rule: the FAQ forbids building before Friday 09:00. Starter templates are allowed; the core build happens during the event. Until then: accounts, tools, reading, planning, demo props. No project code.

Roles A–D follow [../investigacion/cardano/team-plan.md](../investigacion/cardano/team-plan.md), as re-defined for Shelfie in [../diseno/repo-layout.md](../diseno/repo-layout.md) section 2: **A** Sokosumi/Masumi operator, owns `apps/shell` and `apps/engine`; **B** payments, owns `packages/payments`, the x402 wrapper of `apps/verifier`, wallets and tunnel; **C** verifier gate, vision, `packages/domain-shelf`, `eval/`; **D** `apps/web`, `packages/evidence`, evidence folder, README, pitch assets. Assign names Thursday evening.

| File | Use |
|---|---|
| [thursday-evening-checklist.md](thursday-evening-checklist.md) | Accounts, tools, reading, verification, do-not list |
| [friday-runbook.md](friday-runbook.md) | Hour by hour, 09:00 to night, with go/no-go checkpoints |
| [saturday-runbook.md](saturday-runbook.md) | Freeze, video, Devfolio, submission 15:00, judging 15:00-17:00 |
| [demo-props.md](demo-props.md) | Physical kit, price tags, b-roll stores |
| [hub-laptop.md](hub-laptop.md) | The one hub laptop (Isabel's): requirements, setup, pre-demo checklist |
| [risk-register.md](risk-register.md) | Top 15 risks |
| [mentor-questions.md](mentor-questions.md) | Prioritised questions |
| [evidence-log-template.md](evidence-log-template.md) | Every tx hash and proof |
| [submission-checklist.md](submission-checklist.md) | Devfolio + Cardano requirements |

Sources: [../investigacion/cardano/masumi-runbook.md](../investigacion/cardano/masumi-runbook.md) (exact Masumi commands), [../investigacion/cardano/x402-runbook.md](../investigacion/cardano/x402-runbook.md) (x402), [../investigacion/tracks-oficiales-2026-10-29.md](../investigacion/tracks-oficiales-2026-10-29.md) (rules). Commands are not repeated here; sections are cited.

## Shelfie component names used in all files
1. **Lead agent** = shell `apps/shell` (JavaScript fork of the Masumi starter, Sokosumi Coworker) plus **engine** `apps/engine` (TypeScript): the engine applies the intake filter, plans the task (one per store; MVP jobs have one store), decides the job (K rule, default 1 of 1) and calls the verifier and payout. Owner A.
2. **Verifier** `apps/verifier` (separate service behind x402): deterministic gate G1-G7 (image, code, readable, product, price, timing, duplicate) around one vision call. Owners B (x402 wrapper) and C (gate).
3. **Payout** `packages/payments`: plain preprod transfer from `W-PAY` (the lead's payout wallet) to the worker's address; verifier fees come from `W-VBUY`. Owner B.
4. **Worker mobile page** `apps/web` route `/w`: claim task, show challenge code, in-app photo. Owner D.
5. **Brand dashboard** `apps/web` route `/dashboard`: job, per-store results, report. Owner D.
6. **Evidence ledger** `packages/evidence` and `docs/evidence/`: every tx hash with explorer link (see template). Owner D.
7. **Domain pack** `packages/domain-shelf`: thresholds, prompts, report template. Owner C.

## Milestones (adapted from the team plan)
Definitions and times are those of [../diseno/repo-layout.md](../diseno/repo-layout.md) section 5. M1 x402 paid request (Fri 11:30). M2 lead pays verifier via x402 and pays a human by plain transfer (Fri 15:00). M3 Coworker task COMPLETED on Sokosumi, unpaid (Fri 13:00). M4 Masumi paid cycle with settled receipt (Fri 20:00). M5 no passing photo (N=1) withholds result, refund (Fri night, recorded). M6 front end: worker page + dashboard + ledger (Sat 11:00). Stop at any rung and still have a valid submission.
