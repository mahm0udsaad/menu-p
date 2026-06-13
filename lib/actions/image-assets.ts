"use server"

/**
 * Server actions for the image-asset gallery (Phase 3).
 * Assets live in the `menu-images` bucket under assets/{restaurantId}/ and
 * are registered in `image_assets` (RLS: own rows + shared restaurant_id-null
 * rows readable). Recommendation/ranking logic is pure (lib/ai/image-asset-utils).
 */

import { createClient } from "@/lib/supabase/server"
import { generateFoodImage, ImageGenerationError, type ImageAspect } from "@/lib/ai/image-generation"
import {
  buildAssetTags,
  fileSlug,
  rankAssets,
  RECOMMEND_THRESHOLD,
  SEARCH_THRESHOLD,
  type ImageAssetKind,
} from "@/lib/ai/image-asset-utils"

const BUCKET = "menu-images"
const ASSET_COLUMNS =
  "id, restaurant_id, kind, source, storage_path, public_url, prompt, model, tags, usage_count, created_at"
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export interface ImageAssetRecord {
  id: string
  restaurant_id: string | null
  kind: ImageAssetKind
  source: "ai" | "upload"
  storage_path: string
  public_url: string
  prompt: string | null
  model: string | null
  tags: string[]
  usage_count: number
  created_at: string
}

export interface AssetListResult {
  success: boolean
  assets?: Array<ImageAssetRecord & { score?: number }>
  error?: string
}

export interface AssetResult {
  success: boolean
  asset?: ImageAssetRecord
  error?: string
  errorCode?: string
}

async function getOwnedRestaurant(
  supabase: ReturnType<typeof createClient>
): Promise<{ ok: true; restaurantId: string } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "يجب تسجيل الدخول أولاً" }
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id")
    .eq("user_id", user.id)
    .single()
  if (error || !restaurant) return { ok: false, error: "لم يتم العثور على مطعم لهذا الحساب" }
  return { ok: true, restaurantId: restaurant.id }
}

