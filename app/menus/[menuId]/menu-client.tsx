"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MenuNotFound from "@/components/menu-not-found"
import QrMenuSelectionModal from "@/components/ui/qr-menu-selection-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, ArrowRight } from "lucide-react"
import { Building2 } from "lucide-react"

interface MenuClientProps {
  menuId: string
  currentMenu: {
    id: string
    menu_name: string
    language_code: string | null
    pdf_url: string
    restaurants: {
      id: string
      name: string
    }
  }
  languageVersions: Array<{
    id: string
    language_code: string
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
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentMenu.language_code || 'ar')
  const router = useRouter()

  useEffect(() => {
    // If multiple language versions exist and no language is pre-selected, show language selection page
    if (hasMultipleLanguages && !preSelectedLang) {
      setShowLanguageSelection(true)
    } else if (preSelectedLang) {
      // Use current menu but respect pre-selected language
      setActualMenuId(menuId)
      setSelectedLanguage(preSelectedLang)
    } else {
      // Use current menu
      setActualMenuId(menuId)
      setSelectedLanguage(currentMenu.language_code || 'ar')
    }
  }, [hasMultipleLanguages, preSelectedLang, menuId, currentMenu.language_code, languageVersions.length])

  const getLanguageInfo = (langCode: string) => {
    const languageMap: { [key: string]: { flag: string; name: string; nativeName: string } } = {
      'ar': { flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
      'en': { flag: '🇺🇸', name: 'English', nativeName: 'English' },
      'fr': { flag: '🇫🇷', name: 'French', nativeName: 'Français' },
      'es': { flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' }
    }
    return languageMap[langCode] || { flag: '🌐', name: langCode, nativeName: langCode }
  }

  const handleLanguageSelect = (langCode: string) => {
    // Find the menu version for this language
    const selectedVersion = [...languageVersions, { id: menuId, language_code: currentMenu.language_code, menu_name: currentMenu.menu_name }]
      .find(v => v.language_code === langCode)
    
    if (selectedVersion) {
      // Redirect to the selected language version with lang parameter
      window.location.href = `/menus/${selectedVersion.id}?lang=${langCode}`
    }
  }

  // If showing language selection, render full page
  if (showLanguageSelection && hasMultipleLanguages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Restaurant Header */}
            <div className="mb-8 bg-white rounded-xl border border-red-200 shadow-lg p-6">
              <div className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  {currentMenu.restaurants?.logo_url ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-200">
                      <img
                        src={currentMenu.restaurants.logo_url}
                        alt={currentMenu.restaurants.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-red-600" />
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentMenu.restaurants?.name}
                    </h1>
                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                      مطعم
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-white rounded-xl border border-red-200 shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Globe className="h-6 w-6 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    اختر لغة القائمة
                  </h2>
                </div>
                <p className="text-gray-600">
                  هذه القائمة متوفرة بعدة لغات. اختر اللغة المفضلة لديك:
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Current menu language */}
                {(() => {
                  const langInfo = getLanguageInfo(currentMenu.language_code || 'ar')
                  return (
                    <Button
                      variant="outline"
                      className="w-full p-6 h-auto justify-between border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                      onClick={() => handleLanguageSelect(currentMenu.language_code || 'ar')}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{langInfo.flag}</span>
                        <div className="text-left">
                          <p className="font-semibold text-lg">
                            {langInfo.nativeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            الأصل
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </Button>
                  )
                })()}

                {/* Other language versions */}
                {languageVersions.map((version) => {
                  const langInfo = getLanguageInfo(version.language_code)
                  
                  return (
                    <Button
                      key={version.id}
                      variant="outline"
                      className="w-full p-6 h-auto justify-between border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                      onClick={() => handleLanguageSelect(version.language_code)}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{langInfo.flag}</span>
                        <div className="text-left">
                          <p className="font-semibold text-lg">
                            {langInfo.nativeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {langInfo.name}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                يمكنك تغيير اللغة في أي وقت أثناء تصفح القائمة
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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