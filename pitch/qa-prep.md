# Hard judge questions and answers

Answers are short on purpose: lead with the honest limit, then the mitigation. Mark roadmap items as roadmap. Figures are estimates until sourced. Suggested answerer in brackets, by build role (A architecture/scale, B Cardano/payments, C verifier/fraud/security, D business/UX/privacy/pitch).

## Security and fraud

1. **Can a worker fake a photo (screenshot, AI-generated image, photo of a photo)?** [C]
   Partly. The one-time code is generated per task and shown only after the worker claims the task, so an old or pre-made image cannot contain it. A photo of a printed tag with the code written on it requires knowing the code in advance, which is time-limited. A fake made live is possible in theory; the mitigations are camera-only capture in the app (no gallery pick; a web app cannot prove the frame is live, so a phone pointed at a screen still works and the code is what stops it), a short window (the code expires after a few minutes), a rule-based sanity check on price, and sampling by a second photo for high-value jobs (roadmap). We do not claim zero fraud; we claim the cost of cheating exceeds the EUR 3.50 payout.

2. **What about GPS spoofing? Does it prove the person was in the store?** [C]
   No, and we say so. The code proves freshness and task-binding, not location. Location proof is roadmap: store-owned QR codes or shelf-label NFC placed by the retailer, plus coarse location as a weak signal. Today the worker must be in the store's city at claim time and within the store's geofence (default 150 m, accuracy considered) when the photo is taken, using browser geolocation; that is spoofable (mock-location apps) and only a deterrent. For the hackathon, the trust model is that the brand pays for evidence of a price tag next to a fresh code; a worker could photograph the same product in another shop, and we do not detect that.

3. **Can the verifier agent be gamed or collude with the worker?** [C]
   The verifier is a separate service with deterministic rules (code present, image usable, product matches, price parses and is in range, server-side timestamp, no duplicate image). The vision model only extracts text; it does not decide. Pass/fail is rule-based and the rules are published, so any decision can be re-checked from the stored photo. Honest limit: in the demo we run the verifier ourselves, so today the audit trail is our own logs plus the on-chain record of every check. The verifier is paid the same per check, pass or fail, so its operator gains nothing from either outcome. Roadmap: an independent operator chosen by the brand, and multiple verifiers that must agree for large jobs.

3a. **Aren't you just paying yourselves for verification?** [B]
   In the demo, yes: both wallets (`W-VBUY` and `W-SELL`) are ours, and the net is zero minus network fees. We do not claim it as revenue. What we built is the interface: the verifier is a separate x402 endpoint, paid per check whether it says yes or no. That matters because Shelfie is not neutral: we earn only when a check passes, so we would profit from approving bad photos, and the brand would gain from rejections. A verifier paid a flat fee per check has no stake in the outcome. Because it sits behind x402, the brand can replace ours with any independent verifier (an auditor, the retailer, or several that must agree) by changing a URL. The same endpoint can also be sold to other agents that need photo evidence checked. Who could run it in production: shelf-recognition vendors (Trax, ParallelDots ShelfWatch, Vispera, Neurolabs) for product and price, signed in-app capture such as Truepic (C2PA) for freshness, and a dispute layer (UMA- or Kleros-style) for contested checks. None of them offers a pay-per-check x402 endpoint today (their pricing is enterprise and on quote), which is why we built our own for the demo.

4. **What stops one person from claiming many tasks or sybil accounts?** [D]
   Today: each claim is short-lived with a single-use code, attempts per task are capped, duplicate images are rejected, and payout happens only after verification. Per-worker limits, reputation and identity checks are not built; at pilot scale (invited users) this would be manual.

5. **What if the verifier wrongly rejects a true photo?** [C]
   The task is reopened, the worker can retry within the window (with a new code), and a human review path exists for disputes (roadmap). The brand is never charged for failed checks.

## Why blockchain, why Cardano

6. **Why blockchain at all? A database and Stripe would do.** [B]
   For the brand-to-agent leg, the value is escrow with automatic refund when no result is delivered, plus a public receipt per check. For the agent-to-human and agent-to-agent legs, the value is paying small amounts to many strangers and to other agents without accounts, card onboarding or minimum fees. A database can show a ledger; it cannot make two untrusting parties both rely on it. We do not claim that every part needs a chain; the payment gate does.

7. **Why Cardano instead of Stripe Connect?** [B]
   Stripe works well for card payments between known parties, but it needs KYC onboarding of every payee, has per-transaction minimums that make EUR 3.50 payouts costly, and cannot be called by an agent over plain HTTP without an account. Cardano's x402 path lets an agent pay per request with no account, and Masumi gives escrow plus an agent marketplace (Sokosumi) where brands already look for agents. Honest caveat: the Cardano x402 facilitator is preprod-only today.

8. **Is x402 on Cardano mature enough?** [B]
   It is early. We use it for the one thing it fits: per-check payment to the verifier. The human payout is a plain preprod transfer from the lead's wallet. We state this in the README.

9. **Who holds the money? Is it custodial?** [B]
   The brand's fee sits in the Masumi escrow; the lead agent's wallet holds the working float for payouts and verifier fees. For the hackathon, the lead agent's wallet is a hot preprod wallet we control. In production, a payout-only budget per job, spending caps per payment, and the escrow as the only large balance. We have not audited this.

