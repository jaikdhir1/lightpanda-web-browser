# Lightpanda Web Browser

A browser-in-a-browser web app. Type a URL and view the rendered page, powered by the
[Lightpanda](https://lightpanda.io) headless browser engine.

## Note
This is a page/text browser. Lightpanda has no audio or video playback, so media-heavy
sites (YouTube, music, video) will not play sound. Best for articles, docs, and text.

## Run in the cloud (no terminal)
1. Push these files to a GitHub repo.
2. Click Code > Codespaces > Create codespace on main.
3. Wait for the build, then open the forwarded port 3000.

## Run locally (Docker Desktop)
- Windows: double-click start-windows.bat
- Mac: double-click start-mac.command
- Then open http://localhost:3000

## How it works
- docker-compose runs two services: the Lightpanda engine (CDP server on :9222) and a
  Node/Express web server (:3000).
- The server connects to Lightpanda via puppeteer-core, loads the requested URL, grabs the
  rendered HTML, and returns it to the UI, which displays it in a sandboxed iframe.
- If Lightpanda cannot render a page, the server falls back to a direct fetch.
