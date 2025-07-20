import React from 'react'
import { templateRegistry, TemplateMetadata } from './template-registry'

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
   * Now uses dynamic imports for truly scalable template management
   */
  static async createTemplate(
    templateId: TemplateId,
    props: PDFTemplateProps
  ): Promise<React.ReactElement> {
    try {
      // Normalize template ID
      const normalizedId = await templateRegistry.normalizeTemplateId(templateId)
      
      // Load template component dynamically
      const TemplateComponent = await templateRegistry.loadTemplateComponent(normalizedId)
      
      // Create React element
      return React.createElement(TemplateComponent, props)
    } catch (error) {
      console.error(`❌ Error creating template ${templateId}:`, error)
      
      // Fallback to default template
      try {
        const defaultId = await templateRegistry.getDefaultTemplateId()
        const DefaultComponent = await templateRegistry.loadTemplateComponent(defaultId)
        return React.createElement(DefaultComponent, props)
      } catch (fallbackError) {
        console.error('❌ Fallback template also failed:', fallbackError)
        throw new Error(`Failed to create template: ${templateId}`)
      }
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

export default PDFTemplateFactory 