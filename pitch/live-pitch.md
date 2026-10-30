# Live judging script

Assumption (not confirmed by the organisers): each partner track gets a 3-minute pitch plus 2-3 minutes of Q&A at the team's table or stage, inside the live-judging window. Confirm the format at the opening and adjust. If only 2 minutes are given, use the 2-minute version below.

Challenge: the hand sign of ADR-19 (`../diseno/decisions.md`), default `CHALLENGE_MODE=gesture`. If the ADR-19 kill criteria trigger before Saturday, the engine runs `card-pool` and the code-card lines at the end of this file replace the hand-sign lines.

## Roles

| Role | Speaker | Job |
|---|---|---|
| A | Isabel: storyteller and field shopper | Tells the real request (her own story), holds the phone and the printed tag, performs the cheat and the photo with the hand sign, says the callback; answers architecture and scale questions |
| C | Lorenz: pitch lead and verifier narrator | Product sentence, verifier narration, business and limits; answers verifier, fraud and security questions |
| B | Fernando: operator | Drives the laptop (Sokosumi, escrow, explorer), one line each on the lock and the payout tx; answers Cardano and payment questions |
| D | Helmut: backup and time | Timekeeper, backup laptop and video, holds the cheat screen, hands over props; answers business, UX and privacy questions |

Two main voices (Isabel, Lorenz); handoffs eat time. Letters are the build roles of `../diseno/repo-layout.md` section 2, so each person speaks about what they built. Everyone knows the whole script. If a judge asks the "wrong" person, that person answers and the others add.

## Setup before the table is called

- [ ] Homepage open in tab 1 at the top (section 1), served from the offline copy if the network is weak.
- [ ] Laptop on power; second tab strips: Sokosumi, dashboard job page (verdict rows), preprod.cardanoscan.io (verifier fee address and payout address pre-opened), terminal with ledger.
- [ ] A fresh job pre-created but not started; one earlier completed job open in a tab (escrow settled) and one earlier refunded job open in a tab.
- [ ] Phone with the web app logged in, brightness max, do-not-disturb on, screen recording running as insurance. Camera permission already granted (no prompt on stage).
- [ ] Printed price tag with a known product. For the cheat: an old photo of the same tag full-screen on the backup laptop or a tablet (Helmut holds it); there is no gallery path in the app.
- [ ] Fallback props only for `card-pool` mode: the printed challenge-code cards.
- [ ] Offline backup: a USB stick/phone with the video, screenshots of each step, and a text file with tx hashes.
- [ ] Hotspot ready as a backup network. Preprod wallet balances checked (tADA in `W-VBUY` for verifier fees and in `W-PAY` for payouts).
- [ ] Browser zoom 125%; notifications off; no secret in any visible tab.

## Run of show (3:00 slot, planned to 2:45)

| Time | Speaker | Says / does | Screen |
|---|---|---|---|
| 0:00-0:27 | Isabel | "A friend of my father's wants to bring a drink to Germany. He asked Helmut and me to photograph his competitors in a few shops: the price, and is it on the shelf. He can't check our photos, and an AI can't see a shelf. So we built an agent that hires a person, and pays only if the photo is true." No "hello, we are team Shelfie" before it. | Homepage 1: their real shelf photo |
| 0:27-0:35 | Lorenz | "Shelfie. Paid only when the photo is true. For brands entering a market without a field team." | Homepage 2: name and tagline |
| 0:35-0:52 | Fernando | "His question as a Sokosumi job: one drink, one Munich store. The fee sits in escrow on Cardano preprod; this lock is from an earlier run. Photo, check and payout are live." | Homepage 3: four steps, then Sokosumi job and lock tx |
| 0:52-1:15 | Isabel, Lorenz | Isabel claims the task and opens the camera (a hand sign appears), aims it at the old photo on Helmut's screen, no fingers, and shoots. While it runs, Lorenz: "The verifier is a separate service, paid per check over x402. Today we run it; an independent one is just another URL." On the verdict: "Red. No money moves." (read the reason on screen: screen photo or sign missing) | Verifier red |
| 1:15-1:45 | Isabel, Lorenz | Isabel: "This is what I did by hand for him." She claims again; the camera shows a new sign. She shows the phone for one second, holds the fingers next to the tag and shoots. Lorenz: "The sign appears only when the camera opens; she has ninety seconds. An old photo can't show a sign that didn't exist. It reads product, price and sign. Green." | Hand-sign photo, verifier green |
| 1:45-2:00 | Fernando | "Two transactions on preprod: the verifier's fee, and her payout. Here is the hash." Hash in the app first, then the explorer tab (refresh once). | App payout row, then explorer |
| 2:00-2:17 | Lorenz | "The photo passed, so the report is delivered and escrow settles; if no photo passes, the brand is refunded. Here from earlier escrow test runs. Lock, fee, payout, settle or refund: every step is a public receipt on Cardano." | Homepage 4: receipts; settled and refunded tabs |
| 2:17-2:35 | Lorenz | "One test purchase costs fifty euros; a Shelfie check, about twelve. Today: one shelf, preprod, one real request, no brand interviews yet. The sign stops stale photos, not the wrong shop; store QR codes are next." | Homepage 5: today / next |
| 2:35-2:45 | Isabel | "Next time he doesn't call us. He posts a job. Cardano escrow makes sure nobody pays for a photo that isn't true." | Homepage 6: close |

