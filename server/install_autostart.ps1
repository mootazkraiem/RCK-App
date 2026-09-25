<#
.SYNOPSIS
    Registers the Release Knowledge Capture server (and, for the current
    pilot deployment, its Cloudflare tunnel) to start automatically at
    logon on this machine.

.DESCRIPTION
    Creates (or replaces) two Windows Scheduled Tasks that run at logon
    for the current user, each with a restart-on-failure policy as a
    second line of defense on top of supervisor.py's own restart loop:
      - "ReleaseKnowledgeCaptureServer" runs run_supervisor.bat
      - "ReleaseKnowledgeCaptureTunnel" runs start_tunnel.bat

    Note: the tunnel task means the server survives a reboot, but the
    public https://*.trycloudflare.com URL it gets on that restart will
    be a NEW random one -- see the "Current pilot deployment" section of
    the README. Skip -IncludeTunnel once this has moved to a named
    tunnel with a fixed hostname, since cloudflared should then run as
    its own persistent Windows service instead (`cloudflared service
    install`), not through this ad hoc task.

    Run once, on the machine that hosts the server:
        powershell -ExecutionPolicy Bypass -File server\install_autostart.ps1
        powershell -ExecutionPolicy Bypass -File server\install_autostart.ps1 -IncludeTunnel

    To remove:
        Unregister-ScheduledTask -TaskName "ReleaseKnowledgeCaptureServer" -Confirm:$false
        Unregister-ScheduledTask -TaskName "ReleaseKnowledgeCaptureTunnel" -Confirm:$false
#>

param(
    [switch]$IncludeTunnel
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Register-RkcTask {
    param([string]$TaskName, [string]$BatPath)

    if (-not (Test-Path $BatPath)) {
        throw "Could not find $BatPath -- run this script from an unmodified checkout."
    }

    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Write-Host "Removing existing '$TaskName' task before re-registering..."
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    $Action = New-ScheduledTaskAction -Execute $BatPath
    $Trigger = New-ScheduledTaskTrigger -AtLogOn
    $Settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartCount 999 `
        -RestartInterval (New-TimeSpan -Minutes 1) `
        -ExecutionTimeLimit (New-TimeSpan -Days 0)
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger `
        -Settings $Settings -Principal $Principal -Force | Out-Null

    Write-Host "Registered scheduled task '$TaskName' -- starts automatically at next logon."
    Write-Host "Starting it now for this session too..."
    Start-ScheduledTask -TaskName $TaskName
}

Register-RkcTask -TaskName "ReleaseKnowledgeCaptureServer" -BatPath (Join-Path $ScriptDir "run_supervisor.bat")

if ($IncludeTunnel) {
    Register-RkcTask -TaskName "ReleaseKnowledgeCaptureTunnel" -BatPath (Join-Path $ScriptDir "start_tunnel.bat")
    Write-Host ""
    Write-Host "Reminder: a reboot will change the tunnel's public URL. Update every" -ForegroundColor Yellow
    Write-Host "client's config.json when that happens, until this moves to a named tunnel." -ForegroundColor Yellow
}
