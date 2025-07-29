/**
 * Client-side Template Registry Service
 * Manages dynamic template loading for browser environments
 */

export interface ClientTemplateMetadata {
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

export interface ClientTemplateRegistry {
  templates: Record<string, ClientTemplateMetadata>
  categories: Record<string, { name: string; description: string }>
  defaultTemplate: string
  version: string
}

/**
 * Client-side Template Registry Service
 * Manages dynamic template loading and metadata for browser environments
 */
export class ClientTemplateRegistryService {
  private static instance: ClientTemplateRegistryService
  private registry: ClientTemplateRegistry | null = null
  private templateCache = new Map<string, any>()

  private constructor() {}

  static getInstance(): ClientTemplateRegistryService {
    if (!ClientTemplateRegistryService.instance) {
      ClientTemplateRegistryService.instance = new ClientTemplateRegistryService()
    }
    return ClientTemplateRegistryService.instance
  }

  /**
   * Load template registry from metadata
   */
  async loadRegistry(): Promise<ClientTemplateRegistry> {
    if (this.registry) {
      return this.registry
    }

    try {
      const response = await fetch('/api/templates/metadata')
      if (!response.ok) {
        throw new Error('Failed to fetch template metadata')
      }
      
      this.registry = await response.json() as ClientTemplateRegistry
      console.log(`📋 Loaded client template registry with ${Object.keys(this.registry.templates).length} templates`)
      return this.registry
    } catch (error) {
      console.error('❌ Error loading client template registry:', error)
      throw new Error('Failed to load template registry')
    }
  }

  /**
   * Get all available templates
   */
  async getAllTemplates(): Promise<ClientTemplateMetadata[]> {
    const registry = await this.loadRegistry()
    return Object.values(registry.templates)
  }

  /**
   * Get template metadata by ID
   */
  async getTemplateMetadata(templateId: string): Promise<ClientTemplateMetadata | null> {
    const registry = await this.loadRegistry()
    return registry.templates[templateId] || null
  }

  /**
   * Get all template categories
   */
  async getCategories(): Promise<{ name: string; description: string }[]> {
    const registry = await this.loadRegistry()
    return Object.values(registry.categories)
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<ClientTemplateMetadata[]> {
    const templates = await this.getAllTemplates()
    return templates.filter(template => template.category === category)
  }

  /**
   * Dynamically load a template component for client-side use
   */
  async loadTemplateComponent(templateId: string): Promise<any> {
    // Check cache first
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId)
    }

    const metadata = await this.getTemplateMetadata(templateId)
    if (!metadata) {
      throw new Error(`Template not found: ${templateId}`)
    }

    try {
      // Map server-side component paths to client-side component names
      const clientComponentName = this.mapToClientComponent(metadata.componentPath)
      const component = await import(`@/components/pdf-templates/${clientComponentName}`)
      
      // Cache the component
      this.templateCache.set(templateId, component.default || component)
      
      console.log(`📦 Loaded client template component: ${templateId} -> ${clientComponentName}`)
      return component.default || component
    } catch (error) {
      console.error(`❌ Error loading client template component ${templateId}:`, error)
      throw new Error(`Failed to load template component: ${templateId}`)
    }
  }

  /**
   * Map server-side component paths to client-side component names
   */
  private mapToClientComponent(componentPath: string): string {
    // Extract component name from path like "./templates/ModernPDFTemplate"
    const parts = componentPath.split('/')
    const serverComponentName = parts[parts.length - 1]
    
    // Map server component names to client component names
    const componentMapping: Record<string, string> = {
      'ModernPDFTemplate': 'ModernTemplate',
      'ModernPDFTemplateUnified': 'ModernTemplate',
      'PaintingStylePDFTemplate': 'PaintingTemplate',
      'VintagePDFTemplate': 'VintageTemplate',
      'ModernCoffeePDFTemplate': 'ModernCoffeeTemplate',
      'ModernCoffeePDFTemplateUnified': 'ModernCoffeeTemplate',
      'CafePDFTemplate': 'CafeTemplate',
      'FastFoodPDFTemplate': 'FastFoodTemplate',
      'ElegantCocktailPDFTemplate': 'ElegantCocktailTemplate',
      'SweetTreatsPDFTemplate': 'SweetTreatsTemplate',
      'SimpleCoffeePDFTemplate': 'SimpleCoffeeTemplate',
      'BorcelleCoffeePDFTemplate': 'BorcelleCoffeeTemplate',
      'LuxuryMenuPDFTemplate': 'LuxuryMenuTemplate',
      'ChalkboardCoffeePDFTemplate': 'ChalkboardCoffeeTemplate',
      'BotanicalCafePDFTemplate': 'BotanicalCafeTemplate',
      'CocktailMenuPDFTemplate': 'CocktailMenuTemplate',
      'VintageBakeryPDFTemplate': 'VintageBakeryTemplate',
      'VintageCoffeePDFTemplate': 'VintageCoffeeTemplate',
      'InteractiveMenuPDFTemplate': 'InteractiveMenuTemplate',
    }
    
    return componentMapping[serverComponentName] || 'CafeTemplate'
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
   * Normalize template ID with fallback to default
   */
  async normalizeTemplateId(templateId?: string): Promise<string> {
    if (!templateId) {
      return await this.getDefaultTemplateId()
    }

    const isValid = await this.isValidTemplateId(templateId)
    if (!isValid) {
      console.warn(`⚠️ Unknown template ID: ${templateId}, falling back to default`)
      return await this.getDefaultTemplateId()
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
   * Get template default settings
   */
  async getTemplateDefaultSettings(templateId: string): Promise<any> {
    const metadata = await this.getTemplateMetadata(templateId)
    return metadata?.defaultSettings || null
  }

  /**
   * Clear component cache
   */
  clearCache(): void {
    this.templateCache.clear()
    console.log('🧹 Cleared client template cache')
  }

  /**
   * Reload registry (useful for development)
   */
  async reloadRegistry(): Promise<ClientTemplateRegistry> {
    this.registry = null
    this.clearCache()
    return await this.loadRegistry()
  }
}

// Export singleton instance
export const clientTemplateRegistry = ClientTemplateRegistryService.getInstance() 