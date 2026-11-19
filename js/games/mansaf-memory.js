/* ============================================================
   Lahm & Loz — Game 5: Mansaf Memory
   Card-matching with flip animations, three difficulties
   (8 / 12 / 16 cards), moves + timer + score + best record.
   ============================================================ */

(function () {
  'use strict';

  const GAME_ID = 'mansaf-memory';

  const stage = document.getElementById('ll-stage');
  const results = document.getElementById('ll-results');
  const grid = document.getElementById('mm-grid');
  const elMoves = document.getElementById('mm-moves');
  const elTime = document.getElementById('mm-time');
  const elPairs = document.getElementById('mm-pairs');
  const elBest = document.getElementById('mm-best');

  const SYMBOLS = ['meat', 'almond', 'rice', 'jameed', 'mansaf', 'logo', 'spoon', 'shrak'];
  const DIFF = {
    easy:   { pairs: 4, parM: 10, base: 800,  moveW: 25, timeW: 10 },
    medium: { pairs: 6, parM: 16, base: 1200, moveW: 20, timeW: 7 },
    hard:   { pairs: 8, parM: 26, base: 1600, moveW: 15, timeW: 5 }
  };

  const S = { diff: 'easy', deck: [], first: null, lock: false, moves: 0, matched: 0, seconds: 0, timer: 0, over: false };

  function logoImgHTML() {
    return '<img src="../assets/logo/lahm-loz-logo.jpg" alt="Lahm & Loz" style="width:82%;height:82%;object-fit:contain;border-radius:10px">';
  }

  function faceHTML(sym) {
    if (sym === 'logo') return logoImgHTML();
    return window.LLArt.svg(sym);
  }

  function buildDeck() {
    const chosen = SYMBOLS.slice(0, DIFF[S.diff].pairs);
    const deck = chosen.concat(chosen); /* pairs */
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function buildGrid() {
    S.deck = buildDeck();
    grid.innerHTML = '';
    grid.setAttribute('data-cols', '4');
    S.deck.forEach((sym, i) => {
      const card = document.createElement('button');
      card.className = 'll-memory-card';
      card.setAttribute('aria-label', 'card ' + (i + 1));
      card.dataset.sym = sym;
      card.innerHTML =
        '<div class="ll-memory-inner">' +
          '<div class="ll-memory-face front" data-art="almond"></div>' +
          '<div class="ll-memory-face back">' + faceHTML(sym) + '</div>' +
        '</div>';
      card.addEventListener('click', () => flip(card));
      grid.appendChild(card);
    });
    window.LLArt.inject(grid);
  }

  function startTimer() {
    clearInterval(S.timer);
    S.timer = setInterval(() => {
      if (S.over) return;
      S.seconds++;
      elTime.textContent = S.seconds;
    }, 1000);
  }

  function flip(card) {
    if (S.over || S.lock) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (S.moves === 0 && S.matched === 0 && S.seconds === 0) startTimer();
    card.classList.add('flipped');
    window.LLSound.play('flip');

    if (!S.first) { S.first = card; return; }

    /* second card */
    S.moves++;
    elMoves.textContent = S.moves;
    const a = S.first, b = card;
    S.first = null;
    if (a.dataset.sym === b.dataset.sym) {
      S.matched++;
      elPairs.textContent = S.matched;
      setTimeout(() => {
        a.classList.add('matched');
        b.classList.add('matched');
        window.LLSound.play('success');
        if (S.matched === DIFF[S.diff].pairs) finish();
      }, 260);
    } else {
      S.lock = true;
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        S.lock = false;
      }, 780);
    }
  }

  function score() {
    const d = DIFF[S.diff];
    return Math.max(50, Math.round(d.base - S.moves * d.moveW - S.seconds * d.timeW));
  }

  function finish() {
    S.over = true;
    clearInterval(S.timer);
    window.LLSound.play('win');
    window.LLUI.confetti(100);
    const best = window.LLStore.getBest(GAME_ID);
    const sc = score();
    window.LLUI.showResults({
      stageEl: stage,
      hostEl: results,
      title: window.LLT('build.done'),
      subtitle: window.LLT('memory.title'),
      score: String(sc),
      gameId: GAME_ID,
      scoreNum: sc,
      meta: { diff: S.diff, moves: S.moves, seconds: S.seconds },
      medal: 'mansaf',
      stats: [
        { label: window.LLT('common.time'), value: S.seconds + ' ' + window.LLT('common.sec') },
        { label: window.LLT('common.moves'), value: String(S.moves) },
        { label: window.LLT('common.best'), value: String(Math.max(best, sc)) }
      ],
      onPlayAgain: () => begin(S.diff)
    });
  }

  function begin(diff) {
    S.diff = diff;
    S.first = null;
    S.lock = false;
    S.moves = 0;
    S.matched = 0;
    S.seconds = 0;
    S.over = false;
    clearInterval(S.timer);
    elMoves.textContent = '0';
    elTime.textContent = '0';
    elPairs.textContent = '0';
    elBest.textContent = window.LLStore.getBest(GAME_ID);
    results.hidden = true;
    results.innerHTML = '';
    stage.classList.remove('ll-hidden');
    buildGrid();
    window.LLSound.play('click');
  }

  /* difficulty buttons in instructions + restart */
  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      begin(btn.getAttribute('data-diff'));
      stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  document.getElementById('mm-restart').addEventListener('click', () => begin(S.diff));

  elBest.textContent = window.LLStore.getBest(GAME_ID);
  begin('easy');
})();
