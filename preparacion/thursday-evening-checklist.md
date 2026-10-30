# Thursday evening checklist

Goal: leave Thursday night with every account working and every tool verified, so Friday 09:00 starts with `git clone`. Time budget 45-90 min per person. Setup only: no project code.

Format: `- [ ]` item, then **Verify** (the command or screen that proves it). Mark done only after Verify passes.

## Everyone (A–D)
- [x] Join the hackathon Telegram. **Verify:** you can read the organiser channel.
- [x] Sign up at https://preprod.sokosumi.com/signup (own account). **Verify:** you reach the dashboard on the preprod host.
- [x] (Done by all four, 2026-10-29.) Join the TUM Workspace via the invite link https://preprod.sokosumi.com/join/GTAHB3OQFWgg8rGetMfleiqgeL6_ltdW. Required, not optional: "You must belong to an organization to create a Vendor" (Masumi TUM setup guide, saved in `../downloads-blockchain-website/`). Test tasks run in the **Personal Workspace** first; switch to TUM for the demo. **Verify:** the TUM workspace appears in the switcher and `mise exec node@24 -- sokosumi --preprod workspaces list --json` lists Personal and TUM.
- [ ] Run `mise exec node@24 -- sokosumi skills` once after login (step in the Masumi setup guide). Check Personal credits at https://preprod.sokosumi.com/billing?tab=credits.
- [ ] Install mise. Install Node 24 alongside the global Node 26: `mise install node@24`. Do not change the global version. **Verify:** `mise exec node@24 -- node --version` prints v24.x and `node --version` still prints v26.x.
- [ ] Install Sokosumi CLI under Node 24: `mise exec node@24 -- npm install --global @masumi_network/sokosumi@1.0.4`. **Verify:** `mise exec node@24 -- sokosumi --version` prints 1.0.4.
- [ ] Log in: `sokosumi --preprod auth login` (run with Node 24), then `sokosumi --preprod auth whoami --json`. **Verify:** whoami returns your email. Linux needs a running Secret Service (gnome-keyring); if login fails on the vault, fix it tonight.
- [ ] OBS Studio installed on the recording laptop (Role D; B as backup): `sudo pacman -S obs-studio` (Arch/Omarchy) or the OS package. **Verify:** record 10 s of screen + microphone, play it back with sound. On Wayland pick the PipeWire screen-capture source; fix it tonight.
- [ ] Phone ready: camera works in the mobile browser; Chrome or Safari; know how to use the hotspot.
- [ ] Read (30 min): [../ideas/decision.md](../ideas/decision.md), this folder's README, your role's runbook sections (below). **Verify:** you can explain the verifier gates G1-G7 (`../diseno/verifier-rules.md`) and the three payment gates without notes.
- [ ] Sleep. Friday starts at 09:00.

## Role A: Sokosumi/Masumi operator (shell and engine)
- [ ] Everything under "Everyone", plus pnpm is not needed for A.
- [ ] Read masumi-runbook sections 2 and 6. **Verify:** you know the order: Vendor, Coworker, connect, API key into vault, `npm start` + `npm run worker`.
- [ ] Check organisation membership/credits: personal credits exist (vendor creation needs membership). **Verify:** `sokosumi --preprod workspaces list --json` lists at least the personal workspace.
- [ ] Confirm Secret Service works (`secret-tool` or the CLI login persisting after re-login). **Verify:** log out/in of the CLI, whoami still works.

