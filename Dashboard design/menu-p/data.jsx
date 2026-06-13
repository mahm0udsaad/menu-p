/* Sample data — "Underground" café & restaurant, Riyadh */

const RESTAURANT = {
  name: "Underground",
  nameAr: "أندرغراوند",
  tagline: "محمصة قهوة ومطبخ حديث",
  category: "both", // cafe | restaurant | both
  plan: "free",
  status: "active",
  phone: "+966 53 884 2190",
  email: "hello@underground.cafe",
  address: "حي حطين، طريق الأمير تركي الأول، الرياض 13515",
  currency: "SAR",
  logo: null,
};

const LANGS = {
  ar: { code: "ar", name: "العربية", flag: "🇸🇦", native: "العربية" },
  en: { code: "en", name: "الإنجليزية", flag: "🇬🇧", native: "English" },
  fr: { code: "fr", name: "الفرنسية", flag: "🇫🇷", native: "Français" },
  es: { code: "es", name: "الإسبانية", flag: "🇪🇸", native: "Español" },
  tr: { code: "tr", name: "التركية", flag: "🇹🇷", native: "Türkçe" },
  ur: { code: "ur", name: "الأردية", flag: "🇵🇰", native: "اردو" },
};

const CURRENCIES = [
  { value: "SAR", label: "ريال سعودي (ر.س)", sym: "ر.س" },
  { value: "AED", label: "درهم إماراتي (د.إ)", sym: "د.إ" },
  { value: "KWD", label: "دينار كويتي (د.ك)", sym: "د.ك" },
  { value: "QAR", label: "ريال قطري (ر.ق)", sym: "ر.ق" },
  { value: "USD", label: "دولار أمريكي ($)", sym: "$" },
];
const CUR_SYM = "ر.س";

/* ---------- Menus ---------- */
const MENUS = [
  {
    id: "m1", name: "القائمة الرئيسية", nameEn: "Main Menu",
    status: "published", langs: ["ar", "en", "fr"], updated: "2026-06-09", published: "2026-05-21",
    views: 1840, template: "نوير", accent: "#1c1c1c",
    categories: [
      { id: "c1", name: "قهوة مختصة", items: [
        { id: "i1", name: "إسبريسو", desc: "حبوب إثيوبية، تحميص فاتح", price: 14 },
        { id: "i2", name: "فلات وايت", desc: "جرعة مزدوجة، حليب مبخّر", price: 19 },
        { id: "i3", name: "في 60", desc: "تقطير يدوي، كولومبيا", price: 22 },
        { id: "i4", name: "كورتادو", desc: "توازن مثالي للحليب", price: 17 },
      ]},
      { id: "c2", name: "مشروبات باردة", items: [
        { id: "i5", name: "آيس لاتيه", desc: "إسبريسو مع حليب بارد", price: 21 },
        { id: "i6", name: "كولد برو", desc: "نقع 18 ساعة", price: 24 },
        { id: "i7", name: "سبانش لاتيه مثلج", desc: "حليب مكثّف محلّى", price: 23 },
      ]},
      { id: "c3", name: "حلويات", items: [
        { id: "i8", name: "تشيز كيك سان سيباستيان", desc: "محروق من الأعلى", price: 28 },
        { id: "i9", name: "كروسان لوز", desc: "زبدة فرنسية", price: 18 },
        { id: "i10", name: "كوكي بحبوب الشوكولاتة", desc: "طري من الوسط", price: 15 },
      ]},
    ],
  },
  {
    id: "m2", name: "قائمة الإفطار", nameEn: "Breakfast",
    status: "published", langs: ["ar", "en"], updated: "2026-06-04", published: "2026-04-30",
    views: 612, template: "أصيل", accent: "#7a4a2b",
    categories: [
      { id: "c4", name: "أطباق الصباح", items: [
        { id: "i11", name: "شكشوكة", desc: "بيض، صلصة طماطم، خبز محمّص", price: 32 },
        { id: "i12", name: "أفوكادو توست", desc: "خبز حامض، بيض مسلوق", price: 36 },
        { id: "i13", name: "بان كيك التوت", desc: "ثلاث طبقات، شراب القيقب", price: 34 },
      ]},
    ],
  },
  {
    id: "m3", name: "قائمة المساء", nameEn: "Evening",
    status: "draft", langs: ["ar"], updated: "2026-06-11", published: null,
    views: 0, template: "نوير", accent: "#1c1c1c",
    categories: [
      { id: "c5", name: "أطباق رئيسية", items: [
        { id: "i14", name: "باستا ترافل", desc: "كريمة الكمأة، بارميزان", price: 58 },
        { id: "i15", name: "برجر أنغوس", desc: "لحم 200غ، جبنة شيدر", price: 49 },
      ]},
    ],
  },
];

/* ---------- QR Cards ---------- */
const QR_CARDS = [
  { id: "q1", name: "بطاقة الطاولة — رئيسية", menuId: "m1", menuName: "القائمة الرئيسية",
    text: "امسح للاطّلاع على القائمة", status: "active", date: "2026-05-22",
    template: "classic", size: 230, logoPos: "top", menuUrl: "https://menu-p.app/m/underground-main" },
  { id: "q2", name: "بطاقة الإفطار", menuId: "m2", menuName: "قائمة الإفطار",
    text: "إفطارنا متوفّر حتى 12 ظهراً", status: "active", date: "2026-05-08",
    template: "noir", size: 260, logoPos: "center", menuUrl: "https://menu-p.app/m/underground-breakfast" },
  { id: "q3", name: "بطاقة الواجهة", menuId: "m1", menuName: "القائمة الرئيسية",
    text: "Underground — اطلب من جوالك", status: "active", date: "2026-04-19",
    template: "royal", size: 280, logoPos: "center", menuUrl: "https://menu-p.app/m/underground-main" },
];

