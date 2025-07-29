"use client"

import { useEffect, useState } from 'react'
// Import client-side preview components instead of server-side PDF components
import ModernPreview from '@/components/editor/templates/modern/ModernPreview'
import ModernCoffeePreviewUnified from '@/components/editor/templates/modern-coffee/ModernCoffeePreviewUnified'
import VintagePreview from '@/components/editor/templates/vintage/VintagePreview'
import PaintingStylePreview from '@/components/editor/templates/painting-style/PaintingStylePreview'
import ModernPreviewUnified from '@/components/editor/templates/modern/ModernPreviewUnified'

interface TemplatePreviewRendererProps {
  templateId: string
  restaurant: any
  categories: any[]
  onRefresh?: () => void
}

// Create a simple wrapper component that provides data without context
const PreviewWrapper: React.FC<{
  Component: React.ComponentType<any>
  restaurant: any
  categories: any[]
}> = ({ Component, restaurant, categories }) => {
  // Create mock context data that the preview components expect
  const mockContextData = {
    categories: categories || [],
    restaurant: restaurant || {},
    pageBackgroundSettings: {
      backgroundType: 'solid',
      backgroundColor: '#ffffff'
    },
    fontSettings: {
      arabic: { font: 'Cairo', weight: 'normal' },
      english: { font: 'Roboto', weight: 'normal' }
    },
    rowStyleSettings: {
      itemColor: '#000000',
      backgroundColor: '#ffffff'
    },
    appliedRowStyles: {},
    currentLanguage: 'ar',
    moveItem: () => {},
    handleAddCategory: () => {}
  }

  // Create a simple component that renders the preview without context dependencies
  const SimplePreview = () => {
    return (
      <div className="min-h-[1123px] p-8 relative bg-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {restaurant?.name || 'Restaurant Name'}
          </h1>
          <p className="text-lg text-gray-700">
            {restaurant?.category || 'Restaurant Category'}
          </p>
        </div>
        
        <div className="space-y-8">
          {categories?.map((category: any, index: number) => (
            <div key={index} className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {category.name}
              </h2>
              <div className="space-y-4">
                {category.menu_items?.map((item: any, itemIndex: number) => (
                  <div key={itemIndex} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-900 ml-4">
                      {item.price ? `${item.price} ${restaurant?.currency || '$'}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <SimplePreview />
}

// Map template IDs to client-side preview components
const previewComponents: Record<string, React.ComponentType<any>> = {
  'classic': ModernPreview,
  'cafe': ModernPreview,
  'modern': ModernPreview,
  'modern-coffee': ModernCoffeePreviewUnified,
  'painting': PaintingStylePreview,
  'vintage': VintagePreview,
  'fast-food': ModernPreview,
  'elegant-cocktail': ModernPreview,
  'sweet-treats': ModernPreview,
  'simple-coffee': ModernCoffeePreviewUnified,
  'borcelle-coffee': ModernCoffeePreviewUnified,
  'luxury-menu': ModernPreview,
  'chalkboard-coffee': ModernPreview,
  'botanical-cafe': ModernPreview,
  'cocktail-menu': ModernPreview,
  'vintage-bakery': VintagePreview,
  'vintage-coffee': VintagePreview,
  'interactive-menu': ModernPreviewUnified,
}

export default function TemplatePreviewRenderer({
  templateId,
  restaurant,
  categories,
  onRefresh
}: TemplatePreviewRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const component = previewComponents[templateId]
    if (component) {
      setComponent(() => component)
      setError(null)
    } else {
      setError(`Preview component not found for: ${templateId}`)
      // Fallback to default component
      setComponent(() => ModernPreview)
    }
  }, [templateId])

  if (error) {
    console.warn(error)
  }

  if (!Component) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="text-lg font-bold mb-2">Loading preview template...</div>
          <div className="text-sm opacity-70">{templateId}</div>
        </div>
      </div>
    )
  }

  return (
    <PreviewWrapper
      Component={Component}
      restaurant={restaurant}
      categories={categories}
    />
  )
} 