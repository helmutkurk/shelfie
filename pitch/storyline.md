# Shelfie storyline

The narrative spine for the video, the live pitch and the Devfolio text. Every other pitch file must stay consistent with this one. Facts about the product come from `../ideas/decision.md`; anything not verified is marked.

## Persona (fictional, say so if asked)

**Katharina Brandl, field-sales manager at Isarquell**, a small Bavarian craft-lemonade brand (invented for the story; no real company). Four people in sales. She sold a new 0.33 l bottle to a regional supermarket chain last month. Today she needs to know: is it on the shelf in this Munich store, at which price, right now? (MVP: one job is one store and one photo; checking ten stores means ten jobs, bundled multi-store jobs are roadmap.) Her options:

- Drive around herself (an afternoon for a handful of stores).
- Book a field-marketing agency or a mystery-shopping panel: days of lead time, paid per visit whether or not the photo is usable. [SOURCE NEEDED: typical price per visit and lead time]
- Trust the chain's own sales data, which says nothing about the shelf.

## The spine

| Beat | Line / idea | What the judge sees |
|---|---|---|
| Hook | "Last month Katharina sold her lemonade to a supermarket chain. Today she has no idea whether it is on the shelf." | Empty-looking shelf shot, then a phone with a calendar full of calls |
| Tension | Existing checks are slow, expensive, and you pay even when the photo is blurry, old or from the wrong store. Agents can think but cannot see a shelf. | Agency invoice vs blurry photo |
| Reveal | "Shelfie: an agent that hires people to look, and pays them only if the photo is true." | Sokosumi task: "Check Isarquell 0.33 l in this Munich store" |
| Proof | Escrow locks the fee. A person in a store gets a one-time code, writes it on paper (or holds a printed card) and photographs the tag with the code in frame; a verifier agent (paid per check over x402) reads price and product; green = payout tx on preprod; an old photo with the wrong code = red, no payment. | Real screens, real tx hash on preprod.cardanoscan.io |
| Result | If the photo passes, the report is delivered and escrow settles. If no photo passes in time, the brand is refunded automatically. | Report table, then (or alternatively) refund tx |
| Vision | "Anything an AI needs to know about the physical world can be bought this way: proof first, payment second." Next: store-owned QR codes for location, other domain packs (deliveries, outages, accessibility). | One line, one slide |

## Hook line (first 10 seconds)

"An AI can write a report about a supermarket shelf. It cannot see the shelf. So we taught an agent to hire someone who can, and to pay only if the photo is true."

## The 3 phrases judges must remember

1. **"Paid only when the photo is true."** The product in one breath; ties payment to result.
2. **"The code in the photo."** The one-time challenge code is the memorable mechanism (freshness proof, visible in the demo).
3. **"Agents hire people, and the blockchain pays the bill."** Agents acting in the real world, with an explorer link as receipt.

Rule: these three appear verbatim in the video, in the live pitch and in the Devfolio text. Do not paraphrase them.

## The one number (business case)

> **Target: about EUR 5 per verified store check, charged only when it passes.** Agency or mystery-shopping visits: [SOURCE NEEDED] EUR per visit, booked days ahead, paid regardless of usable output.

Working figures (all hypotheses until sourced; do not show a number on screen that is not marked as an estimate):

| Item | Value | Status |
|---|---|---|
| Shelfie price to the brand per verified check | EUR 5 (illustrative) | Our assumption; justify by cost build-up below |
| Payout to the person per passed check | EUR 2.50-3.00 | Our assumption; check against local minimum-wage-equivalent time (a check takes ~5-10 min incl. walking) |
| Verifier cost per check (vision model + x402 fee) | well under EUR 0.10 | Estimate from model pricing; measure during the build |
| Network/escrow fee | Masumi network fee about 5% of price | Secondary source in `../investigacion/cardano/competitive-landscape.md`; verify |
| Failed checks | not paid; task reopened | Design fact |
| Agency / mystery-shopper per visit | [SOURCE NEEDED] | See below |

Where to find the comparison figures:

- Public price lists or blog posts of German mystery-shopping and merchandising providers (search "Mystery Shopping Kosten pro Besuch", "Merchandising Außendienst Preis pro Besuch", "Regalpflege Kosten"). Take 2 sources, quote ranges, name them.
- Gig-style competitor price points: Streetspotr / app-based crowd audit providers publish or quote per-task rewards and customer prices; their pricing pages or case studies are the closest benchmark. [SOURCE NEEDED, verify they exist and are active]
- Freelance field-marketing day rates from German job boards or agency rate cards (per-visit price = day rate / visits per day).
- Retail-execution market-size or "out-of-stock" loss figures from industry studies (e.g. ECR / retail-research reports) for the "why it matters" line. [SOURCE NEEDED]
- Fallback if nothing is found by the deadline: show the cost build-up of Shelfie only, and say "agency pricing is typically per visit and booked in advance" without a number.

Units, kept apart on purpose: the EUR figures above are **illustrative product pricing** for the pitch, not what the demo moves. The preprod test amounts are tADA with no market value: verifier fee 1 tADA per check, worker payout 3 tADA per passed task (`diseno/contracts.md`), and the escrowed job fee is a Masumi/Sokosumi quote (about 1 test USDM, verify Friday). Never put a tADA amount next to a EUR amount as if they were equivalent. The verifier cost "well under EUR 0.10" is an estimate of real model cost, not the 1 tADA x402 floor.

Terminology: the **three payment gates** (photo gate pays the human, job gate settles the escrow, fallback refunds) are not the verifier's internal checks G1-G7 in `diseno/verifier-rules.md`; the photo gate is made of those checks.

One-sentence version for the video: "A verified check costs about five euros and you pay only for checks that pass."

## Positioning line

"Shelfie is retail-execution proof for small brands: the speed of an app, the audit trail of an escrow, and a payment that only happens when the evidence checks out."

Against the field (from the competitive scan): most teams will ship a research/summary agent with a pay button; Shelfie ships an agent that buys evidence from the physical world, with a deterministic gate, an on-chain payout and a refund path.

## Name and tagline options

Keep **Shelfie**. It is short, visual, pun lands in English and German, and the product literally is a shelf selfie. Only change if the domain/handle is taken or a judge reads it as a selfie app.

| Option | Verdict |
|---|---|
| **Shelfie** | Keep. |
| Shelfie Verify | Acceptable subtitle if "Shelfie" alone is too playful for a business jury. |
| ShelfProof | Clearer on "proof", but less memorable. Backup. |
| Ground Truth | Strong concept name, generic and already used widely. Use only as a phrase in the vision beat. |

Taglines (pick one, use it everywhere; full list by audience, German versions and the recommendation in [slogans.md](slogans.md)):

1. **"Paid only when the photo is true."** (recommended, equals phrase 1)
2. "Eyes on the shelf, paid on proof."
3. "Agents that hire eyes."
4. "Don't trust the report. Trust the shelf."

## Tone rules

- Neutral, concrete, no hype words ("revolutionary", "disrupt"). Numbers marked as estimates.
- Always say what is real (preprod, our own printed price tags, teammates as shoppers) and what is roadmap (mainnet, location proof, onboarding of strangers).
- Say "preprod" out loud at least once; the Foundation judges will check.
