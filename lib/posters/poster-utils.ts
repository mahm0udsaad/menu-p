/**
 * Pure poster data-binding helpers (Phase 4 — Poster Studio).
 * No dependencies — unit-testable with plain node (see lib/posters/__tests__).
 *
 * Critical rule: the AI model NEVER renders text (it garbles Arabic glyphs).
 * All text lands here, escaped, and is composited over the art via HTML.
 */

export type PosterMode = "offer" | "greeting"
export type PosterTemplateId = "offer-single" | "offer-multi" | "greeting-centered" | "greeting-elegant"
export type PosterSize = "square" | "story"

export interface PosterPalette {
  primary: string
  secondary: string
  accent: string
}

export interface OfferProduct {
  id?: string | null
  name: string
  imageUrl?: string | null
  /** Pre-offer price; shown struck-through when > newPrice. */
  oldPrice?: number | null
  newPrice: number
}

export interface OfferPayload {
  mode: "offer"
  currency: string
  headline?: string | null
  products: OfferProduct[]
}

export interface GreetingPayload {
  mode: "greeting"
  occasion: string
  message: string
}

export type PosterPayload = OfferPayload | GreetingPayload

/** Rose-family default, matching the dashboard look. */
export const DEFAULT_PALETTE: PosterPalette = {
  primary: "#9f1239",
  secondary: "#e11d48",
  accent: "#fbbf24",
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch])
}

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

/** 0-9 → ٠-٩ and the decimal point → the Arabic decimal separator (٫). */
export function toArabicDigits(value: string | number): string {
  return String(value)
    .replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)])
    .replace(/\./g, "٫")
}

/** 45 → "45", 45.5 → "45.5", 45.999 → "46" (max 2 decimals, trimmed). */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0"
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

const CURRENCY_LABELS: Record<string, string> = {
  EGP: "ج.م",
  SAR: "ر.س",
  AED: "د.إ",
  KWD: "د.ك",
  QAR: "ر.ق",
  BHD: "د.ب",
  OMR: "ر.ع",
  JOD: "د.أ",
  IQD: "د.ع",
  USD: "$",
  EUR: "€",
}

export function currencyLabel(code?: string | null): string {
  if (!code) return ""
  return CURRENCY_LABELS[code.toUpperCase()] ?? code
}

/** "٤٥٫٥ ج.م" — Arabic-Indic digits + localized currency label. */
export function formatPrice(value: number, currency?: string | null): string {
  const label = currencyLabel(currency)
  const amount = toArabicDigits(formatAmount(value))
  return label ? `${amount} ${label}` : amount
}

/** Rounded discount % when oldPrice > newPrice > 0; otherwise null. */
export function discountPercent(oldPrice: number | null | undefined, newPrice: number): number | null {
  if (oldPrice == null || !Number.isFinite(oldPrice) || !Number.isFinite(newPrice)) return null
  if (oldPrice <= 0 || newPrice < 0 || newPrice >= oldPrice) return null
  const pct = Math.round((1 - newPrice / oldPrice) * 100)
  return pct >= 1 ? pct : null
}

/** "خصم ٢٥٪" or null when there is no real discount. */
export function discountBadgeText(oldPrice: number | null | undefined, newPrice: number): string | null {
  const pct = discountPercent(oldPrice, newPrice)
  return pct === null ? null : `خصم ${toArabicDigits(pct)}٪`
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/**
 * Palette values are interpolated into CSS — only accept hex colors,
 * fall back to the rose defaults per channel.
 */
export function sanitizePalette(input: unknown): PosterPalette {
  const raw = (input ?? {}) as Partial<Record<keyof PosterPalette, unknown>>
  const pick = (key: keyof PosterPalette): string => {
    const value = raw[key]
    return typeof value === "string" && HEX_COLOR.test(value.trim()) ? value.trim() : DEFAULT_PALETTE[key]
  }
  return { primary: pick("primary"), secondary: pick("secondary"), accent: pick("accent") }
}

/** hex → rgba() string for scrims/overlays (alpha clamped 0..1). */
export function hexToRgba(hex: string, alpha: number): string {
  const safe = HEX_COLOR.test(hex) ? hex : DEFAULT_PALETTE.primary
  let h = safe.slice(1)
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const n = parseInt(h, 16)
  const a = Math.min(1, Math.max(0, alpha))
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export function templateMode(template: PosterTemplateId): PosterMode {
  return template.startsWith("offer") ? "offer" : "greeting"
}
