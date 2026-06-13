/**
 * Mock adapter — used whenever real developer-app credentials are absent or
 * SOCIAL_MOCK=1 (V2-VISION decision #7: build + test with a mock until
 * credentials exist).
 *
 * The OAuth loop works end-to-end offline: getAuthUrl points straight back
 * at our own callback with code=mock-code-…, handleCallback verifies the
 * signed state and fabricates account(s) (Meta yields a FB page AND its
 * linked IG account, like the real Graph API). publishPost waits ~0.4s and
 * returns a realistic platform post id — unless the caption contains the
 * literal word FAIL, which simulates a platform rejection. Tokens are random
 * and still travel through the normal encrypt/decrypt path. No secrets are
 * ever logged.
 */

import { randomBytes } from "crypto"
import { createNonce, getTokenKey, signState, verifyState } from "../crypto"
import { callbackUrl, STATE_TTL_MS } from "../config"
import {
  SocialApiError,
  type AdapterAccount,
  type ConnectedAccountCandidate,
  type HandleCallbackResult,
  type PublishPostParams,
  type PublishResult,
  type SocialPlatform,
  type SocialProvider,
  type SocialPublisher,
  type TokenSet,
} from "../types"

const MOCK_NAMES: Record<SocialPlatform, string> = {
  meta_facebook: "صفحة فيسبوك تجريبية",
  meta_instagram: "mock.restaurant.ig",
  tiktok: "حساب تيك توك تجريبي",
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const digits = (count: number): string =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join("")

function fakeTokens(): TokenSet {
  return {
    accessToken: `mock-access-${randomBytes(12).toString("base64url")}`,
    refreshToken: `mock-refresh-${randomBytes(12).toString("base64url")}`,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    scopes: ["mock"],
  }
}

/** Shapes match the real platforms: FB `{pageId}_{postId}`, IG numeric id, TikTok publish id. */
export function mockPlatformPostId(platform: SocialPlatform, accountRef: string): string {
  switch (platform) {
    case "meta_facebook":
      return `${accountRef.replace(/^mock-fb-/, "10")}_${digits(15)}`
    case "meta_instagram":
      return `18${digits(15)}`
    case "tiktok":
      return `p_pub_url~v2.${digits(19)}`
  }
}

export class MockSocialAdapter implements SocialPublisher {
  readonly mock = true
  readonly provider: SocialProvider

  constructor(provider: SocialProvider) {
    this.provider = provider
  }

  getAuthUrl(restaurantId: string): string {
    const { key } = getTokenKey()
    const state = signState(
      { restaurantId, platform: this.provider, nonce: createNonce(), exp: Date.now() + STATE_TTL_MS },
      key
    )
    // Loop straight back to our own callback — no external provider needed.
    const url = new URL(callbackUrl(this.provider))
    url.searchParams.set("code", `mock-code-${this.provider}`)
    url.searchParams.set("state", state)
    return url.toString()
  }

  async handleCallback(code: string, state: string): Promise<HandleCallbackResult> {
    await delay(150)
    const { key } = getTokenKey()
    const parsed = verifyState(state, key)
    if (!parsed) throw new SocialApiError("رابط الربط غير صالح أو منتهي الصلاحية — أعد المحاولة", "state")
    if (!code.startsWith("mock-code-")) throw new SocialApiError("رمز التفويض غير صالح", "api")

    const accounts: ConnectedAccountCandidate[] =
      this.provider === "meta"
        ? [
            {
              platform: "meta_facebook",
              accountRef: `mock-fb-${digits(8)}`,
              accountName: MOCK_NAMES.meta_facebook,
              tokens: fakeTokens(),
            },
            {
              platform: "meta_instagram",
              accountRef: `mock-ig-${digits(8)}`,
              accountName: MOCK_NAMES.meta_instagram,
              tokens: fakeTokens(),
            },
          ]
        : [
            {
              platform: "tiktok",
              accountRef: `mock-tt-${digits(8)}`,
              accountName: MOCK_NAMES.tiktok,
              tokens: fakeTokens(),
            },
          ]

    return { restaurantId: parsed.restaurantId, accounts }
  }

  async publishPost({ account, media, caption }: PublishPostParams): Promise<PublishResult> {
    await delay(400)
    if (caption.includes("FAIL")) {
      return { success: false, error: "محاكاة رفض المنصة للمنشور (النص يحتوي كلمة FAIL)", retryable: true }
    }
    if (media.type === "image" && media.urls.length === 0) {
      return { success: false, error: "لا توجد صورة صالحة للنشر", retryable: false }
    }
    if (media.type === "link" && account.platform !== "meta_facebook") {
      return { success: false, error: "نشر الروابط متاح على فيسبوك فقط — أضف صورة لباقي المنصات", retryable: false }
    }
    console.info(
      `[social:mock:${account.platform}] published media=${media.type}×${media.urls.length} captionChars=${caption.length}`
    )
    return { success: true, platformPostId: mockPlatformPostId(account.platform, account.accountRef) }
  }

  async refreshToken(_account: AdapterAccount): Promise<TokenSet> {
    await delay(100)
    return fakeTokens()
  }

  async disconnect(_account: AdapterAccount): Promise<void> {
    await delay(100)
  }
}
