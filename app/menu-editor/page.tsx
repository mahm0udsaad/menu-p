import { createClient } from "@/lib/supabase/server"
import { getMenuData, canPublishMenu } from "@/lib/actions/menu"
import { getMenuTranslations } from "@/lib/actions/menu-translation"
import LiveMenuEditor from "@/components/editor/live-menu-editor"
import { MenuEditorProvider } from "@/contexts/menu-editor-context"
import { redirect } from 'next/navigation'

interface MenuCategory {
  id: string
  name: string
  description: string | null
  background_image_url?: string | null
  menu_items: MenuItem[]
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
  display_order?: number
  category_id?: string
  created_at?: string
  updated_at?: string
}

export default async function MenuEditorServer() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!restaurant) {
    redirect("/onboarding")
  }
  
  const [menuResult, planInfoResult, translationsResult] = await Promise.all([
    getMenuData(restaurant.id),
    canPublishMenu(restaurant.id),
    getMenuTranslations(restaurant.id)
  ])

  const initialMenuData = menuResult.data || []
  const planInfo = planInfoResult.success ? {
    planType: planInfoResult.planType,
    maxMenus: planInfoResult.maxMenus,
    currentMenus: planInfoResult.currentMenus,
    canPublish: planInfoResult.canPublish
  } : null
  
  const initialTranslations = (translationsResult.success && translationsResult.data)
    ? translationsResult.data.reduce((acc: { [language: string]: { categories: MenuCategory[] } }, translation: { language_code: string; translated_data: any }) => {
        if (translation.translated_data && Array.isArray(translation.translated_data.categories)) {
          acc[translation.language_code] = {
            categories: translation.translated_data.categories,
          }
        }
        return acc
      }, {} as { [language: string]: { categories: MenuCategory[] } })
    : {}

  return (
    <MenuEditorProvider 
      restaurant={restaurant}
      initialCategories={initialMenuData}
      onRefresh={async () => {
        'use server'
        const { getMenuData } = await import("@/lib/actions/menu")
        const result = await getMenuData(restaurant.id)
        return result.data || []
      }}
    >
      <LiveMenuEditor
        restaurant={restaurant}
        initialMenuData={initialMenuData}
        initialPlanInfo={planInfo}
        initialTranslations={initialTranslations}
      />
    </MenuEditorProvider>
  )
} 