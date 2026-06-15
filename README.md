# Lightpanda Web Browser

A browse-the-web-from-a-container project, with **two modes**. Pick based on what you need.

---

## 🚀 Mode 1 (recommended) - Full real Chrome, with sound + video

This runs an actual Google Chrome inside a container and streams the whole thing
(picture, **audio**, **video**, mouse + keyboard) to your browser over WebRTC,
powered by [neko](https://github.com/m1k1o/neko).

**This is the fix for Lightpanda's limits** - heavy JS apps (Gmail, YouTube, web
apps) work normally, and you get real sound and video.

### Where to run it
WebRTC needs directly reachable ports, so run it on either:
- **Your own computer with [Docker Desktop](https://www.docker.com/products/docker-desktop/)** (easiest), or
- **A VPS / cloud server with a public IP.**

> ⚠️ It will **not** stream through GitHub Codespaces - Codespaces only proxies
> HTTPS, and WebRTC video can't pass through it. Use Docker Desktop or a VPS for this mode.

### Launch on your own computer (no terminal needed)
1. Install **Docker Desktop** and open it (wait until it says "running").
2. Download this repo (green **Code** button -> **Download ZIP**) and unzip it.
3. Double-click:
   - **Mac:** `start-mac.command` (first time: right-click -> Open to get past the security prompt; if it won't run, open Terminal once and run `chmod +x start-mac.command`).
   - **Windows:** `start-windows.bat`
4. Your browser opens `http://localhost:8080`. Log in:
   - username `neko` / password `neko` (normal), or `admin` / `admin` (admin).
5. Use the Chrome window like a normal browser - YouTube, audio, video, everything.

To stop it: `docker compose -f docker-compose.neko.yml down`

### Launch on a VPS
1. Install Docker + Docker Compose on the server.
2. Edit `docker-compose.neko.yml` and set `NEKO_WEBRTC_NAT1TO1` to the server's public IP.
3. Run `docker compose -f docker-compose.neko.yml up -d`.
4. Open `http://<server-ip>:8080` and make sure ports `8080` (TCP) and `52000-52100` (UDP) are open in the firewall.

---

## 🪶 Mode 2 - Lightpanda lite (lightweight, text-first)

The original mode: a tiny Express app that renders pages through the
[Lightpanda](https://github.com/lightpanda-io/browser) headless engine and shows
the result in an iframe. **Very light and fast**, runs fine in Codespaces, but by
design it has **no audio/video** and heavy JS apps only render partially.

### Run in GitHub Codespaces
- **Code** -> **Codespaces** -> **Create codespace on main**, wait for the build,
  then open the forwarded port **3000**.

### Run locally
```
docker compose up -d
```
Then open `http://localhost:3000`.

---

## Which should I pick?
| You want... | Use |
|---|---|
| Sound, video, Gmail/YouTube, a real browser | **Mode 1 (neko)** on Docker Desktop or a VPS |
| Something super light, or it must run in Codespaces | **Mode 2 (Lightpanda lite)** |
