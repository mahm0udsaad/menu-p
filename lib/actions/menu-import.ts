"use server"

/**
 * Server actions for AI menu import (Phase 2).
 * Flow: file already uploaded to `menu-images` bucket → createImportJob runs
 * the multi-pass extraction → review UI edits → applyImport writes
 * menu_categories / menu_items.
 */

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  extractAndVerifyMenu,
  MenuExtractionError,
  type ConfidenceSummary,
  type MenuExtraction,
} from "@/lib/ai/menu-extraction"
import { extractMenuFromUrl } from "@/lib/ai/menu-url-import"
import { inspectMenusSaMenu, isMenusSaUrl, type MenusSaInspection } from "@/lib/ai/menus-sa-import"
import { UrlGuardError } from "@/lib/ai/url-guard"

export type ImportSourceType = "pdf" | "image" | "url"

export interface ImportJobRecord {
  id: string
  restaurant_id: string
  source_file_url: string
  source_type: ImportSourceType
  status: "pending" | "extracting" | "verifying" | "review" | "imported" | "failed"
  raw_extraction: MenuExtraction | null
  verified_extraction: MenuExtraction | null
  confidence_summary: ConfidenceSummary | null
  error: string | null
  created_at: string
}

export interface CreateImportJobResult {
  success: boolean
  error?: string
  errorCode?: string
  jobId?: string
  extraction?: MenuExtraction
  summary?: ConfidenceSummary
}

export interface ApplyImportResult {
  success: boolean
  error?: string
  categoriesCreated?: number
  itemsCreated?: number
}

export interface InspectMenusSaImportResult {
  success: boolean
  error?: string
  errorCode?: string
  inspection?: MenusSaInspection
}

const EditedItemSchema = z.object({
  name: z.string().min(1).max(300),
  name_en: z.string().max(300).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  price: z.number().min(0).max(10_000_000).nullable(),
  image_url: z.string().url().max(2000).nullable().optional(),
  currency: z.string().max(10).nullable().optional(),
  confidence: z.number().min(0).max(1).optional().default(1),
  flags: z.array(z.string()).optional().default([]),
})

const EditedCategorySchema = z.object({
  name: z.string().min(1).max(300),
  name_en: z.string().max(300).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  confidence: z.number().min(0).max(1).optional().default(1),
  items: z.array(EditedItemSchema).min(1),
})

const EditedExtractionSchema = z.object({
  categories: z.array(EditedCategorySchema).min(1).max(60),
  detected_language: z.string().optional().default("ar"),
  currency_guess: z.string().nullable().optional().default(null),
})

export type EditedExtraction = z.infer<typeof EditedExtractionSchema>

const ONBOARDING_STARTER_CATEGORY_NAMES = new Set(["مقبلات", "الأطباق الرئيسية", "المشروبات", "الحلويات"])

interface StarterCategoryRow {
  id: string
  name: string | null
  menu_items?: Array<{ id: string }> | null
}

interface AuthContext {
  userId: string
  restaurantId: string
}

async function getOwnedRestaurant(supabase: ReturnType<typeof createClient>): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; error: string }
> {
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
  return { ok: true, ctx: { userId: user.id, restaurantId: restaurant.id } }
}

/**
 * Lighter auth check for read-only operations (e.g. menus-sa inspection during
 * onboarding) where a restaurant may not exist yet. Only requires a logged-in user.
 */
async function getAuthedUser(supabase: ReturnType<typeof createClient>): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "يجب تسجيل الدخول أولاً" }
  return { ok: true, userId: user.id }
}

function extractionErrorMessage(err: MenuExtractionError): string {
  switch (err.code) {
    case "auth":
      return "مفتاح الذكاء الاصطناعي غير صالح — تواصل مع الدعم"
    case "rate_limit":
      return "خدمة الذكاء الاصطناعي مشغولة حالياً، حاول مرة أخرى بعد دقيقة"
    case "fetch_failed":
      return "تعذر قراءة الملف المرفوع، أعد رفع الملف"
    case "file_too_large":
      return "حجم الملف أكبر من الحد المسموح (10 ميجابايت)"
    case "empty_extraction":
      return "لم نتمكن من العثور على أصناف في هذا الملف — جرّب صورة أوضح"
    default:
      return "فشل استخراج القائمة، حاول مرة أخرى"
  }
}

