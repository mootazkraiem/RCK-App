"""
Keeps the team server running: restarts it automatically if it crashes,
and is what the "start at login" scheduled task points at (see
install_autostart.ps1) so the server survives a reboot without anyone
having to remember to open a terminal.

This is deliberately a plain restart loop, not a full Windows Service --
that's a reasonable next step (via NSSM or pywin32) once there's time to
test service-install/uninstall/permissions properly, but a restart loop
gets most of the reliability benefit today with much less that can go
wrong right before a demo.

Run directly:
    python -m server.supervisor
"""

import subprocess
import sys
import time
from datetime import datetime, timezone

RESTART_DELAY_SECONDS = 3
# If it keeps crashing immediately (bad config, port in use, etc.), don't
# spin the CPU restarting forever -- back off after a few rapid failures.
RAPID_FAILURE_WINDOW_SECONDS = 30
RAPID_FAILURE_LIMIT = 5
BACKOFF_SECONDS = 30


def log(msg: str):
    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    print(f"[supervisor] {ts} {msg}", flush=True)


def main():
    recent_failures = []
    log("Starting supervised server loop. Ctrl+C to stop supervising (also stops the server).")

    while True:
        start_time = time.monotonic()
        log("Launching server.main ...")
        proc = subprocess.Popen([sys.executable, "-m", "server.main"])

        try:
            exit_code = proc.wait()
        except KeyboardInterrupt:
            log("Received interrupt -- stopping server and exiting.")
            proc.terminate()
            try:
                proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                proc.kill()
            return

        ran_for = time.monotonic() - start_time
        log(f"Server exited (code {exit_code}) after {ran_for:.1f}s.")

        now = time.monotonic()
        recent_failures = [t for t in recent_failures if now - t < RAPID_FAILURE_WINDOW_SECONDS]
        recent_failures.append(now)
        if len(recent_failures) >= RAPID_FAILURE_LIMIT:
            log(f"Server has crashed {len(recent_failures)} times in "
                f"{RAPID_FAILURE_WINDOW_SECONDS}s -- backing off for {BACKOFF_SECONDS}s "
                f"instead of restart-looping.")
            time.sleep(BACKOFF_SECONDS)
            recent_failures = []
        else:
            log(f"Restarting in {RESTART_DELAY_SECONDS}s ...")
            time.sleep(RESTART_DELAY_SECONDS)


if __name__ == "__main__":
    main()
