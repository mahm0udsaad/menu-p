/**
 * Browser-based logo color extraction (works for any image format the
 * browser can decode — JPEG/WebP/SVG/PNG): render the logo in a tiny HTML
 * page, downscale onto a 64×64 canvas, read pixels via getImageData and
 * quantize with the same scorer as the pure-TS PNG path.
 *
 * Reuses the repo's battle-tested playwright-core launch flags
 * (lib/playwright/pdf-generator → lib/posters/renderer family).
 */

import { chromium } from "playwright-core"
import { extractBrandColorsFromPixels, type BrandColors } from "./palette"
import { getChromiumArgs, getChromiumExecutablePath } from "@/lib/playwright/chromium"

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--no-first-run",
  "--no-zygote",
  "--disable-extensions",
  "--disable-background-networking",
  "--no-default-browser-check",
]

const SAMPLE_SIZE = 64

export async function extractBrandColorsViaBrowser(
  logoUrl: string,
): Promise<BrandColors | null> {
  const executablePath = await getChromiumExecutablePath()
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null
  try {
    browser = await chromium.launch({
      headless: true,
      timeout: 30000,
      args: getChromiumArgs(LAUNCH_ARGS),
      ...(executablePath ? { executablePath } : {}),
    })
    const context = await browser.newContext({
      viewport: { width: SAMPLE_SIZE, height: SAMPLE_SIZE },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    await page.setContent(
      `<body style="margin:0"><img id="logo" src="${logoUrl.replace(/"/g, "&quot;")}" crossorigin="anonymous"></body>`,
      { waitUntil: "domcontentloaded", timeout: 15000 },
    )
    const pixels = await page.evaluate(async (size: number) => {
      const img = document.getElementById("logo") as HTMLImageElement | null
      if (!img) return null
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve())
          img.addEventListener("error", () => resolve())
          setTimeout(resolve, 8000)
        })
      }
      if (!img.naturalWidth) return null
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) return null
      ctx.drawImage(img, 0, 0, size, size)
      try {
        return Array.from(ctx.getImageData(0, 0, size, size).data)
      } catch {
        return null // tainted canvas (no CORS) — caller falls back
      }
    }, SAMPLE_SIZE)
    if (!pixels || pixels.length !== SAMPLE_SIZE * SAMPLE_SIZE * 4) return null
    return extractBrandColorsFromPixels({
      width: SAMPLE_SIZE,
      height: SAMPLE_SIZE,
      pixels: new Uint8ClampedArray(pixels),
    })
  } catch {
    return null
  } finally {
    await browser?.close().catch(() => {})
  }
}
