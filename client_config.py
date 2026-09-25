"""
Desktop client connection settings.

Reads config.json next to this file. Not committed with real values --
each team member's install points at the actual server. Kept as plain
JSON (not env vars) because it's the easier thing for a non-technical
teammate to edit if IT hands them an updated server address or cert.

    {
      "server_url": "https://rkc-server.capgemini.internal:8443",
      "server_cert_path": "server_cert.pem"
    }

`server_cert_path` is optional. Point it at the exact certificate the
server presents (copied from the server machine) and the client pins to
*that* certificate specifically, rather than trusting any certificate a
public CA happens to have signed -- appropriate for a closed system with
one known server. Once the server has a real, publicly-trusted
certificate for the server, drop `server_cert_path` entirely and normal
OS trust takes over.
"""

import json
import sys
from pathlib import Path

# When packaged with PyInstaller (sys.frozen), __file__ points inside the
# bundle, not next to the .exe -- config.json has to live next to the .exe
# so each teammate can edit it without touching the bundle. Running from
# source, next to this file is correct as before.
if getattr(sys, "frozen", False):
    APP_DIR = Path(sys.executable).resolve().parent
else:
    APP_DIR = Path(__file__).resolve().parent

CONFIG_PATH = APP_DIR / "config.json"

DEFAULTS = {
    # 127.0.0.1, not "localhost": on this stack, "localhost" resolves to
    # IPv6 first, the server only binds IPv4, and Python's requests library
    # has no Happy-Eyeballs fallback racing -- every request eats a ~2s
    # dead-end on ::1 before falling back to IPv4. Measured, not theoretical.
    "server_url": "https://127.0.0.1:8443",
    "server_cert_path": None,
}


def load_config() -> dict:
    if not CONFIG_PATH.is_file():
        return dict(DEFAULTS)
    try:
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return dict(DEFAULTS)
    config = dict(DEFAULTS)
    config.update({k: v for k, v in data.items() if k in DEFAULTS})
    return config


def verify_option(config: dict):
    """Value to pass as `requests`' `verify=` argument."""
    cert_path = config.get("server_cert_path")
    if cert_path:
        full_path = APP_DIR / cert_path
        if full_path.is_file():
            return str(full_path)
    return True
