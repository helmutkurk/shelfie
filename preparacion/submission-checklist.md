# Submission checklist (Devfolio + Cardano)

Deadline: Saturday 15:00 on https://tum.devfolio.co. Target: submitted by 14:30.

## Devfolio (all teams)
- [ ] Project created early Saturday; all four members added.
- [ ] Tracks selected: Cardano (main); TUM Blockchain is automatic.
- [ ] Video <= 2:30, uploaded, link opens logged out.
- [ ] Detailed description: problem, what was built, how it works.
- [ ] Public repo (public since the first push on Friday, ADR 0003; no export step); checked logged out, `invoice/` and `.env` absent.
- [ ] Pre-submission re-audit of the repo before the final push: `docs/public-release.md` section 3 (gitleaks clean, no client names or personal data in new commits).
- [ ] GitHub secret scanning and push protection state recorded (enabled or "not available") in `codigo/docs/verified.md`.
- [ ] README with install and run instructions, env variable names only, `.env.example`.
- [ ] No secrets in the repo (gitleaks run on the tree and CI `secret-scan` green).
- [ ] Confirmation screenshot saved.

## Cardano track
- [ ] Working agent/service completing at least one job or payment on Cardano preprod.
- [ ] Tx hash of a paid job/request on preprod in the description (more than one if possible) with explorer links.
- [ ] Video covers: who it is for, the problem, the business case, and one paid job end to end.
- [ ] Description covers: how it works, Cardano tools used (Masumi, Sokosumi, x402, Blockfrost), real use.
- [ ] Shown: pay tied to the result (verifier pass -> payout; no passing photo -> refund).
- [ ] Shown: agent hires agent (lead -> verifier via x402) and agent acts in the world (humans in stores).
- [ ] Customer and journey clear (brand manager, job, report).
- [ ] Live demo ready for 15:00-17:00 with the tx in an explorer; backup recording ready.
- [ ] Limits stated honestly (code proves freshness, not location; override labelled).
