/**
 * AI menu extraction (Phase 2): Gemini multimodal reads an old menu
 * (PDF / photo) and returns a typed extraction with per-item confidence.
 *
 * Multi-pass for accuracy:
 *   pass 1 — extract everything it can see
 *   pass 2 — re-reads the document WITH pass 1 attached and corrects it
 *   merge  — disagreements / missed items get low-confidence flags
 *
 * Pure functions: no DB calls. Server actions live in lib/actions/menu-import.ts.
 */

import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import {
  mergeExtractions,
  normalizeRawExtraction,
  summarizeExtraction,
  type ConfidenceSummary,
  type MenuExtraction,
  type RawMenuExtraction,
} from "./menu-extraction-utils"

export type {
  ConfidenceSummary,
  ExtractedMenuCategory,
  ExtractedMenuItem,
  MenuExtraction,
} from "./menu-extraction-utils"

export type MenuExtractionErrorCode =
  | "auth"
  | "rate_limit"
  | "fetch_failed"
  | "file_too_large"
  | "empty_extraction"
  | "model_error"

export class MenuExtractionError extends Error {
  readonly code: MenuExtractionErrorCode
  constructor(code: MenuExtractionErrorCode, message: string) {
    super(message)
    this.name = "MenuExtractionError"
    this.code = code
  }
}

const MAX_FILE_BYTES = 12 * 1024 * 1024 // accept slightly above the 10MB UI limit
const MAX_OUTPUT_TOKENS = 32_000

const DEFAULT_MODEL_CHAIN = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-exp"]

function modelChain(): string[] {
  const fromEnv = process.env.GEMINI_TEXT_MODEL?.trim()
  const chain = fromEnv ? [fromEnv, ...DEFAULT_MODEL_CHAIN] : DEFAULT_MODEL_CHAIN
  return Array.from(new Set(chain))
}

// --- Zod schema for the model output (prices as printed text — parsed in code) ---
const RawItemSchema = z.object({
  name: z.string().describe("Item name exactly as printed (original language)."),
  name_en: z.string().nullable().describe("English item name if printed on the menu, else null."),
  description: z.string().nullable().describe("Item description if printed, else null."),
  price_text: z
    .string()
    .nullable()
    .describe("Price EXACTLY as printed, including currency text/Arabic numerals (e.g. '٤٥ ج.م'). null if no price."),
  currency: z.string().nullable().describe("ISO currency code if determinable (EGP, SAR...), else null."),
  confidence: z.number().min(0).max(1).describe("Confidence 0-1 that name AND price were read correctly."),
})

const RawCategorySchema = z.object({
  name: z.string().describe("Category/section heading exactly as printed."),
  name_en: z.string().nullable().describe("English category name if printed, else null."),
  description: z.string().nullable().describe("Category description if printed, else null."),
  confidence: z.number().min(0).max(1).describe("Confidence 0-1 for this category."),
  items: z.array(RawItemSchema),
})

const RawExtractionSchema = z.object({
  categories: z.array(RawCategorySchema),
  detected_language: z.string().describe("Primary language code of the menu: 'ar', 'en', ..."),
  currency_guess: z.string().nullable().describe("Most likely ISO currency code for the whole menu, else null."),
})

const EXTRACT_PROMPT = `You are reading a restaurant menu document (photo or PDF). Extract EVERY category and EVERY item.

Rules:
- Copy names/descriptions EXACTLY as printed — do not translate, fix spelling, or invent text.
- price_text must be the literal printed price string (keep Arabic numerals / currency words). Use null when no price is printed.
- One menu line can hide multiple items (e.g. "Small/Large 30/45") — split into separate items only when sizes are clearly separate offerings; otherwise keep one item and put the full price text in price_text.
- Items without a visible category go into a category named "أخرى".
- Set confidence honestly: blurry text, cut-off rows, ambiguous prices => lower confidence.
- Do not skip anything: drinks, sides, notes with prices, multi-column layouts, footers.`

const VERIFY_PROMPT_PREFIX = `You previously extracted the menu below from the attached document. Now VERIFY it against the document and return the FULL corrected extraction (same schema):
- Add any items or categories that were missed.
- Fix wrong prices, merged rows, split rows, swapped name/description.
- Remove hallucinated items that are not in the document.
- Re-assess confidence 0-1 per item: 1.0 = certain, below 0.8 = needs human review.

Previous extraction JSON:
`

