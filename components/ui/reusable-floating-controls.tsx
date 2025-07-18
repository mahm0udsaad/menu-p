"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Type, 
  Layers, 
  Image, 
  Plus, 
  LayoutTemplate, 
  Palette,
  Settings 
} from 'lucide-react'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import { cn } from '@/lib/utils'

interface FloatingControlButtonProps {
  onClick: () => void
  title: string
  icon: React.ReactNode
  className?: string
  disabled?: boolean
}

const FloatingControlButton: React.FC<FloatingControlButtonProps> = ({
  onClick,
  title,
  icon,
  className = '',
  disabled = false,
}) => {
  return (
    <div className="relative group">
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="ghost"
        size="sm"
        className={cn(
          'rounded-full w-12 h-12 flex items-center justify-center',
          'transition-all duration-200',
          'hover:scale-110 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-label={title}
      >
        {icon}
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {title}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  )
}

export const ReusableFloatingControls: React.FC = () => {
  const {
    setShowDesignModal,
    setShowRowStylingModal,
    setShowPageBackgroundModal,
    setShowTemplateSwitcherModal,
    setShowColorModal,
    handleLoadDummyData,
    isLoadingDummy,
  } = useMenuEditor()

  const controls = [
    {
      id: 'design',
      title: 'إعدادات الخط',
      icon: <Type className="h-5 w-5" />,
      onClick: () => setShowDesignModal(true),
      className: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50',
    },
    {
      id: 'styling',
      title: 'تصميم العناصر',
      icon: <Layers className="h-5 w-5" />,
      onClick: () => setShowRowStylingModal(true),
      className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-100/50',
    },
    {
      id: 'background',
      title: 'خلفية الصفحة',
      icon: <Image className="h-5 w-5" />,
      onClick: () => setShowPageBackgroundModal(true),
      className: 'text-orange-600 hover:text-orange-700 hover:bg-orange-100/50',
    },
    {
      id: 'template',
      title: 'تغيير القالب',
      icon: <LayoutTemplate className="h-5 w-5" />,
      onClick: () => setShowTemplateSwitcherModal(true),
      className: 'text-purple-600 hover:text-purple-700 hover:bg-purple-100/50',
    },
    {
      id: 'colors',
      title: 'لوحة الألوان',
      icon: <Palette className="h-5 w-5" />,
      onClick: () => setShowColorModal(true),
      className: 'text-pink-600 hover:text-pink-700 hover:bg-pink-100/50',
    },
    {
      id: 'dummy-data',
      title: 'إضافة بيانات تجريبية',
      icon: isLoadingDummy ? (
        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Plus className="h-5 w-5" />
      ),
      onClick: handleLoadDummyData,
      disabled: isLoadingDummy,
      className: 'text-gray-600 hover:text-gray-700 hover:bg-gray-100/50',
    },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm p-3 rounded-full border border-gray-200/50 shadow-lg">
        {controls.map((control) => (
          <FloatingControlButton
            key={control.id}
            onClick={control.onClick}
            title={control.title}
            icon={control.icon}
            className={control.className}
            disabled={control.disabled}
          />
        ))}
      </div>
    </div>
  )
}

export default ReusableFloatingControls 