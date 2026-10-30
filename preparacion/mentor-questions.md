# Questions for mentors and organisers (prioritised)

P1 = ask first; P2 = if time.

## Organisers (Telegram, Thursday evening)
- P1 O1: Is environment setup (accounts, keys, Postgres, installing tools, cloning public starter templates) before Friday 09:00 allowed? We write no project code before the window.
- P1 O2: Can one project win prizes in several tracks (e.g. Cardano plus the automatic TUM Blockchain Track)? Any limit on prizes per team?
- P2 O3: Is the hosted preprod facilitator capacity fine for live judging 15:00-17:00?
- P2 O4: Judging logistics: how many minutes per pitch, power and Wi-Fi at tables, can we bring physical props?

## Masumi 1:1 (book Friday 09:30)
- P1 M1: Can the escrow timeouts (pay-by, submit, unlock) be shortened on preprod for a live demo? Defaults imply ~46 min payout, ~30 min refund.
- P1 M2: Is there a hosted Masumi Payment Service for the hackathon, so we avoid running our own?
- P1 M3: Compatible Payment Service / V2 payment source for the starter? Which commit? `forceLayer` and `sellerReturnAddress`?
- P1 M4: Is a human payout as a plain Cardano transfer from the lead's wallet acceptable for "agents hire people", or is an x402/Masumi route expected?
- P2 M5: Recommended way to withhold a result on quality failure so the buyer's no-result auto-refund runs; any shortcut to show the refund faster?
- P2 M6: TUM Workspace seats, grants, child-job budget; Preprod MCP endpoint; does the loopback URL need hosting?
- P2 M7: Dispenser limits; which tUSDM token is right; does the Payment Service need the 5 ADA collateral?
- P1 M-ADR17: Does the Sokosumi hire form / Coworker input schema support option (select) fields, so the brand picks store and product from our catalog? If not, is free text the only input?

## Cardano workshop (Friday 10:30)
- P1 C1: Recommended way for a headless agent to pay a Masumi-escrow x402 route (`/x402/start_job`), and does it count for the track?
- P1 C2: Does plain x402 to a verifier plus a Sokosumi job satisfy "agents hiring agents"?
- P1 C3: How to pay a person's address from an agent wallet with the Evolution SDK (minimum UTxO, fees, confirmation time)?
- P2 C4: Preferred explorer (Cardanoscan vs Cexplorer preprod URL form)?
- P2 C5: Using template code in the public repo: any licence or rule concerns?
- P2 C6: Faucet limits and an API key for it.
