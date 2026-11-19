/* ============================================================
   Lahm & Loz — Game 1: Meat vs Almond (Tic-Tac-Toe)
   Two-player local mode + AI with 3 difficulties
   (easy = random, medium = mixed, hard = full minimax).
   ============================================================ */

(function () {
  'use strict';

  const board = document.getElementById('xo-board');
  const msg = document.getElementById('xo-message');
  const modeSel = document.getElementById('xo-mode');
  const diffSel = document.getElementById('xo-diff');
  const restartBtn = document.getElementById('xo-restart');
  const newMatchBtn = document.getElementById('xo-newmatch');
  const startBtn = document.getElementById('ll-start-btn');
  const stage = document.getElementById('ll-stage');
  const elMeat = document.getElementById('xo-score-meat');
  const elAlmond = document.getElementById('xo-score-almond');
  const elDraw = document.getElementById('xo-score-draw');

  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  let cells = [];
  let grid = new Array(9).fill('');
  let turn = 'M';              // M = meat, A = almond
  let over = false;
  let aiTimer = 0;
  let score = { M: 0, A: 0, D: 0 };
  let humanWinsMatch = 0;      // human wins in current match (AI mode)
  let started = false;

  /* ---------- board build ---------- */
  function buildBoard() {
    board.innerHTML = '';
    cells = [];
    for (let i = 0; i < 9; i++) {
      const c = document.createElement('button');
      c.className = 'll-xo-cell';
      c.setAttribute('aria-label', 'cell ' + (i + 1));
      c.addEventListener('click', () => playCell(i));
      board.appendChild(c);
      cells.push(c);
    }
  }

  function paintMark(i, who) {
    const c = cells[i];
    c.innerHTML = window.LLArt.svg(who === 'M' ? 'meat' : 'almond');
    const svg = c.querySelector('svg');
    if (svg) svg.classList.add('mark-pop');
  }

  function updateMsg(key, vars) {
    msg.textContent = window.LLT(key, vars);
  }

  /* ---------- game flow ---------- */
  function playCell(i) {
    if (over || grid[i]) return;
    if (modeSel.value === 'ai' && turn === 'A') return; // wait for AI

    place(i, turn);
    afterMove();
    if (!over && modeSel.value === 'ai' && turn === 'A') scheduleAI();
  }

  function place(i, who) {
    grid[i] = who;
    paintMark(i, who);
    window.LLSound.play('pop');
    turn = who === 'M' ? 'A' : 'M';
    if (!over) updateMsg(turn === 'M' ? 'xo.turnMeat' : 'xo.turnAlmond');
  }

  function lineWinner(g) {
    for (const [a, b, c] of WINS) {
      if (g[a] && g[a] === g[b] && g[a] === g[c]) return { who: g[a], line: [a, b, c] };
    }
    return null;
  }

  function afterMove() {
    const w = lineWinner(grid);
    if (w) {
      over = true;
      clearTimeout(aiTimer);
      w.line.forEach(i => cells[i].classList.add('win'));
      score[w.who]++;
      window.LLSound.play('win');
      window.LLUI.confetti(50);

      if (modeSel.value === 'ai') {
        if (w.who === 'M') {
          humanWinsMatch++;
          window.LLStore.recordGame('meat-vs-almond', humanWinsMatch, { mode: 'ai', diff: diffSel.value });
        }
        updateMsg('xo.win');
      } else {
        updateMsg(w.who === 'M' ? 'xo.winMeat' : 'xo.winAlmond');
      }
      paintScore();
      showShare(w.who);
      return;
    }
    if (grid.every(v => v)) {
      over = true;
      score.D++;
      window.LLSound.play('fail');
      updateMsg('xo.draw');
      paintScore();
      showShare('D');
    }
  }

  function paintScore() {
    elMeat.textContent = score.M;
    elAlmond.textContent = score.A;
    elDraw.textContent = score.D;
  }

  /* ---------- AI ---------- */
  function emptyCells(g) { const r = []; g.forEach((v, i) => { if (!v) r.push(i); }); return r; }

  function minimax(g, player, ai, depth) {
    const w = lineWinner(g);
    if (w) return { score: w.who === ai ? 10 - depth : depth - 10 };
    if (g.every(v => v)) return { score: 0 };
    let best = null;
    const avail = emptyCells(g);
    for (const i of avail) {
      g[i] = player;
      const r = minimax(g, player === ai ? (ai === 'A' ? 'M' : 'A') : ai, ai, depth + 1);
      g[i] = '';
      const s = r.score;
      if (best === null ||
          (player === ai && s > best.score) ||
          (player !== ai && s < best.score)) {
        best = { score: s, move: i };
      }
    }
    return best;
  }

  function aiMove() {
    const ai = 'A';
    const avail = emptyCells(grid);
    if (!avail.length) return;
    let move;
    const diff = diffSel.value;
    if (diff === 'easy') {
      move = avail[Math.floor(Math.random() * avail.length)];
    } else if (diff === 'medium') {
      move = (Math.random() < 0.5)
        ? minimax(grid.slice(), ai, ai, 0).move
        : avail[Math.floor(Math.random() * avail.length)];
    } else {
      move = minimax(grid.slice(), ai, ai, 0).move;
    }
    if (move == null) move = avail[0];
    place(move, ai);
    afterMove();
  }

  function scheduleAI() {
    updateMsg('xo.thinking');
    aiTimer = setTimeout(() => { if (!over) aiMove(); }, 550);
  }

  /* ---------- rounds ---------- */
  function resetRound(keepScore) {
    clearTimeout(aiTimer);
    if (!keepScore) { score = { M: 0, A: 0, D: 0 }; humanWinsMatch = 0; }
    grid = new Array(9).fill('');
    over = false;
    turn = 'M';
    cells.forEach(c => { c.innerHTML = ''; c.classList.remove('win'); });
    updateMsg('xo.turnMeat');
    paintScore();
    document.getElementById('ll-results').hidden = true;
    document.getElementById('ll-results').innerHTML = '';
  }

  function showShare(who) {
    const results = document.getElementById('ll-results');
    const game = window.LL_GAME_BY_ID('meat-vs-almond');
    const lang = window.LLLang.current;
    const won = (modeSel.value === 'ai' && who === 'M') || modeSel.value === '2p';
    if (!won) return;
    window.LLUI.showResults({
      hostEl: results,
      stageEl: null,
      autoScroll: false,
      title: window.LLT('xo.win'),
      subtitle: lang === 'ar' ? game.titleAr : game.titleEn,
      score: (modeSel.value === 'ai' ? humanWinsMatch : score.M + ' / ' + score.A),
      gameId: 'meat-vs-almond',
      scoreNum: modeSel.value === 'ai' ? humanWinsMatch : score.M,
      meta: { mode: modeSel.value, diff: diffSel.value },
      stats: [
        { label: window.LLT('xo.wins') + ' (M)', value: score.M },
        { label: window.LLT('xo.draws'), value: score.D },
        { label: window.LLT('xo.wins') + ' (A)', value: score.A }
      ],
      onPlayAgain: () => resetRound(true)
    });
  }

  /* ---------- wiring ---------- */
  modeSel.addEventListener('change', () => {
    diffSel.disabled = modeSel.value !== 'ai';
    resetRound(true);
  });
  diffSel.addEventListener('change', () => resetRound(true));
  restartBtn.addEventListener('click', () => { window.LLSound.play('click'); resetRound(true); });
  newMatchBtn.addEventListener('click', () => { window.LLSound.play('click'); resetRound(false); });
  startBtn.addEventListener('click', () => {
    started = true;
    window.LLSound.play('click');
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('ll:lang', () => {
    if (!over) updateMsg(turn === 'M' ? 'xo.turnMeat' : 'xo.turnAlmond');
    else if (grid.every(v => v) && !lineWinner(grid)) updateMsg('xo.draw');
  });

  buildBoard();
  diffSel.disabled = true; // default mode is 2 players
})();
