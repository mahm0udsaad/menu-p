import React from 'react'
import { renderToString } from 'react-dom/server'
import { UnifiedTemplateBase, UnifiedTemplateProps } from '@/components/shared/unified-template-base'
import { SharedFontSettings } from '@/components/shared/menu-components'

export interface ConsistencyTestData {
  restaurant: {
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
  categories: Array<{
    id: string
    name: string
    description: string | null
    menu_items: Array<{
      id: string
      name: string
      description: string | null
      price: number | null
      image_url: string | null
      is_available: boolean
      is_featured: boolean
      dietary_info: string[]
    }>
  }>
  language?: string
  fontSettings: SharedFontSettings
  customizations?: {
    pageBackgroundSettings?: any
    rowStyles?: any
  }
}

export interface ConsistencyReport {
  isConsistent: boolean
  differences: string[]
  previewHtml: string
  pdfHtml: string
  warnings: string[]
}

/**
 * Consistency Validator
 * Ensures that preview and PDF templates render identically
 */
export class ConsistencyValidator {
  
  /**
   * Generate HTML for preview template
   */
  static generatePreviewHtml(testData: ConsistencyTestData): string {
    const previewProps: UnifiedTemplateProps = {
      ...testData,
      isPdfGeneration: false,
      isPreview: true,
      showFooter: true,
      showImages: true
    }

    const previewElement = React.createElement(UnifiedTemplateBase, previewProps)
    return renderToString(previewElement)
  }

  /**
   * Generate HTML for PDF template
   */
  static generatePdfHtml(testData: ConsistencyTestData): string {
    const pdfProps: UnifiedTemplateProps = {
      ...testData,
      isPdfGeneration: true,
      isPreview: false,
      showFooter: true,
      showImages: true
    }

    const pdfElement = React.createElement(UnifiedTemplateBase, pdfProps)
    return renderToString(pdfElement)
  }

  /**
   * Compare preview and PDF HTML for consistency
   */
  static validateConsistency(testData: ConsistencyTestData): ConsistencyReport {
    const previewHtml = this.generatePreviewHtml(testData)
    const pdfHtml = this.generatePdfHtml(testData)
    
    const differences: string[] = []
    const warnings: string[] = []

    // Normalize HTML for comparison
    const normalizeHtml = (html: string) => {
      return html
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim()
    }

    const normalizedPreview = normalizeHtml(previewHtml)
    const normalizedPdf = normalizeHtml(pdfHtml)

    // Check for exact match
    if (normalizedPreview !== normalizedPdf) {
      differences.push('HTML structure differs between preview and PDF')
      
      // Detailed comparison
      const previewLines = normalizedPreview.split('>')
      const pdfLines = normalizedPdf.split('>')
      
      const maxLines = Math.max(previewLines.length, pdfLines.length)
      
      for (let i = 0; i < maxLines; i++) {
        const previewLine = previewLines[i] || ''
        const pdfLine = pdfLines[i] || ''
        
        if (previewLine !== pdfLine) {
          differences.push(`Line ${i + 1}: Preview "${previewLine}" vs PDF "${pdfLine}"`)
        }
      }
    }

    // Check for specific consistency issues
    const checks = [
      {
        name: 'Font family consistency',
        preview: previewHtml.includes('font-family'),
        pdf: pdfHtml.includes('font-family')
      },
      {
        name: 'Background consistency',
        preview: previewHtml.includes('background'),
        pdf: pdfHtml.includes('background')
      },
      {
        name: 'Text content consistency',
        preview: previewHtml.includes(testData.restaurant.name),
        pdf: pdfHtml.includes(testData.restaurant.name)
      },
      {
        name: 'RTL/LTR direction consistency',
        preview: previewHtml.includes('dir='),
        pdf: pdfHtml.includes('dir=')
      }
    ]

    checks.forEach(check => {
      if (check.preview !== check.pdf) {
        warnings.push(`${check.name}: Preview (${check.preview}) vs PDF (${check.pdf})`)
      }
    })

    return {
      isConsistent: differences.length === 0,
      differences,
      previewHtml,
      pdfHtml,
      warnings
    }
  }

  /**
   * Generate test data for consistency validation
   */
  static generateTestData(): ConsistencyTestData {
    return {
      restaurant: {
        id: 'test-restaurant',
        name: 'Test Restaurant',
        category: 'Fine Dining',
        logo_url: null,
        address: '123 Test Street',
        phone: '+1-234-567-8900',
        website: 'www.testrestaurant.com',
        color_palette: {
          primary: '#065f46',
          secondary: '#6b7280',
          accent: '#f59e0b'
        },
        currency: 'ر.س'
      },
      categories: [
        {
          id: 'appetizers',
          name: 'Appetizers',
          description: 'Start your meal with our delicious appetizers',
          menu_items: [
            {
              id: 'item-1',
              name: 'Bruschetta',
              description: 'Toasted bread with tomatoes and herbs',
              price: 12.99,
              image_url: null,
              is_available: true,
              is_featured: true,
              dietary_info: ['Vegetarian']
            },
            {
              id: 'item-2',
              name: 'Calamari',
              description: 'Crispy fried squid with marinara sauce',
              price: 16.99,
              image_url: null,
              is_available: true,
              is_featured: false,
              dietary_info: ['Seafood']
            }
          ]
        },
        {
          id: 'main-courses',
          name: 'Main Courses',
          description: 'Our signature main dishes',
          menu_items: [
            {
              id: 'item-3',
              name: 'Grilled Salmon',
              description: 'Fresh Atlantic salmon with seasonal vegetables',
              price: 28.99,
              image_url: null,
              is_available: true,
              is_featured: true,
              dietary_info: ['Seafood', 'Gluten-Free']
            }
          ]
        }
      ],
      language: 'ar',
      fontSettings: {
        arabic: { font: 'Cairo', weight: 'normal' },
        english: { font: 'Roboto', weight: 'normal' }
      },
      customizations: {
        pageBackgroundSettings: {
          backgroundType: 'image',
          backgroundImage: '/assets/menu-bg.jpeg'
        }
      }
    }
  }

  /**
   * Run comprehensive consistency tests
   */
  static runComprehensiveTests(): ConsistencyReport[] {
    const testCases = [
      {
        name: 'Arabic language with default settings',
        data: this.generateTestData()
      },
      {
        name: 'English language with custom fonts',
        data: {
          ...this.generateTestData(),
          language: 'en',
          fontSettings: {
            arabic: { font: 'Amiri', weight: 'bold' },
            english: { font: 'Georgia', weight: 'normal' }
          }
        }
      },
      {
        name: 'Solid background color',
        data: {
          ...this.generateTestData(),
          customizations: {
            pageBackgroundSettings: {
              backgroundType: 'solid',
              backgroundColor: '#f0f0f0'
            }
          }
        }
      },
      {
        name: 'Gradient background',
        data: {
          ...this.generateTestData(),
          customizations: {
            pageBackgroundSettings: {
              backgroundType: 'gradient',
              gradientFrom: '#ffffff',
              gradientTo: '#f3f4f6',
              gradientDirection: 'to bottom'
            }
          }
        }
      }
    ]

    return testCases.map(testCase => {
      console.log(`🧪 Running consistency test: ${testCase.name}`)
      return this.validateConsistency(testCase.data)
    })
  }
} 