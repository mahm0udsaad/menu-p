"use client"

import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useMenuEditor, type Restaurant, type MenuCategory } from "@/contexts/menu-editor-context"
import { MenuHeader } from "./menu-header"
import { MenuSection } from "./menu-section"
import { FontSettingsModal } from "./font-settings-modal"
import { MenuFooter } from "./menu-footer"
import RowStylingModal from '@/components/row-styling-modal'
import PageBackgroundModal from '@/components/editor/page-background-modal'
import { StickyControlBar } from './floating-controls'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Languages } from "lucide-react"
import { SUPPORTED_LANGUAGES } from "@/lib/utils/translation-constants"

interface ProfessionalCafeMenuPreviewProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  onRefresh: () => void
}

// Language tabs component
const LanguageTabs: React.FC = () => {
  const {
    currentLanguage,
    availableLanguages,
    switchLanguage,
    isLoadingTranslation,
  } = useMenuEditor()

  if (availableLanguages.length <= 1) {
    return null // Don't show tabs if only one language
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Languages className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600 ml-2">اللغات:</span>
        <div className="flex gap-2">
          {availableLanguages.map((langCode) => {
            const language = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
            const isActive = currentLanguage === langCode
            
            return (
              <Button
                key={langCode}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => switchLanguage(langCode)}
                disabled={isLoadingTranslation}
                className={`text-sm ${isActive ? 'bg-red-600 text-white' : 'text-gray-700'}`}
              >
                {language?.name || langCode}
                {isActive && (
                  <Badge variant="secondary" className="ml-2 bg-white text-red-600">
                    نشط
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Main menu content component that uses the context
const MenuContent: React.FC = () => {
  const {
    getCurrentCategories,
    appliedFontSettings,
    showRowStylingModal,
    setShowRowStylingModal,
    rowStyleSettings,
    handleSaveRowStyles,
    appliedPageBackgroundSettings,
    showDesignModal,
    showPageBackgroundModal,
    setShowPageBackgroundModal,
    currentLanguage,
    loadAvailableTranslations,
  } = useMenuEditor()

  // Load available translations on component mount
  React.useEffect(() => {
    loadAvailableTranslations()
  }, [loadAvailableTranslations])

  const categories = getCurrentCategories()
  const isEmpty = categories.length === 0

  // Generate page background style
  const getPageBackgroundStyle = () => {
    const { backgroundType, backgroundColor, backgroundImage, gradientFrom, gradientTo, gradientDirection } = appliedPageBackgroundSettings
    
    if (backgroundType === 'solid') {
      return { backgroundColor }
    } else if (backgroundType === 'gradient') {
      return { background: `linear-gradient(${gradientDirection}, ${gradientFrom}, ${gradientTo})` }
    } else if (backgroundType === 'image' && backgroundImage) {
      return { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }
    return { backgroundColor: '#ffffff' }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen" style={getPageBackgroundStyle()}>
        {/* Language Tabs */}
        <LanguageTabs />
        
        {/* Sticky Control Bar */}
        <StickyControlBar />
        
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          {/* Header */}
          <MenuHeader isEmpty={isEmpty} />

          {/* Menu Content */}
          <div className="p-6 space-y-8">
            {isEmpty ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أقسام في القائمة</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة أقسام وعناصر لقائمتك</p>
                {currentLanguage !== 'ar' && (
                  <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    عرض الترجمة لـ {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name}
                  </p>
                )}
              </div>
            ) : (
              <>
                {currentLanguage !== 'ar' && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          عرض الترجمة لـ <strong>{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {categories.map((category: MenuCategory) => (
                  <MenuSection
                    key={category.id}
                    category={category}
                  />
                ))}
              </>
            )}
          </div>

          {/* Footer Information */}
          <MenuFooter />
        </div>

        {/* Modals */}
        {showDesignModal && <FontSettingsModal />}
        <RowStylingModal
          isOpen={showRowStylingModal}
          onClose={() => setShowRowStylingModal(false)}
          onSave={handleSaveRowStyles}
          currentSettings={rowStyleSettings}
        />
        <PageBackgroundModal
          isOpen={showPageBackgroundModal}
          onClose={() => setShowPageBackgroundModal(false)}
        />
      </div>
    </DndProvider>
  )
}

// Main component with provider
export default function ProfessionalCafeMenuPreview({
  restaurant,
  categories: initialCategories,
  onRefresh,
}: ProfessionalCafeMenuPreviewProps) {
  return <MenuContent />
} 