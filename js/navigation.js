/* ============================================================
   Lahm & Loz — Navigation & homepage behaviours
   Challenge banner (?c=...), QR code, active links, CTA scroll.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- challenge link system ----------
     A challenge URL looks like:  index.html?c=<b64json>
     where json = { g: gameId, s: score, n: playerName }
  -----------------------------------------------*/
  function parseChallenge() {
    try {
      const m = location.search.match(/[?&]c=([A-Za-z0-9\-_]+)/);
      if (!m) return null;
      const json = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/'))));
      const data = JSON.parse(json);
      if (data && data.g) return data;
    } catch (e) { /* ignore */ }
    return null;
  }

  function encodeChallenge(gameId, score, name) {
    const data = { g: gameId, s: Math.round(score) || 0, n: (name || '').slice(0, 24) };
    try {
      const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) { return ''; }
  }

  function showChallengeBanner() {
    const data = parseChallenge();
    if (!data) return;
    const game = window.LL_GAME_BY_ID(data.g);
    if (!game) return;
    const host = document.getElementById('ll-challenge-banner');
    if (!host) return;
    host.hidden = false;
    const inner = document.createElement('div');
    inner.className = 'inner';
    const name = data.n || (window.LLLang.current === 'ar' ? 'صديق' : 'a friend');
    const score = (typeof data.s === 'number') ? data.s : 0;
    const gameName = window.LLLang.current === 'ar' ? game.titleAr : game.titleEn;
    const h = document.createElement('h3');
    h.textContent = window.LLT('home.challengeBanner', { name: name, score: score, game: gameName });
    const btn = document.createElement('a');
    btn.className = 'btn-ll';
    btn.textContent = window.LLT('home.challengePlay');
    const file = window.LLLang.current === 'ar' || true ? game.file : game.file; // relative both ways
    btn.href = (location.pathname.indexOf('/games/') !== -1 ? '../' : '') + file;
    inner.appendChild(h);
    inner.appendChild(btn);
    host.appendChild(inner);
  }

  /* ---------- QR code ---------- */
  function renderQR() {
    const holder = document.getElementById('ll-qr-holder');
    if (!holder) return;
    const url = (window.LL_CONFIG.siteUrl || location.href).split('#')[0];
    if (!window.qrcode) {
      holder.innerHTML = '<div style="font-size:.8rem;color:#6B5442">QR</div>';
      return;
    }
    try {
      const qr = window.qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      const size = 180;
      const cell = Math.floor(size / qr.getModuleCount());
      const img = qr.createDataURL(cell, 4);
      holder.innerHTML = '<img alt="QR code" src="' + img + '">';
      const urlEl = document.getElementById('ll-qr-url');
      if (urlEl) urlEl.textContent = url;
    } catch (e) {
      holder.innerHTML = '<div style="font-size:.8rem;color:#6B5442">QR</div>';
    }
  }

  /* ---------- game cards (homepage) ---------- */
  function renderGameCards() {
    const grid = document.getElementById('ll-games-grid');
    if (!grid) return;
    const lang = window.LLLang.current;
    const catKey = { touch: 'common.touch', camera: 'common.cameraCat', memory: 'common.memory', reflex: 'common.reflex', quiz: 'common.quizCat' };
    const catCls = { touch: '', camera: 'll-chip-cam', memory: 'll-chip-mem', reflex: 'll-chip-reflex', quiz: 'll-chip-mem' };

    grid.innerHTML = '';
    window.LL_GAMES.forEach((g, idx) => {
      const card = document.createElement('a');
      card.className = 'll-game-card ll-anim-in';
      card.href = g.file;
      card.style.animationDelay = (idx * .06) + 's';
      card.setAttribute('aria-label', lang === 'ar' ? g.titleAr : g.titleEn);

      const inGames = location.pathname.indexOf('/games/') !== -1;
      card.href = (inGames ? '../' : '') + g.file;

      const thumb = document.createElement('div');
      thumb.className = 'll-game-thumb';
      thumb.setAttribute('data-art', g.art);
      const body = document.createElement('div');
      body.className = 'll-game-body';

      const h3 = document.createElement('h3');
      h3.textContent = lang === 'ar' ? g.titleAr : g.titleEn;
      const p = document.createElement('p');
      p.textContent = lang === 'ar' ? g.descAr : g.descEn;

      const meta = document.createElement('div');
      meta.className = 'll-game-meta';
      const chip = document.createElement('span');
      chip.className = 'll-chip ' + (catCls[g.cat] || '');
      chip.textContent = window.LLT(catKey[g.cat] || 'common.touch');
      const time = document.createElement('span');
      time.className = 'time';
      time.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" stroke-linecap="round"/></svg>' + (lang === 'ar' ? g.durationAr : g.durationEn);
      meta.appendChild(chip);
      meta.appendChild(time);

      const play = document.createElement('div');
      play.className = 'll-game-play';
      const btn = document.createElement('span');
      btn.className = 'btn-ll';
      btn.textContent = window.LLT('common.start');
      play.appendChild(btn);

      body.appendChild(h3);
      body.appendChild(p);
      body.appendChild(meta);
      body.appendChild(play);
      card.appendChild(thumb);
      card.appendChild(body);
      grid.appendChild(card);
    });
    window.LLArt.inject(grid);
  }

  /* ---------- leaderboard render (homepage) ---------- */
  function renderHomeLeaderboard() {
    const host = document.getElementById('ll-lb-body');
    if (!host) return;
    window.LLLeaderboard.render(host);
  }

  /* ---------- CTA scroll ---------- */
  function wireCta() {
    document.querySelectorAll('[data-scroll-to]').forEach(el => {
      el.addEventListener('click', (ev) => {
        const target = document.querySelector(el.getAttribute('data-scroll-to'));
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ---------- social links from config ---------- */
  function paintSocial() {
    document.querySelectorAll('[data-social]').forEach(a => {
      const net = a.getAttribute('data-social');
      if (window.LL_CONFIG.social[net]) a.href = window.LL_CONFIG.social[net];
    });
  }

  /* ---------- promo block (optional) ---------- */
  function paintPromo() {
    document.querySelectorAll('[data-promo]').forEach(el => {
      const p = window.LL_CONFIG.promo;
      if (!p.enabled) { el.hidden = true; return; }
      el.hidden = false;
      const lang = window.LLLang.current;
      el.querySelector('[data-promo-msg]').textContent = lang === 'ar' ? p.messageAr : p.messageEn;
      el.querySelector('[data-promo-offer]').textContent = lang === 'ar' ? p.offerAr : p.offerEn;
      el.querySelector('[data-promo-code]').textContent = p.code;
      const cta = el.querySelector('[data-promo-cta]');
      cta.textContent = lang === 'ar' ? p.ctaAr : p.ctaEn;
      cta.href = p.ctaUrl;
    });
  }

  document.addEventListener('ll:games-ready', () => {
    renderGameCards();
    renderHomeLeaderboard();
  });
  document.addEventListener('ll:lang', () => {
    renderGameCards();
    renderHomeLeaderboard();
    paintPromo();
    showChallengeBanner();
    renderQR();
  });

  document.addEventListener('DOMContentLoaded', () => {
    showChallengeBanner();
    renderQR();
    wireCta();
    paintSocial();
    paintPromo();
    const yearEl = document.querySelector('[data-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* expose challenge encoder for sharing.js */
  window.LLNav = {
    encodeChallenge,
    parseChallenge
  };
})();
