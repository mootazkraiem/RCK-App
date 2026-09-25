> **Running it on a work PC?** Read [WORK-PC-SETUP.md](WORK-PC-SETUP.md). The ready-to-run app is `RCK-Windows.zip`.

# Release Knowledge Capture — Shared Team Knowledge Base

A team-shared knowledge base for Expert Release / PDM issues. Two parts:
one server holding the shared, authoritative data, and a desktop client
each team member runs. Nothing is sent to any public cloud or external AI
service — the server runs on infrastructure Capgemini controls (a cloud VM
or an internal machine), reachable by every office that needs it — today
that's Romania, Germany, and Tunisia.

## Current pilot deployment (2026-08-01)

To get Romania/Germany/Tunisia usable fast, without a domain or cloud
account to wait on, the server is running as a pilot on a Capgemini
machine with a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
in front of it instead of a cloud VM + real domain:

- `python -m server.supervisor` keeps the server itself alive.
- `server/start_tunnel.bat` runs `cloudflared tunnel --url ...`, which
  opens an outbound-only connection to Cloudflare and gets back a public
  `https://*.trycloudflare.com` URL — no firewall or router changes
  needed, and Cloudflare's certificate is publicly trusted, so clients
  don't need a copy of `server_cert.pem` (`server_cert_path` is `null` in
  `config.json` for this reason).
- To make both of the above survive a reboot, run once, directly on the
  host machine:
  ```
  powershell -ExecutionPolicy Bypass -File server\install_autostart.ps1 -IncludeTunnel
  ```

**Known limitation of this setup**: that URL is randomly generated every
time `cloudflared` restarts, including after a machine reboot. If it
changes, every client's `config.json` → `server_url` goes stale until
updated. This is fine for an initial pilot but not for a real rollout —
next step is a free Cloudflare account + a real domain, which turns it
into a *named* tunnel with a URL that never changes. Also worth doing
once there's a spare hour: a real dedicated host (not someone's laptop
that might be shut down) for the server itself.

## Why two parts

A single SQLite file cannot be safely shared over a network drive — SQLite's
file-locking is unreliable on network filesystems, and multiple people
opening the same file that way leads to real corruption, not just
contention errors. The server owns the one database connection; every
client talks to it over HTTPS instead of touching a file directly. This
is also what makes the data auditable: every write is attributed to the
authenticated user who made it.

## 1. The server (`server/`)

Run this once, on one machine reachable by every office using it — a
cloud VM with a real domain name is the simplest option when the team is
spread across sites (as with Romania/Germany/Tunisia) that don't already
share a private network; a machine on a shared internal network works
too if one exists.

```
pip install -r server/requirements.txt
python -m server.main
```

First run generates a self-signed TLS certificate automatically (so the
server is never plaintext HTTP, even before a properly-issued one is in
place) and prints where it's stored. Copy that certificate file to each
client machine — see `client_config.py` below for how the client verifies
against it specifically, rather than trusting any certificate a public CA
happens to have signed. If the server has a real public domain name, get
a free certificate from Let's Encrypt instead and skip this step entirely
— across three countries, not having to hand-copy a cert file to every
client is worth doing.

**There is no self-registration.** Add each team member from the server
machine:

```
python -m server.create_user alice "Alice Engineer"
```

You'll be prompted for a password (not passed on the command line, so it
never ends up in shell history). To remove someone's access:

```
python -m server.create_user alice --deactivate
```

