"""
JS-callable API exposed into the pywebview window as `window.pywebview.api`.

This is now a thin network client, not a local database wrapper: every
method (except `login`/`pick_file`) makes an HTTPS call to the shared team
server (see server/main.py) so the app's data lives in one authoritative
place instead of a per-laptop SQLite file.

All network traffic happens here, in Python -- never from the page's own
JavaScript. The page's Content-Security-Policy still has `connect-src
'none'`, which means the webview's JS is structurally incapable of making
a network call of its own even if something in the UI layer were
compromised; only this reviewed Python code ever talks to the server, and
the session token never touches the DOM/JS context.
"""

import json
import os
import subprocess
import sys
import tempfile

import re
import requests
import webview

from client_config import CONFIG_PATH, load_config, verify_option

# Trust whatever the OS already trusts (Windows' SChannel store, etc.)
# instead of only the public CAs bundled in certifi. This matters
# specifically for corporate networks running TLS-inspecting proxies
# (Zscaler and similar): IT already pushes that proxy's root certificate
# into the OS trust store via Group Policy -- that's the whole reason a
# normal browser passes through it without complaint. requests/urllib3
# don't consult the OS store by default, so without this, every user on
# such a network hits an unresolvable certificate error the first time
# they connect, with no fix short of manually exporting and pinning that
# proxy's certificate by hand on every single machine. Confirmed this
# exact failure mode firsthand. Falls back to certifi's default list if
# the package isn't installed, so this degrades safely rather than
# breaking startup.
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

REQUEST_TIMEOUT = 15


