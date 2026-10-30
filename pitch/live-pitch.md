# Live judging script

Assumption (not confirmed by the organisers): each partner track gets a 3-minute pitch plus 2-3 minutes of Q&A at the team's table or stage, inside the live-judging window. Confirm the format at the opening and adjust. If only 2 minutes are given, drop the "vision" paragraph and shorten the cheat attempt.

## Roles

| Role | Speaker | Job |
|---|---|---|
| A | Isabel: storyteller and field shopper | Tells the real request (her own story), holds the phone, the printed tag and the code card, performs the cheat and the photo, says the callback; answers architecture and scale questions |
| C | Lorenz: pitch lead and verifier narrator | Product sentence, verifier narration, business and market, vision; answers verifier, fraud and security questions |
| B | Fernando: operator | Drives the laptop (Sokosumi, escrow, explorer), one line each on the lock and the payout tx; answers Cardano and payment questions |
| D | Helmut: backup and time | Timekeeper, backup laptop and video, hands over props; answers business, UX and privacy questions |

Two main voices (Isabel, Lorenz); handoffs eat time. Letters are the build roles of `../diseno/repo-layout.md` section 2, so each person speaks about what they built. Everyone knows the whole script. If a judge asks the "wrong" person, that person answers and the others add.

## Setup before the table is called

- [ ] Laptop on power; second tab strips: Sokosumi, verifier view, preprod.cardanoscan.io (payout address pre-opened), terminal with ledger.
- [ ] A fresh job pre-created but not started; one earlier completed job open in a tab (escrow settled) and one earlier refunded job open in a tab.
- [ ] Phone with the web app logged in, brightness max, do-not-disturb on, screen recording running as insurance.
- [ ] Printed price tag with a known product, the printed challenge-code cards (card-pool mode) and paper plus marker (handwritten mode), an old printed photo of the same tag (or the old photo open on the laptop screen) to aim the live camera at, for the cheat; there is no gallery path in the app.
- [ ] Offline backup: a USB stick/phone with the video, screenshots of each step, and a text file with tx hashes.
- [ ] Hotspot ready as a backup network. Preprod wallet balances checked (tADA in `W-VBUY` for verifier fees and in `W-PAY` for payouts).
- [ ] Browser zoom 125%; notifications off; no secret in any visible tab.

## Run of show (3:00 pitch)

| Time | Speaker | Says / does | Screen |
|---|---|---|---|
| 0:00-0:28 | Isabel | "A friend of my father's wants to bring a drink to Germany. He asked Helmut and me to photograph his competitors in a few shops: the price, and is it on the shelf. He can't check our photos. An AI can write a report, but it can't see a shelf. So we built an agent that hires a person, and pays only if the photo is true." No "hello, we are team Shelfie" before it. | Slide 1: their real shelf photo |
| 0:28-0:36 | Lorenz | "Shelfie. Paid only when the photo is true. For brands entering a market without a field team." | Slide 2: four-step flow |
| 0:36-0:55 | Fernando | "His question, as a job on Sokosumi: one drink, one Munich store. The fee is locked in escrow on Cardano preprod. This lock is from an earlier run; escrow takes about an hour. Photo, check and payout are live." | Slide 3, then Sokosumi job and lock tx |
| 0:55-1:10 | Isabel, Lorenz | Isabel aims the live camera at an old photo of the tag and shoots. Lorenz: "Same tag, old photo, no code. Red. No money moves." | Verifier red |
| 1:10-1:45 | Isabel, Lorenz | Isabel: "This is what I did by hand for him." She claims the task, shows the one-time code for a second, holds the code card next to the tag and shoots. Lorenz: "The code proves this photo is new, made for this task. The verifier is a separate service, paid per check over x402. Today we run it; the brand can swap its URL. It reads product, price and code. Green." | Code photo, verifier green |
| 1:45-2:00 | Fernando | "Two transactions, live on preprod: the verifier's fee, and her payout. Here is the hash." Zoom on the payout hash. | Explorer: x402 fee tx, then payout tx |
| 2:00-2:18 | Lorenz | "The photo passed, so the report is delivered and escrow settles; if it fails, the brand is refunded. Earlier runs, here. Lock, fee, payout, settle or refund: every step is a public receipt on Cardano." | Slide 4: receipts; settled and refunded tabs |
| 2:18-2:40 | Lorenz | "Brands spend six billion dollars a year on in-store merchandising; one test purchase costs fifty euros. A Shelfie check: about twelve. Today: one shelf, preprod, one real request, no brand interviews yet. The code stops stale photos, not the wrong shop; store QR codes are next." | Slide 5: today / next |
| 2:40-2:50 | Isabel | "Next time he doesn't call us. He posts a job. Cardano escrow makes sure nobody pays for a photo that isn't true." | Slide 6: close |

