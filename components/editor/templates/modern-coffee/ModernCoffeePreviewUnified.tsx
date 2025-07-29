import React from 'react'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { UnifiedTemplateBase, UnifiedTemplateProps } from '@/components/shared/unified-template-base'
import { SharedFontSettings } from '@/components/shared/menu-components'

/**
 * Unified Modern Coffee Preview Component
 * Uses the same shared components as PDF templates for perfect consistency
*/
const ModernCoffeePreviewUnified: React.FC = () => {
  const {
    categories,
    restaurant,
    pageBackgroundSettings,
    fontSettings,
    rowStyleSettings,
    appliedRowStyles,
    currentLanguage,
    moveItem,
    handleAddCategory,
  } = useMenuEditor()

  const handleAddCategoryClick = () => {
    handleAddCategory()
  }

  // Convert context data to unified template props
  const unifiedProps: UnifiedTemplateProps = {
    restaurant: {
      id: restaurant?.id || '',
      name: restaurant?.name || '',
      category: restaurant?.category || '',
      logo_url: restaurant?.logo_url || undefined,
      address: restaurant?.address || undefined,
      phone: restaurant?.phone || undefined,
      website: restaurant?.website || undefined,
      color_palette: restaurant?.color_palette || undefined,
      currency: restaurant?.currency || undefined
    },
    categories: categories || [],
    language: currentLanguage,
    fontSettings: fontSettings as SharedFontSettings,
    customizations: {
      pageBackgroundSettings,
      rowStyles: rowStyleSettings
    },
    isPdfGeneration: false,
    isPreview: true,
    showFooter: true,
    showImages: true
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ScrollArea className="h-full w-full">
        <div className="relative">
          {/* Unified Template Base */}
          <UnifiedTemplateBase {...unifiedProps} />
          
          {/* Preview-specific controls */}
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              onClick={handleAddCategoryClick}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              {currentLanguage === 'ar' ? 'إضافة قسم' : 'Add Category'}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </DndProvider>
  )
}

export default ModernCoffeePreviewUnified