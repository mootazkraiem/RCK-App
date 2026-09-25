"""
Server-side SQLite data store for Release Knowledge Capture.

This is the shared, authoritative database -- it lives on one machine
reachable by every office using it and is only ever touched by
server/main.py. Desktop
clients never open this file directly; they talk to it over the network
API, which is what makes concurrent multi-person access safe (SQLite's
file-locking is not reliable across network filesystems, but a single
process owning one connection, serialized by a lock, is fine).

Every write is attributed to the authenticated user who made it
(created_by / updated_by / audit_log), since a shared knowledge base with
anonymous edits is a governance gap, not a convenience.
"""

import base64
import hashlib
import hmac
import json
import os
import shutil
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path

ISSUE_STATUSES = ("review", "in_progress", "critical", "cancelled", "solved")

# Three-tier hierarchy: a technician can create/edit non-solved issues; an
# admin additionally reviews issues (locks/unlocks solved ones, deletes
# applications, reads the audit log) and can create technician accounts;
# the super admin can additionally create admin accounts. Creating a
# super_admin is deliberately NOT exposed anywhere in the network API --
# it only ever happens via direct server access (create_user.py), so a
# compromised admin/super_admin session can never mint another super admin.
ROLES = ("technician", "admin", "super_admin")

SCHEMA = """
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    system TEXT,
    status TEXT NOT NULL DEFAULT 'review',
    error_code TEXT,
    apps_json TEXT NOT NULL,
    problem TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    attachments_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT NOT NULL DEFAULT '',
    updated_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
    name TEXT PRIMARY KEY,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_n INTEGER NOT NULL DEFAULT 16384,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    role TEXT NOT NULL DEFAULT 'technician'
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    at TEXT NOT NULL,
    username TEXT NOT NULL,
    action TEXT NOT NULL,
    issue_id TEXT,
    detail TEXT
);

CREATE TABLE IF NOT EXISTS password_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    new_password_salt TEXT NOT NULL,
    new_password_hash TEXT NOT NULL,
    new_password_n INTEGER NOT NULL DEFAULT 8192,
    requested_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_by TEXT,
    reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS notification_state (
    username TEXT PRIMARY KEY,
    last_seen_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    issue_id TEXT,
    created_at TEXT NOT NULL
);
"""


def app_data_dir() -> Path:
    """Server-side data directory. Overridable via RKC_SERVER_DATA_DIR so
    the server's storage location isn't tied to whichever account runs it."""
    override = os.environ.get("RKC_SERVER_DATA_DIR")
    if override:
        d = Path(override)
    elif os.name == "nt":
        base = os.environ.get("APPDATA") or str(Path.home())
        d = Path(base) / "ReleaseKnowledgeCaptureServer"
    else:
        base = os.environ.get("XDG_DATA_HOME") or str(Path.home() / ".local" / "share")
        d = Path(base) / "ReleaseKnowledgeCaptureServer"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------- passwords
# scrypt (memory-hard) rather than plain PBKDF2 -- more resistant to
# GPU/ASIC brute-forcing, and it's in the stdlib so no extra dependency.
#
# N is stored per-user (users.password_n) rather than as a single fixed
# constant, so it can change over time without breaking existing accounts.
# Lowered from 2**14 to 2**13 after a real load test: memory-hard hashing
# is deliberately resistant to being parallelized, which is the whole point
# against an attacker, but it means legitimate concurrent logins fight over
# memory bandwidth too -- 40 simultaneous logins at 2**14 took 6+ seconds
# apiece; halving N trades some brute-force resistance for much better
# concurrent-login behavior at this team's scale, with account lockout
# after 5 failed attempts already covering online brute-forcing.
_SCRYPT_N_CURRENT = 2 ** 13
_SCRYPT_R = 8
_SCRYPT_P = 1
_SCRYPT_DKLEN = 64


def hash_password(password: str, salt: bytes | None = None, n: int = _SCRYPT_N_CURRENT) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"), salt=salt,
        n=n, r=_SCRYPT_R, p=_SCRYPT_P, dklen=_SCRYPT_DKLEN,
    )
    return base64.b64encode(salt).decode(), base64.b64encode(digest).decode()


