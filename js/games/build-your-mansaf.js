/* ============================================================
   Lahm & Loz — Game 3: Build Your Mansaf
   Drag-and-drop / tap assembly in the correct order:
   rice -> meat -> jameed sauce -> almonds -> serve.
   Normal mode + 60s time challenge.
   ============================================================ */

(function () {
  'use strict';

  const GAME_ID = 'build-your-mansaf';
  const TIMED_SECONDS = 60;

  const stage = document.getElementById('ll-stage');
  const results = document.getElementById('ll-results');
  const plateWrap = document.getElementById('bd-plate-wrap');
  const plateArt = document.getElementById('bd-plate-art');
  const itemsBox = document.getElementById('bd-items');
  const stepsBox = document.getElementById('bd-steps');
  const hintEl = document.getElementById('bd-hint');
  const serveBtn = document.getElementById('bd-serve');
  const elScore = document.getElementById('bd-score');
  const elTime = document.getElementById('bd-time');
  const timeBox = document.getElementById('bd-time-box');
  const elBest = document.getElementById('bd-best');

  const STEP_KEYS = ['build.stepRice', 'build.stepMeat', 'build.stepJameed', 'build.stepAlmond', 'build.stepServe'];
  const STEP_KINDS = ['rice', 'meat', 'jameed', 'almond'];
  const NAME_KEYS = { rice: 'build.stepRice', meat: 'build.stepMeat', jameed: 'build.stepJameed', almond: 'build.stepAlmond' };
  /* layer art + placement over the plate (percentages of plate box) */
  const LAYER = {
    rice:   { art: 'rice',   x: 50, y: 52, w: 64 },
    meat:   { art: 'meat',   x: 50, y: 36, w: 30 },
    jameed: { art: 'jameed', x: 50, y: 43, w: 26 },
    almond: { art: 'almond', x: 50, y: 27, w: 13 }
  };

  const S = {
    mode: 'normal',
    step: 0,          // 0..4 (4 = serve)
    score: 0,
    streak: 0,
    startedAt: 0,
    timeLeft: TIMED_SECONDS,
    timer: 0,
    over: false,
    elapsed: 0,
    tick: 0
  };

  /* ---------- rendering ---------- */
  function renderPlate() {
    plateArt.innerHTML = '<div data-art="plate"></div>';
    window.LLArt.inject(plateArt);
  }

  function addLayer(kind) {
    const L = LAYER[kind];
    const el = document.createElement('div');
    el.className = 'll-build-layer';
    el.style.width = L.w + '%';
    el.style.left = L.x + '%';
    el.style.top = L.y + '%';
    el.style.bottom = 'auto';
    el.style.right = 'auto';
    el.style.transform = 'translate(-50%, -50%)';
    el.setAttribute('data-art', L.art);
    plateArt.appendChild(el);
    window.LLArt.inject(plateArt);
    const svg = el.querySelector('svg');
    if (svg) { svg.style.width = '100%'; svg.style.height = 'auto'; }
  }

  function paintSteps() {
    stepsBox.querySelectorAll('.step').forEach(el => {
      const n = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('done', n <= S.step);
      el.classList.toggle('now', n === S.step + 1);
    });
  }

  function paintHint() {
    hintEl.textContent = window.LLT(STEP_KEYS[S.step]);
  }

  function paintScore() { elScore.textContent = S.score; }

  function refreshItems() {
    itemsBox.querySelectorAll('.ll-build-item').forEach(el => {
      el.classList.toggle('used', STEP_KINDS.indexOf(el.getAttribute('data-kind')) < S.step);
    });
  }

  /* ---------- placement ---------- */
  function tryPlace(kind, itemEl) {
    if (S.over) return;
    const expected = STEP_KINDS[S.step];
    if (kind === expected) {
      S.step++;
      S.streak++;
      let gained = 100;
      if (S.streak > 1) {
        const bonus = 25 * (S.streak - 1);
        gained += bonus;
        window.LLUI.toast(window.LLT('build.streak', { n: bonus }), 'success');
      }
      S.score += gained;
      window.LLSound.play('success');
      addLayer(kind);
      paintSteps();
      paintScore();
      refreshItems();
      if (S.step < 4) {
        paintHint();
      } else {
        hintEl.textContent = window.LLT('build.stepServe');
        serveBtn.style.display = 'inline-flex';
        serveBtn.classList.add('ll-anim-in');
      }
      window.LLUI.steam(plateWrap, 2);
    } else {
      S.streak = 0;
      window.LLSound.play('fail');
      hintEl.classList.remove('ll-shake');
      void hintEl.offsetWidth;
      hintEl.classList.add('ll-shake');
      window.LLUI.toast(window.LLT('build.wrong'), 'error');
    }
  }

  /* ---------- drag & drop + tap ---------- */
  let drag = null;

  function onPointerDown(ev, itemEl) {
    if (S.over || itemEl.classList.contains('used')) return;
    drag = {
      el: itemEl,
      startX: ev.clientX,
      startY: ev.clientY,
      ghost: null,
      dragging: false,
      pointerId: ev.pointerId
    };
    ev.preventDefault();
  }

  function onPointerMove(ev) {
    if (!drag) return;
    const dx = ev.clientX - drag.startX;
    const dy = ev.clientY - drag.startY;
    if (!drag.dragging && Math.hypot(dx, dy) > 10) {
      drag.dragging = true;
      const ghost = drag.el.cloneNode(true);
      ghost.classList.add('dragging');
      ghost.style.width = drag.el.offsetWidth + 'px';
      document.body.appendChild(ghost);
      drag.ghost = ghost;
      plateWrap.classList.add('droppable');
      window.LLSound.play('flip');
    }
    if (drag.dragging && drag.ghost) {
      drag.ghost.style.left = (ev.clientX - drag.el.offsetWidth / 2) + 'px';
      drag.ghost.style.top = (ev.clientY - 40) + 'px';
    }
  }

  function onPointerUp(ev) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.ghost) d.ghost.remove();
    plateWrap.classList.remove('droppable');
    if (d.dragging) {
      const r = plateWrap.getBoundingClientRect();
      const inside = ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
      if (inside) tryPlace(d.el.getAttribute('data-kind'), d.el);
    } else {
      /* tap (kiosk friendly) */
      tryPlace(d.el.getAttribute('data-kind'), d.el);
    }
  }

  itemsBox.querySelectorAll('.ll-build-item').forEach(el => {
    el.addEventListener('pointerdown', ev => onPointerDown(ev, el));
    el.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tryPlace(el.getAttribute('data-kind'), el); }
    });
  });
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', () => {
    if (drag && drag.ghost) drag.ghost.remove();
    if (drag) plateWrap.classList.remove('droppable');
    drag = null;
  });

  /* ---------- timer ---------- */
  function startTimer() {
    S.timeLeft = TIMED_SECONDS;
    timeBox.style.display = '';
    elTime.textContent = TIMED_SECONDS;
    S.tick = setInterval(() => {
      if (S.over) return;
      S.timeLeft--;
      S.elapsed++;
      elTime.textContent = S.timeLeft;
      if (S.timeLeft <= 10) {
        window.LLSound.play('tick');
        elTime.style.color = S.timeLeft <= 5 ? '#C0392B' : '';
      }
      if (S.timeLeft <= 0) failGame();
    }, 1000);
  }

  /* ---------- lifecycle ---------- */
  function begin(mode) {
    clearInterval(S.tick);
    results.hidden = true;
    results.innerHTML = '';
    stage.classList.remove('ll-hidden');
    S.mode = mode;
    S.step = 0;
    S.score = 0;
    S.streak = 0;
    S.over = false;
    S.startedAt = performance.now();
    S.elapsed = 0;
    serveBtn.style.display = 'none';
    renderPlate();
    paintSteps();
    paintHint();
    paintScore();
    refreshItems();
    elBest.textContent = window.LLStore.getBest(GAME_ID);
    if (mode === 'timed') startTimer();
    else timeBox.style.display = 'none';
    window.LLSound.play('click');
  }

  function endGame(done) {
    S.over = true;
    clearInterval(S.tick);
    const elapsedSec = Math.round((performance.now() - S.startedAt) / 1000);
    let completion = 0, timeBonus = 0;
    if (done) {
      completion = 200;
      timeBonus = S.mode === 'timed' ? S.timeLeft * 10 : Math.max(0, 300 - elapsedSec * 2);
      S.score += completion + timeBonus;
      window.LLSound.play('win');
      window.LLUI.confetti(110);
      window.LLUI.steam(plateWrap, 5);
    } else {
      window.LLSound.play('gameover');
    }
    paintScore();
    const best = window.LLStore.getBest(GAME_ID);

    window.LLUI.showResults({
      stageEl: stage,
      hostEl: results,
      title: done ? window.LLT('build.done') : window.LLT('common.gameOver'),
      subtitle: window.LLT('build.title'),
      score: String(S.score),
      gameId: GAME_ID,
      scoreNum: S.score,
      medal: done ? 'mansaf' : 'chili',
      stats: [
        { label: window.LLT('common.time'), value: elapsedSec + ' ' + window.LLT('common.sec') },
        { label: window.LLT('common.best'), value: String(Math.max(best, S.score)) }
      ].concat(timeBonus ? [{ label: window.LLT('build.timeBonus', { n: timeBonus }), value: '+' + (completion + timeBonus) }] : []),
      onPlayAgain: () => begin(S.mode)
    });
  }

  function failGame() { endGame(false); }

  serveBtn.addEventListener('click', () => {
    window.LLSound.play('perfect');
    endGame(true);
  });
  document.getElementById('bd-restart').addEventListener('click', () => begin(S.mode));
  document.getElementById('ll-start-btn').addEventListener('click', () => {
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    begin('normal');
  });
  document.getElementById('ll-start-timed').addEventListener('click', () => {
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    begin('timed');
  });
  document.addEventListener('ll:lang', () => {
    paintHint();
    refreshItems();
    itemsBox.querySelectorAll('.iname').forEach(el => {
      const kind = el.parentElement.getAttribute('data-kind');
      el.textContent = window.LLT(NAME_KEYS[kind]).replace(/^(أضف|Add) /, '').replace(/^the /, '');
    });
  });

  elBest.textContent = window.LLStore.getBest(GAME_ID);
  renderPlate();
  paintSteps();
  paintHint();
  refreshItems();
})();
