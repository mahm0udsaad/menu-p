// Social Connect unit tests (Phase 5).
// Run: node --experimental-strip-types --import ./lib/ai/__tests__/register-ts.mjs lib/social/__tests__/social.test.mjs
import assert from "node:assert/strict"
import { randomBytes } from "node:crypto"

process.env.SOCIAL_MOCK = "1"
process.env.NEXT_PUBLIC_APP_URL = "https://menu-p.test"

const { parseKey, encryptToken, decryptToken, signState, verifyState, createNonce } = await import("../crypto.ts")
const { buildAutoCaption, captionTitle } = await import("../captions.ts")
const { MockSocialAdapter, mockPlatformPostId } = await import("../adapters/mock.ts")
const { tokenNeedsRefresh, patchForResult, publishToAccount } = await import("../publish-flow.ts")

let passed = 0
const test = (name, fn) => Promise.resolve(fn()).then(() => { passed++; console.log(`  ok ${name}`) })

// --------------------------------------------------------------------------
// crypto: AES-256-GCM round-trip + tamper detection + key formats
// --------------------------------------------------------------------------
const hexKey = randomBytes(32).toString("hex")
const key = parseKey(hexKey)

await test("parseKey accepts 64-char hex and 32-byte base64, rejects short keys", () => {
  assert.equal(parseKey(hexKey).length, 32)
  assert.equal(parseKey(randomBytes(32).toString("base64")).length, 32)
  assert.throws(() => parseKey("dG9vLXNob3J0"))
})

await test("encrypt/decrypt round-trip (unicode token)", () => {
  const token = "EAAGm0PX4ZCps-سر-secret-🟢-" + randomBytes(8).toString("hex")
  const sealed = encryptToken(token, key)
  assert.notEqual(sealed.includes(token), true)
  assert.equal(decryptToken(sealed, key), token)
})

await test("tamper detection: flipped ciphertext / tag / wrong key all throw", () => {
  const sealed = encryptToken("secret-token", key)
  const parts = sealed.split(".")
  const tampered = [parts[0], parts[1], parts[2].slice(0, -2) + "AA", parts[3]].join(".")
  assert.throws(() => decryptToken(tampered, key))
  const badTag = [parts[0], parts[1], parts[2], parts[3].slice(0, -2) + "AA"].join(".")
  assert.throws(() => decryptToken(badTag, key))
  assert.throws(() => decryptToken(sealed, parseKey(randomBytes(32).toString("hex"))))
  assert.throws(() => decryptToken("v0.a.b.c", key))
})

// --------------------------------------------------------------------------
// OAuth state: sign/verify, tamper, expiry
// --------------------------------------------------------------------------
await test("state sign/verify round-trip", () => {
  const state = { restaurantId: "22222222-2222-4222-8222-222222222222", platform: "meta", nonce: createNonce(), exp: Date.now() + 60_000 }
  const raw = signState(state, key)
  const back = verifyState(raw, key)
  assert.deepEqual(back, state)
})

await test("state verify rejects tamper, wrong key and expiry", () => {
  const state = { restaurantId: "r1", platform: "tiktok", nonce: createNonce(), exp: Date.now() + 60_000 }
  const raw = signState(state, key)
  assert.equal(verifyState(raw.slice(0, -3) + "abc", key), null)
  const [body] = raw.split(".")
  const forgedBody = Buffer.from(JSON.stringify({ ...state, restaurantId: "evil" })).toString("base64url")
  assert.equal(verifyState(raw.replace(body, forgedBody), key), null)
  assert.equal(verifyState(raw, parseKey(randomBytes(32).toString("hex"))), null)
  const expired = signState({ ...state, exp: Date.now() - 1 }, key)
  assert.equal(verifyState(expired, key), null)
})

// --------------------------------------------------------------------------
// Captions: all 4 target kinds, Arabic + hashtags
// --------------------------------------------------------------------------
const base = { menuId: "m1", menuName: "قائمة الإفطار", link: "https://menu-p.test/menus/m1", restaurantName: "مطعم السلام" }

await test("caption: menu includes name, link and hashtags", () => {
  const c = buildAutoCaption({ kind: "menu", ...base })
  assert.ok(c.includes("مطعم السلام") && c.includes(base.link) && c.includes("#منيو"))
})

await test("caption: menu_page mentions the menu name + link", () => {
  const c = buildAutoCaption({ kind: "menu_page", ...base })
  assert.ok(c.includes("قائمة الإفطار") && c.includes(base.link) && c.includes("#مطاعم"))
})

await test("caption: qr_code invites scanning", () => {
  const c = buildAutoCaption({ kind: "qr_code", ...base })
  assert.ok(c.includes("امسحوا الكود") && c.includes("#QR"))
})

