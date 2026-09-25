# Run this ONCE on each teammate's machine before handing them the app --
# catches the exact failures that cost hours of debugging during the pilot
# (missing WebView2, an unreachable server, a network that blocks the
# Cloudflare tunnel) before they ever open the app themselves.
#
# Usage (from the folder containing ReleaseKnowledgeCapture.exe and
# config.json):
#   powershell -ExecutionPolicy Bypass -File client_preflight_check.ps1

$ErrorActionPreference = "Continue"
$failures = 0

Write-Output "=== Release Knowledge Capture -- client pre-flight check ==="
Write-Output ""

# 0. Path sanity -- pythonnet's .NET-hosting mechanism (used to talk to
# WebView2) fails with "Failed to resolve Python.Runtime.Loader.Initialize"
# when the install path contains parentheses. This happens by accident all
# the time: extracting the same zip twice into Downloads without deleting
# the first copy makes Windows auto-name the second one "(1)", "(2)", etc.
# Confirmed as the actual cause of two separate "won't launch" reports
# that looked like corporate security blocks but weren't.
Write-Output "[0/3] Checking install path for problem characters..."
if ($PSScriptRoot -match '[()]') {
    Write-Output "  PROBLEM -- this folder's path contains parentheses:"
    Write-Output "  $PSScriptRoot"
    Write-Output "  This specifically breaks the app (pythonnet DLL loading fails)."
    Write-Output "  Usually caused by extracting the same zip more than once without"
    Write-Output "  deleting the previous copy first (Windows names the new one '(1)',"
    Write-Output "  '(2)', etc). Delete ALL existing ReleaseKnowledgeCapture folders in"
    Write-Output "  Downloads, then extract fresh exactly once."
    $failures++
} else {
    Write-Output "  OK -- no parentheses in the install path."
}
Write-Output ""

# 1. WebView2 Runtime -- without this, the app opens a blank/frozen window
# with no error message at all. This was the single hardest bug to
# diagnose remotely during the pilot; catching it here takes 2 seconds.
Write-Output "[1/3] Checking WebView2 Runtime..."
$webview2Key = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
if (Test-Path $webview2Key) {
    $version = (Get-ItemProperty $webview2Key -ErrorAction SilentlyContinue).pv
    Write-Output "  OK -- WebView2 Runtime installed (version $version)"
} else {
    Write-Output "  MISSING -- the app will open a blank, permanently unresponsive window."
    Write-Output "  Fix: install the WebView2 Runtime (search Microsoft's site for"
    Write-Output "  'WebView2 Runtime download', use the offline Evergreen Standalone"
    Write-Output "  Installer if this network is locked down)."
    $failures++
}
Write-Output ""

# 2. config.json exists and has a server_url
Write-Output "[2/3] Checking config.json..."
$configPath = Join-Path $PSScriptRoot "config.json"
$serverUrl = $null
if (Test-Path $configPath) {
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        $serverUrl = $config.server_url
        if ($serverUrl) {
            Write-Output "  OK -- server_url is set: $serverUrl"
        } else {
            Write-Output "  PROBLEM -- config.json exists but server_url is empty."
            $failures++
        }
    } catch {
        Write-Output "  PROBLEM -- config.json is not valid JSON. Common cause: it got"
        Write-Output "  saved as config.json.txt by Notepad, or a field was edited wrong."
        $failures++
    }
} else {
    Write-Output "  MISSING -- no config.json next to the exe. The app will default to"
    Write-Output "  https://127.0.0.1:8443, which is almost certainly wrong here."
    $failures++
}
Write-Output ""

# 3. Server actually reachable from this machine, on this network
Write-Output "[3/3] Checking server reachability..."
if ($serverUrl) {
    try {
        $response = Invoke-WebRequest -Uri "$serverUrl/health" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Output "  OK -- server responded: $($response.Content)"
        } else {
            Write-Output "  PROBLEM -- server responded with status $($response.StatusCode)."
            $failures++
        }
    } catch {
        $msg = $_.Exception.Message
        Write-Output "  PROBLEM -- could not reach $serverUrl from this machine."
        Write-Output "  Error: $msg"
        if ($msg -match "trust|certificate|SSL|TLS") {
            Write-Output "  This looks like a certificate-trust issue (common on networks with"
            Write-Output "  TLS-inspecting security software). The app now trusts the OS"
            Write-Output "  certificate store automatically, so this usually resolves itself --"
            Write-Output "  if it persists, IT needs to confirm this machine trusts its own"
            Write-Output "  network security proxy's certificate."
        } else {
            Write-Output "  This looks like a network/firewall block, or the server itself is"
            Write-Output "  down. Try opening $serverUrl/health directly in a browser on this"
            Write-Output "  same machine to narrow it down."
        }
        $failures++
    }
} else {
    Write-Output "  SKIPPED -- no server_url to test (see step 2)."
}
Write-Output ""

Write-Output "==============================================="
if ($failures -eq 0) {
    Write-Output "All checks passed. Safe to hand this machine to the user."
} else {
    Write-Output "$failures check(s) failed -- fix the items above before handing this"
    Write-Output "machine to the user, or they'll hit exactly these failures blind."
}
Write-Output "==============================================="
