/**
 * Language + formatting helpers for the public menu.
 * Pure functions — unit-tested in app/menus/__tests__.
 */

export const LANGUAGE_LABELS: Record<string, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  tr: "Türkçe",
  ur: "اردو",
  fa: "فارسی",
  hi: "हिन्दी",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  pt: "Português",
  ru: "Русский",
}

const RTL_LANGS = new Set(["ar", "ur", "fa", "he"])

/** localStorage key remembering the visitor's menu language. */
export const LANG_STORAGE_KEY = "menu-p-lang"

export function isRtl(lang: string): boolean {
  return RTL_LANGS.has(lang)
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase()
}

/**
 * Language precedence: ?lang param > stored preference > primary/fallback.
 * Unknown values are ignored (must be in `available`).
 */
export function resolveLanguage(
  param: string | undefined,
  stored: string | undefined,
  available: string[],
  fallback: string,
): string {
  if (param && available.includes(param)) return param
  if (stored && available.includes(stored)) return stored
  return available.includes(fallback) ? fallback : (available[0] ?? fallback)
}

// ---------------------------------------------------------------------------
// UI strings (Arabic-first; non-Arabic languages get English chrome)
// ---------------------------------------------------------------------------

export interface MenuStrings {
  menu: string
  featured: string
  unavailable: string
  downloadPdf: string
  chooseLanguage: string
  chooseLanguageHint: string
  changeLanguage: string
  madeBy: string
  emptyMenu: string
}

const AR_STRINGS: MenuStrings = {
  menu: "القائمة",
  featured: "مميز",
  unavailable: "غير متوفر",
  downloadPdf: "تحميل PDF",
  chooseLanguage: "اختر لغتك",
  chooseLanguageHint: "هذه القائمة متوفرة بأكثر من لغة",
  changeLanguage: "تغيير اللغة",
  madeBy: "صُنع بواسطة",
  emptyMenu: "القائمة قيد التحضير… عُد إلينا قريباً",
}

const EN_STRINGS: MenuStrings = {
  menu: "Menu",
  featured: "Featured",
  unavailable: "Unavailable",
  downloadPdf: "Download PDF",
  chooseLanguage: "Choose your language",
  chooseLanguageHint: "This menu is available in multiple languages",
  changeLanguage: "Change language",
  madeBy: "Made with",
  emptyMenu: "This menu is being prepared… check back soon",
}

export function getStrings(lang: string): MenuStrings {
  return lang === "ar" ? AR_STRINGS : EN_STRINGS
}

// ---------------------------------------------------------------------------
// Price formatting
// ---------------------------------------------------------------------------

const CURRENCY_LABELS_AR: Record<string, string> = {
  EGP: "ج.م",
  SAR: "ر.س",
  AED: "د.إ",
  KWD: "د.ك",
  QAR: "ر.ق",
  BHD: "د.ب",
  OMR: "ر.ع.",
  JOD: "د.أ",
  IQD: "د.ع",
  LBP: "ل.ل",
  USD: "$",
  EUR: "€",
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

export function toArabicDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]).replace(/\./g, "٫")
}

/** Digits-only phone for wa.me deep links (keeps a leading country code). */
export function whatsappHref(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^\d]/g, "")
  if (digits.length < 8) return null
  return `https://wa.me/${digits}`
}

export function formatPrice(
  price: number | null | undefined,
  currency: string | null | undefined,
  lang: string,
): string | null {
  if (price === null || price === undefined || Number.isNaN(price)) return null
  const amount = Number.isInteger(price) ? String(price) : price.toFixed(2)
  const code = (currency ?? "EGP").toUpperCase()
  if (lang === "ar") {
    const label = CURRENCY_LABELS_AR[code] ?? code
    return `${toArabicDigits(amount)} ${label}`
  }
  const label = code === "USD" ? "$" : code === "EUR" ? "€" : code
  return `${amount} ${label}`
}
