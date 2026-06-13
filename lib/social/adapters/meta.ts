/**
 * Meta adapter — Facebook Pages + Instagram Business via Graph API v21.0.
 * Active only when META_APP_ID / META_APP_SECRET are set (otherwise the
 * factory falls back to the mock adapter).
 *
 * OAuth: FB login dialog (pages_manage_posts + instagram_content_publish…)
 * → code → short-lived user token → long-lived user token (fb_exchange_token)
 * → /me/accounts lists pages (non-expiring page tokens) + linked IG accounts.
 * Publishing: FB page = /photos | /feed; IG = container flow
 * (/media → poll status → /media_publish, carousel for multiple images).
 * Tokens never appear in logs or error messages.
 */

import { createNonce, requireTokenKey, signState, verifyState } from "../crypto"
import { callbackUrl, requireMetaCredentials, STATE_TTL_MS } from "../config"
import {
  SocialApiError,
  type AdapterAccount,
  type ConnectedAccountCandidate,
  type HandleCallbackResult,
  type PublishPostParams,
  type PublishResult,
  type SocialPublisher,
  type TokenSet,
} from "../types"

const GRAPH = "https://graph.facebook.com/v21.0"
const DIALOG = "https://www.facebook.com/v21.0/dialog/oauth"
const SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
]

interface GraphErrorBody {
  error?: { message?: string; code?: number; error_subcode?: number }
}

function mapGraphError(body: GraphErrorBody, status: number): SocialApiError {
  const code = body.error?.code
  const message = body.error?.message ?? `Graph API HTTP ${status}`
  if (code === 190 || code === 102 || status === 401) {
    return new SocialApiError(`Meta auth error: ${message}`, "auth")
  }
  if (code === 4 || code === 17 || code === 32 || code === 613 || status === 429) {
    return new SocialApiError(`Meta rate limit: ${message}`, "rate_limit", true)
  }
  return new SocialApiError(`Meta API error: ${message}`, "api", status >= 500)
}

/** POST/GET helper — token travels in the body/query, never in thrown errors. */
async function graph<T>(path: string, params: Record<string, string>, method: "GET" | "POST" | "DELETE" = "GET"): Promise<T> {
  const url = new URL(`${GRAPH}${path}`)
  let init: RequestInit = { method }
  if (method !== "POST") {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  } else {
    init = { method, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params).toString() }
  }
  let res: Response
  try {
    res = await fetch(url.toString(), init)
  } catch {
    throw new SocialApiError("تعذر الوصول إلى خوادم Meta", "network", true)
  }
  const body = (await res.json().catch(() => ({}))) as T & GraphErrorBody
  if (!res.ok || body.error) throw mapGraphError(body, res.status)
  return body
}

interface PageEntry {
  id: string
  name: string
  access_token: string
  instagram_business_account?: { id: string; username?: string; name?: string }
}

export class MetaAdapter implements SocialPublisher {
  readonly provider = "meta" as const
  readonly mock = false

  getAuthUrl(restaurantId: string): string {
    const { appId } = requireMetaCredentials()
    const key = requireTokenKey()
    const state = signState(
      { restaurantId, platform: "meta", nonce: createNonce(), exp: Date.now() + STATE_TTL_MS },
      key
    )
    const url = new URL(DIALOG)
    url.searchParams.set("client_id", appId)
    url.searchParams.set("redirect_uri", callbackUrl("meta"))
    url.searchParams.set("state", state)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", SCOPES.join(","))
    return url.toString()
  }

  async handleCallback(code: string, state: string): Promise<HandleCallbackResult> {
    const { appId, appSecret } = requireMetaCredentials()
    const parsed = verifyState(state, requireTokenKey())
    if (!parsed) throw new SocialApiError("رابط الربط غير صالح أو منتهي الصلاحية — أعد المحاولة", "state")

    const short = await graph<{ access_token: string }>("/oauth/access_token", {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: callbackUrl("meta"),
      code,
    })
    const long = await graph<{ access_token: string; expires_in?: number }>("/oauth/access_token", {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: short.access_token,
    })
    const userToken = long.access_token

    const pages = await graph<{ data: PageEntry[] }>("/me/accounts", {
      fields: "id,name,access_token,instagram_business_account{id,username,name}",
      access_token: userToken,
    })
    if (!pages.data?.length) {
      throw new SocialApiError("لا توجد صفحة فيسبوك مرتبطة بهذا الحساب — أنشئ صفحة أولاً", "unsupported")
    }

    const accounts: ConnectedAccountCandidate[] = []
    for (const page of pages.data) {
      // Page tokens derived from a long-lived user token do not expire.
      const tokens: TokenSet = { accessToken: page.access_token, refreshToken: userToken, expiresAt: null, scopes: SCOPES }
      accounts.push({ platform: "meta_facebook", accountRef: page.id, accountName: page.name, tokens })
      const ig = page.instagram_business_account
      if (ig) {
        accounts.push({
          platform: "meta_instagram",
          accountRef: ig.id,
          accountName: ig.username ?? ig.name ?? page.name,
          tokens: { ...tokens },
        })
      }
    }
    return { restaurantId: parsed.restaurantId, accounts }
  }

