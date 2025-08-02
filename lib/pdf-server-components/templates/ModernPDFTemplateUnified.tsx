import React from 'react'
import { UnifiedTemplateBase, UnifiedTemplateProps } from '@/components/shared/unified-template-base'
import { SharedFontSettings } from '@/components/shared/menu-components'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  address?: string | null
  phone?: string | null
  website?: string | null
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  } | null
  currency?: string
}

interface ModernPDFTemplateUnifiedProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: {
    fontSettings?: SharedFontSettings
    pageBackgroundSettings?: any
    rowStyles?: any
  }
}

/**
 * Unified Modern PDF Template Component
 * Uses the same shared components as the preview for perfect consistency
 * This ensures that the PDF output matches exactly what users see in the preview
 */
export function ModernPDFTemplateUnified({
  restaurant,
  categories,
  language = 'ar',
  customizations = {},
}: ModernPDFTemplateUnifiedProps) {
  // Convert props to unified template format
  const unifiedProps: UnifiedTemplateProps = {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      category: restaurant.category,
      logo_url: restaurant.logo_url,
      address: restaurant.address,
      phone: restaurant.phone,
      website: restaurant.website,
      color_palette: restaurant.color_palette,
      currency: restaurant.currency,
    },
    categories: categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      menu_items: category.menu_items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        is_available: item.is_available,
        is_featured: item.is_featured,
        dietary_info: item.dietary_info,
      })),
    })),
    language,
    fontSettings: customizations.fontSettings || {
      arabic: { font: 'Cairo', weight: 'normal' },
      english: { font: 'Roboto', weight: 'normal' },
    },
    customizations: {
      pageBackgroundSettings: customizations.pageBackgroundSettings,
      rowStyles: customizations.rowStyles,
    },
    isPdfGeneration: true,
    isPreview: false,
    showFooter: true,
    showImages: true,
  }

  return <UnifiedTemplateBase {...unifiedProps} />
}

export default ModernPDFTemplateUnified
