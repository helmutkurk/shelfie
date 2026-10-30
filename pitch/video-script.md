# Demo video script (target 2:20, hard limit 2:30)

Requirements from the track: who it is for, the problem, the business case, and one paid job end to end, with the payout visible on a preprod explorer. Spoken English, calm, one narrator (recorded by one person, same mic for the whole video). Pacing about 140 words per minute: 2:20 equals about 325 words. The voice-over below is counted at the end of the file.

## Shot list and voice-over

| # | Time | Visual | On-screen text | Voice-over (word for word) |
|---|---|---|---|---|
| 1 | 0:00-0:10 | B-roll: slow push-in on a supermarket drinks shelf, then a close-up of a price tag. No people. | "Is it on the shelf?" | An AI can write a report about a supermarket shelf. It cannot see the shelf. |
| 2 | 0:10-0:24 | Phone screen with a calendar and a mocked agency booking; Isarquell bottle on a desk. | "Katharina Brandl, field sales, Isarquell (fictional)" | Katharina sells craft lemonade in Bavaria. Last month a chain agreed to stock her bottle. Today she needs to know: is it on the shelf in this Munich store, and at what price? |
| 3 | 0:24-0:36 | Slow cut of agency invoice mock-up with a blurry photo attached. | "Agency visit: booked days ahead. Paid even if the photo is useless." | An agency takes days, and she pays for every visit, even when the photo is blurry, old, or from the wrong shop. |
| 4 | 0:36-0:48 | Screen recording: Sokosumi, Shelfie coworker, task form filled in. Cursor clicks Start. | "Shelfie: paid only when the photo is true." | This is Shelfie. She hires our agent on Sokosumi: check this product in this store. The fee is locked in Masumi escrow. |
| 5 | 0:48-1:00 | Screen recording: escrow lock; zoom on status "funds locked"; the intake check passes (catalog store and product) and a task card appears. | "Escrow: funds locked on Cardano preprod" | The agent checks the request against its catalog of known Munich stores and products, turns it into one small task and offers it to people nearby. |
| 6 | 1:00-1:20 | Screen recording of phone web page: claim the task, then the one-time code "K7Q-4XM". Cut to hands (no face) holding a paper or printed card with that code next to a price tag in a shop, tag and code both in frame. Shutter. | "One-time code per task" | In the store, the task shows a one-time code. The photo must contain the price tag and that code on a card beside it. An old photo cannot contain a code that did not exist yet. The code proves the photo is fresh, not where it was taken. |
| 7 | 1:20-1:40 | Screen recording: verifier view highlights price and product, checks tick one by one, turns green. Terminal/ledger line: "x402 payment to verifier". | "Verifier agent, paid per check over x402" | Our lead agent pays a separate verifier agent per check, over x402. It reads the product and the price, matches the code, and checks the time window. All checks pass. |
| 8 | 1:40-1:55 | Screen recording: payout transaction in the app, then browser on preprod.cardanoscan.io with the tx hash visible, zoom on hash and amount. | "Payout: [TX HASH]" | The person is paid on the spot, on Cardano preprod. Here is the transaction. |
| 9 | 1:55-2:07 | Screen recording: cheat attempt, the live camera aimed at an old photo, verifier turns red with the reason "code missing", payout stays at zero. | "Old photo: rejected. No payment." | Now an old photo, shot again with the live camera. The code is missing, the check fails, and nothing is paid. |
| 10 | 2:07-2:20 | Report table (store, price, status) and, after it, a second clip: refund transaction on cardanoscan for a run where no photo passed in time. | "Photo passes: report delivered, escrow settles. No passing photo: automatic refund. (Illustrative price: about EUR 5 per verified check.)" | If the photo passes, Katharina gets her report and the escrow settles. If not, she is refunded automatically. Illustrative pricing: about five euros per verified check, and only checks that pass are paid. |
| 11 | 2:20-2:28 | Title card with logo, tagline, repo and Devfolio link. | "Shelfie. Paid only when the photo is true. Preprod only today; store QR codes next." | Shelfie. Agents hire people to look, and the blockchain pays the bill. Paid only when the photo is true. |

Timecodes above sum to 2:28 including the title card. If the first cut runs over 2:30, cut shot 3 first, then shorten shot 2.

## Word count

The clean read-through copy at the end of this file has 277 words. At about 140 wpm that is about 1:58 of speech, which leaves about 20-30 seconds of silence for screen actions, the shutter moment and the explorer zoom. Recheck after any edit: copy the read-through paragraph into `wc -w`. Upper bound: 330 words.

## Recordings to capture (checklist)

Record at 1080p, 30 fps, browser zoom 125% so text is legible on a phone. Use a clean browser profile, no bookmarks bar, notifications off.

- [ ] Sokosumi: coworker listing, task form, the "start" click, task `COMPLETED` state.
- [ ] Escrow lock: the payment/escrow state "funds locked" and, in a second window, the lock transaction hash.
- [ ] x402: the verifier request returning 402 then succeeding with payment (terminal log or a small ledger page showing amount and tx hash).
- [ ] Phone web page: claim, task view with the challenge code, camera (live only), location status, result.
- [ ] Verifier green: the highlighted price tag, each check ticking.
- [ ] Verifier red: old photo, reason "code missing", payout 0.
- [ ] Payout tx on preprod.cardanoscan.io with hash, amount and status visible; zoom-in take.
- [ ] Refund: a run where no photo passes in time, escrow refund tx on the explorer.
- [ ] Report table in the brand view.
- [ ] Repo README top (3 seconds) for the end card.

Do each recording twice. Keep raw tx hashes in a text file so the on-screen text and the Devfolio text match exactly.

## B-roll in a Munich shop (no people in frame)

- Ask the manager for permission before filming; say it is a university hackathon, shelves only. Prefer a small independent shop or our own shelf at home if refused.
- Shots: wide of the drinks aisle (slow push-in), close-up of a price tag, a hand holding a phone from the chest down (no faces, no other customers, no staff badges, no cameras or security screens readable), the bottle on the shelf.
- Film in the morning when the shop is empty. Hold each shot 6-8 seconds. Vertical not needed; shoot 16:9.
- Print the price tags and challenge-code card yourselves so nothing in frame is a third party's data. Blur or avoid any third-party brand beyond the shelf.
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

An AI can write a report about a supermarket shelf. It cannot see the shelf. Katharina sells craft lemonade in Bavaria. Last month a chain agreed to stock her bottle. Today she needs to know: is it on the shelf in this Munich store, and at what price? An agency takes days, and she pays for every visit, even when the photo is blurry, old, or from the wrong shop. This is Shelfie. She hires our agent on Sokosumi: check this product in this store. The fee is locked in Masumi escrow. The agent turns the job into one small task and offers it to people nearby. In the store, the task shows a one-time code. The photo must contain the price tag and that code on a card beside it. An old photo cannot contain a code that did not exist yet. The code proves the photo is fresh, not where it was taken. Our lead agent pays a separate verifier agent per check, over x402. It reads the product and the price, matches the code, and checks the time window. All checks pass. The person is paid on the spot, on Cardano preprod. Here is the transaction. Now an old photo, from the camera roll. The code is missing, the check fails, and nothing is paid. If the photo passes, Katharina gets her report and the escrow settles. If not, she is refunded automatically. Illustrative pricing: about five euros per verified check, and only checks that pass are paid. Shelfie. Agents hire people to look, and the blockchain pays the bill. Paid only when the photo is true.
