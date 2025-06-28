"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MenuNotFound from "@/components/menu-not-found"
import QrMenuSelectionModal from "@/components/ui/qr-menu-selection-modal"

interface MenuClientProps {
  menuId: string
  currentMenu: {
    id: string
    menu_name: string
    language: string | null
    pdf_url: string
    restaurants: {
      id: string
      name: string
    }
  }
  languageVersions: Array<{
    id: string
    language: string
    menu_name: string
  }>
  hasMultipleLanguages: boolean
  preSelectedLang: string | undefined
}

export default function MenuClient({
  menuId,
  currentMenu,
  languageVersions,
  hasMultipleLanguages,
  preSelectedLang
}: MenuClientProps) {
  const [showLanguageSelection, setShowLanguageSelection] = useState(false)
  const [actualMenuId, setActualMenuId] = useState<string>(menuId)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentMenu.language || 'ar')
  const router = useRouter()

  useEffect(() => {
    // If multiple language versions exist and no language is pre-selected, show selection modal
    if (hasMultipleLanguages && !preSelectedLang) {
      setShowLanguageSelection(true)
    } else {
      // Use current menu
      setActualMenuId(menuId)
      setSelectedLanguage(currentMenu.language || 'ar')
    }
  }, [hasMultipleLanguages, preSelectedLang, menuId, currentMenu.language])

  const handleLanguageSelect = (selectedMenuId: string, language: string) => {
    setActualMenuId(selectedMenuId)
    setSelectedLanguage(language)
    setShowLanguageSelection(false)
    
    // Update URL with language parameter
    const newUrl = `/menus/${selectedMenuId}?lang=${language}`
    router.replace(newUrl)
  }

  return (
    <>
      <div className="w-full h-screen relative">
        <iframe 
          src={`/api/menu-pdf/${actualMenuId}`}
          className="w-full h-full border-none" 
          title={`${currentMenu.menu_name} - ${currentMenu.restaurants.name}`}
          loading="lazy"
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