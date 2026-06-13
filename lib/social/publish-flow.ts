/**
 * Pure publish-flow logic: token-expiry checks, adapter-call wrapping and
 * the social_posts row patch for each outcome. Kept dependency-free so the
 * DB-state transitions are unit-testable without Supabase.
 */

import { SocialApiError, type PublishPostParams, type PublishResult, type SocialPublisher } from "./types"

/** Refresh when the token expires within this window. */
const REFRESH_WINDOW_MS = 5 * 60 * 1000

export function tokenNeedsRefresh(expiresAt: string | null, nowMs: number = Date.now()): boolean {
  if (!expiresAt) return false
  const expiry = Date.parse(expiresAt)
  if (Number.isNaN(expiry)) return false
  return expiry - nowMs < REFRESH_WINDOW_MS
}

export function arabicPublishError(err: unknown): string {
  if (err instanceof SocialApiError) {
    switch (err.code) {
      case "auth":
        return "انتهت صلاحية ربط الحساب — أعد ربط الحساب ثم حاول مرة أخرى"
      case "rate_limit":
        return "تم تجاوز حد النشر على المنصة — حاول بعد قليل"
      case "network":
        return "تعذر الوصول إلى المنصة — تحقق من الاتصال وحاول مرة أخرى"
      case "unsupported":
        return "هذه العملية غير مدعومة لهذا الحساب"
      case "config":
        return "إعدادات الربط غير مكتملة — راجع docs/SOCIAL-SETUP.md"
      default:
        return "رفضت المنصة المنشور — حاول مرة أخرى"
    }
  }
  return "حدث خطأ غير متوقع أثناء النشر"
}

/** Calls the adapter and never throws — failures become a typed result. */
export async function publishToAccount(
  publisher: Pick<SocialPublisher, "publishPost">,
  params: PublishPostParams
): Promise<PublishResult> {
  try {
    return await publisher.publishPost(params)
  } catch (err) {
    const retryable = err instanceof SocialApiError ? err.retryable : true
    return { success: false, error: arabicPublishError(err), retryable }
  }
}

export interface PostRowPatch {
  status: "posted" | "failed"
  platform_post_id: string | null
  posted_at: string | null
  error: string | null
}

/** The exact social_posts row update for a publish outcome. */
export function patchForResult(result: PublishResult, nowIso: string = new Date().toISOString()): PostRowPatch {
  if (result.success) {
    return { status: "posted", platform_post_id: result.platformPostId, posted_at: nowIso, error: null }
  }
  return { status: "failed", platform_post_id: null, posted_at: null, error: result.error }
}
