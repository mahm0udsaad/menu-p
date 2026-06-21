/**
 * Banner renderer (Phase 5) — the WYSIWYG contract.
 *
 * `wrapperStyle()` + `innerHtml()` are the single source of truth for how an
 * element looks. The live editor renders each element as
 *   <div style={wrapperStyle(el)} dangerouslySetInnerHTML={innerHtml(el)} />
 * and the PNG/PDF export builds the identical string via `renderBannerHtml()`.
 * Because both paths call the same two functions, the editor preview and the
 * exported image cannot drift.
 *
 * Sizing is resolution-independent: positions are percentages of the canvas,
 * and font / radius sizes use container-query height units (`cqh`, 1% of the
 * canvas height). The canvas sets `container-type: size`, so a document looks
 * the same at 600px wide in the editor and at 1920px in the export.
 *
 * Pure + isomorphic — no server-only imports. Safe in client and server.
 */

import { escapeHtml, formatPrice } from "@/lib/posters/poster-utils"
import { stickerSvg } from "./stickers"
import { BANNER_SIZES, type BannerBackground, type BannerDoc, type BannerElement } from "./types"

type Style = Record<string, string | number>

const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const safeColor = (c: string | null | undefined, fallback: string): string =>
  typeof c === "string" && (HEX.test(c.trim()) || /^rgba?\([^)]*\)$/.test(c.trim())) ? c.trim() : fallback
/** A user image URL is interpolated into CSS/HTML — allow http(s)/data only. */
const safeUrl = (u: string | null | undefined): string | null =>
  typeof u === "string" && /^(https?:|data:image\/)/i.test(u.trim()) ? u.trim().replace(/['"\\]/g, "") : null

const camelToKebab = (k: string): string => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())

/** camelCase CSSProperties-like object → inline CSS string. */
export function serializeStyle(style: Style): string {
  return Object.entries(style)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `${camelToKebab(k)}:${v}`)
    .join(";")
}

// ── Background ───────────────────────────────────────────────────────────────

