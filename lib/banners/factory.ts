/**
 * Banner element factories (Phase 5). Used by the editor to drop new elements
 * onto the canvas with sensible defaults, placed near the center.
 */

import { getSticker } from "./stickers"
import type {
  BannerElement,
  ImageElement,
  ProductElement,
  StickerElement,
  TextElement,
} from "./types"

let counter = 0
function uid(prefix: string): string {
  counter += 1
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.abs(Math.floor((Date.now() % 1e9) + counter)).toString(36)
  return `${prefix}_${rand}`
}

/** Highest z in a list (so new elements land on top). */
export function topZ(elements: BannerElement[]): number {
  return elements.reduce((max, el) => Math.max(max, el.z ?? 0), 0) + 1
}

export function makeText(z: number, overrides: Partial<TextElement> = {}): TextElement {
  return {
    id: uid("txt"),
    type: "text",
    x: 25,
    y: 20,
    w: 50,
    h: 16,
    rotation: 0,
    z,
    text: "اكتب هنا",
    color: "#ffffff",
    fontFamily: "Cairo",
    fontWeight: 800,
    fontSizePct: 9,
    align: "center",
    shadow: true,
    ...overrides,
  }
}

export function makeProduct(z: number, overrides: Partial<ProductElement> = {}): ProductElement {
  return {
    id: uid("prd"),
    type: "product",
    x: 36,
    y: 32,
    w: 28,
    h: 50,
    rotation: 0,
    z,
    productId: null,
    name: "اسم المنتج",
    price: null,
    oldPrice: null,
    currency: "EGP",
    imageUrl: null,
    layout: "card",
    color: "#ffffff",
    accent: "#fbbf24",
    fontFamily: "Cairo",
    fontWeight: 700,
    fontSizePct: 4,
    showPrice: true,
    bg: "rgba(0,0,0,0.28)",
    radiusPct: 4,
    ...overrides,
  }
}

export function makeSticker(z: number, stickerId: string, overrides: Partial<StickerElement> = {}): StickerElement {
  const sticker = getSticker(stickerId)
  return {
    id: uid("stk"),
    type: "sticker",
    x: 42,
    y: 38,
    w: 16,
    h: 16 * (16 / 9), // keep roughly square on a 16:9 canvas (w% wider than h%)
    rotation: 0,
    z,
    stickerId,
    color: sticker?.defaultColor ?? "#f59e0b",
    ...overrides,
  }
}

export function makeImage(z: number, url: string, overrides: Partial<ImageElement> = {}): ImageElement {
  return {
    id: uid("img"),
    type: "image",
    x: 38,
    y: 30,
    w: 24,
    h: 42,
    rotation: 0,
    z,
    url,
    fit: "cover",
    radiusPct: 3,
    ...overrides,
  }
}
