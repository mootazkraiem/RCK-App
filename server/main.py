"""
Release Knowledge Capture -- shared team server.

Runs on one machine reachable by every office using it. Desktop clients
(the existing pywebview app) talk to this over HTTPS instead of opening a
local SQLite file, which is what makes multi-person concurrent access safe
(a single process owns the one database connection) and auditable (every
write is attributed to an authenticated user).

Designed for a network you control, not the open public internet: auth is
username/password with a login-attempt lockout, not something hardened
against internet-wide scanning/brute-forcing. If this ends up reachable
from the public internet (e.g. a cloud VM serving multiple countries with
no shared private network), put it behind a firewall that only allows the
API port, and consider adding IP allowlisting or a VPN in front of it.
No CORS middleware is configured -- the only client is our own Python
code, never a browser page, so there is no cross-origin use case to
support, and leaving CORS off narrows the attack surface.

Run:
    pip install -r server/requirements.txt
    python -m server.main
"""

import os
import re
from pathlib import Path
from typing import Optional

import uvicorn
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from server.auth import LoginRateLimiter, issue_token, load_or_create_secret, verify_token
from server.backup import DEFAULT_INTERVAL_SECONDS, DEFAULT_RETENTION_COUNT, load_or_create_key, start_backup_thread
from server.seed import DEFAULT_APPLICATIONS, SEED_ISSUES
from server.store import ISSUE_STATUSES, IssueStore, app_data_dir
from server.tls import ensure_self_signed_cert

DATA_DIR = app_data_dir()
DB_PATH = DATA_DIR / "issues.db"
SECRET_PATH = DATA_DIR / "server_secret.key"
BACKUP_DIR = DATA_DIR / "backups"
BACKUP_KEY_PATH = DATA_DIR / "backup_key.key"

store = IssueStore(DB_PATH)
store.seed_if_empty(SEED_ISSUES)
store.seed_applications_if_empty(DEFAULT_APPLICATIONS)
secret = load_or_create_secret(SECRET_PATH)
rate_limiter = LoginRateLimiter()

app = FastAPI(title="Release Knowledge Capture — Team Server")


# ------------------------------------------------------------------- auth
class LoginRequest(BaseModel):
    username: str
    password: str


def get_current_user(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")
    token = authorization[len("Bearer "):]
    username = verify_token(secret, token)
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")
    # Re-check is_active on every request (not just at login) so a
    # deactivated account loses access immediately, not just when its
    # token happens to expire.
    users = {u["username"]: u for u in store.list_users()}
    user = users.get(username)
    if user is None or not user["is_active"]:
        raise HTTPException(status_code=401, detail="Account no longer active.")
    return username


def _user_role(username: str) -> str:
    users = {u["username"]: u for u in store.list_users()}
    return users.get(username, {}).get("role", "technician")


def get_current_admin(user: str = Depends(get_current_user)) -> str:
    """Re-checks role from the DB on every request, same pattern as
    get_current_user's is_active check -- a revoked admin loses access to
    these endpoints immediately, not just when their token expires. Both
    'admin' and 'super_admin' count as admin-level for these actions."""
    if _user_role(user) not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="This action requires admin access.")
    return user


