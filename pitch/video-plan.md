# Demo video plan (Saturday 2026-10-31)

Production plan for the Devfolio demo video. Story, voice-over and shot intent: [video-script.md](video-script.md). This file owns the Saturday timeline, the edit decision list (EDL), capture tooling and fallbacks. Owner: C (Lorenz, C-14); the cut is done by Lorenz's coding agent with ffmpeg, Lorenz reviews.

Length: hard limit 2:30 (repo rule, `preparacion/submission-checklist.md`; Devfolio's own limit: verify Saturday on the submission form). Target 2:20. Must show: who it is for, the problem, the business case, one paid job end to end, the payout tx on a preprod explorer, agent hires agent (x402), honest limits.

## 1. Saturday timeline

| Time | What | Who | Done when |
|---|---|---|---|
| 07:00 | Hub check on Helmut's laptop: engine, verifier, tunnel up, fakes and override off, `evidence-preflight` green | Helmut | preflight output clean |
| 07:00 | Fund W-VBUY (0 tADA on Fri evening; verifier fees fail without it). Log payout tx `7000899...` (job `job_c88c9da1cb68`) in `codigo/docs/evidence/tx-hashes.md` via `/log-evidence`, hash copied from the explorer | Isabel / Lorenz | balance > 0; row committed |
| 07:15-08:15 | Store shoot: B-roll (hands, shelves) and one real run with hand sign; every take twice | Lorenz + one helper | files in `~/shelfie-video/raw/` |
| 08:00 | Start the paid escrow cycle (needs > 60 min) | Isabel, Fernando | lock tx logged |
| 08:30-09:30 | Voice-over, one take per paragraph | one narrator | `vo_*.wav` |
| 09:00-11:00 | Screen takes with OBS: Sokosumi, dashboard red and green, cheat via laptop screen, Cardanoscan, report | Lorenz laptop | all EDL sources present |
| 11:00 | Feature freeze: no new takes | all | - |
| 11:00-12:30 | Fine cut, subtitles, overlays | agent, Lorenz reviews | v1 frames reviewed |
| 12:30 | Export v1, safety upload (unlisted) | Lorenz | link opens logged out |
| 13:30 | Final video uploaded | Lorenz | link opens logged out |
| 13:45 | Devfolio entry filled (README, description, link) | Helmut | form saved |
| 14:30 | Submit | Helmut | confirmation |

## 2. Edit decision list (16:9, 1920x1080, 30 fps)

| # | In-out (s) | Picture | Overlay | Source file |
|---|---|---|---|---|
| 1 | 0-10 | B-roll: hands, price tag, aisle | "A real request" | `s01_broll_*` |
| 2 | 10-20 | Quick cuts: walking, tags, phone photos | "Paid per visit, usable or not" | `s02_broll_*` |
| 3 | 20-27 | Text card, dark | "An AI cannot see the shelf." | generated |
| 4 | 27-40 | Sokosumi hire, escrow locked | "Escrow: funds locked on Cardano preprod" | `s04_sokosumi`, `s04_escrow` |
| 5 | 40-47 | Phone: task appears, claim | "One task, first to claim" | `s05_phone_claim` |
| 6 | 47-65 | Split: phone camera at laptop with old photo / dashboard red `screen_recapture`, "Payout: 0" | "Old photo on a screen: rejected. No payment." | `s06_phone_cheat`, `s06_dash_red` |
| 7 | 65-90 | Phone: hand sign revealed + 90 s countdown; match cut to over-shoulder hand next to tag; shutter; box around the sign | "Sign revealed only now · 90 s" | `s07_phone_sign`, `s07_cam_hand` |
| 8 | 90-105 | Split: phone result / verifier gates turning green; waiting speed-ramped 4-8x | "Verifier agent, paid per check over x402" + "6x · real time" | `s08_phone_result`, `s08_dash_green` |
| 9 | 105-120 | Payout row, then Cardanoscan tx; hash boxed 2.5 s | "Payout on Cardano preprod" | `s09_payout`, `s09_cardanoscan` |
| 10 | 120-132 | Report DELIVERABLE; refund tx | "No passing photo: automatic refund" + "earlier run" on the refund | `s10_report`, `s10_refund` |
| 11 | 132-142 | Real shelf photo, end card | "Paid only when the photo is true. Preprod only today." | `s11_*`, generated |

Rules: over length, cut shot 2 first, then shot 5. At most two panels at once. Split screen: portrait phone scaled to 1080 high on the left, screen cropped to the remaining width on the right (`hstack`). Burned-in English subtitles from the voice-over. Labels are honest: "Live recording · 31.10.2026", "earlier run", "re-enacted for camera"; re-enacted footage is never paired with a hash from another photo. Override and fakes are off in every take.

Voice-over (318 words) runs about 2:16 at 140 wpm, close to the 142 s picture. If the read runs long, trim the VO in shots 2 and 5 rather than speeding it up.

## 3. Capture and tooling

| Item | Setting |
|---|---|
| Raw footage | `~/shelfie-video/raw/` (outside the repo; photos and videos are never committed, the repo is public) |
| File names | `sNN_<what>_<take>.<ext>`, e.g. `s07_cam_hand_t1.mp4`; voice `vo_sNN_t1.wav` |
| Screen | OBS window capture of a clean Chrome profile (no bookmarks, no other tabs), zoom 125%, 1080p30, MKV then remux |
| Android phone | `scrcpy --no-audio --max-fps=30 --record=sNN_phone_tN.mkv` |
| iOS phone | Control-centre screen recording, transfer by cable; normalise HEVC/VFR to 30 fps CFR before cutting |
| Camera (B-roll, over-shoulder) | Second phone, 16:9, 1080p30, exposure locked on the tag, 6-8 s per shot |
| Sync | Clap plus a visible clock (phone clock on screen) before every take |
| Edit | ffmpeg (libx264, drawtext with DejaVuSans-Bold, hstack); Kdenlive only for fixes by hand |
| Export | `shelfie-demo.mp4`: H.264 High, 1080p30, CRF 18-20, AAC 192 kbps, `-movflags +faststart`; duration checked with `ffprobe` (< 150 s) |
| Machine | Lorenz's laptop only; never run OBS or editing on Helmut's laptop (the engine runs there) |

Demo jobs: `codigo/scripts/field-jobs.ts` (1 h window, `--per 3`, `--store`), created at most 15 min before shooting, run by a human with their own token file. Workers: `dev.shelfieapp.fyi/w`; dashboard: `/dashboard`.

Privacy in every frame: no faces, no customers or staff, no tokens, env files or terminals with secrets, worker addresses shortened, phone notifications off (do not disturb).

## 4. Fallbacks

| If | Then |
|---|---|
| Live store run fails | Use the Friday run: job `job_c88c9da1cb68`, payout tx `7000899...` on preprod.cardanoscan.io, caption "recorded Fri 30.10."; full hash from `tx-hashes.md` |
| Escrow cycle not finished by 11:00 | Lock and refund from earlier runs in `tx-hashes.md` (M4, M5 rows), caption "earlier run" |
| Verifier unreliable on a take | Re-shoot the tag (light, distance); never use the override in the video |
| W-VBUY still empty | No live verifier take; use Friday's DELIVERABLE dashboard capture if recorded, else the explorer only |
| Video over 2:30 | Cut shot 2, then shot 5, then shorten shot 10 |
| No time for voice-over | Subtitles plus on-screen text only, music-free |

## 5. Open decisions (Lorenz)

1. Decided (Lorenz, 2026-10-30): the verification run is filmed in the real REWE, which gave filming permission; our printed tags are the fallback.
2. Who cuts: Lorenz's agent with Lorenz reviewing (proposed); Helmut does README and Devfolio.
3. All takes before 11:00 feature freeze (the runbook's 12:30 edit start is too late for a reviewed v1).
4. ADR-20 (brands order in our own web app, proposed): if accepted before 09:00, shot 4 shows our order page instead of the Sokosumi hire form.
