# Lahm & Loz (لحم ولوز) — Interactive Games Hub

A complete, fully static multi-game interactive marketing platform for the Jordanian
restaurant **Lahm & Loz (لحم ولوز)**, specializing in traditional Jordanian Mansaf.

- Interactive touchscreen displays inside the restaurant's new branch in Shmeisani, Amman
- Games on customers' smartphones
- Shareable branded result cards for social media
- Camera-based experiences with MediaPipe hand tracking

Everything runs client-side: HTML5 + CSS3 + Vanilla JavaScript (ES6+) + Bootstrap 5.3 +
Phaser 3 (Almond Stack) + MediaPipe Tasks Vision. No backend, no PHP, no database
required — deploy it on GitHub Pages as-is.

---

## Quick start

1. Open `index.html` through any static server (a web server is required for the
   camera games — browsers restrict `getUserMedia` on `file://` URLs):

   ```bash
   # any of these works
   python3 -m http.server 8080
   npx serve .
   ```

2. Visit `http://localhost:8080/`.

Arabic is the default language (RTL). The `EN` button in the header switches to
English (LTR) — the choice persists per device in localStorage.

---

## The eight games

| # | Game | File | Category | Duration |
|---|------|------|----------|----------|
| 1 | Meat vs Almond (XO / Tic-Tac-Toe) | `games/meat-vs-almond.html` | Touch | 3–5 min |
| 2 | Catch the Mansaf (hand-controlled basket) | `games/catch-the-mansaf.html` | Camera | 1 min |
| 3 | Build Your Mansaf (assembly sequence) | `games/build-your-mansaf.html` | Touch | 2–4 min |
| 4 | Mansaf Reflex Challenge (reaction time) | `games/mansaf-reflex.html` | Reflex / Camera | 1–2 min |
| 5 | Mansaf Memory (matching pairs) | `games/mansaf-memory.html` | Memory | 2–3 min |
| 6 | Virtual Mansaf Spoon (hand-controlled scoop) | `games/virtual-mansaf-spoon.html` | Camera | 1–2 min |
| 7 | Mansaf Quiz (bilingual trivia) | `games/mansaf-quiz.html` | Trivia | 2–3 min |
| 8 | Almond Stack (Phaser + Matter physics) | `games/almond-stack.html` | Touch | 2–5 min |

Every game has its own independent page and its own JavaScript module.

---

## Project structure

```
lahm-loz-games/
├── index.html                 # Game hub / homepage
├── games/                     # One independent HTML page per game
│   ├── meat-vs-almond.html
│   ├── catch-the-mansaf.html
│   ├── build-your-mansaf.html
│   ├── mansaf-reflex.html
│   ├── mansaf-memory.html
│   ├── virtual-mansaf-spoon.html
│   ├── mansaf-quiz.html
│   └── almond-stack.html
├── assets/
│   ├── images/                # (empty — all art is inline SVG)
│   ├── logo/                  # The restaurant logo (never modified)
│   ├── icons/
│   ├── sounds/                # (empty — sounds are synthesized via Web Audio)
│   ├── illustrations/         # (empty — SVG art lives in js/illustrations.js)
│   ├── fonts/                 # Cairo variable font (Arabic + Latin, offline)
│   └── vendor/                # Bootstrap, Phaser, qrcode-generator, MediaPipe wasm + model
├── css/
│   ├── global.css             # Design tokens, header/footer, buttons, cards, HUD
│   ├── homepage.css           # Hero, game cards, leaderboard, QR
│   ├── games.css              # Shared + per-game stage styles
│   ├── animations.css         # Keyframes (pop, confetti, countdown, steam...)
│   └── responsive.css         # Mobile + kiosk breakpoints
├── js/
│   ├── config.js              # EDIT ME: social links, site URL, promo, Supabase
│   ├── games-meta.js          # Game registry (titles, descriptions, categories)
│   ├── i18n.js                # Arabic/English dictionary + LLT() translator
│   ├── storage.js             # LocalStorage layer (settings, stats, history)
│   ├── sound.js               # Web Audio synthesized SFX + mute
│   ├── illustrations.js       # Original SVG food art (meat, almond, mansaf...)
│   ├── ui.js                  # Countdown, results screen, confetti, toasts
│   ├── language.js            # AR/EN switching + RTL/LTR
│   ├── navigation.js          # Challenge links, QR code, game cards
│   ├── kiosk.js               # Kiosk mode for large touchscreens
│   ├── sharing.js             # Branded PNG result card + Web Share API
│   ├── leaderboard.js         # Local leaderboard + Supabase stub
│   ├── mediapipe.js           # HandLandmarker wrapper (lazy load, auto stop)
│   └── games/                 # One JS module per game + quiz data
│       ├── meat-vs-almond.js
│       ├── catch-the-mansaf.js
│       ├── build-your-mansaf.js
│       ├── mansaf-reflex.js
│       ├── mansaf-memory.js
│       ├── virtual-mansaf-spoon.js
│       ├── mansaf-quiz.js
│       ├── quiz-data.js       # EDIT ME: the 26 quiz questions (AR + EN)
│       └── almond-stack.js
├── README.md
└── DEPLOYMENT.md
```

