/* ============================================================
   Lahm & Loz — Language system (Arabic default / English)
   Applies translations to [data-i18n] elements, switches
   document direction (RTL/LTR) and persists the choice.
   ============================================================ */

(function () {
  'use strict';

  let current = (function () {
    const s = window.LLStore.getSettings();
    return s.lang === 'en' ? 'en' : 'ar';
  })();

  function applyText(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const v = window.LLT(k);
      if (typeof v === 'string') el.textContent = v;
    });
    (root || document).querySelectorAll('[data-i18n-ph]').forEach(el => {
      const k = el.getAttribute('data-i18n-ph');
      const v = window.LLT(k);
      if (typeof v === 'string') el.setAttribute('placeholder', v);
    });
    (root || document).querySelectorAll('[data-i18n-aria]').forEach(el => {
      const k = el.getAttribute('data-i18n-aria');
      const v = window.LLT(k);
      if (typeof v === 'string') el.setAttribute('aria-label', v);
    });
  }

  function paintLangBtn() {
    const btn = document.getElementById('ll-lang-btn');
    if (!btn) return;
    btn.textContent = window.LLT('common.langBtn');
    btn.setAttribute('aria-label', current === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  }

  function setLang(lang, silent) {
    const l = lang === 'en' ? 'en' : 'ar';
    if (l !== current) {
      // same-page re-render
      current = l;
      window.LLStore.saveSettings({ lang: l });
      location.reload();
      return;
    }
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    applyText();
    paintLangBtn();
    window.LLArt.inject();
    if (!silent) document.dispatchEvent(new CustomEvent('ll:lang', { detail: { lang: l } }));
  }

  window.LLLang = {
    current,
    set: setLang,
    apply: () => setLang(current, true),
    t: (k, vars) => window.LLT(k, vars)
  };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('ll-lang-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        setLang(current === 'ar' ? 'en' : 'ar');
      });
    }
    setLang(current, true);
    document.dispatchEvent(new CustomEvent('ll:lang', { detail: { lang: current } }));
  });
})();
