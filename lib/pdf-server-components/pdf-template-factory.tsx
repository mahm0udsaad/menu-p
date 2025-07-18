import React from 'react'
import CafePDFTemplate from './templates/CafePDFTemplate'
import ModernPDFTemplate from './templates/ModernPDFTemplate'
import PaintingStylePDFTemplate from './templates/PaintingStylePDFTemplate'
import VintagePDFTemplate from './templates/VintagePDFTemplate'

export type TemplateId = 'classic' | 'cafe' | 'modern' | 'painting' | 'vintage'

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
  background_image_url?: string | null
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

export interface PDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: {
    fontSettings?: any
    pageBackgroundSettings?: any
    rowStyles?: any
  }
}

/**
 * Factory for creating PDF template components
 * Maps template IDs to their corresponding React components
 */
export class PDFTemplateFactory {
  
  /**
   * Available template configurations
   */
  static readonly TEMPLATES = {
    classic: {
      id: 'classic' as const,
      name: 'Classic Cafe',
      description: 'Traditional cafe menu style with clean layout',
      component: CafePDFTemplate
    },
    cafe: {
      id: 'cafe' as const,
      name: 'Cafe Style',
      description: 'Professional cafe menu with header, sections, and footer',
      component: CafePDFTemplate
    },
    modern: {
      id: 'modern' as const,
      name: 'Modern Style',
      description: 'Contemporary design with bold typography and clean lines',
      component: ModernPDFTemplate
    },
    painting: {
      id: 'painting' as const,
      name: 'Painting Style',
      description: 'Artistic template with golden accents and cream background',
      component: PaintingStylePDFTemplate
    },
    vintage: {
      id: 'vintage' as const,
      name: 'Vintage Style',
      description: 'Classic vintage design with serif fonts and elegant styling',
      component: VintagePDFTemplate
    }
  } as const

  /**
   * Creates a PDF template component based on template ID
   */
  static createTemplate(
    templateId: TemplateId,
    props: PDFTemplateProps
  ): React.ReactElement {
    const template = this.TEMPLATES[templateId]
    
    if (!template) {
      // Fallback to classic template if unknown ID
      console.warn(`Unknown template ID: ${templateId}, falling back to classic`)
      return React.createElement(CafePDFTemplate, props)
    }

    return React.createElement(template.component, props)
  }

  /**
   * Gets template configuration by ID
   */
  static getTemplateConfig(templateId: TemplateId) {
    return this.TEMPLATES[templateId] || this.TEMPLATES.classic
  }

  /**
   * Gets all available templates
   */
  static getAllTemplates() {
    return Object.values(this.TEMPLATES)
  }

  /**
   * Validates if a template ID is supported
   */
  static isValidTemplateId(templateId: string): templateId is TemplateId {
    return templateId in this.TEMPLATES
  }

  /**
   * Gets template ID with fallback to classic
   */
  static normalizeTemplateId(templateId?: string): TemplateId {
    if (!templateId || !this.isValidTemplateId(templateId)) {
      return 'classic'
    }
    return templateId
  }
}

/**
 * React component wrapper for dynamic template rendering
 */
export const DynamicPDFTemplate: React.FC<{
  templateId: TemplateId
} & PDFTemplateProps> = ({ templateId, ...props }) => {
  return PDFTemplateFactory.createTemplate(templateId, props)
}

export default PDFTemplateFactory 