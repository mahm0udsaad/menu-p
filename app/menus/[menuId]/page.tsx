"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MenuNotFound from "@/components/menu-not-found"
import QrMenuSelectionModal from "@/components/ui/qr-menu-selection-modal"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"

interface MenuPageProps {
  params: Promise<{ menuId: string }>
}

export default function MenuPage({ params }: MenuPageProps) {
  const [menuId, setMenuId] = useState<string>("")
  const [showLanguageSelection, setShowLanguageSelection] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [actualMenuId, setActualMenuId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initializeMenu = async () => {
      const resolvedParams = await params
      const paramMenuId = resolvedParams.menuId
      setMenuId(paramMenuId)
      
      // Check if there are multiple language versions
      await checkForMultipleLanguages(paramMenuId)
    }
    
    initializeMenu()
  }, [params])

  const checkForMultipleLanguages = async (menuId: string) => {
    try {
      setLoading(true)
      
      // Get the current menu info
      const { data: currentMenu, error: currentError } = await supabase
        .from("published_menus")
        .select(`
          id,
          menu_name,
          language,
          restaurants!inner (
            id,
            name
          )
        `)
        .eq("id", menuId)
        .single()

      if (currentError) {
        console.error("Menu not found:", currentError)
        setLoading(false)
        return
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

      // If multiple language versions exist and no language is pre-selected, show selection modal
      const hasMultipleLanguages = languageVersions && languageVersions.length > 0
      const preSelectedLang = searchParams.get("lang")
      
      if (hasMultipleLanguages && !preSelectedLang) {
        setShowLanguageSelection(true)
      } else {
        // Use current menu
        setActualMenuId(menuId)
        setSelectedLanguage(currentMenu.language || 'ar')
      }
    } catch (error) {
      console.error("Error initializing menu:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageSelect = (selectedMenuId: string, language: string) => {
    setActualMenuId(selectedMenuId)
    setSelectedLanguage(language)
    setShowLanguageSelection(false)
    
    // Update URL with language parameter
    const newUrl = `/menus/${selectedMenuId}?lang=${language}`
    router.replace(newUrl)
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">جاري تحميل القائمة... / Loading menu...</p>
        </div>
      </div>
    )
  }

  const displayMenuId = actualMenuId || menuId

  return (
    <>
      <div className="w-full h-screen relative">
        <iframe 
          src={`/api/menu-pdf/${displayMenuId}`}
          className="w-full h-full border-none" 
          title="Menu PDF" 
        />
        <MenuNotFound />
      </div>

      <QrMenuSelectionModal
        isOpen={showLanguageSelection}
        onClose={() => setShowLanguageSelection(false)}
        menuId={menuId}
        onLanguageSelect={handleLanguageSelect}
      />
    </>
  )
}
