"use server"

/**
 * applyLogoTheme(restaurantId): extract the dominant brand colors from the
 * restaurant's logo and persist them to `restaurants.color_palette` (the
 * source of truth the public menu themes itself from).
 *
 * Extraction order: pure-TS PNG decode (no browser) → playwright canvas
 * sampling (any format). Ownership is verified via restaurants.user_id.
 */

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { buildThemePalette, extractPaletteFromLogo, type BrandColors } from "./palette"
import { extractBrandColorsViaBrowser } from "./browser-extract"

export interface ApplyLogoThemeResult {
  success: boolean
  palette?: BrandColors
  /** Full derived menu palette (WCAG-adjusted) for instant previews. */
  preview?: ReturnType<typeof buildThemePalette>
  error?: string
}

export async function applyLogoTheme(restaurantId: string): Promise<ApplyLogoThemeResult> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "يجب تسجيل الدخول أولاً" }

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, logo_url")
      .eq("id", restaurantId)
      .eq("user_id", user.id)
      .single()
    if (!restaurant) return { success: false, error: "المطعم غير موجود" }
    if (!restaurant.logo_url) {
      return { success: false, error: "أضف شعار المطعم أولاً لاستخراج الألوان منه" }
    }

    const brand =
      (await extractPaletteFromLogo(restaurant.logo_url)) ??
      (await extractBrandColorsViaBrowser(restaurant.logo_url))
    if (!brand) {
      return { success: false, error: "تعذّر استخراج الألوان من الشعار — جرّب صورة أوضح" }
    }

    const { error } = await supabase
      .from("restaurants")
      .update({
        color_palette: {
          primary: brand.primary,
          secondary: brand.secondary ?? null,
          accent: brand.accent ?? null,
        },
      })
      .eq("id", restaurantId)
      .eq("user_id", user.id)
    if (error) return { success: false, error: "تعذّر حفظ الألوان، حاول مرة أخرى" }

    revalidatePath("/dashboard")
    return { success: true, palette: brand, preview: buildThemePalette(brand) }
  } catch {
    return { success: false, error: "حدث خطأ غير متوقع أثناء استخراج الألوان" }
  }
}
