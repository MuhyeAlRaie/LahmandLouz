/* ============================================================
   Lahm & Loz — Local leaderboard
   Shows best scores saved ON THIS DEVICE (localStorage).
   Clearly separated from a global leaderboard: see the note
   and the Supabase stub at the bottom of this file.
   ============================================================ */

(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function render(hostEl) {
    if (!hostEl) return;
    const lang = window.LLLang.current;
    const rows = [];

    window.LL_GAMES.forEach(g => {
      const st = window.LLStore.getGameStats(g.id);
      if (st && st.plays > 0) {
        rows.push({
          id: g.id,
          file: g.file,
          title: lang === 'ar' ? g.titleAr : g.titleEn,
          best: st.best,
          plays: st.plays
        });
      }
    });

    const inGames = location.pathname.indexOf('/games/') !== -1;
    const prefix = inGames ? '../' : '';

    if (!rows.length) {
      hostEl.innerHTML = '<div class="ll-lb-empty">' + esc(window.LLT('home.lbEmpty')) + '</div>';
    } else {
      rows.sort((a, b) => b.best - a.best);
      let html = '<table class="ll-lb-table"><thead><tr>' +
        '<th class="rank">#</th>' +
        '<th>' + esc(window.LLT('home.lbGame')) + '</th>' +
        '<th>' + esc(window.LLT('home.lbBest')) + '</th>' +
        '<th>' + esc(window.LLT('home.lbPlays')) + '</th>' +
        '</tr></thead><tbody>';
      rows.forEach((r, i) => {
        html += '<tr>' +
          '<td class="rank">' + (i + 1) + '</td>' +
          '<td><a href="' + prefix + esc(r.file) + '">' + esc(r.title) + '</a></td>' +
          '<td class="score-val ll-num">' + esc(r.best) + '</td>' +
          '<td class="ll-num">' + esc(r.plays) + '</td>' +
          '</tr>';
      });
      html += '</tbody></table>';
      hostEl.innerHTML = html;
    }

    /* recent history */
    const histHost = document.getElementById('ll-lb-history');
    if (histHost) {
      const entries = [];
      window.LL_GAMES.forEach(g => {
        const st = window.LLStore.getGameStats(g.id);
        if (st) st.history.slice(0, 4).forEach(h => {
          entries.push({ title: lang === 'ar' ? g.titleAr : g.titleEn, score: h.score, at: h.at });
        });
      });
      entries.sort((a, b) => (a.at < b.at ? 1 : -1));
      if (!entries.length) {
        histHost.innerHTML = '';
      } else {
        histHost.innerHTML = entries.slice(0, 8).map(e =>
          '<li><span>' + esc(e.title) + '</span><span class="ll-num">' + esc(e.score) + ' · ' + esc(e.at) + '</span></li>'
        ).join('');
      }
    }
  }

  window.LLLeaderboard = { render };

  /* ==========================================================
     GLOBAL LEADERBOARD (optional, not active).
     The local records above are device-only. To enable a real
     cross-device leaderboard, configure Supabase in config.js
     and implement posting here, e.g.:

       fetch(LL_CONFIG.supabase.url + '/rest/v1/scores', {
         method: 'POST',
         headers: {
           apikey: LL_CONFIG.supabase.anonKey,
           Authorization: 'Bearer ' + LL_CONFIG.supabase.anonKey,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ game, score, player })
       });

     The site must keep working with LL_CONFIG.supabase.enabled
     set to false — never require it.
     ========================================================== */
  window.LLLeaderboard.remote = null;
})();
