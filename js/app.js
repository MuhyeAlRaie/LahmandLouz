/* ============================================================
   Lahm & Loz — Homepage app entry
   Preloads illustration images so cards and hero art appear
   instantly, and keeps a small handle for future homepage
   logic (analytics hooks etc.).
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    /* warm the SVG image cache for canvas-free pages */
    const preload = ['mansaf', 'meat', 'almond', 'golden-almond', 'jameed-ball', 'rice', 'jameed', 'spoon'];
    preload.forEach(n => window.LLArt.image(n).catch(() => {}));

    /* smooth scroll fallback for older browsers */
    document.querySelectorAll('[data-scroll-to]').forEach(el => {
      el.addEventListener('click', ev => {
        const target = document.querySelector(el.getAttribute('data-scroll-to'));
        if (target) {
          ev.preventDefault();
          const y = target.getBoundingClientRect().top + window.scrollY - 84;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  });

  window.LLApp = { ready: true };
})();
