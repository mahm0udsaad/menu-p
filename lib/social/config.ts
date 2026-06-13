/**
 * Env-driven configuration for Social Connect — the only module that reads
 * platform credential envs. Kept free of "@/…" imports so node unit tests
 * can load the adapter chain directly.
 *
 * Mock mode (per V2-VISION decision #7): SOCIAL_MOCK=1 forces it; otherwise
 * a provider is mocked whenever its developer-app credentials are absent.
 */

import { SocialApiError, type SocialProvider } from "./types"

/** Mirrors lib/config/env.ts getBaseUrl without importing app config. */
export function socialBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  return url.replace(/\/+$/, "")
}

/** OAuth redirect URI registered with each provider's developer app. */
export function callbackUrl(provider: SocialProvider): string {
  return `${socialBaseUrl()}/api/social/callback/${provider}`
}

export function hasMetaCredentials(): boolean {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET)
}

export function hasTikTokCredentials(): boolean {
  return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET)
}

export function isMockMode(provider: SocialProvider): boolean {
  if (process.env.SOCIAL_MOCK === "1") return true
  return provider === "meta" ? !hasMetaCredentials() : !hasTikTokCredentials()
}

export interface MetaCredentials {
  appId: string
  appSecret: string
}

/** Throws an Arabic "not configured" error when the Meta app envs are absent. */
export function requireMetaCredentials(): MetaCredentials {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  if (!appId || !appSecret) {
    throw new SocialApiError(
      "ربط فيسبوك وإنستغرام غير مُفعّل بعد — يلزم ضبط META_APP_ID و META_APP_SECRET على الخادم",
      "config"
    )
  }
  return { appId, appSecret }
}

export interface TikTokCredentials {
  clientKey: string
  clientSecret: string
}

/** Throws an Arabic "not configured" error when the TikTok app envs are absent. */
export function requireTikTokCredentials(): TikTokCredentials {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET
  if (!clientKey || !clientSecret) {
    throw new SocialApiError(
      "ربط تيك توك غير مُفعّل بعد — يلزم ضبط TIKTOK_CLIENT_KEY و TIKTOK_CLIENT_SECRET على الخادم",
      "config"
    )
  }
  return { clientKey, clientSecret }
}

/** OAuth state lifetime: 10 minutes. */
export const STATE_TTL_MS = 10 * 60 * 1000
