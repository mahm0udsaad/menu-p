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
import { TemplateSwitcherModal } from './template-switcher-modal'
import PaintingStylePreview from './templates/painting-style/PaintingStylePreview'

interface ProfessionalCafeMenuPreviewProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  onRefresh: () => void
}

const ClassicMenuContent: React.FC = () => {
    const { categories, appliedFontSettings, showRowStylingModal, setShowRowStylingModal, rowStyleSettings, handleSaveRowStyles, appliedPageBackgroundSettings, showDesignModal, showPageBackgroundModal, setShowPageBackgroundModal, } = useMenuEditor();
    const isEmpty = categories.length === 0;

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
        <div className="min-h-screen" style={getPageBackgroundStyle()}>
            <div className="max-w-4xl mx-auto p-4 sm:p-8">
                <MenuHeader isEmpty={isEmpty} />
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
                        </div>
                    ) : (
                        categories.map((category: MenuCategory) => (
                            <MenuSection
                                key={category.id}
                                category={category}
                            />
                        ))
                    )}
                </div>
                <MenuFooter />
            </div>
        </div>
    )
}


// Main menu content component that uses the context
const MenuContent: React.FC = () => {
  const {
    selectedTemplate,
    showDesignModal,
    showRowStylingModal,
    setShowRowStylingModal,
    rowStyleSettings,
    handleSaveRowStyles,
    showPageBackgroundModal,
    setShowPageBackgroundModal
  } = useMenuEditor()

  const renderTemplatePreview = () => {
    switch (selectedTemplate) {
      case 'painting':
        return <PaintingStylePreview />;
      case 'classic':
      default:
        return <ClassicMenuContent />;
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {renderTemplatePreview()}
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
        <TemplateSwitcherModal />
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