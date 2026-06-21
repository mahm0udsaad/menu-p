/**
 * Render check for the centralized menu engine. Renders a sample menu through
 * the real MenuRenderer (the same component the editor + PDF use) and
 * screenshots it for two layouts. Run: `bun scripts/menu-render-test.tsx`
 */
import { chromium } from "playwright-core"
import { promises as fs } from "fs"
import { buildMenuDocumentHtml } from "../lib/menu-themes/render-html"
import type { RenderMenu, MenuThemeState } from "../lib/menu-themes/types"

const menu: RenderMenu = {
  restaurantName: "مقهى الأصيل",
  tagline: "قهوة مختصة ومأكولات طازجة",
  logoUrl: null,
  currency: "EGP",
  footerText: "شكراً لزيارتكم — تابعونا @alaseel",
  categories: [
    {
      id: "c1",
      name: "المشروبات الساخنة",
      description: "محمصة يومياً",
      items: [
        { id: "i1", name: "إسبريسو", description: "جرعة مزدوجة", price: 30, imageUrl: "https://picsum.photos/seed/esp/200" },
        { id: "i2", name: "كابتشينو", description: "حليب مخفوق كريمي", price: 45, imageUrl: null },
        { id: "i3", name: "لاتيه", description: null, price: 50, imageUrl: null },
      ],
    },
    {
      id: "c2",
      name: "الحلويات",
      description: null,
      items: [
        { id: "i4", name: "تشيز كيك", description: "بصلصة التوت", price: 60, imageUrl: null },
        { id: "i5", name: "براوني", description: "شوكولاتة داكنة", price: 40, imageUrl: null },
      ],
    },
  ],
}

async function shoot(name: string, state: MenuThemeState, width: number) {
  const html = buildMenuDocumentHtml(menu, state, { pageWidth: `${width}px` })
  await fs.writeFile(`/tmp/${name}.html`, html)
  const browser = await chromium.launch({ headless: true, channel: "chrome" })
  const page = await browser.newPage({ viewport: { width: width + 40, height: 900 } })
  await page.setContent(html, { waitUntil: "domcontentloaded" })
  await page.evaluate(() => Promise.all(Array.from(document.images).map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = () => r(0) }))))).catch(() => {})
  await page.waitForTimeout(300)
  await page.screenshot({ path: `/tmp/${name}.png`, fullPage: true })
  await browser.close()
  console.log(`wrote /tmp/${name}.png`)
}

void (async () => {
  await shoot("menu-row", { themeId: "base" }, 794)
  await shoot("menu-cards-2col", { themeId: "base", layout: { columns: 2, item: "card" } as any }, 794)
  console.log("done")
})()
