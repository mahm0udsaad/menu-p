"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Palette, Type, Layers, Image, Plus } from 'lucide-react'
import { useMenuEditor } from '@/contexts/menu-editor-context'

export const StickyControlBar: React.FC = () => {
  const {
    setShowDesignModal,
    setShowRowStylingModal,
    setShowPageBackgroundModal,
    handleLoadDummyData,
    isLoadingDummy
  } = useMenuEditor()

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          {/* Font Settings Button */}
          <Button
            onClick={() => setShowDesignModal(true)}
            variant="outline"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 border-emerald-600 hover:border-emerald-700 shadow-sm hover:shadow-md transition-all px-4 py-2 h-10"
            title="تصميم"
          >
            <Type className="h-4 w-4" />
            <span className="text-sm font-medium">تصميم</span>
          </Button>

          {/* Row Styling Button */}
          <Button
            onClick={() => setShowRowStylingModal(true)}
            variant="outline"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md transition-all px-4 py-2 h-10"
            title="عناصر"
          >
            <Layers className="h-4 w-4" />
            <span className="text-sm font-medium">عناصر</span>
          </Button>

          {/* Page Background Button */}
          <Button
            onClick={() => setShowPageBackgroundModal(true)}
            variant="outline"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 border border-orange-600 hover:border-orange-700 shadow-sm hover:shadow-md transition-all px-4 py-2 h-10"
            title="خلفية"
          >
            <Image className="h-4 w-4" />
            <span className="text-sm font-medium">خلفية</span>
          </Button>

          {/* Load Dummy Data Button */}
          <Button
            onClick={handleLoadDummyData}
            disabled={isLoadingDummy}
            variant="outline"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-700 border-gray-600 hover:border-gray-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 px-4 py-2 h-10"
            title="إضافة بيانات تجريبية"
          >
            {isLoadingDummy ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">بيانات تجريبية</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Keep the old FloatingControls for backward compatibility, but export the new one
export const FloatingControls = StickyControlBar