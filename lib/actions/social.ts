"use server"

/**
 * Social Connect server actions (Phase 5).
 * connectAccount → adapter OAuth URL; the callback route stores tokens.
 * createPost drives social_posts draft → posting → posted/failed per
 * account via the adapter chain (mock when credentials are absent).
 * Ownership verified via restaurants.user_id on every action; RLS backs it.
 * Encrypted token columns never leave the server; tokens never logged.
 */

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAdapter } from "@/lib/social"
import { decryptToken, encryptToken, getTokenKey } from "@/lib/social/crypto"
import { patchForResult, publishToAccount, tokenNeedsRefresh } from "@/lib/social/publish-flow"
import { ensureMenuQrImage } from "@/lib/social/qr-image"
import {
  isSocialProvider,
  type AdapterAccount,
  type PostTargetKind,
  type PublishMedia,
  type SocialAccountPublic,
  type SocialPlatform,
  type SocialPostRecord,
} from "@/lib/social/types"

const PAGE_PATH = "/dashboard/social"
const PUBLIC_COLS = "id, platform, account_name, account_ref, status, token_expires_at, scopes, created_at"
const TARGET_KINDS: readonly PostTargetKind[] = ["menu", "menu_page", "poster", "qr_code"]

async function getOwnedRestaurantId(
  supabase: ReturnType<typeof createClient>
): Promise<{ ok: true; restaurantId: string } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "يجب تسجيل الدخول أولاً" }
  const { data, error } = await supabase.from("restaurants").select("id").eq("user_id", user.id).single()
  if (error || !data) return { ok: false, error: "لم يتم العثور على مطعم لهذا الحساب" }
  return { ok: true, restaurantId: data.id as string }
}

// ---------------------------------------------------------------------------
// Connections
// ---------------------------------------------------------------------------

/** Returns the provider OAuth dialog URL — the client redirects to it. */
export async function connectAccount(provider: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = createClient()
  const owned = await getOwnedRestaurantId(supabase)
  if (!owned.ok) return { success: false, error: owned.error }
  if (!isSocialProvider(provider)) return { success: false, error: "منصة غير معروفة" }
  try {
    const url = getAdapter(provider).getAuthUrl(owned.restaurantId)
    return { success: true, url }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "تعذر بدء عملية الربط" }
  }
}

export async function listAccounts(): Promise<{ success: boolean; accounts?: SocialAccountPublic[]; error?: string }> {
  const supabase = createClient()
  const owned = await getOwnedRestaurantId(supabase)
  if (!owned.ok) return { success: false, error: owned.error }
  const { data, error } = await supabase
    .from("social_accounts")
    .select(PUBLIC_COLS)
    .eq("restaurant_id", owned.restaurantId)
    .order("created_at", { ascending: false })
  if (error) return { success: false, error: "تعذر تحميل الحسابات المرتبطة" }
  return { success: true, accounts: (data ?? []) as SocialAccountPublic[] }
}

export async function disconnectAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const owned = await getOwnedRestaurantId(supabase)
  if (!owned.ok) return { success: false, error: owned.error }
  const { data: row } = await supabase
    .from("social_accounts")
    .select("id, platform, account_ref, account_name, access_token_encrypted, refresh_token_encrypted")
    .eq("id", accountId)
    .eq("restaurant_id", owned.restaurantId)
    .single()
  if (!row) return { success: false, error: "الحساب غير موجود" }

  // Best-effort platform-side revoke; local status flips regardless.
  try {
    const adapter = getAdapter(row.platform as SocialPlatform)
    const account = decryptAccount(row)
    if (account) await adapter.disconnect(account)
  } catch {
    // ignore — revoke is best-effort
  }

  const { error } = await supabase
    .from("social_accounts")
    .update({ status: "revoked", access_token_encrypted: null, refresh_token_encrypted: null })
    .eq("id", accountId)
    .eq("restaurant_id", owned.restaurantId)
  if (error) return { success: false, error: "تعذر إلغاء ربط الحساب" }
  revalidatePath(PAGE_PATH)
  return { success: true }
}

interface TokenRow {
  platform: string
  account_ref: string | null
  account_name: string | null
  access_token_encrypted: string | null
  refresh_token_encrypted: string | null
}

interface AccountRow extends TokenRow {
  id: string
  status: string
  token_expires_at: string | null
}

