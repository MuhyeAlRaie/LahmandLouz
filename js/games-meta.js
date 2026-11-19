/* ============================================================
   Lahm & Loz — Game registry
   Single source of truth used by the homepage cards, the local
   leaderboard and the share system.
   ============================================================ */

window.LL_GAMES = [
  {
    id: 'meat-vs-almond',
    file: 'games/meat-vs-almond.html',
    titleAr: 'اللحم ضد اللوز',
    titleEn: 'Meat vs Almond',
    descAr: 'إكس-أو على طاولة المنسف — العب مع صديق أو تحدى الحاسوب.',
    descEn: 'Tic-tac-toe on the Mansaf table — play a friend or the computer.',
    cat: 'touch',           // touch | camera | memory | reflex | quiz
    durationAr: '3–5 د',
    durationEn: '3–5 min',
    art: 'card-xo'
  },
  {
    id: 'catch-the-mansaf',
    file: 'games/catch-the-mansaf.html',
    titleAr: 'التقط المنسف',
    titleEn: 'Catch the Mansaf',
    descAr: 'حرّك السلة بيدك أمام الكاميرا والتقط المكونات الساقطة.',
    descEn: 'Steer the basket with your hand and catch the falling ingredients.',
    cat: 'camera',
    durationAr: '1 د',
    durationEn: '1 min',
    art: 'card-catch'
  },
  {
    id: 'build-your-mansaf',
    file: 'games/build-your-mansaf.html',
    titleAr: 'اصنع منسفك',
    titleEn: 'Build Your Mansaf',
    descAr: 'رتّب مكونات المنسف الأردني بالترتيب الصحيح على الصحن.',
    descEn: 'Assemble a Jordanian Mansaf in the correct order on the plate.',
    cat: 'touch',
    durationAr: '2–4 د',
    durationEn: '2–4 min',
    art: 'card-build'
  },
  {
    id: 'mansaf-reflex',
    file: 'games/mansaf-reflex.html',
    titleAr: 'تحدي سرعة المنسف',
    titleEn: 'Mansaf Reflex Challenge',
    descAr: 'اختبر سرعة استجابتك باللمس أو بتتبع فتح كف يدك.',
    descEn: 'Test your reaction speed with touch or hand-tracking.',
    cat: 'reflex',
    durationAr: '1–2 د',
    durationEn: '1–2 min',
    art: 'card-reflex'
  },
  {
    id: 'mansaf-memory',
    file: 'games/mansaf-memory.html',
    titleAr: 'ذاكرة المنسف',
    titleEn: 'Mansaf Memory',
    descAr: 'اقلب البطاقات واعثر على الأزواج المتشابهة بأقل تحركات.',
    descEn: 'Flip the cards and match the pairs with the fewest moves.',
    cat: 'memory',
    durationAr: '2–3 د',
    durationEn: '2–3 min',
    art: 'card-memory'
  },
  {
    id: 'virtual-mansaf-spoon',
    file: 'games/virtual-mansaf-spoon.html',
    titleAr: 'الملعقة المنسفية',
    titleEn: 'Virtual Mansaf Spoon',
    descAr: 'ملعقة افتراضية تتحرك بيدك لالتقاط مكونات المنسف.',
    descEn: 'A virtual spoon follows your hand to scoop Mansaf ingredients.',
    cat: 'camera',
    durationAr: '1–2 د',
    durationEn: '1–2 min',
    art: 'card-spoon'
  },
  {
    id: 'mansaf-quiz',
    file: 'games/mansaf-quiz.html',
    titleAr: 'اختبار المنسف',
    titleEn: 'Mansaf Quiz',
    descAr: 'عشرة أسئلة عن المنسف والمطبخ الأردني في 5 ثوانٍ للسؤال.',
    descEn: 'Ten questions about Mansaf and Jordanian cuisine, 5s each.',
    cat: 'quiz',
    durationAr: '2–3 د',
    durationEn: '2–3 min',
    art: 'card-quiz'
  },
  {
    id: 'almond-stack',
    file: 'games/almond-stack.html',
    titleAr: 'برج اللوز',
    titleEn: 'Almond Stack',
    descAr: 'كدّس اللوز لذلك بأعلى برج ممكن قبل أن يسقط كل شيء.',
    descEn: 'Stack almonds as high as you can before everything tumbles.',
    cat: 'touch',
    durationAr: '2–5 د',
    durationEn: '2–5 min',
    art: 'card-stack'
  }
];

window.LL_GAME_BY_ID = function (id) {
  return (window.LL_GAMES || []).find(g => g.id === id) || null;
};

window.LL_GAME_FILE_ABS = function (id) {
  const g = window.LL_GAME_BY_ID(id);
  if (!g) return '../index.html';
  // pages in /games/ need ../; homepage needs no prefix
  const inGamesDir = location.pathname.indexOf('/games/') !== -1;
  return inGamesDir ? ('../' + g.file) : g.file;
};
