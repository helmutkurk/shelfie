# Demo video plan (Saturday 2026-10-31)

Production plan for the Devfolio demo video. Story, voice-over and shot intent: [video-script.md](video-script.md). This file owns the Saturday timeline, the edit decision list (EDL), capture tooling and fallbacks. Owner: C (Lorenz, C-14); the cut is done by Lorenz's coding agent, Lorenz reviews.

The video is not shown in the live pitch; judges watch it alone afterwards, so it must explain everything without us. Length: at most 2.5 minutes (prizes page, "What to submit"). Target 2:20. Must show: who it is for, the problem, the business case, one paid job from start to finish with its transactions on a preprod explorer, agent hires agent (x402), payment tied to the result, honest limits.

## 1. One job, start to finish

The strongest proof is a single job that runs through every step on camera: the order and escrow lock (shot 4), the task on the worker's phone in the store (5), the hand sign photo (6), the paid verifier check (7), the payout (8), the report and escrow result (9). So the order is placed while the shoot team stands in the REWE, ready to claim.

| Plan | When | How | On screen |
|---|---|---|---|
| A | 07:30 go/no-go (Isabel) | Order from `/dashboard` or the Sokosumi hire form for store `rewe-81671-august-everding-strasse-20` and one catalog product; the bridge creates the engine job; the in-store phone claims it | No label needed; all hashes belong to this job |
| B | if A is not ready | Job from `codigo/scripts/field-jobs.ts` (no escrow) for the store run; escrow lock and settlement from the 08:00 cycle or earlier runs | Shot 4 and the escrow part of shot 9 labelled "separate escrow run" |

The cheat (shot 10) is a separate job at a laptop; it is never paired with a hash from the real run.

## 2. Saturday timeline

| Time | What | Who | Done when |
|---|---|---|---|
| 07:00 | Hub check on Helmut's laptop: engine, verifier, tunnel up, fakes and override off, `evidence-preflight` green | Helmut | preflight output clean |
| 07:00 | Fund W-VBUY (0 tADA on Fri evening; verifier fees fail without it). Log Friday's payout tx `7000899...` (job `job_c88c9da1cb68`) via `/log-evidence`, hash copied from the explorer | Isabel / Lorenz | balance > 0; row committed |
| 07:15 | Store: B-roll (shots 1, 2), every take twice | Lorenz + helper | files in `~/shelfie-video/raw/` |
| 07:30 | Go/no-go plan A (section 1) | Isabel | decision in chat |
| 07:45 | Order placed, screen recorded (shot 4); in-store phone claims and shoots (5, 6, 7, 8) | Isabel at a laptop, Lorenz + helper in store | payout tx on the explorer |
| 08:00 | If plan B: start the paid escrow cycle (> 60 min) | Isabel, Fernando | lock tx logged |
| 08:30-09:30 | Voice-over, one take per shot (`vo_sNN.wav`); shot 6 names the sign that actually appeared | one narrator | 12 files |
| 09:00-11:00 | Screen takes: report and escrow result (9), refund from an earlier run (9), cheat (10), Cardanoscan zooms (8) | Lorenz | all EDL sources present |
| 11:00 | Feature freeze: no new takes | all | - |
| 11:00-12:30 | Cut, review stills, fixes | agent, Lorenz | v1 reviewed |
| 12:30 | Export v1, safety upload (unlisted) | Lorenz | link opens logged out |
| 13:30 | Final video uploaded | Lorenz | link opens logged out |
| 13:45 | Devfolio entry filled (README, description, link) | Helmut | form saved |
| 14:30 | Submit | Helmut | confirmation |

## 3. Edit decision list (16:9, 1920x1080, 30 fps)

Each shot lasts as long as its voice-over take plus 0.7 s, at least the picture minimum below. Dry run with synthetic footage and a 140 wpm read of the 307-word script: 141 s.

| # | Min (s) | Picture | Title (top left) | Label (top right) | Source files |
|---|---|---|---|---|---|
| 1 | 9 | REWE B-roll: hands, tag | A real request | - | `s01_broll`, `s01_tag` |
| 2 | 9 | Quick cuts: aisle, tags, phone photo | Today: €50+ per visit, paid usable or not | - | `s02_broll` |
| 3 | 13 | Card "An AI cannot see the shelf.", flow card built in 5 steps | - | - | cards |
| 4 | 10 | Order, escrow "funds locked", lock tx | 1 · Order: fee locked in escrow | plan B: "separate escrow run" | `s04_order`, `s04_lock` |
| 5 | 6 | Phone: task appears, claim | 2 · Task offered, first to claim | - | `s05_phone_claim` |
| 6 | 15 | Phone: sign + countdown; match cut to over-shoulder hand by tag; shutter; box | 3 · One-time hand sign, 90 s | Live recording · 31.10.2026 | `s06_phone_sign`, `s06_cam_hand` |
| 7 | 11 | Split: phone result / dashboard gates green, 6x | 4 · Verifier agent, paid per check via x402 | 6x · real time | `s07_phone_result`, `s07_dash_green` |
| 8 | 9 | Payout row, Cardanoscan with zoom on hash and amount (2.5 s hold) | 5 · Worker paid on Cardano preprod | - | `s08_payout`, `s08_cardanoscan` |
| 9 | 10 | Report, escrow result; refund tx | 6 · Report delivered, escrow settles · else refund | "earlier run" on the refund | `s09_report`, `s09_refund` |
| 10 | 9 | Split: phone camera at laptop with old photo / dashboard red `screen_recapture`, payout 0 | Cheat: photo of a screen, rejected, €0 | - | `s10_phone_cheat`, `s10_dash_red` |
| 11 | 8 | Business card (illustrative pricing) | - | - | cards |
| 12 | 11 | "Today and next" card, end card with repo link | - | - | cards |

