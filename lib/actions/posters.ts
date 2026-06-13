"use server"

/**
 * Poster Studio server actions (Phase 4).
 * createPoster: draft insert → gallery-first art reuse (Phase 3 assets,
 * kind 'poster_art') or fresh generation → HTML overlay render → storage.
 * Ownership verified via restaurants.user_id on every action; RLS backs it up.
 */

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { findAssets, generateAndSaveAsset, useAsset, type ImageAssetRecord } from "./image-assets"
import { RECOMMEND_THRESHOLD } from "@/lib/ai/image-asset-utils"
import { buildPosterArtRequest } from "@/lib/ai/poster-generation"
import { POSTER_SIZES, POSTER_TEMPLATES, renderPosterHtml } from "@/lib/posters/templates"
import { renderAndStorePoster, type PosterStoreClient } from "@/lib/posters/renderer"
import {
  templateMode,
  type GreetingPayload,
  type OfferPayload,
  type PosterPayload,
  type PosterSize,
  type PosterTemplateId,
} from "@/lib/posters/poster-utils"

const PAGE_PATH = "/dashboard/posters"

export interface StoredPosterPayload {
  template: PosterTemplateId
  size: PosterSize
  style: string | null
  data: PosterPayload
  render?: { storage_path: string; width: number; height: number }
}

export interface PosterRecord {
  id: string
  restaurant_id: string
  kind: "offer" | "greeting"
  title: string | null
  payload: StoredPosterPayload
  art_asset_id: string | null
  final_image_url: string | null
  status: "draft" | "generating" | "ready" | "failed"
  created_at: string
  updated_at: string
}

export interface PosterActionResult {
  success: boolean
  poster?: PosterRecord
  error?: string
}

export interface PosterListResult {
  success: boolean
  posters?: PosterRecord[]
  error?: string
}

interface OwnedRestaurant {
  id: string
  name: string
  logo_url: string | null
  color_palette: unknown
  currency: string | null
}

async function getOwnedRestaurant(
  supabase: ReturnType<typeof createClient>
): Promise<{ ok: true; restaurant: OwnedRestaurant } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "يجب تسجيل الدخول أولاً" }
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, logo_url, color_palette, currency")
    .eq("user_id", user.id)
    .single()
  if (error || !data) return { ok: false, error: "لم يتم العثور على مطعم لهذا الحساب" }
  return { ok: true, restaurant: data as OwnedRestaurant }
}

/** Validate + normalize; returns an Arabic error or the clean payload. */
function normalizePayload(
  template: PosterTemplateId,
  size: PosterSize,
  payload: PosterPayload
): { error: string } | { payload: PosterPayload } {
  if (!POSTER_TEMPLATES.some((t) => t.id === template)) return { error: "قالب البوستر غير معروف" }
  if (!POSTER_SIZES[size]) return { error: "مقاس البوستر غير معروف" }
  if (templateMode(template) !== payload.mode) return { error: "القالب لا يطابق نوع البوستر" }

  if (payload.mode === "offer") {
    const products = (payload.products ?? [])
      .map((p) => ({
        id: p.id ?? null,
        name: String(p.name ?? "").trim().slice(0, 80),
        imageUrl: p.imageUrl ?? null,
        newPrice: Number(p.newPrice),
        oldPrice:
          p.oldPrice != null && Number.isFinite(Number(p.oldPrice)) && Number(p.oldPrice) > Number(p.newPrice)
            ? Number(p.oldPrice)
            : null,
      }))
      .filter((p) => p.name.length > 0 && Number.isFinite(p.newPrice) && p.newPrice > 0 && p.newPrice < 1_000_000)
    if (products.length === 0) return { error: "اختر منتجاً واحداً على الأقل مع سعر صحيح" }
    if (products.length > 4) return { error: "الحد الأقصى ٤ منتجات في البوستر الواحد" }
    const clean: OfferPayload = {
      mode: "offer",
      currency: String(payload.currency ?? "EGP").slice(0, 8),
      headline: payload.headline?.trim().slice(0, 60) || null,
      products,
    }
    return { payload: clean }
  }

  const occasion = String(payload.occasion ?? "").trim().slice(0, 40)
  const message = String(payload.message ?? "").trim().slice(0, 300)
  if (!occasion) return { error: "اختر المناسبة أولاً" }
  if (!message) return { error: "اكتب نص التهنئة أولاً" }
  const clean: GreetingPayload = { mode: "greeting", occasion, message }
  return { payload: clean }
}

async function markFailed(supabase: ReturnType<typeof createClient>, posterId: string): Promise<void> {
  const { error } = await supabase.from("posters").update({ status: "failed" }).eq("id", posterId)
  if (error) console.error("posters markFailed error:", error)
}

