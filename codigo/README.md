# Shelfie monorepo

Verified shelf checks, paid only when the photo is true. The engine admits one catalog store and product per job, verifies one worker photo, pays only on PASS, and delivers the report or withholds it for the buyer's refund. Cardano preprod and test ADA only.

The boilerplate is implemented with fakes, regression tests and a browser build. Paid x402, SDK transfers and Masumi settlement still need venue validation. Start with the [team guide](../docs/START-HERE-TEAM.md), [contracts](../diseno/contracts.md) and each component README.

## Layout

| Folder | Owner | Already available |
|---|---|---|
| `apps/shell` | A, Isabel | Dependency-free JS bridge and fake-engine tests; starter still to attach |
| `apps/engine`, `packages/core` | A, Isabel | API, state machines, catalog intake, geofence, journal, shared schemas and env loader |
| `packages/payments`, `scripts` | B, Fernando | x402 buyer, payout adapter and durable queue, fakes, smoke, hub-up, fund-check |
| `apps/verifier` | B wrapper, C gate | x402 seller, validation before payment, idempotency, dry/extract routes, G1-G7 and OOS gates |
| `packages/domain-shelf`, `packages/vision`, `eval` | C, Lorenz | Catalog loader, prompt constants, reports, provider adapters and evaluation runner |
| `apps/web`, `packages/evidence`, `docs/evidence` | D, Helmut | Worker app, dashboard, hash-chained ledger and preprod explorer helpers |

## How to run

Use Node 24 and npm. The checked local version is 24.22.2; the repo's `.node-version` selects major 24. Keep global Node unchanged if needed:

```bash
# From codigo/; choose one version manager.
mise exec node@24 -- node --version
# Or: nvm install 24 && nvm use 24
npm ci
npm run check
```

With mise, prefix subsequent npm commands with `mise exec node@24 --` unless Node 24 is already active. `npm run check` covers workspace and scripts typechecks, ESLint, Vitest, then the shell bridge's `node --test` suite. No dependency upgrades are needed.

For a local env file, copy `.env.example` to `.env`, fill values locally, and never commit it. The example contains names only; blank values count as unset in `loadEnv`. App commands consume exported environment variables, not the root `.env` automatically. Humans can supply the local file to Node with `node --env-file=.env --import tsx <entrypoint>`. The non-fake hub loader reads the root file for its child services. Agents must follow AGENTS.md's restriction on reading `.env` files.

Start each app on fakes in separate terminals from `codigo/`:

```bash
FAKE_PAYMENTS=1 VERIFIER_PAYMENT=off npm run start -w @shelfie/engine
VERIFIER_PAYMENT=off VERIFIER_MODE=stub npm run start -w @shelfie/verifier
npm run dev -w @shelfie/web
```

Engine: `http://127.0.0.1:4000/api/health`. Verifier: `http://127.0.0.1:4021/health`. Web: `http://127.0.0.1:5173/w` or `/dashboard`; `/api` is proxied to the engine. `VITE_ENGINE_URL` changes the dev proxy target; otherwise it uses `ENGINE_PORT` (4000 by default). The engine's fake verifier is in-process, so the smoke does not depend on the separate verifier. To exercise the separate stub service with a real decodable fixture, set `VERIFY_CLIENT=real`, `VERIFIER_PAYMENT=off`; the marker-based smoke uses synthetic JPEGs and is not suitable for that path.

The shell has no live starter yet: run `npm run test -w @shelfie/shell` and follow its [fork instructions](apps/shell/README.md). Its dev script prints that handoff; it does not launch a Coworker.

For the hub rehearsal and smoke:

```bash
npm run build -w @shelfie/web
npm run hub-up -- --fake
npm run smoke
npm run hub-up -- status
npm run hub-up -- stop
```

`--fake` uses exported settings and never loads `.env`. Hub logs and PID files are under `${TMPDIR:-/tmp}/shelfie-hub/`. The hub starts engine, verifier and web, not the Masumi worker. The built web app is served by the engine; the dev server is at 5173. Stop foreground app terminals with Ctrl-C. After a hub stop, inspect `ss -ltnp` for 4000-4021 and 5173 and stop any surviving child belonging to this run. Do not stop another teammate's service.

A real hub run is `npm run hub-up -- --tunnel` after the owner has configured the local env and authorised paid resources. It needs cloudflared and curl, exposes only the engine, and requires `PUBLIC_BASE_URL`/`ALLOWED_HOSTS` to match the tunnel. Venue headers, LAN routing and the phone secure context remain to verify. Build before using the engine's HTTPS tunnel for the live camera; plain LAN HTTP stays read-only.

Evaluation and evidence checks:

```bash
npm run eval -w @shelfie/eval -- --mode stub --out /tmp/shelfie-eval
npm run verify-ledger -w @shelfie/evidence -- apps/engine/data/evidence-ledger.jsonl
node --import tsx scripts/fund-check.ts
```

The eval calls the same `evaluate` function in-process, without HTTP. Stub/synthetic output is explicitly NOT evidence. Live eval needs Lorenz's reviewed labels, local photos and owner-authorised `VISION_*` credentials; see [eval/README.md](eval/README.md). The ten-photo [REWE draft](eval/labels.rewe-2026-10-30.draft.json) needs Lorenz's review: blurry photos are intentional negatives and this set has no challenge codes, so it cannot establish G2 accuracy or full-verifier acceptance. Fund-check without addresses/key makes no network request; real balances are unverified.

