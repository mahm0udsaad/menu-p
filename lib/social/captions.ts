/**
 * Auto-caption builder — pure, unit-testable Arabic caption composition
 * from a PostTarget. Pre-fills the composer textarea; the owner can edit.
 */

import { discountBadgeText, formatPrice } from "../posters/poster-utils"
import type { PostTarget, PosterCaptionData } from "./types"

const HASHTAGS: Record<string, string> = {
  menu: "#منيو #مطاعم #قائمة_الطعام",
  menu_page: "#منيو #مطاعم",
  poster_offer: "#عروض #خصومات #مطاعم",
  poster_greeting: "#تهنئة #مطاعم",
  qr_code: "#منيو #QR",
}

function offerLines(data: PosterCaptionData): string[] {
  const lines: string[] = []
  const products = data.products ?? []
  for (const product of products.slice(0, 4)) {
    const price = formatPrice(product.newPrice, data.currency)
    const badge = discountBadgeText(product.oldPrice, product.newPrice)
    if (badge && product.oldPrice != null) {
      lines.push(`✨ ${product.name} — ${price} بدلاً من ${formatPrice(product.oldPrice, data.currency)} (${badge})`)
    } else {
      lines.push(`✨ ${product.name} — ${price}`)
    }
  }
  return lines
}

function posterCaption(restaurantName: string, data: PosterCaptionData, link?: string | null): string {
  if (data.kind === "offer") {
    const headline = data.headline?.trim() || data.title?.trim() || "عرض خاص لفترة محدودة!"
    const parts = [`🔥 ${headline}`, "", ...offerLines(data)]
    parts.push("", `زورونا في ${restaurantName} 🍽️`)
    if (link) parts.push(`القائمة الكاملة: ${link}`)
    parts.push("", HASHTAGS.poster_offer)
    return parts.join("\n")
  }
  const occasion = data.occasion?.trim() ?? ""
  const message = data.message?.trim() || data.title?.trim() || ""
  const parts = [occasion ? `🌙 بمناسبة ${occasion}` : "🌙 تهنئة من القلب", "", message]
  parts.push("", `مع أطيب التمنيات — ${restaurantName} ❤️`, "", HASHTAGS.poster_greeting)
  return parts.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n")
}

/** Build a ready-to-edit Arabic caption for any publishable target. */
export function buildAutoCaption(target: PostTarget): string {
  switch (target.kind) {
    case "menu":
      return [
        `📖 قائمة ${target.restaurantName} كاملة بين يديكم!`,
        "",
        `تصفحوا «${target.menuName}» بكل الأصناف والأسعار من الرابط:`,
        target.link,
        "",
        "أو امسحوا الكود في الصورة 📱",
        "",
        HASHTAGS.menu,
      ].join("\n")
    case "menu_page":
      return [
        `🍽️ نظرة على قائمة ${target.restaurantName}`,
        "",
        `«${target.menuName}» — القائمة الكاملة هنا:`,
        target.link,
        "",
        HASHTAGS.menu_page,
      ].join("\n")
    case "qr_code":
      return [
        `📱 امسحوا الكود وتصفحوا قائمة ${target.restaurantName}!`,
        "",
        `«${target.menuName}» — بدون تحميل، مباشرة من المتصفح:`,
        target.link,
        "",
        HASHTAGS.qr_code,
      ].join("\n")
    case "poster":
      return posterCaption(target.restaurantName, target.data, target.link)
  }
}

/** TikTok photo titles are capped at 90 chars — derive one from the caption. */
export function captionTitle(caption: string, maxLength: number = 90): string {
  const firstLine = caption.split("\n").find((line) => line.trim().length > 0)?.trim() ?? ""
  return firstLine.length <= maxLength ? firstLine : `${firstLine.slice(0, maxLength - 1)}…`
}
