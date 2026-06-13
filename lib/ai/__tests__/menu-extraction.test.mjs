// Unit tests for menu extraction merge/confidence/price logic.
// Run: node --experimental-strip-types lib/ai/__tests__/menu-extraction.test.mjs
import assert from "node:assert/strict"
import {
  parsePrice,
  normalizeDigits,
  normalizeNameKey,
  normalizeRawExtraction,
  mergeExtractions,
  summarizeExtraction,
} from "../menu-extraction-utils.ts"

let passed = 0
let failed = 0
function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`  ok    ${name}`)
  } catch (err) {
    failed++
    console.error(`  FAIL  ${name}`)
    console.error(`        ${err.message}`)
  }
}

const item = (overrides = {}) => ({
  name: "شاورما فراخ",
  name_en: null,
  description: null,
  price: 45,
  currency: null,
  confidence: 0.95,
  flags: [],
  ...overrides,
})
const category = (overrides = {}) => ({
  name: "ساندوتشات",
  name_en: null,
  description: null,
  confidence: 0.95,
  items: [item()],
  ...overrides,
})
const extraction = (categories) => ({ categories, detected_language: "ar", currency_guess: "EGP" })

console.log("\nprice parsing")

test("plain integer", () => {
  assert.deepEqual(parsePrice("45"), { price: 45, flags: [] })
})

test("Arabic-Indic numerals ٤٥", () => {
  assert.deepEqual(parsePrice("٤٥"), { price: 45, flags: [] })
})

test("Eastern Arabic numerals ۴۵", () => {
  assert.deepEqual(parsePrice("۴۵"), { price: 45, flags: [] })
})

test("price with currency text: 45 ج.م", () => {
  assert.deepEqual(parsePrice("45 ج.م"), { price: 45, flags: [] })
})

test("Arabic numerals + currency: ٤٥ جنيه", () => {
  assert.deepEqual(parsePrice("٤٥ جنيه"), { price: 45, flags: [] })
})

test("currency prefix: EGP 45.50", () => {
  assert.deepEqual(parsePrice("EGP 45.50"), { price: 45.5, flags: [] })
})

test("decimal comma: 45,5", () => {
  assert.deepEqual(parsePrice("45,5"), { price: 45.5, flags: [] })
})

test("thousands separator: 1,200", () => {
  assert.deepEqual(parsePrice("1,200"), { price: 1200, flags: [] })
})

test("range 30-40 takes first value and flags", () => {
  const r = parsePrice("30-40")
  assert.equal(r.price, 30)
  assert.ok(r.flags.includes("price_range"))
})

test("Arabic range ٣٠ إلى ٤٠", () => {
  const r = parsePrice("٣٠ إلى ٤٠")
  assert.equal(r.price, 30)
  assert.ok(r.flags.includes("price_range"))
})

test("slash sizes 30/45 flagged as range", () => {
  const r = parsePrice("30/45")
  assert.equal(r.price, 30)
  assert.ok(r.flags.includes("price_range"))
})

test("no digits → unparseable", () => {
  assert.deepEqual(parsePrice("حسب السوق"), { price: null, flags: ["unparseable_price"] })
})

test("null/empty → null without flags", () => {
  assert.deepEqual(parsePrice(null), { price: null, flags: [] })
  assert.deepEqual(parsePrice("  "), { price: null, flags: [] })
})

test("numeric passthrough rounds to 2dp", () => {
  assert.deepEqual(parsePrice(12.345), { price: 12.35, flags: [] })
})

test("negative number → unparseable", () => {
  assert.deepEqual(parsePrice(-5), { price: null, flags: ["unparseable_price"] })
})

console.log("\nname normalization")

test("digits + diacritics + alef variants fold together", () => {
  assert.equal(normalizeDigits("٤٥۹"), "459")
  assert.equal(normalizeNameKey("شَاوِرْمَا  فراخ"), normalizeNameKey("شاورما فراخ"))
  assert.equal(normalizeNameKey("أرز بلبن"), normalizeNameKey("ارز بلبن"))
  assert.equal(normalizeNameKey("Pizza Margherita!"), "pizza margherita")
})

console.log("\nnormalizeRawExtraction")

