"""
Decrypts an encrypted backup snapshot back into a usable SQLite file.

Usage:
    python -m server.restore_backup <path-to-issues-TIMESTAMP.db.enc> <output-path.db>

Reads the backup encryption key from the server's data directory
(backup_key.key) automatically, or pass --key <path> to point at a copy
of the key kept elsewhere (e.g. if restoring on a different machine).
"""

import argparse
from pathlib import Path

from server.backup import restore_backup
from server.store import app_data_dir


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("backup_path", type=Path, help="Path to the .db.enc backup file")
    parser.add_argument("output_path", type=Path, help="Where to write the decrypted .db file")
    parser.add_argument("--key", type=Path, default=None,
                         help="Path to backup_key.key (defaults to the server's data directory)")
    args = parser.parse_args()

    key_path = args.key or (app_data_dir() / "backup_key.key")
    if not key_path.is_file():
        raise SystemExit(f"Backup key not found at {key_path}. Pass --key to point at the right one.")
    if not args.backup_path.is_file():
        raise SystemExit(f"Backup file not found: {args.backup_path}")
    if args.output_path.exists():
        raise SystemExit(f"Refusing to overwrite existing file: {args.output_path}")

    key = key_path.read_bytes()
    restore_backup(args.backup_path, key, args.output_path)
    print(f"Restored {args.backup_path.name} -> {args.output_path}")


if __name__ == "__main__":
    main()
