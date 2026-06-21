"use server"

/**
 * Banner Studio server actions (Phase 5).
 * - createBanner: insert a draft document
 * - saveBanner:   persist the edited document (autosave)
 * - exportBannerAction: render PNG / PDF / social → storage → record exports
 * - listBanners / deleteBanner
 * Ownership verified via restaurants.user_id on every action; RLS backs it up.
 */

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { exportBanner } from "@/lib/banners/export"
import {
  BANNER_EXPORTS,
  BANNER_SIZES,
  emptyBannerDoc,
  type BannerDoc,
  type BannerExportTarget,
  type BannerRecord,
} from "@/lib/banners/types"
import type { BannerElement } from "@/lib/banners/types"

const PAGE_PATH = "/dashboard/banners"

export interface BannerActionResult {
  success: boolean
  banner?: BannerRecord
  error?: string
}

export interface BannerListResult {
  success: boolean
  banners?: BannerRecord[]
  error?: string
}

interface OwnedRestaurant {
  id: string
}

async function getOwnedRestaurant(
  supabase: ReturnType<typeof createClient>
): Promise<{ ok: true; restaurant: OwnedRestaurant } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "يجب تسجيل الدخول أولاً" }
  const { data, error } = await supabase.from("restaurants").select("id").eq("user_id", user.id).single()
  if (error || !data) return { ok: false, error: "لم يتم العثور على مطعم لهذا الحساب" }
  return { ok: true, restaurant: data as OwnedRestaurant }
}

const ELEMENT_TYPES = new Set(["text", "product", "sticker", "image"])
const clampPct = (n: unknown, fallback = 0): number => {
  const v = Number(n)
  return Number.isFinite(v) ? Math.max(-50, Math.min(200, v)) : fallback
}

/**
 * Validate + normalize a document coming from the client. Keeps the structure
 * but bounds numeric fields and caps the element count so a malformed payload
 * can never produce a runaway render.
 */
function normalizeDoc(input: unknown): { error: string } | { doc: BannerDoc } {
  const raw = (input ?? {}) as Partial<BannerDoc>
  const size = raw.size && BANNER_SIZES[raw.size] ? raw.size : "screen-16x9"
  const base = emptyBannerDoc(size)
  const background = raw.background && typeof raw.background === "object" ? { ...base.background, ...raw.background } : base.background

  const rawElements = Array.isArray(raw.elements) ? raw.elements : []
  if (rawElements.length > 60) return { error: "الحد الأقصى ٦٠ عنصراً في البانر" }

  const elements: BannerElement[] = []
  for (const e of rawElements as BannerElement[]) {
    if (!e || typeof e !== "object" || !ELEMENT_TYPES.has(e.type) || typeof e.id !== "string") continue
    elements.push({
      ...e,
      x: clampPct(e.x),
      y: clampPct(e.y),
      w: clampPct(e.w, 10),
      h: clampPct(e.h, 10),
      rotation: Number.isFinite(e.rotation) ? Number(e.rotation) : 0,
      z: Number.isFinite(e.z) ? Number(e.z) : 1,
    } as BannerElement)
  }

  return { doc: { version: 1, size, background, elements } }
}

export async function createBanner(params: { title?: string | null; doc?: BannerDoc } = {}): Promise<BannerActionResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const normalized = normalizeDoc(params.doc ?? emptyBannerDoc())
  if ("error" in normalized) return { success: false, error: normalized.error }
  const title = params.title?.trim().slice(0, 80) || "بانر جديد"

  const { data, error } = await supabase
    .from("banners")
    .insert({ restaurant_id: auth.restaurant.id, title, doc: normalized.doc, status: "draft" })
    .select("*")
    .single()
  if (error || !data) {
    console.error("banners insert error:", error)
    return { success: false, error: "تعذر إنشاء البانر، حاول مرة أخرى" }
  }
  revalidatePath(PAGE_PATH)
  return { success: true, banner: data as BannerRecord }
}

export async function saveBanner(params: { id: string; title?: string | null; doc: BannerDoc }): Promise<BannerActionResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const normalized = normalizeDoc(params.doc)
  if ("error" in normalized) return { success: false, error: normalized.error }

  const patch: Record<string, unknown> = { doc: normalized.doc }
  if (params.title != null) patch.title = params.title.trim().slice(0, 80) || "بانر جديد"

  const { data, error } = await supabase
    .from("banners")
    .update(patch)
    .eq("id", params.id)
    .eq("restaurant_id", auth.restaurant.id)
    .select("*")
    .single()
  if (error || !data) {
    console.error("banners save error:", error)
    return { success: false, error: "تعذر حفظ البانر" }
  }
  return { success: true, banner: data as BannerRecord }
}

export interface BannerExportActionResult {
  success: boolean
  url?: string
  target?: BannerExportTarget
  error?: string
}

export async function exportBannerAction(params: { id: string; target: BannerExportTarget }): Promise<BannerExportActionResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }
  if (!BANNER_EXPORTS[params.target]) return { success: false, error: "صيغة التصدير غير معروفة" }

  const { data: row, error } = await supabase
    .from("banners")
    .select("id, doc, exports")
    .eq("id", params.id)
    .eq("restaurant_id", auth.restaurant.id)
    .single()
  if (error || !row) return { success: false, error: "لم يتم العثور على البانر" }

  const normalized = normalizeDoc((row as { doc: unknown }).doc)
  if ("error" in normalized) return { success: false, error: normalized.error }

  await supabase.from("banners").update({ status: "generating" }).eq("id", params.id)

  let out
  try {
    out = await exportBanner(normalized.doc, params.target)
  } catch (err) {
    console.error("banner export render failed:", err)
    await supabase.from("banners").update({ status: "failed" }).eq("id", params.id)
    return { success: false, error: "تعذر إخراج البانر، حاول مرة أخرى" }
  }

  const storagePath = `banners/${auth.restaurant.id}/${params.id}-${params.target}-${Date.now()}.${out.ext}`
  const { error: uploadError } = await supabase.storage
    .from("menu-images")
    .upload(storagePath, out.buffer, { contentType: out.contentType, upsert: false })
  if (uploadError) {
    console.error("banner export upload failed:", uploadError.message)
    await supabase.from("banners").update({ status: "failed" }).eq("id", params.id)
    return { success: false, error: "تم إخراج البانر لكن تعذر حفظه" }
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("menu-images").getPublicUrl(storagePath)

  const exports = { ...((row as { exports?: Record<string, string> }).exports ?? {}), [params.target]: publicUrl }
  const patch: Record<string, unknown> = { exports, status: "ready" }
  if (params.target === "png") patch.final_image_url = publicUrl
  await supabase.from("banners").update(patch).eq("id", params.id)

  revalidatePath(PAGE_PATH)
  return { success: true, url: publicUrl, target: params.target }
}

export async function listBanners(): Promise<BannerListResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("restaurant_id", auth.restaurant.id)
    .order("created_at", { ascending: false })
    .limit(60)
  if (error) {
    console.error("banners list error:", error)
    return { success: false, error: "تعذر تحميل البانرات" }
  }
  return { success: true, banners: (data ?? []) as BannerRecord[] }
}

export async function deleteBanner(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const { error } = await supabase.from("banners").delete().eq("id", id).eq("restaurant_id", auth.restaurant.id)
  if (error) {
    console.error("banners delete error:", error)
    return { success: false, error: "تعذر حذف البانر" }
  }
  revalidatePath(PAGE_PATH)
  return { success: true }
}
