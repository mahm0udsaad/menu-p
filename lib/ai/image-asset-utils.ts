/**
 * Pure helpers for the image-asset gallery (Phase 3): tag building,
 * Arabic-aware matching and recommendation ranking.
 * No DB / network calls — unit-testable in plain node (see __tests__).
 */

import { normalizeNameKey } from "./menu-extraction-utils"

export type ImageAssetKind = "menu_item" | "poster_art" | "logo" | "decor"

/** Minimal shape needed to rank an asset against a query. */
export interface RankableAsset {
  tags: string[]
  usage_count?: number | null
  restaurant_id?: string | null
}

/** Minimum score for an asset to be recommended instead of generating anew. */
export const RECOMMEND_THRESHOLD = 0.5

/** Looser score used for free-text gallery search. */
export const SEARCH_THRESHOLD = 0.34

const STOP_TOKENS = new Set([
  "مع",
  "من",
  "في",
  "علي",
  "بدون",
  "او",
  "the",
  "a",
  "an",
  "of",
  "with",
  "and",
  "or",
])

/** Tokenize a dish name with the same Arabic folding used by extraction. */
export function nameTokens(name: string | null | undefined): string[] {
  if (!name) return []
  return normalizeNameKey(name)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOP_TOKENS.has(t))
}

/**
 * Tags stored on a generated/uploaded asset:
 * full normalized AR/EN name keys + individual tokens + the asset kind.
 */
export function buildAssetTags(params: {
  itemName: string
  itemNameEn?: string | null
  kind: ImageAssetKind
  extra?: string[]
}): string[] {
  const tags = new Set<string>()
  const arKey = normalizeNameKey(params.itemName)
  if (arKey) tags.add(arKey)
  for (const t of nameTokens(params.itemName)) tags.add(t)
  if (params.itemNameEn) {
    const enKey = normalizeNameKey(params.itemNameEn)
    if (enKey) tags.add(enKey)
    for (const t of nameTokens(params.itemNameEn)) tags.add(t)
  }
  tags.add(params.kind)
  for (const extraTag of params.extra ?? []) {
    const key = normalizeNameKey(extraTag)
    if (key) tags.add(key)
  }
  return Array.from(tags)
}

/**
 * 0..1 similarity between a query name and an asset's tags.
 * 1.0 — the full normalized name key appears as a tag (same dish);
 * otherwise the fraction of query tokens found among the tag tokens.
 */
export function scoreAssetMatch(query: string, tags: string[]): number {
  const key = normalizeNameKey(query)
  if (!key) return 0
  const normalizedTags = tags.map((t) => normalizeNameKey(t))
  if (normalizedTags.includes(key)) return 1
  const tokens = nameTokens(query)
  if (tokens.length === 0) return 0
  const tagTokens = new Set<string>()
  for (const tag of normalizedTags) for (const tt of tag.split(" ")) tagTokens.add(tt)
  const matched = tokens.filter((t) => tagTokens.has(t)).length
  return matched / tokens.length
}

export type RankedAsset<T extends RankableAsset> = T & { score: number }

/**
 * Rank gallery assets against an item name (AR primary, EN fallback).
 * Score ties break on usage_count (popular assets first).
 */
export function rankAssets<T extends RankableAsset>(
  assets: T[],
  query: { itemName: string; itemNameEn?: string | null },
  options?: { threshold?: number; limit?: number }
): RankedAsset<T>[] {
  const threshold = options?.threshold ?? RECOMMEND_THRESHOLD
  const limit = options?.limit ?? 12
  return assets
    .map((asset) => {
      const arScore = scoreAssetMatch(query.itemName, asset.tags)
      const enScore = query.itemNameEn ? scoreAssetMatch(query.itemNameEn, asset.tags) : 0
      return { ...asset, score: Math.max(arScore, enScore) }
    })
    .filter((asset) => asset.score >= threshold)
    .sort((a, b) => b.score - a.score || (b.usage_count ?? 0) - (a.usage_count ?? 0))
    .slice(0, limit)
}

/** ASCII-safe slug for storage file names (Arabic names fall back to "asset"). */
export function fileSlug(name: string): string {
  const ascii = normalizeNameKey(name)
    .replace(/[^0-9a-z]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
  return ascii || "asset"
}