About 285 spoken words: about 1:58 at 145 words per minute, about 2:12 at 130 (stage pace). Each verifier run takes 12-15 s (vision model `gemini-3.5-flash-lite`: mean 8.5 s, p95 13.2 s, `../codigo/docs/verified.md`, plus the x402 payment). With two runs, two shots, tab switches and the explorer, about 2:55; almost no slack in a 3:00 slot, so Lorenz's filler line is planned for every run and the cuts below start at the first delay. The tagline appears three times (hook, 0:27, close). Decisions behind this version: [../review/pitch-jury-2026-10-30.md](../review/pitch-jury-2026-10-30.md).

Optional market sentence, only if the timer shows 2:00 or earlier at the receipts beat: "Brands spend six billion dollars a year on in-store merchandising." It goes first in the 2:17 beat (about 5 s).

Checked (2026-10-30): the x402 verifier fee is its own preprod tx (W-VBUY -> W-SELL, M1 rows in `../codigo/docs/evidence/tx-hashes.md`); the engine logs its hash as `VERIFY_PAID`. W-VBUY must be funded before the pitch, or every live check fails.

Honest label for the escrow receipts: the settlement on record so far is from the Masumi starter agent (Task `01a18c5e...`), the refund from a bridge run with the engine on fakes (no photo); neither is a Shelfie job with a verified photo. Replace the settle tab with the ADR-20 Task settlement once it is logged (A); until then say "escrow test runs", never "this job".

Why the cheat comes first: fail, then pass, then pay is a stronger arc than green first, and the red step costs nothing if the network is slow. The cheat uses one claim (a claim takes one verified photo; the task reopens on a fail), so the true photo needs a second claim with a new sign. That leaves one of the three attempts (`MAX_ATTEMPTS`) as a spare. The engine waits 5 s after a claim before it accepts a photo (`minSecondsAfterClaim`); Isabel's line covers it.

Why no fingers in the cheat: the red verdict then does not depend on the screen check (G8 fails open when the model omits the flag); it fails on `screen_recapture` or on the missing sign. Lorenz reads whichever reason the screen shows.

While the verifier runs (12-15 s): Lorenz fills with "It checks product, price, sign and time window", then "Green". If behind at 1:45, Fernando shows only the payout hash; if still behind at 2:17, drop "One test purchase ... about twelve".

2-minute version: drop Fernando's lock beat (Lorenz adds "The fee is locked in escrow on Cardano" inside the 2:00 beat), drop the x402 line during the cheat, drop the price sentence at 2:17.

If a judge wants to participate: Isabel hands the phone to the judge for the true photo (1:15); the judge shows the fingers. Offer it only when ahead of time and the network is behaving.

## Demo choreography detail

1. **Escrow (B):** show the pre-started job. Do not wait for settlement on stage; the cycle takes 30-45 minutes (measured: refund 32 min, settlement 46 min after the payment request). Say so: "this lock is from an earlier run", and click the settled job.
2. **Cheat (A, C, D):** A claims the task and opens the camera; the sign is revealed and the 90 s window starts. A points the camera at the old photo on Helmut's screen, shows no fingers, and shoots. The phone shows the red verdict card; its message names the first failed check, here the missing hand sign ("No hand with raised fingers..."), since the hand check comes before the screen check. No payout row appears; the dashboard verdict row lists the failed checks (`code_match`, plus `not_screen` if the model flagged the screen). The app has no upload path (ADR-17); if asked, say the live camera can be aimed at anything and the late sign plus the 90 s window, not the camera, is the defence (Q&A, not on stage).
3. **Hand-sign photo (A):** A claims the task again; the camera reveals a new sign (2-5 fingers, left or right of the tag). A shows the phone screen to the judges for one second, then holds the fingers on the named side of the tag and shoots within 90 s. Tag and hand must both be in frame.
4. **Verifier (C):** the phone shows the green verdict card with the price it read and the payout state; the dashboard job page adds a PASS verdict row. There is no per-check view and no highlight on the photo (not built); C reads only price and "Green".
5. **Fee and payout (B):** the payout row with its hash in the app first, then the x402 fee tx and the payout tx on the explorer. A fresh payout may need one refresh (preprod blocks about every 20 s); if it is not indexed yet, keep the app hash on screen and say "the explorer catches up in a few seconds".
6. **Result (C):** homepage section 4 (receipts), then the settled and the refunded job tabs, each labelled "earlier escrow test run" (see the honest-label note above).

