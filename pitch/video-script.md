# Demo video script (target 2:20, hard limit 2:30)

Saturday timeline, edit decision list and capture tooling: [video-plan.md](video-plan.md). Challenge shots follow ADR-19 (hand sign, `screen_recapture` cheat).

Requirements from the track: who it is for, the problem, the business case, and one paid job end to end, with the payout visible on a preprod explorer. Spoken English, calm, one narrator (recorded by one person, same mic for the whole video). Pacing about 140 words per minute: 2:20 equals about 325 words. The voice-over below is counted at the end of the file.

## Shot list and voice-over

| # | Time | Visual | On-screen text | Voice-over (word for word) |
|---|---|---|---|---|
| 1 | 0:00-0:12 | Real B-roll from a Munich shop: hands only, a phone photographing a drinks price tag. No people, brands blurred. | "A real request" | A friend of Isabel's father wants to bring a drink to Germany. He asked two of us to photograph the competitors in Munich shops: what they cost, and whether they are there. |
| 2 | 0:12-0:24 | Quick cuts: aisles, a blurry photo, a phone gallery full of shelf photos. | "Paid per visit, usable or not" | Hours of walking, and photos he cannot check from abroad. An agency would bill him for every visit, even when the photo is blurry, old, or from the wrong shop. |
| 3 | 0:24-0:32 | Text card on dark background. | "An AI cannot see the shelf." | An AI can write him a report about a shelf. It cannot see the shelf. So we built an agent that hires someone who can. |
| 4 | 0:32-0:44 | Screen recording: Sokosumi, Shelfie coworker, task form filled in. Cursor clicks Start. | "Shelfie: paid only when the photo is true." | This is Shelfie. He hires our agent on Sokosumi: check this drink in this Munich store. The fee is locked in Masumi escrow. |
| 5 | 0:44-0:56 | Screen recording: escrow lock; zoom on status "funds locked"; the intake check passes (catalog store and product) and a task card appears. | "Escrow: funds locked on Cardano preprod" | The agent checks the request against its catalog of known Munich stores and products, turns it into one small task and offers it to people nearby. |
| 6 | 0:56-1:08 | Split screen: the worker phone's live camera aimed at a laptop screen showing an old shelf photo; dashboard turns red with the reason `screen_recapture`, payout stays at zero. | "Old photo on a screen: rejected. No payment." | First, a cheat: the live camera aimed at a laptop showing an old photo. The check sees a screen, the photo fails, and nothing is paid. |
| 7 | 1:08-1:28 | Phone screen recording: claim the task, open the camera, the hand sign appears (for example "3 fingers, right of the tag") with the 90 s countdown. Match cut to the over-the-shoulder shot: hand (no face) with that sign right of the price tag, tag and hand both in frame. Shutter. | "Sign revealed only now · 90 s" | Now the real task. Only when the camera opens does it show a hand sign: three fingers, right of the tag. The worker has ninety seconds. An old photo cannot show a sign that did not exist yet. The sign proves the photo is fresh, not where it was taken. |
| 8 | 1:28-1:46 | Screen recording: verifier view highlights price and product, checks tick one by one, turns green. Terminal/ledger line: "x402 payment to verifier". | "Verifier agent, paid per check over x402" | Our lead agent pays a separate verifier agent per check, over x402. It reads the product and the price, checks the hand sign, and the time window. All checks pass. |
| 9 | 1:46-1:58 | Screen recording: payout transaction in the app, then browser on preprod.cardanoscan.io with the tx hash visible, zoom on hash and amount. | "Payout: [TX HASH]" | The person is paid on the spot, on Cardano preprod. Here is the transaction. |
| 10 | 1:58-2:14 | Report table (store, price, status) and, after it, a second clip: refund transaction on cardanoscan for a run where no photo passed in time. | "Photo passes: report delivered, escrow settles. No passing photo: automatic refund. (Illustrative price: about EUR 12 per verified check; agency visits from about $30-45.)" | If the photo passes, he gets his report and the escrow settles. If not, he is refunded automatically. Illustrative pricing: about twelve euros per verified check, a fraction of an agency visit, and only checks that pass are paid. |
| 11 | 2:14-2:28 | One of Isabel's real shelf photos, then title card with logo, tagline, repo and Devfolio link. | "Shelfie. Paid only when the photo is true. Preprod only today; store QR codes next." | Next time he doesn't call us. He posts a job. Shelfie. Cardano escrow makes sure nobody pays for a photo that isn't true. |

Timecodes above sum to 2:28 including the title card. If the first cut runs over 2:30, cut shot 2 first, then shorten shot 5.

Story rules: the request is real; never name the person, the drink, the brand or the country of origin, and tell it only with his consent (else "an acquaintance of Isabel's father"). Never call him a customer. Real store footage: shots 1, 2 and 11 (story), and the verification run in shots 5-9 is filmed in the REWE that gave filming permission (decided by Lorenz, 2026-10-30; see [video-plan.md](video-plan.md) section 5).

## Word count

The clean read-through copy at the end of this file has 318 words. At about 140 wpm that is about 2:16 of speech, which leaves little silence; if the cut runs long, shorten shot 2 and shot 5 first, to keep about 15 seconds for screen actions, the shutter moment and the explorer zoom. Recheck after any edit: copy the read-through paragraph into `wc -w`. Upper bound: 330 words.

## Recordings to capture (checklist)

Record at 1080p, 30 fps, browser zoom 125% so text is legible on a phone. Use a clean browser profile, no bookmarks bar, notifications off.

