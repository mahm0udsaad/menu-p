/**
 * Poster art prompt building (Phase 4 — Poster Studio).
 *
 * The AI model ONLY paints the background art (kind 'poster_art' already
 * reserves clean overlay space and bans baked-in text — Arabic glyphs get
 * garbled by image models). All text is composited later via HTML
 * (lib/posters/templates.ts + renderer.ts).
 *
 * Pure mapping: mode/subject/style → GenerateFoodImageParams, so server
 * actions can feed the result straight into generateAndSaveAsset (Phase 3)
 * and keep every artwork registered + reusable in the shared gallery.
 */

import { buildImagePrompt, type GenerateFoodImageParams, type ImageAspect } from "./image-generation"
import { findOccasion } from "@/lib/posters/occasions"
import type { PosterMode, PosterSize } from "@/lib/posters/poster-utils"

export interface PosterArtInput {
  mode: PosterMode
  /** Offer: hero product name. Greeting: occasion (id or Arabic label). */
  subject: string
  /** English subject if known — improves prompt grounding. */
  subjectEn?: string | null
  /** Optional owner style hint (Arabic or English). */
  style?: string | null
  size?: PosterSize
}

const SIZE_ASPECT: Record<PosterSize, ImageAspect> = {
  square: "square",
  story: "portrait",
}

const OFFER_ART_DIRECTION =
  "promotional sale energy, bold appetizing hero composition, subtle bokeh background"
const GREETING_ART_DIRECTION =
  "festive greeting-card background, decorative and atmospheric, soft dreamy depth, absolutely no dishes or food unless the occasion demands it"

/**
 * Map a poster-art request onto generateFoodImage params (kind 'poster_art').
 * Greeting occasions get their English art subject + occasion-specific
 * direction from lib/posters/occasions.ts so the art is gallery-reusable.
 */
export function buildPosterArtRequest(input: PosterArtInput): GenerateFoodImageParams {
  const subject = input.subject.trim()
  const ownerStyle = input.style?.trim()

  if (input.mode === "greeting") {
    const occasion = findOccasion(subject)
    const direction = [GREETING_ART_DIRECTION, occasion?.artStyleEn, ownerStyle].filter(Boolean).join(", ")
    return {
      itemName: occasion?.label ?? subject,
      itemNameEn: input.subjectEn?.trim() || occasion?.artSubjectEn || null,
      description: null,
      kind: "poster_art",
      style: direction,
      aspect: SIZE_ASPECT[input.size ?? "square"],
    }
  }

  return {
    itemName: subject,
    itemNameEn: input.subjectEn?.trim() || null,
    description: null,
    kind: "poster_art",
    style: [OFFER_ART_DIRECTION, ownerStyle].filter(Boolean).join(", "),
    aspect: SIZE_ASPECT[input.size ?? "square"],
  }
}

/** Final prompt string (useful for logging/tests; generation itself goes
 *  through generateAndSaveAsset → generateFoodImage with the same params). */
export function buildPosterArtPrompt(mode: PosterMode, subject: string, style?: string | null): string {
  return buildImagePrompt(buildPosterArtRequest({ mode, subject, style }))
}