/** Gallery-first: reuse a matching poster_art asset, otherwise generate. */
async function resolveArtAsset(params: {
  mode: "offer" | "greeting"
  subject: string
  style: string | null
  size: PosterSize
}): Promise<{ asset?: ImageAssetRecord; error?: string }> {
  const existing = await findAssets({ query: params.subject, kind: "poster_art" })
  const top = existing.success ? existing.assets?.[0] : undefined
  if (top && (top.score ?? 0) >= RECOMMEND_THRESHOLD) {
    void useAsset(top.id).catch(() => {})
    return { asset: top }
  }
  const generated = await generateAndSaveAsset(buildPosterArtRequest(params))
  if (!generated.success || !generated.asset) {
    return { error: generated.error ?? "فشل توليد خلفية البوستر، حاول مرة أخرى" }
  }
  return { asset: generated.asset }
}

export interface CreatePosterParams {
  template: PosterTemplateId
  size: PosterSize
  payload: PosterPayload
  /** Optional art style hint passed to the AI background prompt. */
  style?: string | null
  title?: string | null
}

export async function createPoster(params: CreatePosterParams): Promise<PosterActionResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }
  const restaurant = auth.restaurant

  const normalized = normalizePayload(params.template, params.size, params.payload)
  if ("error" in normalized) return { success: false, error: normalized.error }
  const payload = normalized.payload

  const style = params.style?.trim().slice(0, 200) || null
  const title =
    params.title?.trim().slice(0, 80) ||
    (payload.mode === "offer" ? payload.headline || `عرض ${payload.products[0].name}` : `تهنئة ${payload.occasion}`)
  const stored: StoredPosterPayload = { template: params.template, size: params.size, style, data: payload }

  const { data: poster, error: insertError } = await supabase
    .from("posters")
    .insert({
      restaurant_id: restaurant.id,
      kind: payload.mode,
      title,
      payload: stored,
      status: "generating",
    })
    .select("*")
    .single()
  if (insertError || !poster) {
    console.error("posters insert error:", insertError)
    return { success: false, error: "تعذر إنشاء البوستر، حاول مرة أخرى" }
  }
  const posterId = (poster as PosterRecord).id

  const subject = payload.mode === "offer" ? payload.products[0].name : payload.occasion
  const art = await resolveArtAsset({ mode: payload.mode, subject, style, size: params.size })
  if (!art.asset) {
    await markFailed(supabase, posterId)
    return { success: false, error: art.error }
  }
  const { error: artError } = await supabase
    .from("posters")
    .update({ art_asset_id: art.asset.id })
    .eq("id", posterId)
  if (artError) console.error("posters art_asset_id update error:", artError)

  const { width, height } = POSTER_SIZES[params.size]
  let html: string
  try {
    html = renderPosterHtml({
      template: params.template,
      size: params.size,
      artUrl: art.asset.public_url,
      logoUrl: restaurant.logo_url,
      restaurantName: restaurant.name,
      palette: restaurant.color_palette,
      payload,
    })
  } catch (err) {
    console.error("renderPosterHtml failed:", err)
    await markFailed(supabase, posterId)
    return { success: false, error: "تعذر تجهيز تصميم البوستر" }
  }

  const rendered = await renderAndStorePoster({
    supabase: supabase as unknown as PosterStoreClient,
    posterId,
    restaurantId: restaurant.id,
    html,
    width,
    height,
    payload: stored as unknown as Record<string, unknown>,
  })
  if (!rendered.success) {
    await markFailed(supabase, posterId)
    return { success: false, error: rendered.error }
  }

  const { data: finalPoster } = await supabase.from("posters").select("*").eq("id", posterId).single()
  revalidatePath(PAGE_PATH)
  return { success: true, poster: (finalPoster ?? poster) as PosterRecord }
}

export async function listPosters(): Promise<PosterListResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const { data, error } = await supabase
    .from("posters")
    .select("*")
    .eq("restaurant_id", auth.restaurant.id)
    .order("created_at", { ascending: false })
    .limit(60)
  if (error) {
    console.error("posters list error:", error)
    return { success: false, error: "تعذر تحميل البوسترات" }
  }
  return { success: true, posters: (data ?? []) as PosterRecord[] }
}

export async function deletePoster(posterId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const { data: poster, error } = await supabase
    .from("posters")
    .select("id, restaurant_id, payload")
    .eq("id", posterId)
    .eq("restaurant_id", auth.restaurant.id)
    .single()
  if (error || !poster) return { success: false, error: "لم يتم العثور على البوستر" }

  const storagePath = (poster.payload as StoredPosterPayload | null)?.render?.storage_path
  if (storagePath) {
    const { error: removeError } = await supabase.storage.from("menu-images").remove([storagePath])
    if (removeError) console.warn("poster image removal failed:", removeError.message)
  }

  const { error: deleteError } = await supabase
    .from("posters")
    .delete()
    .eq("id", posterId)
    .eq("restaurant_id", auth.restaurant.id)
  if (deleteError) {
    console.error("posters delete error:", deleteError)
    return { success: false, error: "تعذر حذف البوستر" }
  }
  revalidatePath(PAGE_PATH)
  return { success: true }
}