await test("caption: poster offer lists products with old price + discount", () => {
  const c = buildAutoCaption({
    kind: "poster",
    posterId: "p1",
    restaurantName: "مطعم السلام",
    link: base.link,
    data: { kind: "offer", title: "عرض الويكند", currency: "EGP", products: [{ name: "بيتزا مارجريتا", newPrice: 75, oldPrice: 100 }] },
  })
  assert.ok(c.includes("بيتزا مارجريتا") && c.includes("بدلاً من") && c.includes("#عروض"))
})

await test("caption: poster greeting uses occasion + message", () => {
  const c = buildAutoCaption({
    kind: "poster",
    posterId: "p2",
    restaurantName: "مطعم السلام",
    data: { kind: "greeting", title: null, occasion: "عيد الفطر", message: "كل عام وأنتم بخير" },
  })
  assert.ok(c.includes("عيد الفطر") && c.includes("كل عام وأنتم بخير") && c.includes("#تهنئة"))
})

await test("captionTitle truncates to 90 chars from the first non-empty line", () => {
  assert.equal(captionTitle("🔥 عرض خاص\nالتفاصيل"), "🔥 عرض خاص")
  assert.equal(captionTitle("x".repeat(200)).length, 90)
})

// --------------------------------------------------------------------------
// Mock adapter: OAuth loop, happy publish, simulated FAIL
// --------------------------------------------------------------------------
await test("mock adapter: getAuthUrl → handleCallback round-trip yields FB + IG", async () => {
  const adapter = new MockSocialAdapter("meta")
  const url = new URL(adapter.getAuthUrl("rest-1"))
  assert.ok(url.pathname.endsWith("/api/social/callback/meta"))
  const result = await adapter.handleCallback(url.searchParams.get("code"), url.searchParams.get("state"))
  assert.equal(result.restaurantId, "rest-1")
  assert.deepEqual(result.accounts.map((a) => a.platform), ["meta_facebook", "meta_instagram"])
  assert.ok(result.accounts[0].tokens.accessToken.startsWith("mock-access-"))
})

await test("mock adapter: rejects tampered state", async () => {
  const adapter = new MockSocialAdapter("tiktok")
  await assert.rejects(() => adapter.handleCallback("mock-code-tiktok", "forged.state"))
})

const account = { platform: "meta_facebook", accountRef: "mock-fb-12345678", accountName: "page", accessToken: "t", refreshToken: null }

await test("mock adapter: happy publish returns realistic platform post id", async () => {
  const adapter = new MockSocialAdapter("meta")
  const result = await adapter.publishPost({ account, media: { type: "image", urls: ["https://x/img.png"] }, caption: "مرحباً" })
  assert.equal(result.success, true)
  assert.match(result.platformPostId, /^10\d{8}_\d{15}$/)
  assert.match(mockPlatformPostId("tiktok", "mock-tt-1"), /^p_pub_url~v2\.\d{19}$/)
  assert.match(mockPlatformPostId("meta_instagram", "mock-ig-1"), /^18\d{15}$/)
})

await test("mock adapter: caption containing FAIL simulates platform rejection", async () => {
  const adapter = new MockSocialAdapter("meta")
  const result = await adapter.publishPost({ account, media: { type: "image", urls: ["https://x/img.png"] }, caption: "FAIL هذا اختبار" })
  assert.equal(result.success, false)
  assert.ok(result.error.length > 0 && result.retryable === true)
})

// --------------------------------------------------------------------------
// publish-flow: refresh window + row patches + never-throws wrapper
// --------------------------------------------------------------------------
await test("tokenNeedsRefresh: null/far-future false, near-expiry true", () => {
  assert.equal(tokenNeedsRefresh(null), false)
  assert.equal(tokenNeedsRefresh(new Date(Date.now() + 60 * 60_000).toISOString()), false)
  assert.equal(tokenNeedsRefresh(new Date(Date.now() + 60_000).toISOString()), true)
})

await test("patchForResult maps outcomes to social_posts row updates", () => {
  const ok = patchForResult({ success: true, platformPostId: "123_456" }, "2026-06-10T12:00:00Z")
  assert.deepEqual(ok, { status: "posted", platform_post_id: "123_456", posted_at: "2026-06-10T12:00:00Z", error: null })
  const bad = patchForResult({ success: false, error: "رفض", retryable: true })
  assert.equal(bad.status, "failed")
  assert.equal(bad.error, "رفض")
})

await test("publishToAccount never throws — adapter exceptions become Arabic failures", async () => {
  const result = await publishToAccount(
    { publishPost: async () => { throw new Error("boom") } },
    { account, media: { type: "image", urls: ["https://x/a.png"] }, caption: "x" }
  )
  assert.equal(result.success, false)
  assert.ok(result.error.length > 0)
})

console.log(`\n${passed} tests passed`)