Server data lives in `%APPDATA%\ReleaseKnowledgeCaptureServer\` by default
(override with `RKC_SERVER_DATA_DIR`): the SQLite database, the
attachments folder, the TLS cert/key, and the token-signing secret.
Configure the listen address/port with `RKC_SERVER_HOST` / `RKC_SERVER_PORT`
(defaults `0.0.0.0:8443`), or point at a real certificate (e.g. from
Let's Encrypt) with `RKC_TLS_CERT` / `RKC_TLS_KEY` once one exists.

### Security choices, and why

- **Passwords**: hashed with `hashlib.scrypt` (memory-hard — more
  resistant to GPU/ASIC brute-forcing than plain PBKDF2), unique salt per
  user, never logged or stored in plaintext.
- **Sessions**: HMAC-SHA256 signed tokens (not JWT — avoids that library
  ecosystem's algorithm-confusion history), 12-hour expiry, and an
  account's access is re-checked on every request so deactivating someone
  takes effect immediately rather than waiting for their token to expire.
- **Login brute-forcing**: an account locks out for 15 minutes after 5
  failed attempts in a 15-minute window.
- **No CORS middleware.** The only client is this repo's own Python code,
  never a browser page, so there's no cross-origin use case — leaving CORS
  off narrows the attack surface rather than opening it "just in case."
- **Audit log**: every create/update/attachment/login is recorded with who
  did it and when (`GET /audit`).

## 2. The desktop client (`app.py`, `api.py`, `ui/`)

```
pip install -r requirements.txt
python app.py
```

Edit `config.json` to point at your server:

```json
{
  "server_url": "https://your-server-hostname:8443",
  "server_cert_path": "server_cert.pem"
}
```

`server_cert_path` should be the exact certificate file copied from the
server (see above) — the client pins to that specific certificate rather
than trusting any certificate a public CA has signed, which is the
appropriate model for a closed system with one known server. Once the
server has a real, publicly-trusted certificate (e.g. Let's Encrypt, or
one issued by Capgemini's internal CA), drop `server_cert_path` entirely
and normal OS certificate trust takes over — recommended once you're
distributing to offices in multiple countries, so nobody has to hand-copy
a cert file.

**All network calls happen in Python (`api.py`), never in the page's own
JavaScript** — the UI's Content-Security-Policy still has `connect-src
'none'`, so the webview's JS is structurally incapable of making a network
call of its own. The session token never touches the DOM/JS context.

## Features

- Sign in with your team account; a shared, authenticated login screen
  gates the whole app.
- Capture new issues: title, error code, applications involved, problem /
  root cause / resolution, ordered steps, optional attachments (screenshot,
  log, error report — real files, uploaded to the server, opened locally
  with the OS default handler).
- Click any issue to view it, then **Edit** in place, with Save/Cancel.
  Every issue records who created and who last updated it.
- Live search across titles, error codes, root causes, and resolutions.
- Applications are stored on the server, not hardcoded — add or remove
  them from the picker dropdown anywhere an application is selected.
- Sign out from the header when you're done.

### Scope notes (visual fidelity vs. real functionality)

The UI was designed to match a provided reference mockup. A couple of
elements from that mockup don't map to real backend functionality and were
deliberately left inert rather than faked:
- The notification bell shows a static "no notifications" message — there's
  no notification system to back a real badge count.
- The reference mockup's per-step screenshot control was folded into the
  single issue-level Attachments section instead of being duplicated per
  step.

## Structure

- `server/` — the shared server: `main.py` (FastAPI app), `store.py`
  (SQLite persistence + users/audit), `auth.py` (tokens, login rate
  limiting), `tls.py` (self-signed cert generation), `create_user.py`
  (account bootstrap CLI), `seed.py` (synthetic sample data, no real
  client data), `supervisor.py` (auto-restart loop),
  `install_autostart.ps1` (registers the restart loop to run at logon),
  `start_tunnel.bat` (Cloudflare Tunnel for the current pilot deployment,
  see above)
- `app.py` / `api.py` — desktop client entry point and network bridge
- `client_config.py` — reads `config.json` (server URL, pinned cert)
- `ui/` — HTML/CSS/JS front end
- `.archive/` — earlier single-user prototypes (Tkinter/ttkbootstrap UI,
  local-only SQLite store), kept for reference

## Known limitations (by design, for this stage)

- Login is username/password issued manually by whoever runs the server —
  no AD/SSO integration yet. Worth revisiting if Capgemini's AD becomes
  reachable from wherever the server runs.
- Password changes go through an in-app self-request + admin-approval
  flow (`POST /auth/password-change-request`, reviewed via `GET
  /password-requests`) — but that still requires being able to log in
  with the old password first. Someone fully locked out (forgot their
  password entirely) still needs an admin to fix it directly via the
  database's `hash_password()` function. Worth adding a real
  `create_user.py --reset-password <user>` path for that case before
  this scales past a pilot with a handful of admins fixing things by
  hand.
- No SQL Server/Postgres migration yet — SQLite behind the API server
  handles this team's scale comfortably, but the API layer is the seam to
  swap the storage engine later without touching the client.
- No PDM/SharePoint integration yet — later-phase items.
