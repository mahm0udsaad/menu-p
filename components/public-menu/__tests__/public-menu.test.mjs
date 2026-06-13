// Public menu + theming unit tests (Phase 6).
// Run: node --experimental-strip-types --import ./lib/ai/__tests__/register-ts.mjs \
//        components/public-menu/__tests__/public-menu.test.mjs
import assert from "node:assert/strict"

import {
  buildThemePalette,
  contrastRatio,
  ensureContrast,
  normalizeHex,
  extractBrandColorsFromPixels,
} from "../../../lib/theming/palette.ts"
import { buildMenuTheme } from "../../../lib/theming/theme.ts"
import {
  formatPrice,
  isRtl,
  languageLabel,
  resolveLanguage,
  toArabicDigits,
  whatsappHref,
} from "../i18n.ts"
import { categoriesForLanguage } from "../types.ts"

let passed = 0
function test(name, fn) {
  fn()
  passed++
  console.log(`  ok: ${name}`)
}

// ---------------------------------------------------------------- contrast
test("normalizeHex accepts #abc / abc / #AABBCC, rejects garbage", () => {
  assert.equal(normalizeHex("#abc"), "#aabbcc")
  assert.equal(normalizeHex("AABBCC"), "#aabbcc")
  assert.equal(normalizeHex("  #FF0000 "), "#ff0000")
  assert.equal(normalizeHex("red"), null)
  assert.equal(normalizeHex("#12345"), null)
  assert.equal(normalizeHex(null), null)
})

test("ensureContrast reaches 4.5:1 from terrible inputs", () => {
  for (const [fg, bg] of [
    ["#888888", "#777777"], // gray on gray
    ["#ffffff", "#ffffff"], // white on white
    ["#fefefe", "#f5f5f5"], // near-white pair
    ["#101010", "#000000"], // near-black pair
    ["#ff0000", "#fa3c3c"], // red on red
  ]) {
    const fixed = ensureContrast(fg, bg, 4.5)
    assert.ok(
      contrastRatio(fixed, bg) >= 4.5,
      `expected ${fg} on ${bg} -> ${fixed} to reach 4.5, got ${contrastRatio(fixed, bg).toFixed(2)}`,
    )
  }
})