Screen tooling: one Chrome window, tab 1 the homepage (scroll only, one Page Down per section, never clicked; [homepage-brief.md](homepage-brief.md)), then the demo tabs in order (Sokosumi, verifier, explorer, report) switched with `Ctrl+1..9`; no OBS scenes live. Details: [pitch-plan.md](pitch-plan.md) section 6.

## Backup plan for each demo step

| Step | Failure | Backup |
|---|---|---|
| Escrow job start | Sokosumi down or slow | Open the earlier completed job; show recorded lock clip |
| Lock tx | Explorer slow | Pre-loaded tab; screenshot of the lock tx in the backup deck (`slides/shelfie.pdf`) |
| Phone shoot | Camera/permission/network failure | Second phone (A) with the same page; or use the flagged admin test upload with a pre-shot photo of the correct tag and sign (off in evidence runs; state this honestly) |
| Hand sign | "Loading your hand sign..." does not end | Close and reopen the camera (the reveal is idempotent, same sign, same window); if still failing, release and claim again |
| Hand sign | Verifier misreads the fingers (`gesture_mismatch`, `gesture_low_confidence`) | Claim again (last spare attempt), fingers spread, hand flat against a plain background; then the override below |
| Verifier | Vision model slow or misreads | Turn on the admin-only manual override (off by default, red "DEMO OVERRIDE" badge, ledger entry) and say what it is; or play the 20-second verifier clip |
| x402 payment | Facilitator or network error | Show the ledger of earlier x402 payments with tx hashes; play the clip |
| Payout tx | Not confirmed in time | Show the hash in the app; then the previous payout tx from the earlier run; explain the preprod block time |
| Cheat | Verifier passes the screen photo | Cannot pass without the sign; if it does, say so plainly ("the sign check is model-based, here it missed") and move on |
| Whole demo | Venue network down | Hotspot; then the 2:20 video with live commentary; then the homepage offline copy and the backup deck |
| Refund | No refund yet | Open the earlier refunded job or its recording |

Rule: never present a recording or a pre-existing transaction as if it was live. Say "this is from an earlier run" every time.

## Q&A plan (2-3 minutes)

- Take the first question in one sentence, then redirect to the relevant speaker if needed.
- If asked what is not built: say plainly (preprod only, location proof is roadmap, we use teammates as shoppers, one real request but no brand interviews yet).
- If asked about traction: "one real request, which inspired the product"; never "customer" or "pilot".
- If asked about the hand sign: 8 combinations, so a blind guess passes the sign check 1 time in 8; the late reveal, the 90 s window, single use, the other gates and location still apply (ADR-19).
- Use `qa-prep.md`; the top five to rehearse: fraud/GPS spoofing, why blockchain, why Cardano instead of Stripe, custody/who holds the money, what was built in 30 hours.

## Timing marks (Helmut, phone timer)

0:27, 0:35, 0:52, 1:15, 1:45, 2:00, 2:17, 2:35, 2:45. Ahead at 2:00: add the market sentence. Ahead at 1:15: offer the judge the phone. Behind at 1:45: payout hash only. Behind at 2:17: drop the price sentence.

## Card-pool fallback lines

Only if the engine runs `CHALLENGE_MODE=card-pool` (ADR-19 kill criteria). Setup: printed code cards next to the tag.
- 0:52 cheat: Isabel claims, opens the camera, aims at the old photo, shoots. Lorenz on the verdict: "Same tag, old photo, no code. Red. No money moves."
- 1:15 true photo: Isabel claims again, shows the code for a second, holds the matching card next to the tag and shoots. Lorenz: "The code proves this photo is new, made for this task. It reads product, price and code. Green."
- 2:17: "The code stops stale photos, not the wrong shop."

## Multiple tracks

If the project is also entered in another track, the same demo is reused with a different last 30 seconds; this document covers Cardano only. Check the timetable so that two tracks are not scheduled at the same time.
