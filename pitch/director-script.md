# Director's script: live pitch (3:00)

The stage script, scene by scene. Each scene says **who speaks, the exact words, what the hands do and what the screen shows**. Learn your own lines word for word; know everyone else's cues. Setup, backups and Q&A: [live-pitch.md](live-pitch.md).

Why this version (2026-10-31): in the real supermarket test the verifier took **about one minute** per photo (not 12-15 s). Part of that is waiting for the verifier's fee to be confirmed on Cardano before it answers (`codigo/docs/verified.md`, M1 row). So: **one live photo only**, and the team explains the system while the verifier works. The cheat is shown as a screenshot from the morning test, not live (a second live check would cost another minute).

## Cast

| Who | Role on stage | Holds |
|---|---|---|
| **Isabel** | The person in the store; opens and closes | Phone (web app logged in), printed price tag |
| **Lorenz** | Explains product, verifier, price | Nothing; stands next to the screen |
| **Fernando** | Drives the laptop and talks money and Cardano | Laptop keyboard |
| **Helmut** | Timekeeper (phone timer), backup | Backup phone, USB stick with the recordings |

## Laptop tabs (Fernando)

| Key | Tab |
|---|---|
| `Ctrl+1` | Story page, one key press down ("real request" beat), page clicked once for focus |
| `Ctrl+2` | Sokosumi: the job opened before the pitch, lock tx visible |
| `Ctrl+3` | Dashboard: job page with the verdict rows and payout row |
| `Ctrl+4` | preprod.cardanoscan.io: Isabel's payout address |
| `Ctrl+5` | Screenshot of the red verdict from the morning test (cheat) |

On the story page: Page Down (or the clicker) moves exactly one beat or section; `End` jumps to the close.

## Props checklist (Helmut, 10 minutes before)

- [ ] Fresh job created and open for claims; Isabel's phone shows it in the list.
- [ ] Printed price tag of the job's product in Isabel's hand.
- [ ] Red-verdict screenshot of the cheat (morning test) in tab 5.
- [ ] Recording of a full green run (morning test) on the USB stick and the backup phone.
- [ ] W-VBUY (verifier fees) and W-PAY (payouts) funded (Fernando, `fund-check`).
- [ ] Timer ready; the four of us know the stretch lines in scene 5.

---

## Scene 1: The request (0:00-0:25)

**Screen:** story page, "It started with a real request".

**ISABEL** (to the jury, no "Hello, we are..."):
> "A friend of my father wants to bring a new drink to Germany. He asked me: can you check the competition in a few shops? What does it cost, and is it really on the shelf? He lives abroad. He can't check my photos. And no AI can walk into a supermarket."

**FERNANDO:** on "no AI can walk", one key: "An agent that hires a person to look."

## Scene 2: The idea (0:25-0:40)

**LORENZ:**
> "So we built Shelfie. A person takes the photo, a second agent checks it, and the money moves only if the photo is true."

**FERNANDO:** on "the money moves", one key: "Nobody pays for a photo that isn't true."

**LORENZ:**
> "Shelfie. Paid only when the photo is true."

## Scene 3: The job (0:40-0:55)

**FERNANDO:** one key (How it works), then `Ctrl+2` (Sokosumi).
> "His request as a job on Sokosumi: one product, one store in Munich. The fee is locked in escrow on Cardano. This lock is from before the pitch, because escrow takes half an hour."

**FERNANDO:** `Ctrl+3` (dashboard job page).

## Scene 4: The photo (0:55-1:10)

**ISABEL** (phone in one hand, tag in the other; she talks while she acts):
> "I'm the person in the store. I take the job."

*Taps Claim. Taps Open camera. The hand sign appears.*

> "Only now, when the camera opens, the app gives me a hand sign. Here: [reads the real sign, e.g. 'three fingers, left of the tag']."

*Shows the phone screen to the jury for one second. Holds the fingers next to the tag, both in frame. Shoots.*

> "Sent."

Notes: she has 90 seconds from the camera opening. The engine accepts a photo only 5 s after the claim; her lines cover that.

## Scene 5: While the verifier works (1:10 to green, planned 60 s)

The phone and the dashboard show "checking". Nobody looks at the phone in silence: the three blocks below run in this order.

