# Saturday runbook (to 15:00 submission, then judging)

Submission deadline: **15:00** on Devfolio (tum.devfolio.co). Editable until then. Judging live 15:00-17:00, winners 17:30. Times are targets.

| Time | Action | Owner |
|---|---|---|
| 07:30 | Status check: any cycle settled overnight? Update evidence log. | D, B |
| 08:00 | **Create the Devfolio project now**, add all four members, select tracks (Cardano; TUM Blockchain is automatic). Paste the draft description. | D |
| 08:30 | Decide scope freeze list: what is in the demo, what is roadmap. | all |
| 09:00 | Final paid Masumi cycle can still run: start it **no later than 13:00** if one more is wanted | A, B |
| 09:00-11:00 | Finish M6 (worker page polish, dashboard, ledger). Fix top bugs only. | D, C |
| 10:00 | Record b-roll in stores (permission, no people) if not done; see [demo-props.md](demo-props.md) | D + one |
| 11:00 | **Feature freeze.** Only bug fixes after this. Tag the repo. | all |
| 11:00-12:30 | Record the screen demo takes with OBS (live flow: challenge code, photo, verifier highlight, green, payout tx on Cardanoscan; cheat attempt rejected) | D, one actor |
| 12:00 | README final: install and run, env variable names (no values), architecture, Cardano tools used, tx hashes | D |
| **~13:00** | **Last escrow cycle must have started/settled by now.** No new on-chain cycles after this; settlement needs about an hour. | A, B |
| 12:30-13:45 | Edit video <= 2:30. Check length, audio, readable text. Export, upload (YouTube unlisted or as Devfolio requires). | D + C |
| 13:30 | Repo public check from a logged-out browser: no secrets, README renders, `.env.example` only. Run the secret scan below. | B |
| 14:00 | Fill Devfolio: description, video link, repo link, tx hashes (see [submission-checklist.md](submission-checklist.md)). | D |
| 14:15 | Everyone reads the submitted page; second person checks every link and every explorer URL. | all |
| **14:30** | **Submit.** Do not wait for 14:59. Screenshot the confirmation. | D |
| 14:30-15:00 | Prepare live station: laptop, phone on hotspot, props, backup laptop on a replayed recording. | all |
| 15:00-17:00 | Live judging at the Cardano table (and other tracks if entered): pitch about 3 min including the live moment, then Q&A (format unconfirmed, see `../pitch/live-pitch.md` and mentor-questions O4). | roles below |
| 17:30 | Winners. | |

## Secret scan before public
`git log -p | grep -iE 'mnemonic|project_id|api_key|admin_key|encryption_key|addr_test1.*seed'` and `git ls-files | grep -E '\.env$|\.local'`. Expect nothing. If a key leaked: rotate it, then rewrite history before making the repo public.

## Judging roles
Same as `../pitch/live-pitch.md`:
- D pitches (customer, problem, business case, close).
- A is the field shopper on the worker phone (tag, code card, cheat photo) and holds the backup device.
- C narrates the verifier screen and answers verifier and fraud questions.
- B drives Sokosumi, escrow and the explorer and answers payment questions.
- The backup recording is played by whoever is not on stage at that moment.
- Offer the judge to take a photo themselves with the challenge code.

## Fallbacks during judging
- Facilitator or Blockfrost slow: show the prerecorded take and the earlier tx hashes in the ledger.
- Vision misreads: use the labelled manual override.
- Wi-Fi down: phone hotspot.
