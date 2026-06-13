/**
 * Social Connect (Phase 5) — shared types.
 * One SocialPublisher interface; Meta / TikTok / Mock are adapters
 * (V2-VISION decision #7). Token values never appear in logs.
 *
 * This file is runtime-light (one Error subclass, two tiny lookups) so
 * client components may import it safely.
 */

export type SocialPlatform = "meta_facebook" | "meta_instagram" | "tiktok"

/** OAuth happens per developer app: one Meta app covers FB pages + IG. */
export type SocialProvider = "meta" | "tiktok"

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = ["meta_facebook", "meta_instagram", "tiktok"] as const

export const PROVIDER_PLATFORMS: Record<SocialProvider, readonly SocialPlatform[]> = {
  meta: ["meta_facebook", "meta_instagram"],
  tiktok: ["tiktok"],
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  meta_facebook: "فيسبوك",
  meta_instagram: "إنستغرام",
  tiktok: "تيك توك",
}

export function isSocialPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(value)
}

export function isSocialProvider(value: string): value is SocialProvider {
  return value === "meta" || value === "tiktok"
}

export function providerForPlatform(platform: SocialPlatform): SocialProvider {
  return platform === "tiktok" ? "tiktok" : "meta"
}

// ---------------------------------------------------------------------------
// Post targets — what a restaurant can publish
// ---------------------------------------------------------------------------

export type PostTargetKind = "menu" | "menu_page" | "poster" | "qr_code"

export interface PosterCaptionProduct {
  name: string
  newPrice: number
  oldPrice: number | null
}

/** Slice of posters.payload.data the caption builder needs. */
export interface PosterCaptionData {
  kind: "offer" | "greeting"
  title: string | null
  headline?: string | null
  currency?: string
  products?: PosterCaptionProduct[]
  occasion?: string
  message?: string
}

export type PostTarget =
  | { kind: "menu"; menuId: string; menuName: string; link: string; restaurantName: string }
  | { kind: "menu_page"; menuId: string; menuName: string; link: string; restaurantName: string }
  | { kind: "qr_code"; menuId: string; menuName: string; link: string; restaurantName: string }
  | { kind: "poster"; posterId: string; restaurantName: string; data: PosterCaptionData; link?: string | null }

// ---------------------------------------------------------------------------
// OAuth / tokens
// ---------------------------------------------------------------------------

export interface TokenSet {
  accessToken: string
  refreshToken: string | null
  /** ISO timestamp or null for non-expiring tokens (Meta page tokens). */
  expiresAt: string | null
  scopes: string[]
}

/** One connectable account discovered during code exchange (a Meta OAuth
 *  code can yield several pages + linked Instagram accounts at once). */
export interface ConnectedAccountCandidate {
  platform: SocialPlatform
  /** Platform-side id: FB page id / IG user id / TikTok open_id. */
  accountRef: string
  accountName: string
  tokens: TokenSet
}

export interface HandleCallbackResult {
  restaurantId: string
  accounts: ConnectedAccountCandidate[]
}

// ---------------------------------------------------------------------------
// Publishing
// ---------------------------------------------------------------------------

/** Decrypted account view handed to adapters — never persisted as-is. */
export interface AdapterAccount {
  platform: SocialPlatform
  accountRef: string
  accountName: string | null
  accessToken: string
  refreshToken: string | null
}

export interface PublishMedia {
  type: "image" | "link"
  /** Publicly reachable URLs (platforms pull them). */
  urls: string[]
}

export interface PublishPostParams {
  account: AdapterAccount
  media: PublishMedia
  caption: string
}

export type PublishResult =
  | { success: true; platformPostId: string }
  | { success: false; error: string; retryable: boolean }

export type SocialErrorCode = "auth" | "rate_limit" | "network" | "unsupported" | "config" | "state" | "api"

export class SocialApiError extends Error {
  readonly code: SocialErrorCode
  readonly retryable: boolean

  // No parameter properties — keeps the file loadable by node strip-types tests.
  constructor(message: string, code: SocialErrorCode, retryable: boolean = false) {
    super(message)
    this.name = "SocialApiError"
    this.code = code
    this.retryable = retryable
  }
}

// ---------------------------------------------------------------------------
// The one interface every platform adapter implements
// ---------------------------------------------------------------------------

export interface SocialPublisher {
  readonly provider: SocialProvider
  /** True when running without real developer-app credentials. */
  readonly mock: boolean
  /** Absolute OAuth dialog URL carrying a signed state for this restaurant. */
  getAuthUrl(restaurantId: string): string
  /** Verifies the signed state and exchanges the code for account(s)+tokens. */
  handleCallback(code: string, state: string): Promise<HandleCallbackResult>
  publishPost(params: PublishPostParams): Promise<PublishResult>
  refreshToken(account: AdapterAccount): Promise<TokenSet>
  /** Best-effort platform-side revoke; local row update happens regardless. */
  disconnect(account: AdapterAccount): Promise<void>
}

// ---------------------------------------------------------------------------
// DB row shapes shared between actions and UI (token columns excluded)
// ---------------------------------------------------------------------------

export interface SocialAccountPublic {
  id: string
  platform: SocialPlatform
  account_name: string | null
  account_ref: string | null
  status: "connected" | "expired" | "revoked"
  token_expires_at: string | null
  scopes: string[] | null
  created_at: string
}

export interface SocialPostRecord {
  id: string
  social_account_id: string
  target_kind: PostTargetKind
  target_ref: string | null
  caption: string | null
  media_urls: string[]
  status: "draft" | "scheduled" | "posting" | "posted" | "failed"
  posted_at: string | null
  platform_post_id: string | null
  error: string | null
  created_at: string
  /** Joined for the history list. */
  account?: { platform: SocialPlatform; account_name: string | null } | null
}
