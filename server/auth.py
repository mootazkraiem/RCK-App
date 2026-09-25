"""
Session tokens and login-attempt rate limiting.

Tokens are HMAC-SHA256 signed, not JWT -- a hand-rolled signed payload
avoids pulling in a JWT library and the algorithm-confusion class of bugs
that library ecosystem has a history of. The signing secret is generated
once and persisted with restricted file permissions so tokens survive a
server restart.
"""

import base64
import hashlib
import hmac
import json
import os
import threading
import time
from pathlib import Path

TOKEN_TTL_SECONDS = 12 * 3600  # re-login every 12 hours
LOCKOUT_THRESHOLD = 5
LOCKOUT_WINDOW_SECONDS = 15 * 60
LOCKOUT_DURATION_SECONDS = 15 * 60


def load_or_create_secret(path: Path) -> bytes:
    if path.is_file():
        return path.read_bytes()
    secret = os.urandom(32)
    path.write_bytes(secret)
    try:
        path.chmod(0o600)
    except OSError:
        pass
    return secret


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def issue_token(secret: bytes, username: str) -> dict:
    payload = {"u": username, "exp": time.time() + TOKEN_TTL_SECONDS}
    payload_bytes = json.dumps(payload).encode()
    sig = hmac.new(secret, payload_bytes, hashlib.sha256).digest()
    token = f"{_b64(payload_bytes)}.{_b64(sig)}"
    return {"token": token, "expiresAt": payload["exp"]}


def verify_token(secret: bytes, token: str) -> str | None:
    """Return the username if the token is valid and unexpired, else None."""
    try:
        payload_b64, sig_b64 = token.split(".", 1)
        payload_bytes = _unb64(payload_b64)
        sig = _unb64(sig_b64)
    except Exception:
        # Malformed client input (bad base64, missing separator, etc.) is
        # just an invalid token, not a server error -- never crash on it.
        return None
    expected_sig = hmac.new(secret, payload_bytes, hashlib.sha256).digest()
    if not hmac.compare_digest(sig, expected_sig):
        return None
    try:
        payload = json.loads(payload_bytes)
    except ValueError:
        return None
    if payload.get("exp", 0) < time.time():
        return None
    return payload.get("u")


class LoginRateLimiter:
    """In-memory per-username lockout after repeated failed logins.

    Resets on server restart, which is an acceptable tradeoff for a small
    internal team tool -- the alternative (persisting attempt history) adds
    schema and cleanup complexity for a marginal benefit at this scale.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._failures: dict[str, list[float]] = {}
        self._locked_until: dict[str, float] = {}

    def is_locked(self, username: str) -> float:
        """Returns seconds remaining locked, or 0 if not locked."""
        with self._lock:
            until = self._locked_until.get(username, 0)
            remaining = until - time.time()
            return max(0.0, remaining)

    def record_failure(self, username: str):
        now = time.time()
        with self._lock:
            attempts = [t for t in self._failures.get(username, []) if now - t < LOCKOUT_WINDOW_SECONDS]
            attempts.append(now)
            self._failures[username] = attempts
            if len(attempts) >= LOCKOUT_THRESHOLD:
                self._locked_until[username] = now + LOCKOUT_DURATION_SECONDS
                self._failures[username] = []

    def record_success(self, username: str):
        with self._lock:
            self._failures.pop(username, None)
            self._locked_until.pop(username, None)