298 spoken words: about 2:05 at 145 words per minute, about 2:50 with the demo; 10 s of slack. The tagline appears three times (hook, 0:28, close). Decisions behind this version: [../review/pitch-jury-2026-10-30.md](../review/pitch-jury-2026-10-30.md).

Verify before Saturday (B): the x402 verifier fee shows as its own preprod tx on the explorer. If not, Fernando says "The verifier's fee is logged; her payout is live on preprod" and slide 4 marks the fee row "logged".

Why the cheat comes first: fail, then pass, then pay is a stronger arc than green first, and the red step costs nothing if the network is slow.

If the verifier takes more than 10 s: Lorenz says "It reads product, price and code" while it runs, then "Green". If behind at 1:45, drop the market sentence at 2:18.

2-minute version: Fernando's lock beat becomes one sentence inside the 2:00 beat; drop the market sentence.

If a judge wants to participate: Isabel hands the phone and the card to the judge for the true photo (1:10). Offer it only when ahead of time and the network is behaving.

## Demo choreography detail

1. **Escrow (B):** show the pre-started job. Do not wait for settlement on stage; the cycle can exceed 60 minutes. Say so: "escrow runs for about an hour, so this one finished earlier", and click the settled job.
2. **Cheat (A, C):** point the live camera at the old photo (printout or laptop screen) and shoot. Verifier shows red with "code missing"; the payout counter stays unchanged and the verification fee is still shown as spend. The app has no upload path (ADR-17); if asked, say the live camera can be aimed at anything and the code, not the camera, is the defence (Q&A, not on stage).
3. **Challenge-code photo (A):** the code (card number in card-pool mode) appears on the phone only after A claims the task. A shows the screen to the judges for one second, then puts the matching printed card (or the code written on paper) next to the tag; the phone that takes the photo cannot show its own screen. Both code and tag must be in frame.
4. **Verifier (C):** the verifier page highlights the extracted price and product, then each check turns green; C reads only the code and the price.
5. **Fee and payout (B):** show the x402 fee tx, then the payout tx hash, amount, status. Zoom in on the payout.
6. **Result (C):** slide 4 (receipts), then the settled and the refunded job tabs, each labelled "earlier run".

Screen tooling: slides in `pdfpc` on one workspace, one Chrome window with the demo tabs in order (Sokosumi, verifier, explorer, report) switched with `Ctrl+1..9`; no OBS scenes live. Details: [pitch-plan.md](pitch-plan.md) section 6.

## Backup plan for each demo step

| Step | Failure | Backup |
|---|---|---|
| Escrow job start | Sokosumi down or slow | Open the earlier completed job; show recorded lock clip |
| Lock tx | Explorer slow | Pre-loaded tab; screenshot of the lock tx in the slide deck |
| Phone shoot | Camera/permission/network failure | Second phone (A) with the same page; or use the flagged admin test upload with a pre-shot photo of the correct tag and a code already issued (off in evidence runs; state this honestly) |
| Challenge code | Page does not show code | Reload; if still failing, use the backup task link with a pre-issued code |
| Verifier | Vision model slow or misreads | Turn on the admin-only manual override (off by default, red "DEMO OVERRIDE" badge, ledger entry) and say what it is; or play the 20-second verifier clip |
| x402 payment | Facilitator or network error | Show the ledger of earlier x402 payments with tx hashes; play the clip |
| Payout tx | Not confirmed in time | Show the previous payout tx from the earlier run; explain the preprod block time |
| Cheat | Old photo not readable by the camera | Have the cheat image on the laptop screen and a printout; or shoot the real tag with a wrong code; or play the clip |
| Whole demo | Venue network down | Hotspot; then the 2:20 video with live commentary; then the screenshots deck |
| Refund | No refund yet | Open the earlier refunded job or its recording |

Rule: never present a recording or a pre-existing transaction as if it was live. Say "this is from an earlier run" every time.

## Q&A plan (2-3 minutes)

- Take the first question in one sentence, then redirect to the relevant speaker if needed.
- If asked what is not built: say plainly (preprod only, location proof is roadmap, we use teammates as shoppers, one real request but no brand interviews yet).
- If asked about traction: "one real request, which inspired the product"; never "customer" or "pilot".
- Use `qa-prep.md`; the top five to rehearse: fraud/GPS spoofing, why blockchain, why Cardano instead of Stripe, custody/who holds the money, what was built in 30 hours.

## Timing marks (Helmut, phone timer)

0:28, 0:36, 0:55, 1:10, 1:45, 2:00, 2:18, 2:40, 2:50. If behind at 1:45, drop the market sentence; if ahead at 1:10, offer the judge the phone.


## Multiple tracks

If the project is also entered in another track, the same demo is reused with a different last 30 seconds; this document covers Cardano only. Check the timetable so that two tracks are not scheduled at the same time.
