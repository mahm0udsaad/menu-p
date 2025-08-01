import React from 'react'
import { templateRegistry, TemplateMetadata } from './template-registry'
import { MenuEditorProvider } from '@/contexts/menu-editor-context'

// Global flag to indicate PDF generation mode
let isPDFGenerationMode = false

export const setPDFGenerationMode = (value: boolean) => {
  isPDFGenerationMode = value
  // Also set on global object for templates to access
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).isPDFGenerationMode = value
  }
}

export const getPDFGenerationMode = (): boolean => {
  return isPDFGenerationMode || (typeof globalThis !== 'undefined' && (globalThis as any).isPDFGenerationMode)
}

/**
 * React hook for templates to check if they're in PDF generation mode
 * Templates can use this to conditionally hide interactive elements
 */
export const usePDFGenerationMode = (): boolean => {
  const [pdfMode, setPdfMode] = React.useState(getPDFGenerationMode())

  React.useEffect(() => {
    const checkMode = () => setPdfMode(getPDFGenerationMode())
    checkMode()
    
    // Check again in case the mode changes during render
    const interval = setInterval(checkMode, 100)
    return () => clearInterval(interval)
  }, [])

  return pdfMode
}

export type TemplateId = string // Now supports any string ID

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
 * Enhanced Factory for creating PDF template components
 * Now supports dynamic template loading and infinite scalability
 */
export class PDFTemplateFactory {
  
  /**
   * Creates a PDF template component based on template ID
   * Uses simple global flag approach for PDF generation mode
   */
  static async createTemplate(
    templateId: TemplateId,
    props: PDFTemplateProps
  ): Promise<React.ReactElement> {
    try {
      // Set PDF generation mode
      setPDFGenerationMode(true)
      
      // Normalize template ID
      const normalizedId = await templateRegistry.normalizeTemplateId(templateId)
      
      // Load template component dynamically  
      const TemplateComponent = await templateRegistry.loadTemplateComponent(normalizedId)
      
      // Create the template element with a wrapper that provides context data
      const templateElement = React.createElement(
        PDFTemplateContextProvider,
        {
          restaurant: props.restaurant,
          categories: props.categories,
          language: props.language,
          customizations: props.customizations,
          children: React.createElement(TemplateComponent)
        }
      )
      
      return templateElement
    } catch (error) {
      console.error(`❌ Error creating template ${templateId}:`, error)
      throw new Error(`Failed to create template: ${templateId}`)
    } finally {
      // Reset PDF generation mode after template creation
      setPDFGenerationMode(false)
    }
  }

  /**
   * Gets template configuration by ID
   */
  static async getTemplateConfig(templateId: TemplateId): Promise<TemplateMetadata | null> {
    return await templateRegistry.getTemplateMetadata(templateId)
  }

  /**
   * Gets all available templates
   */
  static async getAllTemplates(): Promise<TemplateMetadata[]> {
    return await templateRegistry.getAllTemplates()
  }

  /**
   * Gets templates by category
   */
  static async getTemplatesByCategory(category: string): Promise<TemplateMetadata[]> {
    return await templateRegistry.getTemplatesByCategory(category)
  }

  /**
   * Gets all template categories
   */
  static async getCategories(): Promise<any[]> {
    return await templateRegistry.getCategories()
  }

  /**
   * Validates if a template ID is supported
   */
  static async isValidTemplateId(templateId: string): Promise<boolean> {
    return await templateRegistry.isValidTemplateId(templateId)
  }

  /**
   * Gets template ID with fallback to default
   */
  static async normalizeTemplateId(templateId?: string): Promise<string> {
    return await templateRegistry.normalizeTemplateId(templateId)
  }

  /**
   * Gets template features
   */
  static async getTemplateFeatures(templateId: string): Promise<string[]> {
    return await templateRegistry.getTemplateFeatures(templateId)
  }

  /**
   * Gets default settings for a template
   */
  static async getTemplateDefaultSettings(templateId: string): Promise<any> {
    return await templateRegistry.getTemplateDefaultSettings(templateId)
  }

  /**
   * Loads a preview component for a template
   */
  static async loadPreviewComponent(templateId: string): Promise<any> {
    return await templateRegistry.loadPreviewComponent(templateId)
  }

  /**
   * Clears the template cache (useful for development)
   */
  static clearCache(): void {
    templateRegistry.clearCache()
  }

  /**
   * Reloads the template registry (useful for development)
   */
  static async reloadRegistry(): Promise<any> {
    return await templateRegistry.reloadRegistry()
  }
}

/**
 * React component wrapper for dynamic template rendering
 * Now supports async template loading
 */
export const DynamicPDFTemplate: React.FC<{
  templateId: TemplateId
  loadingComponent?: React.ReactElement
} & PDFTemplateProps> = ({ templateId, loadingComponent, ...props }) => {
  const [TemplateComponent, setTemplateComponent] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    const loadTemplate = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const Component = await templateRegistry.loadTemplateComponent(templateId)
        
        if (mounted) {
          setTemplateComponent(() => Component)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load template')
          setLoading(false)
        }
      }
    }

    loadTemplate()

    return () => {
      mounted = false
    }
  }, [templateId])

  if (loading) {
    return loadingComponent || <div>Loading template...</div>
  }

  if (error) {
    return <div>Error loading template: {error}</div>
  }

  if (!TemplateComponent) {
    return <div>Template not found</div>
  }

  return React.createElement(TemplateComponent, props)
}

/**
 * PDF Context provider that wraps templates with MenuEditorProvider
 * This ensures templates get all the context data they need
 */
const PDFTemplateContextProvider: React.FC<{
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  children: React.ReactNode
}> = ({ restaurant, categories, language, customizations, children }) => {
  // Create a proper MenuEditorProvider with the PDF data
  const contextRestaurant = {
    ...restaurant,
    // Ensure color_palette has the right structure for context
    color_palette: restaurant.color_palette ? {
      id: 'pdf-palette',
      name: 'PDF Palette',
      ...restaurant.color_palette
    } : null,
    // Ensure address/phone/website are properly typed
    address: restaurant.address || undefined,
    phone: restaurant.phone || undefined,
    website: restaurant.website || undefined,
  }

  return React.createElement(
    MenuEditorProvider,
    {
      restaurant: contextRestaurant as any, // Type cast to avoid complex type issues
      initialCategories: categories,
      onRefresh: () => {}, // No-op for PDF generation
      children: React.createElement('div', { 
        'data-pdf-mode': 'true',
        style: { 
          width: '100%', 
          height: '100%' 
        }
      }, children)
    }
  )
}

export default PDFTemplateFactory 