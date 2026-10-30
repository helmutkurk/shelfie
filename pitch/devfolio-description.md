# Devfolio submission text

Copy each section into the matching Devfolio field. Replace every `[PLACEHOLDER]` before the deadline; do not submit with brackets. Mark estimates as estimates.

## Project name

Shelfie

## Tagline

Paid only when the photo is true.

## One-line pitch

An agent on Sokosumi hires people to check shelf prices in real stores, a verifier agent decides whether each photo is fresh and readable, and Cardano pays the person only if it passes, with an automatic refund to the brand if not.

## Problem

Small consumer brands want to know, within hours, whether their product is on the shelf in a specific store and at what price. Today they either drive around, book a field-marketing agency or a mystery-shopping panel booked days ahead, or trust sales data that says nothing about the shelf. [SOURCE NEEDED: price per visit and lead time] Visits are usually paid whether or not the photo is usable, and photos can be old, blurry or from the wrong store. AI agents can write a report about retail but cannot see a shelf, and they have no safe way to pay a stranger for evidence from the physical world.

Our fictional but typical customer: the field-sales manager of a small Bavarian craft-lemonade brand who just got listed by a supermarket chain and needs to know whether the bottle is in a given Munich store today.

## Solution

Shelfie is a lead agent that turns "check product X in this store" into one small task, offers it to nearby people, verifies every photo with a separate verifier agent, pays only photos that pass, and refunds the brand if no photo passes in time. A job is one store, one product and one photo in the MVP; multi-store jobs are roadmap. An intake filter rejects jobs for stores or products outside a seeded Munich catalog. The brand hires Shelfie as a coworker on Sokosumi; the fee sits in Masumi escrow.

The three things to remember:

1. Paid only when the photo is true.
2. The code in the photo: each task has a one-time challenge code that must appear next to the price tag.
3. Agents hire people, and the blockchain pays the bill.

## How it works

1. **Hire.** The brand starts a Shelfie job on Sokosumi (product and one store from the seeded Munich catalog, deadline). The fee is locked in Masumi escrow on Cardano preprod. Lock tx: [LOCK_TX_HASH] ([EXPLORER_LINK]).
2. **Plan.** The engine first checks the job against the catalog (known Munich store and product), then creates one task with a time window. The one-time challenge code is issued when a person claims it.
3. **Capture.** A person near the store opens a mobile web page, claims the task (the task is shown to all workers in the city and the first to claim it gets it; a soft browser-location check confirms the city), writes the code on paper (or holds a printed card) and photographs the price tag with the code beside it. Capture is with the live in-app camera only, no gallery, and the browser location at the shutter is checked against the store (150 m default); both checks are deterrents, not proof. If the product is not on the shelf, the worker photographs the empty shelf spot with its shelf label instead, and the brand receives an out-of-stock report.
4. **Verify.** The lead agent (its engine) pays a separate verifier agent per check over x402 on preprod (1 tADA per check, pass or fail). The verifier applies a deterministic gate: the code is present, the price and product can be read by a vision model and parse, the product matches the requested name/EAN, the price is in a plausible range, and the server-side timestamp is inside the window, and the photo is not a duplicate of an earlier one. x402 tx: [X402_TX_HASH].
5. **Pay.** If the photo passes, the lead pays the person immediately on preprod with a plain transfer (3 tADA in the demo). Payout tx: [PAYOUT_TX_HASH] ([CARDANOSCAN_LINK]). If it fails, nothing is paid and the worker can retry with a new code until the attempts or the window run out.
6. **Deliver or refund.** If the photo passes, the report is submitted and escrow settles. Settlement tx: [SETTLE_TX_HASH]. If no photo passes in the window, the result is withheld and the brand is refunded. Refund tx: [REFUND_TX_HASH].

Cheat attempt: an old photo (aimed at with the live camera, since the app has no gallery path) fails because it cannot contain the new code. The video and the live demo show this. Evidence: [VIDEO_LINK] at [TIMESTAMP].

## Cardano tools used

