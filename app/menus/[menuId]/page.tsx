import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import MenuClient from "./menu-client"

interface MenuPageProps {
  params: Promise<{ menuId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ menuId: string }> }) {
  const resolvedParams = await params
  const { menuId } = resolvedParams
  const supabase = createClient()

  const { data: menu } = await supabase
    .from("published_menus")
    .select(`
      menu_name,
      restaurant_id
    `)
    .eq("id", menuId)
    .single()

  if (!menu) {
    return {
      title: "Menu Not Found",
      description: "The requested menu could not be found."
    }
  }

  // Get restaurant info separately
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", menu.restaurant_id)
    .single()

  const restaurantName = restaurant?.name || "Restaurant"

  return {
    title: `${menu.menu_name} - ${restaurantName}`,
    description: `View ${menu.menu_name} from ${restaurantName}. Digital menu with easy navigation.`
  }
}

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { menuId } = resolvedParams
  const supabase = createClient()
      
  // Get the current menu info
  const { data: currentMenu, error: currentError } = await supabase
    .from("published_menus")
    .select(`
      id,
      menu_name,
      language_code,
      pdf_url,
      restaurant_id
    `)
    .eq("id", menuId)
    .single()

  if (currentError || !currentMenu) {
    console.error("Menu not found:", currentError)
    notFound()
  }

  // Get restaurant info separately
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", currentMenu.restaurant_id)
    .single()

  if (restaurantError || !restaurant) {
    console.error("Restaurant not found:", restaurantError)
    notFound()
  }

  // Check for other language versions (including current menu)
  const { data: allLanguageVersions, error: versionsError } = await supabase
    .from("published_menus")
    .select("id, language_code, menu_name")
    .eq("restaurant_id", restaurant.id)
    .eq("menu_name", currentMenu.menu_name)

  if (versionsError) {
    console.error("Error checking language versions:", versionsError)
  }

  // Filter out current menu to get other versions
  const languageVersions = allLanguageVersions?.filter(v => v.id !== menuId) || []
  const hasMultipleLanguages = allLanguageVersions && allLanguageVersions.length > 1
  const preSelectedLang = resolvedSearchParams.lang as string

  // Remove redirect - let menu-client handle language selection
  const enrichedCurrentMenu = {
    ...currentMenu,
    restaurants: restaurant
  }

  return (
    <MenuClient
      menuId={menuId}
      currentMenu={enrichedCurrentMenu}
      languageVersions={languageVersions}
      hasMultipleLanguages={hasMultipleLanguages}
      preSelectedLang={preSelectedLang}
    />
  )
}
