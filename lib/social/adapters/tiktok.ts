/**
 * TikTok adapter — Login Kit OAuth + Content Posting API (direct photo post).
 * Active only when TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET are set
 * (otherwise the factory falls back to the mock adapter).
 *
 * OAuth: tiktok.com/v2/auth/authorize → code → POST /v2/oauth/token/
 * (access + refresh tokens, open_id) → GET /v2/user/info/ for display name.
 * Publishing: POST /v2/post/publish/content/init/ with PULL_FROM_URL photo
 * source and DIRECT_POST mode — image URLs must be publicly reachable and
 * the domain verified in the TikTok developer app. Tokens never logged.
 */

import { createNonce, requireTokenKey, signState, verifyState } from "../crypto"
import { callbackUrl, requireTikTokCredentials, STATE_TTL_MS } from "../config"
import { captionTitle } from "../captions"
import {
  SocialApiError,
  type AdapterAccount,
  type HandleCallbackResult,
  type PublishPostParams,
  type PublishResult,
  type SocialPublisher,
  type TokenSet,
} from "../types"

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
const API = "https://open.tiktokapis.com/v2"
const SCOPES = ["user.info.basic", "video.publish"]

interface TikTokErrorBody {
  error?: { code?: string; message?: string }
}

function mapTikTokError(body: TikTokErrorBody, status: number): SocialApiError {
  const code = body.error?.code ?? ""
  const message = body.error?.message ?? `TikTok HTTP ${status}`
  if (status === 401 || code.includes("token") || code === "access_token_invalid") {
    return new SocialApiError(`TikTok auth error: ${message}`, "auth")
  }
  if (status === 429 || code.includes("rate_limit") || code.includes("spam_risk")) {
    return new SocialApiError(`TikTok rate limit: ${message}`, "rate_limit", true)
  }
  return new SocialApiError(`TikTok API error: ${message}`, "api", status >= 500)
}

async function tiktokFetch<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, init)
  } catch {
    throw new SocialApiError("تعذر الوصول إلى خوادم تيك توك", "network", true)
  }
  const body = (await res.json().catch(() => ({}))) as T & TikTokErrorBody
  const errCode = body.error?.code
  if (!res.ok || (errCode && errCode !== "ok")) throw mapTikTokError(body, res.status)
  return body
}

function form(params: Record<string, string>): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  }
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  open_id: string
  scope?: string
}

function toTokenSet(token: TokenResponse): TokenSet {
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    scopes: token.scope ? token.scope.split(",") : SCOPES,
  }
}

export class TikTokAdapter implements SocialPublisher {
  readonly provider = "tiktok" as const
  readonly mock = false

  getAuthUrl(restaurantId: string): string {
    const { clientKey } = requireTikTokCredentials()
    const key = requireTokenKey()
    const state = signState(
      { restaurantId, platform: "tiktok", nonce: createNonce(), exp: Date.now() + STATE_TTL_MS },
      key
    )
    const url = new URL(AUTH_URL)
    url.searchParams.set("client_key", clientKey)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", SCOPES.join(","))
    url.searchParams.set("redirect_uri", callbackUrl("tiktok"))
    url.searchParams.set("state", state)
    return url.toString()
  }

  async handleCallback(code: string, state: string): Promise<HandleCallbackResult> {
    const { clientKey, clientSecret } = requireTikTokCredentials()
    const parsed = verifyState(state, requireTokenKey())
    if (!parsed) throw new SocialApiError("رابط الربط غير صالح أو منتهي الصلاحية — أعد المحاولة", "state")

    const token = await tiktokFetch<TokenResponse>(
      "/oauth/token/",
      form({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl("tiktok"),
      })
    )

    let displayName = "TikTok"
    try {
      const info = await tiktokFetch<{ data?: { user?: { display_name?: string } } }>(
        "/user/info/?fields=open_id,display_name",
        { method: "GET", headers: { Authorization: `Bearer ${token.access_token}` } }
      )
      displayName = info.data?.user?.display_name ?? displayName
    } catch {
      // Name lookup is cosmetic — connection still succeeds.
    }

    return {
      restaurantId: parsed.restaurantId,
      accounts: [
        { platform: "tiktok", accountRef: token.open_id, accountName: displayName, tokens: toTokenSet(token) },
      ],
    }
  }

  async publishPost({ account, media, caption }: PublishPostParams): Promise<PublishResult> {
    if (media.type !== "image" || media.urls.length === 0) {
      throw new SocialApiError("تيك توك يتطلب صورة واحدة على الأقل — لا يمكن نشر رابط فقط", "unsupported")
    }
    const body = {
      post_info: {
        title: captionTitle(caption),
        description: caption.slice(0, 4000),
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_comment: false,
        auto_add_music: true,
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_cover_index: 0,
        photo_images: media.urls.slice(0, 35),
      },
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
    }
    const res = await tiktokFetch<{ data?: { publish_id?: string } }>("/post/publish/content/init/", {
      method: "POST",
      headers: { Authorization: `Bearer ${account.accessToken}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(body),
    })
    const publishId = res.data?.publish_id
    if (!publishId) throw new SocialApiError("لم يُرجِع تيك توك معرف النشر", "api", true)
    return { success: true, platformPostId: publishId }
  }

  async refreshToken(account: AdapterAccount): Promise<TokenSet> {
    const { clientKey, clientSecret } = requireTikTokCredentials()
    if (!account.refreshToken) throw new SocialApiError("لا يوجد رمز تحديث — أعد ربط الحساب", "auth")
    const token = await tiktokFetch<TokenResponse>(
      "/oauth/token/",
      form({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
      })
    )
    return toTokenSet(token)
  }

  async disconnect(account: AdapterAccount): Promise<void> {
    try {
      const { clientKey, clientSecret } = requireTikTokCredentials()
      await tiktokFetch(
        "/oauth/revoke/",
        form({ client_key: clientKey, client_secret: clientSecret, token: account.accessToken })
      )
    } catch {
      // Best-effort revoke — local row is marked revoked regardless.
    }
  }
}
