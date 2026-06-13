// Unit tests for poster data-binding (Phase 4 — Poster Studio).
// Run: node --experimental-strip-types --import ./lib/ai/__tests__/register-ts.mjs lib/posters/__tests__/posters.test.mjs
import assert from "node:assert/strict"
import {
  escapeHtml,
  toArabicDigits,
  formatAmount,
  formatPrice,
  currencyLabel,
  discountPercent,
  discountBadgeText,
  sanitizePalette,
  hexToRgba,
  templateMode,
  DEFAULT_PALETTE,
} from "../poster-utils.ts"
import { POSTER_OCCASIONS, findOccasion, defaultGreetingMessage } from "../occasions.ts"
import { renderPosterHtml, POSTER_SIZES, POSTER_TEMPLATES } from "../templates.ts"

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

// --- HTML escaping ---
test("escapeHtml escapes all dangerous characters", () => {
  assert.equal(escapeHtml(`<img src="x" onerror='a&b'>`), "&lt;img src=&quot;x&quot; onerror=&#39;a&amp;b&#39;&gt;")
})

test("escapeHtml leaves Arabic text intact", () => {
  assert.equal(escapeHtml("قهوة تركي"), "قهوة تركي")
})

// --- Arabic-Indic digits ---
test("toArabicDigits converts digits and decimal point", () => {
  assert.equal(toArabicDigits("45.5"), "٤٥٫٥")
  assert.equal(toArabicDigits(1990), "١٩٩٠")
})

test("toArabicDigits keeps non-digits", () => {
  assert.equal(toArabicDigits("خصم 25%"), "خصم ٢٥%")
})

// --- amounts & prices ---
test("formatAmount trims and rounds to 2 decimals", () => {
  assert.equal(formatAmount(45), "45")
  assert.equal(formatAmount(45.5), "45.5")
  assert.equal(formatAmount(45.999), "46")
  assert.equal(formatAmount(45.125), "45.13")
  assert.equal(formatAmount(Number.NaN), "0")
})

test("formatPrice uses Arabic-Indic digits + currency label", () => {
  assert.equal(formatPrice(45, "EGP"), "٤٥ ج.م")
  assert.equal(formatPrice(99.5, "SAR"), "٩٩٫٥ ر.س")
})

test("currencyLabel falls back to the raw code", () => {
  assert.equal(currencyLabel("XYZ"), "XYZ")
  assert.equal(currencyLabel(null), "")
})

// --- discount math ---
test("discountPercent computes rounded percent", () => {
  assert.equal(discountPercent(100, 75), 25)
  assert.equal(discountPercent(60, 45), 25)
  assert.equal(discountPercent(99.99, 49.99), 50)
})

test("discountPercent rejects invalid combos", () => {
  assert.equal(discountPercent(null, 50), null)
  assert.equal(discountPercent(0, 0), null)
  assert.equal(discountPercent(50, 50), null)
  assert.equal(discountPercent(40, 50), null)
  assert.equal(discountPercent(100, 99.9), null) // rounds to 0%
})

test("discountBadgeText renders Arabic badge", () => {
  assert.equal(discountBadgeText(100, 75), "خصم ٢٥٪")
  assert.equal(discountBadgeText(null, 75), null)
})

// --- palette safety (values are injected into CSS) ---
test("sanitizePalette accepts valid hex, rejects CSS injection", () => {
  const evil = sanitizePalette({ primary: "red;} body{display:none", secondary: "#ABC", accent: "#fbbf24" })
  assert.equal(evil.primary, DEFAULT_PALETTE.primary)
  assert.equal(evil.secondary, "#ABC")
  assert.equal(evil.accent, "#fbbf24")
})

test("sanitizePalette handles null/garbage input", () => {
  assert.deepEqual(sanitizePalette(null), DEFAULT_PALETTE)
  assert.deepEqual(sanitizePalette("nope"), DEFAULT_PALETTE)
})

