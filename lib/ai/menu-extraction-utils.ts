/**
 * Pure helpers for AI menu extraction: price parsing, pass merging,
 * confidence flagging. No DB / network calls — unit-testable in plain node.
 */

export const LOW_CONFIDENCE_THRESHOLD = 0.8

export type ExtractionFlag =
  | "low_confidence"
  | "price_mismatch"
  | "price_range"
  | "missing_price"
  | "unparseable_price"
  | "added_in_verification"
  | "not_verified"

export interface ExtractedMenuItem {
  name: string
  name_en?: string | null
  description?: string | null
  price: number | null
  image_url?: string | null
  currency?: string | null
  confidence: number
  flags: string[]
}

export interface ExtractedMenuCategory {
  name: string
  name_en?: string | null
  description?: string | null
  confidence: number
  items: ExtractedMenuItem[]
}

export interface MenuExtraction {
  categories: ExtractedMenuCategory[]
  detected_language: string
  currency_guess: string | null
}

export interface ConfidenceSummary {
  total_categories: number
  total_items: number
  low_confidence_items: number
  missing_price_items: number
  average_confidence: number
}

/** Shape returned by the model (prices come back as printed text). */
export interface RawExtractedItem {
  name: string
  name_en: string | null
  description: string | null
  price_text: string | null
  currency: string | null
  confidence: number
}

export interface RawExtractedCategory {
  name: string
  name_en: string | null
  description: string | null
  confidence: number
  items: RawExtractedItem[]
}

export interface RawMenuExtraction {
  categories: RawExtractedCategory[]
  detected_language: string
  currency_guess: string | null
}

export interface ParsedPrice {
  price: number | null
  flags: ExtractionFlag[]
}

const ARABIC_INDIC_ZERO = 0x0660 // ٠
const EASTERN_ARABIC_ZERO = 0x06f0 // ۰

/** Convert Arabic-Indic (٠-٩) and Eastern Arabic (۰-۹) digits to ASCII. */
export function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (ch) => {
    const code = ch.charCodeAt(0)
    const zero = code >= EASTERN_ARABIC_ZERO ? EASTERN_ARABIC_ZERO : ARABIC_INDIC_ZERO
    return String(code - zero)
  })
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Parse a price as printed on a menu: "45", "٤٥", "45 ج.م", "EGP 45.50",
 * "1,200", "45,5", "30-40" (range → first value + flag).
 */
export function parsePrice(input: string | number | null | undefined): ParsedPrice {
  if (input === null || input === undefined) return { price: null, flags: [] }
  if (typeof input === "number") {
    return Number.isFinite(input) && input >= 0
      ? { price: round2(input), flags: [] }
      : { price: null, flags: ["unparseable_price"] }
  }

  let text = normalizeDigits(String(input)).trim()
  if (!text) return { price: null, flags: [] }

  // Unify Arabic decimal (٫) / thousands (٬) separators
  text = text.replace(/٫/g, ".").replace(/[٬،]/g, ",")
  // Thousands separator: 1,200 → 1200
  text = text.replace(/(\d),(\d{3})(?!\d)/g, "$1$2")
  // Decimal comma: 45,5 → 45.5
  text = text.replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2")

  const numbers = text.match(/\d+(?:\.\d+)?/g)
  if (!numbers || numbers.length === 0) return { price: null, flags: ["unparseable_price"] }

  const flags: ExtractionFlag[] = []
  if (numbers.length > 1 && /\d\s*(?:[-–—~\/…]|\.\.+|إلى|الى|حتى|to)\s*\d/i.test(text)) {
    flags.push("price_range")
  }

  const price = Number.parseFloat(numbers[0])
  if (!Number.isFinite(price) || price < 0) return { price: null, flags: ["unparseable_price"] }
  return { price: round2(price), flags }
}