async function fetchFile(fileUrl: string): Promise<Uint8Array> {
  let res: Response
  try {
    res = await fetch(fileUrl)
  } catch (err) {
    throw new MenuExtractionError("fetch_failed", `Could not download menu file: ${(err as Error).message}`)
  }
  if (!res.ok) {
    throw new MenuExtractionError("fetch_failed", `Could not download menu file (HTTP ${res.status})`)
  }
  const buffer = new Uint8Array(await res.arrayBuffer())
  if (buffer.byteLength === 0) throw new MenuExtractionError("fetch_failed", "Menu file is empty")
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new MenuExtractionError("file_too_large", "Menu file exceeds the 10MB limit")
  }
  return buffer
}

function classifyAiError(err: unknown): MenuExtractionError {
  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()
  if (lower.includes("api key") || lower.includes("api_key") || lower.includes("401") || lower.includes("403") || lower.includes("permission")) {
    return new MenuExtractionError("auth", `Gemini auth error: ${message}`)
  }
  if (lower.includes("429") || lower.includes("rate") || lower.includes("quota") || lower.includes("resource_exhausted")) {
    return new MenuExtractionError("rate_limit", `Gemini rate limit: ${message}`)
  }
  return new MenuExtractionError("model_error", `Gemini extraction failed: ${message}`)
}

async function runPass(prompt: string, file: Uint8Array, mimeType: string): Promise<RawMenuExtraction> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new MenuExtractionError("auth", "GOOGLE_GENERATIVE_AI_API_KEY is not set")
  }
  let lastError: MenuExtractionError | null = null
  for (const modelId of modelChain()) {
    try {
      const result = await generateObject({
        model: google(modelId),
        schema: RawExtractionSchema,
        maxTokens: MAX_OUTPUT_TOKENS,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "file", data: file, mimeType },
            ],
          },
        ],
      })
      return result.object
    } catch (err) {
      lastError = classifyAiError(err)
      if (lastError.code === "auth") throw lastError // a different model won't fix auth
    }
  }
  throw lastError ?? new MenuExtractionError("model_error", "No Gemini model available")
}

/** Pass 1: extract the raw menu from a stored file URL. */
export async function extractMenu(fileUrl: string, mimeType: string): Promise<MenuExtraction> {
  const file = await fetchFile(fileUrl)
  const raw = await runPass(EXTRACT_PROMPT, file, mimeType)
  return normalizeRawExtraction(raw)
}

/** Pass 2: send pass-1 result back with the document for correction. */
export async function verifyExtraction(
  fileUrl: string,
  mimeType: string,
  firstPass: MenuExtraction
): Promise<MenuExtraction> {
  const file = await fetchFile(fileUrl)
  const prompt = VERIFY_PROMPT_PREFIX + JSON.stringify(firstPass, null, 2)
  const raw = await runPass(prompt, file, mimeType)
  return normalizeRawExtraction(raw)
}

export interface FullExtractionResult {
  raw: MenuExtraction
  verified: MenuExtraction
  summary: ConfidenceSummary
}

/** Full pipeline: extract → verify → merge → confidence summary. */
export async function extractAndVerifyMenu(fileUrl: string, mimeType: string): Promise<FullExtractionResult> {
  const file = await fetchFile(fileUrl)
  return extractAndVerifyMenuFromBytes(file, mimeType)
}

/**
 * Same pipeline as extractAndVerifyMenu but operates on already-fetched bytes.
 * Used by the URL import path, which fetches/renders through an SSRF-safe layer
 * and must never hand a raw URL back to an unguarded fetch.
 */
export async function extractAndVerifyMenuFromBytes(
  file: Uint8Array,
  mimeType: string
): Promise<FullExtractionResult> {
  const pass1 = normalizeRawExtraction(await runPass(EXTRACT_PROMPT, file, mimeType))
  if (pass1.categories.length === 0) {
    throw new MenuExtractionError("empty_extraction", "No menu content detected in the file")
  }
  let pass2: MenuExtraction
  try {
    const verifyPrompt = VERIFY_PROMPT_PREFIX + JSON.stringify(pass1, null, 2)
    pass2 = normalizeRawExtraction(await runPass(verifyPrompt, file, mimeType))
  } catch (err) {
    // Verification failure should not lose pass 1 — merge handles empty pass 2
    if (err instanceof MenuExtractionError && err.code === "auth") throw err
    pass2 = { categories: [], detected_language: pass1.detected_language, currency_guess: pass1.currency_guess }
  }
  const verified = mergeExtractions(pass1, pass2)
  if (verified.categories.length === 0) {
    throw new MenuExtractionError("empty_extraction", "Extraction produced no usable categories")
  }
  return { raw: pass1, verified, summary: summarizeExtraction(verified) }
}
