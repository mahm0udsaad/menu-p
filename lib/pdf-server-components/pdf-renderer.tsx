import HTMLTemplateGenerator from './html-template-generator'
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
 */
export class PDFReactRenderer {
  
  /**
   * Renders a PDF template to HTML string for PDF generation
   * Uses direct HTML generation for compatibility with Next.js App Router
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

      const htmlString = HTMLTemplateGenerator.generateTemplate(options.templateId, templateProps)
      
      console.log(`✅ PDF template '${options.templateId}' rendered successfully`)
      return htmlString
    } catch (error) {
      console.error(`❌ Error rendering PDF template '${options.templateId}':`, error)
      throw new Error(`Failed to render PDF template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 