# Isabel - role A
- Role and pair: A, pair with Fernando (B)
- GitHub: mariaisabel16
- Reviews: pair reviews each other's commits first (peer review, `scripts/peer-review.sh`)

## Current focus
M3 (A-10) and M5 done through the bridge: paid Task withheld, no result hash, escrow refunded. One input format for all channels (`bridge/catalog-input.js`): dashboard ids, Sokosumi dropdown indices, labels and free text. Next: post the withhold comment on the Sokosumi Task (A-12), Shelfie agent registration, M4 with the real engine and a real photo (with B and C).

## Active branch
`feature/a-shell-catalog-input` from `dev` (repo work in WSL `~/shelfie`): catalog input resolver, agent-api dropdown schema, M5 evidence.

## Components I added
| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Starter Windows patch | `codigo/apps/shell/starter.patch` | Starter worker calls the Sokosumi CLI on Windows (`sokosumi.cmd`); `client.mjs` uses the bridge when `SHELL_TOKEN` is set | `git -C codigo/apps/shell/starter apply ../starter.patch` | works | starter at `d93783b` |
| Starter answer adapter | `codigo/apps/shell/bridge/starter-answer.js` | Maps the starter's `answer(input, journal, deadline)` to `bridge.run`; DELIVER returns the report, WITHHOLD throws | `cd codigo && npm test -w @shelfie/shell` | works (fakes) | shell bridge |

## Hub state (Isabel's laptop)
- Windows, from `C:\Users\maria\shelfie-team\codigo\apps\shell\starter` (repo checkout, patched): starter worker with the bridge, `PAID_TASKS_ENABLED=false`.
- Windows, from the earlier starter checkout `C:\Users\maria\shelfie`: Eve `:21949`, agent API `:21950` (model path), Masumi Payment Service `:38127` (Postgres 16 Windows service).
- WSL: engine on fakes `:4000` (reachable from Windows through localhost forwarding).
- Wallets in use: W-VBUY, W-SELL (x402), W-MPS (Masumi selling wallet, funded). W-PAY not created yet.

## Open questions
- Hub OS: `preparacion/hub-laptop.md` asks for Linux or macOS; the hub is Windows 11 and runs MPS, Postgres and the worker natively without Docker. Keep it or switch? (Helmut)
- `scripts/task.sh` does not run on native Windows (`fcntl`); repo work on this laptop runs in WSL Ubuntu 22.04 (`~/shelfie`). Native Windows support optional. (Fernando, scripts owner)
- Personal Workspace is unreachable with CLI 1.0.4 (404); tests ran in the TUM Workspace. OK for M3/M4 evidence? (team)
- Sokosumi credits: 16 left; each paid Task costs 100. Top-up asked in the organisers' Telegram. (Isabel)

## Last updated
2026-10-30 ~13:05 Europe/Berlin by Claude (Isabel's session)
