/**
 * AI food-image generation (Phase 3).
 *
 * API choice (verified against the installed SDK, see node_modules .d.ts):
 * - `ai` v4.3.16 exports `experimental_generateImage`, BUT `@ai-sdk/google`
 *   v1.2.19 exposes NO `imageModel()` factory — Imagen is not available in
 *   this provider version, so `experimental_generateImage` cannot be used.
 * - The supported v4 path for Gemini image-output models is `generateText`
 *   with `providerOptions.google.responseModalities = ["TEXT", "IMAGE"]`;
 *   generated images come back in `result.files` as `GeneratedFile`
 *   ({ base64, uint8Array, mimeType }). That is what we use here.
 *
 * Model chain mirrors lib/ai/menu-extraction.ts: GEMINI_IMAGE_MODEL env →
 * defaults. Aspect ratio is steered via prompt (this API takes no size args).
 *
 * Pure functions: no DB calls. Server actions live in lib/actions/image-assets.ts.
 */

import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { buildAssetTags } from "./image-asset-utils"

export type ImageGenerationErrorCode = "auth" | "rate_limit" | "no_image" | "model_error"

export class ImageGenerationError extends Error {
  readonly code: ImageGenerationErrorCode
  constructor(code: ImageGenerationErrorCode, message: string) {
    super(message)
    this.name = "ImageGenerationError"
    this.code = code
  }
}

const DEFAULT_IMAGE_MODEL_CHAIN = [
  "gemini-3.1-flash-image", // user-specified default
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-exp", // oldest model with IMAGE response modality
]

function imageModelChain(): string[] {
  const fromEnv = process.env.GEMINI_IMAGE_MODEL?.trim()
  const chain = fromEnv ? [fromEnv, ...DEFAULT_IMAGE_MODEL_CHAIN] : DEFAULT_IMAGE_MODEL_CHAIN
  return Array.from(new Set(chain))
}

export type ImageAspect = "square" | "portrait" | "landscape"

export interface GenerateFoodImageParams {
  /** Item name as shown on the menu (usually Arabic). */
  itemName: string
  /** English name if known — improves prompt grounding. */
  itemNameEn?: string | null
  /** Menu description of the item, used as prompt context. */
  description?: string | null
  kind: "menu_item" | "poster_art"
  /** Optional owner style hint, e.g. "خلفية خشبية" / "rustic wooden table". */
  style?: string | null
  aspect?: ImageAspect
}

export interface GeneratedFoodImage {
  bytes: Uint8Array
  mimeType: string
  prompt: string
  model: string
  /** Normalized AR/EN name tokens + kind — ready for the image_assets row. */
  tags: string[]
}

const ASPECT_TEXT: Record<ImageAspect, string> = {
  square: "perfectly square 1:1 composition",
  portrait: "vertical 3:4 portrait composition",
  landscape: "wide 16:9 landscape composition",
}

const NO_TEXT_RULES =
  "Strictly NO text, NO words, NO letters, NO numbers, NO watermarks, NO logos, NO menus, NO hands and NO people anywhere in the image."

/** Consistent style tokens so the gallery looks like one photographer shot it. */
export function buildImagePrompt(params: GenerateFoodImageParams): string {
  const subject = params.itemNameEn ? `${params.itemNameEn} (${params.itemName})` : params.itemName
  const description = params.description?.trim() ? ` Dish details: ${params.description.trim()}.` : ""
  const style = params.style?.trim() ? ` Extra style direction: ${params.style.trim()}.` : ""
  const aspect = ASPECT_TEXT[params.aspect ?? "square"]

  if (params.kind === "poster_art") {
    return (
      `Vibrant promotional poster background artwork featuring "${subject}".${description}` +
      ` Rich appetizing colors, dramatic studio lighting, dynamic ingredients floating around the dish,` +
      ` generous clean negative space at the top and bottom for overlay text, premium restaurant branding mood,` +
      ` ${aspect}, photorealistic render, high resolution.${style} ${NO_TEXT_RULES}`
    )
  }
  return (
    `Professional studio food photography of "${subject}".${description}` +
    ` Appetizing and freshly prepared, soft diffused natural lighting, shallow depth of field,` +
    ` careful garnish details, served on elegant ceramic tableware over a clean neutral warm background,` +
    ` centered hero composition, ${aspect}, photorealistic, high resolution.${style} ${NO_TEXT_RULES}`
  )
}

function classifyImageError(err: unknown): ImageGenerationError {
  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()
  if (
    lower.includes("api key") ||
    lower.includes("api_key") ||
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("permission")
  ) {
    return new ImageGenerationError("auth", `Gemini auth error: ${message}`)
  }
  if (lower.includes("429") || lower.includes("rate") || lower.includes("quota") || lower.includes("resource_exhausted")) {
    return new ImageGenerationError("rate_limit", `Gemini rate limit: ${message}`)
  }
  return new ImageGenerationError("model_error", `Gemini image generation failed: ${message}`)
}

/**
 * Generate one food image. Walks the model chain until a model returns an
 * image file; throws a typed ImageGenerationError otherwise.
 */
export async function generateFoodImage(params: GenerateFoodImageParams): Promise<GeneratedFoodImage> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new ImageGenerationError("auth", "GOOGLE_GENERATIVE_AI_API_KEY is not set")
  }
  if (!params.itemName.trim()) {
    throw new ImageGenerationError("model_error", "itemName is required to generate an image")
  }

  const prompt = buildImagePrompt(params)
  const tags = buildAssetTags({
    itemName: params.itemName,
    itemNameEn: params.itemNameEn,
    kind: params.kind,
  })

  let lastError: ImageGenerationError | null = null
  for (const modelId of imageModelChain()) {
    try {
      const result = await generateText({
        model: google(modelId),
        prompt,
        providerOptions: {
          google: { responseModalities: ["TEXT", "IMAGE"] },
        },
      })
      const image = result.files.find((f) => f.mimeType.startsWith("image/"))
      if (!image) {
        lastError = new ImageGenerationError("no_image", `Model ${modelId} returned no image data`)
        continue
      }
      return { bytes: image.uint8Array, mimeType: image.mimeType, prompt, model: modelId, tags }
    } catch (err) {
      lastError = classifyImageError(err)
      if (lastError.code === "auth") throw lastError // another model won't fix auth
    }
  }
  throw lastError ?? new ImageGenerationError("model_error", "No Gemini image model available")
}
