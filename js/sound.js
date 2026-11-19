/* ============================================================
   Lahm & Loz — Sound engine (Web Audio API)
   Synthesized sound effects: no audio files needed, tiny and
   reliable. Muted state persisted in localStorage.
   ============================================================ */

(function () {
  'use strict';

  let ctx = null;
  let muted = false;

  try {
    muted = !!(window.LLStore && window.LLStore.getSettings().muted);
  } catch (e) { /* ignore */ }

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') { ctx.resume().catch(() => {}); }
    return ctx;
  }

  function tone(freq, dur, type, when, vol) {
    const c = ensureCtx();
    if (!c || muted) return;
    const t0 = c.currentTime + (when || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, when, vol) {
    const c = ensureCtx();
    if (!c || muted) return;
    const t0 = c.currentTime + (when || 0);
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t0);
  }

  const recipes = {
    click:    () => tone(620, .08, 'square', 0, .1),
    pop:      () => { tone(520, .09, 'sine'); tone(780, .1, 'sine', .05, .14); },
    flip:     () => tone(340, .07, 'triangle', 0, .12),
    success:  () => { tone(523, .12, 'sine'); tone(659, .12, 'sine', .09); tone(784, .18, 'sine', .18); },
    perfect:  () => { tone(523, .1, 'sine'); tone(659, .1, 'sine', .07); tone(784, .1, 'sine', .14); tone(1047, .22, 'sine', .21); },
    fail:     () => { tone(300, .16, 'sawtooth', 0, .12); tone(220, .22, 'sawtooth', .12, .12); },
    tick:     () => tone(880, .05, 'square', 0, .07),
    countdown:() => tone(440, .12, 'square', 0, .12),
    go:       () => { tone(660, .1, 'square'); tone(880, .25, 'square', .1, .16); },
    coin:     () => { tone(988, .07, 'square', 0, .12); tone(1319, .14, 'square', .07, .12); },
    drop:     () => noise(.14, 0, .2),
    thud:     () => { noise(.1, 0, .18); tone(140, .12, 'sine', 0, .2); },
    win:      () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, 'sine', i * .11, .16)); },
    gameover: () => { [440, 349, 294, 220].forEach((f, i) => tone(f, .18, 'triangle', i * .13, .14)); }
  };

  window.LLSound = {
    play(name) {
      try {
        if (recipes[name]) recipes[name]();
      } catch (e) { /* audio best-effort */ }
    },
    isMuted() { return muted; },
    setMuted(v) {
      muted = !!v;
      try { window.LLStore.saveSettings({ muted }); } catch (e) { /* ignore */ }
    },
    toggle() {
      this.setMuted(!muted);
      return muted;
    },
    /* unlock audio on first user gesture (mobile browsers) */
    unlock() { ensureCtx(); }
  };
})();
