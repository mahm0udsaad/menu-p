/**
 * Pure types + language-merge logic for the public menu.
 * No imports from Next/Supabase — unit-testable in plain node.
 */

export interface PublicMenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_featured: boolean
  is_available: boolean
  dietary_info: string[]
  display_order: number
}

export interface PublicMenuCategory {
  id: string
  name: string
  description: string | null
  display_order: number
  items: PublicMenuItem[]
}

export interface PublicLanguage {
  code: string
  /** published_menus row carrying this language (for its PDF), if any. */
  menuId: string | null
  pdfUrl: string | null
}

export interface PublicRestaurant {
  id: string
  name: string
  category: string | null
  currency: string | null
  address: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
  color_palette: {
    primary?: string | null
    secondary?: string | null
    accent?: string | null
  } | null
}

interface TranslatedItem {
  id: string
  name?: string
  description?: string | null
  dietary_info?: string[]
}

export interface TranslatedCategory {
  id: string
  name?: string
  description?: string | null
  menu_items?: TranslatedItem[]
}

/**
 * Merge a translation snapshot over the live menu (by id) so prices,
 * availability, images and ordering always come from the live tables while
 * names/descriptions come from the translation. Pure — unit-testable.
 */
export function categoriesForLanguage(
  live: PublicMenuCategory[],
  translations: Record<string, TranslatedCategory[]>,
  sourceLanguage: string,
  lang: string,
): PublicMenuCategory[] {
  if (lang === sourceLanguage) return live
  const snapshot = translations[lang]
  if (!snapshot) return live

  const categoryText = new Map<string, TranslatedCategory>()
  const itemText = new Map<string, TranslatedItem>()
  for (const cat of snapshot) {
    categoryText.set(cat.id, cat)
    for (const item of cat.menu_items ?? []) itemText.set(item.id, item)
  }

  return live.map((cat) => {
    const tc = categoryText.get(cat.id)
    return {
      ...cat,
      name: tc?.name || cat.name,
      description: tc?.description ?? cat.description,
      items: cat.items.map((item) => {
        const ti = itemText.get(item.id)
        return {
          ...item,
          name: ti?.name || item.name,
          description: ti?.description ?? item.description,
          dietary_info:
            ti?.dietary_info && ti.dietary_info.length === item.dietary_info.length
              ? ti.dietary_info
              : item.dietary_info,
        }
      }),
    }
  })
}
