# Live judging script

Assumption (not confirmed by the organisers): each partner track gets a 3-minute pitch plus 2-3 minutes of Q&A at the team's table or stage, inside the live-judging window. Confirm the format at the opening and adjust. If only 2 minutes are given, drop the "vision" paragraph and shorten the cheat attempt.

## Roles

| Role | Speaker | Job |
|---|---|---|
| D | Storyteller / pitch lead | Hook, persona, business case, close; answers business, vision, UX and privacy questions |
| B | Operator | Drives the laptop: Sokosumi, escrow, explorer; answers Cardano and payment questions |
| A | Field shopper | Holds the phone and the printed price tag or code card, performs the photo and the cheat; one spoken line; also answers architecture and scale questions; holds the backup device |
| C | Verifier narrator | Narrates the verifier screen; answers verifier, fraud and security questions |

These are stage roles. Letters are the same build roles as `../diseno/repo-layout.md` section 2 (A shell and engine, B payments, C verifier, D web, evidence and pitch), so each person speaks about what they built. Everyone knows the whole script. Q&A: D takes business, vision, UX and privacy, B takes Cardano and payments, C takes verifier, fraud and security, A takes architecture and scale.

## Setup before the table is called

- [ ] Laptop on power; second tab strips: Sokosumi, verifier view, preprod.cardanoscan.io (payout address pre-opened), terminal with ledger.
- [ ] A fresh job pre-created but not started; one earlier completed job open in a tab (escrow settled) and one earlier refunded job open in a tab.
- [ ] Phone with the web app logged in, brightness max, do-not-disturb on, screen recording running as insurance.
- [ ] Printed price tag with a known product, the printed challenge-code cards (card-pool mode) and paper plus marker (handwritten mode), an old printed photo of the same tag (or the old photo open on the laptop screen) to aim the live camera at, for the cheat; there is no gallery path in the app.
- [ ] Offline backup: a USB stick/phone with the video, screenshots of each step, and a text file with tx hashes.
- [ ] Hotspot ready as a backup network. Preprod wallet balances checked (tADA in `W-VBUY` for verifier fees and in `W-PAY` for payouts).
- [ ] Browser zoom 125%; notifications off; no secret in any visible tab.

## Run of show (3:00 pitch)

| Time | Speaker | Says / does | Demo step |
|---|---|---|---|
| 0:00-0:20 | D | "An AI can write a report about a shelf. It cannot see the shelf. This is Katharina; she sells craft lemonade in Bavaria and needs to know whether her bottle is on the shelf in this Munich store today. Agencies take days and bill her even when the photo is useless." | Slide 1: persona + shelf |
| 0:20-0:40 | D | "Shelfie: paid only when the photo is true. Three payment gates: the photo gate decides if each photo is real and pays the person, the job gate settles the escrow when the photo passes (one store, one photo), and otherwise the brand gets an automatic refund." | Slide 2: three gates |
| 0:40-1:05 | B | "She hires our lead agent on Sokosumi. The fee is locked in Masumi escrow on preprod. Here is the lock transaction from a run we started before coming up." | Demo 1: Sokosumi job, lock tx on explorer |
| 1:05-1:45 | A + C | A: "I am a person near the shop. I claim the task and the page gives me a one-time code; here it is on a printed card." C: "The photo must contain the price tag and this code. It proves the photo is new and made for this task, not where it was taken." A shoots with the tag and the card in frame. | Demo 2: challenge-code photo |
| 1:45-2:10 | C then B | C: "Our lead agent pays the verifier per check over x402. It reads product and price, matches the code, the time window. Green." B: "And the person is paid now. Here is the payout transaction." Click through to the explorer. | Demo 3: verifier green, payout tx |
| 2:10-2:30 | A then C | A: aims the live camera at the old photo and shoots. C: "Same tag, old photo, no valid code. No payment." | Demo 4: cheat attempt, red |
| 2:30-2:50 | D | "If the photo passes, the brand gets the report and the escrow settles; otherwise it is refunded. Illustrative pricing: about five euros per verified check, and only passing checks are paid. Agency visits cost [SOURCE NEEDED] and are paid regardless." | Slide 3: report + refund tab, one number |
| 2:50-3:00 | D | "Shelfie: agents hire people to look, and the blockchain pays the bill. Preprod today; store QR codes and other proof-of-real-world tasks next." | Slide 4: close |

If a judge wants to participate: A hands the phone and the card to the judge for demo steps 2-4. This is the best moment; only offer it when time allows and the network is behaving.

## Demo choreography detail

1. **Escrow (B):** show the pre-started job. Do not wait for settlement on stage; the cycle can exceed 60 minutes. Say so: "escrow runs for about an hour, so this one finished earlier", and click the settled job.
2. **Challenge-code photo (A):** the code (card number in card-pool mode) appears on the phone only after A claims the task. A shows the screen to the judges for one second, then puts the matching printed card (or the code written on paper) next to the tag; the phone that takes the photo cannot show its own screen. Both code and tag must be in frame.
3. **Verifier (C):** the verifier page highlights the extracted price and product, then each check turns green; C reads only the code and the price.
4. **Payout (B):** show the payout tx hash, amount, status. Zoom in.
5. **Cheat (A/C):** point the live camera at the old photo (printout or laptop screen) and shoot; the app has no upload path (ADR-17), so say plainly that the live camera can be aimed at anything and that the code, not the camera, is the defence. Verifier shows red with "code missing". Payout counter stays unchanged, and the verification fee is still shown as spend.
6. **Close (D):** switch to the report and the refund tab.

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
- If asked what is not built: say plainly (preprod only, location proof is roadmap, we use teammates as shoppers).
- Use `qa-prep.md`; the top five to rehearse: fraud/GPS spoofing, why blockchain, why Cardano instead of Stripe, custody/who holds the money, what was built in 30 hours.

## Timing marks (for the timekeeper, a fifth person or a phone)

0:20, 0:40, 1:05, 1:45, 2:10, 2:30, 2:50, 3:00. If behind at 1:45, skip the escrow detail in the 2:30 section; if ahead, offer the judge the phone.

## Multiple tracks

If the project is also entered in another track, the same demo is reused with a different last 30 seconds; this document covers Cardano only. Check the timetable so that two tracks are not scheduled at the same time.
