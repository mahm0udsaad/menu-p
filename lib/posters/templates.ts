/**
 * Poster template registry + HTML shell (Phase 4 — Poster Studio).
 *
 * 4 RTL layouts over an AI art background:
 *   offer-single      hero product + old/new price + discount badge
 *   offer-multi       2-4 product grid
 *   greeting-centered bold occasion + message (no products)
 *   greeting-elegant  Amiri serif, double golden frame
 *
 * Output is a full HTML document sized exactly 1080x1080 (square) or
 * 1080x1920 (story); the renderer screenshots it 1:1. Fonts (Cairo/Amiri)
 * are injected by the renderer as base64 @font-face rules.
 */

import {
  escapeHtml,
  hexToRgba,
  sanitizePalette,
  templateMode,
  type PosterMode,
  type PosterPayload,
  type PosterSize,
  type PosterTemplateId,
} from "./poster-utils"
import { offerMultiBody, offerSingleBody, OFFER_CSS } from "./template-offer"
import { greetingCenteredBody, greetingElegantBody, GREETING_CSS } from "./template-greeting"

export const POSTER_SIZES: Record<PosterSize, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
}

export interface PosterTemplateMeta {
  id: PosterTemplateId
  mode: PosterMode
  label: string
  description: string
}

export const POSTER_TEMPLATES: PosterTemplateMeta[] = [
  { id: "offer-single", mode: "offer", label: "عرض البطل", description: "منتج واحد كبير مع السعر القديم والجديد" },
  { id: "offer-multi", mode: "offer", label: "شبكة العروض", description: "من ٢ إلى ٤ منتجات في شبكة أنيقة" },
  { id: "greeting-centered", mode: "greeting", label: "تهنئة عصرية", description: "نص التهنئة في المنتصف بخط عريض" },
  { id: "greeting-elegant", mode: "greeting", label: "تهنئة كلاسيكية", description: "إطار ذهبي مزخرف بخط أميري" },
]

export interface PosterTemplateInput {
  template: PosterTemplateId
  size: PosterSize
  /** AI art background (public URL or data: URL). */
  artUrl: string
  logoUrl?: string | null
  restaurantName: string
  palette?: unknown
  payload: PosterPayload
}

function bodyFor(input: PosterTemplateInput): string {
  const { template, size, payload } = input
  if (template === "offer-single" && payload.mode === "offer") return offerSingleBody(payload, size)
  if (template === "offer-multi" && payload.mode === "offer") return offerMultiBody(payload, size)
  if (template === "greeting-centered" && payload.mode === "greeting") return greetingCenteredBody(payload, size)
  if (template === "greeting-elegant" && payload.mode === "greeting") return greetingElegantBody(payload, size)
  throw new Error(`Template ${template} does not match payload mode ${payload.mode}`)
}

function brandHtml(input: PosterTemplateInput): string {
  const logo = input.logoUrl
    ? `<img class="brand-logo" src="${escapeHtml(input.logoUrl)}" alt="">`
    : ""
  return `
  <header class="brand">${logo}<span class="brand-name">${escapeHtml(input.restaurantName.trim())}</span></header>`
}

export function renderPosterHtml(input: PosterTemplateInput): string {
  if (templateMode(input.template) !== input.payload.mode) {
    throw new Error(`Template ${input.template} does not match payload mode ${input.payload.mode}`)
  }
  const { width, height } = POSTER_SIZES[input.size]
  const palette = sanitizePalette(input.palette)
  const scrimTop = hexToRgba(palette.primary, 0.82)
  const scrimBottom = hexToRgba(palette.primary, 0.88)

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<style>
  :root {
    --primary: ${palette.primary};
    --secondary: ${palette.secondary};
    --accent: ${palette.accent};
    --accent-deep: ${hexToRgba(palette.accent, 0.85)};
    --primary-soft: ${hexToRgba(palette.primary, 0.12)};
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body { font-family: 'Cairo', 'Noto Kufi Arabic', 'Segoe UI', Tahoma, sans-serif; direction: rtl; }
  .poster { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; background: var(--primary); display: flex; flex-direction: column; }
  .art { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .scrim {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(180deg, ${scrimTop} 0%, ${hexToRgba(palette.primary, 0.28)} 26%,
      ${hexToRgba(palette.primary, 0.18)} 58%, ${scrimBottom} 100%);
  }
  .content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; justify-content: center; gap: 22px; padding: 44px 60px 8px; }
  .brand-logo { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 4px solid var(--accent); background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
  .brand-name { font-size: 52px; font-weight: 800; color: #fff; text-shadow: 0 3px 14px rgba(0,0,0,.55); }
  .footer { display: flex; align-items: center; justify-content: center; padding: 10px 60px 40px; }
  .footer-line { font-size: 30px; font-weight: 600; color: ${hexToRgba(palette.accent, 0.95)}; letter-spacing: 1px; }
  ${OFFER_CSS}
  ${GREETING_CSS}
</style>
</head>
<body>
<div class="poster">
  <img class="art" src="${escapeHtml(input.artUrl)}" alt="">
  <div class="scrim"></div>
  <div class="content">
    ${brandHtml(input)}
    ${bodyFor(input)}
    <footer class="footer"><span class="footer-line">${escapeHtml(input.restaurantName.trim())}</span></footer>
  </div>
</div>
</body>
</html>`
}