- [ ] Sokosumi: coworker listing, task form, the "start" click, task `COMPLETED` state.
- [ ] Escrow lock: the payment/escrow state "funds locked" and, in a second window, the lock transaction hash.
- [ ] x402: the verifier request returning 402 then succeeding with payment (terminal log or a small ledger page showing amount and tx hash).
- [ ] Phone web page: claim, camera (live only) with the hand sign revealed and the 90 s countdown, location status, result.
- [ ] Verifier green: the highlighted price tag, each check ticking.
- [ ] Verifier red: live camera at a laptop showing an old photo, reason `screen_recapture`, payout 0.
- [ ] Payout tx on preprod.cardanoscan.io with hash, amount and status visible; zoom-in take.
- [ ] Refund: a run where no photo passes in time, escrow refund tx on the explorer.
- [ ] Report table in the brand view.
- [ ] Repo README top (3 seconds) for the end card.

Do each recording twice. Keep raw tx hashes in a text file so the on-screen text and the Devfolio text match exactly.

## B-roll in a Munich shop (no people in frame)

- Ask the manager for permission before filming; say it is a university hackathon, shelves only. Prefer a small independent shop or our own shelf at home if refused.
- Shots: wide of the drinks aisle (slow push-in), close-up of a price tag, a hand holding a phone from the chest down (no faces, no other customers, no staff badges, no cameras or security screens readable), the bottle on the shelf.
- Film in the morning when the shop is empty. Hold each shot 6-8 seconds. Vertical not needed; shoot 16:9.
- Story shots (1, 2, 11) and the verification run (shots 5-9) are filmed in the REWE that gave permission (the hand sign needs no card; ADR-19). Our printed tags are the fallback if the store run fails. Blur or avoid any third-party brand beyond the shelf.
- No music with an unclear licence. Use a royalty-free track at low volume or none.

## Recording and editing checklist (Linux)

- [ ] Screen: OBS Studio, scene "screen" (display capture, 1080p), separate scene for the phone mirror (scrcpy or the phone's own screen recorder transferred by cable).
- [ ] Voice-over: record in a quiet room, USB or headset mic, OBS audio-only track or Audacity; one take per paragraph; add 0.3 s of room tone at each end.
- [ ] Edit: Kdenlive; project 1920x1080, 30 fps; V1 screen/b-roll, V2 text overlays, A1 voice, A2 optional music at -25 dB.
- [ ] On-screen text: large, left-aligned, max 8 words per card, white on dark band.
- [ ] Zoom-ins on tx hashes and amounts (Kdenlive "Transform" effect keyframes).
- [ ] Captions: burn in short English subtitles (Kdenlive subtitle track) because judges may watch muted.
- [ ] Export: H.264 MP4, 1080p, 8-10 Mbps, AAC 192 kbps; check size is accepted by Devfolio or upload to a public video host and link.
- [ ] Final check: duration under 2:30 on the player (not in the editor), every tx hash legible for 2+ seconds, the words "preprod" and "business case" appear, no private keys or API keys in any frame (check the terminal and browser tabs).
- [ ] Watch once with sound off and once with a colleague who has not seen the project.

## Fallback cut if escrow is not live

Order of preference, decide before recording starts:

1. **Escrow ran earlier and succeeded:** use that run's recordings; say "recorded earlier today" in a caption.
2. **Escrow works but the cycle is too slow (60+ min):** start the job first; record everything else while it runs; insert the settlement or refund clip when it completes. Keep the shot 5 and shot 10 clips as separate files so they can be swapped.
3. **Escrow not live at all** (the go/no-go in `../diseno/architecture.md` section 6): the job is created from the dashboard's "demo job" button and labelled "demo job, no escrow" on screen; the lead still pays the verifier over x402 and the person by plain preprod transfer. Change the voice-over in shot 4 to "She starts a job in our app" and shot 5 to "The agent offers one task per store"; in shot 10 say "In the full product, the fee sits in escrow and is refunded if too few stores pass", with the caption "Escrow settlement: recorded run or roadmap". Do not invent a brand-to-lead x402 payment; it is not in the design. Never show a mocked transaction as real.
4. **Verifier unreliable:** fix the tags, lighting or model and re-record. The manual override (`../diseno/verifier-rules.md` section 8) must be off for every recorded take and evidence run; use it only for the live table as a labelled safety net, never in the submitted video.

## Voice-over (clean read-through copy)

A friend of Isabel's father wants to bring a drink to Germany. He asked two of us to photograph the competitors in Munich shops: what they cost, and whether they are there. Hours of walking, and photos he cannot check from abroad. An agency would bill him for every visit, even when the photo is blurry, old, or from the wrong shop. An AI can write him a report about a shelf. It cannot see the shelf. So we built an agent that hires someone who can. This is Shelfie. He hires our agent on Sokosumi: check this drink in this Munich store. The fee is locked in Masumi escrow. The agent checks the request against its catalog of known Munich stores and products, turns it into one small task and offers it to people nearby. First, a cheat: the live camera aimed at a laptop showing an old photo. The check sees a screen, the photo fails, and nothing is paid. Now the real task. Only when the camera opens does it show a hand sign: three fingers, right of the tag. The worker has ninety seconds. An old photo cannot show a sign that did not exist yet. The sign proves the photo is fresh, not where it was taken. Our lead agent pays a separate verifier agent per check, over x402. It reads the product and the price, checks the hand sign, and the time window. All checks pass. The person is paid on the spot, on Cardano preprod. Here is the transaction. If the photo passes, he gets his report and the escrow settles. If not, he is refunded automatically. Illustrative pricing: about twelve euros per verified check, a fraction of an agency visit, and only checks that pass are paid. Next time he doesn't call us. He posts a job. Shelfie. Cardano escrow makes sure nobody pays for a photo that isn't true.