function decryptAccount(row: TokenRow): AdapterAccount | null {
  if (!row.access_token_encrypted || !row.account_ref) return null
  try {
    const { key } = getTokenKey()
    return {
      platform: row.platform as SocialPlatform,
      accountRef: row.account_ref,
      accountName: row.account_name,
      accessToken: decryptToken(row.access_token_encrypted, key),
      refreshToken: row.refresh_token_encrypted ? decryptToken(row.refresh_token_encrypted, key) : null,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Media preparation
// ---------------------------------------------------------------------------

/** Renders + stores the menu QR PNG; returns its public URL + menu link. */
export async function prepareMenuQr(
  menuId: string,
  link: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = createClient()
  const owned = await getOwnedRestaurantId(supabase)
  if (!owned.ok) return { success: false, error: owned.error }
  const { data: menu } = await supabase
    .from("published_menus")
    .select("id")
    .eq("id", menuId)
    .eq("restaurant_id", owned.restaurantId)
    .single()
  if (!menu) return { success: false, error: "القائمة غير موجودة" }
  try {
    const url = await ensureMenuQrImage(supabase, owned.restaurantId, menuId, link)
    return { success: true, url }
  } catch {
    return { success: false, error: "تعذر إنشاء صورة QR" }
  }
}

// ---------------------------------------------------------------------------
// Posting
// ---------------------------------------------------------------------------

export interface CreatePostInput {
  accountIds: string[]
  targetKind: PostTargetKind
  targetRef: string | null
  caption: string
  media: PublishMedia
}

export interface CreatePostOutcome {
  accountId: string
  platform: SocialPlatform
  accountName: string | null
  status: "posted" | "failed"
  platformPostId: string | null
  error: string | null
}

export async function createPost(
  input: CreatePostInput
): Promise<{ success: boolean; outcomes?: CreatePostOutcome[]; error?: string }> {
  const supabase = createClient()
  const owned = await getOwnedRestaurantId(supabase)
  if (!owned.ok) return { success: false, error: owned.error }

  const caption = String(input.caption ?? "").trim().slice(0, 5000)
  const urls = (input.media?.urls ?? []).filter((u) => /^https?:\/\//.test(u)).slice(0, 10)
  const mediaType = input.media?.type === "link" ? "link" : "image"
  if (!TARGET_KINDS.includes(input.targetKind)) return { success: false, error: "نوع المنشور غير معروف" }
  if (caption.length === 0) return { success: false, error: "اكتب نص المنشور أولاً" }
  if (urls.length === 0) return { success: false, error: "لا توجد وسائط صالحة للنشر" }
  const accountIds = Array.from(new Set(input.accountIds ?? [])).slice(0, 6)
  if (accountIds.length === 0) return { success: false, error: "اختر حساباً واحداً على الأقل" }

  const { data: rows } = await supabase
    .from("social_accounts")
    .select("id, platform, account_ref, account_name, status, token_expires_at, access_token_encrypted, refresh_token_encrypted")
    .eq("restaurant_id", owned.restaurantId)
    .in("id", accountIds)
  const accounts = ((rows ?? []) as AccountRow[]).filter((r) => r.status === "connected")
  if (accounts.length === 0) return { success: false, error: "لا توجد حسابات مرتبطة صالحة — أعد ربط الحسابات" }

  const outcomes: CreatePostOutcome[] = []
  for (const row of accounts) {
    const { data: post } = await supabase
      .from("social_posts")
      .insert({
        restaurant_id: owned.restaurantId,
        social_account_id: row.id,
        target_kind: input.targetKind,
        target_ref: input.targetRef,
        caption,
        media_urls: urls,
        status: "draft",
      })
      .select("id")
      .single()
    if (!post) {
      outcomes.push(outcome(row, "failed", null, "تعذر حفظ المنشور"))
      continue
    }
    await supabase.from("social_posts").update({ status: "posting" }).eq("id", post.id)

    const account = decryptAccount(row)
    if (!account) {
      const error = "بيانات اعتماد الحساب غير صالحة — أعد ربط الحساب"
      await supabase.from("social_posts").update({ status: "failed", error }).eq("id", post.id)
      outcomes.push(outcome(row, "failed", null, error))
      continue
    }

    const adapter = getAdapter(account.platform)
    const fresh = await maybeRefresh(supabase, adapter, account, row)
    const result = await publishToAccount(adapter, { account: fresh, media: { type: mediaType, urls }, caption })
    const patch = patchForResult(result)
    await supabase.from("social_posts").update(patch).eq("id", post.id)
    outcomes.push(outcome(row, patch.status, patch.platform_post_id, patch.error))
  }
  revalidatePath(PAGE_PATH)
  return { success: true, outcomes }
}

function outcome(
  row: { id: string; platform: string; account_name: string | null },
  status: "posted" | "failed",
  platformPostId: string | null,
  error: string | null
): CreatePostOutcome {
  const platform = row.platform as SocialPlatform
  return { accountId: row.id, platform, accountName: row.account_name, status, platformPostId, error }
}

async function maybeRefresh(
  supabase: ReturnType<typeof createClient>,
  adapter: ReturnType<typeof getAdapter>,
  account: AdapterAccount,
  row: { id: string; token_expires_at: string | null }
): Promise<AdapterAccount> {
  if (!tokenNeedsRefresh(row.token_expires_at)) return account
  try {
    const tokens = await adapter.refreshToken(account)
    const { key } = getTokenKey()
    await supabase
      .from("social_accounts")
      .update({
        access_token_encrypted: encryptToken(tokens.accessToken, key),
        refresh_token_encrypted: tokens.refreshToken ? encryptToken(tokens.refreshToken, key) : null,
        token_expires_at: tokens.expiresAt,
      })
      .eq("id", row.id)
    return { ...account, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  } catch {
    return account // publish attempt will surface the auth error
  }
}

export async function listPosts(): Promise<{ success: boolean; posts?: SocialPostRecord[]; error?: string }> {
  const supabase = createClient()
  const owned = await getOwnedRestaurantId(supabase)
  if (!owned.ok) return { success: false, error: owned.error }
  const { data, error } = await supabase
    .from("social_posts")
    .select(
      "id, social_account_id, target_kind, target_ref, caption, media_urls, status, posted_at, platform_post_id, error, created_at, account:social_accounts(platform, account_name)"
    )
    .eq("restaurant_id", owned.restaurantId)
    .order("created_at", { ascending: false })
    .limit(30)
  if (error) return { success: false, error: "تعذر تحميل سجل المنشورات" }
  return { success: true, posts: (data ?? []) as unknown as SocialPostRecord[] }
}