All asset paths are **relative**, so the site works when deployed inside a GitHub
repository subdirectory (`username.github.io/repo-name/`). No absolute `/` paths
are used anywhere.

---

## How to edit things

### Social links
`js/config.js` → `social: { instagram, facebook, tiktok, whatsapp }`. Replace `#`
with the real profile URLs.

### Site URL + QR code
The homepage QR section and the share cards use the current page address
automatically. To force a fixed domain, set `siteUrl` in `js/config.js`
(for example `https://youruser.github.io/lahm-loz-games/`).

### Quiz questions
Add / edit / remove entries in `js/games/quiz-data.js`. Each question has Arabic
and English text, four options and the index of the correct option. The game
picks 10 random questions per round.

### Promotional messages / coupons
`js/config.js` → `promo`. It is disabled by default (`enabled: false`) — nothing
is promised to players until the restaurant turns it on. When enabled, the offer,
code and CTA appear on the homepage.

> **Security note:** a coupon generated on the client side is NOT secure and can
> be forged. Verified prize redemption requires a backend validation mechanism
> (for example a Supabase Edge Function that checks the score server-side and
> issues a single-use code).

### Brand colors / fonts
Design tokens live at the top of `css/global.css` (`--ll-green`, `--ll-almond`,
`--ll-cream`, `--ll-brown`...). The Cairo variable font is vendored in
`assets/fonts/` so typography works offline.

### Logo
The uploaded logo is used as-is (`assets/logo/lahm-loz-logo.jpg`). It is never
distorted, recreated or modified — it is displayed with `object-fit: contain`.

---

## Sound

Sound effects are synthesized with the Web Audio API (`js/sound.js`) — no audio
files to load, tiny footprint, works offline. The header speaker button mutes /
unmutes; the choice persists.

## Camera games (2, 4 & 6)

- MediaPipe Tasks Vision `HandLandmarker` is loaded lazily on first use
  (vendored locally in `assets/vendor/mediapipe/`, CDN fallback).
- The camera **stops automatically** when: you press restart into touch mode,
  a round ends, you leave the page (`pagehide`) or the tab is hidden.
- Touch/mouse fallback is always available — if the camera is denied or the
  context is not secure, the game switches to touch automatically.
- Camera access requires HTTPS (or localhost).

## Local data & leaderboard

`js/storage.js` keeps, per device only: total games played, best score per game,
player name (optional), recent history and settings. The homepage leaderboard is
clearly labelled **"on this device"** — LocalStorage does NOT provide a shared
leaderboard across devices, and the UI says so.

### Supabase (optional, not required)
`js/leaderboard.js` contains a documented stub for posting scores to a Supabase
table; set `supabase.enabled` in `js/config.js` and follow the comments. The
site must keep working with it disabled.

## Kiosk mode

The big-screen button in the header (or the hero / kiosk note sections) enables
Kiosk Mode: larger touch targets, hidden decorative sections, high contrast,
no hover-dependent interactions. It persists across pages, and a floating exit
button appears while it is on.

## Share system

Every game's result screen generates a branded 1080×1350 PNG card (real logo,
score, challenge messages, QR code) via Canvas. Arabic renders correctly in the
exported image because the Cairo font is loaded before drawing.

- **Share** — Web Share API with the PNG file where supported
- **Download card** — always available
- **Copy challenge link** — a URL with `?c=...` that shows a challenge banner
  to whoever opens it ("X challenges you: N points in GAME")

---

## Credits

Designed and developed for **Lahm & Loz** by **Vortigate**.
