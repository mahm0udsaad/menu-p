/**
 * Banner Studio — document model (Phase 5).
 *
 * A banner is a resolution-independent JSON document. Every element is placed
 * with PERCENTAGE coordinates (0..100 of the canvas), and text/sticker sizes
 * are expressed as a percentage of the canvas HEIGHT — so the exact same
 * document renders identically in the live editor (any pixel size) and in the
 * 1920×1080 PNG / PDF export. This is the single-source-of-truth contract that
 * makes the editor truly WYSIWYG.
 *
 * Pure types + constants only — safe to import from client and server.
 */

export type BannerSizeId = "screen-16x9" | "wide-strip" | "standee" | "social-square"

export interface BannerSize {
  id: BannerSizeId
  label: string
  width: number
  height: number
}

/** Authoring + export canvas presets. `screen-16x9` is the default (cashier). */
export const BANNER_SIZES: Record<BannerSizeId, BannerSize> = {
  "screen-16x9": { id: "screen-16x9", label: "شاشة الكاشير (16:9)", width: 1920, height: 1080 },
  "wide-strip": { id: "wide-strip", label: "شريط عريض", width: 2400, height: 600 },
  standee: { id: "standee", label: "ستاند عمودي", width: 1080, height: 1920 },
  "social-square": { id: "social-square", label: "سوشيال (مربع)", width: 1080, height: 1080 },
}

export const DEFAULT_BANNER_SIZE: BannerSizeId = "screen-16x9"

export type ElementType = "text" | "product" | "sticker" | "image"

export interface BaseElement {
  id: string
  type: ElementType
  /** top-left position, percentage of canvas width/height (0..100) */
  x: number
  y: number
  /** box size, percentage of canvas width/height (0..100) */
  w: number
  h: number
  rotation: number
  /** stacking order; higher renders on top */
  z: number
  opacity?: number
  /** when true the element is locked from selection/drag in the editor */
  locked?: boolean
}

export type FontFamily = "Cairo" | "Amiri"
export type TextAlign = "right" | "center" | "left"

export interface TextElement extends BaseElement {
  type: "text"
  text: string
  color: string
  fontFamily: FontFamily
  fontWeight: number
  /** font size as a percentage of canvas height (resolution independent) */
  fontSizePct: number
  align: TextAlign
  /** optional pill/highlight behind the text */
  bg?: string | null
  bgRadiusPct?: number
  shadow?: boolean
}

export type ProductLayout = "card" | "image" | "row"

export interface ProductElement extends BaseElement {
  type: "product"
  productId: string | null
  name: string
  price: number | null
  oldPrice?: number | null
  currency: string
  imageUrl: string | null
  layout: ProductLayout
  color: string
  /** price / discount-badge accent color */
  accent: string
  fontFamily: FontFamily
  fontWeight: number
  fontSizePct: number
  showPrice: boolean
  /** card background; null = transparent */
  bg?: string | null
  radiusPct?: number
}

export interface StickerElement extends BaseElement {
  type: "sticker"
  stickerId: string
  /** tint applied to monochrome SVG stickers (ignored by emoji stickers) */
  color?: string
}

export type ImageFit = "cover" | "contain"

export interface ImageElement extends BaseElement {
  type: "image"
  url: string
  fit: ImageFit
  radiusPct?: number
}

export type BannerElement = TextElement | ProductElement | StickerElement | ImageElement

export type BackgroundType = "solid" | "gradient" | "image"

export interface BannerBackground {
  type: BackgroundType
  color?: string
  gradientFrom?: string
  gradientTo?: string
  /** gradient angle in degrees */
  gradientAngle?: number
  imageUrl?: string | null
  /** rgba scrim painted over an image background for text legibility */
  overlay?: string | null
}

export interface BannerDoc {
  version: 1
  size: BannerSizeId
  background: BannerBackground
  elements: BannerElement[]
}

export const DEFAULT_BACKGROUND: BannerBackground = {
  type: "gradient",
  gradientFrom: "#7f1d1d",
  gradientTo: "#b91c1c",
  gradientAngle: 135,
}

export function emptyBannerDoc(size: BannerSizeId = DEFAULT_BANNER_SIZE): BannerDoc {
  return { version: 1, size, background: { ...DEFAULT_BACKGROUND }, elements: [] }
}

/** Persisted DB row shape (matches the banners table). */
export interface BannerRecord {
  id: string
  restaurant_id: string
  title: string | null
  doc: BannerDoc
  exports: Partial<Record<BannerExportTarget, string>>
  final_image_url: string | null
  status: "draft" | "generating" | "ready" | "failed"
  created_at: string
  updated_at: string
}

export type BannerExportTarget = "png" | "pdf" | "social"

export interface BannerExportPreset {
  target: BannerExportTarget
  label: string
  width: number
  height: number
  format: "png" | "pdf"
}

/**
 * Export presets. PNG + PDF keep the authored 16:9 frame; the social preset
 * fits the 16:9 design centered onto a square canvas (letterboxed) so the
 * banner can be shared online without re-designing.
 */
export const BANNER_EXPORTS: Record<BannerExportTarget, BannerExportPreset> = {
  png: { target: "png", label: "صورة عالية الجودة (PNG)", width: 1920, height: 1080, format: "png" },
  pdf: { target: "pdf", label: "ملف للطباعة (PDF)", width: 1920, height: 1080, format: "pdf" },
  social: { target: "social", label: "نسخة سوشيال / واتساب", width: 1080, height: 1080, format: "png" },
}
