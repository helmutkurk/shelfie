# scripts

Status: implemented (`smoke.ts`, `hub-up.sh`, `fund-check.ts`, `payout-once.ts`, `setup-wallets.md`). Links point to the canonical design in `diseno/`.

## Files
| File | What it does | Run from `codigo/` |
|---|---|---|
| `smoke.ts` | End-to-end smoke (repo-layout section 4) against a **running engine on fakes**: demo job, wrong-code photo (FAIL, no payout, attempts left), valid photo (PASS, exactly one payout, `DELIVER`), duplicate create/submit, out-of-stock job (PASS `OUT_OF_STOCK`, one payout, report says out of stock), far-away submission (422 `location_mismatch`, no verify tx), out-of-catalog and free-text jobs (422, no task), ledger chain check through the API. Exit 1 on any failed assertion; refuses to run if the engine reports real payments. | `npx tsx scripts/smoke.ts` |
| `hub-up.sh` | Starts engine, verifier, web (and with `--tunnel` the cloudflared quick tunnel for the engine port only), waits for `/api/health`, prints URLs and a fake-mode warning. Fails fast if `codigo/.env` is missing (use `--fake` for a rehearsal without secrets). Never prints env values. `stop` and `status` subcommands. | `bash scripts/hub-up.sh --fake` |
| `fund-check.ts` | Reads public wallet addresses from env and prints Blockfrost **preprod** balances. Refuses mainnet addresses, mainnet project ids and `NETWORK` other than preprod. Without `BLOCKFROST_PROJECT_ID` it is a dry run (no request). | `node --env-file=.env --import tsx scripts/fund-check.ts` |
| `payout-once.ts` | One real plain transfer from `W-PAY` on **preprod** with the queue's `EvolutionPayoutAdapter`, to settle ADR-04 (task B-04). Prints balance, sends once (default 2 tADA, capped at `MAX_PAYOUT_LOVELACE`) with a `shelfie:` metadata tag, waits for one confirmation, then checks that `find()` returns the same hash. Dry run unless `--send` (still needs the real env: it reads the balance). Refuses `FAKE_PAYMENTS`. One attempt per run and no idempotency record across runs (manual operator tool, documented exception): never rerun `--send` after exit 2 "Outcome UNKNOWN" or exit 3; check the explorer, then `--check <hash> --tag <tag> --since <iso>`. Exit codes: 0 ok, 1 refused, 2 not sent or unknown, 3 sent but unconfirmed or not found (waits up to 10 min). | `node --env-file=.env --import tsx scripts/payout-once.ts --to addr_test1... [--send]` |
| `setup-wallets.md` | Instructions only: which wallets exist, where mnemonics and public addresses go, funding. Generates nothing. | read |

## Smoke usage
```
npm run dev -w @shelfie/engine            # terminal 1 (fakes, 127.0.0.1:4000)
npx tsx scripts/smoke.ts                  # terminal 2
ENGINE_URL=http://127.0.0.1:4000 ADMIN_TOKEN=... SHELL_TOKEN=... npx tsx scripts/smoke.ts   # other targets
```
Store coordinates come from `investigacion/catalogo/stores.json` (`CATALOG_DIR` overrides). The fake verifier decides from a marker inside the synthetic JPEG, so the smoke only works against the engine's fake verifier. Re-run it against real components as they come online by changing the engine's env, not the script (the real verifier will need real photos, so the wrong/valid assertions then become manual).

## TODO / verify Friday
- The dry endpoint exists. Test it with real decodable fixtures and `VERIFY_CLIENT=real`; the marker-based smoke uses synthetic JPEG bytes and deliberately targets the in-engine fake verifier.
- `hub-up.sh`: verifier/web start scripts exist. Verify real startup, cloudflared command/URL pattern, `HUB_LAN_IP`, and descendant cleanup after stop on the hub laptop.
- `fund-check.ts`: `WALLET_ADDRESS_VBUY`, `WALLET_ADDRESS_PAY`, `WALLET_ADDRESS_MPS` are core `FundCheckEnvSchema` names documented in contracts §5.6; not run against Blockfrost yet (no key).
- `payout-once.ts`: first real run 2026-10-30, tx `60d49a3a...` (B-04 done; `codigo/docs/verified.md`).
- Not scripted yet (checklist items): `scripts/hub-check.sh`, `check-bundle.sh`, `evidence-preflight.sh`, `purge-evidence.sh`.
- Root `npm run typecheck` includes `tsc -p scripts/tsconfig.json`; `npm run smoke` and `npm run hub-up -- --fake` are root scripts. Fake hub mode never reads `.env`. Socket startup and smoke must be rerun on the hub: this sandbox refuses TCP/Unix sockets (EPERM).

## Do not
- Never print or commit mnemonics or keys.
- Do not restart the tunnel mid-demo.