export function backgroundStyle(bg: BannerBackground): Style {
  if (bg.type === "solid") {
    return { backgroundColor: safeColor(bg.color, "#7f1d1d") }
  }
  if (bg.type === "gradient") {
    const from = safeColor(bg.gradientFrom, "#7f1d1d")
    const to = safeColor(bg.gradientTo, "#b91c1c")
    const angle = Number.isFinite(bg.gradientAngle) ? bg.gradientAngle : 135
    return { backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` }
  }
  const url = safeUrl(bg.imageUrl)
  if (!url) return { backgroundColor: "#1f2937" }
  const overlay = bg.overlay ? safeColor(bg.overlay, "rgba(0,0,0,0.35)") : null
  const layers = overlay ? `linear-gradient(${overlay}, ${overlay}), url('${url}')` : `url('${url}')`
  return { backgroundImage: layers, backgroundSize: "cover", backgroundPosition: "center" }
}

// ── Element geometry (position/size) vs visual (look) ────────────────────────
// Export uses the merged `wrapperStyle` on one div. The editor splits them: the
// draggable frame gets `geometryStyle`, the inner content gets `visualStyle`.
// Both paths share these functions, so the preview and export never drift.

export function geometryStyle(el: BannerElement): Style {
  return {
    position: "absolute",
    left: `${el.x}%`,
    top: `${el.y}%`,
    width: `${el.w}%`,
    height: `${el.h}%`,
    transform: `rotate(${el.rotation || 0}deg)`,
    transformOrigin: "center center",
    zIndex: el.z ?? 1,
    opacity: el.opacity ?? 1,
  }
}

export function visualStyle(el: BannerElement): Style {
  if (el.type === "text") {
    const justify = el.align === "center" ? "center" : el.align === "left" ? "flex-start" : "flex-end"
    const style: Style = {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: justify,
      textAlign: el.align,
      color: safeColor(el.color, "#ffffff"),
      fontFamily: `'${el.fontFamily}', 'Cairo', sans-serif`,
      fontWeight: el.fontWeight ?? 700,
      fontSize: `${el.fontSizePct}cqh`,
      lineHeight: 1.25,
    }
    if (el.bg) {
      style.backgroundColor = safeColor(el.bg, "#000000")
      style.borderRadius = `${el.bgRadiusPct ?? 2}cqh`
      style.padding = "0.3em 0.7em"
    }
    if (el.shadow) style.textShadow = "0 0.4cqh 1.2cqh rgba(0,0,0,0.45)"
    return style
  }

  if (el.type === "product") {
    const style: Style = {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: el.layout === "row" ? "row" : "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5em",
      color: safeColor(el.color, "#ffffff"),
      fontFamily: `'${el.fontFamily}', 'Cairo', sans-serif`,
      fontWeight: el.fontWeight ?? 700,
      fontSize: `${el.fontSizePct}cqh`,
      textAlign: "center",
    }
    if (el.bg) {
      style.backgroundColor = safeColor(el.bg, "#000000")
      style.borderRadius = `${el.radiusPct ?? 3}cqh`
      style.padding = "1em"
    }
    return style
  }

  if (el.type === "sticker") {
    return { width: "100%", height: "100%", color: safeColor(el.color, "#f59e0b"), display: "block" }
  }

  // image
  return { width: "100%", height: "100%", overflow: "hidden", borderRadius: `${el.radiusPct ?? 0}cqh` }
}

/** Merged style for single-div export rendering. */
export function wrapperStyle(el: BannerElement): Style {
  return { ...geometryStyle(el), ...visualStyle(el), width: `${el.w}%`, height: `${el.h}%` }
}

// ── Element inner content (HTML string) ──────────────────────────────────────

export function innerHtml(el: BannerElement): string {
  if (el.type === "text") {
    return escapeHtml(el.text || "").replace(/\n/g, "<br>")
  }

  if (el.type === "product") {
    const name = escapeHtml(el.name || "")
    const accent = safeColor(el.accent, "#fbbf24")
    const img = safeUrl(el.imageUrl)
    const imgBox =
      el.layout === "image"
        ? "width:100%;height:100%"
        : el.layout === "row"
          ? "width:38%;align-self:stretch;min-height:0"
          : "width:100%;flex:1 1 auto;min-height:0"
    const imgHtml = img
      ? `<div style="${imgBox};background-image:url('${img}');background-size:cover;background-position:center;border-radius:3cqh"></div>`
      : ""

    if (el.layout === "image") return imgHtml

    let priceHtml = ""
    if (el.showPrice && el.price != null) {
      const main = `<span style="color:${accent};font-weight:800">${escapeHtml(formatPrice(el.price, el.currency))}</span>`
      const old =
        el.oldPrice != null && el.oldPrice > (el.price ?? 0)
          ? `<span style="text-decoration:line-through;opacity:.55;font-size:.72em;margin-inline-start:.45em">${escapeHtml(formatPrice(el.oldPrice, el.currency))}</span>`
          : ""
      priceHtml = `<div style="font-size:1.05em;line-height:1.1">${main}${old}</div>`
    }
    const text = `<div style="display:flex;flex-direction:column;gap:.15em;justify-content:center;${el.layout === "row" ? "flex:1 1 auto;text-align:start" : ""}"><div style="line-height:1.15">${name}</div>${priceHtml}</div>`

    return el.layout === "row" ? `${imgHtml}${text}` : `${imgHtml}${text}`
  }

  if (el.type === "sticker") {
    return stickerSvg(el.stickerId)
  }

  // image
  const url = safeUrl(el.url)
  if (!url) return ""
  const size = el.fit === "contain" ? "contain" : "cover"
  return `<div style="width:100%;height:100%;background-image:url('${url}');background-size:${size};background-position:center;background-repeat:no-repeat"></div>`
}

// ── Full document → HTML (for screenshot/PDF) ────────────────────────────────

export function renderBannerHtml(doc: BannerDoc): string {
  const { width, height } = BANNER_SIZES[doc.size] ?? BANNER_SIZES["screen-16x9"]
  const elements = [...(doc.elements ?? [])].sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
  const elementsHtml = elements
    .map((el) => `<div style="${serializeStyle(wrapperStyle(el))}">${innerHtml(el)}</div>`)
    .join("")
  const canvasStyle = serializeStyle({
    position: "relative",
    width: `${width}px`,
    height: `${height}px`,
    containerType: "size",
    overflow: "hidden",
    ...backgroundStyle(doc.background),
  })
  return (
    `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>` +
    `<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:${width}px;height:${height}px;overflow:hidden;background:#fff}</style>` +
    `</head><body><div style="${canvasStyle}">${elementsHtml}</div></body></html>`
  )
}

/**
 * Social/letterbox variant: paint the authored 16:9 (or any) canvas centered
 * onto a target-size frame so the design can be shared without re-layout.
 */
export function renderBannerHtmlFramed(doc: BannerDoc, targetW: number, targetH: number, frameColor = "#111827"): string {
  const { width, height } = BANNER_SIZES[doc.size] ?? BANNER_SIZES["screen-16x9"]
  const scale = Math.min(targetW / width, targetH / height)
  const inner = renderBannerHtml(doc)
    // strip the inner document chrome — keep just the canvas div
    .replace(/^[\s\S]*<body>/, "")
    .replace(/<\/body>[\s\S]*$/, "")
  return (
    `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>` +
    `<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:${targetW}px;height:${targetH}px;overflow:hidden}` +
    `.frame{width:${targetW}px;height:${targetH}px;display:flex;align-items:center;justify-content:center;background:${frameColor}}` +
    `.scaler{transform:scale(${scale});transform-origin:center center}</style>` +
    `</head><body><div class="frame"><div class="scaler">${inner}</div></div></body></html>`
  )
}
