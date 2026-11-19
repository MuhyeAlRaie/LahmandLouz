/* ============================================================
   Lahm & Loz — Game 2: Catch the Mansaf
   MediaPipe hand-tracking controls the basket; touch/mouse
   fallback is always available. 30-second arcade round.
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('ct-canvas');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('ct-wrap');
  const video = document.getElementById('ct-video');
  const preview = document.getElementById('ct-cam-preview');
  const camDot = document.getElementById('ct-cam-dot');
  const camStatus = document.getElementById('ct-cam-status');
  const hint = document.getElementById('ct-hint');
  const stage = document.getElementById('ll-stage');
  const results = document.getElementById('ll-results');
  const elScore = document.getElementById('ct-score');
  const elTime = document.getElementById('ct-time');
  const elBest = document.getElementById('ct-best');

  const GAME_ID = 'catch-the-mansaf';
  const DURATION = 30; // seconds

  const IMG = {};
  function art(n) { return window.LLArt.image(n); }

  const S = {
    mode: 'touch',
    running: false,
    paused: false,
    over: true,
    score: 0,
    timeLeft: DURATION,
    items: [],
    floats: [],
    basket: { x: 0, target: 0, w: 150 },
    spawnTimer: 0,
    spawnInterval: 0.9,
    elapsed: 0,
    raf: 0,
    lastTs: 0,
    countdownHold: false
  };

  function W() { return canvas.width; }
  function H() { return canvas.height; }

  function fitCanvas() {
    const cssW = Math.min(wrap.clientWidth || 880, 920);
    const cssH = Math.round(cssW * 0.58);
    canvas.width = cssW;
    canvas.height = cssH;
    canvas.style.height = 'auto';
    S.basket.x = S.basket.x || cssW / 2;
    S.basket.target = S.basket.x;
  }

  function paintCam(ok, err) {
    camDot.className = 'll-dot ' + (ok ? 'ok' : (err ? 'err' : 'warn pulse'));
    camStatus.textContent = ok ? window.LLT('common.cameraOn')
      : (err ? window.LLT('common.cameraDenied') : window.LLT('common.cameraStarting'));
  }

  function showPreview(on) {
    preview.style.display = on ? 'block' : 'none';
  }

  /* ---------- input: touch / mouse ---------- */
  function pointerTarget(ev) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (canvas.width / r.width);
    S.basket.target = Math.max(S.basket.w / 2, Math.min(canvas.width - S.basket.w / 2, x));
  }
  canvas.addEventListener('pointermove', ev => { if (S.mode === 'touch') pointerTarget(ev); });
  canvas.addEventListener('pointerdown', ev => { if (S.mode === 'touch') pointerTarget(ev); });

  /* ---------- camera mode ---------- */
  async function startCamera() {
    paintCam(false, false);
    if (!window.LLHands.isSupported() || !window.LLHands.isSecure()) {
      paintCam(false, true);
      window.LLUI.toast(window.LLT('common.cameraDenied'), 'error');
      setMode('touch');
      return false;
    }
    try {
      showPreview(true);
      paintCam(false, false);
      await window.LLHands.start(video, data => {
        if (!data.hand) return;
        const m = S.basket.w / 2 + 10;
        S.basket.target = m + data.palm.x * (canvas.width - 2 * m);
      });
      paintCam(true);
      return true;
    } catch (e) {
      showPreview(false);
      window.LLHands.stop();
      paintCam(false, true);
      window.LLUI.toast(window.LLT('common.cameraDenied'), 'error');
      setMode('touch');
      return false;
    }
  }

  function setMode(mode) {
    S.mode = mode;
    if (mode === 'touch') {
      window.LLHands.stop();
      showPreview(false);
      paintCam(false, true);
      hint.textContent = window.LLT('catch.hintTouch');
    } else {
      hint.textContent = window.LLT('catch.hintCam');
    }
  }

  /* ---------- items ---------- */
  function spawnItem() {
    const kinds = ['meat', 'meat', 'almond', 'almond', 'almond', 'bonus', 'chili', 'chili'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const r = 26 + Math.random() * 6;
    S.items.push({
      kind,
      x: 40 + Math.random() * (canvas.width - 80),
      y: -40,
      vy: 130 + Math.random() * 70 + S.elapsed * 4.5,
      rot: (Math.random() - .5) * 1.4,
      vr: (Math.random() - .5) * 2,
      r
    });
  }

  const KIND_SCORE = { meat: 10, almond: 5, bonus: 20, chili: -5 };
  const KIND_ART = { meat: 'meat', almond: 'almond', bonus: 'golden-almond', chili: 'chili' };
  const KIND_COLOR = { meat: '#164B2A', almond: '#B98448', bonus: '#E8B04B', chili: '#C0392B' };

  function addFloat(x, y, text, color) {
    S.floats.push({ x, y, text, color, life: 1 });
  }

  /* ---------- loop ---------- */
  function update(dt) {
    if (S.paused || S.over || S.countdownHold) return;

    S.elapsed += dt;
    S.timeLeft -= dt;
    if (S.timeLeft <= 0) { S.timeLeft = 0; endGame(); return; }

    S.spawnInterval = Math.max(0.45, 0.9 - S.elapsed * 0.015);
    S.spawnTimer -= dt;
    if (S.spawnTimer <= 0) { spawnItem(); S.spawnTimer = S.spawnInterval; }

    const bx = S.basket.x;
    S.basket.x += (S.basket.target - bx) * Math.min(1, dt * 9);

    const basketTop = H() - 96;
    for (let i = S.items.length - 1; i >= 0; i--) {
      const it = S.items[i];
      it.y += it.vy * dt;
      it.rot += it.vr * dt;
      const caught = it.y + it.r * .6 > basketTop && it.y - it.r * .4 < basketTop + 50 &&
        Math.abs(it.x - S.basket.x) < S.basket.w / 2 + it.r * .35;
      if (caught) {
        const pts = KIND_SCORE[it.kind];
        S.score = Math.max(0, S.score + pts);
        addFloat(it.x, basketTop - 10, (pts > 0 ? '+' : '') + pts, KIND_COLOR[it.kind]);
        window.LLSound.play(it.kind === 'chili' ? 'fail' : 'coin');
        S.items.splice(i, 1);
        elScore.textContent = S.score;
        continue;
      }
      if (it.y > H() + 60) S.items.splice(i, 1);
    }

    for (let i = S.floats.length - 1; i >= 0; i--) {
      const f = S.floats[i];
      f.life -= dt * 1.2;
      f.y -= dt * 50;
      if (f.life <= 0) S.floats.splice(i, 1);
    }

    elTime.textContent = Math.ceil(S.timeLeft);
  }

  function draw() {
    ctx.clearRect(0, 0, W(), H());

    /* decorative table line */
    ctx.strokeStyle = 'rgba(57,41,31,.12)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 12]);
    ctx.beginPath();
    ctx.moveTo(0, H() - 44);
    ctx.lineTo(W(), H() - 44);
    ctx.stroke();
    ctx.setLineDash([]);

    /* items */
    S.items.forEach(it => {
      const img = IMG[KIND_ART[it.kind]];
      if (!img) return;
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot);
      ctx.drawImage(img, -it.r, -it.r, it.r * 2, it.r * 2);
      ctx.restore();
    });

    /* basket */
    const basketImg = IMG.basket;
    const bTop = H() - 96;
    if (basketImg) {
      ctx.drawImage(basketImg, S.basket.x - S.basket.w / 2, bTop - 14, S.basket.w, S.basket.w * 0.95);
    }

    /* floats */
    S.floats.forEach(f => {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.font = '900 26px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    });

    /* hand indicator */
    if (S.mode === 'cam' && window.LLHands.isRunning()) {
      ctx.fillStyle = 'rgba(46,125,70,.9)';
      ctx.font = '700 16px Cairo, sans-serif';
      ctx.textAlign = 'start';
      ctx.fillText(window.LLT('common.cameraOn'), 12, 24);
    }
  }

  function frame(ts) {
    if (!S.running) return;
    const dt = Math.min(0.05, (ts - (S.lastTs || ts)) / 1000);
    S.lastTs = ts;
    update(dt);
    draw();
    S.raf = requestAnimationFrame(frame);
  }

  /* ---------- lifecycle ---------- */
  async function begin(mode) {
    results.hidden = true;
    results.innerHTML = '';
    stage.classList.remove('ll-hidden');
    fitCanvas();
    S.score = 0;
    S.timeLeft = DURATION;
    S.elapsed = 0;
    S.items = [];
    S.floats = [];
    S.basket.x = W() / 2;
    S.basket.target = W() / 2;
    elScore.textContent = '0';
    elTime.textContent = DURATION;
    elBest.textContent = window.LLStore.getBest(GAME_ID);

    if (mode === 'cam') {
      const ok = await startCamera();
      if (!ok) return;
    }
    setMode(mode);
    if (mode === 'cam') { /* setMode('touch') wasn't called */ }

    S.over = false;
    S.paused = false;
    S.countdownHold = true;
    S.running = true;
    S.lastTs = 0;
    cancelAnimationFrame(S.raf);
    S.raf = requestAnimationFrame(frame);

    window.LLUI.countdown(stage, () => {
      S.countdownHold = false;
    });
  }

  function pause() {
    if (S.over || !S.running || S.paused) return;
    S.paused = true;
    const overlay = window.LLUI.pauseOverlay(stage, () => {
      S.paused = false;
      S.lastTs = 0;
    });
  }

  function endGame() {
    S.over = true;
    S.running = false;
    cancelAnimationFrame(S.raf);
    window.LLHands.stop();
    showPreview(false);
    paintCam(false, true);
    window.LLSound.play('gameover');
    window.LLUI.confetti(70);
    draw();

    const best = window.LLStore.getBest(GAME_ID);
    window.LLUI.showResults({
      stageEl: stage,
      hostEl: results,
      title: window.LLT('common.gameOver'),
      subtitle: window.LLT('catch.title'),
      score: String(S.score),
      gameId: GAME_ID,
      scoreNum: S.score,
      medal: 'golden-almond',
      stats: [
        { label: window.LLT('common.best'), value: String(Math.max(best, S.score)) },
        { label: window.LLT('common.time'), value: DURATION + ' ' + window.LLT('common.sec') }
      ],
      onPlayAgain: () => begin(S.mode)
    });
  }

  /* ---------- wiring ---------- */
  document.getElementById('ct-mode-cam').addEventListener('click', () => { window.LLSound.play('click'); begin('cam'); });
  document.getElementById('ct-mode-touch').addEventListener('click', () => { window.LLSound.play('click'); begin('touch'); });
  document.getElementById('ct-pause').addEventListener('click', () => { window.LLSound.play('click'); pause(); });
  document.getElementById('ct-restart').addEventListener('click', () => { window.LLSound.play('click'); begin(S.mode); });
  document.getElementById('ll-start-btn').addEventListener('click', () => {
    window.LLSound.play('click');
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    begin(S.mode);
  });
  document.addEventListener('ll:lang', () => {
    hint.textContent = S.mode === 'cam' ? window.LLT('catch.hintCam') : window.LLT('catch.hintTouch');
    if (window.LLHands.isRunning()) paintCam(true);
  });
  window.addEventListener('resize', fitCanvas);

  elBest.textContent = window.LLStore.getBest(GAME_ID);
  fitCanvas();
  draw();

  Promise.all([art('meat'), art('almond'), art('golden-almond'), art('chili'), art('basket')])
    .then(imgs => {
      IMG.meat = imgs[0]; IMG.almond = imgs[1]; IMG['golden-almond'] = imgs[2];
      IMG.chili = imgs[3]; IMG.basket = imgs[4];
      draw();
    }).catch(() => {});
})();