**W1, LORENZ** (about 25 s; screen: dashboard):
> "Now the verifier works. It is a separate agent, and our engine pays it for every single check, over x402 on Cardano. A vision model reads the photo, but fixed rules decide. Is the hand sign right? Is it the right product? Can it read a price? Is it inside the time window? And is it not a photo of a screen?"

**W2, FERNANDO** (about 20 s; `Ctrl+1`, one key: "Already running"):
> "Every step of this is a public transaction on Cardano's test network: the escrow lock, the verifier's fee, the payout to the worker, and at the end the settlement, or the refund. These five are from our earlier test runs."

**W3, LORENZ** (about 15 s; `Ctrl+5`, red-verdict screenshot):
> "And if someone cheats? This morning we photographed an old photo of the same shelf. No hand sign, so: red. No money moved. An old photo can't show a sign that didn't exist yet."

**FERNANDO:** `Ctrl+3` (dashboard) after W3.

**Stretch lines**, only if it is still checking, in this order, one at a time:
- **S1, LORENZ:** "Every job gets a new sign, and the person has ninety seconds. So you can't prepare the photo in advance."
- **S2, FERNANDO:** "If no photo passes before the deadline, the result is withheld, and the brand gets the escrow back automatically."
- **S3, LORENZ:** "Today we run the verifier ourselves. An independent verifier is just another web address."
- **S4, ISABEL:** "For our friend, this is exactly the step he couldn't do from abroad."

**Rule for the green moment:** whoever is speaking finishes the sentence, then Isabel takes over (scene 6). Do not cut anyone mid-word.

## Scene 6: Green and paid (about 2:10-2:25)

**ISABEL** (raises the phone to the jury):
> "Green. It read the price: [reads the price on the card]."

**FERNANDO** (dashboard payout row, then `Ctrl+4` explorer, refresh once):
> "And I'm paid out. This is the payout transaction, here on the Cardano explorer."

If the explorer has not caught up: "The explorer catches up in a few seconds; here is the hash in the app." Stay on the dashboard.

## Scene 7: Price and honest limits (about 2:25-2:48)

**FERNANDO:** `Ctrl+1`, one key ("What one shelf check costs today").

**LORENZ:**
> "A test purchase through an agency starts at fifty euros. A Shelfie check: about twelve, and only if the photo passes. To be honest: this is the test network and one real request, and the sign proves the photo is new, not the shop. Store QR codes are next."

## Scene 8: Close (about 2:48-3:00)

**FERNANDO:** `End` ("Ready when you are").

**ISABEL:**
> "Next time, our friend doesn't call us. He posts a job. And nobody pays for a photo that isn't true."

---

## Time rules (Helmut watches the timer)

| Situation | What we do |
|---|---|
| Verifier green before 2:00 | Skip the stretch lines; at scene 7 Lorenz may add first: "Market research is a hundred-and-fifty-billion-dollar business, built for big budgets." |
| Still checking at 2:15 | Stretch lines S1-S4 |
| Green after 2:20 | Scene 7: Lorenz says only the price sentence, drops "To be honest..." (answer it in Q&A) |
| Still nothing at 2:35, or red / error | **LORENZ:** "The live check is still running; here is the same check from this morning." Helmut plays the green-run recording on the backup phone, Fernando shows its payout tx. Then scene 8. Never present the recording as live |

Helmut's time marks: 0:25, 0:40, 0:55, 1:10, (green), 2:25, 2:48, 3:00.

## Word count

About 385 spoken words without stretch lines. W1-W3 (about 145 words) run during the 60 s wait; the rest (about 240 words) takes about 1:50 at 130 words per minute. With the claim, the shot and the tab switches the pitch lands at about 2:55-3:00 with a 60 s verifier. Faster verifier: it ends earlier; slower: the stretch lines take the time and the time rules cut scene 7.

## Rehearsal plan

1. **Read-through** (seated, 10 min): everyone reads their lines aloud once, Helmut times.
2. **Walk-through with the screen** (15 min): Fernando does every key press and tab switch; the phone only pretends.
3. **Full run with a real job** (15 min each, twice): real claim, real photo, real verifier; note the verifier time each run.
4. **Failure drill** (5 min): Helmut calls "red" or "stuck" at 2:35; the team switches to the recording.
