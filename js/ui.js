/* ============================================================
   Lahm & Loz — Shared UI components for game pages
   Countdown overlay, results screen, confetti, toasts,
   floating score text, steam, pause overlay helpers.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- toast ---------- */
  function toastHost() {
    let host = document.querySelector('.ll-toast-wrap');
    if (!host) {
      host = document.createElement('div');
      host.className = 'll-toast-wrap';
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(msg, kind) {
    const host = toastHost();
    const el = document.createElement('div');
    el.className = 'll-toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 320);
    }, 2400);
  }

  /* ---------- confetti ---------- */
  const CONFETTI_COLORS = ['#164B2A', '#D3A064', '#E8B04B', '#2E7D46', '#B98448', '#F5F3EE'];
  function confetti(count) {
    count = count || 80;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'll-confetti';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      p.style.animationDelay = (Math.random() * .5) + 's';
      p.style.width = (8 + Math.random() * 8) + 'px';
      p.style.height = (12 + Math.random() * 10) + 'px';
      if (Math.random() > .5) p.style.borderRadius = '50%';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3600);
    }
  }

  /* ---------- floating score text (DOM-based) ---------- */
  function floatText(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'll-stack-score-float';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color || '#164B2A';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  /* ---------- countdown overlay ---------- */
  // Runs 3-2-1-GO inside a stage container, then calls onDone.
  function countdown(stageEl, onDone) {
    const overlay = document.createElement('div');
    overlay.className = 'll-overlay';
    overlay.setAttribute('data-countdown', '1');
    stageEl.appendChild(overlay);
    const seq = ['3', '2', '1', window.LLT('common.go')];
    let i = 0;
    const num = document.createElement('div');
    num.className = 'count-num';
    overlay.appendChild(num);
    let cancelled = false;
    function next() {
      if (cancelled) return;
      if (i >= seq.length) {
        overlay.remove();
        onDone && onDone();
        return;
      }
      const txt = seq[i];
      num.textContent = txt;
      num.classList.toggle('go', i === seq.length - 1);
      num.style.animation = 'none';
      void num.offsetWidth; // restart animation
      num.style.animation = '';
      window.LLSound.play(i === seq.length - 1 ? 'go' : 'countdown');
      i++;
      setTimeout(next, 800);
    }
    next();
    return { cancel() { cancelled = true; overlay.remove(); } };
  }

  /* ---------- pause overlay ---------- */
  function pauseOverlay(stageEl, onResume) {
    const overlay = document.createElement('div');
    overlay.className = 'll-overlay';
    overlay.setAttribute('data-pause', '1');
    const h = document.createElement('h3');
    h.textContent = window.LLT('common.pause');
    const btn = document.createElement('button');
    btn.className = 'btn-ll';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' + window.LLT('common.resume');
    btn.addEventListener('click', () => { overlay.remove(); onResume && onResume(); });
    overlay.appendChild(h);
    overlay.appendChild(btn);
    stageEl.appendChild(overlay);
    return overlay;
  }

  /* ---------- results screen ---------- */
  /*
    opts: {
      stageEl: container to clear (optional),
      hostEl: where to inject results (default #ll-results),
      title, subtitle, score (string), stats: [{label, value}],
      gameId: for storage + sharing,
      scoreNum: numeric score for storage,
      meta: extra meta for storage,
      medal: art name (optional),
      extraHTML: custom block (e.g. quiz review),
      autoScroll: true
    }
  */
  function showResults(opts) {
    const host = opts.hostEl || document.getElementById('ll-results');
    if (!host) return;
    host.hidden = false;
    host.innerHTML = '';

    if (opts.stageEl && opts.stageEl.parentElement) {
      // keep the stage in DOM but hide to reduce clutter
      opts.stageEl.classList.add('ll-hidden');
    }

    const card = document.createElement('div');
    card.className = 'll-result-card ll-anim-in';

    /* hero */
    const hero = document.createElement('div');
    hero.className = 'll-result-hero';
    if (opts.medal) {
      const m = document.createElement('div');
      m.className = 'medal';
      m.innerHTML = window.LLArt.svg(opts.medal);
      hero.appendChild(m);
    }
    const h2 = document.createElement('h2');
    h2.textContent = opts.title || window.LLT('common.gameOver');
    hero.appendChild(h2);
    if (opts.subtitle) {
      const sub = document.createElement('div');
      sub.className = 'sub';
      sub.textContent = opts.subtitle;
      hero.appendChild(sub);
    }
    if (opts.score) {
      const sc = document.createElement('div');
      sc.className = 'big-score';
      sc.textContent = opts.score;
      hero.appendChild(sc);
    }
    card.appendChild(hero);

    const body = document.createElement('div');
    body.className = 'll-result-body';

    /* stats */
    if (opts.stats && opts.stats.length) {
      const stats = document.createElement('div');
      stats.className = 'll-result-stats';
      opts.stats.forEach(s => {
        const item = document.createElement('div');
        item.className = 'll-hud-item';
        const l = document.createElement('div');
        l.className = 'label'; l.textContent = s.label;
        const v = document.createElement('div');
        v.className = 'value'; v.textContent = s.value;
        item.appendChild(l); item.appendChild(v);
        stats.appendChild(item);
      });
      body.appendChild(stats);
    }

    if (opts.extraHTML) {
      const ex = document.createElement('div');
      ex.innerHTML = opts.extraHTML;
      body.appendChild(ex);
    }

    /* name row */
    const nameRow = document.createElement('div');
    nameRow.className = 'll-name-row';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'form-control-ll';
    nameInput.maxLength = 24;
    nameInput.placeholder = window.LLT('common.yourName');
    nameInput.value = (window.LLStore.getPlayerName() || '');
    nameRow.appendChild(nameInput);
    card.appendChild(body);
    body.appendChild(nameRow);

    /* actions */
    const actions = document.createElement('div');
    actions.className = 'll-result-actions';
    function mkBtn(label, cls, svgIcon) {
      const b = document.createElement('button');
      b.className = 'btn-ll ' + (cls || '');
      b.innerHTML = svgIcon + '<span>' + label + '</span>';
      return b;
    }
    const ICO_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    const ICO_SHARE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16a3 3 0 0 0-2.4 1.2l-7-4a3 3 0 0 0 0-2.4l7-4A3 3 0 1 0 15 5l-7 4a3 3 0 1 0 0 6l7 4A3 3 0 1 0 18 16z"/></svg>';
    const ICO_DL = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICO_LINK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.6 13.4a1 1 0 0 0 1.4 1.4l4-4a3 3 0 0 0-4.2-4.2l-2 2a1 1 0 1 0 1.4 1.4l2-2a1 1 0 1 1 1.4 1.4l-4 4zm2.8-2.8a1 1 0 0 0-1.4-1.4l-4 4a3 3 0 0 0 4.2 4.2l2-2a1 1 0 1 0-1.4-1.4l-2 2a1 1 0 1 1-1.4-1.4l4-4z"/></svg>';

    const againBtn = mkBtn(window.LLT('common.playAgain'), 'btn-ll-almond', ICO_PLAY);
    const homeBtn = mkBtn(window.LLT('common.home'), 'btn-ll-ghost', '');
    actions.appendChild(againBtn);
    actions.appendChild(homeBtn);
    body.appendChild(actions);

    /* share panel */
    const sharePanel = document.createElement('div');
    sharePanel.className = 'll-share-panel';
    sharePanel.innerHTML = '<h4>' + window.LLT('common.shareTitle') + '</h4>';
    body.appendChild(sharePanel);
    card.appendChild(body);
    host.appendChild(card);

    /* wire buttons */
    againBtn.addEventListener('click', () => {
      host.hidden = true;
      host.innerHTML = '';
      if (opts.stageEl) opts.stageEl.classList.remove('ll-hidden');
      opts.onPlayAgain && opts.onPlayAgain();
    });
    homeBtn.addEventListener('click', () => { location.href = '../index.html'; });
    nameInput.addEventListener('change', () => {
      window.LLStore.setPlayerName(nameInput.value.trim());
    });

    /* share system */
    if (opts.gameId && window.LLShare) {
      window.LLShare.mount(sharePanel, {
        gameId: opts.gameId,
        gameName: opts.gameName || opts.title || '',
        scoreText: opts.score || '',
        scoreNum: opts.scoreNum,
        nameInput: nameInput,
        stats: opts.stats || []
      });
    }

    /* storage */
    if (opts.gameId && typeof opts.scoreNum === 'number') {
      const stats = window.LLStore.recordGame(opts.gameId, opts.scoreNum, opts.meta || {});
      if (opts.scoreNum > 0 && opts.scoreNum === stats.best) {
        setTimeout(() => toast(window.LLT('common.newRecord'), 'success'), 600);
        window.LLSound.play('win');
      }
    }

    if (opts.autoScroll !== false) {
      setTimeout(() => host.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }

  /* ---------- steam puffs ---------- */
  function steam(targetEl, count) {
    if (!targetEl) return;
    for (let i = 0; i < (count || 3); i++) {
      const puff = document.createElement('div');
      puff.className = 'll-steam-puff';
      const size = 14 + Math.random() * 14;
      puff.style.width = size + 'px';
      puff.style.height = size + 'px';
      puff.style.left = (30 + Math.random() * 40) + '%';
      puff.style.top = (12 + Math.random() * 14) + '%';
      puff.style.animationDelay = (i * .45) + 's';
      targetEl.appendChild(puff);
      setTimeout(() => puff.remove(), 4200);
    }
  }

  /* ---------- header controls (sound + language present in markup) ---------- */
  function wireHeader() {
    const sndBtn = document.getElementById('ll-sound-btn');
    if (sndBtn) {
      const paint = () => {
        sndBtn.classList.toggle('active', !window.LLSound.isMuted());
        sndBtn.setAttribute('aria-label', window.LLSound.isMuted() ? window.LLT('common.soundOff') : window.LLT('common.soundOn'));
        sndBtn.innerHTML = window.LLSound.isMuted()
          ? '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
      };
      paint();
      sndBtn.addEventListener('click', () => { window.LLSound.toggle(); paint(); });
      document.addEventListener('ll:lang', paint);
    }
    document.addEventListener('pointerdown', () => window.LLSound.unlock(), { once: true, capture: true });
  }

  window.LLUI = {
    toast, confetti, floatText, countdown, pauseOverlay, showResults, steam, wireHeader
  };

  document.addEventListener('DOMContentLoaded', wireHeader);
})();