class Api:
    def __init__(self):
        self.config = load_config()
        self.base_url = self.config["server_url"].rstrip("/")
        self.verify = verify_option(self.config)
        # Leading underscore is load-bearing, not style: pywebview's JS-API
        # generator walks every *public* attribute on this object via dir()
        # to build window.pywebview.api, recursing into any non-callable
        # attribute it finds. A public `window` attribute here gets walked
        # straight into the real native Window -> its native .NET Form ->
        # Form.AccessibilityObject.Bounds, a System.Drawing.Rectangle whose
        # .Empty property returns a *new* Rectangle wrapper object on every
        # access (pythonnet mints a fresh wrapper per value-type read) --
        # which defeats pywebview's id()-based cycle guard and recurses
        # until Python's recursion limit blows up. That's a confirmed,
        # reproducible cause of this app hanging/freezing on startup.
        # Underscore-prefixed attributes are skipped by that walk entirely.
        self._window = None  # set by app.py once the pywebview window exists
        self._token = None
        self._username = None
        self._display_name = None
        self._role = "technician"
        # A fresh connection (full TCP + TLS handshake) per call was costing
        # 700ms-1s on every single click through the tunnel -- a reused
        # Session keeps the connection alive, dropping repeat calls to
        # ~100ms. Measured with a real load test, not a guess.
        self._session = requests.Session()

    # --------------------------------------------------------------- http
    def _headers(self):
        headers = {}
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        return headers

    def _request(self, method, path, **kwargs):
        url = f"{self.base_url}{path}"
        try:
            resp = self._session.request(
                method, url, headers=self._headers(), verify=self.verify,
                timeout=REQUEST_TIMEOUT, **kwargs,
            )
        except requests.exceptions.SSLError as exc:
            return None, {"apiError": f"Could not verify the server's certificate: {exc}"}
        except requests.exceptions.RequestException as exc:
            return None, {"apiError": f"Could not reach the server at {self.base_url}: {exc}"}

        if resp.status_code == 401:
            self._token = None
            return None, {"apiError": "Your session has expired. Please log in again.", "needsLogin": True}
        if resp.status_code == 429:
            detail = _error_detail(resp)
            return None, {"apiError": detail}
        if resp.status_code >= 400:
            detail = _error_detail(resp)
            return None, {"apiError": detail}
        return resp, None

    # --------------------------------------------------------------- auth
    def get_server_url(self):
        return self.base_url

    def set_server_url(self, url):
        """Point this install at a new server address (Quick Tunnel hostnames
        change every time the tunnel restarts). The address is only saved if
        it actually answers /health, so a typo can't lock anyone out."""
        url = (url or "").strip().rstrip("/")
        if not re.match(r"^https?://[^\s/]+", url):
            return {"apiError": "Enter the full address, starting with https://"}
        try:
            resp = requests.get(f"{url}/health", verify=self.verify, timeout=10)
            healthy = resp.status_code == 200 and resp.json().get("ok") is True
        except (requests.exceptions.RequestException, ValueError) as exc:
            return {"apiError": f"Could not reach {url}: {exc}"}
        if not healthy:
            return {"apiError": f"{url} answered, but it does not look like an RCK server."}
        try:
            try:
                data = json.loads(CONFIG_PATH.read_text(encoding="utf-8")) if CONFIG_PATH.is_file() else {}
            except (OSError, ValueError):
                data = {}
            data["server_url"] = url
            CONFIG_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        except OSError as exc:
            return {"apiError": f"Reached the server, but could not save the new address: {exc}"}
        self.base_url = url
        self.config["server_url"] = url
        self._token = None
        return {"ok": True, "serverUrl": url}

    def login(self, username, password):
        try:
            resp = self._session.post(
                f"{self.base_url}/auth/login",
                json={"username": username, "password": password},
                verify=self.verify, timeout=REQUEST_TIMEOUT,
            )
        except requests.exceptions.SSLError as exc:
            return {"apiError": f"Could not verify the server's certificate: {exc}"}
        except requests.exceptions.RequestException as exc:
            return {"apiError": f"Could not reach the server at {self.base_url}: {exc}"}

        if resp.status_code != 200:
            return {"apiError": _error_detail(resp)}

        body = resp.json()
        self._token = body["token"]
        self._username = body["username"]
        self._display_name = body["displayName"]
        self._role = body.get("role", "technician")
        return {"ok": True, "username": self._username, "displayName": self._display_name}

    def logout(self):
        self._token = None
        self._username = None
        self._display_name = None
        self._role = "technician"
        return {"ok": True}

    def connection_info(self):
        return {"serverUrl": self.base_url, "username": self._username,
                "displayName": self._display_name, "role": self._role}

    # ------------------------------------------------------ notifications
    def get_notifications(self):
        resp, err = self._request("GET", "/notifications")
        return err if err else resp.json()

    def mark_notifications_seen(self):
        resp, err = self._request("POST", "/notifications/seen")
        return err if err else resp.json()

    # ------------------------------------------------------------- users
    def list_users(self):
        resp, err = self._request("GET", "/users")
        return err if err else resp.json()

    def create_user(self, username, password, display_name, role):
        resp, err = self._request(
            "POST", "/users",
            json={"username": username, "password": password, "display_name": display_name, "role": role},
        )
        return err if err else resp.json()

    def deactivate_user(self, username):
        resp, err = self._request("DELETE", f"/users/{username}")
        return err if err else resp.json()

    # --------------------------------------------------- password requests
    def request_password_change(self, new_password):
        resp, err = self._request("POST", "/auth/password-change-request", json={"new_password": new_password})
        return err if err else resp.json()

    def list_password_requests(self):
        resp, err = self._request("GET", "/password-requests")
        return err if err else resp.json()

    def approve_password_request(self, request_id):
        resp, err = self._request("POST", f"/password-requests/{request_id}/approve")
        return err if err else resp.json()

    def reject_password_request(self, request_id):
        resp, err = self._request("POST", f"/password-requests/{request_id}/reject")
        return err if err else resp.json()

    # ------------------------------------------------------------- issues
    def list_issues(self):
        resp, err = self._request("GET", "/issues")
        return err if err else resp.json()

    def search_issues(self, query):
        resp, err = self._request("GET", "/issues/search", params={"q": query or ""})
        return err if err else resp.json()

    def get_issue(self, issue_id):
        resp, err = self._request("GET", f"/issues/{issue_id}")
        return err if err else resp.json()

    def get_issue_history(self, issue_id):
        resp, err = self._request("GET", f"/issues/{issue_id}/history")
        return [] if err else resp.json()

    def list_audit(self):
        resp, err = self._request("GET", "/audit")
        return err if err else resp.json()

    def next_ref_id(self):
        resp, err = self._request("GET", "/issues/next-ref-id")
        return "REF-…" if err else resp.json()["refId"]

    def add_issue(self, issue):
        resp, err = self._request("POST", "/issues", json=issue)
        return err if err else resp.json()

    def update_issue(self, issue_id, issue):
        resp, err = self._request("PUT", f"/issues/{issue_id}", json=issue)
        return err if err else resp.json()

    def comment_issue(self, issue_id, message):
        resp, err = self._request("POST", f"/issues/{issue_id}/comment", json={"message": message})
        return err if err else resp.json()

    # -------------------------------------------------------- applications
    def list_applications(self):
        resp, err = self._request("GET", "/applications")
        return [] if err else resp.json()

    def add_application(self, name):
        resp, err = self._request("POST", "/applications", json={"name": name})
        return err if err else resp.json()

    def delete_application(self, name):
        resp, err = self._request("DELETE", f"/applications/{name}")
        return err if err else resp.json()

    # -------------------------------------------------------- attachments
    def pick_file(self):
        """Open a native OS file picker and return the chosen path, or None.
        Purely local -- no network call, the file never leaves this machine
        until add_attachment explicitly uploads it."""
        if self._window is None:
            return None
        result = self._window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=False)
        if not result:
            return None
        return result[0]

    def add_attachment(self, issue_id, kind, source_path):
        try:
            with open(source_path, "rb") as fh:
                data = fh.read()
        except OSError as exc:
            return {"apiError": f"Could not read {source_path}: {exc}"}
        filename = os.path.basename(source_path)
        resp, err = self._request(
            "POST", f"/issues/{issue_id}/attachments",
            params={"kind": kind},
            files={"file": (filename, data)},
        )
        return err if err else resp.json()

    def remove_attachment(self, issue_id, name):
        resp, err = self._request("DELETE", f"/issues/{issue_id}/attachments/{name}")
        return err if err else resp.json()

    def open_attachment(self, issue_id, name):
        """Download the file from the server to a local temp path and open
        it with the OS default handler -- the server holds the canonical
        copy, so this always fetches the current version."""
        resp, err = self._request("GET", f"/issues/{issue_id}/attachments/{name}")
        if err:
            return err
        tmp_dir = os.path.join(tempfile.gettempdir(), "ReleaseKnowledgeCapture", issue_id)
        os.makedirs(tmp_dir, exist_ok=True)
        local_path = os.path.join(tmp_dir, name)
        with open(local_path, "wb") as fh:
            fh.write(resp.content)
        try:
            if sys.platform.startswith("win"):
                os.startfile(local_path)  # noqa: S606 -- opening a file this session just downloaded
            elif sys.platform == "darwin":
                subprocess.run(["open", local_path], check=False)
            else:
                subprocess.run(["xdg-open", local_path], check=False)
        except OSError as exc:
            return {"apiError": f"Could not open file: {exc}"}
        return {"ok": True}


def _error_detail(resp):
    try:
        return resp.json().get("detail", f"Server returned {resp.status_code}.")
    except ValueError:
        return f"Server returned {resp.status_code}."
