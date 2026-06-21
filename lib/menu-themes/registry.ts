/**
 * Central menu-theme registry — the single source of truth for themes.
 *
 * Adding a theme = drop a ThemeDefinition here (tokens + layoutDefaults + the
 * designer's css). No per-theme React component, no PDF component, no metadata
 * JSON, no editor switch statement — so "ghost themes" (selectable but not
 * rendered) become structurally impossible.
 */

import type { LayoutFlags, MenuThemeState, ThemeDefinition, ThemeTokens } from "./types"
import { mergeLayout, mergeTokens } from "./types"
import { BASE_THEME } from "./themes/base"

// Register designer-authored themes by adding them to this array.
const THEME_LIST: ThemeDefinition[] = [BASE_THEME]

const THEMES = new Map<string, ThemeDefinition>(THEME_LIST.map((t) => [t.id, t]))

export const DEFAULT_THEME_ID = BASE_THEME.id

export function listThemes(): ThemeDefinition[] {
  return THEME_LIST
}

export function getTheme(id: string | null | undefined): ThemeDefinition {
  return (id && THEMES.get(id)) || BASE_THEME
}

export function themeExists(id: string | null | undefined): boolean {
  return !!id && THEMES.has(id)
}

/** Resolve a per-restaurant selection into concrete tokens + layout + css. */
export interface ResolvedTheme {
  id: string
  css: string
  tokens: ThemeTokens
  layout: LayoutFlags
}

export function resolveTheme(state: MenuThemeState | null | undefined): ResolvedTheme {
  const theme = getTheme(state?.themeId)
  return {
    id: theme.id,
    css: theme.css,
    tokens: mergeTokens(theme.tokens, state ?? undefined),
    layout: mergeLayout(theme.layoutDefaults, state ?? undefined),
  }
}