/**
 * Creates a menu_import_jobs row for an already-uploaded file, runs the
 * multi-pass AI extraction and stores results. Returns the verified
 * extraction for the review screen.
 */
export async function createImportJob(params: {
  fileUrl: string
  mimeType: string
  sourceType: ImportSourceType
}): Promise<CreateImportJobResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const { data: job, error: insertError } = await supabase
    .from("menu_import_jobs")
    .insert({
      restaurant_id: auth.ctx.restaurantId,
      source_file_url: params.fileUrl,
      source_type: params.sourceType,
      status: "extracting",
    })
    .select("id")
    .single()

  if (insertError || !job) {
    console.error("createImportJob insert error:", insertError)
    return { success: false, error: "تعذر إنشاء مهمة الاستيراد" }
  }

  try {
    const { raw, verified, summary } = await extractAndVerifyMenu(params.fileUrl, params.mimeType)

    const { error: updateError } = await supabase
      .from("menu_import_jobs")
      .update({
        status: "review",
        raw_extraction: raw,
        verified_extraction: verified,
        confidence_summary: summary,
      })
      .eq("id", job.id)
    if (updateError) console.error("createImportJob update error:", updateError)

    return { success: true, jobId: job.id, extraction: verified, summary }
  } catch (err) {
    const isExtractionError = err instanceof MenuExtractionError
    const message = isExtractionError
      ? extractionErrorMessage(err)
      : "فشل استخراج القائمة، حاول مرة أخرى"
    console.error("createImportJob extraction failed:", err)
    await supabase
      .from("menu_import_jobs")
      .update({ status: "failed", error: err instanceof Error ? err.message : String(err) })
      .eq("id", job.id)
    return {
      success: false,
      error: message,
      errorCode: isExtractionError ? err.code : "unknown",
      jobId: job.id,
    }
  }
}