  async publishPost({ account, media, caption }: PublishPostParams): Promise<PublishResult> {
    const id = account.platform === "meta_instagram"
      ? await this.publishInstagram(account, media.urls, caption)
      : await this.publishFacebook(account, media, caption)
    return { success: true, platformPostId: id }
  }

  private async publishFacebook(
    account: AdapterAccount,
    media: { type: "image" | "link"; urls: string[] },
    caption: string
  ): Promise<string> {
    const token = account.accessToken
    if (media.type === "link") {
      const res = await graph<{ id: string }>(`/${account.accountRef}/feed`, { message: caption, link: media.urls[0] ?? "", access_token: token }, "POST")
      return res.id
    }
    if (media.urls.length <= 1) {
      const res = await graph<{ id: string; post_id?: string }>(
        `/${account.accountRef}/photos`,
        { url: media.urls[0] ?? "", caption, access_token: token },
        "POST"
      )
      return res.post_id ?? res.id
    }
    const mediaIds: string[] = []
    for (const url of media.urls.slice(0, 10)) {
      const res = await graph<{ id: string }>(`/${account.accountRef}/photos`, { url, published: "false", access_token: token }, "POST")
      mediaIds.push(res.id)
    }
    const params: Record<string, string> = { message: caption, access_token: token }
    mediaIds.forEach((mid, i) => { params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: mid }) })
    const res = await graph<{ id: string }>(`/${account.accountRef}/feed`, params, "POST")
    return res.id
  }

  private async publishInstagram(account: AdapterAccount, urls: string[], caption: string): Promise<string> {
    const token = account.accessToken
    if (urls.length === 0) throw new SocialApiError("إنستغرام يتطلب صورة — لا يمكن نشر رابط فقط", "unsupported")
    let creationId: string
    if (urls.length === 1) {
      const res = await graph<{ id: string }>(`/${account.accountRef}/media`, { image_url: urls[0], caption, access_token: token }, "POST")
      creationId = res.id
    } else {
      const children: string[] = []
      for (const url of urls.slice(0, 10)) {
        const child = await graph<{ id: string }>(`/${account.accountRef}/media`, { image_url: url, is_carousel_item: "true", access_token: token }, "POST")
        children.push(child.id)
      }
      const res = await graph<{ id: string }>(
        `/${account.accountRef}/media`,
        { media_type: "CAROUSEL", children: children.join(","), caption, access_token: token },
        "POST"
      )
      creationId = res.id
    }
    await this.waitForContainer(creationId, token)
    const published = await graph<{ id: string }>(`/${account.accountRef}/media_publish`, { creation_id: creationId, access_token: token }, "POST")
    return published.id
  }

  private async waitForContainer(creationId: string, token: string): Promise<void> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const status = await graph<{ status_code?: string }>(`/${creationId}`, { fields: "status_code", access_token: token })
      if (status.status_code === "FINISHED") return
      if (status.status_code === "ERROR") throw new SocialApiError("فشل تجهيز الصورة على إنستغرام", "api", true)
      await new Promise((r) => setTimeout(r, 1500))
    }
    throw new SocialApiError("انتهت مهلة تجهيز الصورة على إنستغرام — حاول مرة أخرى", "api", true)
  }

  async refreshToken(account: AdapterAccount): Promise<TokenSet> {
    const { appId, appSecret } = requireMetaCredentials()
    if (!account.refreshToken) throw new SocialApiError("لا يوجد رمز تحديث — أعد ربط الحساب", "auth")
    const long = await graph<{ access_token: string }>("/oauth/access_token", {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: account.refreshToken,
    })
    // Re-derive this page's (or IG's backing page) token from the fresh user token.
    const pages = await graph<{ data: PageEntry[] }>("/me/accounts", {
      fields: "id,name,access_token,instagram_business_account{id}",
      access_token: long.access_token,
    })
    const page = pages.data.find(
      (p) => p.id === account.accountRef || p.instagram_business_account?.id === account.accountRef
    )
    if (!page) throw new SocialApiError("لم يعد لهذا الحساب صلاحية على الصفحة — أعد الربط", "auth")
    return { accessToken: page.access_token, refreshToken: long.access_token, expiresAt: null, scopes: SCOPES }
  }

  async disconnect(account: AdapterAccount): Promise<void> {
    try {
      const token = account.refreshToken ?? account.accessToken
      await graph("/me/permissions", { access_token: token }, "DELETE")
    } catch {
      // Best-effort revoke — local row is marked revoked regardless.
    }
  }
}
