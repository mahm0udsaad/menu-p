import path from 'path'
import fs from 'fs'

// Static import map for template preview components. Using explicit
// dynamic imports ensures that Next.js bundles the components during the
// build so they can be resolved at runtime. The keys correspond to
// template IDs defined in `pdf-templates-metadata.json`.
const templateImporters: Record<string, () => Promise<any>> = {
  'borcelle-coffee': () => import('@/components/templates/borcelle-coffee-preview'),
  'botanical-cafe': () => import('@/components/templates/botanical-cafe-preview'),
  'chalkboard-coffee': () => import('@/components/templates/chalkboard-coffee-preview'),
  'cocktail-menu': () => import('@/lib/pdf-server-components/templates/CocktailMenuPDFTemplate'),
  'elegant-cocktail': () => import('@/components/templates/elegant-cocktail-menu-preview'),
  'fast-food': () => import('@/components/templates/fast-food-menu-preview'),
  'interactive-menu': () => import('@/components/templates/interactive-menu-preview'),
  'luxury-menu': () => import('@/components/templates/luxury-menu-preview'),
  'modern-coffee': () => import('@/components/templates/modern-coffee-preview'),
  'simple-coffee': () => import('@/components/templates/simple-coffee-preview'),
  'sweet-treats': () => import('@/components/templates/sweet-treats-menu-preview'),
  'vintage-bakery': () => import('@/components/templates/vintage-bakery-preview'),
  'vintage-coffee': () => import('@/components/templates/vintage-coffee-preview'),
}

export interface TemplateMetadata {
  id: string
  name: string
  description: string
  componentPath: string
  previewComponentPath: string
  category: string
  features: string[]
  defaultSettings: {
    fontSettings: {
      arabic: { font: string; weight: string }
      english: { font: string; weight: string }
    }
    colorPalette: {
      primary: string
      secondary: string
      accent: string
    }
  }
}

export interface TemplateCategory {
  name: string
  description: string
}

export interface TemplateRegistry {
  templates: Record<string, TemplateMetadata>
  categories: Record<string, TemplateCategory>
  defaultTemplate: string
  version: string
}

/**
 * Template Registry Service
 * Manages dynamic template loading and metadata
 */
export class TemplateRegistryService {
  private static instance: TemplateRegistryService
  private registry: TemplateRegistry | null = null
  private templateCache = new Map<string, any>()

  private constructor() {}

  static getInstance(): TemplateRegistryService {
    if (!TemplateRegistryService.instance) {
      TemplateRegistryService.instance = new TemplateRegistryService()
    }
    return TemplateRegistryService.instance
  }

  /**
   * Load template registry from metadata file
   */
  async loadRegistry(): Promise<TemplateRegistry> {
    if (this.registry) {
      return this.registry
    }

    try {
      const metadataPath = path.join(process.cwd(), 'data', 'pdf-templates-metadata.json')
      const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
      this.registry = JSON.parse(metadataContent) as TemplateRegistry
      
      console.log(`📋 Loaded template registry with ${Object.keys(this.registry.templates).length} templates`)
      return this.registry
    } catch (error) {
      console.error('❌ Error loading template registry:', error)
      throw new Error('Failed to load template registry')
    }
  }

  /**
   * Get all available templates
   */
  async getAllTemplates(): Promise<TemplateMetadata[]> {
    const registry = await this.loadRegistry()
    return Object.values(registry.templates)
  }

  /**
   * Get template metadata by ID
   */
  async getTemplateMetadata(templateId: string): Promise<TemplateMetadata | null> {
    const registry = await this.loadRegistry()
    return registry.templates[templateId] || null
  }

  /**
   * Get all template categories
   */
  async getCategories(): Promise<TemplateCategory[]> {
    const registry = await this.loadRegistry()
    return Object.values(registry.categories)
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<TemplateMetadata[]> {
    const templates = await this.getAllTemplates()
    return templates.filter(template => template.category === category)
  }

  /**
   * Dynamically load a template component
   */
  async loadTemplateComponent(templateId: string): Promise<any> {
    // Check cache first
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId)
    }

    const metadata = await this.getTemplateMetadata(templateId)
    if (!metadata) {
      throw new Error(`Template not found in registry: ${templateId}`)
    }

    try {
      const importer = templateImporters[templateId]
      if (!importer) {
        throw new Error(`Template component not registered: ${templateId}`)
      }

      const component = await importer()

      // Look for named export first, then default export
      let TemplateComponent = component.default

      if (!TemplateComponent) {
        // Convert kebab-case to PascalCase (e.g., cocktail-menu -> CocktailMenu)
        const componentName = templateId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('') + 'Preview'

        TemplateComponent = component[componentName]
      }

      if (!TemplateComponent) {
        throw new Error(`No suitable component export found for ${templateId}`)
      }

      // Cache the component
      this.templateCache.set(templateId, TemplateComponent)

      console.log(`📦 Loaded template component: ${templateId}`)
      return TemplateComponent
    } catch (error) {
      console.error(`❌ Error loading template component ${templateId}:`, error)
      throw new Error(`Failed to load template component: ${templateId}`)
    }
  }

  /**
   * Dynamically load a preview component
   */
  async loadPreviewComponent(templateId: string): Promise<any> {
    const metadata = await this.getTemplateMetadata(templateId)
    if (!metadata) {
      throw new Error(`Template not found: ${templateId}`)
    }

    try {
      // Dynamic import of the preview component
      const previewPath = path.join(process.cwd(), 'lib', metadata.previewComponentPath)
      const component = await import(previewPath)
      
      console.log(`📦 Loaded preview component: ${templateId}`)
      return component.default || component
    } catch (error) {
      console.error(`❌ Error loading preview component ${templateId}:`, error)
      // Return null if preview component doesn't exist (fallback to default)
      return null
    }
  }

  /**
   * Validate if a template ID exists
   */
  async isValidTemplateId(templateId: string): Promise<boolean> {
    const metadata = await this.getTemplateMetadata(templateId)
    return !!metadata
  }

  /**
   * Get default template ID
   */
  async getDefaultTemplateId(): Promise<string> {
    const registry = await this.loadRegistry()
    return registry.defaultTemplate
  }

  /**
   * Normalize template ID - now throws error instead of falling back to default
   */
  async normalizeTemplateId(templateId?: string): Promise<string> {
    if (!templateId) {
      throw new Error('Template ID is required')
    }

    const isValid = await this.isValidTemplateId(templateId)
    if (!isValid) {
      throw new Error(`Invalid template ID: ${templateId}. Template not found in registry.`)
    }

    return templateId
  }

  /**
   * Get template features
   */
  async getTemplateFeatures(templateId: string): Promise<string[]> {
    const metadata = await this.getTemplateMetadata(templateId)
    return metadata?.features || []
  }

  /**
   * Get default settings for a template
   */
  async getTemplateDefaultSettings(templateId: string): Promise<any> {
    const metadata = await this.getTemplateMetadata(templateId)
    return metadata?.defaultSettings || {}
  }

  /**
   * Clear template cache (useful for development)
   */
  clearCache(): void {
    this.templateCache.clear()
    console.log('🧹 Template cache cleared')
  }

  /**
   * Reload registry (useful for development)
   */
  async reloadRegistry(): Promise<TemplateRegistry> {
    this.registry = null
    this.templateCache.clear()
    return await this.loadRegistry()
  }
}

// Export singleton instance
export const templateRegistry = TemplateRegistryService.getInstance() 