const UrlInputSchema = z
  .string()
  .trim()
  .min(1, "أدخل رابط القائمة")
  .max(2000)
  .refine((v) => /^https?:\/\//i.test(v), "يجب أن يبدأ الرابط بـ http أو https")

const ApplyImportOptionsSchema = z.object({
  templateId: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().max(2000).nullable().optional(),
})

export async function inspectMenusSaImport(params: { url: string }): Promise<InspectMenusSaImportResult> {
  const supabase = createClient()
  // Inspection is read-only and may run during onboarding before a restaurant
  // exists, so only require an authenticated user (not an owned restaurant).
  const auth = await getAuthedUser(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const parsedUrl = UrlInputSchema.safeParse(params.url)
  if (!parsedUrl.success) {
    return { success: false, error: parsedUrl.error.issues[0]?.message ?? "رابط غير صالح", errorCode: "invalid_url" }
  }

  if (!isMenusSaUrl(parsedUrl.data)) {
    return { success: false, error: "هذا المسار مخصص لروابط menus-sa فقط", errorCode: "invalid_source" }
  }

  try {
    const inspection = await inspectMenusSaMenu(parsedUrl.data)
    return { success: true, inspection }
  } catch (err) {
    let message = "تعذر قراءة رابط menus-sa، تأكد من الرابط وحاول مرة أخرى"
    let errorCode = "unknown"
    if (err instanceof UrlGuardError) {
      message = err.message
      errorCode = err.code
    } else if (err instanceof MenuExtractionError) {
      message = extractionErrorMessage(err)
      errorCode = err.code
    }
    console.error("inspectMenusSaImport failed:", err)
    return { success: false, error: message, errorCode }
  }
}

/**
 * Extraction-only preview for the onboarding flow: runs the same menus-sa
 * pipeline as createImportJobFromUrl but writes nothing to the database, so it
 * works before a restaurant exists. Persistence happens later inside
 * onboardRestaurant once the restaurant row is created.
 */
export async function previewMenusSaExtraction(params: { url: string }): Promise<CreateImportJobResult> {
  const supabase = createClient()
  const auth = await getAuthedUser(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const parsedUrl = UrlInputSchema.safeParse(params.url)
  if (!parsedUrl.success) {
    return { success: false, error: parsedUrl.error.issues[0]?.message ?? "رابط غير صالح", errorCode: "invalid_url" }
  }
  if (!isMenusSaUrl(parsedUrl.data)) {
    return { success: false, error: "هذا المسار مخصص لروابط menus-sa فقط", errorCode: "invalid_source" }
  }

  try {
    const { verified, summary } = await extractMenuFromUrl(parsedUrl.data)
    return { success: true, extraction: verified, summary }
  } catch (err) {
    let message = "فشل استخراج القائمة، حاول مرة أخرى"
    let errorCode = "unknown"
    if (err instanceof UrlGuardError) {
      message = err.message
      errorCode = err.code
    } else if (err instanceof MenuExtractionError) {
      message = extractionErrorMessage(err)
      errorCode = err.code
    }
    console.error("previewMenusSaExtraction failed:", err)
    return { success: false, error: message, errorCode }
  }
}

/**
 * Same contract as createImportJob, but the source is a URL: a direct PDF/image
 * link or a restaurant's own web menu. Resolution + SSRF guarding happens in
 * extractMenuFromUrl; everything downstream (review / applyImport) is shared.
 */
export async function createImportJobFromUrl(params: { url: string }): Promise<CreateImportJobResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const parsedUrl = UrlInputSchema.safeParse(params.url)
  if (!parsedUrl.success) {
    return { success: false, error: parsedUrl.error.issues[0]?.message ?? "رابط غير صالح", errorCode: "invalid_url" }
  }

  const { data: job, error: insertError } = await supabase
    .from("menu_import_jobs")
    .insert({
      restaurant_id: auth.ctx.restaurantId,
      source_file_url: parsedUrl.data,
      source_type: "url",
      status: "extracting",
    })
    .select("id")
    .single()

  if (insertError || !job) {
    console.error("createImportJobFromUrl insert error:", insertError)
    return { success: false, error: "تعذر إنشاء مهمة الاستيراد" }
  }

  try {
    const { raw, verified, summary } = await extractMenuFromUrl(parsedUrl.data)

    const { error: updateError } = await supabase
      .from("menu_import_jobs")
      .update({
        status: "review",
        raw_extraction: raw,
        verified_extraction: verified,
        confidence_summary: summary,
      })
      .eq("id", job.id)
    if (updateError) console.error("createImportJobFromUrl update error:", updateError)

    return { success: true, jobId: job.id, extraction: verified, summary }
  } catch (err) {
    let message = "فشل استخراج القائمة، حاول مرة أخرى"
    let errorCode = "unknown"
    if (err instanceof UrlGuardError) {
      message = err.message // already a user-facing Arabic message
      errorCode = err.code
    } else if (err instanceof MenuExtractionError) {
      message = extractionErrorMessage(err)
      errorCode = err.code
    }
    console.error("createImportJobFromUrl extraction failed:", err)
    await supabase
      .from("menu_import_jobs")
      .update({ status: "failed", error: err instanceof Error ? err.message : String(err) })
      .eq("id", job.id)
    return { success: false, error: message, errorCode, jobId: job.id }
  }
}

/** Fetch an import job (RLS + explicit ownership check). */
export async function getImportJob(jobId: string): Promise<{ job: ImportJobRecord | null; error?: string }> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { job: null, error: auth.error }

  const { data, error } = await supabase
    .from("menu_import_jobs")
    .select(
      "id, restaurant_id, source_file_url, source_type, status, raw_extraction, verified_extraction, confidence_summary, error, created_at"
    )
    .eq("id", jobId)
    .eq("restaurant_id", auth.ctx.restaurantId)
    .single()

  if (error || !data) return { job: null, error: "لم يتم العثور على مهمة الاستيراد" }
  return { job: data as ImportJobRecord }
}

/**
 * Writes the (possibly user-edited) extraction into menu_categories /
 * menu_items and marks the job imported.
 * Legacy note: menu_categories has BOTH display_order and sort_order — set both.
 */
export async function applyImport(
  jobId: string,
  editedExtraction: unknown,
  options: unknown = {}
): Promise<ApplyImportResult> {
  const supabase = createClient()
  const auth = await getOwnedRestaurant(supabase)
  if (!auth.ok) return { success: false, error: auth.error }

  const parsed = EditedExtractionSchema.safeParse(editedExtraction)
  if (!parsed.success) {
    return { success: false, error: "بيانات القائمة غير صالحة — راجع الأصناف وحاول مرة أخرى" }
  }
  const extraction = parsed.data
  const parsedOptions = ApplyImportOptionsSchema.safeParse(options)
  if (!parsedOptions.success) {
    return { success: false, error: "إعدادات القالب غير صالحة — حاول مرة أخرى" }
  }

  const { data: job, error: jobError } = await supabase
    .from("menu_import_jobs")
    .select("id, restaurant_id, status")
    .eq("id", jobId)
    .eq("restaurant_id", auth.ctx.restaurantId)
    .single()
  if (jobError || !job) return { success: false, error: "لم يتم العثور على مهمة الاستيراد" }
  if (job.status === "imported") return { success: false, error: "تم استيراد هذه القائمة من قبل" }

  // Continue numbering after existing categories
  const { data: lastCategory } = await supabase
    .from("menu_categories")
    .select("display_order")
    .eq("restaurant_id", auth.ctx.restaurantId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle()
  let nextOrder = (lastCategory?.display_order ?? 0) + 1

  let categoriesCreated = 0
  let itemsCreated = 0

  const { data: starterCategories } = await supabase
    .from("menu_categories")
    .select("id, name, menu_items(id)")
    .eq("restaurant_id", auth.ctx.restaurantId)

  const emptyStarterCategoryIds = ((starterCategories ?? []) as StarterCategoryRow[])
    .filter((category) => {
      const items = Array.isArray(category.menu_items) ? category.menu_items : []
      return ONBOARDING_STARTER_CATEGORY_NAMES.has(String(category.name)) && items.length === 0
    })
    .map((category) => category.id)

  if (emptyStarterCategoryIds.length > 0) {
    const { error: cleanupError } = await supabase
      .from("menu_categories")
      .delete()
      .in("id", emptyStarterCategoryIds)
      .eq("restaurant_id", auth.ctx.restaurantId)
    if (cleanupError) console.error("applyImport starter category cleanup error:", cleanupError)
  }

  for (const category of extraction.categories) {
    const { data: createdCategory, error: categoryError } = await supabase
      .from("menu_categories")
      .insert({
        restaurant_id: auth.ctx.restaurantId,
        name: category.name,
        description: category.description || null,
        display_order: nextOrder,
        sort_order: nextOrder, // legacy column, kept in sync
        is_active: true,
      })
      .select("id")
      .single()

    if (categoryError || !createdCategory) {
      console.error("applyImport category insert error:", categoryError)
      return {
        success: false,
        error: `تعذر إنشاء قسم "${category.name}" — تم استيراد ${categoriesCreated} قسم و ${itemsCreated} صنف قبل الخطأ`,
        categoriesCreated,
        itemsCreated,
      }
    }
    nextOrder += 1
    categoriesCreated += 1

    const itemRows = category.items.map((item, index) => ({
      restaurant_id: auth.ctx.restaurantId,
      category_id: createdCategory.id,
      name: item.name,
      description: item.description || null,
      price: item.price,
      image_url: item.image_url || null,
      is_available: true,
      is_featured: false,
      display_order: index + 1,
    }))

    const { error: itemsError } = await supabase.from("menu_items").insert(itemRows)
    if (itemsError) {
      console.error("applyImport items insert error:", itemsError)
      return {
        success: false,
        error: `تعذر إضافة أصناف قسم "${category.name}" — تم استيراد ${categoriesCreated} قسم و ${itemsCreated} صنف قبل الخطأ`,
        categoriesCreated,
        itemsCreated,
      }
    }
    itemsCreated += category.items.length
  }

  const { error: markError } = await supabase
    .from("menu_import_jobs")
    .update({
      status: "imported",
      imported_at: new Date().toISOString(),
      verified_extraction: extraction,
    })
    .eq("id", jobId)
  if (markError) console.error("applyImport mark imported error:", markError)

  const restaurantPatch: Record<string, string> = {}
  if (parsedOptions.data.templateId) restaurantPatch.template_name = parsedOptions.data.templateId
  if (parsedOptions.data.logoUrl) restaurantPatch.logo_url = parsedOptions.data.logoUrl
  if (Object.keys(restaurantPatch).length > 0) {
    const { error: restaurantUpdateError } = await supabase
      .from("restaurants")
      .update(restaurantPatch)
      .eq("id", auth.ctx.restaurantId)
    if (restaurantUpdateError) console.error("applyImport restaurant update error:", restaurantUpdateError)
  }

  revalidatePath("/menu-editor")
  revalidatePath("/dashboard")
  return { success: true, categoriesCreated, itemsCreated }
}
