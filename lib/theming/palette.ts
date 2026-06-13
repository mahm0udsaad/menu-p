/**
 * Logo/brand palette extraction + WCAG-aware palette building.
 *
 * Pure TypeScript (no native deps): PNG logos are decoded with the minimal
 * decoder in ./png; other formats simply return null and the caller falls
 * back to `restaurants.color_palette` (the primary source of truth).
 */

import { decodePng, isPng, type DecodedImage } from "./png"

export interface BrandColors {
  primary: string
  secondary?: string | null
  accent?: string | null
}

export interface MenuPalette {
  primary: string
  secondary: string
  accent: string
  bg: string
  text: string
  onPrimary: string
}

interface Rgb {
  r: number
  g: number
  b: number
}

// ---------------------------------------------------------------------------
// Color math (relative luminance / contrast per WCAG 2.1)
// ---------------------------------------------------------------------------

export function normalizeHex(input: string | null | undefined): string | null {
  if (typeof input !== "string") return null
  const value = input.trim().replace(/^#/, "")
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return (
      "#" +
      value
        .split("")
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    )
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) return "#" + value.toLowerCase()
  return null
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex) ?? "#000000"
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")
  return `#${c(r)}${c(g)}${c(b)}`
}

/** WCAG relative luminance, 0 (black) .. 1 (white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio, 1 .. 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Linear mix of two colors; t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const clamped = Math.max(0, Math.min(1, t))
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * clamped,
    g: ca.g + (cb.g - ca.g) * clamped,
    b: ca.b + (cb.b - ca.b) * clamped,
  })
}

export const tint = (hex: string, t: number): string => mix(hex, "#ffffff", t)
export const shade = (hex: string, t: number): string => mix(hex, "#000000", t)

function saturationOf({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return 0
  return (max - min) / max
}

function hueOf({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  let h = 0
  if (max === r) h = (g - b) / (max - min)
  else if (max === g) h = 2 + (b - r) / (max - min)
  else h = 4 + (r - g) / (max - min)
  h *= 60
  return h < 0 ? h + 360 : h
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/**
 * Nudge `fg` toward black or white (whichever fights the background) until it
 * reaches `minRatio` contrast against `bg`. Pure + deterministic.
 */
export function ensureContrast(fg: string, bg: string, minRatio: number): string {
  let current = normalizeHex(fg) ?? "#000000"
  if (contrastRatio(current, bg) >= minRatio) return current
  // Push toward whichever pole can actually reach the ratio (mid-luminance
  // backgrounds like #777 max out below 4.5 against white but not black).
  const target =
    contrastRatio("#000000", bg) >= contrastRatio("#ffffff", bg) ? "#000000" : "#ffffff"
  for (let i = 0; i < 24; i++) {
    current = mix(current, target, 0.12)
    if (contrastRatio(current, bg) >= minRatio) return current
  }
  return target
}

/** Best readable text color on `bg` (black or white, contrast-adjusted). */
export function bestTextOn(bg: string, minRatio = 4.5): string {
  const black = contrastRatio("#111111", bg)
  const white = contrastRatio("#ffffff", bg)
  return ensureContrast(black >= white ? "#111111" : "#ffffff", bg, minRatio)
}

// ---------------------------------------------------------------------------
// Palette building (brand colors → full WCAG-AA menu palette)
// ---------------------------------------------------------------------------

/** Menu-P rose — used only when a restaurant has no brand colors at all. */
export const DEFAULT_BRAND: BrandColors = {
  primary: "#9f1239",
  secondary: "#1f2937",
  accent: "#d97706",
}

export function buildThemePalette(brand?: BrandColors | null): MenuPalette {
  const primaryIn = normalizeHex(brand?.primary) ?? DEFAULT_BRAND.primary
  // A washed-out "primary" (near-white logo backgrounds) makes a useless
  // brand color — deepen it before deriving anything else.
  const primarySeed =
    relativeLuminance(primaryIn) > 0.82 ? shade(primaryIn, 0.55) : primaryIn

  const bg = tint(primarySeed, 0.94)
  const primary = ensureContrast(primarySeed, bg, 3)
  const secondary = ensureContrast(
    normalizeHex(brand?.secondary) ?? shade(primary, 0.35),
    bg,
    3,
  )
  const accent = ensureContrast(
    normalizeHex(brand?.accent) ?? mix(primary, "#d97706", 0.5),
    bg,
    3,
  )
  const text = ensureContrast(mix(primary, "#111827", 0.85), bg, 7)
  const onPrimary = bestTextOn(primary, 4.5)

  return { primary, secondary, accent, bg, text, onPrimary }
}

// ---------------------------------------------------------------------------
// Dominant-color extraction from a decoded image
// ---------------------------------------------------------------------------

interface Bucket extends Rgb {
  count: number
  score: number
}

export function extractBrandColorsFromPixels(image: DecodedImage): BrandColors | null {
  const { width, height, pixels } = image
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 4096)))
  const buckets = new Map<number, { r: number; g: number; b: number; count: number }>()

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      const a = pixels[i + 3]
      if (a < 125) continue // transparent logo padding
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const lum = relativeLuminance(rgbToHex({ r, g, b }))
      if (lum > 0.92 || lum < 0.02) continue // paper white / pure black
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
      const bucket = buckets.get(key)
      if (bucket) {
        bucket.r += r
        bucket.g += g
        bucket.b += b
        bucket.count++
      } else {
        buckets.set(key, { r, g, b, count: 1 })
      }
    }
  }
  if (buckets.size === 0) return null

  const candidates: Bucket[] = []
  for (const bucket of buckets.values()) {
    const r = bucket.r / bucket.count
    const g = bucket.g / bucket.count
    const b = bucket.b / bucket.count
    const sat = saturationOf({ r, g, b })
    candidates.push({ r, g, b, count: bucket.count, score: bucket.count * (0.15 + sat) })
  }
  candidates.sort((a, b) => b.score - a.score)

  const primary = candidates[0]
  const primaryHue = hueOf(primary)
  const primaryLum = relativeLuminance(rgbToHex(primary))
  const distinct = candidates.find((c) => {
    if (c === primary) return false
    const hueDelta = hueDistance(hueOf(c), primaryHue)
    const lumDelta = Math.abs(relativeLuminance(rgbToHex(c)) - primaryLum)
    return hueDelta > 30 || lumDelta > 0.25
  })

  const primaryHex = rgbToHex(primary)
  return {
    primary: primaryHex,
    secondary: distinct ? rgbToHex(distinct) : shade(primaryHex, 0.35),
    accent: distinct ? rgbToHex(distinct) : tint(primaryHex, 0.25),
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Fetch a logo and extract its dominant brand colors.
 *
 * PNG logos are decoded in pure TS. Anything else (JPEG/WebP/SVG, fetch
 * failures, oversized files) returns null — callers must fall back to
 * `restaurants.color_palette`, which remains the primary source of truth.
 */
export async function extractPaletteFromLogo(logoUrl: string): Promise<BrandColors | null> {
  try {
    const res = await fetch(logoUrl, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return null
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (bytes.byteLength > 6 * 1024 * 1024) return null
    if (!isPng(bytes)) return null
    return extractBrandColorsFromPixels(decodePng(bytes))
  } catch {
    return null
  }
}