/** Own + shared assets, newest first. RLS hides everyone else's rows. */
async function fetchCandidates(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string,
  kind?: ImageAssetKind
): Promise<{ assets: ImageAssetRecord[] | null; error?: string }> {
  let query = supabase
    .from("image_assets")
    .select(ASSET_COLUMNS)
    .or(`restaurant_id.eq.${restaurantId},restaurant_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(200)
  if (kind) query = query.eq("kind", kind)
  const { data, error } = await query
  if (error) {
    console.error("image_assets fetch error:", error)
    return { assets: null, error: "تعذر تحميل معرض الصور" }
  }
  return { assets: (data ?? []) as ImageAssetRecord[] }
}

/** Gallery search: free-text query over own + shared assets (tag matching). */
export async function findAssets(params: {
  query?: string
  kind?: ImageAssetKind
}): Promise<AssetListResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const { assets, error } = await fetchCandidates(supabase, auth.restaurantId, params.kind)
  if (!assets) return { success: false, error }

  const query = params.query?.trim()
  if (query) {
    const ranked = rankAssets(assets, { itemName: query }, { threshold: SEARCH_THRESHOLD, limit: 40 })
    return { success: true, assets: ranked }
  }
  const popular = [...assets]
    .sort((a, b) => b.usage_count - a.usage_count || b.created_at.localeCompare(a.created_at))
    .slice(0, 40)
  return { success: true, assets: popular }
}

/** Top gallery matches for a menu item — call BEFORE offering generation. */
export async function recommendForItem(params: {
  itemName: string
  itemNameEn?: string | null
}): Promise<AssetListResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }
  if (!params.itemName.trim()) return { success: true, assets: [] }

  const { assets, error } = await fetchCandidates(supabase, auth.restaurantId, "menu_item")
  if (!assets) return { success: false, error }

  const ranked = rankAssets(assets, params, { threshold: RECOMMEND_THRESHOLD, limit: 8 })
  return { success: true, assets: ranked }
}

function generationErrorMessage(err: ImageGenerationError): string {
  switch (err.code) {
    case "auth":
      return "مفتاح خدمة الصور غير صالح — تواصل مع الدعم"
    case "rate_limit":
      return "خدمة توليد الصور مشغولة حالياً، حاول مرة أخرى بعد قليل"
    case "no_image":
      return "لم يتمكن الذكاء الاصطناعي من إنتاج صورة — جرّب وصفاً أو لمسة مختلفة"
    default:
      return "فشل توليد الصورة، حاول مرة أخرى"
  }
}

async function saveAssetRow(
  supabase: ReturnType<typeof createClient>,
  row: Record<string, unknown>
): Promise<AssetResult> {
  const { data, error } = await supabase.from("image_assets").insert(row).select(ASSET_COLUMNS).single()
  if (error || !data) {
    console.error("image_assets insert error:", error)
    return { success: false, error: "تم إنشاء الصورة لكن تعذر تسجيلها في المعرض" }
  }
  return { success: true, asset: data as ImageAssetRecord }
}

/** Generate with Gemini, upload to storage, register in the gallery. */
export async function generateAndSaveAsset(params: {
  itemName: string
  itemNameEn?: string | null
  description?: string | null
  kind: "menu_item" | "poster_art"
  style?: string | null
  aspect?: ImageAspect
}): Promise<AssetResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }
  if (!params.itemName.trim()) return { success: false, error: "أدخل اسم الطبق أولاً" }

  let generated
  try {
    generated = await generateFoodImage(params)
  } catch (err) {
    console.error("generateAndSaveAsset generation failed:", err)
    if (err instanceof ImageGenerationError) {
      return { success: false, error: generationErrorMessage(err), errorCode: err.code }
    }
    return { success: false, error: "فشل توليد الصورة، حاول مرة أخرى", errorCode: "unknown" }
  }

  const ext = UPLOAD_TYPES[generated.mimeType] ?? "png"
  const path = `assets/${auth.restaurantId}/${Date.now()}-${fileSlug(params.itemNameEn || params.itemName)}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(generated.bytes), { contentType: generated.mimeType, upsert: false })
  if (uploadError) {
    console.error("generateAndSaveAsset upload error:", uploadError)
    return { success: false, error: "تم توليد الصورة لكن تعذر حفظها، حاول مرة أخرى" }
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return saveAssetRow(supabase, {
    restaurant_id: auth.restaurantId,
    kind: params.kind,
    source: "ai",
    storage_path: path,
    public_url: publicUrl,
    prompt: generated.prompt,
    model: generated.model,
    tags: generated.tags,
    language: "ar",
  })
}

/** Register a manual upload in the gallery (FormData: file, itemName, kind?). */
export async function uploadAsset(formData: FormData): Promise<AssetResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const file = formData.get("file")
  const itemName = String(formData.get("itemName") ?? "").trim()
  const kindRaw = String(formData.get("kind") ?? "menu_item")
  const kind: ImageAssetKind = kindRaw === "poster_art" ? "poster_art" : "menu_item"

  if (!(file instanceof File)) return { success: false, error: "لم يتم اختيار ملف" }
  const ext = UPLOAD_TYPES[file.type]
  if (!ext) return { success: false, error: "نوع الصورة غير مدعوم — ارفع JPG أو PNG أو WebP" }
  if (file.size > MAX_UPLOAD_BYTES) return { success: false, error: "حجم الصورة أكبر من 8 ميجابايت" }

  const path = `assets/${auth.restaurantId}/${Date.now()}-${fileSlug(itemName || file.name)}.${ext}`
  const bytes = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (uploadError) {
    console.error("uploadAsset upload error:", uploadError)
    return { success: false, error: "تعذر رفع الصورة، حاول مرة أخرى" }
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return saveAssetRow(supabase, {
    restaurant_id: auth.restaurantId,
    kind,
    source: "upload",
    storage_path: path,
    public_url: publicUrl,
    prompt: null,
    model: null,
    tags: buildAssetTags({ itemName: itemName || file.name, kind }),
    language: "ar",
  })
}

/** Mark an asset as used (reuse counter) and return its public URL. */
export async function useAsset(assetId: string): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const { data: asset, error } = await supabase
    .from("image_assets")
    .select("id, public_url, usage_count, restaurant_id")
    .eq("id", assetId)
    .single()
  if (error || !asset) return { success: false, error: "لم يتم العثور على الصورة" }

  // Shared assets (restaurant_id null) are not owner-updatable under RLS —
  // a failed counter bump must not block selection.
  const { error: updateError } = await supabase
    .from("image_assets")
    .update({ usage_count: (asset.usage_count ?? 0) + 1 })
    .eq("id", assetId)
  if (updateError) console.warn("useAsset usage_count bump failed:", updateError.message)

  return { success: true, publicUrl: asset.public_url }
}