test("hexToRgba expands 3- and 6-digit hex", () => {
  assert.equal(hexToRgba("#fff", 0.5), "rgba(255, 255, 255, 0.5)")
  assert.equal(hexToRgba("#e11d48", 2), "rgba(225, 29, 72, 1)")
})

// --- occasions ---
test("all occasions have label + default message + english art subject", () => {
  assert.ok(POSTER_OCCASIONS.length >= 5)
  for (const o of POSTER_OCCASIONS) {
    assert.ok(o.label.length > 0 && o.defaultMessage.length > 0 && o.artSubjectEn.length > 0)
  }
})

test("findOccasion matches by id and Arabic label", () => {
  assert.equal(findOccasion("ramadan")?.label, "رمضان")
  assert.equal(findOccasion("عيد الفطر")?.id, "eid_fitr")
  assert.equal(findOccasion("حفلة"), null)
})

test("defaultGreetingMessage falls back for custom occasions", () => {
  assert.ok(defaultGreetingMessage("رمضان").includes("رمضان"))
  assert.ok(defaultGreetingMessage("افتتاح الفرع").includes("افتتاح الفرع"))
})

// --- template registry & sizes ---
test("registry has 4 templates and 2 sizes with exact dimensions", () => {
  assert.equal(POSTER_TEMPLATES.length, 4)
  assert.deepEqual(POSTER_SIZES.square, { width: 1080, height: 1080 })
  assert.deepEqual(POSTER_SIZES.story, { width: 1080, height: 1920 })
  assert.equal(templateMode("offer-multi"), "offer")
  assert.equal(templateMode("greeting-elegant"), "greeting")
})

// --- renderPosterHtml binding ---
const offerInput = {
  template: "offer-single",
  size: "square",
  artUrl: "https://example.com/art.png",
  logoUrl: "https://example.com/logo.png",
  restaurantName: 'مطعم <"الذواقة">',
  palette: { primary: "#9f1239", secondary: "#e11d48", accent: "#fbbf24" },
  payload: {
    mode: "offer",
    currency: "EGP",
    headline: "عروض <الجمعة>",
    products: [{ name: "بيتزا <مارغريتا>", imageUrl: "https://example.com/p.png", oldPrice: 120, newPrice: 90 }],
  },
}

test("offer poster escapes user text and binds prices in Arabic-Indic", () => {
  const html = renderPosterHtml(offerInput)
  assert.ok(!html.includes("بيتزا <مارغريتا>"), "raw product name must not appear")
  assert.ok(html.includes("بيتزا &lt;مارغريتا&gt;"))
  assert.ok(html.includes("مطعم &lt;&quot;الذواقة&quot;&gt;"))
  assert.ok(html.includes("١٢٠ ج.م"), "old price in Arabic-Indic digits")
  assert.ok(html.includes("٩٠ ج.م"), "new price in Arabic-Indic digits")
  assert.ok(html.includes("خصم ٢٥٪"), "discount badge from old/new math")
  assert.ok(html.includes("width: 1080px") && html.includes("height: 1080px"))
})

test("greeting story poster is 1080x1920 and includes message", () => {
  const html = renderPosterHtml({
    template: "greeting-centered",
    size: "story",
    artUrl: "https://example.com/art.png",
    logoUrl: null,
    restaurantName: "مطعم الذواقة",
    palette: null,
    payload: { mode: "greeting", occasion: "رمضان", message: "رمضان كريم! أعاده الله عليكم بالخير" },
  })
  assert.ok(html.includes("height: 1920px"))
  assert.ok(html.includes("رمضان كريم! أعاده الله عليكم بالخير"))
  assert.ok(!html.includes('<img class="brand-logo"'), "no logo img when logoUrl is null")
})

test("template/payload mode mismatch throws", () => {
  assert.throws(() => renderPosterHtml({ ...offerInput, template: "greeting-elegant" }))
})

test("malicious art URL is attribute-escaped", () => {
  const html = renderPosterHtml({ ...offerInput, artUrl: 'x" onerror="alert(1)' })
  assert.ok(!html.includes('onerror="alert'))
  assert.ok(html.includes("x&quot; onerror=&quot;alert(1)"))
})

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
