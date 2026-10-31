# Devfolio submission text

Copy each section into the matching Devfolio field. Replace every `[PLACEHOLDER]` before the deadline; do not submit with brackets. Mark estimates as estimates.

## Project name

Shelfie

## Tagline

Paid only when the photo is true.

## One-line pitch

An agent on Sokosumi hires people to check shelf prices in real stores, a verifier agent decides whether each photo is fresh and readable, and Cardano pays the person only if it passes, with an automatic refund to the brand if not.

## The problem it solves

Devfolio field "The problem it solves" (markdown). Written 2026-10-31 (Fernando). Lena is an illustrative example, not a customer; drop the "For example" paragraph if the pitch does not use her.

```markdown
### Shelf facts are easy to need and hard to trust

A brand launching a product in a new city needs simple answers: **what do competitors cost in this store, and is the product actually on the shelf?** The data exists only in the physical world, so today someone has to go there:

- **Agencies and mystery shoppers** charge per visit: about $30–45 for a quick merchandising audit ([T-ROC Global 2026](https://trocglobal.com/retail-merchandising-services/)) and from EUR 50 for a German test purchase ([mystery.agency](https://www.mystery.agency/content/testkauf-2/)). Visits are booked ahead and **paid whether or not the photo is usable**.
- **Photos can't be checked.** A blurry shot, an old picture or the wrong shelf looks just like a real one to someone far away.
- **AI agents can't help on their own.** They can read the whole internet but can't see one shelf, and they have no safe way to pay a stranger for evidence from the real world.

For example, picture Lena, a small drinks maker in Lisbon launching an energy drink in Munich. She is 2,000 km away. Her only option is to pay an agency and hope the photos are real.

### What Shelfie makes easier and safer

**For brands:** post a job such as "check this product in this Munich store" on Sokosumi. The fee is locked in Masumi escrow on Cardano. If a photo passes verification, the result is delivered and the escrow settles. If no photo passes in time, **the brand gets its money back automatically**. Brands never pay for a photo that isn't true.

**For people nearby:** anyone close to the store can claim the task from a phone, take one photo with the live camera, and get **paid on-chain right after it passes**. There is no invoicing and no waiting for an agency to pay out.

**Against cheating:** the worker must be in the store's city to claim the task, and the phone's location is checked against the store when the photo is taken. Each claim gets a one-time hand sign, shown only when the camera opens, that must appear in the photo within 90 seconds, so an old or prepared photo can't contain it. A separate verifier agent, paid per check over x402, applies fixed rules: right sign, right product, readable price, inside the time window, not a photo of a screen.

**For AI agents:** Shelfie gives agents a way to get trustworthy evidence from the physical world and pay for it only when it is correct. Shelf checks are the first use; the same loop works for any "is it really there?" question.

*Built and tested on Cardano preprod with test ADA.*
```

## Problem

