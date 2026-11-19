/* ============================================================
   Lahm & Loz — Local storage layer
   Stores settings, player name, per-game stats and history on
   THIS DEVICE ONLY. These records are not shared between
   devices — see leaderboard.js for the global-leaderboard stub.
   ============================================================ */

(function () {
  'use strict';

  const PREFIX = (window.LL_CONFIG && window.LL_CONFIG.storagePrefix) || 'll_';

  function key(name) { return PREFIX + name; }

  function get(name, fallback) {
    try {
      const raw = localStorage.getItem(key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function set(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function remove(name) {
    try { localStorage.removeItem(key(name)); } catch (e) { /* ignore */ }
  }

  const LLStore = {
    get, set, remove,

    /* ----- player identity ----- */
    getPlayerName() { return get('playerName', ''); },
    setPlayerName(name) { set('playerName', String(name || '').slice(0, 24)); },

    /* ----- settings ----- */
    getSettings() {
      return get('settings', { lang: 'ar', muted: false, kiosk: false });
    },
    saveSettings(part) {
      const s = Object.assign({}, LLStore.getSettings(), part);
      set('settings', s);
      return s;
    },

    /* ----- per-game stats ----- */
    // meta: optional object with extra info (e.g. difficulty, mode)
    recordGame(gameId, score, meta) {
      const stats = get('game_' + gameId, { plays: 0, best: 0, lastScore: 0, history: [] });
      const entry = {
        score: Math.round(score),
        at: new Date().toISOString().slice(0, 10),
        meta: meta || {}
      };
      stats.plays += 1;
      stats.lastScore = entry.score;
      if (entry.score > stats.best) stats.best = entry.score;
      stats.history.unshift(entry);
      if (stats.history.length > 20) stats.history.length = 20;
      set('game_' + gameId, stats);

      // global counter
      const totals = get('totals', { games: 0 });
      totals.games += 1;
      set('totals', totals);
      return stats;
    },
    getGameStats(gameId) {
      return get('game_' + gameId, null);
    },
    getBest(gameId) {
      const s = LLStore.getGameStats(gameId);
      return s ? s.best : 0;
    },
    getAllStats() {
      const meta = (window.LL_GAMES || []);
      return meta.map(g => ({
        game: g.id,
        titleAr: g.titleAr,
        titleEn: g.titleEn,
        stats: getGameStats(g.id)
      }));
    },
    getTotals() { return get('totals', { games: 0 }); },
    resetAll() {
      (window.LL_GAMES || []).forEach(g => remove('game_' + g.id));
      remove('totals');
    }
  };

  window.LLStore = LLStore;
})();
