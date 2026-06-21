/**
 * Banner sticker catalog (Phase 5).
 *
 * Stickers are inline SVG (not emoji) so they render identically in the live
 * editor and in headless-Chromium PNG/PDF export — color emoji fonts are not
 * reliably available on the serverless render runtime. Every path uses
 * `currentColor`, so a sticker is tinted by setting `color` on its wrapper.
 */

export type StickerCategory = "badges" | "shapes" | "food" | "decor"

export interface Sticker {
  id: string
  label: string
  category: StickerCategory
  /** SVG inner markup (no <svg> wrapper); authored on a 0 0 100 100 viewBox. */
  body: string
  /** default tint when first dropped */
  defaultColor: string
}

const V = (body: string) => body

export const STICKERS: Sticker[] = [
  // ── Badges ────────────────────────────────────────────────────────────────
  {
    id: "starburst",
    label: "نجمة عرض",
    category: "badges",
    defaultColor: "#f59e0b",
    body: V(
      `<path fill="currentColor" d="M50 2l9 14 16-7-3 17 17 3-12 12 12 12-17 3 3 17-16-7-9 14-9-14-16 7 3-17-17-3 12-12-12-12 17-3-3-17 16 7z"/>`
    ),
  },
  {
    id: "percent-badge",
    label: "نسبة خصم",
    category: "badges",
    defaultColor: "#dc2626",
    body: V(
      `<circle cx="50" cy="50" r="46" fill="currentColor"/><path fill="#fff" d="M34 30a8 8 0 110 16 8 8 0 010-16zm32 24a8 8 0 110 16 8 8 0 010-16zM68 30L32 70l-6-6 36-40z"/>`
    ),
  },
  {
    id: "ribbon",
    label: "شريط",
    category: "badges",
    defaultColor: "#9f1239",
    body: V(
      `<path fill="currentColor" d="M6 28h88v28H6z"/><path fill="currentColor" d="M6 56l-4 16 22-10zM94 56l4 16-22-10z" opacity=".7"/>`
    ),
  },
  {
    id: "new-badge",
    label: "جديد",
    category: "badges",
    defaultColor: "#16a34a",
    body: V(
      `<path fill="currentColor" d="M50 4l12 10 15-3 3 15 13 9-9 13 4 15-15 4-7 14-14-7-14 7-7-14-15-4 4-15-9-13 13-9 3-15 15 3z"/>`
    ),
  },

  // ── Shapes ────────────────────────────────────────────────────────────────
  { id: "circle", label: "دائرة", category: "shapes", defaultColor: "#fbbf24", body: V(`<circle cx="50" cy="50" r="46" fill="currentColor"/>`) },
  { id: "blob", label: "بقعة", category: "shapes", defaultColor: "#f472b6", body: V(`<path fill="currentColor" d="M64 8c18 4 32 18 28 38-4 18 6 30-10 42-15 11-38 8-52-4S8 56 14 38 30 6 48 6c6 0 11 1 16 2z"/>`) },
  { id: "arrow", label: "سهم", category: "shapes", defaultColor: "#0ea5e9", body: V(`<path fill="currentColor" d="M8 40h54V22l30 28-30 28V60H8z"/>`) },
  { id: "sparkle", label: "بريق", category: "decor", defaultColor: "#fde047", body: V(`<path fill="currentColor" d="M50 6c4 22 18 36 40 44-22 8-36 22-40 44-4-22-18-36-40-44 22-8 36-22 40-44z"/>`) },

  // ── Food ──────────────────────────────────────────────────────────────────
  {
    id: "coffee",
    label: "قهوة",
    category: "food",
    defaultColor: "#7c3f1d",
    body: V(
      `<path fill="currentColor" d="M18 34h54v22a22 22 0 01-22 22H40a22 22 0 01-22-22z"/><path fill="none" stroke="currentColor" stroke-width="6" d="M72 40h10a10 10 0 010 20H72"/><path fill="currentColor" d="M30 14c-3 5 0 8 0 12M44 14c-3 5 0 8 0 12M58 14c-3 5 0 8 0 12" opacity=".6"/>`
    ),
  },
  {
    id: "burger",
    label: "برجر",
    category: "food",
    defaultColor: "#b45309",
    body: V(
      `<path fill="currentColor" d="M16 30a34 18 0 0168 0z"/><rect x="14" y="44" width="72" height="12" rx="6" fill="currentColor" opacity=".7"/><path fill="currentColor" d="M16 64h68a0 0 0 010 0 16 16 0 01-16 16H32a16 16 0 01-16-16z"/>`
    ),
  },
  {
    id: "pizza",
    label: "بيتزا",
    category: "food",
    defaultColor: "#dc2626",
    body: V(`<path fill="currentColor" d="M50 8l40 74a4 4 0 01-4 6H14a4 4 0 01-4-6z"/><circle cx="42" cy="50" r="6" fill="#fff"/><circle cx="58" cy="64" r="6" fill="#fff"/><circle cx="50" cy="36" r="5" fill="#fff"/>`),
  },
  {
    id: "fire",
    label: "نار / حار",
    category: "food",
    defaultColor: "#f97316",
    body: V(`<path fill="currentColor" d="M52 4c2 16-10 20-10 34 0 6-6 6-8 0-2 8-10 14-10 26a28 28 0 0056 0c0-24-18-30-18-44 0-8 0-12-2-16z"/>`),
  },

  // ── Decor ─────────────────────────────────────────────────────────────────
  { id: "heart", label: "قلب", category: "decor", defaultColor: "#e11d48", body: V(`<path fill="currentColor" d="M50 86L18 54a20 20 0 0132-24 20 20 0 0132 24z"/>`) },
  { id: "crown", label: "تاج", category: "decor", defaultColor: "#eab308", body: V(`<path fill="currentColor" d="M10 78V34l20 16L50 22l20 28 20-16v44z"/>`) },
  { id: "star", label: "نجمة", category: "decor", defaultColor: "#facc15", body: V(`<path fill="currentColor" d="M50 6l13 27 30 4-22 21 5 30-26-14-26 14 5-30-22-21 30-4z"/>`) },
  { id: "leaf", label: "ورقة", category: "decor", defaultColor: "#22c55e", body: V(`<path fill="currentColor" d="M88 10C40 10 12 38 12 78c0 0 8 8 18 8 40 0 58-40 58-76zM30 80C44 50 64 34 84 24" stroke="#fff" stroke-width="0"/>`) },
]

export const STICKER_CATEGORIES: Array<{ id: StickerCategory; label: string }> = [
  { id: "badges", label: "شارات" },
  { id: "shapes", label: "أشكال" },
  { id: "food", label: "طعام" },
  { id: "decor", label: "زينة" },
]

const STICKER_MAP = new Map(STICKERS.map((s) => [s.id, s]))

export function getSticker(id: string): Sticker | undefined {
  return STICKER_MAP.get(id)
}

/** Full <svg> markup for a sticker, sized to fill its box. */
export function stickerSvg(id: string): string {
  const sticker = STICKER_MAP.get(id)
  if (!sticker) return ""
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${sticker.body}</svg>`
}
