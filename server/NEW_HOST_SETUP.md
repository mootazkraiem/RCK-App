# Moving the server to its own PC — setup checklist

Follow this in order, on the PC that's been assigned to host Release
Knowledge Capture. Run everything as the account that will stay logged in
on that machine (the scheduled tasks in the last step run at *that
account's* logon).

## 0. What the PC needs

- Windows 10/11 (the autostart/tunnel scripts here are Windows-specific).
- Python 3.10+ — check with `python --version`; install from
  python.org if missing.
- Outbound internet access. **No inbound ports need to be opened** —
  Cloudflare Tunnel only makes outbound connections, so this doesn't need
  anything from network/firewall admins.
- Stays powered on and logged in. Enabling auto-login for this account is
  worth doing so the scheduled tasks actually fire after a reboot.
- Modest resources — 2 vCPU / 4 GB RAM is comfortably enough for a
  FastAPI + SQLite server at this team's scale.

## 1. Get the code onto the machine

Copy the whole project folder over (USB, network share, or however's
easiest) to e.g. `C:\ReleaseKnowledgeCapture\`.

## 2. Install dependencies

```
cd C:\ReleaseKnowledgeCapture
pip install -r server\requirements.txt
```

(The root `requirements.txt` — pywebview, etc. — is only needed on
*client* machines running the desktop app, not on the server.)

## 3. Install cloudflared

```
winget install --id Cloudflare.cloudflared -e
```

## 4. First run — generates the TLS cert, database, and secrets

```
python -m server.main
```

Let it print `Listening on https://0.0.0.0:8443`, then Ctrl+C. This
creates everything under `%APPDATA%\ReleaseKnowledgeCaptureServer\`.

## 5. Create real user accounts

Do **not** copy the database from the old machine — create accounts
fresh here, properly, through the CLI (this avoids the kind of corrupted
password row we hit and had to hand-fix on the pilot machine):

```
python -m server.create_user admin "Admin Name" --role super_admin
python -m server.create_user alice "Alice Engineer"
```

You'll be prompted for each password interactively (never on the command
line). Repeat for every team member across Romania/Germany/Tunisia, or
just create the initial admin(s) and have them use "Manage Users" in the
app to add the rest.

## 6. Start the server + tunnel, and register both for autostart

```
powershell -ExecutionPolicy Bypass -File server\install_autostart.ps1 -IncludeTunnel
```

Watch the console output for the line:

```
Your quick Tunnel has been created! Visit it at ... https://<random-words>.trycloudflare.com
```

That URL is what goes in every client's `config.json`.

## 7. Point every client at the new server

On each teammate's machine, edit `config.json` next to `app.py`:

```json
{
  "server_url": "https://<the-url-from-step-6>",
  "server_cert_path": null
}
```

## 8. Decommission the old pilot machine

Once the new host is confirmed working (log in, create/view an issue),
stop the server and tunnel processes on the original pilot laptop so
there's only one authoritative server running.

## Next step after this is stable

Move from the quick tunnel (URL changes on every reboot) to a Cloudflare
named tunnel with a fixed hostname — needs a free Cloudflare account and
a domain. See the README's "Current pilot deployment" section.
