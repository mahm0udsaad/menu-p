/**
 * Standalone render check for the Banner Studio export pipeline.
 * Builds a sample BannerDoc, renders it to HTML via the shared renderer, then
 * screenshots it with system Chrome — verifying cqh sizing, stickers, product
 * cards and background without needing Supabase. Run: `bun scripts/banner-render-test.ts`
 */
import { chromium } from "playwright-core"
import { promises as fs } from "fs"
import { renderBannerHtml } from "../lib/banners/render"
import type { BannerDoc } from "../lib/banners/types"

const doc: BannerDoc = {
  version: 1,
  size: "screen-16x9",
  background: { type: "gradient", gradientFrom: "#7f1d1d", gradientTo: "#b91c1c", gradientAngle: 135 },
  elements: [
    { id: "t1", type: "text", x: 6, y: 8, w: 55, h: 18, rotation: 0, z: 2, text: "عروض اليوم", color: "#ffffff", fontFamily: "Cairo", fontWeight: 900, fontSizePct: 13, align: "right", shadow: true },
    { id: "t2", type: "text", x: 6, y: 28, w: 50, h: 10, rotation: 0, z: 2, text: "خصومات تصل إلى ٥٠٪ على مشروباتنا المميزة", color: "#fde68a", fontFamily: "Cairo", fontWeight: 600, fontSizePct: 5, align: "right" },
    { id: "p1", type: "product", x: 8, y: 42, w: 24, h: 50, rotation: 0, z: 3, productId: null, name: "لاتيه مثلج", price: 35, oldPrice: 60, currency: "EGP", imageUrl: "https://picsum.photos/seed/latte/400/400", layout: "card", color: "#ffffff", accent: "#fbbf24", fontFamily: "Cairo", fontWeight: 700, fontSizePct: 3.5, showPrice: true, bg: "rgba(0,0,0,0.3)", radiusPct: 4 },
    { id: "p2", type: "product", x: 36, y: 42, w: 24, h: 50, rotation: 0, z: 3, productId: null, name: "كابتشينو", price: 40, oldPrice: null, currency: "EGP", imageUrl: "https://picsum.photos/seed/capp/400/400", layout: "card", color: "#ffffff", accent: "#fbbf24", fontFamily: "Cairo", fontWeight: 700, fontSizePct: 3.5, showPrice: true, bg: "rgba(0,0,0,0.3)", radiusPct: 4 },
    { id: "s1", type: "sticker", x: 70, y: 10, w: 22, h: 39, rotation: -12, z: 5, stickerId: "starburst", color: "#facc15" },
    { id: "s2", type: "text", x: 72, y: 22, w: 18, h: 14, rotation: -12, z: 6, text: "٥٠٪", color: "#7f1d1d", fontFamily: "Cairo", fontWeight: 900, fontSizePct: 9, align: "center" },
  ],
}

void (async () => {
  const html = renderBannerHtml(doc)
  await fs.writeFile("/tmp/banner-test.html", html)

  const browser = await chromium.launch({ headless: true, channel: "chrome" })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.setContent(html, { waitUntil: "domcontentloaded" })
  await page
    .evaluate(() =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r() })
        )
      )
    )
    .catch(() => {})
  await page.waitForTimeout(500)
  await page.screenshot({ path: "/tmp/banner-test.png", clip: { x: 0, y: 0, width: 1920, height: 1080 } })
  await browser.close()
  console.log("OK wrote /tmp/banner-test.png and /tmp/banner-test.html")
})()