Rules: at most two panels at once; split screen = portrait phone 1080 high on the left, screen cropped to the rest. Subtitles burned in from the voice-over text. Honest labels; re-enacted footage never paired with a hash from another photo; override and fakes off in every take. Over 2:25: trim the voice-over as listed in `video-script.md`.

## 4. Capture and tooling

| Item | Setting |
|---|---|
| Raw footage | `~/shelfie-video/raw/` (outside the repo; photos and videos are never committed, the repo is public) |
| File names | `sNN_<what>_tN.<ext>` as in the EDL, e.g. `s06_cam_hand_t1.mp4`; voice `vo_sNN.wav` |
| Screen | OBS window capture of a clean Chrome profile (no bookmarks, no other tabs), zoom 125%, 1080p30; never on Helmut's laptop (the engine runs there) |
| Android phone | `scrcpy --no-audio --max-fps=30 --record=sNN_phone_<what>_tN.mkv` |
| iOS phone | Control-centre screen recording, transfer by cable; the cutter normalises HEVC/VFR to 30 fps |
| Camera (B-roll, over-shoulder) | Second phone, landscape, 1080p30, exposure locked on the tag, 6-8 s per shot |
| Sync | Clap plus a visible clock before every take |
| Cards | `~/shelfie-video/cards/cards.html`, rendered to PNG by `cards/render.sh` (headless Chrome): no-AI card, flow in 5 steps, business case, today and next, end card with repo link |
| Cutter | `~/shelfie-video/cut.py` + `edl.json`: 30 fps proxies, cached segment renders (layouts card, image, full, phone, split; zoom, boxes, speed), final pass with titles, labels, subtitles, loudness-normalised voice. `python3 cut.py probe`, `render [--draft] [--only sNN]`, `frames` (stills and contact sheet). Text change and re-render: about 25 s |
| Export | `shelfie-demo.mp4`: H.264 High, 1080p30, CRF 19, AAC 192 kbps 48 kHz, `-movflags +faststart`; duration checked with `ffprobe` |
| Review | Lorenz reviews three stills per shot, then watches the export once with and once without sound |

Demo jobs (plan B and the cheat): `codigo/scripts/field-jobs.ts` (1 h window, `--per 3`, `--store`), created at most 15 min before shooting, run by a human with their own token file. Workers: `dev.shelfieapp.fyi/w`; dashboard: `/dashboard`.

Privacy in every frame: no faces, no customers or staff, no tokens, env files or terminals with secrets, worker addresses shortened, phone notifications off.

## 5. Fallbacks

| If | Then |
|---|---|
| Live store run fails | Friday's run: job `job_c88c9da1cb68`, payout tx `7000899...` on preprod.cardanoscan.io, label "recorded Fri 30.10."; full hash from `tx-hashes.md` |
| Escrow result not in by 11:00 | Lock and settlement or refund from earlier runs (`tx-hashes.md` M4, M5 rows), label "earlier run" |
| Verifier fails on a real take | Re-shoot (light, distance, tag); never the override |
| W-VBUY still empty | No live verifier take; Friday's run as above |
| Video over 2:30 | Trim the voice-over (order in `video-script.md`), then drop the "Today and next" card |
| No usable voice-over | Titles and subtitles only, no music |

## 6. Decisions

1. Decided (Lorenz, 2026-10-30): store footage and the verification run are filmed in the real REWE, which gave filming permission; our printed tags are the fallback.
2. Decided (Lorenz, 2026-10-30): Lorenz's agent cuts; Lorenz reviews; Helmut does README and Devfolio.
3. Decided (Lorenz, 2026-10-30): the video is standalone (not shown in the pitch); it explains the customer, problem, flow, business case and limits itself. Script rewritten to 12 shots.
4. Open, Isabel by 07:30: plan A (one job through order, escrow and store run) or plan B (section 1). ADR-20 is accepted (orders from `/dashboard`; real Sokosumi purchase waits on B-15), so plan A needs either B-15 or the Sokosumi hire form.
