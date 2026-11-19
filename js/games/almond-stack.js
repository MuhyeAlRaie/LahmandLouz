/* ============================================================
   Lahm & Loz — Game 8: Almond Stack
   Physics stacking arcade powered by Phaser 3 + Matter.
   Tap / click / space to drop each moving almond onto the
   tower. Speed increases with the score; misses end the run.
   ============================================================ */

(function () {
  'use strict';

  const GAME_ID = 'almond-stack';
  const GAME_W = 880, GAME_H = 520;
  const ALMOND_W = 118, ALMOND_H = 72;
  const DROP_Y = 84;
  const KILL_MARGIN = 240;

  const stage = document.getElementById('ll-stage');
  const results = document.getElementById('ll-results');
  const wrap = document.getElementById('as-wrap');
  const mount = document.getElementById('as-mount');
  const elScore = document.getElementById('as-score');
  const elBest = document.getElementById('as-best');

  let game = null;

  /* pre-render a lying almond texture */
  async function almondTexture() {
    const img = await window.LLArt.image('almond');
    const cv = document.createElement('canvas');
    cv.width = 124; cv.height = 84;
    const c = cv.getContext('2d');
    c.translate(62, 42);
    c.rotate(Math.PI / 2);
    c.drawImage(img, -50, -50, 100, 100);
    return cv;
  }

  function floatAt(x, y, text) {
    const el = document.createElement('div');
    el.className = 'll-stack-score-float';
    el.textContent = text;
    const r = mount.getBoundingClientRect();
    const scaleX = r.width / GAME_W;
    const scaleY = r.height / GAME_H;
    el.style.left = Math.max(6, x * scaleX - 34) + 'px';
    el.style.top = Math.max(6, y * scaleY - 14) + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function gameOver(scene) {
    scene.gameOver = true;
    scene.canDrop = false;
    window.LLSound.play('gameover');
    const finalScore = scene.score;
    const best = window.LLStore.getBest(GAME_ID);
    setTimeout(() => {
      window.LLUI.showResults({
        stageEl: stage,
        hostEl: results,
        title: window.LLT('common.gameOver'),
        subtitle: window.LLT('stack.title'),
        score: String(finalScore),
        gameId: GAME_ID,
        scoreNum: finalScore,
        medal: 'almond',
        stats: [
          { label: window.LLT('common.best'), value: String(Math.max(best, finalScore)) },
          { label: window.LLT('stack.drop'), value: String(finalScore) }
        ],
        onPlayAgain: () => startGame()
      });
    }, 700);
  }

  function makeScene() {
    return {
      create: function () {
        const s = this;
        s.score = 0;
        s.stack = [];
        s.runnerSpeed = 3.2;
        s.canDrop = false;
        s.gameOver = false;
        s.runner = null;
        s.perfectFlash = 0;

        /* ---- helpers (attached to the scene instance) ---- */

        s.spawnRunner = function () {
          if (s.gameOver) return;
          if (s.runner) s.runner.destroy();
          s.runnerDir = 1;
          s.runnerX = GAME_W / 2;
          s.runner = s.add.image(GAME_W / 2, DROP_Y, 'almondBlock').setDepth(10);
          s.canDrop = true;
        };

        s.topStackX = function () {
          let top = null, x = null;
          s.stack.forEach(o => {
            if (o.counted && (top === null || o.body.y < top)) { top = o.body.y; x = o.body.x; }
          });
          return { top, x };
        };

        s.drop = function () {
          if (!s.canDrop || s.gameOver || !s.runner || !s.textures.exists('almondBlock')) return;
          s.canDrop = false;
          const x = s.runner.x;
          s.runner.destroy();
          s.runner = null;
          window.LLSound.play('drop');

          const prev = s.topStackX();
          const body = s.matter.add.sprite(x, DROP_Y, 'almondBlock');
          body.setRectangle(ALMOND_W, ALMOND_H, {
            restitution: 0, friction: 0.9, frictionStatic: 1, chamfer: { radius: 20 }, label: 'almond'
          });
          body.setDepth(5);
          body.setAngle(0);
          s.stack.push({
            body,
            checked: 0,
            counted: false,
            hasPrev: prev.top != null,
            prevX: prev.x
          });
        };

        /* ---- background ---- */
        s.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xf7efe0).setDepth(-10);
        for (let x = 30; x < GAME_W; x += 56) {
          s.add.circle(x, GAME_H - 24, 3, 0xe0d2b8).setDepth(-9);
        }

        /* ---- base platform (wooden board) ---- */
        s.boardY = GAME_H - 70;
        s.add.rectangle(GAME_W / 2, s.boardY + 14, 280, 26, 0xa97b44).setStrokeStyle(4, 0x7a5426).setDepth(-5);
        s.matter.add.rectangle(GAME_W / 2, s.boardY + 14, 280, 26, {
          isStatic: true, friction: 1, restitution: 0, label: 'board'
        });

        /* ---- drop line ---- */
        s.add.rectangle(GAME_W / 2, DROP_Y, GAME_W - 40, 2, 0xd3a064, 0.55).setDepth(-8);

        /* ---- input ---- */
        s.input.keyboard.on('keydown-SPACE', () => s.drop());
        s.input.keyboard.on('keydown-ENTER', () => s.drop());
        s.input.on('pointerdown', () => s.drop());

        /* public handle for integration/debugging */
        window.LLStack = { scene: s };

        /* ---- texture ---- */
        if (!s.textures.exists('almondBlock')) {
          almondTexture().then(cv => {
            s.textures.addCanvas('almondBlock', cv);
            s.spawnRunner();
          }).catch(err => { console.warn('almond texture failed', err); });
        } else {
          s.spawnRunner();
        }
      },

      update: function () {
        const s = this;
        if (s.gameOver) return;

        /* runner movement */
        if (s.runner) {
          s.runnerSpeed = 3.2 + s.score * 0.14;
          s.runnerX += s.runnerDir * s.runnerSpeed;
          if (s.runnerX > GAME_W - 90) { s.runnerX = GAME_W - 90; s.runnerDir = -1; }
          if (s.runnerX < 90) { s.runnerX = 90; s.runnerDir = 1; }
          s.runner.x = s.runnerX;
        }

        /* settle + miss detection */
        for (let i = s.stack.length - 1; i >= 0; i--) {
          const o = s.stack[i];
          const b = o.body;
          if (!b.body) continue;

          if (b.y > s.boardY + KILL_MARGIN || b.x < -80 || b.x > GAME_W + 80) {
            s.stack.splice(i, 1);
            gameOver(s);
            return;
          }

          if (!o.counted) {
            const speed = Math.hypot(b.body.velocity.x, b.body.velocity.y);
            if (speed < 0.45 && Math.abs(b.body.angularVelocity) < 0.05) o.checked++;
            else o.checked = 0;

            if (o.checked > 42) {
              o.counted = true;
              const dx = Math.abs(b.x - (o.hasPrev ? o.prevX : b.x));
              const perfect = o.hasPrev && dx < 16;
              const pts = perfect ? 3 : 1;
              s.score += pts;
              elScore.textContent = s.score;
              window.LLSound.play(perfect ? 'perfect' : 'pop');
              floatAt(b.x, b.y - 44, perfect ? '+' + pts : '+1');
              if (perfect) s.perfectFlash = 10;

              s.time.delayedCall(650, () => { if (!s.gameOver) s.spawnRunner(); });

              const top = s.topStackX().top;
              if (top != null && top < 190) {
                s.cameras.main.pan(GAME_W / 2, Math.max(260, top), 650, 'Sine.easeInOut', true);
              }
            }
          }
        }

        if (s.perfectFlash > 0) {
          s.perfectFlash--;
          s.cameras.main.shake(50, 0.0018);
        }
      }
    };
  }

  function startGame() {
    results.hidden = true;
    results.innerHTML = '';
    stage.classList.remove('ll-hidden');
    elScore.textContent = '0';
    elBest.textContent = window.LLStore.getBest(GAME_ID);
    if (game) { game.destroy(true); game = null; }
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mount,
      width: GAME_W,
      height: GAME_H,
      backgroundColor: '#F7EFE0',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
      physics: {
        default: 'matter',
        matter: { gravity: { y: 1.1 }, enableSleeping: true, positionIterations: 8, velocityIterations: 6 }
      },
      scene: makeScene()
    });
  }

  document.getElementById('as-restart').addEventListener('click', () => { window.LLSound.play('click'); startGame(); });
  document.getElementById('ll-start-btn').addEventListener('click', () => {
    window.LLSound.play('click');
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    startGame();
  });

  elBest.textContent = window.LLStore.getBest(GAME_ID);
})();
