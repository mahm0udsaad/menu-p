"use client"

import { useMemo } from 'react'

interface SimpleTemplatePreviewProps {
  templateId: string
  templateName: string
  templateDescription: string
  restaurant: any
  categories: any[]
}

const templateStyles: Record<string, { 
  bgColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  pattern?: string
}> = {
  'classic': { bgColor: '#ffffff', textColor: '#1f2937', accentColor: '#f59e0b', fontFamily: 'Cairo' },
  'cafe': { bgColor: '#fef7ed', textColor: '#065f46', accentColor: '#f59e0b', fontFamily: 'Cairo' },
  'modern': { bgColor: '#1f2937', textColor: '#ffffff', accentColor: '#3b82f6', fontFamily: 'Cairo' },
  'modern-coffee': { bgColor: '#fff7ed', textColor: '#f97316', accentColor: '#fbbf24', fontFamily: 'Cairo' },
  'painting': { bgColor: '#fef3c7', textColor: '#8b4513', accentColor: '#d4af37', fontFamily: 'Amiri' },
  'vintage': { bgColor: '#f5f5dc', textColor: '#8b4513', accentColor: '#deb887', fontFamily: 'Georgia' },
  'fast-food': { bgColor: '#fee2e2', textColor: '#991b1b', accentColor: '#fbbf24', fontFamily: 'Cairo' },
  'elegant-cocktail': { bgColor: '#2d1810', textColor: '#f5f5dc', accentColor: '#daa520', fontFamily: 'Playfair Display' },
  'sweet-treats': { bgColor: '#fdf2f8', textColor: '#be185d', accentColor: '#fbbf24', fontFamily: 'Dancing Script' },
  'simple-coffee': { bgColor: '#fef7ed', textColor: '#8b4513', accentColor: '#deb887', fontFamily: 'Cairo' },
  'borcelle-coffee': { bgColor: '#2f4f4f', textColor: '#ffffff', accentColor: '#daa520', fontFamily: 'Playfair Display' },
  'luxury-menu': { bgColor: '#000000', textColor: '#ffffff', accentColor: '#ffd700', fontFamily: 'Playfair Display' },
  'chalkboard-coffee': { bgColor: '#2f2f2f', textColor: '#ffffff', accentColor: '#ffffff', fontFamily: 'Chalkboard' },
  'botanical-cafe': { bgColor: '#f0f8f0', textColor: '#228b22', accentColor: '#90ee90', fontFamily: 'Georgia' },
  'cocktail-menu': { bgColor: '#1e3a8a', textColor: '#ffffff', accentColor: '#f59e0b', fontFamily: 'Roboto' },
  'vintage-bakery': { bgColor: '#f5f5dc', textColor: '#8b4513', accentColor: '#deb887', fontFamily: 'Georgia' },
  'vintage-coffee': { bgColor: '#f5f5dc', textColor: '#8b4513', accentColor: '#deb887', fontFamily: 'Georgia' },
  'interactive-menu': { bgColor: '#eff6ff', textColor: '#1e40af', accentColor: '#10b981', fontFamily: 'Roboto' },
}

export default function SimpleTemplatePreview({
  templateId,
  templateName,
  templateDescription,
  restaurant,
  categories
}: SimpleTemplatePreviewProps) {
  const style = useMemo(() => {
    return templateStyles[templateId] || templateStyles['classic']
  }, [templateId])

  const sampleItems = useMemo(() => {
    return categories.slice(0, 3).map(cat => ({
      name: cat.name,
      items: cat.menu_items.slice(0, 2)
    }))
  }, [categories])

  return (
    <div 
      className="w-full h-full flex flex-col no-capture"
      style={{
        backgroundColor: style.bgColor,
        fontFamily: style.fontFamily,
        color: style.textColor,
        minHeight: '100%',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: style.accentColor }}>
        <h1 className="text-2xl font-bold text-center mb-2">{restaurant.name}</h1>
        <p className="text-center text-sm opacity-80">{templateName}</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {sampleItems.map((category, index) => (
          <div key={index} className="space-y-2">
            <h2 
              className="text-lg font-semibold border-b pb-1"
              style={{ borderColor: style.accentColor }}
            >
              {category.name}
            </h2>
            <div className="space-y-1">
              {category.items.map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs opacity-70 mt-1">{item.description}</p>
                    )}
                  </div>
                  <span 
                    className="font-bold text-sm ml-2"
                    style={{ color: style.accentColor }}
                  >
                    {item.price} ج.م
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div 
        className="p-3 text-center text-xs opacity-60"
        style={{ borderTopColor: style.accentColor, borderTopWidth: '1px', borderTopStyle: 'solid' }}
      >
        {templateDescription}
      </div>
    </div>
  )
} 