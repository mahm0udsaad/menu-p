"use client"

import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useMenuEditor, type Restaurant, type MenuCategory } from "@/contexts/menu-editor-context"
import { MenuHeader } from "./menu-header"
import { MenuSection } from "./menu-section"
import { MenuFooter } from "./menu-footer"
import PaintingStylePreview from './templates/painting-style/PaintingStylePreview'
import VintagePreview from './templates/vintage/VintagePreview'
import ModernPreview from './templates/modern/ModernPreview'
import { useRouter } from "next/navigation"
import { FileText, PenLine } from "lucide-react"

interface ProfessionalCafeMenuPreviewProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  onRefresh: () => void
}

const ClassicMenuContent: React.FC = () => {
    const { categories, appliedFontSettings, showRowStylingModal, setShowRowStylingModal, rowStyleSettings, handleSaveRowStyles, appliedPageBackgroundSettings, showDesignModal, showPageBackgroundModal, setShowPageBackgroundModal, } = useMenuEditor();
    const isEmpty = categories.length === 0;
    const router = useRouter();

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
                        <div className="flex items-center justify-center py-12" dir="rtl">
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <FileText className="h-7 w-7 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">قائمتك فارغة</h3>
                                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                    استورد قائمتك من PDF أو صورة بالذكاء الاصطناعي، أو أضف أول طبق يدوياً
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push("/dashboard/import")}
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                                    >
                                        <FileText className="h-4 w-4" />
                                        استيراد من PDF أو صورة
                                    </button>
                                    <button
                                        onClick={() => {
                                            const firstSection = document.querySelector('[data-add-item]') as HTMLButtonElement | null
                                            firstSection?.click()
                                        }}
                                        className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                                    >
                                        <PenLine className="h-4 w-4" />
                                        إضافة طبق يدوياً
                                    </button>
                                </div>
                            </div>
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
  } = useMenuEditor()

  const renderTemplatePreview = () => {
    switch (selectedTemplate) {
      case 'painting':
        return <PaintingStylePreview />;
      case 'vintage':
        return <VintagePreview />;
      case 'modern':
        return <ModernPreview />;
      case 'classic':
      default:
        return <ClassicMenuContent />;
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {renderTemplatePreview()}
        {/* Modals are now managed centrally in ModalManager */}
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