/* ---------- Posters ---------- */
const POSTERS = [
  { id: "p1", type: "offer", title: "عرض القهوة المختصة", status: "ready", date: "2026-06-08", size: "square", accent: "#7a4a2b" },
  { id: "p2", type: "greeting", title: "تهنئة عيد الأضحى", status: "ready", date: "2026-06-05", size: "story", accent: "#1c5c3a" },
  { id: "p3", type: "offer", title: "خصم نهاية الأسبوع", status: "generating", date: "2026-06-12", size: "square", accent: "#1c1c1c" },
  { id: "p4", type: "greeting", title: "أهلاً رمضان", status: "failed", date: "2026-06-11", size: "story", accent: "#3a2c5c" },
];

/* ---------- Social accounts ---------- */
const ACCOUNTS = [
  { id: "a1", platform: "instagram", name: "@underground.cafe", status: "connected", followers: "8,420" },
  { id: "a2", platform: "facebook", name: "Underground Café", status: "connected", followers: "3,109" },
  { id: "a3", platform: "tiktok", name: "@undergroundksa", status: "expired", followers: "12,300" },
];

/* ---------- Post history ---------- */
const POST_HISTORY = [
  { id: "h1", platform: "instagram", account: "@underground.cafe", kind: "poster", status: "posted",
    date: "2026-06-08 14:20", caption: "عرض القهوة المختصة لفترة محدودة ☕️ خصم 20%", ref: "IG_18294..." },
  { id: "h2", platform: "facebook", account: "Underground Café", kind: "menu", status: "posted",
    date: "2026-06-07 11:05", caption: "قائمتنا الجديدة متوفّرة الآن — تصفّحها بالكامل", ref: "FB_77120..." },
  { id: "h3", platform: "tiktok", account: "@undergroundksa", kind: "qr", status: "failed",
    date: "2026-06-06 19:40", caption: "امسح وجرّب — كولد برو الجديد", ref: "انتهت صلاحية الاتصال" },
  { id: "h4", platform: "instagram", account: "@underground.cafe", kind: "page", status: "scheduled",
    date: "2026-06-14 10:00", caption: "إفطار الويكند — احجز طاولتك", ref: "—" },
  { id: "h5", platform: "facebook", account: "Underground Café", kind: "poster", status: "draft",
    date: "—", caption: "تهنئة عيد الأضحى المبارك 🌙", ref: "—" },
];

/* ---------- Templates (menu editor) ---------- */
const TEMPLATES = [
  { id: "t1", name: "نوير", cat: "عصري", accent: "#1c1c1c", desc: "أسود فاخر، تباعد واسع" },
  { id: "t2", name: "أصيل", cat: "كلاسيكي", accent: "#7a4a2b", desc: "بنّي دافئ، خطوط أنيقة" },
  { id: "t3", name: "نقي", cat: "بسيط", accent: "#2b6b5b", desc: "أبيض نظيف، حد أدنى" },
  { id: "t4", name: "ليالي", cat: "عصري", accent: "#2c2456", desc: "بنفسجي ليلي، أنيق" },
  { id: "t5", name: "بستان", cat: "طبيعي", accent: "#4a6b2b", desc: "أخضر طبيعي، عضوي" },
  { id: "t6", name: "رمل", cat: "كلاسيكي", accent: "#a8763a", desc: "رملي هادئ، شرقي" },
];

/* ---------- Activity feed ---------- */
const ACTIVITY = [
  { id: "ac1", icon: "eye", tone: "info", text: "تم عرض القائمة الرئيسية 48 مرة اليوم", time: "منذ ساعتين" },
  { id: "ac2", icon: "share", tone: "success", text: "نُشر بوستر «عرض القهوة المختصة» على إنستغرام", time: "أمس 14:20" },
  { id: "ac3", icon: "languages", tone: "violet", text: "أُضيفت الترجمة الفرنسية للقائمة الرئيسية", time: "قبل 3 أيام" },
  { id: "ac4", icon: "qr", tone: "warning", text: "تم تحميل بطاقة QR «الواجهة»", time: "قبل 4 أيام" },
];

/* ---------- Occasions (greeting posters) ---------- */
const OCCASIONS = ["عيد الفطر", "عيد الأضحى", "رمضان", "اليوم الوطني", "يوم التأسيس", "رأس السنة", "الجمعة البيضاء"];

/* ---------- Poster offer items (flat) ---------- */
function allMenuItems() {
  const out = [];
  MENUS.forEach(m => m.categories.forEach(c => c.items.forEach(it =>
    out.push({ ...it, cat: c.name, menu: m.name }))));
  return out;
}

function fmtPrice(n) { return `${n} ${CUR_SYM}`; }
function platformMeta(p) {
  return {
    instagram: { icon: "instagram", label: "إنستغرام", color: "#E1306C" },
    facebook: { icon: "facebook", label: "فيسبوك", color: "#1877F2" },
    tiktok: { icon: "tiktok", label: "تيك توك", color: "#000000" },
  }[p];
}
const KIND_LABEL = { menu: "رابط القائمة + QR", page: "صفحة قائمة", poster: "بوستر", qr: "كود QR" };

Object.assign(window, {
  RESTAURANT, LANGS, CURRENCIES, CUR_SYM, MENUS, QR_CARDS, POSTERS, ACCOUNTS, POST_HISTORY,
  TEMPLATES, ACTIVITY, OCCASIONS, allMenuItems, fmtPrice, platformMeta, KIND_LABEL,
});
