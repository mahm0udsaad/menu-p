import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import MenuClient from "./menu-client"

interface MenuPageProps {
  params: Promise<{ menuId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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
      restaurants!inner (
        id,
        name
      )
    `)
    .eq("id", menuId)
    .single()

  if (currentError || !currentMenu) {
        console.error("Menu not found:", currentError)
    notFound()
      }

      // Check for other language versions
      const { data: languageVersions, error: versionsError } = await supabase
        .from("published_menus")
        .select("id, language, menu_name")
        .eq("restaurants.id", currentMenu.restaurants.id)
        .eq("menu_name", currentMenu.menu_name)
        .neq("id", menuId)

      if (versionsError) {
        console.error("Error checking language versions:", versionsError)
      }

      const hasMultipleLanguages = languageVersions && languageVersions.length > 0
  const preSelectedLang = resolvedSearchParams.lang as string

  return (
    <MenuClient
      menuId={menuId}
      currentMenu={currentMenu}
      languageVersions={languageVersions || []}
      hasMultipleLanguages={hasMultipleLanguages}
      preSelectedLang={preSelectedLang}
    />
  )
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
      restaurants!inner (
        name
      )
    `)
    .eq("id", menuId)
    .single()

  if (!menu) {
    return {
      title: "Menu Not Found",
      description: "The requested menu could not be found."
    }
  }

  return {
    title: `${menu.menu_name} - ${menu.restaurants.name}`,
    description: `View the digital menu for ${menu.restaurants.name}`,
    openGraph: {
      title: `${menu.menu_name} - ${menu.restaurants.name}`,
      description: `View the digital menu for ${menu.restaurants.name}`,
      type: 'website',
    },
  }
}
