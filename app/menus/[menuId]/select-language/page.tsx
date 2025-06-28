import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import LanguageSelectionClient from "./language-selection-client"

interface LanguageSelectionPageProps {
  params: Promise<{ menuId: string }>
}

export default async function LanguageSelectionPage({ params }: LanguageSelectionPageProps) {
  const resolvedParams = await params
  const { menuId } = resolvedParams
  const supabase = createClient()
      
  // Get the current menu info
  const { data: currentMenu, error: currentError } = await supabase
    .from("published_menus")
    .select(`
      id,
      menu_name,
      language_code,
      restaurant_id
    `)
    .eq("id", menuId)
    .single()

  if (currentError || !currentMenu) {
    console.error("Menu not found:", currentError)
    notFound()
  }

  // Get restaurant info
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, logo_url, category")
    .eq("id", currentMenu.restaurant_id)
    .single()

  if (restaurantError || !restaurant) {
    console.error("Restaurant not found:", restaurantError)
    notFound()
  }

  // Get all language versions of this menu
  const { data: allLanguageVersions, error: versionsError } = await supabase
    .from("published_menus")
    .select("id, language_code, menu_name, version_name")
    .eq("restaurant_id", restaurant.id)
    .eq("menu_name", currentMenu.menu_name)

  if (versionsError || !allLanguageVersions || allLanguageVersions.length < 2) {
    // If there aren't multiple languages, redirect back to the menu
    notFound()
  }

  return (
    <LanguageSelectionClient
      restaurant={restaurant}
      languageVersions={allLanguageVersions}
      originalMenuId={menuId}
    />
  )
} 