## Role B: Payments
- [ ] Blockfrost account, one **preprod** project. **Verify:** the key shows network Preprod; test with `curl -H "project_id: $KEY" https://cardano-preprod.blockfrost.io/api/v0/` (key in env only, never pasted in chat).
- [ ] Masumi dispenser https://dispenser.masumi.network/: request the email code from the Masumi registration email. **Verify:** you know where the code arrives (check spam). Claim test funds only once a wallet exists (Friday; the seller wallet is created by the seed).
- [ ] Faucet bookmarked: https://docs.cardano.org/cardano-testnets/tools/faucet.
- [ ] pnpm 10.30.2 under Node 24.22.x: `mise use` is project-local, so tonight only check availability: `mise ls-remote node | grep 24.22`. Install later with `npm install --global pnpm@10.30.2`. **Verify:** `pnpm --version` prints 10.30.2 after install.
- [ ] Docker Postgres 15 (laptop has only the psql client): `docker run -d --name pg15 -e POSTGRES_PASSWORD=<local-only> -p 5432:5432 postgres:15`. **Verify:** `docker ps` shows it Up and `psql -h 127.0.0.1 -U postgres -c 'select 1'` works. Use a throwaway password and do not reuse it.
- [ ] Read x402-runbook sections 1, 3, 5 and masumi-runbook sections 3, 4. **Verify:** you can state why a rejected report must withhold the hash (a "failed" text is payable).

## Role C: Verifier and vision
- [ ] Node 24 + pnpm verified as above (read-only for tonight).
- [ ] Write on paper/markdown (not code): the verifier gates G1-G7 with pass criteria (`../diseno/verifier-rules.md`), the challenge-code format (6 characters shown `XXX-XXX`, no ambiguous glyphs like 0/O), plausible price ranges for the demo products, and the job rule (MVP N=1, K=1; K-of-N is roadmap, ADR-16) plus the intake catalogs (Munich stores, products). **Verify:** each check is a yes/no rule with a stated reject example.
- [ ] Choose the LLM provider and who pays (Masumi template expects `ZAI_API_KEY`, `ZAI_BASE_URL`, `ZAI_MODEL`; another provider means adapting `agent/agent.ts`). Create the key. **Verify:** key exists in a password manager; not in any file in the repo folder. Pick a vision-capable model for price-tag reading and test it manually in the provider's playground with a phone photo of any price tag.
- [ ] Read masumi-runbook section 4 (quality gate, refunds).

## Role D: Product, UI, pitch, evidence
- [ ] Node 24 + git ready; pick the front-end approach in your head only (no code).
- [ ] Prepare props per [demo-props.md](demo-props.md): buy products, write the price-tag spec. **Verify:** 4-5 products on the table, tag spec reviewed by C.
- [ ] Draft the 30-second pitch on paper and the video storyboard (2.5 min). Back up customer claims with 1-2 sources (retail-execution cost/delay).
- [ ] Copy [evidence-log-template.md](evidence-log-template.md) to the working location Friday morning; agree the screenshot folder name.
- [ ] Read tracks-oficiales (Cardano section) and [submission-checklist.md](submission-checklist.md).

## Team (10 min together, Thursday evening)
- [ ] Assign names to A–D. Agree: one wallet per purpose (`W-VBUY` verify buyer, `W-PAY` payouts, `W-SELL` verifier income, `W-MPS` Masumi seller; workers use their own preprod addresses), never shared mnemonics.
- [ ] Decide LLM provider owner and Blockfrost owner.
- [ ] Post the setup question to the organisers (see [mentor-questions.md](mentor-questions.md), item O1).
- [ ] Agree Friday 08:45 meeting point at House of Communication, Friedenstraße 24.

## Do not do
- Do not write project code, scaffold the repo, or run `npm init` for Shelfie. Starter templates (x402-express, tum-hackathon-quickstart) wait for Friday 09:00 unless the organisers confirm earlier cloning.
- Do not commit keys, `.env`, mnemonics, Blockfrost IDs or admin keys. Add a global `.gitignore` entry for `.env*` and `.local/`.
- Do not paste mnemonics or API keys into chat, Telegram, Discord or an LLM prompt. The Masumi seed prints mnemonics: operator only, no screen sharing or recording.
- Do not run two workers for one Coworker.
- Do not use mainnet anywhere (Sokosumi MCP defaults to mainnet; always confirm Preprod).
- Do not install third-party tools beyond this list.
