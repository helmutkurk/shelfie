# Isabel - role A
- Role and pair: A, pair with Fernando (B)
- GitHub: mariaisabel16
- Reviews: pair reviews each other's PRs first

## Current focus
Masumi starter pinned and running on the hub (Windows): M3 unpaid and M4 paid Tasks done with the starter's own prompt, M4 escrow settled to W-MPS (11:21 UTC). Next: wire the shell bridge into the starter (A-10), then a Shelfie registration and the withheld/refund path (A-12, M5).

## Active branch
`feature/a-shell-starter` from `dev` (repo work in WSL `~/shelfie`): starter pin and Windows patch, verified facts, M4 evidence rows, A-01 and A-02 done. Not pushed yet.

## Components I added
| Name | Path | What it does | How to run | Status | Depends on |
|---|---|---|---|---|---|
| Starter Windows patch | `codigo/apps/shell/starter.patch` | Lets the starter worker call the Sokosumi CLI on Windows (`sokosumi.cmd`) | `git -C codigo/apps/shell/starter apply ../starter.patch` | works | starter at `d93783b` |

## Hub state (Isabel's laptop)
- Running: Masumi Payment Service `:38127` (Postgres 16 Windows service), Eve agent `:21949`, agent API `:21950`, starter worker (paid tasks enabled). These run from a separate checkout of the starter with the same patch; moving them into the repo checkout is optional now that M4 has settled.
- Wallets in use: W-VBUY, W-SELL (x402), W-MPS (Masumi selling wallet, funded). W-PAY not created yet.

## Open questions
- Hub OS: `preparacion/hub-laptop.md` asks for Linux or macOS; the hub is Windows 11 and runs MPS, Postgres and the worker natively without Docker. Keep it or switch? (Helmut)
- `scripts/task.sh` does not run on native Windows (`fcntl`); repo work on this laptop now runs in WSL Ubuntu 22.04 (`~/shelfie`), where task.sh, hooks and `npm run check` pass. Native Windows support optional. (Fernando, scripts owner)
- Personal Workspace is unreachable with CLI 1.0.4 (404); tests ran in the TUM Workspace. OK for M3/M4 evidence? (team)

## Last updated
2026-10-30 ~12:15 Europe/Berlin by Claude (Isabel's session)
