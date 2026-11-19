/* ============================================================
   Lahm & Loz — MediaPipe Hand Tracking wrapper
   Loads @mediapipe/tasks-vision (vendored, CDN fallback) and
   the HandLandmarker model once, then feeds hand data to the
   camera games. Streams are ALWAYS stopped when leaving the
   page (pagehide) or via stop().
   ============================================================ */

(function () {
  'use strict';

  const SRC = {
    module: [
      '../../assets/vendor/mediapipe/vision_bundle.mjs',
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
    ],
    wasm: [
      '../../assets/vendor/mediapipe',
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    ],
    model: [
      '../../assets/vendor/mediapipe/hand_landmarker.task',
      'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
    ]
  };

  /* note: mediapipe.js lives in js/, pages in games/ — vendor is at assets/vendor.
     From js/ the relative path inside a dynamic import is resolved against the
     PAGE url, not the script url. So compute paths from location instead. */

  function vendorPaths() {
    const inGames = location.pathname.indexOf('/games/') !== -1;
    const base = inGames ? '../assets/vendor/mediapipe/' : 'assets/vendor/mediapipe/';
    return {
      module: base + 'vision_bundle.mjs',
      wasm: base,
      model: base + 'hand_landmarker.task'
    };
  }

  let landmarker = null;
  let loadPromise = null;
  let stream = null;
  let rafId = 0;
  let running = false;
  let lastVideoTs = -1;

  async function headOK(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch (e) { return false; }
  }

  async function firstAvailable(local, remote) {
    if (await headOK(local)) return local;
    return remote;
  }

  async function ensure() {
    if (landmarker) return landmarker;
    if (!loadPromise) {
      loadPromise = (async () => {
        const paths = vendorPaths();
        const moduleUrl = await firstAvailable(paths.module, SRC.module[1]);
        const wasmDir = await firstAvailable(paths.wasm + '/', SRC.wasm[1] + '/');
        const modelUrl = await firstAvailable(paths.model, SRC.model[1]);

        let vision;
        try {
          vision = await import(moduleUrl);
        } catch (e1) {
          vision = await import(SRC.module[1]);
        }
        const fileset = await vision.FilesetResolver.forVisionTasks(wasmDir);
        landmarker = await vision.HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: modelUrl, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        return landmarker;
      })();
      loadPromise.catch(() => { loadPromise = null; });
    }
    return loadPromise;
  }

  /* fingers extended count (robust to orientation using distances) */
  function openPalmCount(lm) {
    const wrist = lm[0];
    const d = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.75, a.z - b.z);
    const pairs = [[8, 6], [12, 10], [16, 14], [20, 18]];
    let n = 0;
    pairs.forEach(([tip, pip]) => {
      if (d(wrist, lm[tip]) > d(wrist, lm[pip]) * 1.18) n++;
    });
    return n;
  }

  function parseResult(res) {
    const lm = (res.landmarks && res.landmarks[0]) || null;
    if (!lm) return { hand: false };
    const idx = [0, 5, 9, 13, 17];
    let px = 0, py = 0;
    idx.forEach(i => { px += lm[i].x; py += lm[i].y; });
    px /= idx.length; py /= idx.length;
    return {
      hand: true,
      palm: { x: 1 - px, y: py },  /* mirrored for selfie view */
      raw: lm,
      open: openPalmCount(lm) >= 4,
      openness: openPalmCount(lm)
    };
  }

  async function start(video, callback, opts) {
    opts = opts || {};
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('media-devices-unsupported');
    }
    const lm = await ensure();

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = stream;
    video.playsInline = true;
    video.muted = true;
    try { await video.play(); } catch (e) { /* autoplay quirks */ }

    running = true;
    lastVideoTs = -1;

    const loop = () => {
      if (!running) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        const ts = performance.now();
        if (ts !== lastVideoTs) {
          lastVideoTs = ts;
          let out = { hand: false };
          try { out = parseResult(lm.detectForVideo(video, ts)); } catch (e) { /* frame skip */ }
          callback(out);
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return true;
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    const v = document.querySelectorAll('video');
    v.forEach(el => { if (el.srcObject) el.srcObject = null; });
    document.dispatchEvent(new CustomEvent('ll:camera', { detail: { on: false } }));
  }

  function isRunning() { return running; }

  /* make sure the camera never stays on when leaving the game */
  window.addEventListener('pagehide', stop);
  window.addEventListener('beforeunload', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  window.LLHands = {
    ensure, start, stop, isRunning,
    isSecure: () => !!(window.isSecureContext),
    isSupported: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };
})();
