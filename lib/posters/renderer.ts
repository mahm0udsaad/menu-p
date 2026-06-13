/**
 * Poster renderer (Phase 4): template HTML → exact-size PNG screenshot via
 * playwright-core (same engine/launch flags as lib/playwright/pdf-generator,
 * screenshot mode instead of pdf) → upload to menu-images/posters/{rid}/ →
 * update the posters row.
 *
 * Arabic fonts (Cairo + Amiri from public/fonts) are inlined as base64
 * @font-face so rendering needs no network and glyphs are never garbled.
 * Browsers are launched per render and always closed (posters are rare,
 * leak-freedom beats warm-start here).
 */

import { chromium } from "playwright-core"
import { promises as fs } from "fs"
import path from "path"
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

const FONT_DIR = ["public", "fonts", "AR"]
const FONT_FILES: Array<{ family: string; weight: number; rel: string[] }> = [
  { family: "Cairo", weight: 400, rel: ["Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto", "Cairo", "static", "Cairo-Regular.ttf"] },
  { family: "Cairo", weight: 600, rel: ["Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto", "Cairo", "static", "Cairo-SemiBold.ttf"] },
  { family: "Cairo", weight: 800, rel: ["Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto", "Cairo", "static", "Cairo-ExtraBold.ttf"] },
  { family: "Cairo", weight: 900, rel: ["Cairo,Noto_Kufi_Arabic,Open_Sans,Roboto", "Cairo", "static", "Cairo-Black.ttf"] },
  { family: "Amiri", weight: 400, rel: ["Amiri", "Amiri-Regular.ttf"] },
  { family: "Amiri", weight: 700, rel: ["Amiri", "Amiri-Bold.ttf"] },
]

let cachedFontCss: string | null = null

async function buildFontCss(): Promise<string> {
  if (cachedFontCss !== null) return cachedFontCss
  const rules: string[] = []
  for (const font of FONT_FILES) {
    const filePath = path.join(process.cwd(), ...FONT_DIR, ...font.rel)
    try {
      const bytes = await fs.readFile(filePath)
      rules.push(
        `@font-face{font-family:'${font.family}';font-style:normal;font-weight:${font.weight};` +
          `src:url(data:font/ttf;base64,${bytes.toString("base64")}) format('truetype');}`
      )
    } catch {
      console.warn(`Poster renderer: font not found, skipping ${filePath}`)
    }
  }
  cachedFontCss = rules.join("\n")
  return cachedFontCss
}

/** Render an exact width×height PNG screenshot of the given HTML document. */
export async function renderPosterPng(html: string, width: number, height: number): Promise<Buffer> {
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
    // Wait for the art background / product images (remote URLs) to settle.
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
    const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width, height } })
    if (!png || png.length === 0) throw new Error("Poster screenshot returned an empty buffer")
    return Buffer.from(png)
  } finally {
    await browser.close().catch(() => {})
  }
}

/** Structural slice of the Supabase client used here — keeps this module
 *  importable outside Next (tests) while server actions pass the real client. */
export interface PosterStoreClient {
  storage: {
    from(bucket: string): {
      upload(
        filePath: string,
        body: Buffer,
        options: { contentType: string; upsert: boolean }
      ): Promise<{ error: { message: string } | null }>
      getPublicUrl(filePath: string): { data: { publicUrl: string } }
    }
  }
  from(table: string): {
    update(values: Record<string, unknown>): {
      eq(column: string, value: string): PromiseLike<{ error: { message: string } | null }>
    }
  }
}

export interface RenderAndStoreParams {
  supabase: PosterStoreClient
  posterId: string
  restaurantId: string
  html: string
  width: number
  height: number
  /** Payload to persist alongside the render info (storage path is added). */
  payload: Record<string, unknown>
}

export type RenderAndStoreResult =
  | { success: true; publicUrl: string; storagePath: string }
  | { success: false; error: string }

/** Screenshot → upload to menu-images/posters/{rid}/ → posters row 'ready'. */
export async function renderAndStorePoster(params: RenderAndStoreParams): Promise<RenderAndStoreResult> {
  const { supabase, posterId, restaurantId, html, width, height } = params
  let png: Buffer
  try {
    png = await renderPosterPng(html, width, height)
  } catch (err) {
    console.error("renderAndStorePoster screenshot failed:", err)
    return { success: false, error: "تعذر إخراج البوستر النهائي، حاول مرة أخرى" }
  }

  const storagePath = `posters/${restaurantId}/${posterId}-${Date.now()}.png`
  const { error: uploadError } = await supabase.storage
    .from("menu-images")
    .upload(storagePath, png, { contentType: "image/png", upsert: false })
  if (uploadError) {
    console.error("renderAndStorePoster upload failed:", uploadError.message)
    return { success: false, error: "تم إخراج البوستر لكن تعذر حفظه، حاول مرة أخرى" }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("menu-images").getPublicUrl(storagePath)

  const { error: updateError } = await supabase
    .from("posters")
    .update({
      final_image_url: publicUrl,
      status: "ready",
      payload: { ...params.payload, render: { storage_path: storagePath, width, height } },
    })
    .eq("id", posterId)
  if (updateError) {
    console.error("renderAndStorePoster row update failed:", updateError.message)
    return { success: false, error: "تم حفظ البوستر لكن تعذر تحديث حالته" }
  }

  return { success: true, publicUrl, storagePath }
}
