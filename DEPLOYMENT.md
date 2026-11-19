# Deployment Guide — Lahm & Loz Interactive Games Hub

The whole platform is a **static website** (HTML + CSS + JS). It needs no build
step, no Node server, no database.

---

## 1. GitHub Pages (recommended)

### Option A — project site (repository subdirectory)

1. Create a GitHub repository (e.g. `lahm-loz-games`).
2. Copy the **contents** of the `lahm-loz-games/` folder into the repository root:

   ```bash
   git init
   git add .
   git commit -m "Lahm & Loz interactive games hub"
   git branch -M main
   git remote add origin https://github.com/<user>/lahm-loz-games.git
   git push -u origin main
   ```

3. Repository **Settings → Pages → Source**: select the `main` branch and the
   `/ (root)` folder. Save.
4. The site goes live in a few minutes at:

   ```
   https://<user>.github.io/lahm-loz-games/
   ```

All links and asset paths in the project are relative, so the site works
correctly inside the `/lahm-loz-games/` subpath. Nothing to configure.

### Option B — user/organization site (`<user>.github.io` repository)

Use the same steps; the site will be served at `https://<user>.github.io/`.

### Custom domain (optional)

1. Repository **Settings → Pages → Custom domain**: enter the domain.
2. Add a `CNAME` file containing the domain to the repository root.
3. Point DNS at GitHub Pages (A records or CNAME as GitHub instructs).
4. Enable **Enforce HTTPS** (required for the camera games).

---

## 2. Any static hosting

The folder deploys unchanged on Netlify, Vercel (static), Cloudflare Pages,
S3, or any web server:

- Upload the `lahm-loz-games/` folder as the site root, **or**
- `netlify deploy --dir .` / drag-and-drop the folder into Netlify Drop.

---

## Requirements and gotchas

1. **HTTPS is mandatory for camera games.** GitHub Pages and all major hosts
   provide HTTPS automatically. Browsers allow `getUserMedia` only on secure
   origins (`https://` or `localhost`). Without it, games 2, 4 and 6
   automatically fall back to touch/mouse control.

2. **Do not open via `file://`.** Always serve through a web server (or deploy).
   The MediaPipe WASM files and the camera API will not work from a plain file
   URL.

3. **First camera launch downloads the hand-tracking model** (~8 MB). It is
   vendored inside `assets/vendor/mediapipe/` so no external CDN is needed, but
   the first load takes a moment; afterwards it is cached by the browser.

4. **QR code section.** By default the QR shows the current page URL. After
   deployment, set the final address in `js/config.js → siteUrl` so shared
   cards always point to the live site.

5. **Kiosk deployment in the restaurant.**
   - Open the site on the touchscreen device, press **Kiosk mode** in the header.
   - The layout switches to large touch targets and hides decorative sections.
   - Optional: launch the browser in its own kiosk/fullscreen app mode
     (e.g. Chrome: `chrome --kiosk --app=https://.../index.html`).
   - The local records (best scores) stay on that specific device.

6. **Updates.** Edit the files, commit and push — GitHub Pages redeploys
   automatically. There is no build step.

---

## Verification checklist after deploy

- [ ] Homepage loads, 8 game cards visible.
- [ ] Every card opens its own page (`/games/*.html`).
- [ ] Language toggle switches AR (RTL) ⇄ EN (LTR).
- [ ] All 8 games are playable end-to-end.
- [ ] Camera permission prompt appears for games 2, 4, 6 (on HTTPS).
- [ ] Camera turns off when the round ends / the page is closed.
- [ ] Result cards download as PNG with correct Arabic text.
- [ ] Challenge link opens the homepage with the challenge banner.
- [ ] Kiosk mode persists after reload.
- [ ] No console errors.
