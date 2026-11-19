/* ============================================================
   Lahm & Loz — Illustration library (original SVG artwork)
   Brand-styled vector food art shared by every game: meat,
   almond, rice, jameed, mansaf plate, basket, spoon...
   Provides DOM injection, data-URLs and canvas-ready images.
   ============================================================ */

(function () {
  'use strict';

  const C = {
    meat: '#A9662F', meatDark: '#8A4E1D', meatLight: '#C9813E', meatShine: '#F1B57C',
    outline: '#6B3E17',
    almond: '#D3A064', almondDark: '#8A5B28', almondLight: '#EDD3AF', almondDeep: '#B98448',
    rice: '#FDF9F0', riceDark: '#C9BBA4', grain: '#E7DAC2',
    cream: '#F5F3EE', white: '#FFFFFF', plateEdge: '#B9AB98',
    green: '#164B2A', greenSoft: '#2E7D46', gold: '#E8B04B', goldDark: '#A97B1E',
    bone: '#F4E9DA', bowlEdge: '#9C8A6E', jameed: '#FFF7EA',
    chili: '#4C8C3F', chiliDark: '#2F5E27', chiliShine: '#6FAF5C',
    wood: '#C89B66', woodDark: '#7A5426', woodDeep: '#A97B44'
  };

  /* ---------- primitives (viewBox 0 0 100 100) ---------- */
  const P = {};

  P.meat = `
    <rect x="20" y="54" width="24" height="9" rx="4.5" transform="rotate(45 32 58)" fill="${C.bone}" stroke="${C.outline}" stroke-width="3"/>
    <circle cx="16" cy="70" r="6.5" fill="${C.bone}" stroke="${C.outline}" stroke-width="3"/>
    <circle cx="24" cy="78" r="6.5" fill="${C.bone}" stroke="${C.outline}" stroke-width="3"/>
    <path d="M52 10 C71 10 84 22 84 40 C84 58 72 72 54 74 C40 76 28 70 22 58 C16 46 22 30 34 20 C40 15 46 10 52 10 Z"
          fill="${C.meat}" stroke="${C.outline}" stroke-width="4"/>
    <path d="M48 20 C58 16 70 22 74 32 C76 38 74 44 68 44 C60 44 52 40 48 34 C44 28 44 22 48 20 Z"
          fill="${C.meatLight}" opacity=".85"/>
    <ellipse cx="46" cy="27" rx="7" ry="4.5" fill="${C.meatShine}" opacity=".95" transform="rotate(-18 46 27)"/>
    <path d="M60 24 C66 32 68 42 64 52" stroke="${C.meatDark}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M70 32 C74 38 74 46 70 54" stroke="${C.meatDark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  P.almond = `
    <path d="M50 8 C62 15 72 30 72 48 C72 68 62 82 50 88 C38 82 28 68 28 48 C28 30 38 15 50 8 Z"
          fill="${C.almond}" stroke="${C.almondDark}" stroke-width="4"/>
    <path d="M50 20 C58 27 63 37 63 48 C63 60 58 70 50 77" stroke="${C.almondDeep}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="41" cy="35" rx="6" ry="10" fill="${C.almondLight}" transform="rotate(-14 41 35)"/>`;

  P['golden-almond'] = `
    <path d="M50 8 C62 15 72 30 72 48 C72 68 62 82 50 88 C38 82 28 68 28 48 C28 30 38 15 50 8 Z"
          fill="${C.gold}" stroke="${C.goldDark}" stroke-width="4"/>
    <path d="M50 20 C58 27 63 37 63 48 C63 60 58 70 50 77" stroke="${C.goldDark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="41" cy="35" rx="6" ry="10" fill="#F7D98F" transform="rotate(-14 41 35)"/>
    <g stroke="${C.gold}" stroke-width="3" stroke-linecap="round">
      <path d="M14 30 L22 34"/><path d="M86 30 L78 34"/>
      <path d="M50 92 L50 98" stroke-width="0" />
    </g>
    <path d="M20 12 L26 20 M80 12 L74 20" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>
    <path d="M10 52 L20 52 M90 52 L80 52" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>`;

  P.chili = `
    <path d="M60 18 C78 24 86 42 80 60 C73 80 55 92 36 92 C28 92 24 87 26 82 C44 76 60 62 63 48 C66 36 62 28 52 24 C48 22 50 16 60 18 Z"
          fill="${C.chili}" stroke="${C.chiliDark}" stroke-width="3.5"/>
    <path d="M66 34 C70 44 66 58 56 68" stroke="${C.chiliShine}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M52 24 C46 16 36 12 28 14" stroke="${C.chiliDark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;

  P['rice-clump'] = `
    <path d="M26 62 C22 44 34 30 50 30 C66 30 78 44 74 62 C68 70 32 70 26 62 Z"
          fill="${C.rice}" stroke="${C.riceDark}" stroke-width="3.5"/>
    <g stroke="${C.grain}" stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M38 44 L44 40"/><path d="M56 40 L62 44"/><path d="M48 52 L54 48"/>
      <path d="M36 56 L42 54"/><path d="M58 56 L64 53"/>
    </g>`;

  P.rice = `
    <ellipse cx="50" cy="74" rx="40" ry="13" fill="${C.white}" stroke="${C.plateEdge}" stroke-width="3"/>
    <path d="M22 68 C20 48 34 34 50 34 C66 34 80 48 78 68 C70 74 30 74 22 68 Z"
          fill="${C.rice}" stroke="${C.riceDark}" stroke-width="3"/>
    <g stroke="${C.grain}" stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M36 48 L42 44"/><path d="M56 44 L62 48"/><path d="M46 58 L52 54"/>
      <path d="M34 60 L40 58"/><path d="M60 60 L66 57"/><path d="M48 40 L54 38"/>
    </g>`;

  P.jameed = `
    <path d="M18 50 C18 70 32 84 50 84 C68 84 82 70 82 50 L82 48 L18 48 Z"
          fill="${C.jameed}" stroke="${C.bowlEdge}" stroke-width="3.5"/>
    <ellipse cx="50" cy="48" rx="32" ry="11" fill="#FFFDF7" stroke="${C.bowlEdge}" stroke-width="3.5"/>
    <path d="M50 37 C58 33 70 34 78 38" stroke="${C.jameed}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="42" cy="44" rx="9" ry="3.4" fill="#FFFDF7"/>`;

  P['jameed-ball'] = `
    <circle cx="50" cy="52" r="30" fill="#FFFDF7" stroke="${C.bowlEdge}" stroke-width="3.5"/>
    <ellipse cx="40" cy="40" rx="9" ry="6" fill="#FFFFFF" opacity=".9"/>
    <path d="M32 62 C38 68 52 70 62 66" stroke="#E8DFCB" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  P.spoon = `
    <g transform="rotate(40 50 50)">
      <ellipse cx="50" cy="24" rx="17" ry="22" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="4"/>
      <ellipse cx="50" cy="26" rx="9" ry="13" fill="${C.woodDeep}" opacity=".55"/>
      <rect x="44" y="44" width="12" height="42" rx="6" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="4"/>
    </g>`;

  P.basket = `
    <path d="M20 42 L80 42 L72 82 C71 88 67 91 61 91 L39 91 C33 91 29 88 28 82 Z"
          fill="${C.wood}" stroke="${C.woodDark}" stroke-width="4"/>
    <g stroke="${C.woodDark}" stroke-width="2.6" fill="none" opacity=".7">
      <path d="M24 54 L76 54"/><path d="M26 66 L74 66"/><path d="M30 78 L70 78"/>
      <path d="M36 42 L34 91"/><path d="M50 42 L50 91"/><path d="M64 42 L66 91"/>
    </g>
    <rect x="14" y="34" width="72" height="12" rx="6" fill="${C.woodDeep}" stroke="${C.woodDark}" stroke-width="4"/>`;

  P.shrak = `
    <ellipse cx="50" cy="64" rx="42" ry="19" fill="#F2E3C4" stroke="#B99B62" stroke-width="3"/>
    <ellipse cx="50" cy="54" rx="42" ry="19" fill="#F7ECD6" stroke="#B99B62" stroke-width="3"/>
    <g fill="#E4CF9E">
      <circle cx="38" cy="52" r="2.4"/><circle cx="60" cy="58" r="2.2"/><circle cx="52" cy="48" r="2"/>
      <circle cx="70" cy="50" r="1.8"/><circle cx="34" cy="62" r="2"/>
    </g>`;

  P.mansaf = `
    <ellipse cx="50" cy="70" rx="46" ry="16" fill="${C.white}" stroke="${C.plateEdge}" stroke-width="3"/>
    <path d="M20 64 C18 46 32 34 50 34 C68 34 82 46 80 64 C70 70 30 70 20 64 Z"
          fill="${C.rice}" stroke="${C.riceDark}" stroke-width="3"/>
    <ellipse cx="38" cy="42" rx="12" ry="8" fill="${C.meat}" stroke="${C.outline}" stroke-width="3"/>
    <ellipse cx="59" cy="39" rx="11" ry="7" fill="${C.meat}" stroke="${C.outline}" stroke-width="3"/>
    <ellipse cx="49" cy="50" rx="12" ry="7.5" fill="${C.meatLight}" stroke="${C.outline}" stroke-width="3"/>
    <g fill="${C.almond}" stroke="${C.almondDark}" stroke-width="2">
      <ellipse cx="28" cy="56" rx="4.5" ry="3" transform="rotate(-20 28 56)"/>
      <ellipse cx="70" cy="54" rx="4.5" ry="3" transform="rotate(15 70 54)"/>
      <ellipse cx="50" cy="61" rx="4.5" ry="3" transform="rotate(5 50 61)"/>
      <ellipse cx="42" cy="32" rx="4" ry="2.6" transform="rotate(-10 42 32)"/>
    </g>
    <path d="M28 47 C40 53 62 51 74 45" stroke="#F2E4C9" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".95"/>`;

  P.plate = `
    <ellipse cx="50" cy="62" rx="47" ry="22" fill="${C.white}" stroke="${C.plateEdge}" stroke-width="3"/>
    <ellipse cx="50" cy="59" rx="36" ry="15" fill="#F4F0E7" stroke="#D6CCBA" stroke-width="2"/>`;

  P.spark = `
    <path d="M50 10 C54 34 58 38 82 42 C58 46 54 50 50 74 C46 50 42 46 18 42 C42 38 46 34 50 10 Z"
          fill="${C.gold}" stroke="${C.goldDark}" stroke-width="2.5"/>`;

  /* ---------- homepage / results scenes (viewBox 0 0 320 240) ---------- */
  const S = {};

  function frame(inner, extra) {
    return `
      <rect x="6" y="6" width="308" height="228" rx="26" fill="${C.cream}" stroke="${C.green}" stroke-width="3"/>
      <rect x="16" y="16" width="288" height="208" rx="18" fill="none" stroke="${C.almond}" stroke-width="1.6" stroke-dasharray="1 7" stroke-linecap="round"/>
      ${extra || ''}${inner}`;
  }

  function item(name, x, y, s, rot) {
    return `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s}) translate(-50 -50)">${P[name]}</g>`;
  }

  S['card-xo'] = `
    <g stroke="${C.almondDeep}" stroke-width="3" opacity=".5">
      <path d="M78 74 H242"/><path d="M78 130 H242"/><path d="M78 186 H242"/>
      <path d="M78 74 V186"/><path d="M133 74 V186"/><path d="M188 74 V186"/>
    </g>
    ${item('meat', 242, 74, .42, 8)}
    ${item('almond', 78, 74, .4, -8)}
    ${item('meat', 133, 130, .42, -6)}
    ${item('almond', 188, 130, .4, 10)}
    ${item('almond', 133, 186, .38, 4)}
    ${item('meat', 242, 186, .42, -10)}`;

  S['card-catch'] = `
    ${item('meat', 90, 62, .45, -18)}
    ${item('almond', 176, 46, .42, 14)}
    ${item('golden-almond', 240, 84, .44, -8)}
    <g transform="translate(160 168) scale(1.15) translate(-50 -50)">${P.basket}</g>
    ${item('chili', 48, 150, .35, 20)}`;

  S['card-build'] = `
    <g transform="translate(160 128) scale(1.5) translate(-50 -50)">${P.mansaf}</g>
    <g transform="translate(46 52) scale(.34) translate(-50 -50)">${P.rice}</g>
    <g transform="translate(272 60) scale(.34) translate(-50 -50)">${P.meat}</g>
    <g transform="translate(40 200) scale(.3) translate(-50 -50)">${P.jameed}</g>
    <g transform="translate(278 196) scale(.3) translate(-50 -50)">${P.almond}</g>`;

  S['card-reflex'] = `
    <path d="M160 24 L138 106 L166 106 L148 190 L196 98 L168 98 L184 24 Z"
          fill="${C.gold}" stroke="${C.goldDark}" stroke-width="4" stroke-linejoin="round"/>
    ${item('meat', 84, 120, .62, -12)}
    ${item('almond', 244, 122, .58, 10)}
    <g stroke="${C.almondDeep}" stroke-width="3.5" stroke-linecap="round" opacity=".6">
      <path d="M40 46 h34"/><path d="M32 66 h26"/><path d="M246 190 h34"/><path d="M254 172 h26"/>
    </g>`;

  S['card-memory'] = `
    <g transform="translate(118 122) rotate(-8)">
      <rect x="-58" y="-74" width="116" height="148" rx="16" fill="${C.green}" stroke="${C.green}" stroke-width="3"/>
      <g transform="scale(.62) translate(-50 -50)" opacity=".95">${P.almond}</g>
    </g>
    <g transform="translate(206 122) rotate(9)">
      <rect x="-58" y="-74" width="116" height="148" rx="16" fill="${C.white}" stroke="${C.almondDeep}" stroke-width="3"/>
      <g transform="scale(.62) translate(-50 -50)">${P.meat}</g>
    </g>`;

  S['card-spoon'] = `
    <g transform="translate(196 100) rotate(35) scale(.95) translate(-50 -50)">${P.spoon}</g>
    <g transform="translate(120 170) scale(.7) translate(-50 -50)">${P['rice-clump']}</g>
    ${item('meat', 60, 60, .42, -14)}
    ${item('almond', 250, 178, .4, 12)}
    <g fill="${C.rice}" stroke="${C.riceDark}" stroke-width="2">
      <circle cx="132" cy="128" r="5"/><circle cx="146" cy="112" r="4"/><circle cx="124" cy="102" r="4"/>
    </g>`;

  S['card-quiz'] = `
    <g transform="translate(122 148) scale(1.05) translate(-50 -50)">${P.mansaf}</g>
    <circle cx="240" cy="80" r="44" fill="${C.green}"/>
    <text x="240" y="104" font-family="Cairo, sans-serif" font-size="64" font-weight="900"
          fill="${C.almondLight}" text-anchor="middle">؟</text>
    ${item('spark', 62, 56, .4, 0)}`;

  S['card-stack'] = `
    <ellipse cx="160" cy="206" rx="88" ry="12" fill="#E3D5BC"/>
    <g transform="translate(160 178) scale(.78) translate(-50 -50)">${P.almond}</g>
    <g transform="translate(150 118) scale(.72) rotate(-8) translate(-50 -50)">${P.almond}</g>
    <g transform="translate(172 66) scale(.66) rotate(7) translate(-50 -50)">${P.almond}</g>
    <path d="M206 22 L200 40 L212 40 L204 62" stroke="${C.gold}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${item('spark', 90, 40, .35, 0)}`;

  /* ---------- engine ---------- */
  function wrap(inner, viewBox) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`;
  }

  function svg(name, opts) {
    opts = opts || {};
    if (P[name]) return wrap(`<g>${P[name]}</g>`, '0 0 100 100');
    if (S[name]) return wrap(S[name], '0 0 320 240');
    return '';
  }

  const urlCache = {};
  function dataURL(name) {
    if (!urlCache[name]) {
      urlCache[name] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(name));
    }
    return urlCache[name];
  }

  const imgCache = {};
  function image(name) {
    if (imgCache[name]) return Promise.resolve(imgCache[name]);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { imgCache[name] = img; resolve(img); };
      img.onerror = reject;
      img.src = dataURL(name);
    });
  }

  const canvasCache = {};
  async function canvas(name, w, h) {
    const key = name + '_' + w + 'x' + h;
    if (canvasCache[key]) return canvasCache[key];
    const img = await image(name);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    cv.getContext('2d').drawImage(img, 0, 0, w, h);
    canvasCache[key] = cv;
    return cv;
  }

  function inject(root) {
    (root || document).querySelectorAll('[data-art]').forEach(el => {
      const name = el.getAttribute('data-art');
      const box = svg(name);
      if (box) el.innerHTML = box;
    });
  }

  window.LLArt = { svg, dataURL, image, canvas, inject, colors: C };
})();
