"""
Automated, encrypted backups of the team database.

Runs as a background thread inside the server process -- no external
scheduler, no Task Scheduler, no admin rights needed (we already hit a
Group Policy wall trying that route). Every backup is a real SQLite-level
snapshot (via the sqlite3 backup API, not a raw file copy, so it's
consistent even while the server is actively being used), then encrypted
before it ever touches disk -- so a stolen or misplaced backup file is
useless without the separate key file.

Full-disk encryption (BitLocker) is still the right call for the live
database file itself if/when IT can enable it -- this covers the gap in
the meantime, and covers backups either way since they're the copies most
likely to end up somewhere unmonitored (a USB stick, a second machine).
"""

import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path

from cryptography.fernet import Fernet

DEFAULT_INTERVAL_SECONDS = 6 * 3600  # every 6 hours
DEFAULT_RETENTION_COUNT = 28  # ~1 week at 6h cadence


def load_or_create_key(path: Path) -> bytes:
    if path.is_file():
        return path.read_bytes()
    key = Fernet.generate_key()
    path.write_bytes(key)
    try:
        path.chmod(0o600)
    except OSError:
        pass
    return key


def create_backup(db_path: Path, backup_dir: Path, key: bytes) -> Path:
    """Snapshot the live database via SQLite's own backup API (safe under
    concurrent use, unlike copying the file), then encrypt the snapshot."""
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    tmp_plain = backup_dir / f".tmp-{timestamp}.db"
    encrypted_path = backup_dir / f"issues-{timestamp}.db.enc"

    src = sqlite3.connect(str(db_path))
    dst = sqlite3.connect(str(tmp_plain))
    with dst:
        src.backup(dst)
    src.close()
    dst.close()

    fernet = Fernet(key)
    plain_bytes = tmp_plain.read_bytes()
    encrypted_path.write_bytes(fernet.encrypt(plain_bytes))
    tmp_plain.unlink(missing_ok=True)
    return encrypted_path


def prune_old_backups(backup_dir: Path, keep: int = DEFAULT_RETENTION_COUNT):
    backups = sorted(backup_dir.glob("issues-*.db.enc"))
    for old in backups[:-keep] if len(backups) > keep else []:
        old.unlink(missing_ok=True)


def restore_backup(encrypted_path: Path, key: bytes, out_path: Path):
    fernet = Fernet(key)
    plain_bytes = fernet.decrypt(encrypted_path.read_bytes())
    out_path.write_bytes(plain_bytes)


def run_backup_loop(db_path: Path, backup_dir: Path, key: bytes,
                     interval_seconds: int = DEFAULT_INTERVAL_SECONDS,
                     retention: int = DEFAULT_RETENTION_COUNT,
                     stop_event: threading.Event | None = None):
    """Runs forever (until stop_event is set) taking a backup every
    interval_seconds. Intended to run in a daemon thread."""
    stop_event = stop_event or threading.Event()
    while not stop_event.is_set():
        try:
            path = create_backup(db_path, backup_dir, key)
            prune_old_backups(backup_dir, retention)
            print(f"[backup] Created {path.name}", flush=True)
        except Exception as exc:  # noqa: BLE001 -- a failed backup must never crash the server
            print(f"[backup] Backup failed: {exc}", flush=True)
        stop_event.wait(interval_seconds)


def start_backup_thread(db_path: Path, backup_dir: Path, key: bytes,
                         interval_seconds: int = DEFAULT_INTERVAL_SECONDS,
                         retention: int = DEFAULT_RETENTION_COUNT) -> threading.Thread:
    thread = threading.Thread(
        target=run_backup_loop,
        args=(db_path, backup_dir, key, interval_seconds, retention),
        daemon=True,
        name="backup-loop",
    )
    thread.start()
    return thread
