# Wallets (public addresses only)

Network: Cardano preprod. Public addresses and balances only; mnemonics live in the local `.env` of the engine machine and in the team password manager, never here. Roles and env names: `../../scripts/setup-wallets.md`.

| Wallet | Role | Public address | Funded by | Checked |
|---|---|---|---|---|
| `W-VBUY` | engine pays the verifier (x402 buyer) | `addr_test1qpfzqn9cgf5m6cs7ghv60vj7qhjppuzm6cwf0mzxfv0ch75ajl3wd97306qw5qud3hv60zkqv7ycegq3gp5u53jfc8pqjuv0ut` | preprod faucet (10,000 tADA), Thu 2026-10-29 16:42 UTC (before the build window, tool test), tx `d037650bca3f15efbd055b2cac1e12fe7db38a01da42194ffcce0d491a81f831` | 9,797.66 tADA, Koios `address_info`, 2026-10-30 (Fernando B + Claude); input of tx `c217c669...` in `tx-hashes.md` |
| `W-MPS` | Masumi Payment Service seller wallet | `addr_test1qqy2pzzes7znqcusru56fche6fqhed0gvtqzvza79uqx22x35yw9yar6m4r9a6ah8fh8dvqmt3chckwmvflh7wy87qrq5q7825` | 200 tADA from `W-VBUY` (tx `c217c669...`) | output of that tx, Koios `tx_info` |
| `W-PAY` | engine pays workers | `addr_test1qqdwvv24gk8kewxcx7dm4mkvyv9enkzuw2f9c8jjwfff8y74tqr2sy68lmvt3u96kcwddktdyn83rqtekarva04znu6se4fjxy` | preprod faucet (10,000 tADA), Fri 2026-10-30, tx `566b34c3...` in `tx-hashes.md` | 10,000 tADA, Koios `address_info`, 2026-10-30 (Isabel A + Claude) |
| `W-SELL` | verifier receives x402 fees (address only) | `addr_test1qz3edturjtvrytfy933t927942auguhd0wxkrxkdv0mumwph9ehp5qhzatv4x6rpwxs7adkwplkl2gsudfxk052frhcq3tnrpj` | needs no funds; received 2 tADA in the Thursday x402 tool test (tx `892b4387...`) | address derived from its recovery file on the hub (Isabel A + Claude) |

W-VBUY, W-PAY and W-SELL were generated on the hub (Isabel's laptop) with `@evolution-sdk/evolution` 0.5.14 from the x402 template (setup-wallets.md option 1); W-MPS by the Masumi Payment Service seed. Recovery files are git-ignored on the hub; hand them over privately.

## Demo worker wallets

Payout addresses for the four teammates acting as workers in the demo (receive only, no funding needed). Each person holds their own recovery phrase.

| Person | Role | Public address |
|---|---|---|
| Helmut | worker | `addr_test1qzrxvj340lml3mntcdv7m63w26eq703emumaz7ysarysuwa3zw0f9ytqk6z6hwvxcukm3gcmywz5elyws5mkgflfawrs48ukwt` |
| Isabel | worker | `addr_test1qpyc2zsham2gn649kck8rmjy27me7ydxgvxu7mdstn4xynuulakk68ef3nxncd87k9puuael87zwjzs6wzge4e95t87qdkdjcx` |
| Fernando | worker | `addr_test1qqnh8wm48f3lhjmttvxc8tqw6vk583ccshhhz7lwjawp654ppgpngcx2q5w2xrs8a2j0prh297w3x5gd4sryx566wqrsh39gsk` |
| Lorenz | worker | `addr_test1qrxr692jxhyq0u37vvqqnzdkt0ysm3a6gany5mk85p7hg2vzrlu7uy3aglsn5hnlxfpgc4dgtvrduyxqqym0axfn75hs9t9ge7` |