Small consumer brands want to know, within hours, whether their product is on the shelf in a specific store and at what price. Today they either drive around, book a field-marketing agency or a mystery-shopping panel booked days ahead, or trust sales data that says nothing about the shelf. A quick merchandising audit visit costs about $30-45 ([T-ROC Global 2026 guide](https://trocglobal.com/retail-merchandising-services/)), a German Testkauf about EUR 50-260 per visit ([mystery.agency](https://www.mystery.agency/content/testkauf-2/), [mystery-shopping.de](https://www.mystery-shopping.de/produkt/1-testkauf-mystery-shopping/)). Visits are usually paid whether or not the photo is usable, and photos can be old, blurry or from the wrong store. AI agents can write a report about retail but cannot see a shelf, and they have no safe way to pay a stranger for evidence from the physical world.

How we got here: an acquaintance of a teammate's father wants to bring a drink to Germany and asked two of us to photograph comparable products in Munich shops, what they cost and whether they are on the shelf. We would have walked for hours, and he could not have checked our photos from abroad. The customer type: a brand entering a market without a field team, which needs competitor prices and availability store by store. (One real request, no brand interviews yet.)

## Solution

Shelfie is a lead agent that turns "check product X in this store" into one small task, offers it to nearby people, verifies every photo with a separate verifier agent, pays only photos that pass, and refunds the brand if no photo passes in time. A job is one store, one product and one photo in the MVP; multi-store jobs are roadmap. An intake filter rejects jobs for stores or products outside a seeded Munich catalog. The brand hires Shelfie as a coworker on Sokosumi; the fee sits in Masumi escrow.

The three things to remember:

1. Paid only when the photo is true.
2. The sign in the photo: each claim gets a one-time hand sign (2-5 fingers, left or right of the tag), shown only when the camera opens, to be answered within 90 seconds.
3. Cardano escrow makes sure nobody pays for a photo that isn't true.

## How it works

1. **Hire.** The brand starts a Shelfie job on Sokosumi (product and one store from the seeded Munich catalog, deadline). The fee is locked in Masumi escrow on Cardano preprod. Lock tx: [LOCK_TX_HASH] ([EXPLORER_LINK]).
2. **Plan.** The engine first checks the job against the catalog (known Munich store and product), then creates one task with a time window. The one-time hand sign is drawn when a person claims it and revealed only when they open the camera.
3. **Capture.** A person near the store opens a mobile web page, claims the task (the task is shown to all workers in the city and the first to claim it gets it; a soft browser-location check confirms the city), opens the camera at the shelf, sees the hand sign and has 90 seconds to photograph the price tag with that hand beside it. Capture is with the live in-app camera only, no gallery, and the browser location at the shutter is checked against the store (150 m default); both checks are deterrents, not proof. If the product is not on the shelf, the worker photographs the empty shelf spot with its shelf label instead, and the brand receives an out-of-stock report.
4. **Verify.** The lead agent (its engine) pays a separate verifier agent per check over x402 on preprod (1 tADA per check, pass or fail). The vision model only reads; plain code decides. The gates: the image is usable, the hand sign matches (finger count and side), the photo does not show a display screen, price and product are readable and parse, the product matches the requested name/EAN, the price is in a plausible range, the photo arrived within 90 s of the sign being shown (engine clock), and it is not a duplicate of an earlier photo. Location is checked by the engine before the verifier is called, so a photo from outside the geofence costs no fee. Each check is its own preprod transaction. x402 tx (first paid check, verdict from a stub reader): [cbc9cb5d...](https://preprod.cardanoscan.io/transaction/cbc9cb5d4d70bbfbc4a43e8817570db610b61cace150696107eab4734d78474d).
5. **Pay.** If the photo passes, the lead pays the person immediately on preprod with a plain transfer (3 tADA in the demo). Payout tx: [PAYOUT_TX_HASH] ([CARDANOSCAN_LINK]). If it fails, nothing is paid and the task reopens: a new claim gets a new hand sign, up to 3 verified photos per task or until the window runs out.
6. **Deliver or refund.** If the photo passes, the report is submitted and escrow settles. Settlement tx: [SETTLE_TX_HASH] (use a Shelfie-registration Task; the settlement on record so far is from the Masumi starter agent). If no photo passes in the window, the result is withheld and the brand is refunded. Refund tx: [REFUND_TX_HASH] (the refund on record ran through our bridge with the engine on fakes; say so if it is the one used).

Cheat attempt: an old photo (aimed at with the live camera, since the app has no gallery path) fails because it cannot show the new hand sign; a model-based screen check is a second, weaker line. The video and the live demo show this. Evidence: [VIDEO_LINK] at [TIMESTAMP].

## Cardano tools used

- **Masumi / Sokosumi:** the agent is a Coworker on Sokosumi; payment is in escrow until delivery, with refund on non-delivery. Registry: Masumi agent "Shelfie", registration `cmvv55cpy00301w904q3bezzk` (preprod).
- **x402 on Cardano preprod:** per-request payment from the lead agent to the verifier agent. Packages: `@x402/*` 2.26.0 (as pinned in the x402-express template), hosted preprod facilitator.
- **Cardano preprod:** all transactions; explorer: preprod.cardanoscan.io. Payout done with `@evolution-sdk/evolution` 0.5.14 from the lead agent's payout wallet, through a serial payout queue with idempotency (no double pay on retry or restart).
- **Blockfrost (preprod):** chain queries [VERIFY_IF_USED].
- Test funds: tADA from the faucet and the Masumi dispenser; the escrowed job fee is 1 test USDM (100 Sokosumi credits).

Limits we state openly: preprod only, the Cardano x402 facilitator is preprod-only today, the human payout is a plain transfer rather than x402, and location is checked with the phone's browser GPS against the store (150 m by default), which can be spoofed (the hand sign proves freshness, GPS is a deterrent).

## How it could run for real

- A small pilot with 3-5 brands in one city and an existing crowd-audit partner as workforce.
- Mainnet payments in a stable asset, with off-ramp and KYC through a regulated partner; workers do not need to learn wallets (onboarding is roadmap).
- Stronger in-store location proof than GPS (for example store-owned QR codes or NFC tags; not built).
- A legal review of the worker model (self-employment, platform work) and data protection (shelves only, no people in frame, short retention) before launch.
- Multiple verifiers and sampling for high-value jobs.

## Target users

Primary: field-sales and category managers of small and mid-size consumer-goods brands (food, drinks, cosmetics) that sell into supermarkets and drugstores and have no retail-execution team. Secondary: market researchers, retailers auditing competitors, agencies that want a verifiable layer. Workers: students and shoppers already near a store.

## Business model

All EUR figures below are illustrative product pricing (hypotheses), not the preprod test amounts the demo moves (1 tADA per verifier check, 3 tADA per payout, no market value).

- Brand pays per verified check: illustrative EUR 12 pay-as-you-go, EUR 399/month for 50 checks (about EUR 8 each), EUR 5-6 at volume later (estimates); failed checks are free for the brand.
- Worker payout per passed check (illustrative EUR 3.50, in line with crowd-audit apps such as BeMyEye and Roamler, about GBP 1.5-6 and GBP 3-20 per task); verifier and model cost under EUR 0.10 (estimate); escrow/network fee about 5% [VERIFY].
- Margin roughly EUR 7.80 (65%) per pay-as-you-go check (12.00 less 3.50, less 0.10, less 0.60) before support, disputes and the verifier fees spent on rejected photos (estimate).
- Against the market: EUR 12 is about a third of the cheapest agency audit visit ($30-45) and a quarter of the cheapest German Testkauf (from EUR 50). Ten stores: EUR 120 vs about $300-450 or EUR 500+. Agencies also fix shelves and write long reports; Shelfie replaces only the presence-and-price check.
- Upsell later: recurring audits, price-monitoring reports, API access.

## Impact beyond the hackathon

The engine is a generic verified micro-task loop: job, tasks, worker (human or agent), rule-based verifier, settlement. Shelf checks are one domain pack. Other packs reuse the same payments and agent shell: delivery proof, outage reports, accessibility checks, local data collection for AI.

## What's next

1. Brand interviews to validate price and demand (5 conversations).
2. Stronger location proof than GPS (for example store-owned QR codes; not built).
3. Payout without wallet friction for workers.
4. Pilot with one crowd-work partner.
5. Hardening the verifier (multi-verifier, sampling, face/people rejection).

## What we built in the hackathon

Lead agent and task splitter; phone web page with live camera, location check and one-time hand signs (printed code cards as fallback mode); verifier service with rule-based gate; x402 payment from lead to verifier; preprod payout to a worker wallet; Sokosumi/Masumi job with escrow lock and settlement/refund; brand report view. Teammates acted as workers and printed price tags were used in the demo. Built on the organisers' starters (x402-express for the verifier, tum-hackathon-quickstart for the Sokosumi shell); everything else was written during the event [CONFIRM_TEMPLATE_RULE]. List only what exists in the final repo, and name the demo manual override if it was used anywhere.

## Links

- Repo: [REPO_URL] (public; README with setup and run steps)
- Demo video (max 2:30): [VIDEO_LINK]
- Live demo / app: [APP_URL]
- Sokosumi coworker: [SOKOSUMI_LINK]
- Transactions: lock [LOCK_TX_HASH], x402 `cbc9cb5d4d70bbfbc4a43e8817570db610b61cace150696107eab4734d78474d`, payout [PAYOUT_TX_HASH] (engine payout queue run: `1abef82575d1bfa75e64d9f0d9e40e733fe964e9bc6c9cee333e23a994e510d8`; prefer the payout of a verified photo once logged), settle [SETTLE_TX_HASH], refund [REFUND_TX_HASH]
- Homepage: [HOMEPAGE_URL]

## Team

- [NAME_A], role: Sokosumi/Masumi shell, engine, integration.
- [NAME_B], role: payments, x402, escrow, wallets.
- [NAME_C], role: verifier, vision, evaluation.
- [NAME_D], role: phone web page, dashboard, evidence, pitch and business case.
All members: [UNIVERSITY / PROGRAMME], [CONTACT].

## Tracks

Cardano: Agentic Commerce on Cardano (main). Automatically entered in the TUM Blockchain Track.
