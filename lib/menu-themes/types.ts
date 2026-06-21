/**
 * Centralized menu theme engine — types (v1).
 * See docs/MENU-THEME-CONTRACT.md for the full contract.
 *
 * A theme = design tokens (default CSS-variable values) + layout defaults +
 * a CSS stylesheet (authored by the AI designer) that styles the fixed menu
 * DOM. No per-theme React/PDF components exist — one renderer consumes these.
 *
 * Pure types + constants. Safe to import from client and server.
 */

// ── Tokens (mirror the --menu-* CSS variables) ───────────────────────────────

export interface ThemeColorTokens {
  bg: string // --menu-bg (color | gradient | url())
  surface: string // --menu-surface
  ink: string // --menu-ink
  muted: string // --menu-muted
  primary: string // --menu-primary
  accent: string // --menu-accent
  price: string // --menu-price
  divider: string // --menu-divider
}

export interface ThemeTypeTokens {
  fontDisplay: string // --menu-font-display
  fontBody: string // --menu-font-body
  scale: number // --menu-scale
  fsTitle: string // --menu-fs-title
  fsCategory: string // --menu-fs-category
  fsItem: string // --menu-fs-item
  fsDesc: string // --menu-fs-desc
  fsPrice: string // --menu-fs-price
}

export interface ThemeShapeTokens {
  radius: string // --menu-radius
  gapSection: string // --menu-gap-section
  gapItem: string // --menu-gap-item
  pad: string // --menu-pad
}

export interface ThemeTokens {
  color: ThemeColorTokens
  type: ThemeTypeTokens
  shape: ThemeShapeTokens
}

// ── Layout flags (mirror the root data-* attributes) ─────────────────────────

export type ColumnsFlag = 1 | 2 | 3
export type ItemFlag = "row" | "card"
export type OnOff = "on" | "off"
export type DensityFlag = "comfortable" | "compact"

export interface LayoutFlags {
  columns: ColumnsFlag
  item: ItemFlag
  images: OnOff
  dividers: OnOff
  density: DensityFlag
}

export const DEFAULT_LAYOUT: LayoutFlags = {
  columns: 1,
  item: "row",
  images: "on",
  dividers: "on",
  density: "comfortable",
}

// ── Theme definition (registry entry) ────────────────────────────────────────

export interface ThemeDefinition {
  id: string
  name: string
  category: string
  tokens: ThemeTokens
  layoutDefaults: LayoutFlags
  /** Stylesheet authored against the fixed DOM, scoped under `.menu`. */
  css: string
  thumbnail?: string
}

/**
 * Per-restaurant theme selection + live overrides. Stored as `menu_theme`
 * jsonb on `restaurants`. Overrides are sparse — only what the user changed.
 */
export interface MenuThemeState {
  themeId: string
  colors?: Partial<ThemeColorTokens>
  type?: Partial<ThemeTypeTokens>
  shape?: Partial<ThemeShapeTokens>
  layout?: Partial<LayoutFlags>
}

// ── Menu data the renderer consumes (decoupled from DB row shapes) ────────────

export interface RenderMenuItem {
  id: string
  name: string
  description?: string | null
  price?: number | null
  imageUrl?: string | null
}

export interface RenderMenuCategory {
  id: string
  name: string
  description?: string | null
  items: RenderMenuItem[]
}

export interface RenderMenu {
  restaurantName: string
  tagline?: string | null
  logoUrl?: string | null
  currency: string
  footerText?: string | null
  categories: RenderMenuCategory[]
}

// ── Token → CSS-variable mapping ─────────────────────────────────────────────

/** Flattens a (possibly partial) token set into `--menu-*` CSS variables. */
export function tokensToCssVars(tokens: Partial<ThemeTokens> | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!tokens) return out
  const c = tokens.color
  if (c) {
    if (c.bg != null) out["--menu-bg"] = c.bg
    if (c.surface != null) out["--menu-surface"] = c.surface
    if (c.ink != null) out["--menu-ink"] = c.ink
    if (c.muted != null) out["--menu-muted"] = c.muted
    if (c.primary != null) out["--menu-primary"] = c.primary
    if (c.accent != null) out["--menu-accent"] = c.accent
    if (c.price != null) out["--menu-price"] = c.price
    if (c.divider != null) out["--menu-divider"] = c.divider
  }
  const t = tokens.type
  if (t) {
    if (t.fontDisplay != null) out["--menu-font-display"] = t.fontDisplay
    if (t.fontBody != null) out["--menu-font-body"] = t.fontBody
    if (t.scale != null) out["--menu-scale"] = String(t.scale)
    if (t.fsTitle != null) out["--menu-fs-title"] = t.fsTitle
    if (t.fsCategory != null) out["--menu-fs-category"] = t.fsCategory
    if (t.fsItem != null) out["--menu-fs-item"] = t.fsItem
    if (t.fsDesc != null) out["--menu-fs-desc"] = t.fsDesc
    if (t.fsPrice != null) out["--menu-fs-price"] = t.fsPrice
  }
  const s = tokens.shape
  if (s) {
    if (s.radius != null) out["--menu-radius"] = s.radius
    if (s.gapSection != null) out["--menu-gap-section"] = s.gapSection
    if (s.gapItem != null) out["--menu-gap-item"] = s.gapItem
    if (s.pad != null) out["--menu-pad"] = s.pad
  }
  return out
}

/** Deep-merge a theme's default tokens with sparse user overrides. */
export function mergeTokens(base: ThemeTokens, state: MenuThemeState | undefined): ThemeTokens {
  return {
    color: { ...base.color, ...(state?.colors ?? {}) },
    type: { ...base.type, ...(state?.type ?? {}) },
    shape: { ...base.shape, ...(state?.shape ?? {}) },
  }
}

export function mergeLayout(base: LayoutFlags, state: MenuThemeState | undefined): LayoutFlags {
  return { ...base, ...(state?.layout ?? {}) }
}