/** Normalization key for fuzzy-matching item/category names across passes. */
export function normalizeNameKey(name: string): string {
  return normalizeDigits(name)
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "") // tashkeel + tatweel
    .replace(/[أإآ]/g, "ا") // أ إ آ → ا
    .replace(/ة/g, "ه") // ة → ه
    .replace(/ى/g, "ي") // ى → ي
    .replace(/[^0-9a-z؀-ۿ]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

function dedupe(flags: string[]): string[] {
  return Array.from(new Set(flags))
}

/** Apply final flagging rules to a merged item. */
function finalizeItem(item: ExtractedMenuItem): ExtractedMenuItem {
  const flags = [...item.flags]
  if (item.price === null && !flags.includes("unparseable_price")) flags.push("missing_price")
  const confidence = clamp01(item.confidence)
  if (
    confidence < LOW_CONFIDENCE_THRESHOLD ||
    flags.some((f) => f === "price_mismatch" || f === "unparseable_price" || f === "missing_price")
  ) {
    flags.push("low_confidence")
  }
  return { ...item, confidence, flags: dedupe(flags) }
}

/** Convert a raw model extraction (text prices) into a typed MenuExtraction. */
export function normalizeRawExtraction(raw: RawMenuExtraction): MenuExtraction {
  const categories: ExtractedMenuCategory[] = (raw.categories ?? [])
    .map((cat) => {
      const items: ExtractedMenuItem[] = (cat.items ?? [])
        .filter((it) => typeof it.name === "string" && it.name.trim().length > 0)
        .map((it) => {
          const parsed = parsePrice(it.price_text)
          return {
            name: it.name.trim(),
            name_en: it.name_en?.trim() || null,
            description: it.description?.trim() || null,
            price: parsed.price,
            image_url: null,
            currency: it.currency?.trim() || null,
            confidence: clamp01(it.confidence ?? 0.5),
            flags: [...parsed.flags] as string[],
          }
        })
      return {
        name: (cat.name ?? "").trim(),
        name_en: cat.name_en?.trim() || null,
        description: cat.description?.trim() || null,
        confidence: clamp01(cat.confidence ?? 0.5),
        items,
      }
    })
    .filter((cat) => cat.name.length > 0 && cat.items.length > 0) // drop empty categories

  return {
    categories,
    detected_language: raw.detected_language || "ar",
    currency_guess: raw.currency_guess || null,
  }
}

/**
 * Merge extraction pass 1 with verification pass 2.
 * Pass 2 (which saw pass 1 + the document) wins on content; disagreements
 * lower confidence and add flags so the review UI highlights them.
 */
export function mergeExtractions(pass1: MenuExtraction, pass2: MenuExtraction): MenuExtraction {
  if (pass2.categories.length === 0) {
    // Verification produced nothing usable — keep pass 1, mark unverified
    return {
      ...pass1,
      categories: pass1.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((it) =>
          finalizeItem({ ...it, confidence: it.confidence * 0.6, flags: [...it.flags, "not_verified"] })
        ),
      })),
    }
  }

  const pass1Cats = new Map(pass1.categories.map((c) => [normalizeNameKey(c.name), c]))
  const mergedCategories: ExtractedMenuCategory[] = pass2.categories.map((cat2) => {
    const cat1 = pass1Cats.get(normalizeNameKey(cat2.name))
    const items1 = new Map((cat1?.items ?? []).map((i) => [normalizeNameKey(i.name), i]))
    const seen = new Set<string>()

    const items: ExtractedMenuItem[] = cat2.items.map((it2) => {
      const key = normalizeNameKey(it2.name)
      const it1 = items1.get(key)
      if (it1) seen.add(key)
      if (!it1) {
        // Found only during verification (pass 1 missed it)
        return finalizeItem({ ...it2, flags: [...it2.flags, "added_in_verification"] })
      }
      const flags = [...it2.flags]
      let confidence = Math.min(it1.confidence, it2.confidence)
      const pricesDisagree = it1.price !== null && it2.price !== null && it1.price !== it2.price
      if (pricesDisagree) {
        flags.push("price_mismatch")
        confidence = Math.min(confidence, 0.5)
      }
      return finalizeItem({ ...it2, confidence, flags })
    })

    // Items pass 2 dropped but pass 1 saw — keep, flagged for review
    for (const [key, it1] of items1) {
      if (!seen.has(key)) {
        items.push(
          finalizeItem({ ...it1, confidence: it1.confidence * 0.6, flags: [...it1.flags, "not_verified"] })
        )
      }
    }
    return { ...cat2, items }
  })

  // Whole categories pass 2 dropped
  const pass2Keys = new Set(pass2.categories.map((c) => normalizeNameKey(c.name)))
  for (const cat1 of pass1.categories) {
    if (!pass2Keys.has(normalizeNameKey(cat1.name))) {
      mergedCategories.push({
        ...cat1,
        items: cat1.items.map((it) =>
          finalizeItem({ ...it, confidence: it.confidence * 0.6, flags: [...it.flags, "not_verified"] })
        ),
      })
    }
  }

  return {
    categories: mergedCategories.filter((c) => c.name.trim().length > 0 && c.items.length > 0),
    detected_language: pass2.detected_language || pass1.detected_language,
    currency_guess: pass2.currency_guess || pass1.currency_guess,
  }
}

export function summarizeExtraction(extraction: MenuExtraction): ConfidenceSummary {
  const items = extraction.categories.flatMap((c) => c.items)
  const total = items.length
  return {
    total_categories: extraction.categories.length,
    total_items: total,
    low_confidence_items: items.filter((i) => i.flags.includes("low_confidence")).length,
    missing_price_items: items.filter((i) => i.price === null).length,
    average_confidence: total === 0 ? 0 : round2(items.reduce((s, i) => s + i.confidence, 0) / total),
  }
}