### Fake and real switches

| Name | Rehearsal | Real/evidence requirement |
|---|---|---|
| `NETWORK` | `preprod` | `preprod` only |
| `FAKE_PAYMENTS` | `1` | `0`; authorised, funded W-PAY and W-VBUY |
| `VERIFIER_PAYMENT` | `off` | `on`; actual x402 receipt |
| `VERIFY_CLIENT` | `fake` (default with fake payments) | `real` |
| `PAYMENTS_IMPL` | `package` with fake adapter; optional `engine-fake` | `package` |
| `VERIFIER_MODE` | `stub` | `live`, evaluated provider/model |
| `ENABLE_DRY` | implied true by payment off unless explicitly disabled | false |
| `SELLER_ADDRESS` | unnecessary for fake client | required payee pin for real paid verification |
| `PAYOUT_DAILY_CAP_LOVELACE` | default 50000000 | set the agreed budget; per-payout hard cap remains 5000000 |
| `VISION_RUN_CAP` | optional positive integer | set a finite agreed call budget |
| `ALLOW_TEST_UPLOAD`, `ALLOW_DEMO_OVERRIDE` | false by default | false |
| `LOCATION_CHECK` | on by default | on |
| `EVIDENCE_RUN_LOCKED` | false | true locks reset; it does not certify an otherwise fake run |
| `X_ENGINE_TOKEN_REQUIRED` | optional in dev | true with matching engine token |

Mnemonics and keys are server-only. Web imports `@shelfie/core/browser` and `@shelfie/evidence/explorer`; neither pulls Node built-ins or server env names into the bundle. Queue state defaults to `payout-queue.json` beside `STORE_PATH`; all default engine data is git-ignored. Queue events and engine verdicts share the evidence ledger.

## Verify Friday status

No on-chain milestone was completed by this pass. Record externally confirmed answers with source/time in [docs/verified.md](docs/verified.md); retain transaction evidence in [docs/evidence](docs/evidence/README.md).

| Owner | Item | Current state / next verification |
|---|---|---|
| A | Masumi starter and official template pin, `answer` seam, task id and deadline types, no-hash withholding, ids-only input schema | Bridge exists; clone/pin and inspect starter; execute unpaid task first |
| A | Sokosumi select fields, free-text-to-ids fallback, decline before payment vs refund after lock, submit deadline/refund timing | Unverified; use catalogs and retain `REJECTED_INPUT` on intake rejection |
| A | Contract proposals | Extra error codes `forbidden`/`payment_required`/`invalid_transition`; verify request price ranges/reference price and `claimExpiresAt`; GET job/config and claim-release response shapes; ledger kind list; undocumented defaults still need consumer review |
| A | Engine limits | Worker session cookie deferred: `workerId` in body for now; W-VBUY health balance remains zero outside fakes; tunnel admin restriction, approximate Munich box and override coverage still open; PNG upload unsupported |
| B | Hosted x402, 1 vs 2 tADA minimum, receipt `transaction` decoding, duplicate retry charge, seller pin | Implemented and fixture-tested; no paid hosted-facilitator run or explorer confirmation |
| B | ADR-04 plain transfer, metadata label 674/msg shape, Blockfrost preprod REST shapes and confirmations, timeout reconciliation | Adapter and fault-injection queue exist; no real transfer. Check by Fri 13:00 or apply ADR-04 fallback. Queue observer exceptions are suppressed in payments; audit ledger durability before evidence |
| B | Funding variables | Public `WALLET_ADDRESS_VBUY/PAY/MPS` now validated centrally; balances/faucet limits/cool-down still unverified |
| B + A | Hub scripts | App script names exist; socket startup/smoke blocked here by sandbox EPERM. Verify cloudflared URL parsing, tunnel headers, HUB_LAN_IP, full descendant cleanup on hub stop; hub-check, bundle-check, evidence-preflight and purge helpers remain unbuilt |
| C | Real vision | Provider/model ids/base URLs from env; one real call per adapter and image JSON mode/token/temperature support unverified; shell ZAI image support unknown |
| C | Evaluation | Catalog is read from research in place; 27 products without EAN are dropped and null ranges defaulted. Confirm catalog location, actual demo EANs, G1 variance floor 25 and all thresholds on 20 price + 8 OOS photos. Near-duplicate memory is process-local |
| C + D | Image library / labels | sharp 0.34.5 already in verifier/eval, pending Helmut's OK; REWE ten-photo draft pending Lorenz; blur is intentional. Prompt constants documented in verifier-rules §3 |
| D | Web and venue | Public subpaths and production bundle verified; real iOS/Android camera/GPS, dark mode, 130% text, Lighthouse, CIP-30 support and secure LAN/network isolation still unverified. Paste address remains default; reload loses active claim, health banner only detects empty wallets |
| D | Dashboard payload proposals | GET jobs lacks counts, no verdict-list endpoint, SSE task shape accepted in both forms; confirm with A before expanding contracts |
| D / all | Repo and release | Branch protection, secret scanning/push protection, starter audit, ignore-scripts support and recorded evidence still to confirm; no new dependencies without Helmut's OK and an exact pin ([library policy](../docs/open-source-libraries.md)) |

Local verification in this pass: Node 24 production build and socket-free regression checks can run; full HTTP tests, hub startup and smoke cannot pass in this sandbox because socket creation is refused. This is not evidence of a successful end-to-end run; rerun the commands above on the hub laptop.
