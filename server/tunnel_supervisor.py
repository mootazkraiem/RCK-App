"""
Keeps the Cloudflare quick tunnel actually working, not just running.

server/supervisor.py restarts the team server if its process exits -- but
today's failure mode for cloudflared was worse than that: the process
stayed alive the whole time, stuck in an internal reconnect-failure loop
("control stream encountered a failure", retrying with growing backoff),
never actually serving traffic again, with nothing to notice or recover.
A plain "restart if the process died" watchdog would never have caught
that, since the process never died -- it just quietly stopped working.

So this actively health-checks the public URL itself, not just the
process, and force-restarts cloudflared if it's been unreachable for too
long. The current live URL is written to current_tunnel_url.txt next to
this file on every successful start, so there's one place to check it
without digging through logs.

Run directly:
    python -m server.tunnel_supervisor
"""

import re
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent
TUNNEL_LOG = HERE / "tunnel.log"
CURRENT_URL_FILE = HERE / "current_tunnel_url.txt"

HEALTH_CHECK_INTERVAL_SECONDS = 30
HEALTH_CHECK_TIMEOUT_SECONDS = 10
# A URL is only considered dead after this many consecutive failed checks
# -- avoids restarting over one transient network blip.
CONSECUTIVE_FAILURES_BEFORE_RESTART = 3
URL_LINE_RE = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")


def log(msg: str):
    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    line = f"[tunnel-supervisor] {ts} {msg}"
    print(line, flush=True)


def _kill_cloudflared_if_this_process_dies():
    """Windows only: same Job Object trick as app.py's WebView2 fix, for
    the same reason. Directly observed cloudflared surviving as an orphan
    after this supervisor's own process was force-killed -- without this,
    every force-kill leaves a stray cloudflared process running with
    nothing left to manage or health-check it. Struct layout mirrors the
    verified-working version in app.py exactly -- a hand-computed byte
    offset into a raw buffer is exactly the kind of thing that's silently
    wrong (LimitFlags is not at the offset it looks like it should be,
    thanks to LARGE_INTEGER padding), so this uses real ctypes.Structure
    definitions instead of guessing."""
    if sys.platform != "win32":
        return
    try:
        import ctypes
        from ctypes import wintypes

        class _BASIC_LIMITS(ctypes.Structure):
            _fields_ = [
                ("PerProcessUserTimeLimit", ctypes.c_int64),
                ("PerJobUserTimeLimit", ctypes.c_int64),
                ("LimitFlags", wintypes.DWORD),
                ("MinimumWorkingSetSize", ctypes.c_size_t),
                ("MaximumWorkingSetSize", ctypes.c_size_t),
                ("ActiveProcessLimit", wintypes.DWORD),
                ("Affinity", ctypes.c_size_t),
                ("PriorityClass", wintypes.DWORD),
                ("SchedulingClass", wintypes.DWORD),
            ]

        class _IO_COUNTERS(ctypes.Structure):
            _fields_ = [(n, ctypes.c_uint64) for n in (
                "ReadOperationCount", "WriteOperationCount", "OtherOperationCount",
                "ReadTransferCount", "WriteTransferCount", "OtherTransferCount")]

        class _EXTENDED_LIMITS(ctypes.Structure):
            _fields_ = [
                ("BasicLimitInformation", _BASIC_LIMITS),
                ("IoInfo", _IO_COUNTERS),
                ("ProcessMemoryLimit", ctypes.c_size_t),
                ("JobMemoryLimit", ctypes.c_size_t),
                ("PeakProcessMemoryUsed", ctypes.c_size_t),
                ("PeakJobMemoryUsed", ctypes.c_size_t),
            ]

        JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000
        JobObjectExtendedLimitInformation = 9

        kernel32 = ctypes.windll.kernel32
        # Without these, ctypes defaults GetCurrentProcess()'s return type
        # to a 32-bit int, silently truncating the real pseudo-handle
        # (0xFFFFFFFFFFFFFFFF) -- AssignProcessToJobObject then fails with
        # ERROR_INVALID_HANDLE (6). Confirmed via direct testing: without
        # these declarations this whole function is a silent no-op.
        kernel32.CreateJobObjectW.restype = wintypes.HANDLE
        kernel32.GetCurrentProcess.restype = wintypes.HANDLE
        kernel32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]

        job = kernel32.CreateJobObjectW(None, None)
        if not job:
            return
        info = _EXTENDED_LIMITS()
        info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        kernel32.SetInformationJobObject(
            job, JobObjectExtendedLimitInformation, ctypes.byref(info), ctypes.sizeof(info)
        )
        if not kernel32.AssignProcessToJobObject(job, kernel32.GetCurrentProcess()):
            log(f"AssignProcessToJobObject failed (GetLastError={ctypes.GetLastError()}) "
                "-- cloudflared may be orphaned if this process is force-killed.")
        global _job_handle
        _job_handle = job
    except OSError:
        pass  # best-effort only -- must never block startup


class TunnelProcess:
    """Wraps one cloudflared run: launches it, tails its output to find the
    assigned URL and append to tunnel.log, and exposes whether it's alive."""

    def __init__(self):
        self.proc = None
        self.url = None
        self._log_fh = None

    def start(self):
        self._log_fh = open(TUNNEL_LOG, "a", encoding="utf-8")
        self.proc = subprocess.Popen(
            ["cloudflared", "tunnel", "--url", "https://localhost:8443", "--no-tls-verify"],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, bufsize=1,
        )
        self.url = None
        threading.Thread(target=self._pump_output, daemon=True).start()
        for _ in range(20):  # up to ~10s to find the URL in startup output
            if self.url:
                break
            time.sleep(0.5)
        return self.url

    def _pump_output(self):
        for line in self.proc.stdout:
            self._log_fh.write(line)
            self._log_fh.flush()
            if self.url is None:
                m = URL_LINE_RE.search(line)
                if m:
                    self.url = m.group(0)
                    CURRENT_URL_FILE.write_text(self.url, encoding="utf-8")
                    log(f"Tunnel URL: {self.url}")

    def is_running(self) -> bool:
        return self.proc is not None and self.proc.poll() is None

    def stop(self):
        if self.proc is None:
            return
        self.proc.terminate()
        try:
            self.proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.proc.kill()
        if self._log_fh:
            self._log_fh.close()


def main():
    _kill_cloudflared_if_this_process_dies()
    log("Starting tunnel supervisor (process liveness + real health checks).")
    while True:
        tunnel = TunnelProcess()
        url = tunnel.start()
        if not url:
            log("Tunnel didn't report a URL within 10s -- restarting.")
            tunnel.stop()
            time.sleep(3)
            continue

        consecutive_failures = 0
        while True:
            time.sleep(HEALTH_CHECK_INTERVAL_SECONDS)
            if not tunnel.is_running():
                log("cloudflared process exited -- restarting.")
                break
            try:
                r = requests.get(f"{tunnel.url}/health", timeout=HEALTH_CHECK_TIMEOUT_SECONDS)
                healthy = r.status_code == 200
            except requests.exceptions.RequestException:
                healthy = False
            if healthy:
                consecutive_failures = 0
                continue
            consecutive_failures += 1
            log(f"Tunnel health check failed ({consecutive_failures}/{CONSECUTIVE_FAILURES_BEFORE_RESTART}).")
            if consecutive_failures >= CONSECUTIVE_FAILURES_BEFORE_RESTART:
                log("Tunnel unreachable too many times in a row -- process is alive but "
                    "not actually working, force-restarting to get a fresh connection.")
                tunnel.stop()
                break
        time.sleep(2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("Interrupted -- exiting.")
        sys.exit(0)
