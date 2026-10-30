# Deploy: auto-rebuild and public test access

Goal (Helmut, 2026-10-30): every push or merge rebuilds automatically and anyone can open the app for testing. Domain: `shelfieapp.me` (Student Pack .me). Test deployments run on fakes (`FAKE_PAYMENTS=1`, red banner) until the real switches are authorised; never present them as evidence.

## Architecture

```
 browser --> Vercel (personal scope, Git integration)
              app.shelfieapp.me  = branch main   (production)
              dev.shelfieapp.me  = branch dev    (and every push/PR preview)
              static apps/web build + rewrite /api/* ------+
                                                           v
 browser --> Cloudflare (DNS/proxy) --> named tunnel (outbound only from the hub laptop)
              api.shelfieapp.me      -> 127.0.0.1:4000  engine of main  (also serves /w, /dashboard)
              api-dev.shelfieapp.me  -> 127.0.0.1:4100  engine of dev
 hub laptop (systemd --user):
   shelfie-tunnel.service            cloudflared, config ~/.config/shelfie/cloudflared.yml
   shelfie-engine@main|dev.service   port 4000 | 4100
   shelfie-verifier@main|dev.service 4021 | 4121, loopback only, NOT in the tunnel
   shelfie-update@main|dev.timer     every 60 s: scripts/deploy/auto-update.sh <branch>
```

Same-origin alternative that always works with SSE: open `https://api.shelfieapp.me/w` (the engine serves the built web). Pointing `app.` at the tunnel instead of Vercel is a DNS change only.

### Backend auto-update (no inbound access, no self-hosted runner)
A public repo plus a self-hosted runner would let a fork PR run code on the laptop, so the laptop pulls instead. Each minute `auto-update.sh <branch>` fetches `origin/<branch>`. If the commit changed it: new release dir `~/shelfie-deploy/<branch>/releases/<sha>` (git worktree of a private clone), `npm ci`, `npm run check` (use `--skip-tests` only for speed in an emergency), web build, `version.json` next to the web build, then switch the `current` symlink and restart verifier and engine, followed by a health check. On any failure the previous release keeps running (rollback on a failed health check); the reason is in `journalctl --user -u 'shelfie-update@*'` and `~/.local/state/shelfie/<branch>.log`. Deployed commit: `~/.local/state/shelfie/<branch>.status` and `GET /version.json` on the engine (no change to `/api/health`, which is a contract). The script never reads env files; systemd loads `~/.config/shelfie/<branch>.env` via `EnvironmentFile=`.

### Vercel `/api` proxy (decision)
`codigo/vercel.json` (project Root Directory = `codigo`) holds two literal rewrites chosen by `has: host`: host `app.shelfieapp.me` -> `https://api.shelfieapp.me`; every other host (dev.shelfieapp.me, `*.vercel.app` previews) -> `https://api-dev.shelfieapp.me`. Vercel rewrites cannot read env vars, so the domain is literal in the file; if it changes, edit the three hostnames there, the templates and the env files together. No new dependency, no middleware.
Consequences and caveats:
- The browser keeps its own `Origin` (`https://app.shelfieapp.me`); the engine sees `Host: api...`. POSTs pass only because `ALLOWED_ORIGINS` lists the exact frontend origin (no wildcard, tested in `security.sec.test.ts`). Per-deployment URLs (`shelfie-git-x.vercel.app`) cannot be listed, so PR previews can read but their POSTs are refused (403); use `dev.shelfieapp.me` for testing.
- Verify Friday: that Vercel forwards `Host` as the destination host (else the engine answers 421), that `X-Admin-Token` and 2 MB JSON bodies pass, and that SSE (`/api/.../stream`) stays open through the rewrite (long-lived responses may be cut; EventSource reconnects, fallback is `api.shelfieapp.me/w`).
- CSP in `vercel.json` mirrors the engine's (`connect-src 'self'`) which is enough because `/api` is same-origin from the browser's view. Camera and geolocation need HTTPS, which Vercel provides.

## One-time setup (Helmut)

1. **Domain**: Namecheap via GitHub Student Pack: claim `shelfieapp.me`.
2. **Cloudflare** (free plan): add the site, then in Namecheap set the two Cloudflare nameservers shown. Wait until the site shows Active.
3. **Tunnel** (on the hub laptop, cloudflared installed):
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create shelfie            # prints the UUID, writes ~/.cloudflared/<UUID>.json
   cloudflared tunnel route dns shelfie api.shelfieapp.me
   cloudflared tunnel route dns shelfie api-dev.shelfieapp.me
   ```
   Do NOT route `app.` or `dev.` to the tunnel; they belong to Vercel.
4. **Vercel**: sign in with the PERSONAL account (never the wine2stay team), import `helmutkurk/shelfie`. Settings: Root Directory `codigo`, Framework Other, Node 24.x, production branch `main`; build/output come from `vercel.json`. No env vars are needed (the bundle has only public values; set none of the secrets there). Domains: `app.shelfieapp.me` (Production), `dev.shelfieapp.me` (assign to Git branch `dev`). Add the CNAME records Vercel shows in Cloudflare with proxy OFF (grey cloud).
5. **Hub laptop**:
   ```bash
   mkdir -p ~/.config/shelfie ~/.local/share/shelfie/main ~/.local/share/shelfie/dev
   bash scripts/deploy/install.sh --tunnel           # copies units, prints what is missing
   cp ~/.config/shelfie/branch.env.example ~/.config/shelfie/main.env   # edit, chmod 600
   cp ~/.config/shelfie/branch.env.example ~/.config/shelfie/dev.env    # dev: ports 4100/4121, api-dev, https://dev.shelfieapp.me, data dir dev
   cp ~/.config/shelfie/cloudflared.example.yml ~/.config/shelfie/cloudflared.yml   # set TUNNEL_UUID, HOME_DIR
   bash scripts/deploy/install.sh --tunnel           # second run enables what is now configured
   loginctl enable-linger "$USER"
   ```
   Tokens: `openssl rand -hex 32` three times per env file (ADMIN, SHELL, ENGINE differ). Env files live only in `~/.config/shelfie/`.
6. **Check**: `curl https://api.shelfieapp.me/api/health`, `curl https://api.shelfieapp.me/version.json`, open `https://app.shelfieapp.me/w` on a phone.

### Operate
- Logs: `journalctl --user -u 'shelfie-*' -f` (one service: `-u shelfie-engine@dev`). Status: `systemctl --user list-timers 'shelfie-*'`.
- Force a deploy now: `~/.local/share/shelfie/bin/auto-update.sh dev --force`.
- Stop everything: `systemctl --user stop 'shelfie-*'` (timers included); disable: `systemctl --user disable --now shelfie-update@main.timer shelfie-update@dev.timer shelfie-tunnel.service`.
- Manual hub (`npm run hub-up`) uses the same ports 4000/4021; stop the services first.

## Security (see `diseno/security.md`)
- Dashboard and admin are protected only by the operator token (`X-Admin-Token`, 32+ bytes). Cloudflare Access in front of `/dashboard` is optional later.
- `LOCATION_CHECK=on` on every public deployment; keep fake banners visible; fakes only until the real switches are authorised.
- Tunnel ingress lists only the two engine ports. Never expose the verifier (4021/4121), Payment Service, Postgres or SSH. After install: `ss -ltnp` must show only 127.0.0.1 binds besides cloudflared.
- Secrets only in `~/.config/shelfie/*.env` (chmod 600) and `~/.cloudflared/*.json`; nothing in Vercel, the repo or logs.
- `ALLOWED_ORIGINS` is an exact list; never add a wildcard or `*.vercel.app`.