- **Masumi / Sokosumi:** the agent is a Coworker on Sokosumi; payment is in escrow until delivery, with refund on non-delivery. Registry/agent ID: [AGENT_ID].
- **x402 on Cardano preprod:** per-request payment from the lead agent to the verifier agent. Package/template used: [X402_PACKAGE].
- **Cardano preprod:** all transactions; explorer: preprod.cardanoscan.io. Payout done with [CARDANO_SDK_OR_LIBRARY] from the lead agent wallet.
- **Blockfrost (preprod):** chain queries [VERIFY_IF_USED].
- Test funds: tADA from the faucet and the Masumi dispenser; the escrowed job fee is a Masumi/Sokosumi quote [VERIFY_ASSET].

Limits we state openly: preprod only, the Cardano x402 facilitator is preprod-only today, the human payout is a plain transfer rather than x402, and the location is not proven (the code proves freshness, not place).

## How it could run for real

- A small pilot with 3-5 brands in one city and an existing crowd-audit partner as workforce.
- Mainnet payments in a stable asset, with off-ramp and KYC through a regulated partner; workers do not need to learn wallets (onboarding is roadmap).
- Store-owned QR codes or NFC tags on shelves for location proof.
- A legal review of the worker model (self-employment, platform work) and data protection (shelves only, no people in frame, short retention) before launch.
- Multiple verifiers and sampling for high-value jobs.

## Target users

Primary: field-sales and category managers of small and mid-size consumer-goods brands (food, drinks, cosmetics) that sell into supermarkets and drugstores and have no retail-execution team. Secondary: market researchers, retailers auditing competitors, agencies that want a verifiable layer. Workers: students and shoppers already near a store.

## Business model

All EUR figures below are illustrative product pricing (hypotheses), not the preprod test amounts the demo moves (1 tADA per verifier check, 3 tADA per payout, no market value).

- Brand pays per verified check (illustrative EUR 5, estimate); failed checks are free for the brand.
- Worker payout per passed check (illustrative EUR 2.50-3.00); verifier and model cost under EUR 0.10 (estimate); escrow/network fee about 5% [VERIFY].
- Margin roughly EUR 1.65-2.15 per check (5.00 less payout, less 0.10, less 0.25) before support, disputes and the verifier fees spent on rejected photos (estimate). Agency/mystery-shop price per visit: [SOURCE NEEDED].
- Upsell later: recurring audits, price-monitoring reports, API access.

## Impact beyond the hackathon

The engine is a generic verified micro-task loop: job, tasks, worker (human or agent), rule-based verifier, settlement. Shelf checks are one domain pack. Other packs reuse the same payments and agent shell: delivery proof, outage reports, accessibility checks, local data collection for AI.

## What's next

1. Brand interviews to validate price and demand (5 conversations).
2. Location proof via store-owned QR codes.
3. Payout without wallet friction for workers.
4. Pilot with one crowd-work partner.
5. Hardening the verifier (multi-verifier, sampling, face/people rejection).

## What we built in the hackathon

Lead agent and task splitter; phone web page with one-time challenge codes; verifier service with rule-based gate; x402 payment from lead to verifier; preprod payout to a worker wallet; Sokosumi/Masumi job with escrow lock and settlement/refund; brand report view. Teammates acted as workers and printed price tags were used in the demo. Built on the organisers' starters (x402-express for the verifier, tum-hackathon-quickstart for the Sokosumi shell); everything else was written during the event [CONFIRM_TEMPLATE_RULE]. List only what exists in the final repo, and name the demo manual override if it was used anywhere.

## Links

- Repo: [REPO_URL] (public; README with setup and run steps)
- Demo video (max 2:30): [VIDEO_LINK]
- Live demo / app: [APP_URL]
- Sokosumi coworker: [SOKOSUMI_LINK]
- Transactions: lock [LOCK_TX_HASH], x402 [X402_TX_HASH], payout [PAYOUT_TX_HASH], settle [SETTLE_TX_HASH], refund [REFUND_TX_HASH]
- Slides: [SLIDES_LINK]

## Team

- [NAME_A], role: Sokosumi/Masumi shell, engine, integration.
- [NAME_B], role: payments, x402, escrow, wallets.
- [NAME_C], role: verifier, vision, evaluation.
- [NAME_D], role: phone web page, dashboard, evidence, pitch and business case.
All members: [UNIVERSITY / PROGRAMME], [CONTACT].

## Tracks

Cardano: Agentic Commerce on Cardano (main). Automatically entered in the TUM Blockchain Track.
