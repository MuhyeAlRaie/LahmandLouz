/* ============================================================
   Lahm & Loz — Game 6: Virtual Mansaf Spoon
   The player's hand (MediaPipe) or finger controls a spoon;
   scoop rice, meat and almonds in a 45-second round.
   ============================================================ */

(function () {
  'use strict';

  const GAME_ID = 'virtual-mansaf-spoon';
  const DURATION = 45;

  const canvas = document.getElementById('sp-canvas');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('sp-wrap');
  const video = document.getElementById('sp-video');
  const preview = document.getElementById('sp-cam-preview');
  const camDot = document.getElementById('sp-cam-dot');
  const camStatus = document.getElementById('sp-cam-status');
  const hint = document.getElementById('sp-hint');
  const stage = document.getElementById('ll-stage');
  const results = document.getElementById('ll-results');
  const elScore = document.getElementById('sp-score');
  const elTime = document.getElementById('sp-time');
  const elBest = document.getElementById('sp-best');

  const IMG = {};
  function art(n) { return window.LLArt.image(n); }

  const KINDS = [
    { kind: 'rice', art: 'rice-clump', score: 5, weight: 3, r: 34, color: '#B98448' },
    { kind: 'meat', art: 'meat',       score: 10, weight: 2, r: 34, color: '#164B2A' },
    { kind: 'almond', art: 'almond',   score: 5, weight: 3, r: 28, color: '#8A5B28' },
    { kind: 'bonus', art: 'golden-almond', score: 20, weight: 1, r: 26, color: '#E8B04B' },
    { kind: 'chili', art: 'chili',     score: -5, weight: 1, r: 26, color: '#C0392B' }
  ];
  const BAG = [];
  KINDS.forEach(k => { for (let i = 0; i < k.weight; i++) BAG.push(k); });

  const S = {
    mode: 'touch',
    running: false,
    paused: false,
    over: true,
    score: 0,
    timeLeft: DURATION,
    elapsed: 0,
    items: [],
    floats: [],
    spawnTimer: 0,
    spawnInterval: 0.75,
    spoon: { x: 0, y: 0, tx: 0, ty: 0 },
    raf: 0,
    lastTs: 0,
    countdownHold: false
  };

  function fitCanvas() {
    const cssW = Math.min(wrap.clientWidth || 880, 920);
    canvas.width = cssW;
    canvas.height = Math.round(cssW * 0.58);
    S.spoon.x = S.spoon.tx = canvas.width / 2;
    S.spoon.y = S.spoon.ty = canvas.height / 2;
  }

  function paintCam(ok, err) {
    camDot.className = 'll-dot ' + (ok ? 'ok' : (err ? 'err' : 'warn pulse'));
    camStatus.textContent = ok ? window.LLT('common.cameraOn')
      : (err ? window.LLT('common.cameraDenied') : window.LLT('common.cameraStarting'));
  }
  function showPreview(on) { preview.style.display = on ? 'block' : 'none'; }

  /* ---------- input: touch ---------- */
  function pointerTarget(ev) {
    const r = canvas.getBoundingClientRect();
    S.spoon.tx = (ev.clientX - r.left) * (canvas.width / r.width);
    S.spoon.ty = (ev.clientY - r.top) * (canvas.height / r.height);
  }
  canvas.addEventListener('pointermove', ev => { if (S.mode === 'touch') pointerTarget(ev); });
  canvas.addEventListener('pointerdown', ev => { if (S.mode === 'touch') pointerTarget(ev); });

  /* ---------- camera ---------- */
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
      await window.LLHands.start(video, data => {
        if (!data.hand) return;
        const m = 30;
        S.spoon.tx = m + data.palm.x * (canvas.width - 2 * m);
        S.spoon.ty = m + data.palm.y * (canvas.height - 2 * m);
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
      hint.textContent = window.LLT('spoon.hintTouch');
    } else {
      hint.textContent = window.LLT('spoon.hintCam');
    }
  }

  /* ---------- items ---------- */
  function spawnItem() {
    const k = BAG[Math.floor(Math.random() * BAG.length)];
    const r = k.r * (S.elapsed > 25 ? 0.85 : 1); /* shrink over time */
    const pad = r + 14;
    S.items.push({
      k, r,
      x: pad + Math.random() * (canvas.width - 2 * pad),
      y: pad + Math.random() * (canvas.height - 2 * pad),
      life: 4,
      born: S.elapsed,
      rot: (Math.random() - .5) * .6
    });
  }

  function addFloat(x, y, text, color) {
    S.floats.push({ x, y, text, color, life: 1 });
  }

  /* ---------- loop ---------- */
  function update(dt) {
    if (S.paused || S.over || S.countdownHold) return;

    S.elapsed += dt;
    S.timeLeft -= dt;
    elTime.textContent = Math.ceil(S.timeLeft);
    if (S.timeLeft <= 0) { S.timeLeft = 0; elTime.textContent = '0'; endGame(); return; }

    S.spawnInterval = Math.max(0.42, 0.75 - S.elapsed * 0.008);
    S.spawnTimer -= dt;
    const maxItems = S.elapsed > 20 ? 6 : 5;
    if (S.spawnTimer <= 0 && S.items.length < maxItems) {
      spawnItem();
      S.spawnTimer = S.spawnInterval;
    }

    /* smooth spoon */
    S.spoon.x += (S.spoon.tx - S.spoon.x) * Math.min(1, dt * 11);
    S.spoon.y += (S.spoon.ty - S.spoon.y) * Math.min(1, dt * 11);

    /* bowl position (spoon svg points up-right at 40°, bowl is upper part) */
    const bowlX = S.spoon.x - 18;
    const bowlY = S.spoon.y - 34;

    for (let i = S.items.length - 1; i >= 0; i--) {
      const it = S.items[i];
      if (S.elapsed - it.born > it.life) { S.items.splice(i, 1); continue; }
      const d = Math.hypot(it.x - bowlX, it.y - bowlY);
      if (d < it.r + 26) {
        S.score = Math.max(0, S.score + it.k.score);
        elScore.textContent = S.score;
        addFloat(it.x, it.y - it.r, (it.k.score > 0 ? '+' : '') + it.k.score, it.k.color);
        window.LLSound.play(it.k.score > 0 ? 'coin' : 'fail');
        S.items.splice(i, 1);
      }
    }

    for (let i = S.floats.length - 1; i >= 0; i--) {
      const f = S.floats[i];
      f.life -= dt * 1.2;
      f.y -= dt * 50;
      if (f.life <= 0) S.floats.splice(i, 1);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* decorative dots grid */
    ctx.fillStyle = 'rgba(57,41,31,.06)';
    for (let gx = 24; gx < canvas.width; gx += 56) {
      for (let gy = 24; gy < canvas.height; gy += 56) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* items */
    S.items.forEach(it => {
      const img = IMG[it.k.art];
      if (!img) return;
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot);
      const pulse = 1 + Math.sin((S.elapsed - it.born) * 4) * 0.04;
      const rr = it.r * pulse;
      ctx.drawImage(img, -rr, -rr, rr * 2, rr * 2);
      ctx.restore();
      /* lifetime ring */
      const left = Math.max(0, it.life - (S.elapsed - it.born));
      ctx.beginPath();
      ctx.strokeStyle = left < 1.2 ? 'rgba(192,57,43,.7)' : 'rgba(46,125,70,.55)';
      ctx.lineWidth = 3;
      ctx.arc(it.x, it.y, it.r + 7, -Math.PI / 2, -Math.PI / 2 + (left / it.life) * Math.PI * 2);
      ctx.stroke();
    });

    /* spoon */
    const sp = IMG.spoon;
    if (sp) {
      ctx.save();
      ctx.translate(S.spoon.x, S.spoon.y);
      ctx.rotate(-0.5);
      ctx.drawImage(sp, -55, -55, 110, 110);
      ctx.restore();
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
    S.spoon.x = S.spoon.tx = canvas.width / 2;
    S.spoon.y = S.spoon.ty = canvas.height / 2;
    elScore.textContent = '0';
    elTime.textContent = DURATION;
    elBest.textContent = window.LLStore.getBest(GAME_ID);

    if (mode === 'cam') {
      const ok = await startCamera();
      if (!ok) return;
    } else {
      setMode('touch');
    }

    S.over = false;
    S.paused = false;
    S.countdownHold = true;
    S.running = true;
    S.lastTs = 0;
    cancelAnimationFrame(S.raf);
    S.raf = requestAnimationFrame(frame);
    window.LLUI.countdown(stage, () => { S.countdownHold = false; });
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
    const best = window.LLStore.getBest(GAME_ID);
    window.LLUI.showResults({
      stageEl: stage,
      hostEl: results,
      title: window.LLT('common.gameOver'),
      subtitle: window.LLT('spoon.title'),
      score: String(S.score),
      gameId: GAME_ID,
      scoreNum: S.score,
      medal: 'spoon',
      stats: [
        { label: window.LLT('common.best'), value: String(Math.max(best, S.score)) },
        { label: window.LLT('common.time'), value: DURATION + ' ' + window.LLT('common.sec') }
      ],
      onPlayAgain: () => begin(S.mode)
    });
  }

  /* ---------- wiring ---------- */
  document.getElementById('sp-mode-cam').addEventListener('click', () => { window.LLSound.play('click'); begin('cam'); });
  document.getElementById('sp-mode-touch').addEventListener('click', () => { window.LLSound.play('click'); begin('touch'); });
  document.getElementById('sp-restart').addEventListener('click', () => { window.LLSound.play('click'); begin(S.mode); });
  document.getElementById('sp-pause').addEventListener('click', () => {
    if (S.over || !S.running || S.paused) return;
    S.paused = true;
    window.LLSound.play('click');
    window.LLUI.pauseOverlay(stage, () => { S.paused = false; S.lastTs = 0; });
  });
  document.getElementById('ll-start-btn').addEventListener('click', () => {
    window.LLSound.play('click');
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    begin(S.mode);
  });
  document.addEventListener('ll:lang', () => {
    hint.textContent = S.mode === 'cam' ? window.LLT('spoon.hintCam') : window.LLT('spoon.hintTouch');
    if (window.LLHands.isRunning()) paintCam(true);
  });
  window.addEventListener('resize', fitCanvas);

  elBest.textContent = window.LLStore.getBest(GAME_ID);
  fitCanvas();
  draw();
  Promise.all([art('rice-clump'), art('meat'), art('almond'), art('golden-almond'), art('chili'), art('spoon')])
    .then(imgs => {
      IMG['rice-clump'] = imgs[0]; IMG.meat = imgs[1]; IMG.almond = imgs[2];
      IMG['golden-almond'] = imgs[3]; IMG.chili = imgs[4]; IMG.spoon = imgs[5];
      draw();
    }).catch(() => {});
})();
