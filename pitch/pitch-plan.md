# Pitch plan (live pitch, video, tools)

Synthesis of eight advisor passes (market, hook, judges, tools, skeptic, vision, video, delivery) on 2026-10-30. Owner: Lorenz. Once adopted, `storyline.md`, `live-pitch.md`, `video-script.md` and `slides/facts.tex` follow this file; until then they still describe the fictional persona.

## 1. Decisions

| Topic | Decision |
|---|---|
| Hook | The real request replaces the fictional persona (Katharina, Isarquell). Isabel tells it in first person. |
| Customer | "A brand entering a market without a field team: before launch it needs competitor prices and availability in specific stores." One verified photo per product per store. |
| Market | Big but defensible: one pain number (loss, not revenue), one TAM, a bottom-up example, a vision ladder marked "forecast". No summed markets, no unsourced Germany figure. |
| Arc of the demo | Cheat first (red, no money), then the true photo (green, payout tx). Fail, then pass, then pay. |
| Voices | Two main voices (Isabel, Lorenz), Fernando one line on the tx, Helmut runs backup and time. |
| Slides | Keep Beamer; max 5 visible slides; present with `pdfpc`. |
| Honesty | Say "live", "earlier run" or "mocked" for every step. State the limits before a judge does. |

## 2. The hook

Facts to confirm with Isabel before the pitch (her words, not ours): when the request came, how many stores and photos they actually did, how long it took, how many photos were usable. Use only real numbers.