test("buildThemePalette enforces WCAG AA for every text pair", () => {
  for (const brand of [
    null, // no brand at all → default rose
    { primary: "#ffffff" }, // washed-out logo background
    { primary: "#fffe00", secondary: "#ffff99", accent: "#fffff0" }, // neon yellows
    { primary: "#000000", secondary: "#050505", accent: "#0a0a0a" }, // all black
    { primary: "#0f766e", secondary: "#134e4a", accent: "#b45309" }, // sane brand
  ]) {
    const p = buildThemePalette(brand)
    assert.ok(contrastRatio(p.text, p.bg) >= 4.5, `text/bg AA for ${JSON.stringify(brand)}`)
    assert.ok(contrastRatio(p.onPrimary, p.primary) >= 4.5, `onPrimary/primary AA`)
    assert.ok(contrastRatio(p.primary, p.bg) >= 3, `primary/bg large-text contrast`)
    for (const key of ["primary", "secondary", "accent", "bg", "text", "onPrimary"]) {
      assert.match(p[key], /^#[0-9a-f]{6}$/, `${key} is normalized hex`)
    }
  }
})

test("buildMenuTheme falls back: color_palette > extracted > default", () => {
  const stored = buildMenuTheme({ color_palette: { primary: "#0f766e" } }, null, {
    primary: "#ff0000",
  })
  assert.notEqual(stored.palette.primary, buildMenuTheme({}, null, null).palette.primary)
  const extracted = buildMenuTheme({ color_palette: null }, null, { primary: "#1d4ed8" })
  const fallback = buildMenuTheme({ color_palette: null }, null, null)
  assert.notEqual(extracted.palette.primary, fallback.palette.primary)
  assert.ok(fallback.cssVars.includes("--menu-primary:"))
})

test("extractBrandColorsFromPixels ignores transparent/white, finds the brand color", () => {
  // 8x8 image: half transparent, quarter white, quarter teal.
  const size = 8
  const pixels = new Uint8ClampedArray(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const o = i * 4
    if (i < 32) pixels[o + 3] = 0 // transparent padding
    else if (i < 48) {
      pixels.set([255, 255, 255, 255], o) // paper white
    } else {
      pixels.set([15, 118, 110, 255], o) // teal #0f766e
    }
  }
  const brand = extractBrandColorsFromPixels({ width: size, height: size, pixels })
  assert.ok(brand, "found colors")
  assert.equal(brand.primary, "#0f766e")
  const empty = extractBrandColorsFromPixels({
    width: 2,
    height: 2,
    pixels: new Uint8ClampedArray(16), // fully transparent
  })
  assert.equal(empty, null)
})

// ---------------------------------------------------------------- language
test("resolveLanguage precedence: param > stored > fallback, unknown ignored", () => {
  const langs = ["ar", "en"]
  assert.equal(resolveLanguage("en", "ar", langs, "ar"), "en")
  assert.equal(resolveLanguage(undefined, "en", langs, "ar"), "en")
  assert.equal(resolveLanguage(undefined, undefined, langs, "ar"), "ar")
  assert.equal(resolveLanguage("fr", "de", langs, "ar"), "ar") // both unknown
  assert.equal(resolveLanguage(undefined, undefined, ["en"], "ar"), "en") // fallback missing
  assert.equal(resolveLanguage(undefined, undefined, [], "ar"), "ar") // empty list
})

test("languageLabel + isRtl", () => {
  assert.equal(languageLabel("ar"), "العربية")
  assert.equal(languageLabel("xx"), "XX")
  assert.equal(isRtl("ar"), true)
  assert.equal(isRtl("en"), false)
})

test("categoriesForLanguage merges translated text over live data", () => {
  const live = [
    {
      id: "c1",
      name: "المشاوي",
      description: "وصف",
      display_order: 1,
      items: [
        {
          id: "i1",
          name: "كباب",
          description: "لحم",
          price: 180,
          image_url: "x.jpg",
          is_featured: true,
          is_available: false,
          dietary_info: ["حار"],
          display_order: 1,
        },
      ],
    },
  ]
  const translations = {
    en: [{ id: "c1", name: "Grills", menu_items: [{ id: "i1", name: "Kebab", description: "Lamb" }] }],
  }
  const en = categoriesForLanguage(live, translations, "ar", "en")
  assert.equal(en[0].name, "Grills")
  assert.equal(en[0].items[0].name, "Kebab")
  assert.equal(en[0].items[0].price, 180) // live price kept
  assert.equal(en[0].items[0].is_available, false) // live availability kept
  // source language and missing snapshot → live untouched
  assert.equal(categoriesForLanguage(live, translations, "ar", "ar"), live)
  assert.equal(categoriesForLanguage(live, translations, "ar", "fr"), live)
})

// ---------------------------------------------------------------- formatting
test("formatPrice: Arabic digits + currency labels, EN passthrough", () => {
  assert.equal(formatPrice(45, "EGP", "ar"), "٤٥ ج.م")
  assert.equal(formatPrice(45.5, "SAR", "ar"), "٤٥٫٥٠ ر.س")
  assert.equal(formatPrice(45, "EGP", "en"), "45 EGP")
  assert.equal(formatPrice(9.99, "USD", "en"), "9.99 $")
  assert.equal(formatPrice(null, "EGP", "ar"), null)
  assert.equal(toArabicDigits("120.5"), "١٢٠٫٥")
})

test("whatsappHref strips formatting, rejects short numbers", () => {
  assert.equal(whatsappHref("+20 100 123 4567"), "https://wa.me/201001234567")
  assert.equal(whatsappHref("123"), null)
  assert.equal(whatsappHref(null), null)
})

console.log(`\n${passed} tests passed`)
