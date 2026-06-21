/**
 * Server-side menu markup builder. Renders the SAME <MenuRenderer> the editor
 * preview uses into a static HTML string (style + .menu markup) for the PDF
 * pipeline — guaranteeing the printed menu matches the on-screen preview.
 *
 * Server-only (pulls react-dom/server). Imported by the PDF route, never by the
 * client bundle.
 */

import { renderToStaticMarkup } from "react-dom/server"
import { MenuRenderer } from "@/components/menu-engine/menu-renderer"
import { resolveTheme } from "./registry"
import type { MenuThemeState, RenderMenu } from "./types"

/** style + `.menu` markup for a given menu + theme selection. */
export function renderMenuMarkup(menu: RenderMenu, themeState: MenuThemeState | null | undefined): string {
  const theme = resolveTheme(themeState)
  return renderToStaticMarkup(<MenuRenderer menu={menu} theme={theme} />)
}

/**
 * Full standalone HTML document for screenshot/PDF. `fontFaceCss` should be the
 * caller's inlined @font-face block (e.g. from lib/posters/renderer buildFontCss)
 * so Arabic glyphs render without network access.
 */
export function buildMenuDocumentHtml(
  menu: RenderMenu,
  themeState: MenuThemeState | null | undefined,
  opts?: { fontFaceCss?: string; pageWidth?: string }
): string {
  const markup = renderMenuMarkup(menu, themeState)
  const width = opts?.pageWidth ?? "794px" // ~A4 width at 96dpi
  return (
    `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>` +
    `<style>${opts?.fontFaceCss ?? ""}` +
    `*{margin:0;padding:0;box-sizing:border-box}html,body{background:#fff}` +
    `.menu-page{width:${width};margin:0 auto}</style>` +
    `</head><body><div class="menu-page">${markup}</div></body></html>`
  )
}
