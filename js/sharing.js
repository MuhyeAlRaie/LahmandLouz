/* ============================================================
   Lahm & Loz — Share system
   Generates a branded PNG result card (Canvas + real logo +
   QR), with Web Share API when available and download /
   copy-link fallbacks. Arabic text renders through the Cairo
   font inside the canvas.
   ============================================================ */

(function () {
  'use strict';

  const CARD_W = 1080, CARD_H = 1350;

  function relPath(p) {
    return (location.pathname.indexOf('/games/') !== -1 ? '../' : '') + p;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function ensureFonts() {
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.all([
          document.fonts.load('900 100px Cairo'),
          document.fonts.load('800 60px Cairo'),
          document.fonts.load('700 40px Cairo')
        ]);
        await document.fonts.ready;
      }
    } catch (e) { /* fallback fonts still render */ }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function qrDataUrl(text, cell, margin) {
    if (!window.qrcode) return null;
    try {
      const qr = window.qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      return qr.createDataURL(cell || 6, margin == null ? 2 : margin);
    } catch (e) { return null; }
  }

  /* ----------------------------------------------------------
     Draw the branded result card
  ----------------------------------------------------------- */
  async function drawCard(opts) {
    await ensureFonts();
    const lang = window.LLLang.current;
    const cv = document.createElement('canvas');
    cv.width = CARD_W; cv.height = CARD_H;
    const ctx = cv.getContext('2d');
    const C = window.LLArt.colors;

    /* background */
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    /* frame like the logo's rounded frame */
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 14;
    roundRect(ctx, 42, 42, CARD_W - 84, CARD_H - 84, 76);
    ctx.stroke();
    ctx.strokeStyle = C.almond;
    ctx.lineWidth = 3;
    ctx.setLineDash([2, 16]);
    ctx.lineCap = 'round';
    roundRect(ctx, 84, 84, CARD_W - 168, CARD_H - 168, 56);
    ctx.stroke();
    ctx.setLineDash([]);

    const centerX = CARD_W / 2;

    /* logo (real restaurant logo, never modified) */
    try {
      const logo = await loadImage(relPath('assets/logo/lahm-loz-logo.jpg'));
      const LW = 240, LH = 240, LX = centerX - LW / 2, LY = 130;
      ctx.save();
      roundRect(ctx, LX, LY, LW, LH, 44);
      ctx.clip();
      ctx.fillStyle = '#F7F4EE';
      ctx.fillRect(LX, LY, LW, LH);
      const ratio = Math.min(LW / logo.width, LH / logo.height);
      const dw = logo.width * ratio, dh = logo.height * ratio;
      ctx.drawImage(logo, LX + (LW - dw) / 2, LY + (LH - dh) / 2, dw, dh);
      ctx.restore();
      ctx.strokeStyle = C.almond;
      ctx.lineWidth = 5;
      roundRect(ctx, LX, LY, LW, LH, 44);
      ctx.stroke();
    } catch (e) { /* logo optional in card */ }

    ctx.textAlign = 'center';
    ctx.direction = lang === 'ar' ? 'rtl' : 'ltr';

    /* game name */
    ctx.fillStyle = '#B98448';
    ctx.font = '800 56px Cairo';
    ctx.fillText(opts.gameName || '', centerX, 470);

    /* player name */
    let y = 470;
    if (opts.playerName) {
      ctx.fillStyle = '#6B5442';
      ctx.font = '700 44px Cairo';
      ctx.fillText((lang === 'ar' ? 'نتيجة اللاعب: ' : 'Player: ') + opts.playerName, centerX, 536);
      y = 536;
    }

    /* score */
    if (opts.scoreText) {
      ctx.fillStyle = '#164B2A';
      ctx.font = '900 150px Cairo';
      ctx.fillText(String(opts.scoreText), centerX, y + 190);
    }

    /* challenge + visit messages */
    ctx.fillStyle = '#39291F';
    ctx.font = '900 68px Cairo';
    ctx.fillText(window.LLT('share.cardMsg'), centerX, y + 320);

    ctx.fillStyle = '#164B2A';
    ctx.font = '800 46px Cairo';
    ctx.fillText(window.LLT('share.cardVisit'), centerX, y + 396);

    /* brand line */
    ctx.fillStyle = '#6B5442';
    ctx.font = '800 40px Cairo';
    ctx.fillText('لحم ولوز  •  Lahm & Loz', centerX, y + 466);

    /* QR */
    const siteUrl = opts.shareUrl || window.LL_CONFIG.siteUrl || location.origin + location.pathname.replace(/games\/[^/]*$/, '');
    const qr = qrDataUrl(siteUrl, 6, 2);
    if (qr) {
      try {
        const qimg = await loadImage(qr);
        const QW = 300, QX = centerX - QW / 2, QY = y + 520;
        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, QX - 14, QY - 14, QW + 28, QW + 28, 24);
        ctx.fill();
        ctx.drawImage(qimg, QX, QY, QW, QW);
        ctx.fillStyle = '#39291F';
        ctx.font = '800 34px Cairo';
        ctx.fillText(window.LLT('share.scanText'), centerX, QY + QW + 56);
        ctx.fillStyle = '#8B7B62';
        ctx.font = '700 26px Cairo';
        ctx.fillText(String(siteUrl).replace(/^https?:\/\//, ''), centerX, CARD_H - 90);
      } catch (e) { /* qr optional */ }
    }

    return cv;
  }

  /* ----------------------------------------------------------
     Mount share UI into a container on result screens
  ----------------------------------------------------------- */
  function mount(container, opts) {
    if (!container) return;

    /* preview + actions */
    const flex = document.createElement('div');
    flex.className = 'll-share-flex';
    const previewBox = document.createElement('div');
    const actions = document.createElement('div');
    actions.className = 'll-share-actions';
    flex.appendChild(previewBox);
    flex.appendChild(actions);
    container.appendChild(flex);

    const lang = window.LLLang.current;
    const game = window.LL_GAME_BY_ID(opts.gameId);

    function challengeUrl() {
      const base = window.LL_GAME_FILE_ABS(opts.gameId);
      const code = window.LLNav.encodeChallenge(opts.gameId, opts.scoreNum || 0, window.LLStore.getPlayerName());
      return new URL(base + (base.indexOf('?') === -1 ? '?c=' : '&c=') + code, location.href).href;
    }

    async function fullCard() {
      return drawCard({
        gameName: opts.gameName || (lang === 'ar' ? (game && game.titleAr) : (game && game.titleEn)),
        playerName: opts.nameInput ? opts.nameInput.value.trim() : window.LLStore.getPlayerName(),
        scoreText: opts.scoreText || (opts.scoreNum != null ? String(opts.scoreNum) : ''),
        shareUrl: challengeUrl()
      });
    }

    let cardCanvas = null;
    fullCard().then(cv => {
      cardCanvas = cv;
      cv.className = 'll-share-card-preview';
      cv.alt = 'result card';
      previewBox.appendChild(cv);
    }).catch(() => {});

    function withCard(fn) {
      if (cardCanvas) { fn(cardCanvas); return; }
      fullCard().then(fn);
    }

    function fileName() {
      return 'lahm-loz-' + (opts.gameId || 'result') + '.png';
    }

    async function shareNow() {
      withCard(async cv => {
        try {
          const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
          const file = new File([blob], fileName(), { type: 'image/png' });
          const text = window.LLT('share.shareText', {
            score: opts.scoreNum != null ? opts.scoreNum : (opts.scoreText || ''),
            game: opts.gameName || ''
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], text: text, title: 'Lahm & Loz' });
            return;
          }
          if (navigator.share) {
            await navigator.share({ text: text, title: 'Lahm & Loz', url: challengeUrl() });
            return;
          }
          window.LLUI.toast(window.LLT('common.copyFail'), 'error');
        } catch (e) { /* user cancelled or unsupported */ }
      });
    }

    async function download() {
      withCard(cv => {
        cv.toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = fileName();
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          window.LLUI.toast('PNG', 'success');
        }, 'image/png');
      });
    }

    async function copyLink() {
      const url = challengeUrl();
      try {
        await navigator.clipboard.writeText(url);
        window.LLUI.toast(window.LLT('common.copied'), 'success');
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); window.LLUI.toast(window.LLT('common.copied'), 'success'); }
        catch (err) { window.LLUI.toast(window.LLT('common.copyFail'), 'error'); }
        ta.remove();
      }
    }

    const canShareFiles = !!(navigator.canShare && navigator.share);

    const row1 = document.createElement('div');
    row1.className = 'row';
    if (canShareFiles) {
      const sb = document.createElement('button');
      sb.className = 'btn-ll';
      sb.textContent = window.LLT('common.shareApi');
      sb.addEventListener('click', shareNow);
      row1.appendChild(sb);
    }
    const db = document.createElement('button');
    db.className = 'btn-ll btn-ll-almond';
    db.textContent = window.LLT('common.downloadCard');
    db.addEventListener('click', download);
    row1.appendChild(db);
    actions.appendChild(row1);

    const row2 = document.createElement('div');
    row2.className = 'row';
    const cb = document.createElement('button');
    cb.className = 'btn-ll btn-ll-ghost';
    cb.textContent = window.LLT('common.copyLink');
    cb.addEventListener('click', copyLink);
    row2.appendChild(cb);

    const msg = document.createElement('p');
    msg.style.cssText = 'margin:0;font-weight:700;font-size:.86rem;color:#6B5442';
    msg.textContent = window.LLT('common.challengeFriend');
    row2.appendChild(msg);
    actions.appendChild(row2);
  }

  window.LLShare = { mount, drawCard };
})();
