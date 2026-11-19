/* ============================================================
   Lahm & Loz — Global configuration
   Edit this file to update social links, offers and site URL.
   ============================================================ */

window.LL_CONFIG = {
  restaurant: {
    nameAr: 'لحم ولوز',
    nameEn: 'Lahm & Loz',
    taglineAr: 'منسف على الطريقة الأصيلة',
    taglineEn: 'Authentic Jordanian Mansaf',
    branchAr: 'الفرع الجديد: الشميساني، عمّان',
    branchEn: 'New branch: Shmeisani, Amman'
  },

  // Used by the QR block and share cards. Leave empty ("") to
  // auto-detect the current website address.
  siteUrl: '',

  // Social media links — replace "#" with the real profiles.
  social: {
    instagram: '#',
    facebook: '#',
    tiktok: '#',
    whatsapp: '#'
  },

  // ---------------------------------------------------------
  // Promotional / coupon system (OPTIONAL).
  // The restaurant can activate this later by setting enabled
  // to true and editing the texts below. Nothing is promised to
  // players while it is disabled.
  //
  // SECURITY NOTE: any coupon shown here is generated on the
  // client side only. It is NOT secure and can be forged.
  // Verified prize redemption requires a backend (e.g. Supabase
  // edge function) that validates the score before issuing a
  // single-use coupon code.
  // ---------------------------------------------------------
  promo: {
    enabled: false,
    messageAr: 'عرض خاص لزوار التجربة التفاعلية!',
    messageEn: 'Special offer for interactive experience visitors!',
    offerAr: 'خصم 10% على وجبة المنسف',
    offerEn: '10% off the Mansaf meal',
    code: 'LAHM-LOZ-FUN',
    ctaAr: 'اطلب الآن',
    ctaEn: 'Order now',
    ctaUrl: '#'
  },

  // ---------------------------------------------------------
  // Optional Supabase integration placeholder.
  // The project works fully without Supabase. To enable a
  // global leaderboard later, fill in the values and follow
  // README.md ("Supabase integration").
  // ---------------------------------------------------------
  supabase: {
    enabled: false,
    url: '',
    anonKey: ''
  },

  // Storage namespace (change if you need to reset all data).
  storagePrefix: 'll_'
};
