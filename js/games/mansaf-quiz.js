/* ============================================================
   Lahm & Loz — Game 7: Mansaf Quiz
   10 random questions from LL_QUIZ_DATA (26 bilingual items),
   5 seconds per question, animated countdown ring, instant
   feedback, score + final title + answer review.
   ============================================================ */

(function () {
  'use strict';

  const GAME_ID = 'mansaf-quiz';
  const ROUNDS = 10;
  const Q_SECONDS = 5;

  const stage = document.getElementById('ll-stage');
  const results = document.getElementById('ll-results');
  const elQ = document.getElementById('qz-qtext');
  const elOpts = document.getElementById('qz-options');
  const elFb = document.getElementById('qz-feedback');
  const elScore = document.getElementById('qz-score');
  const elBest = document.getElementById('qz-best');
  const elSeconds = document.getElementById('qz-seconds');
  const elRing = document.getElementById('qz-ring');
  const elTimerBox = document.getElementById('qz-timer');
  const elDots = document.getElementById('qz-dots');
  const elProgressLabel = document.getElementById('qz-progress-label');

  const RING_LEN = 2 * Math.PI * 27;
  elRing.style.strokeDasharray = String(RING_LEN);

  const S = {
    questions: [],
    idx: 0,
    correct: 0,
    score: 0,
    results: [],   /* {q, pickedOk, correctText} */
    timer: 0,
    timeLeft: Q_SECONDS,
    answering: false,
    playing: false
  };

  function langText(obj) {
    return window.LLLang.current === 'en' ? obj.en : obj.ar;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function rankOf(correct) {
    if (correct >= 9) return 'quiz.rank3';
    if (correct >= 7) return 'quiz.rank2';
    if (correct >= 4) return 'quiz.rank1';
    return 'quiz.rank0';
  }

  function paintDots() {
    elDots.innerHTML = '';
    for (let i = 0; i < ROUNDS; i++) {
      const d = document.createElement('span');
      d.className = 'qdot';
      const r = S.results[i];
      if (r) d.classList.add(r.pickedOk ? 'done-ok' : 'done-bad');
      else if (i === S.idx) d.classList.add('now');
      elDots.appendChild(d);
    }
  }

  function paintRing() {
    const frac = S.timeLeft / Q_SECONDS;
    elRing.style.strokeDashoffset = String(RING_LEN * (1 - frac));
    elSeconds.textContent = S.timeLeft;
    elTimerBox.classList.toggle('low', S.timeLeft <= 2);
  }

  function stopTimer() { clearInterval(S.timer); }

  function showQuestion() {
    if (S.idx >= ROUNDS) { finish(); return; }
    S.answering = true;
    const q = S.questions[S.idx];
    elQ.textContent = langText(q.q);
    elProgressLabel.textContent = window.LLT('quiz.qOf', { a: S.idx + 1, b: ROUNDS });
    elFb.textContent = '';
    elFb.className = 'll-quiz-feedback';
    paintDots();

    /* shuffled options with tracked correct index */
    const order = shuffle(q.options.map((o, i) => ({ o, i })));
    elOpts.innerHTML = '';
    order.forEach((entry, pos) => {
      const btn = document.createElement('button');
      btn.className = 'll-quiz-opt';
      const key = document.createElement('span');
      key.className = 'opt-key';
      key.textContent = ['A', 'B', 'C', 'D'][pos];
      const txt = document.createElement('span');
      txt.textContent = langText(entry.o);
      btn.appendChild(key);
      btn.appendChild(txt);
      btn.addEventListener('click', () => answer(entry.i, btn));
      btn.dataset.correct = String(entry.i === q.correct);
      elOpts.appendChild(btn);
    });

    S.timeLeft = Q_SECONDS;
    paintRing();
    stopTimer();
    S.timer = setInterval(() => {
      S.timeLeft--;
      paintRing();
      if (S.timeLeft <= 2 && S.timeLeft > 0) window.LLSound.play('tick');
      if (S.timeLeft <= 0) { stopTimer(); answer(-1, null); }
    }, 1000);
  }

  function answer(pickedIdx, btn) {
    if (!S.answering) return;
    S.answering = false;
    stopTimer();
    const q = S.questions[S.idx];
    const ok = pickedIdx === q.correct;
    elOpts.querySelectorAll('.ll-quiz-opt').forEach(b => {
      b.disabled = true;
      if (b.dataset.correct === 'true') b.classList.add('correct');
    });
    if (btn) btn.classList.add('wrong');

    if (ok) {
      S.correct++;
      S.score += 10;
      elScore.textContent = S.score;
      elFb.textContent = window.LLT('quiz.correct');
      elFb.classList.add('ok');
      window.LLSound.play('success');
    } else {
      elFb.textContent = pickedIdx === -1 ? window.LLT('quiz.timeUp') : window.LLT('quiz.wrong');
      elFb.classList.add('bad');
      window.LLSound.play('fail');
    }

    S.results.push({
      q: langText(q.q),
      pickedOk: ok,
      correctText: langText(q.options[q.correct])
    });
    paintDots();

    setTimeout(() => {
      S.idx++;
      showQuestion();
    }, ok ? 900 : 1400);
  }

  function reviewHTML() {
    const items = S.results.map(r =>
      '<li class="' + (r.pickedOk ? 'ok' : 'bad') + '">' +
      (r.pickedOk ? '✓ ' : '✕ ') + r.q +
      (r.pickedOk ? '' : ' — ' + r.correctText) +
      '</li>'
    ).join('');
    return '<h4 style="color:var(--ll-green);margin:.4rem 0 .6rem">' + window.LLT('quiz.review') + '</h4>' +
      '<ul class="ll-quiz-review">' + items + '</ul>';
  }

  function finish() {
    S.playing = false;
    window.LLUI.confetti(S.correct >= 7 ? 110 : 50);
    window.LLSound.play('win');
    const best = window.LLStore.getBest(GAME_ID);
    window.LLUI.showResults({
      stageEl: stage,
      hostEl: results,
      title: window.LLT(rankOf(S.correct)),
      subtitle: window.LLT('quiz.ofTitle', { a: S.correct }),
      score: String(S.score),
      gameId: GAME_ID,
      scoreNum: S.score,
      meta: { correct: S.correct },
      medal: S.correct >= 9 ? 'golden-almond' : 'mansaf',
      extraHTML: reviewHTML(),
      stats: [
        { label: window.LLT('quiz.review').replace('مراجعة الإجابات', 'إجابات صحيحة').replace('Review answers', 'Correct'), value: S.correct + '/10' },
        { label: window.LLT('common.best'), value: String(Math.max(best, S.score)) }
      ],
      onPlayAgain: () => begin()
    });
  }

  function begin() {
    if (!window.LL_QUIZ_DATA || window.LL_QUIZ_DATA.length < ROUNDS) {
      window.LLUI.toast('Quiz data missing', 'error');
      return;
    }
    results.hidden = true;
    results.innerHTML = '';
    stage.classList.remove('ll-hidden');
    S.questions = shuffle(window.LL_QUIZ_DATA).slice(0, ROUNDS);
    S.idx = 0;
    S.correct = 0;
    S.score = 0;
    S.results = [];
    elScore.textContent = '0';
    elBest.textContent = window.LLStore.getBest(GAME_ID);
    paintDots();
    window.LLSound.play('click');
    S.playing = true;
    showQuestion();
  }

  document.getElementById('ll-start-btn').addEventListener('click', () => {
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    begin();
  });
  document.addEventListener('ll:lang', () => {
    /* language switches reload the page; mid-question re-translation is
       not needed, but keep the idle text in sync */
    if (!S.playing) {
      elQ.textContent = window.LLLang.current === 'en' ? 'Press start to play!' : 'اضغط ابدأ اللعب للبدء!';
    }
  });

  elBest.textContent = window.LLStore.getBest(GAME_ID);
  elQ.textContent = window.LLLang.current === 'en' ? 'Press start to play!' : 'اضغط ابدأ اللعب للبدء!';
})();
