"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Type,
  Layers,
  Image,
  Plus,
  LayoutTemplate,
  Palette,
  FileUp,
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
          'h-11 w-11 rounded-full flex items-center justify-center',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-label={title}
      >
        {icon}
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[#2f2923] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 pointer-events-none group-hover:opacity-100">
        {title}
        <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2f2923]" />
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
  const router = useRouter()

  const controls = [
    {
      id: 'import',
      title: 'استيراد من ملف',
      icon: <FileUp className="h-5 w-5" />,
      onClick: () => router.push('/dashboard/import'),
      className: 'text-[#b03a2e] hover:text-[#962f26] hover:bg-[#fff3f1]',
    },
    {
      id: 'design',
      title: 'إعدادات الخط',
      icon: <Type className="h-5 w-5" />,
      onClick: () => setShowDesignModal(true),
      className: 'text-[#2f8f5b] hover:text-[#26784c] hover:bg-[#eef9f2]',
    },
    {
      id: 'styling',
      title: 'تصميم العناصر',
      icon: <Layers className="h-5 w-5" />,
      onClick: () => setShowRowStylingModal(true),
      className: 'text-[#365f7d] hover:text-[#294962] hover:bg-[#eef5fa]',
    },
    {
      id: 'background',
      title: 'خلفية الصفحة',
      icon: <Image className="h-5 w-5" />,
      onClick: () => setShowPageBackgroundModal(true),
      className: 'text-[#a8763a] hover:text-[#805926] hover:bg-[#f7efe3]',
    },
    {
      id: 'template',
      title: 'تغيير القالب',
      icon: <LayoutTemplate className="h-5 w-5" />,
      onClick: () => setShowTemplateSwitcherModal(true),
      className: 'text-[#5b4a8b] hover:text-[#44366d] hover:bg-[#f1eef8]',
    },
    {
      id: 'colors',
      title: 'لوحة الألوان',
      icon: <Palette className="h-5 w-5" />,
      onClick: () => setShowColorModal(true),
      className: 'text-[#8b3f58] hover:text-[#6e3045] hover:bg-[#faeef2]',
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
      className: 'text-[#6f6257] hover:text-[#2f2923] hover:bg-[#f4eee7]',
    },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center justify-center gap-1 rounded-full border border-[#e8ded2] bg-white/95 p-2 shadow-lg backdrop-blur-xl">
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
