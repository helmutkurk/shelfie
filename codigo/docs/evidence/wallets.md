# Wallets (public addresses only)

Network: Cardano preprod. Public addresses and balances only; mnemonics live in the local `.env` of the engine machine and in the team password manager, never here. Roles and env names: `../../scripts/setup-wallets.md`.

| Wallet | Role | Public address | Funded by | Checked |
|---|---|---|---|---|
| `W-VBUY` | engine pays the verifier (x402 buyer) | `addr_test1qpfzqn9cgf5m6cs7ghv60vj7qhjppuzm6cwf0mzxfv0ch75ajl3wd97306qw5qud3hv60zkqv7ycegq3gp5u53jfc8pqjuv0ut` | preprod faucet (10,000 tADA) | 9,797.66 tADA, Koios `address_info`, 2026-10-30 (Fernando B + Claude); input of tx `c217c669...` in `tx-hashes.md` |
| `W-MPS` | Masumi Payment Service seller wallet | `addr_test1qqy2pzzes7znqcusru56fche6fqhed0gvtqzvza79uqx22x35yw9yar6m4r9a6ah8fh8dvqmt3chckwmvflh7wy87qrq5q7825` | 200 tADA from `W-VBUY` (tx `c217c669...`) | output of that tx, Koios `tx_info` |
| `W-PAY` | engine pays workers | pending (B-02) | pending: about 200 tADA from `W-VBUY` | - |
| `W-SELL` | verifier receives x402 fees (address only) | pending (B-02) | needs no funds | - |
