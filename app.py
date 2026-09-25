"""
Release Knowledge Capture - team desktop client.

Stack: pywebview (native OS window -- Edge WebView2 on Windows, WebKit
on macOS, GTK/Qt WebKit on Linux; ships with the OS, no runtime download).
Data lives on the shared team server (see server/main.py), not on this
machine -- this app is a thin, authenticated client. Configure which
server to talk to in config.json (see client_config.py).

Run:
    pip install -r requirements.txt
    python app.py
"""

import os
import subprocess
import sys
import time
from pathlib import Path

import requests
import webview

from api import Api
from client_config import APP_DIR, load_config

_LOCAL_HOSTS = ("localhost", "127.0.0.1", "0.0.0.0")
_FROZEN = getattr(sys, "frozen", False)

# ui/ is read-only bundled data, so it belongs wherever PyInstaller
# actually extracted/placed the bundle (sys._MEIPASS -- correct for both
# onefile and onedir, including onedir's default "_internal" layout).
# config.json and server_cert.pem are different: those must be editable
# per machine, so client_config.py resolves APP_DIR to the .exe's own
# folder for those, never into the bundle.
if _FROZEN:
    UI_DIR = os.path.join(sys._MEIPASS, "ui")
else:
    UI_DIR = os.path.join(APP_DIR, "ui")


def _is_local_server(url: str) -> bool:
    return any(host in url for host in _LOCAL_HOSTS)


def _server_responding(url: str) -> bool:
    try:
        # verify=False here is deliberate and narrow: this only checks
        # whether *something* is listening on /health (no credentials, no
        # data), before we necessarily have a pinned cert file in place on
        # a brand-new install. The real login/data calls in api.py still
        # verify against the pinned certificate -- this probe never does.
        r = requests.get(f"{url}/health", timeout=1.5, verify=False)
        return r.status_code == 200
    except requests.exceptions.RequestException:
        return False


def _autostart_local_server_if_needed(config):
    """Convenience for local development/testing only -- never in a
    packaged build.

    If the configured server is on this machine and nothing is answering
    on it yet, start one. This is never attempted for a real team server
    on another machine -- a client can't (and shouldn't) launch someone
    else's server process; it should just connect to what's already
    running there.

    Also never attempted when packaged: sys.executable is this app's own
    .exe in that case, not a Python interpreter, so trying to relaunch it
    with "-m server.main" would be nonsense (and the server/ package
    isn't even bundled into a client-only build).
    """
    if _FROZEN:
        return
    url = config["server_url"].rstrip("/")
    if not _is_local_server(url):
        return
    if _server_responding(url):
        return

    print(f"[app] No server responding at {url} yet -- starting one locally for development.", flush=True)
    creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
    subprocess.Popen(
        [sys.executable, "-m", "server.main"],
        cwd=APP_DIR,
        creationflags=creationflags,
    )
    for _ in range(20):
        time.sleep(0.5)
        if _server_responding(url):
            print("[app] Local server is up.", flush=True)
            return
    print("[app] Warning: local server did not respond in time; continuing anyway.", flush=True)


def _unblock_own_files():
    """Windows only, packaged builds only: strip the "downloaded from the
    internet" mark (an NTFS Zone.Identifier alternate-data-stream) from
    every file next to this exe, before anything tries to load
    Python.Runtime.dll.

    Confirmed by direct, controlled test: byte-identical files, identical
    (clean, no-special-characters) path -- the *only* difference was this
    mark -- and it was entirely sufficient on its own to reproduce
    "RuntimeError: Failed to resolve Python.Runtime.Loader.Initialize".
    Removing the mark and relaunching with nothing else changed fixed it
    immediately. .NET Framework's classic assembly-loading security model
    is what's actually refusing to load a marked assembly; this has
    nothing to do with WebView2, antivirus, or corporate policy, despite
    strongly resembling all three.

    Windows applies this mark automatically to every file extracted from a
    zip that was itself downloaded through a browser -- which is exactly
    how this app reaches most machines, so this can't be left as a manual
    "remember to run Unblock-File" step for every one of 40 people.
    """
    if os.name != "nt" or not _FROZEN:
        return
    root = Path(sys.executable).resolve().parent
    for path in root.rglob("*"):
        if path.is_file():
            try:
                os.remove(f"{path}:Zone.Identifier")
            except OSError:
                pass  # not tagged, already removed, or in use -- fine either way


def _kill_webview2_children_if_this_process_dies():
    """Windows only: put this process in a Job Object with
    JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE, so the WebView2 helper processes
    this app spawns get torn down automatically the moment this process
    exits -- cleanly *or* force-killed (Task Manager, a crash, anything).

    Without this, force-killing the app (which is how it keeps getting
    closed in practice) orphans several msedgewebview2.exe helper
    processes that never get cleaned up. Confirmed by hand: a dozen of
    them were found still running from unrelated earlier sessions,
    accumulating memory pressure across repeated relaunches -- and that
    resource pressure is what made later launches intermittently hang.
    """
    if os.name != "nt":
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
        # ERROR_INVALID_HANDLE (6), and this whole function is a silent
        # no-op. Confirmed via direct testing against the identical
        # pattern in tunnel_supervisor.py.
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
        kernel32.AssignProcessToJobObject(job, kernel32.GetCurrentProcess())
        global _job_handle
        _job_handle = job  # keep referenced for the life of the process
    except OSError:
        pass  # best-effort only -- must never block startup


def main():
    _unblock_own_files()
    _kill_webview2_children_if_this_process_dies()
    config = load_config()
    _autostart_local_server_if_needed(config)

    api = Api()
    index_path = os.path.join(UI_DIR, "index.html")
    window = webview.create_window(
        "Release Knowledge Capture",
        url=index_path,
        js_api=api,
        width=1400,
        height=920,
        min_size=(1080, 720),
        maximized=True,
    )
    api._window = window  # needed for native file-picker dialogs
    webview.start(debug=False)


if __name__ == "__main__":
    main()