def verify_password(password: str, salt_b64: str, hash_b64: str, n: int) -> bool:
    salt = base64.b64decode(salt_b64)
    _, computed = hash_password(password, salt, n=n)
    return hmac.compare_digest(computed, hash_b64)


class IssueStore:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._lock = threading.Lock()
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        # WAL lets reads (list/search/get, the bulk of traffic from a team
        # this size) proceed without blocking behind a write, instead of
        # SQLite's default rollback-journal mode where every write briefly
        # locks the whole file. Paired with the standard NORMAL sync level,
        # which trades a negligible durability window (loses at most the
        # last commit on an OS crash, not on a process crash) for a real
        # write-latency improvement -- the right tradeoff once more than a
        # couple of people are hitting this at once.
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA synchronous=NORMAL")
        self.conn.executescript(SCHEMA)

        existing_cols = {r["name"] for r in self.conn.execute("PRAGMA table_info(issues)")}
        if "attachments_json" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN attachments_json TEXT NOT NULL DEFAULT '[]'")
        if "created_by" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN created_by TEXT NOT NULL DEFAULT ''")
        if "updated_by" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN updated_by TEXT NOT NULL DEFAULT ''")
        # Knowledge types beyond the original Problem/Solution issue model --
        # every existing row is a real Problem/Solution entry, so that's the
        # safe default for entry_type. The type-specific columns are only
        # ever populated for their own type and stay NULL otherwise.
        if "entry_type" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN entry_type TEXT NOT NULL DEFAULT 'PROBLEM_SOLUTION'")
        if "topic" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN topic TEXT")
        if "description" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN description TEXT")
        if "context" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN context TEXT")
        if "purpose" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN purpose TEXT")
        if "prerequisites" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN prerequisites TEXT")
        if "warnings" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN warnings TEXT")
        if "additional_info" not in existing_cols:
            self.conn.execute("ALTER TABLE issues ADD COLUMN additional_info TEXT")
        # "draft" predates the review/in_progress/critical/cancelled/solved
        # workflow -- fold any leftover draft rows into "review" (the new
        # starting state) so old data doesn't end up with an invalid status.
        self.conn.execute("UPDATE issues SET status = 'review' WHERE status = 'draft'")

        user_cols = {r["name"] for r in self.conn.execute("PRAGMA table_info(users)")}
        if "is_admin" in user_cols and "role" not in user_cols:
            # Upgrading from the earlier single is_admin boolean to the
            # three-tier role model. Every existing admin becomes plain
            # 'admin' here; promoting the actual super admin account is a
            # deployment-specific bootstrap step (see server/create_user.py
            # --set-role), not something this migration should hardcode.
            self.conn.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'technician'")
            self.conn.execute("UPDATE users SET role = 'admin' WHERE is_admin = 1")
            try:
                self.conn.execute("ALTER TABLE users DROP COLUMN is_admin")
            except sqlite3.OperationalError:
                pass  # older SQLite without DROP COLUMN support -- harmless leftover column
        elif "role" not in user_cols:
            self.conn.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'technician'")
        if "password_n" not in user_cols:
            # Existing rows were actually hashed with the old N=2**14 --
            # the DEFAULT here preserves that so their passwords keep
            # verifying correctly. New rows get _SCRYPT_N_CURRENT explicitly
            # at creation, not this default.
            self.conn.execute("ALTER TABLE users ADD COLUMN password_n INTEGER NOT NULL DEFAULT 16384")

        pwreq_cols = {r["name"] for r in self.conn.execute("PRAGMA table_info(password_requests)")}
        if "new_password_n" not in pwreq_cols:
            self.conn.execute("ALTER TABLE password_requests ADD COLUMN new_password_n INTEGER NOT NULL DEFAULT 16384")

        cur = self.conn.execute("SELECT value FROM counters WHERE name='ref'")
        if cur.fetchone() is None:
            self.conn.execute("INSERT INTO counters(name, value) VALUES ('ref', 1)")
        self.conn.commit()

    def _row_to_issue(self, row: sqlite3.Row) -> dict:
        return {
            "id": row["id"],
            "title": row["title"],
            "system": row["system"],
            "status": row["status"],
            "type": row["entry_type"] or "PROBLEM_SOLUTION",
            "error": row["error_code"] or "",
            "apps": json.loads(row["apps_json"]),
            "problem": row["problem"],
            "root": row["root_cause"],
            "solution": row["solution"],
            "steps": json.loads(row["steps_json"]),
            "topic": row["topic"] or "",
            "description": row["description"] or "",
            "context": row["context"] or "",
            "purpose": row["purpose"] or "",
            "prerequisites": row["prerequisites"] or "",
            "warnings": row["warnings"] or "",
            "additionalInfo": row["additional_info"] or "",
            "attachments": json.loads(row["attachments_json"] or "[]"),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
            "createdBy": row["created_by"],
            "updatedBy": row["updated_by"],
        }

    # ------------------------------------------------------------- issues
    def list_issues(self) -> list:
        with self._lock:
            cur = self.conn.execute("SELECT * FROM issues ORDER BY created_at ASC")
            return [self._row_to_issue(r) for r in cur.fetchall()]

    def next_ref_id(self) -> str:
        with self._lock:
            cur = self.conn.execute("SELECT value FROM counters WHERE name='ref'")
            n = cur.fetchone()["value"]
            return f"REF-{datetime.now().year}-{n:03d}"

    def add_issue(self, issue: dict, username: str) -> dict:
        with self._lock:
            cur = self.conn.execute("SELECT value FROM counters WHERE name='ref'")
            n = cur.fetchone()["value"]
            ref_id = f"REF-{datetime.now().year}-{n:03d}"
            now = _now()
            self.conn.execute(
                """INSERT INTO issues
                   (id, title, system, status, entry_type, error_code, apps_json, problem,
                    root_cause, solution, steps_json, topic, description, context,
                    purpose, prerequisites, warnings, additional_info, attachments_json,
                    created_at, updated_at, created_by, updated_by)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    ref_id,
                    issue["title"],
                    issue.get("system", ""),
                    issue.get("status", "review"),
                    issue.get("type", "PROBLEM_SOLUTION"),
                    issue.get("error", ""),
                    json.dumps(issue.get("apps", [])),
                    issue.get("problem", ""),
                    issue.get("root", ""),
                    issue.get("solution", ""),
                    json.dumps(issue.get("steps", [])),
                    issue.get("topic", ""),
                    issue.get("description", ""),
                    issue.get("context", ""),
                    issue.get("purpose", ""),
                    issue.get("prerequisites", ""),
                    issue.get("warnings", ""),
                    issue.get("additionalInfo", ""),
                    "[]",
                    now, now, username, username,
                ),
            )
            self.conn.execute("UPDATE counters SET value = value + 1 WHERE name='ref'")
            self.conn.execute(
                "INSERT INTO audit_log (at, username, action, issue_id, detail) VALUES (?,?,?,?,?)",
                (now, username, "create_issue", ref_id, issue.get("title", "")),
            )
            self.conn.commit()
            return self._get_issue_locked(ref_id)

    def get_issue(self, issue_id: str) -> dict | None:
        with self._lock:
            return self._get_issue_locked(issue_id)

    def update_issue(self, issue_id: str, issue: dict, username: str) -> dict | None:
        with self._lock:
            if self._get_issue_locked(issue_id) is None:
                return None
            now = _now()
            self.conn.execute(
                """UPDATE issues SET
                       title = ?, system = ?, status = ?, error_code = ?,
                       apps_json = ?, problem = ?, root_cause = ?, solution = ?,
                       steps_json = ?, topic = ?, description = ?, context = ?,
                       purpose = ?, prerequisites = ?, warnings = ?, additional_info = ?,
                       updated_at = ?, updated_by = ?
                   WHERE id = ?""",
                (
                    issue["title"],
                    issue.get("system", ""),
                    issue.get("status", "review"),
                    issue.get("error", ""),
                    json.dumps(issue.get("apps", [])),
                    issue.get("problem", ""),
                    issue.get("root", ""),
                    issue.get("solution", ""),
                    json.dumps(issue.get("steps", [])),
                    issue.get("topic", ""),
                    issue.get("description", ""),
                    issue.get("context", ""),
                    issue.get("purpose", ""),
                    issue.get("prerequisites", ""),
                    issue.get("warnings", ""),
                    issue.get("additionalInfo", ""),
                    now, username,
                    issue_id,
                ),
            )
            self.conn.execute(
                "INSERT INTO audit_log (at, username, action, issue_id, detail) VALUES (?,?,?,?,?)",
                (now, username, "update_issue", issue_id, issue.get("title", "")),
            )
            self.conn.commit()
            return self._get_issue_locked(issue_id)

    def _get_issue_locked(self, issue_id: str) -> dict | None:
        cur = self.conn.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
        row = cur.fetchone()
        return self._row_to_issue(row) if row else None

    def attachments_dir(self, issue_id: str) -> Path:
        base = (self.db_path.parent / "attachments").resolve()
        d = (base / issue_id).resolve()
        if d.parent != base:
            raise ValueError("Invalid issue id.")
        d.mkdir(parents=True, exist_ok=True)
        return d

    def add_attachment_bytes(self, issue_id: str, kind: str, filename: str, data: bytes, username: str) -> dict | None:
        """Store an uploaded file's bytes directly (the server owns storage;
        clients send bytes over the API, never a local filesystem path)."""
        safe_name = Path(filename).name or "attachment"
        with self._lock:
            current = self._get_issue_locked(issue_id)
            if current is None:
                return None
            dest_dir = self.attachments_dir(issue_id)
            dest = dest_dir / safe_name
            counter = 1
            stem, suffix = Path(safe_name).stem, Path(safe_name).suffix
            while dest.exists():
                dest = dest_dir / f"{stem}({counter}){suffix}"
                counter += 1
            dest.write_bytes(data)

            attachments = current["attachments"]
            attachments.append({"name": dest.name, "kind": kind, "addedAt": _now(), "addedBy": username})
            now = _now()
            self.conn.execute(
                "UPDATE issues SET attachments_json = ?, updated_at = ?, updated_by = ? WHERE id = ?",
                (json.dumps(attachments), now, username, issue_id),
            )
            self.conn.execute(
                "INSERT INTO audit_log (at, username, action, issue_id, detail) VALUES (?,?,?,?,?)",
                (now, username, "add_attachment", issue_id, dest.name),
            )
            self.conn.commit()
            return self._get_issue_locked(issue_id)

    def read_attachment(self, issue_id: str, name: str) -> bytes | None:
        path = self.attachments_dir(issue_id) / Path(name).name
        if not path.is_file():
            return None
        return path.read_bytes()

    def remove_attachment(self, issue_id: str, name: str, username: str) -> dict | None:
        with self._lock:
            current = self._get_issue_locked(issue_id)
            if current is None:
                return None
            attachments = [a for a in current["attachments"] if a["name"] != name]
            now = _now()
            self.conn.execute(
                "UPDATE issues SET attachments_json = ?, updated_at = ?, updated_by = ? WHERE id = ?",
                (json.dumps(attachments), now, username, issue_id),
            )
            self.conn.execute(
                "INSERT INTO audit_log (at, username, action, issue_id, detail) VALUES (?,?,?,?,?)",
                (now, username, "remove_attachment", issue_id, name),
            )
            self.conn.commit()
            file_path = self.attachments_dir(issue_id) / Path(name).name
            if file_path.is_file():
                file_path.unlink(missing_ok=True)
            return self._get_issue_locked(issue_id)

    def search(self, query: str) -> list:
        query = (query or "").strip()
        if not query:
            return self.list_issues()
        like = f"%{query}%"
        with self._lock:
            cur = self.conn.execute(
                """SELECT * FROM issues WHERE
                   title LIKE ? OR error_code LIKE ? OR problem LIKE ? OR
                   root_cause LIKE ? OR solution LIKE ? OR id LIKE ? OR apps_json LIKE ?
                   ORDER BY created_at ASC""",
                (like, like, like, like, like, like, like),
            )
            return [self._row_to_issue(r) for r in cur.fetchall()]

    # ------------------------------------------------------- applications
    def list_applications(self) -> list:
        with self._lock:
            cur = self.conn.execute("SELECT name FROM applications ORDER BY name COLLATE NOCASE ASC")
            return [r["name"] for r in cur.fetchall()]

    def add_application(self, name: str, username: str) -> list:
        name = name.strip()
        with self._lock:
            self.conn.execute(
                "INSERT OR IGNORE INTO applications (name, created_at) VALUES (?, ?)",
                (name, _now()),
            )
            self.conn.execute(
                "INSERT INTO audit_log (at, username, action, issue_id, detail) VALUES (?,?,?,?,?)",
                (_now(), username, "add_application", None, name),
            )
            self.conn.commit()
            cur = self.conn.execute("SELECT name FROM applications ORDER BY name COLLATE NOCASE ASC")
            return [r["name"] for r in cur.fetchall()]

    def delete_application(self, name: str, username: str) -> list:
        with self._lock:
            self.conn.execute("DELETE FROM applications WHERE name = ?", (name,))
            self.conn.execute(
                "INSERT INTO audit_log (at, username, action, issue_id, detail) VALUES (?,?,?,?,?)",
                (_now(), username, "delete_application", None, name),
            )
            self.conn.commit()
            cur = self.conn.execute("SELECT name FROM applications ORDER BY name COLLATE NOCASE ASC")
            return [r["name"] for r in cur.fetchall()]

    def seed_applications_if_empty(self, names: list):
        with self._lock:
            cur = self.conn.execute("SELECT COUNT(*) AS c FROM applications")
            if cur.fetchone()["c"] > 0:
                return
            now = _now()
            self.conn.executemany(
                "INSERT OR IGNORE INTO applications (name, created_at) VALUES (?, ?)",
                [(n, now) for n in names],
            )
            self.conn.commit()

    def seed_if_empty(self, seed_issues: list):
        with self._lock:
            cur = self.conn.execute("SELECT COUNT(*) AS c FROM issues")
            if cur.fetchone()["c"] > 0:
                return
            for issue in seed_issues:
                now = _now()
                self.conn.execute(
                    """INSERT INTO issues
                       (id, title, system, status, error_code, apps_json, problem,
                        root_cause, solution, steps_json, created_at, updated_at,
                        created_by, updated_by)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        issue["id"],
                        issue["title"],
                        issue.get("system", ""),
                        issue.get("status", "review"),
                        issue.get("error", ""),
                        json.dumps(issue.get("apps", [])),
                        issue["problem"],
                        issue["root"],
                        issue["solution"],
                        json.dumps(issue.get("steps", [])),
                        now, now, "seed", "seed",
                    ),
                )
            self.conn.execute(
                "UPDATE counters SET value = ? WHERE name='ref'", (len(seed_issues) + 1,)
            )
            self.conn.commit()

    # ---------------------------------------------------------------- users
    MIN_PASSWORD_LENGTH = 8

    def create_user(self, username: str, password: str, display_name: str = "",
                     role: str = "technician") -> dict:
        username = username.strip()
        if not username or not password:
            raise ValueError("Username and password are required.")
        if len(password) < self.MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {self.MIN_PASSWORD_LENGTH} characters.")
        if role not in ROLES:
            raise ValueError(f"Role must be one of: {', '.join(ROLES)}.")
        salt_b64, hash_b64 = hash_password(password)  # CPU-heavy -- outside the lock
        with self._lock:
            existing = self.conn.execute(
                "SELECT username FROM users WHERE username = ?", (username,)
            ).fetchone()
            if existing:
                raise ValueError(f"User '{username}' already exists.")
            self.conn.execute(
                """INSERT INTO users (username, password_salt, password_hash, password_n, display_name, created_at, is_active, role)
                   VALUES (?,?,?,?,?,?,1,?)""",
                (username, salt_b64, hash_b64, _SCRYPT_N_CURRENT, display_name or username, _now(), role),
            )
            self.conn.commit()
        return {"username": username, "display_name": display_name or username, "role": role}

    def verify_user(self, username: str, password: str) -> dict | None:
        with self._lock:
            row = self.conn.execute(
                "SELECT * FROM users WHERE username = ? AND is_active = 1", (username,)
            ).fetchone()
        if row is None:
            return None
        # Each user's own stored password_n (not the current default) --
        # this is what makes lowering _SCRYPT_N_CURRENT safe for existing
        # accounts, which were hashed under the old, higher N.
        if not verify_password(password, row["password_salt"], row["password_hash"], row["password_n"]):  # CPU-heavy -- outside the lock
            return None
        return {"username": row["username"], "display_name": row["display_name"], "role": row["role"]}

    def deactivate_user(self, username: str) -> None:
        with self._lock:
            self.conn.execute("UPDATE users SET is_active = 0 WHERE username = ?", (username,))
            self.conn.commit()

    def set_role(self, username: str, role: str) -> None:
        if role not in ROLES:
            raise ValueError(f"Role must be one of: {', '.join(ROLES)}.")
        with self._lock:
            row = self.conn.execute("SELECT username FROM users WHERE username = ?", (username,)).fetchone()
            if row is None:
                raise ValueError(f"User '{username}' does not exist.")
            self.conn.execute("UPDATE users SET role = ? WHERE username = ?", (role, username))
            self.conn.commit()

    def list_users(self) -> list:
        with self._lock:
            cur = self.conn.execute(
                "SELECT username, display_name, created_at, is_active, role FROM users ORDER BY username"
            )
            return [dict(r) for r in cur.fetchall()]

    # ---------------------------------------------------- password requests
    # A user can't change their own password unilaterally -- the new
    # password is hashed immediately (never held in plain text, even
    # transiently) and sits pending until an admin or super_admin approves
    # it. This is deliberately not restricted to super_admin-only the way
    # creating an admin account is; any admin-level user can review these.
    def request_password_change(self, username: str, new_password: str) -> dict:
        if len(new_password) < self.MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {self.MIN_PASSWORD_LENGTH} characters.")
        salt_b64, hash_b64 = hash_password(new_password)  # CPU-heavy -- outside the lock
        with self._lock:
            row = self.conn.execute("SELECT username FROM users WHERE username = ?", (username,)).fetchone()
            if row is None:
                raise ValueError(f"User '{username}' does not exist.")
            cur = self.conn.execute(
                """INSERT INTO password_requests (username, new_password_salt, new_password_hash, new_password_n, requested_at, status)
                   VALUES (?,?,?,?,?,'pending')""",
                (username, salt_b64, hash_b64, _SCRYPT_N_CURRENT, _now()),
            )
            self.conn.commit()
            return {"id": cur.lastrowid, "username": username, "status": "pending"}

    def list_password_requests(self, status: str = "pending") -> list:
        with self._lock:
            if status:
                cur = self.conn.execute(
                    "SELECT id, username, requested_at, status, reviewed_by, reviewed_at "
                    "FROM password_requests WHERE status = ? ORDER BY requested_at",
                    (status,),
                )
            else:
                cur = self.conn.execute(
                    "SELECT id, username, requested_at, status, reviewed_by, reviewed_at "
                    "FROM password_requests ORDER BY requested_at DESC"
                )
            return [dict(r) for r in cur.fetchall()]

    def approve_password_request(self, request_id: int, reviewer: str) -> dict | None:
        with self._lock:
            row = self.conn.execute(
                "SELECT * FROM password_requests WHERE id = ? AND status = 'pending'", (request_id,)
            ).fetchone()
            if row is None:
                return None
            self.conn.execute(
                "UPDATE users SET password_salt = ?, password_hash = ?, password_n = ? WHERE username = ?",
                (row["new_password_salt"], row["new_password_hash"], row["new_password_n"], row["username"]),
            )
            self.conn.execute(
                "UPDATE password_requests SET status = 'approved', reviewed_by = ?, reviewed_at = ? WHERE id = ?",
                (reviewer, _now(), request_id),
            )
            self.conn.commit()
            return {"id": request_id, "username": row["username"], "status": "approved"}

    def reject_password_request(self, request_id: int, reviewer: str) -> dict | None:
        with self._lock:
            row = self.conn.execute(
                "SELECT * FROM password_requests WHERE id = ? AND status = 'pending'", (request_id,)
            ).fetchone()
            if row is None:
                return None
            self.conn.execute(
                "UPDATE password_requests SET status = 'rejected', reviewed_by = ?, reviewed_at = ? WHERE id = ?",
                (reviewer, _now(), request_id),
            )
            self.conn.commit()
            return {"id": request_id, "username": row["username"], "status": "rejected"}

    # ------------------------------------------------------------- audit
    def log_audit(self, username: str, action: str, issue_id: str | None = None, detail: str = ""):
        with self._lock:
            self.conn.execute(
                "INSERT INTO audit_log (at, username, action, issue_id, detail) VALUES (?,?,?,?,?)",
                (_now(), username, action, issue_id, detail),
            )
            self.conn.commit()

    def list_audit(self, limit: int = 200) -> list:
        with self._lock:
            cur = self.conn.execute(
                "SELECT * FROM audit_log ORDER BY id DESC LIMIT ?", (limit,)
            )
            return [dict(r) for r in cur.fetchall()]

    def list_issue_history(self, issue_id: str) -> list:
        """Who touched this specific issue and when -- every create, edit,
        and attachment change, newest first. Open to any signed-in user
        (not admin-only like the full /audit log), since knowing who wrote
        what on a shared knowledge-base entry is exactly the kind of thing
        the whole team benefits from seeing, not just admins."""
        with self._lock:
            cur = self.conn.execute(
                "SELECT at, username, action, detail FROM audit_log "
                "WHERE issue_id = ? ORDER BY id DESC",
                (issue_id,),
            )
            return [dict(r) for r in cur.fetchall()]

    # ------------------------------------------------------- notifications
    # Two kinds, deliberately handled differently -- same split Teams/FB
    # use: "to-do" items (pending password requests) persist until resolved
    # and always show regardless of read state; "FYI" items (a new issue a
    # teammate posted, your own request getting resolved) clear once seen.
    def _get_or_init_last_seen(self, username: str) -> str:
        with self._lock:
            row = self.conn.execute(
                "SELECT last_seen_at FROM notification_state WHERE username = ?", (username,)
            ).fetchone()
            if row:
                return row["last_seen_at"]
            # First time this user's notifications are ever checked --
            # baseline to now rather than flooding them with the entire
            # history of the knowledge base as "unread."
            now = _now()
            self.conn.execute(
                "INSERT INTO notification_state (username, last_seen_at) VALUES (?, ?)",
                (username, now),
            )
            self.conn.commit()
            return now

    def mark_notifications_seen(self, username: str) -> None:
        with self._lock:
            now = _now()
            self.conn.execute(
                "INSERT INTO notification_state (username, last_seen_at) VALUES (?, ?) "
                "ON CONFLICT(username) DO UPDATE SET last_seen_at = excluded.last_seen_at",
                (username, now),
            )
            self.conn.commit()

    def list_notifications(self, username: str) -> dict:
        with self._lock:
            known = self.conn.execute(
                "SELECT 1 FROM notification_state WHERE username = ?", (username,)
            ).fetchone() is not None
        last_seen = self._get_or_init_last_seen(username)
        # Baselining to "now" on a user's very first check is right for the
        # shared feed (no flood of old entries) but wrong for items addressed
        # to this user personally -- those must never be swallowed.
        personal_since = last_seen if known else ""
        with self._lock:
            new_issues = self.conn.execute(
                "SELECT id, title, created_by, created_at FROM issues "
                "WHERE created_by != ? AND created_at > ? ORDER BY created_at DESC LIMIT 20",
                (username, last_seen),
            ).fetchall()
            my_resolved_requests = self.conn.execute(
                "SELECT id, status, reviewed_at FROM password_requests "
                "WHERE username = ? AND status != 'pending' AND reviewed_at > ? "
                "ORDER BY reviewed_at DESC",
                (username, personal_since),
            ).fetchall()
            direct = self.conn.execute(
                "SELECT id, message, issue_id, created_at FROM notifications "
                "WHERE username = ? AND created_at > ? ORDER BY created_at DESC",
                (username, personal_since),
            ).fetchall()
        return {
            "lastSeenAt": last_seen,
            "newIssues": [dict(r) for r in new_issues],
            "myResolvedRequests": [dict(r) for r in my_resolved_requests],
            "direct": [dict(r) for r in direct],
        }

    def add_notification(self, username: str, message: str, issue_id: str | None = None) -> None:
        """A direct, event-driven notification -- e.g. 'an admin changed
        the status of your issue'. Unlike newIssues/myResolvedRequests
        (derived by querying existing tables against a last-seen cutoff),
        this is for events that don't map onto an existing queryable
        table/timestamp."""
        with self._lock:
            self.conn.execute(
                "INSERT INTO notifications (username, message, issue_id, created_at) VALUES (?,?,?,?)",
                (username, message, issue_id, _now()),
            )
            self.conn.commit()
