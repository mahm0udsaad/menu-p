/**
 * Menu theming — merges the restaurant brand palette with menu
 * customizations into CSS custom properties for the public menu.
 *
 * Priority of brand colors:
 *   1. `restaurants.color_palette` (jsonb — primary source of truth)
 *   2. dominant colors extracted from the logo (PNG only, best effort)
 *   3. Menu-P default rose
 */

import {
  buildThemePalette,
  extractPaletteFromLogo,
  mix,
  normalizeHex,
  type BrandColors,
  type MenuPalette,
} from "./palette"

export interface RestaurantBrandSource {
  name?: string | null
  logo_url?: string | null
  color_palette?: {
    primary?: string | null
    secondary?: string | null
    accent?: string | null
  } | null
}

export interface MenuCustomizationsSource {
  font_settings?: {
    arabic?: { font?: string | null; weight?: string | null } | null
    english?: { font?: string | null; weight?: string | null } | null
  } | null
}

export interface MenuTheme {
  palette: MenuPalette
  fontArabic: string
  fontLatin: string
  headingWeight: string
  /** `--menu-*` declarations, ready to drop into a scoped style block. */
  cssVars: string
}

// Maps font ids stored in menu_customizations.font_settings to CSS stacks.
// The root layout loads Almarai via next/font (--font-ibm-plex-sans-arabic),
// so it is always a safe fallback.
const ARABIC_FONTS: Record<string, string> = {
  cairo: "'Cairo'",
  almarai: "'Almarai'",
  amiri: "'Amiri'",
  "noto-kufi": "'Noto Kufi Arabic'",
  notoKufi: "'Noto Kufi Arabic'",
}

const LATIN_FONTS: Record<string, string> = {
  roboto: "'Roboto'",
  "open-sans": "'Open Sans'",
  openSans: "'Open Sans'",
  cairo: "'Cairo'",
}

const ARABIC_FALLBACK = "var(--font-ibm-plex-sans-arabic, 'Almarai'), 'Segoe UI', sans-serif"
const LATIN_FALLBACK = "system-ui, 'Segoe UI', sans-serif"

function resolveFont(
  id: string | null | undefined,
  table: Record<string, string>,
  fallback: string,
): string {
  if (id && table[id]) return `${table[id]}, ${fallback}`
  return fallback
}

export function brandColorsFromRestaurant(
  restaurant: RestaurantBrandSource,
): BrandColors | null {
  const primary = normalizeHex(restaurant.color_palette?.primary)
  if (!primary) return null
  return {
    primary,
    secondary: normalizeHex(restaurant.color_palette?.secondary),
    accent: normalizeHex(restaurant.color_palette?.accent),
  }
}

/**
 * Pure builder (unit-testable): brand + customizations → theme.
 * `extracted` is the optional logo-extraction result used only when the
 * restaurant has no stored color_palette.
 */
export function buildMenuTheme(
  restaurant: RestaurantBrandSource,
  customizations?: MenuCustomizationsSource | null,
  extracted?: BrandColors | null,
): MenuTheme {
  const brand = brandColorsFromRestaurant(restaurant) ?? extracted ?? null
  const palette = buildThemePalette(brand)

  const fonts = customizations?.font_settings
  const fontArabic = resolveFont(fonts?.arabic?.font, ARABIC_FONTS, ARABIC_FALLBACK)
  const fontLatin = resolveFont(fonts?.english?.font, LATIN_FONTS, LATIN_FALLBACK)
  const headingWeight = fonts?.arabic?.weight === "bold" ? "800" : "700"

  const muted = mix(palette.text, palette.bg, 0.38)
  const border = mix(palette.primary, palette.bg, 0.82)
  const card = mix(palette.bg, "#ffffff", 0.65)

  const cssVars = [
    `--menu-primary:${palette.primary}`,
    `--menu-secondary:${palette.secondary}`,
    `--menu-accent:${palette.accent}`,
    `--menu-bg:${palette.bg}`,
    `--menu-text:${palette.text}`,
    `--menu-on-primary:${palette.onPrimary}`,
    `--menu-muted:${muted}`,
    `--menu-border:${border}`,
    `--menu-card:${card}`,
    `--menu-font-ar:${fontArabic}`,
    `--menu-font-latin:${fontLatin}`,
    `--menu-heading-weight:${headingWeight}`,
  ].join(";")

  return { palette, fontArabic, fontLatin, headingWeight, cssVars }
}

/**
 * Server entry point: resolves brand colors (color_palette first, logo
 * extraction as enhancement when the palette is empty) and builds the theme.
 * Never throws — worst case is the default Menu-P palette.
 */
export async function resolveMenuTheme(
  restaurant: RestaurantBrandSource,
  customizations?: MenuCustomizationsSource | null,
): Promise<MenuTheme> {
  let extracted: BrandColors | null = null
  if (!brandColorsFromRestaurant(restaurant) && restaurant.logo_url) {
    extracted = await extractPaletteFromLogo(restaurant.logo_url)
  }
  return buildMenuTheme(restaurant, customizations, extracted)
}
