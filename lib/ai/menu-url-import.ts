/**
 * Resolves a user-supplied "digital menu" URL into a menu extraction.
 *
 * Routing (scope: direct file links + a restaurant's own web menu):
 *   • application/pdf  → extract bytes directly (existing multimodal pipeline)
 *   • image/*          → extract bytes directly
 *   • text/html (or unknown) → render the page to a paginated PDF with the
 *     managed Playwright browser, then extract that PDF
 *
 * All network access goes through the SSRF-safe url-guard layer.
 */

import {
  extractAndVerifyMenuFromBytes,
  MenuExtractionError,
  type FullExtractionResult,
} from "./menu-extraction"
import { assertSafeUrl, fetchRemoteFile } from "./url-guard"
import { extractMenusSaMenu, isMenusSaUrl } from "./menus-sa-import"

// Magic-byte sniff for servers that mislabel content (e.g. octet-stream PDFs).
function sniffMime(bytes: Uint8Array, declared: string): string | null {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf" // %PDF
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg"
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png"
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // WEBP
  ) {
    return "image/webp"
  }
  if (declared === "application/pdf" || declared.startsWith("image/")) return declared
  return null
}

const SUPPORTED_IMAGE = new Set(["image/jpeg", "image/png", "image/webp"])

export interface UrlImportResult extends FullExtractionResult {
  /** "file" for direct PDF/image, "menus-sa" for the platform fast path, "rendered" for generic web pages. */
  resolvedVia: "file" | "menus-sa" | "rendered"
  finalUrl: string
}

/**
 * Full URL → extraction pipeline. Throws MenuExtractionError or UrlGuardError.
 */
export async function extractMenuFromUrl(rawUrl: string): Promise<UrlImportResult> {
  // Validate before any network access (throws UrlGuardError on a bad target).
  await assertSafeUrl(rawUrl)

  if (isMenusSaUrl(rawUrl)) {
    const result = await extractMenusSaMenu(rawUrl)
    return { ...result, resolvedVia: "menus-sa" }
  }

  const { bytes, contentType, finalUrl } = await fetchRemoteFile(rawUrl)
  const sniffed = sniffMime(bytes, contentType)

  // Direct file link — reuse the existing multimodal pipeline with the bytes
  // we already fetched safely.
  if (sniffed === "application/pdf" || (sniffed && SUPPORTED_IMAGE.has(sniffed))) {
    const result = await extractAndVerifyMenuFromBytes(bytes, sniffed)
    return { ...result, resolvedVia: "file", finalUrl }
  }

  // Otherwise treat it as a web page: render to PDF and extract that.
  // Dynamic import keeps Playwright out of the bundle unless a render is needed.
  const { renderUrlToPdf } = await import("@/lib/playwright/pdf-generator")
  let pdf: Buffer
  try {
    pdf = await renderUrlToPdf(finalUrl)
  } catch (err) {
    throw new MenuExtractionError(
      "fetch_failed",
      `تعذر فتح صفحة القائمة: ${(err as Error).message}`
    )
  }
  const result = await extractAndVerifyMenuFromBytes(new Uint8Array(pdf), "application/pdf")
  return { ...result, resolvedVia: "rendered", finalUrl }
}
