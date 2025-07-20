"use client"

import { useEffect, useState } from 'react'
import ProfessionalCafeMenuPreview from "./editor/professional-cafe-menu-preview"
import ModernPreview from "./editor/templates/modern/ModernPreview"
import ModernCoffeePreview from "./editor/templates/modern-coffee/ModernCoffeePreview"
import PaintingStylePreview from "./editor/templates/painting-style/PaintingStylePreview"
import VintagePreview from "./editor/templates/vintage/VintagePreview"

interface TemplatePreviewRendererProps {
  templateId: string
  restaurant: any
  categories: any[]
  onRefresh?: () => void
}

const templateComponents: Record<string, React.ComponentType<any>> = {
  'classic': ProfessionalCafeMenuPreview,
  'cafe': ProfessionalCafeMenuPreview,
  'modern': ModernPreview,
  'modern-coffee': ModernCoffeePreview,
  'painting': PaintingStylePreview,
  'vintage': VintagePreview,
  'fast-food': ProfessionalCafeMenuPreview,
  'elegant-cocktail': ProfessionalCafeMenuPreview,
  'sweet-treats': ProfessionalCafeMenuPreview,
  'simple-coffee': ProfessionalCafeMenuPreview,
  'borcelle-coffee': ProfessionalCafeMenuPreview,
  'luxury-menu': ProfessionalCafeMenuPreview,
  'chalkboard-coffee': ProfessionalCafeMenuPreview,
  'botanical-cafe': ProfessionalCafeMenuPreview,
  'cocktail-menu': ProfessionalCafeMenuPreview,
  'vintage-bakery': ProfessionalCafeMenuPreview,
  'vintage-coffee': ProfessionalCafeMenuPreview,
  'interactive-menu': ProfessionalCafeMenuPreview,
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
    const component = templateComponents[templateId]
    if (component) {
      setComponent(() => component)
      setError(null)
    } else {
      setError(`Template component not found for: ${templateId}`)
      // Fallback to default component
      setComponent(() => ProfessionalCafeMenuPreview)
    }
  }, [templateId])

  if (error) {
    console.warn(error)
  }

  if (!Component) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="text-lg font-bold mb-2">Loading template...</div>
        </div>
      </div>
    )
  }

  return (
    <Component
      restaurant={restaurant}
      categories={categories}
      onRefresh={onRefresh}
    />
  )
} 