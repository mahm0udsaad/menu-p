import { HTMLTemplateGenerator } from './html-template-generator'
import { TemplateId, PDFTemplateProps } from './pdf-template-factory'

export interface PDFRenderOptions {
  templateId: TemplateId
  restaurant: any
  categories: any[]
  language?: string
  customizations?: {
    fontSettings?: any
    pageBackgroundSettings?: any
    rowStyles?: any
  }
  format?: 'A4' | 'Letter'
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
}

/**
 * PDF HTML renderer for PDF generation
 * Generates HTML content directly without React server rendering
 * Now supports dynamic template loading
 */
export class PDFReactRenderer {
  
  /**
   * Renders a PDF template to HTML string for PDF generation
   * Uses direct HTML generation for compatibility with Next.js App Router
   * Now supports dynamic template loading
   */
  static async renderTemplate(options: PDFRenderOptions): Promise<string> {
    try {
      console.log(`🎨 Rendering PDF template '${options.templateId}'`)
      
      const templateProps: PDFTemplateProps = {
        restaurant: options.restaurant,
        categories: options.categories,
        language: options.language || 'ar',
        customizations: options.customizations
      }

      // Use the HTML template generator which already supports all templates
      const htmlString = HTMLTemplateGenerator.generateTemplate(options.templateId, templateProps)
      
      console.log(`✅ PDF template '${options.templateId}' rendered successfully`)
      return htmlString
    } catch (error) {
      console.error(`❌ Error rendering PDF template '${options.templateId}':`, error)
      throw new Error(`Failed to render PDF template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Renders a PDF template using React Server Components
   * This method uses the new dynamic template loading system
   */
  static async renderTemplateWithReact(options: PDFRenderOptions): Promise<string> {
    try {
      console.log(`🎨 Rendering PDF template with React '${options.templateId}'`)
      
      const templateProps: PDFTemplateProps = {
        restaurant: options.restaurant,
        categories: options.categories,
        language: options.language || 'ar',
        customizations: options.customizations
      }

      // Import React Server Components renderer
      const { renderToString } = await import('react-dom/server')
      
      // Create template using the new async factory
      const { PDFTemplateFactory } = await import('./pdf-template-factory')
      const templateElement = await PDFTemplateFactory.createTemplate(options.templateId, templateProps)
      
      // Render to string
      const htmlString = renderToString(templateElement)
      
      console.log(`✅ PDF template with React '${options.templateId}' rendered successfully`)
      return htmlString
    } catch (error) {
      console.error(`❌ Error rendering PDF template with React '${options.templateId}':`, error)
      throw new Error(`Failed to render PDF template '${options.templateId}': ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 