Consent: ask the acquaintance (via Isabel's father) whether the story may be told in public. Never name the person, the drink, the brand or the country of origin. A message screenshot only as a reconstruction, fully redacted, labelled "reconstructed". No reply by Saturday morning: "an acquaintance of my father", no screenshot.

**English (spoken by Isabel, about 25 s):**
> "A friend of my father's wants to bring a drink to Germany. He asked Helmut and me: could you photograph the competitors in a few shops, what they cost and whether they are there? A real request. We said yes, then saw the problem: he is abroad, he cannot check our photos, and we would walk for hours. An AI can write him a report. It cannot see the shelf. So we built an agent that hires someone who can, and pays only if the photo is true."

**German (if the pitch is in German):**
> "Ein Bekannter meines Vaters will ein Getränk nach Deutschland bringen. Er hat Helmut und mich gefragt: Könnt ihr die Konkurrenz in ein paar Läden fotografieren, was sie kostet und ob sie da ist? Eine echte Anfrage. Wir haben zugesagt und dann das Problem gesehen: Er ist im Ausland, kann unsere Fotos nicht prüfen, und wir würden stundenlang laufen. Eine KI kann ihm einen Bericht schreiben. Sie sieht das Regal nicht. Also haben wir einen Agenten gebaut, der jemanden beauftragt und nur zahlt, wenn das Foto stimmt."

Behind her: one or two of their real shelf photos (brands blurred, no people), ideally one blurry or wrong-shelf photo ("he would have paid for this one too").

Thread through the pitch:
- Demo job = "the question he asked us": one competitor drink, one Munich store.
- Isabel during the photo: "This is what I did by hand for him."
- Close: "Next time he doesn't call us. He posts a job. Paid only when the photo is true."

Wording rules:
- Say "a real request", never "our customer", "pilot" or "validated".
- The product proves **price and presence**. Do not claim placement, facings, share of shelf or "market research".
- A study needs many data points; each job buys one; multi-store bundles are roadmap (ADR-16).
- **Check before Saturday (A, C):** the seeded product catalog (ADR-17) must contain the competitor drink used in the demo. If it cannot, say "the demo uses our catalog".

## 3. Run of show (3:00)

| Time | Who | Beat | Screen |
|---|---|---|---|
| 0:00-0:25 | Isabel | Real story (above), ends on the tagline | Slide 1: real shelf photo |
| 0:25-0:40 | Lorenz | "Shelfie: agents hire people to look, and the blockchain pays the bill. The brand pays into escrow, a person takes the photo, a verifier agent checks it, and only a true photo pays." | Slide 2: one flow diagram |
| 0:40-1:00 | Fernando | Sokosumi job, escrow lock tx on preprod explorer (pre-opened, "started earlier, escrow takes about an hour") | Browser tab |
| 1:00-1:20 | Isabel + Lorenz | Cheat: live camera at an old photo. Lorenz: "Same tag, old photo, no code. Red. No money moves." | Phone, verifier tab |
| 1:20-1:55 | Isabel + Lorenz | Isabel claims the task, the one-time code appears, she holds the code card next to the tag and shoots. Lorenz: "The verifier is a separate agent, paid per check over x402. It reads product, price and the code. Green." | Phone, verifier tab |
| 1:55-2:10 | Fernando | "And she is paid now, on preprod. Here is the transaction." | Explorer, zoom on hash |
| 2:10-2:35 | Lorenz | Result + business: report delivered, escrow settles (or refund, earlier run). Market slide, one sentence (section 4). | Slide 3: market |
| 2:35-3:00 | Lorenz, Isabel last line | Vision sentence, then Isabel's callback and the tagline | Slide 4: beyond + close |

2-minute version: drop the escrow-lock beat to one sentence on the result slide and drop the vision sentence.

If ahead of time, offer a judge the phone for the true photo.

## 4. Market (what goes on the slide)

Re-check every figure at its source URL before it goes on a slide; the advisors read search summaries, not the reports. Copy the source line under each number.

| Layer | Slide text | Source |
|---|---|---|
| Pain | "About $1.1T of retail sales lost to out-of-stocks per year" (label: "retailer loss, not our revenue") | IHL Group, via retail-insight-network.com (2026 est.) |
| TAM | "About $15B spent on merchandising services; shelf-recognition software about $2B" (cite the larger, do not add them) | Beroe; Credence / Grand View |
| Neighbour market | "Mystery shopping: about $2.3B, paid per visit, usable or not" | Fortune Business Insights; Straits Research |
| Bottom-up | "10 stores: EUR 120 with Shelfie vs EUR 500+ for test purchases" (illustrative pricing) | `market-pricing.md` |
| Vision (forecast) | "Agentic commerce forecasts: $0.1-5T by 2030" (the full range, not the top) | McKinsey, Bain, eMarketer |

Spoken (one sentence): "Out-of-stocks cost retail about a trillion dollars a year, and brands still check shelves with a 50-euro test purchase or a 30-dollar audit visit; Shelfie does the check for about twelve euros and gets paid only when the photo is true."

Vision (15 s): "Today it is one shelf in Munich. The same engine works for any fact an agent cannot find online: is the delivery there, is the shop open, is the ramp accessible. Agents will need eyes in the physical world; we make those eyes verifiable and paid."

Do not use: "$1.7T market" (loss incl. overstock and returns), the sum of several markets, the Trax valuation as market size, any Germany market figure (none found), "10x cheaper", EUR next to tADA.

Why making it look bigger than it is backfires: the product claim is "paid only when the evidence is true"; one inflated number that a judge googles discredits every other claim, including "live on preprod". The legitimate way to look big is the ladder: beachhead (brands entering Germany) -> FMCG retail execution DACH -> EU -> any proof-of-physical-world task for agents.

## 5. Defuse inside the pitch, not in Q&A

1. **Demand is not validated.** "One real request; we have not run brand interviews yet. Today we prove the mechanism."
2. **Why a blockchain / the verifier is ours.** Name what is on-chain (escrow lock and settle/refund, payout tx, x402 verifier fee) and say "the verifier is a URL the brand can swap".
3. **Location is not proven.** "The code proves the photo is new and made for this task, not where it was taken. Store QR codes are next." Also: "Agencies also fix shelves; we replace only the 'is it there, at what price' check."

Top Q&A to drill (answers in `qa-prep.md`): why blockchain / why not Stripe; GPS spoofing; who the workers are and cold start; Trax, Roamler, BeMyEye exist; what is live vs recorded vs mocked (prepare one honest table on a backup slide); legal: photographing in stores.

## 6. Programs

| Need | Primary | Fallback |
|---|---|---|
| Slides | Existing Beamer deck (`slides/`), max 2 editors, others send text; Lorenz builds | Committed `shelfie.pdf` on USB and phone |
| Presenting | `pdfpc` (presenter view, timer, notes) | `okular -presentation` / `evince -s` |
| Demo switching | One Chrome window: Sokosumi, verifier, explorer, report; `Ctrl+1..9`; slides on a second workspace; zoom 125%, notifications off | Screenshots in the deck |
| Phone on the big screen | The web app's own verifier/dashboard view (no cable). For the claim/code moment: `scrcpy` over USB (Android) | iPhone: QuickTime on a Mac; or the phone's screen recording played from the laptop |
| Video capture / edit | OBS Studio + Kdenlive, 1080p30, one headset mic, one narrator | CapCut on a Windows laptop |
| Captions | `whisper video.mp4 --model small --output_format srt`, or Kdenlive speech-to-text | CapCut auto captions |
| Rehearsal | `pdfpc` timer at 3:00 + a phone stopwatch held by a non-speaker; `/qa` skill for questions | |
| Network | Phone hotspot on a second device, tested at the venue | Offline kit: PDF, video, step screenshots, tx hashes as text |

Install (Ubuntu; OBS is already there): `sudo apt install pdfpc scrcpy adb kdenlive ffmpeg`. Do not use OBS scenes live; it adds a failure point.

## 7. Video (max 2:30)

| # | Time | Visual | Voice-over |
|---|---|---|---|
| 1 | 0:00-0:12 | Real store, hands only, photographing a drinks tag | The request (short form of the hook) |
| 2 | 0:12-0:24 | Quick cuts: aisles, a blurry photo, a gallery of 40 photos | "Hours of walking, photos nobody can verify, and an agency bills every visit, usable or not." |
| 3 | 0:24-0:32 | Text card | "An AI can write a report about a shelf. It cannot see it." |
| 4-9 | 0:32-2:15 | Sokosumi job and lock tx; cheat red; claim, code, photo, green; payout tx; report and refund | As in `video-script.md` shots 4-10 |
| 10 | 2:15-2:28 | Isabel's real photo, then title card | Callback + tagline |

Rules: store footage is story only, never shown as a demo verification. Ask the store manager; shelves only, no people, staff, screens or receipts. Every earlier-run clip carries "recorded earlier". Minimum viable video: same voice-over over six screenshots, about 1:45.

## 8. Timeline and owners

| When | What | Who |
|---|---|---|
| Fri 15:00 | Story lock: Isabel tells it aloud in 45 s, Lorenz writes it down; real numbers; consent request sent | Isabel, Lorenz |
| Fri today, daylight | Store B-roll, 30 min, 2 shops | Helmut, Isabel |
| Fri 18:00 | Slides v1 (5 slides) | Lorenz |
| Fri 18:30 | Rehearsal 1: paper, timing only, 15 min | all |
| Fri 21:00 | Rehearsal 2: with the demo on fakes, 15 min; no pitch work after 22:00 | all |
| Sat 09:30 | Script frozen; rehearsal 3 full dress with the kill-the-demo drill | all |
| Sat 11:00 | Slides frozen (= feature freeze) | Lorenz |
| Sat 11:00-13:00 | Final demo take on the printed shelf; last paid escrow cycle started by 13:00 | Lorenz (footage), Fernando |
| Sat 13:00-14:15 | Edit, captions, export | Helmut |
| Sat 12:30 | Rehearsal 4 on the real preprod flow | all |
| Sat 14:30 | Devfolio submitted, links checked by a second person | Helmut, Isabel |

Rehearsal protocol: timer held by a non-speaker, stop hard at 3:00; kill-the-demo drill (someone says "dead", switch to the recording within 5 s, same words); Q&A drill, 10 questions, answer starts with the limit, then the mitigation.

Stage rules: no "hello, we are team Shelfie"; open with the first sentence of the story, looking at a judge. One idea per slide, at most six words. Pause after the hook and after the red cheat. Non-speakers stand still and face the judges.

## 9. Pitch-day checklist (Sat)

- [ ] Format confirmed with the organisers (2 or 3 min, table or stage); 2-minute cut ready
- [ ] Consent for the story confirmed, or the anonymous wording in use
- [ ] Fresh job pre-created; one settled and one refunded job open in tabs; lock tx tab pre-loaded
- [ ] Laptop on power, zoom 125%, notifications off, no secret in any tab
- [ ] Phone: web app logged in, brightness max, do-not-disturb, screen recording running
- [ ] Props: printed tag of the demo drink, code cards, old photo for the cheat, paper and marker
- [ ] Backup: video and screenshots on USB and phone, tx hashes as text, backup laptop, hotspot, HDMI/USB-C adapter, power strip
- [ ] Balances checked (`W-VBUY`, `W-PAY`)
- [ ] After the pitch: questions we stumbled on into `docs/ai-log.md`
