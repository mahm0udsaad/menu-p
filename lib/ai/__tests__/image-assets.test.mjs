// Unit tests for gallery tag matching / recommendation ranking (Phase 3).
// Run: node --experimental-strip-types --import ./lib/ai/__tests__/register-ts.mjs lib/ai/__tests__/image-assets.test.mjs
import assert from "node:assert/strict"
import {
  nameTokens,
  buildAssetTags,
  scoreAssetMatch,
  rankAssets,
  fileSlug,
  RECOMMEND_THRESHOLD,
  SEARCH_THRESHOLD,
} from "../image-asset-utils.ts"

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

const asset = (tags, overrides = {}) => ({ id: "x", tags, usage_count: 0, restaurant_id: "r1", ...overrides })

// --- nameTokens / normalization ---
test("nameTokens folds tashkeel, taa marbuta and splits", () => {
  assert.deepEqual(nameTokens("قَهْوَة تُركي"), ["قهوه", "تركي"])
})

test("nameTokens folds alef variants", () => {
  assert.deepEqual(nameTokens("أرز إسباني"), ["ارز", "اسباني"])
})

test("nameTokens drops stop words and short tokens", () => {
  assert.deepEqual(nameTokens("شاورما مع بطاطس"), ["شاورما", "بطاطس"])
})

test("nameTokens handles english and case", () => {
  assert.deepEqual(nameTokens("Turkish Coffee"), ["turkish", "coffee"])
})

// --- buildAssetTags ---
test("buildAssetTags includes full AR key, tokens, EN tokens and kind", () => {
  const tags = buildAssetTags({ itemName: "قهوة تركي", itemNameEn: "Turkish Coffee", kind: "menu_item" })
  assert.ok(tags.includes("قهوه تركي"), "full AR key")
  assert.ok(tags.includes("قهوه"), "AR token")
  assert.ok(tags.includes("تركي"), "AR token 2")
  assert.ok(tags.includes("turkish coffee"), "full EN key")
  assert.ok(tags.includes("coffee"), "EN token")
  assert.ok(tags.includes("menu_item"), "kind tag")
})

test("buildAssetTags dedupes and normalizes extra tags", () => {
  const tags = buildAssetTags({ itemName: "كبسة", kind: "poster_art", extra: ["كَبسة", "عرض"] })
  assert.equal(tags.filter((t) => t === "كبسه").length, 1)
  assert.ok(tags.includes("عرض"))
})

// --- scoreAssetMatch ---
const turkishCoffeeTags = buildAssetTags({ itemName: "قهوة تركي", itemNameEn: "Turkish Coffee", kind: "menu_item" })

test("exact dish (different orthography: ة vs ه, tashkeel) scores 1", () => {
  assert.equal(scoreAssetMatch("قَهوه تُركى", turkishCoffeeTags), 1)
})

test("partial overlap scores fraction of query tokens", () => {
  // "قهوة تركي بالحليب" → 2 of 3 tokens match
  const score = scoreAssetMatch("قهوة تركي بالحليب", turkishCoffeeTags)
  assert.ok(Math.abs(score - 2 / 3) < 1e-9, `expected 2/3, got ${score}`)
})

test("english query matches english tags", () => {
  assert.equal(scoreAssetMatch("turkish coffee", turkishCoffeeTags), 1)
})

test("unrelated dish scores 0", () => {
  assert.equal(scoreAssetMatch("برجر لحم", turkishCoffeeTags), 0)
})

test("empty query scores 0", () => {
  assert.equal(scoreAssetMatch("", turkishCoffeeTags), 0)
})

// --- rankAssets ---
test("rankAssets puts exact match first, filters below threshold", () => {
  const exact = asset(turkishCoffeeTags, { id: "exact" })
  const partial = asset(buildAssetTags({ itemName: "قهوة فرنساوي", kind: "menu_item" }), { id: "partial" })
  const unrelated = asset(buildAssetTags({ itemName: "بيتزا مارجريتا", kind: "menu_item" }), { id: "no" })
  const ranked = rankAssets([unrelated, partial, exact], { itemName: "قهوة تركي" })
  assert.equal(ranked[0].id, "exact")
  assert.equal(ranked[0].score, 1)
  assert.ok(!ranked.find((a) => a.id === "no"), "unrelated filtered out")
  // partial: 1/2 tokens (قهوه) = 0.5 → kept at default threshold
  assert.ok(ranked.find((a) => a.id === "partial"))
})

test("rankAssets breaks score ties by usage_count", () => {
  const a = asset(turkishCoffeeTags, { id: "a", usage_count: 1 })
  const b = asset(turkishCoffeeTags, { id: "b", usage_count: 9 })
  const ranked = rankAssets([a, b], { itemName: "قهوة تركي" })
  assert.equal(ranked[0].id, "b")
})

test("rankAssets uses english fallback name", () => {
  const enOnly = asset(buildAssetTags({ itemName: "Shakshuka", kind: "menu_item" }), { id: "en" })
  const ranked = rankAssets([enOnly], { itemName: "طبق غير معروف", itemNameEn: "Shakshuka" })
  assert.equal(ranked.length, 1)
  assert.equal(ranked[0].score, 1)
})

test("rankAssets respects limit and custom threshold", () => {
  const assets = Array.from({ length: 20 }, (_, i) => asset(turkishCoffeeTags, { id: `a${i}` }))
  assert.equal(rankAssets(assets, { itemName: "قهوة تركي" }, { limit: 5 }).length, 5)
  const partial = asset(buildAssetTags({ itemName: "قهوة فرنساوي", kind: "menu_item" }), { id: "p" })
  assert.equal(rankAssets([partial], { itemName: "قهوة تركي" }, { threshold: 0.6 }).length, 0)
})

test("thresholds are sane (search looser than recommend)", () => {
  assert.ok(SEARCH_THRESHOLD < RECOMMEND_THRESHOLD)
})

// --- fileSlug ---
test("fileSlug keeps latin, falls back for arabic-only names", () => {
  assert.equal(fileSlug("Turkish Coffee #1"), "turkish-coffee-1")
  assert.equal(fileSlug("قهوة تركي"), "asset")
})

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
