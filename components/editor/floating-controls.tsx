"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Type, Layers, Image, Plus, LayoutTemplate } from 'lucide-react'
import { useMenuEditor } from '@/contexts/menu-editor-context'

const ActionButton = ({
  onClick,
  title,
  children,
  className,
  disabled = false,
}: {
  onClick?: () => void
  title: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) => (
  <div className="relative group flex items-center">
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
      className={`rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-200 ${className}`}
      aria-label={title}
    >
      {children}
    </Button>
    <div
      className="absolute bottom-full mb-2 w-auto left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      role="tooltip"
    >
      {title}
      <svg
        className="absolute text-gray-900 h-2 w-full left-0 top-full"
        x="0px"
        y="0px"
        viewBox="0 0 255 255"
        xmlSpace="preserve"
      >
        <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
      </svg>
    </div>
  </div>
)

export const QuickActionsBar: React.FC = () => {
  const {
    setShowDesignModal,
    setShowRowStylingModal,
    setShowPageBackgroundModal,
    setShowTemplateSwitcherModal,
    handleLoadDummyData,
    isLoadingDummy,
  } = useMenuEditor()

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-full border border-gray-200 shadow-lg">
        <ActionButton
          onClick={() => setShowDesignModal(true)}
          title="تصميم"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50"
        >
          <Type className="h-5 w-5" />
        </ActionButton>

        <ActionButton
          onClick={() => setShowRowStylingModal(true)}
          title="عناصر"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50"
        >
          <Layers className="h-5 w-5" />
        </ActionButton>

        <ActionButton
          onClick={() => setShowPageBackgroundModal(true)}
          title="خلفية"
          className="text-orange-600 hover:text-orange-700 hover:bg-orange-100/50"
        >
          <Image className="h-5 w-5" />
        </ActionButton>

        <ActionButton
          onClick={() => setShowTemplateSwitcherModal(true)}
          title="قالب"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
        >
          <LayoutTemplate className="h-5 w-5" />
        </ActionButton>

        <ActionButton
          onClick={handleLoadDummyData}
          disabled={isLoadingDummy}
          title="إضافة بيانات تجريبية"
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-200/50 disabled:opacity-50"
        >
          {isLoadingDummy ? (
            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </ActionButton>
      </div>
    </div>
  )
}

// Keep the old FloatingControls for backward compatibility, but export the new one
export const FloatingControls = QuickActionsBar
export const StickyControlBar = QuickActionsBar // for any other places that might use it