test("parses price_text, drops empty categories and nameless items", () => {
  const result = normalizeRawExtraction({
    categories: [
      {
        name: "مشروبات",
        name_en: null,
        description: null,
        confidence: 0.9,
        items: [
          { name: "شاي", name_en: null, description: null, price_text: "١٥ ج.م", currency: "EGP", confidence: 0.9 },
          { name: "  ", name_en: null, description: null, price_text: "10", currency: null, confidence: 0.9 },
        ],
      },
      { name: "قسم فارغ", name_en: null, description: null, confidence: 0.9, items: [] },
      { name: "", name_en: null, description: null, confidence: 0.9, items: [] },
    ],
    detected_language: "ar",
    currency_guess: "EGP",
  })
  assert.equal(result.categories.length, 1)
  assert.equal(result.categories[0].items.length, 1)
  assert.equal(result.categories[0].items[0].price, 15)
})

console.log("\nmergeExtractions")

test("agreeing passes → high confidence, no low_confidence flag", () => {
  const merged = mergeExtractions(extraction([category()]), extraction([category()]))
  const it = merged.categories[0].items[0]
  assert.equal(it.price, 45)
  assert.ok(!it.flags.includes("low_confidence"))
})

test("price disagreement → price_mismatch + low_confidence, pass-2 price wins", () => {
  const p1 = extraction([category({ items: [item({ price: 45 })] })])
  const p2 = extraction([category({ items: [item({ price: 54 })] })])
  const it = mergeExtractions(p1, p2).categories[0].items[0]
  assert.equal(it.price, 54)
  assert.ok(it.flags.includes("price_mismatch"))
  assert.ok(it.flags.includes("low_confidence"))
  assert.ok(it.confidence <= 0.5)
})

test("item only in pass 2 → added_in_verification", () => {
  const p1 = extraction([category()])
  const p2 = extraction([category({ items: [item(), item({ name: "كبدة اسكندراني", price: 60 })] })])
  const added = mergeExtractions(p1, p2).categories[0].items.find((i) => i.name === "كبدة اسكندراني")
  assert.ok(added)
  assert.ok(added.flags.includes("added_in_verification"))
})

test("item only in pass 1 → kept with not_verified + low_confidence", () => {
  const p1 = extraction([category({ items: [item(), item({ name: "سجق بلدي", price: 50 })] })])
  const p2 = extraction([category()])
  const kept = mergeExtractions(p1, p2).categories[0].items.find((i) => i.name === "سجق بلدي")
  assert.ok(kept)
  assert.ok(kept.flags.includes("not_verified"))
  assert.ok(kept.flags.includes("low_confidence"))
})

test("low pass confidence (<0.8) → low_confidence flag", () => {
  const p = extraction([category({ items: [item({ confidence: 0.6 })] })])
  const it = mergeExtractions(p, p).categories[0].items[0]
  assert.ok(it.flags.includes("low_confidence"))
})

test("missing price → missing_price + low_confidence", () => {
  const p = extraction([category({ items: [item({ price: null })] })])
  const it = mergeExtractions(p, p).categories[0].items[0]
  assert.ok(it.flags.includes("missing_price"))
  assert.ok(it.flags.includes("low_confidence"))
})

test("empty pass 2 → falls back to pass 1, everything not_verified", () => {
  const p1 = extraction([category()])
  const merged = mergeExtractions(p1, extraction([]))
  assert.equal(merged.categories.length, 1)
  assert.ok(merged.categories[0].items[0].flags.includes("not_verified"))
})

test("category only in pass 1 is preserved", () => {
  const p1 = extraction([category(), category({ name: "حلويات", items: [item({ name: "كنافة", price: 30 })] })])
  const p2 = extraction([category()])
  const merged = mergeExtractions(p1, p2)
  assert.equal(merged.categories.length, 2)
  const desserts = merged.categories.find((c) => c.name === "حلويات")
  assert.ok(desserts.items[0].flags.includes("not_verified"))
})

test("fuzzy matching across passes (diacritics/alef variants don't duplicate)", () => {
  const p1 = extraction([category({ items: [item({ name: "أرز بلبن", price: 25 })] })])
  const p2 = extraction([category({ items: [item({ name: "ارز بلبن", price: 25 })] })])
  const merged = mergeExtractions(p1, p2)
  assert.equal(merged.categories[0].items.length, 1)
})

console.log("\nsummarizeExtraction")

test("summary counts items, low confidence and missing prices", () => {
  const p = extraction([
    category({
      items: [item(), item({ name: "كبدة", price: null }), item({ name: "سجق", confidence: 0.4 })],
    }),
  ])
  const merged = mergeExtractions(p, p)
  const summary = summarizeExtraction(merged)
  assert.equal(summary.total_items, 3)
  assert.equal(summary.total_categories, 1)
  assert.equal(summary.missing_price_items, 1)
  assert.equal(summary.low_confidence_items, 2)
  assert.ok(summary.average_confidence > 0 && summary.average_confidence <= 1)
})

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
