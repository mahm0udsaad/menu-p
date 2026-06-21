/**
 * Banner export (Phase 5) — turns a BannerDoc into a PNG or print-ready PDF
 * buffer via headless Chromium. PNG reuses the poster screenshot renderer;
 * PDF uses page.pdf() at the exact banner dimensions (no page margins, so the
 * artwork bleeds edge to edge for printing).
 */

import { chromium } from "playwright-core"
import { getChromiumArgs, getChromiumExecutablePath } from "@/lib/playwright/chromium"
import { renderPosterPng, buildFontCss } from "@/lib/posters/renderer"
import { renderBannerHtml, renderBannerHtmlFramed } from "./render"
import { BANNER_EXPORTS, BANNER_SIZES, type BannerDoc, type BannerExportTarget } from "./types"

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

/** px → CSS inches for page.pdf sizing (Chromium renders CSS at 96dpi). */
const pxToIn = (px: number) => `${px / 96}in`

async function renderPdfBuffer(html: string, width: number, height: number): Promise<Buffer> {
  const executablePath = await getChromiumExecutablePath()
  const browser = await chromium.launch({
    headless: true,
    timeout: 30000,
    args: getChromiumArgs(LAUNCH_ARGS),
    ...(executablePath ? { executablePath } : {}),
  })
  try {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 })
    await page.addStyleTag({ content: await buildFontCss() })
    await page.evaluate(() => (document as Document).fonts.ready).catch(() => {})
    await page
      .evaluate(() =>
        Promise.all(
          Array.from(document.images).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener("load", () => resolve())
                  img.addEventListener("error", () => resolve())
                })
          )
        )
      )
      .catch(() => {})
    await page.waitForTimeout(150)
    const pdf = await page.pdf({
      width: pxToIn(width),
      height: pxToIn(height),
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      pageRanges: "1",
    })
    if (!pdf || pdf.length === 0) throw new Error("Banner PDF returned an empty buffer")
    return Buffer.from(pdf)
  } finally {
    await browser.close().catch(() => {})
  }
}

export interface BannerExportResult {
  buffer: Buffer
  contentType: string
  ext: "png" | "pdf"
  width: number
  height: number
}

/** Render `doc` for the given export target into an upload-ready buffer. */
export async function exportBanner(doc: BannerDoc, target: BannerExportTarget): Promise<BannerExportResult> {
  const preset = BANNER_EXPORTS[target]
  const authored = BANNER_SIZES[doc.size] ?? BANNER_SIZES["screen-16x9"]

  if (target === "social") {
    // Fit the authored design centered onto the social frame.
    const html = renderBannerHtmlFramed(doc, preset.width, preset.height)
    const buffer = await renderPosterPng(html, preset.width, preset.height)
    return { buffer, contentType: "image/png", ext: "png", width: preset.width, height: preset.height }
  }

  // PNG / PDF keep the authored frame 1:1.
  const html = renderBannerHtml(doc)
  if (preset.format === "pdf") {
    const buffer = await renderPdfBuffer(html, authored.width, authored.height)
    return { buffer, contentType: "application/pdf", ext: "pdf", width: authored.width, height: authored.height }
  }
  const buffer = await renderPosterPng(html, authored.width, authored.height)
  return { buffer, contentType: "image/png", ext: "png", width: authored.width, height: authored.height }
}