@app.post("/auth/login")
def login(body: LoginRequest):
    locked_for = rate_limiter.is_locked(body.username)
    if locked_for > 0:
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed attempts. Try again in {int(locked_for // 60) + 1} minute(s).",
        )
    user = store.verify_user(body.username, body.password)
    if user is None:
        rate_limiter.record_failure(body.username)
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    rate_limiter.record_success(body.username)
    token = issue_token(secret, user["username"])
    store.log_audit(user["username"], "login")
    return {**token, "username": user["username"], "displayName": user["display_name"],
            "role": user["role"]}


# ------------------------------------------------------------------ users
class CreateUserRequest(BaseModel):
    username: str
    password: str
    display_name: str = ""
    role: str  # "admin" or "technician" -- never "super_admin" over the API


@app.get("/users")
def list_users(user: str = Depends(get_current_admin)):
    return store.list_users()


@app.post("/users")
def create_user_endpoint(body: CreateUserRequest, user: str = Depends(get_current_admin)):
    requester_role = _user_role(user)
    if body.role not in ("admin", "technician"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'technician'.")
    if body.role == "admin" and requester_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only the super admin can create admin accounts.")
    try:
        new_user = store.create_user(body.username, body.password, body.display_name, role=body.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    store.log_audit(user, "create_user", None, f"{new_user['username']} ({body.role})")
    return new_user


@app.delete("/users/{username}")
def deactivate_user_endpoint(username: str, user: str = Depends(get_current_admin)):
    if username == user:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")
    users = {u["username"]: u for u in store.list_users()}
    target = users.get(username)
    if target is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if target["role"] == "super_admin":
        raise HTTPException(status_code=403, detail="Super admin accounts cannot be deactivated via the app.")
    if target["role"] == "admin" and _user_role(user) != "super_admin":
        raise HTTPException(status_code=403, detail="Only the super admin can deactivate an admin account.")
    store.deactivate_user(username)
    store.log_audit(user, "deactivate_user", None, username)
    return {"ok": True}


# --------------------------------------------------------- password requests
class PasswordChangeRequest(BaseModel):
    new_password: str


@app.post("/auth/password-change-request")
def request_password_change(body: PasswordChangeRequest, user: str = Depends(get_current_user)):
    """Any signed-in user can request a new password for themselves. It
    doesn't take effect until an admin or super_admin approves it below --
    a user can't unilaterally change their own password."""
    try:
        request = store.request_password_change(user, body.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    store.log_audit(user, "request_password_change", None, f"request #{request['id']}")
    return request


@app.get("/password-requests")
def list_password_requests(user: str = Depends(get_current_admin)):
    return store.list_password_requests(status="pending")


@app.post("/password-requests/{request_id}/approve")
def approve_password_request(request_id: int, user: str = Depends(get_current_admin)):
    result = store.approve_password_request(request_id, user)
    if result is None:
        raise HTTPException(status_code=404, detail="No pending request with that id.")
    store.log_audit(user, "approve_password_request", None, f"{result['username']} (request #{request_id})")
    return result


@app.post("/password-requests/{request_id}/reject")
def reject_password_request(request_id: int, user: str = Depends(get_current_admin)):
    result = store.reject_password_request(request_id, user)
    if result is None:
        raise HTTPException(status_code=404, detail="No pending request with that id.")
    store.log_audit(user, "reject_password_request", None, f"{result['username']} (request #{request_id})")
    return result


@app.get("/health")
def health():
    return {"ok": True}


# ------------------------------------------------------------ notifications
@app.get("/notifications")
def get_notifications(user: str = Depends(get_current_user)):
    result = store.list_notifications(user)
    result["pendingPasswordRequests"] = (
        store.list_password_requests(status="pending") if _user_role(user) in ("admin", "super_admin") else []
    )
    return result


@app.post("/notifications/seen")
def mark_notifications_seen(user: str = Depends(get_current_user)):
    store.mark_notifications_seen(user)
    return {"ok": True}


# ----------------------------------------------------------------- issues
ENTRY_TYPES = ("PROBLEM_SOLUTION", "INFORMATION", "PROCEDURE")


class IssueIn(BaseModel):
    title: str
    system: str = ""
    status: str = "review"
    type: str = "PROBLEM_SOLUTION"
    error: str = ""
    apps: list[str] = []
    problem: str = ""
    root: str = ""
    solution: str = ""
    steps: list[list[str]] = []
    topic: str = ""
    description: str = ""
    context: str = ""
    purpose: str = ""
    prerequisites: str = ""
    warnings: str = ""
    additionalInfo: str = ""


MAX_TITLE_LEN = 300
MAX_TEXT_LEN = 20000
MAX_STEPS = 200


def _validate_issue(issue: IssueIn) -> Optional[str]:
    if len(issue.title) > MAX_TITLE_LEN:
        return f"Title is too long (max {MAX_TITLE_LEN} characters)."
    for field in ("problem", "root", "solution", "topic", "description", "context",
                  "purpose", "prerequisites", "warnings", "additionalInfo", "error"):
        if len(getattr(issue, field)) > MAX_TEXT_LEN:
            return f"'{field}' is too long (max {MAX_TEXT_LEN} characters)."
    if len(issue.steps) > MAX_STEPS:
        return f"Too many steps (max {MAX_STEPS})."
    if issue.type not in ENTRY_TYPES:
        return f"Invalid type '{issue.type}'. Must be one of: {', '.join(ENTRY_TYPES)}."
    if issue.type == "PROBLEM_SOLUTION":
        missing = [f for f in ("title", "problem", "root", "solution") if not getattr(issue, f)]
        if missing:
            return "Missing required fields: " + ", ".join(missing)
        if not issue.apps or not issue.steps:
            return "Missing applications or steps."
    elif issue.type == "INFORMATION":
        missing = [f for f in ("title", "topic", "description") if not getattr(issue, f)]
        if missing:
            return "Missing required fields: " + ", ".join(missing)
    elif issue.type == "PROCEDURE":
        missing = [f for f in ("title", "purpose") if not getattr(issue, f)]
        if missing:
            return "Missing required fields: " + ", ".join(missing)
        if not issue.steps:
            return "Missing steps."
    if issue.status not in ISSUE_STATUSES:
        return f"Invalid status '{issue.status}'. Must be one of: {', '.join(ISSUE_STATUSES)}."
    return None


@app.get("/issues")
def list_issues(user: str = Depends(get_current_user)):
    return store.list_issues()


@app.get("/issues/search")
def search_issues(q: str = "", user: str = Depends(get_current_user)):
    return store.search(q)


@app.get("/issues/next-ref-id")
def next_ref_id(user: str = Depends(get_current_user)):
    return {"refId": store.next_ref_id()}


@app.get("/issues/{issue_id}")
def get_issue(issue_id: str, user: str = Depends(get_current_user)):
    issue = store.get_issue(issue_id)
    if issue is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    return issue


@app.get("/issues/{issue_id}/history")
def get_issue_history(issue_id: str, user: str = Depends(get_current_user)):
    if store.get_issue(issue_id) is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    return store.list_issue_history(issue_id)


@app.post("/issues")
def add_issue(body: IssueIn, user: str = Depends(get_current_user)):
    # Every new issue starts life at "review", regardless of what the client
    # sent -- only an edit (after creation) can move it further along the
    # workflow, and that edit is what the solved-lock below governs.
    body.status = "review"
    error = _validate_issue(body)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return store.add_issue(body.model_dump(), user)


@app.put("/issues/{issue_id}")
def update_issue(issue_id: str, body: IssueIn, user: str = Depends(get_current_user)):
    current = store.get_issue(issue_id)
    if current is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    is_admin = _user_role(user) in ("admin", "super_admin")
    if current["status"] == "solved" and not is_admin:
        raise HTTPException(
            status_code=403,
            detail="This issue is marked Solved -- only an admin can make further changes to it.",
        )
    # Content (title, problem, root cause, solution, steps, apps, error code)
    # is editable by anyone -- only the status/phase itself (review, in
    # progress, critical, cancelled, solved) requires an admin to change.
    if body.status != current["status"] and not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only an admin can change an issue's status.",
        )
    error = _validate_issue(body)
    if error:
        raise HTTPException(status_code=400, detail=error)
    updated = store.update_issue(issue_id, body.model_dump(), user)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    if is_admin and body.status != current["status"] and current["createdBy"] and current["createdBy"] != user:
        store.add_notification(
            current["createdBy"],
            f'{user} changed the status of "{current["title"]}" to {body.status.replace("_", " ").title()}',
            issue_id,
        )
    return updated


class CommentIn(BaseModel):
    message: str


@app.post("/issues/{issue_id}/comment")
def comment_on_issue(issue_id: str, body: CommentIn, user: str = Depends(get_current_admin)):
    """A reviewer sending feedback back to the author without deciding the
    issue yet ('Request changes' in the review UI) -- status is untouched,
    this only notifies the author. Admin-gated for the same reason status
    changes are: it's a review action, not a content edit."""
    current = store.get_issue(issue_id)
    if current is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    message = body.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Comment cannot be empty.")
    if current["createdBy"] and current["createdBy"] != user:
        store.add_notification(current["createdBy"], f'{user} requested changes on "{current["title"]}": {message}', issue_id)
    store.log_audit(user, "request_changes", issue_id, message)
    return {"ok": True}


# ------------------------------------------------------------ applications
class ApplicationIn(BaseModel):
    name: str


@app.get("/applications")
def list_applications(user: str = Depends(get_current_user)):
    return store.list_applications()


@app.post("/applications")
def add_application(body: ApplicationIn, user: str = Depends(get_current_user)):
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Application name cannot be empty.")
    return store.add_application(name, user)


@app.delete("/applications/{name}")
def delete_application(name: str, user: str = Depends(get_current_admin)):
    return store.delete_application(name, user)



_ISSUE_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$")


def _require_issue_id(issue_id: str) -> None:
    """Issue ids become directory names on disk. Anything that isn't a plain
    id (e.g. '..' smuggled in as %2e%2e) would let a signed-in user read the
    server's database or signing key through the attachment endpoints."""
    if not _ISSUE_ID_RE.match(issue_id or ""):
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")


def _require_attachment_edit_rights(issue_id: str, user: str) -> None:
    """Attachments are part of an entry's content, so the same solved-lock
    that guards edits applies: only an admin may change a solved entry."""
    current = store.get_issue(issue_id)
    if current is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    if current["status"] == "solved" and _user_role(user) not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=403,
            detail="This issue is marked Solved -- only an admin can change its attachments.",
        )

# ------------------------------------------------------------- attachments
@app.post("/issues/{issue_id}/attachments")
async def add_attachment(issue_id: str, kind: str, file: UploadFile = File(...),
                          user: str = Depends(get_current_user)):
    _require_issue_id(issue_id)
    _require_attachment_edit_rights(issue_id, user)
    data = await file.read()
    MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024
    if len(data) > MAX_ATTACHMENT_BYTES:
        raise HTTPException(status_code=413, detail="Attachment too large (25MB limit).")
    updated = store.add_attachment_bytes(issue_id, kind, file.filename or "attachment", data, user)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    return updated


@app.get("/issues/{issue_id}/attachments/{name}")
def download_attachment(issue_id: str, name: str, user: str = Depends(get_current_user)):
    _require_issue_id(issue_id)
    data = store.read_attachment(issue_id, name)
    if data is None:
        raise HTTPException(status_code=404, detail="That attachment no longer exists on the server.")
    return Response(content=data, media_type="application/octet-stream",
                     headers={"Content-Disposition": f'attachment; filename="{name}"'})


@app.delete("/issues/{issue_id}/attachments/{name}")
def remove_attachment(issue_id: str, name: str, user: str = Depends(get_current_user)):
    _require_issue_id(issue_id)
    _require_attachment_edit_rights(issue_id, user)
    updated = store.remove_attachment(issue_id, name, user)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"No issue found with id {issue_id}.")
    return updated


# ------------------------------------------------------------------ audit
@app.get("/audit")
def list_audit(user: str = Depends(get_current_admin)):
    return store.list_audit()


def main():
    host = os.environ.get("RKC_SERVER_HOST", "0.0.0.0")
    port = int(os.environ.get("RKC_SERVER_PORT", "8443"))

    cert_file = os.environ.get("RKC_TLS_CERT")
    key_file = os.environ.get("RKC_TLS_KEY")
    if not cert_file or not key_file:
        cert_path = DATA_DIR / "self_signed_cert.pem"
        key_path = DATA_DIR / "self_signed_key.pem"
        ensure_self_signed_cert(cert_path, key_path)
        cert_file, key_file = str(cert_path), str(key_path)
        print(f"[server] No RKC_TLS_CERT/RKC_TLS_KEY set -- using a self-signed certificate "
              f"at {cert_path}. Replace with a properly-issued certificate (e.g. Let's Encrypt) "
              f"when available.")

    backup_interval = int(os.environ.get("RKC_BACKUP_INTERVAL_SECONDS", DEFAULT_INTERVAL_SECONDS))
    backup_retention = int(os.environ.get("RKC_BACKUP_RETENTION_COUNT", DEFAULT_RETENTION_COUNT))
    backup_key = load_or_create_key(BACKUP_KEY_PATH)
    start_backup_thread(DB_PATH, BACKUP_DIR, backup_key, backup_interval, backup_retention)
    print(f"[server] Encrypted backups every {backup_interval // 3600}h -> {BACKUP_DIR} "
          f"(keeping last {backup_retention}).")

    print(f"[server] Data directory: {DATA_DIR}")
    print(f"[server] Listening on https://{host}:{port}")
    uvicorn.run(app, host=host, port=port, ssl_certfile=cert_file, ssl_keyfile=key_file)


if __name__ == "__main__":
    main()
