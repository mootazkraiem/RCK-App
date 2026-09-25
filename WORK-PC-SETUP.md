# Run RCK on a work PC

`RCK-Windows.zip` in this repo is the ready-to-run Windows app. No install, no Python needed.

## 1. Get it
On the repo page, open **RCK-Windows.zip** and click **Download raw file** (you must be signed in to GitHub if the repo is private).

## 2. Unblock and extract (important on work PCs)
1. Right-click the downloaded zip, choose **Properties**, tick **Unblock** at the bottom, click **OK**.
2. Right-click the zip, choose **Extract All**. Do not run the .exe from inside the zip.
3. Keep the whole `ReleaseKnowledgeCapture` folder together. The `_internal` folder must stay next to the .exe.

## 3. Start it
Double-click `ReleaseKnowledgeCapture\ReleaseKnowledgeCapture.exe`.
If Windows shows "Windows protected your PC", click **More info**, then **Run anyway**.

## 4. Sign in
The app needs to reach the RCK server. The server address is in `config.json`, in the same folder as the .exe:

```json
{
  "server_url": "https://city-wedding-msgstr-bulletin.trycloudflare.com",
  "server_cert_path": null
}
```

The address is a temporary Cloudflare tunnel address. It changes whenever the tunnel on the server machine restarts.
If the login screen says **"Can't reach the server"**, a **Server address** box appears under the message.
Paste the current address into it and press **Connect**. The current address is in `server/current_tunnel_url.txt`
on the server machine. You do not need to edit any file.

## If it still does not work
| Symptom | Fix |
|---|---|
| Nothing opens, no message | Re-do step 2 (Unblock, then extract everything). Ask IT to allow the folder in antivirus. |
| Window is blank/white | Install the *Microsoft Edge WebView2 Runtime* (Evergreen). |
| "Can't reach the server" | The work network may block `trycloudflare.com`. Open the address plus `/health` in a browser on that PC. It should show `{"ok":true}`. If it does not, IT must allow that domain. |
| "Invalid username or password" | The connection works. Check the account with your administrator. |