10. **What happens if the lead agent disappears with the money?** [B]
    Escrow funds are only released on delivery. Float used for payouts is kept small (separate wallets, funded with a fixed amount; per-job caps are roadmap). Both are reasons to keep the lead agent's wallet scoped and to publish the code.

## Privacy and legal

11. **GDPR in stores: you photograph shelves, what about people and staff?** [D]
    The task instructions say shelf and tag only, no people. Today the worker page tells workers to keep people out of frame and the verifier flags images where a person is visible as an advisory warning to the operator (it does not block); automatic rejection is roadmap. We store the image only as long as needed for verification and the report, store no worker data beyond a wallet address and task logs, and would sign a data-processing agreement with brands. Open question: whether stores allow photographing; we ask permission for filming and expect brands' retail agreements to cover audits.

12. **Is paying strangers per task an employment relationship? Labour law, minijob, Scheinselbstständigkeit?** [D]
    This is the main legal risk and we are not lawyers. Per-task micro-work for platforms is usually structured as self-employed or as a platform intermediary with small amounts, but German law looks at the real relationship. For a pilot, use a partner that already runs crowd-audit workforces or limit it to occasional gigs under the small-income thresholds; do not promise anything beyond that. Needs a legal opinion before mainnet. [SOURCE NEEDED: current rules on platform work and the EU platform work directive]

13. **Tax and anti-money-laundering when paying people in crypto?** [D]
    Payouts to individuals would be reportable income. A mainnet product would pay in a stable asset or euros via an off-ramp, and we would use a payment partner for KYC. Not built; not claimed.

14. **Do you need a licence to hold or move value for others?** [D]
    Escrow of customer funds can trigger payment-services rules. The reason to use the Masumi escrow instead of building our own is to avoid operating as a custodian. A regulated partner is needed for production.

## Business and scale

15. **What are the unit economics?** [D]
    Illustrative: EUR 12 per verified check to the brand (pay-as-you-go; EUR 399/month for 50 checks, EUR 5-6 at volume), EUR 3.50 to the worker, verifier and model cost well under EUR 0.10, escrow fee about 5% (EUR 0.60), leaving a margin of roughly EUR 7.80 (65%) before support, disputes and the verifier fees spent on rejected photos. All hypotheses, and distinct from the preprod test amounts (1 tADA per check, 3 tADA per payout). Market comparison: a quick merchandising audit visit costs about $30-45 (T-ROC Global 2026 guide, vendor figures), a German Testkauf about EUR 50-260 (agency price lists). Agencies also fix shelves and write reports; we replace only the presence-and-price check. Details and sources: `market-pricing.md`.

16. **Who actually pays, and why would they switch from an agency?** [D]
    Small and mid-size consumer brands without a retail-execution team, who today either do not check or buy small agency packages. They switch for speed (same day), proof (code-bound photo with audit trail) and pay-per-passed-check. We have not validated demand with interviews; the hackathon is a proof of mechanism. Next step: 5 brand interviews.

17. **Does it scale? Where are the bottlenecks?** [A]
    The software scales; the workforce does not automatically. Supply is local and uneven (more workers in cities), tasks may sit unclaimed, and payouts need batching on chain to keep fees low. Verifier cost scales linearly with checks. The bottleneck is recruiting and retaining workers, which is why we would partner with existing crowd networks first.

18. **Why would a worker bother for EUR 3.50?** [D]
    For people already in the store, it is a few minutes. Target workers are students and shoppers passing shops, not a full-time wage. Existing crowd-audit apps pay in the same range (BeMyEye about GBP 1.5-6 for a ~10 minute photo task, Roamler about GBP 5, range GBP 3-20; blog and forum figures, indicative). Whether the amount is enough for us is untested; the price is a parameter set per task.

## What was built

19. **What exactly was built in 30 hours, and what is mocked?** [A]
    Built: the lead agent and task splitter, the phone web page with one-time challenge codes, the verifier with its rule set, an x402 payment from the lead to the verifier, a preprod payout to the worker wallet, and the Sokosumi/Masumi job with escrow (settlement and refund shown from earlier recorded runs). Starting points were the organisers' x402-express and tum-hackathon-quickstart templates; everything else was written during the event. Mocked or manual: store list (we pick stores), demo price tags we printed, teammates as workers, no identity checks, no location proof, no mainnet. Update this answer to match the final README before the table.

20. **What would you do with another month?** [D]
    Store-owned QR codes for location, multi-verifier checks for high-value jobs, a payout path that does not need workers to hold a wallet, a pilot with 3-5 real brands and one crowd-work partner, and a legal review of the worker model. Domain packs beyond shelf checks (deliveries, outages, accessibility audits) reuse the same task, verifier and settlement engine.

## Bonus questions to rehearse

- "Is this just Streetspotr with a chain?" Answer: the existing crowd-audit apps trust the platform to check photos and pay on their own schedule; here payment is bound to a published rule set and the receipt is public. We are not claiming a better workforce, only a trustable payment gate. [SOURCE NEEDED: confirm what competitors do before saying this]
- "Why not just use an AI vision model to judge the shelf?" Because a model cannot tell if the photo is new or from the right place; the code and the deterministic gate handle that.
- "What if the brand disputes the report?" The report links each row to the photo, the verifier result and the payout tx.
