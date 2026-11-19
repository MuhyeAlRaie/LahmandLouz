/* ============================================================
   Lahm & Loz — Game 4: Mansaf Reflex Challenge
   Reaction time with two modes: touch and MediaPipe hand
   tracking (open palm triggers). Five attempts, average,
   best record, premature-tap detection.
   ============================================================ */

(function () {
  'use strict';

  const GAME_ID = 'mansaf-reflex';
  const ATTEMPTS_N = 5;

  const stage = document.getElementById('ll-stage');
  const results = document.getElementById('ll-results');
  const zone = document.getElementById('rf-zone');
  const zoneTitle = document.getElementById('rf-title');
  const zoneSub = document.getElementById('rf-sub');
  const zoneLast = document.getElementById('rf-last');
  const attemptsBox = document.getElementById('rf-attempts');
  const camDot = document.getElementById('rf-cam-dot');
  const camStatus = document.getElementById('rf-cam-status');

  const S = {
    mode: 'touch',
    state: 'idle',        // idle | wait | go | done
    attempts: [],         // {ms, ok}
    signalAt: 0,
    waitTimer: 0,
    openFrames: 0,
    running: false
  };

  function paintCam(ok, err, starting) {
    camDot.className = 'll-dot ' + (ok ? 'ok' : (err ? 'err' : (starting ? 'warn pulse' : '')));
    camStatus.textContent = ok ? window.LLT('common.cameraOn')
      : (err ? window.LLT('common.cameraDenied') : (starting ? window.LLT('common.cameraStarting') : window.LLT('common.cameraOff')));
  }

  function zoneIcon(art) {
    const old = zone.querySelector('.go-icon-wrap');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'go-icon-wrap';
    el.innerHTML = window.LLArt.svg(art);
    zone.insertBefore(el, zoneTitle);
    const svg = el.querySelector('svg');
    if (svg) svg.classList.add('go-icon');
  }

  function setState(st) {
    S.state = st;
    zone.classList.remove('wait', 'go', 'early');
    if (st === 'wait') {
      zone.classList.add('wait');
      zoneTitle.textContent = window.LLT('reflex.wait');
      zoneSub.textContent = S.mode === 'cam' ? window.LLT('reflex.handHint') : '';
      const old = zone.querySelector('.go-icon-wrap');
      if (old) old.remove();
    } else if (st === 'go') {
      zone.classList.add('go');
      zoneTitle.textContent = window.LLT('reflex.goNow');
      zoneSub.textContent = '';
      zoneIcon(Math.random() < .5 ? 'meat' : 'almond');
    }
  }

  function paintAttempts() {
    attemptsBox.innerHTML = '';
    for (let i = 0; i < ATTEMPTS_N; i++) {
      const a = S.attempts[i];
      const el = document.createElement('div');
      el.className = 'att' + (a ? ' fresh' : '');
      el.textContent = a ? (a.ok ? a.ms + ' ' + window.LLT('reflex.ms') : window.LLT('reflex.early').split('!')[0]) : (i + 1);
      attemptsBox.appendChild(el);
    }
  }

  /* ---------- flow ---------- */
  function nextAttempt() {
    if (S.attempts.length >= ATTEMPTS_N) { finish(); return; }
    zoneLast.classList.add('ll-hidden');
    setState('wait');
    const delay = 1500 + Math.random() * 2500;
    S.waitTimer = setTimeout(() => {
      setState('go');
      S.signalAt = performance.now();
      window.LLSound.play('go');
    }, delay);
  }

  function trigger() {
    if (S.state === 'idle' || !S.running) {
      if (!S.running) { start(); return; }
    }
    if (S.state === 'wait') {
      clearTimeout(S.waitTimer);
      S.state = 'between'; /* ignore repeat taps during the warning delay */
      S.attempts.push({ ok: false });
      window.LLSound.play('fail');
      zone.classList.add('early');
      zoneTitle.textContent = window.LLT('reflex.early');
      paintAttempts();
      setTimeout(() => { if (S.running) nextAttempt(); }, 1100);
    } else if (S.state === 'go') {
      const ms = Math.round(performance.now() - S.signalAt);
      S.state = 'between'; /* ignore repeat taps until the next attempt starts */
      S.attempts.push({ ok: true, ms });
      window.LLSound.play('coin');
      zoneLast.classList.remove('ll-hidden');
      zoneLast.textContent = ms + ' ' + window.LLT('reflex.ms');
      paintAttempts();
      setTimeout(() => { if (S.running) nextAttempt(); }, 900);
    } else if (S.state === 'idle') {
      start();
    }
  }

  function rankOf(avg) {
    if (avg < 250) return 'reflex.rank1';
    if (avg < 400) return 'reflex.rank2';
    return 'reflex.rank3';
  }

  function finish() {
    S.running = false;
    window.LLHands.stop();
    paintCam(false, true);
    const ok = S.attempts.filter(a => a.ok).map(a => a.ms);
    if (!ok.length) {
      window.LLUI.showResults({
        stageEl: stage,
        hostEl: results,
        title: window.LLT('reflex.rank3'),
        subtitle: window.LLT('reflex.title'),
        score: '—',
        gameId: GAME_ID,
        scoreNum: 0,
        medal: 'chili',
        stats: [{ label: window.LLT('reflex.early'), value: S.attempts.filter(a => !a.ok).length }],
        onPlayAgain: () => start()
      });
      return;
    }
    const avg = Math.round(ok.reduce((s, m) => s + m, 0) / ok.length);
    const rank = rankOf(avg);

    /* best-ever average (this device): compare against saved history */
    const prev = window.LLStore.getGameStats(GAME_ID);
    let bestAvg = avg;
    if (prev && prev.history) {
      const mses = prev.history.map(h => (h.meta && h.meta.avgMs)).filter(Boolean);
      if (mses.length) bestAvg = Math.min(avg, Math.min.apply(null, mses));
    }

    window.LLUI.confetti(avg < 300 ? 90 : 50);
    window.LLSound.play('win');
    window.LLUI.showResults({
      stageEl: stage,
      hostEl: results,
      title: window.LLT(rank),
      subtitle: window.LLT('reflex.title'),
      score: avg + ' ' + window.LLT('reflex.ms'),
      gameId: GAME_ID,
      /* lower is better: encode score as bonus points so best keeps improving */
      scoreNum: Math.max(0, 1000 - avg),
      meta: { avgMs: avg },
      stats: [
        { label: window.LLT('reflex.avg'), value: avg + ' ' + window.LLT('reflex.ms') },
        { label: window.LLT('reflex.early'), value: S.attempts.filter(a => !a.ok).length },
        { label: window.LLT('common.best'), value: bestAvg + ' ' + window.LLT('reflex.ms') }
      ],
      onPlayAgain: () => start()
    });
  }

  async function start() {
    results.hidden = true;
    results.innerHTML = '';
    stage.classList.remove('ll-hidden');
    S.attempts = [];
    paintAttempts();
    S.running = true;
    window.LLSound.play('click');

    if (S.mode === 'cam') {
      if (!window.LLHands.isSupported() || !window.LLHands.isSecure()) {
        paintCam(false, true);
        window.LLUI.toast(window.LLT('common.cameraDenied'), 'error');
        S.mode = 'touch';
        paintModeBtns();
      } else {
        paintCam(false, false, true);
        try {
          const video = ensureVideo();
          await window.LLHands.start(video, data => {
            if (!S.running || S.state !== 'go') return;
            if (data.hand && data.open) {
              S.openFrames++;
              if (S.openFrames >= 2) { S.openFrames = 0; trigger(); }
            } else {
              S.openFrames = 0;
            }
          });
          paintCam(true);
        } catch (e) {
          paintCam(false, true);
          window.LLUI.toast(window.LLT('common.cameraDenied'), 'error');
          S.mode = 'touch';
          paintModeBtns();
        }
      }
    }
    nextAttempt();
  }

  function ensureVideo() {
    let v = document.getElementById('rf-video');
    if (!v) {
      v = document.createElement('video');
      v.id = 'rf-video';
      v.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
      stage.appendChild(v);
    }
    return v;
  }

  /* ---------- mode buttons ---------- */
  const btnTouch = document.getElementById('rf-mode-touch');
  const btnHand = document.getElementById('rf-mode-hand');
  function paintModeBtns() {
    btnTouch.classList.toggle('btn-ll-almond', S.mode === 'touch');
    btnTouch.classList.toggle('btn-ll', true);
    btnHand.classList.toggle('btn-ll-almond', S.mode === 'cam');
  }
  btnTouch.addEventListener('click', () => { S.mode = 'touch'; window.LLHands.stop(); paintCam(false, true); paintModeBtns(); reset(); });
  btnHand.addEventListener('click', () => { S.mode = 'cam'; paintModeBtns(); reset(); });
  document.getElementById('rf-restart').addEventListener('click', () => reset());
  document.getElementById('ll-start-btn').addEventListener('click', () => {
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    reset();
  });

  function reset() {
    clearTimeout(S.waitTimer);
    S.running = false;
    window.LLHands.stop();
    S.attempts = [];
    paintAttempts();
    setState('idle');
    zoneTitle.textContent = window.LLT('reflex.wait');
    zoneSub.textContent = S.mode === 'cam' ? window.LLT('reflex.handHint') : '';
    zoneLast.classList.add('ll-hidden');
    results.hidden = true;
    results.innerHTML = '';
  }

  /* ---------- input ---------- */
  zone.addEventListener('pointerdown', ev => { ev.preventDefault(); trigger(); });
  zone.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); trigger(); }
  });

  paintModeBtns();
  paintCam(false, true);
  setState('idle');
  paintAttempts();
  document.addEventListener('ll:lang', () => {
    if (S.state === 'idle') {
      zoneTitle.textContent = window.LLT('reflex.wait');
      zoneSub.textContent = S.mode === 'cam' ? window.LLT('reflex.handHint') : '';
    }
    paintAttempts();
  });
})();
