@echo off
REM Launched by the "ReleaseKnowledgeCaptureServer" scheduled task at logon.
REM Moves to the project root (this file lives in server\) then runs the
REM auto-restarting supervisor loop.
cd /d "%~dp0.."
python -m server.supervisor
