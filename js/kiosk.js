/* ============================================================
   Lahm & Loz — Kiosk mode
   Optimised layout for large in-restaurant touchscreens:
   bigger targets, no hover dependence, high contrast.
   The choice persists across pages via localStorage.
   ============================================================ */

(function () {
  'use strict';

  function enabled() {
    return !!window.LLStore.getSettings().kiosk;
  }

  function apply() {
    document.body.classList.toggle('ll-kiosk', enabled());
  }

  function set(on) {
    window.LLStore.saveSettings({ kiosk: !!on });
    apply();
    document.dispatchEvent(new CustomEvent('ll:kiosk', { detail: { enabled: !!on } }));
    if (on) {
      // best-effort fullscreen (needs a user gesture)
      try {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      } catch (e) { /* ignore */ }
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      } catch (e) { /* ignore */ }
    }
  }

  function toggle() { set(!enabled()); return enabled(); }

  document.addEventListener('DOMContentLoaded', () => {
    apply();

    /* floating exit button available on every page while kiosk is on */
    if (!document.getElementById('ll-kiosk-exit')) {
      const b = document.createElement('button');
      b.id = 'll-kiosk-exit';
      b.className = 'btn-ll btn-ll-icon ll-kiosk-exit';
      b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>';
      b.addEventListener('click', () => set(false));
      document.body.appendChild(b);
    }

    document.querySelectorAll('[data-kiosk-toggle]').forEach(btn => {
      btn.addEventListener('click', () => toggle());
      const paint = () => btn.classList.toggle('active', enabled());
      paint();
      document.addEventListener('ll:kiosk', paint);
    });
  });

  window.LLKiosk = { enabled, set, toggle };
})();
