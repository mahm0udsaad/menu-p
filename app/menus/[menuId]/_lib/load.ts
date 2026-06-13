import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type {
  PublicLanguage,
  PublicMenuCategory,
  PublicMenuItem,
  PublicRestaurant,
  TranslatedCategory,
} from "@/components/public-menu/types"

export interface PublicMenuData {
  menu: {
    id: string
    name: string
    pdfUrl: string | null
    languageCode: string
  }
  restaurant: PublicRestaurant
  customizations: {
    font_settings?: {
      arabic?: { font?: string; weight?: string }
      english?: { font?: string; weight?: string }
    }
  } | null
  /** Live categories/items in the source language. */
  categories: PublicMenuCategory[]
  /** language_code → translated categories snapshot. */
  translations: Record<string, TranslatedCategory[]>
  languages: PublicLanguage[]
  sourceLanguage: string
}

function sortByOrder<T extends { display_order: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.display_order - b.display_order)
}

/**
 * Single round of parallel queries for everything the public menu needs.
 * Cached per request so generateMetadata and the page share one load.
 */
export const loadPublicMenu = cache(
  async (menuId: string): Promise<PublicMenuData | null> => {
    const supabase = createClient()

    const { data: menu } = await supabase
      .from("published_menus")
      .select("id, menu_name, pdf_url, language_code, restaurant_id, parent_menu_id")
      .eq("id", menuId)
      .single()
    if (!menu) return null

    const [restaurantRes, versionsRes, translationsRes, categoriesRes, customizationsRes] =
      await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name, category, currency, address, phone, website, logo_url, color_palette")
          .eq("id", menu.restaurant_id)
          .single(),
        supabase
          .from("published_menus")
          .select("id, language_code, menu_name, parent_menu_id, pdf_url")
          .eq("restaurant_id", menu.restaurant_id),
        supabase
          .from("menu_translations")
          .select("language_code, source_language_code, translated_data")
          .eq("restaurant_id", menu.restaurant_id),
        supabase
          .from("menu_categories")
          .select(
            "id, name, description, display_order, is_active, menu_items(id, name, description, price, image_url, is_available, is_featured, dietary_info, display_order)",
          )
          .eq("restaurant_id", menu.restaurant_id),
        supabase
          .from("menu_customizations")
          .select("font_settings")
          .eq("restaurant_id", menu.restaurant_id)
          .single(),
      ])

    const restaurant = restaurantRes.data
    if (!restaurant) return null

    // --- live menu content (source language) ---
    type ItemRow = Omit<PublicMenuItem, "is_available"> & { is_available: boolean | null }
    type CategoryRow = Omit<PublicMenuCategory, "items"> & {
      is_active: boolean | null
      menu_items: ItemRow[] | null
    }
    const categoryRows: CategoryRow[] = Array.isArray(categoriesRes?.data)
      ? (categoriesRes.data as unknown as CategoryRow[])
      : []
    const categories: PublicMenuCategory[] = sortByOrder(
      categoryRows
        .filter((c) => c.is_active !== false)
        .map((c) => ({ ...c, display_order: c.display_order ?? 0 })),
    )
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? null,
        display_order: c.display_order,
        // Unavailable items stay in the list (rendered dimmed, "غير متوفر").
        items: sortByOrder(
          (c.menu_items ?? []).map((i) => ({ ...i, display_order: i.display_order ?? 0 })),
        ).map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description ?? null,
          price: typeof i.price === "number" ? i.price : i.price ? Number(i.price) : null,
          image_url: i.image_url ?? null,
          is_featured: Boolean(i.is_featured),
          is_available: i.is_available !== false,
          dietary_info: Array.isArray(i.dietary_info) ? i.dietary_info : [],
          display_order: i.display_order,
        })),
      }))
      .filter((c) => c.items.length > 0)

    // --- language versions: same family = same parent root OR same menu_name ---
    const rootId: string = menu.parent_menu_id ?? menu.id
    type VersionRow = {
      id: string
      language_code: string | null
      menu_name: string
      parent_menu_id: string | null
      pdf_url: string | null
    }
    const versionRows: VersionRow[] = Array.isArray(versionsRes?.data) ? versionsRes.data : []
    const family = versionRows.filter(
      (v) =>
        v.id === rootId ||
        v.parent_menu_id === rootId ||
        v.id === menu.id ||
        v.menu_name === menu.menu_name,
    )

    const sourceLanguage: string = menu.language_code ?? "ar"
    const languageMap = new Map<string, PublicLanguage>()
    languageMap.set(sourceLanguage, {
      code: sourceLanguage,
      menuId: menu.id,
      pdfUrl: menu.pdf_url ?? null,
    })
    for (const v of family) {
      const code = v.language_code ?? "ar"
      if (!languageMap.has(code)) {
        languageMap.set(code, { code, menuId: v.id, pdfUrl: v.pdf_url ?? null })
      }
    }

    // --- AI translations (live HTML rendering for extra languages) ---
    const translations: Record<string, TranslatedCategory[]> = {}
    const translationRows: {
      language_code: string
      translated_data: { categories?: TranslatedCategory[] } | null
    }[] = Array.isArray(translationsRes?.data) ? translationsRes.data : []
    for (const row of translationRows) {
      const cats = row.translated_data?.categories
      if (Array.isArray(cats) && cats.length > 0) {
        translations[row.language_code] = cats
        if (!languageMap.has(row.language_code)) {
          languageMap.set(row.language_code, {
            code: row.language_code,
            menuId: null,
            pdfUrl: null,
          })
        }
      }
    }

    return {
      menu: {
        id: menu.id,
        name: menu.menu_name,
        pdfUrl: menu.pdf_url ?? null,
        languageCode: sourceLanguage,
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category ?? null,
        currency: restaurant.currency ?? null,
        address: restaurant.address ?? null,
        phone: restaurant.phone ?? null,
        website: restaurant.website ?? null,
        logo_url: restaurant.logo_url ?? null,
        color_palette: restaurant.color_palette ?? null,
      },
      customizations: customizationsRes?.data ?? null,
      categories,
      translations,
      languages: [...languageMap.values()],
      sourceLanguage,
    }
  },
)
