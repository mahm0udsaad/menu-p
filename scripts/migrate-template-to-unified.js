#!/usr/bin/env node

/**
 * Template Migration Utility
 * Helps migrate existing templates to use the unified component system
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function migrateTemplate() {
  console.log('🔄 Template Migration Utility')
  console.log('============================\n')

  try {
    // Get template details
    const templateId = await question('Template ID to migrate (e.g., "modern", "vintage"): ')
    const templateName = await question('Template Name (e.g., "Modern Style"): ')
    
    console.log('\nMigration options:')
    console.log('1. Create unified preview component')
    console.log('2. Create unified PDF component')
    console.log('3. Create both components')
    console.log('4. Update template metadata')
    
    const migrationType = await question('Choose migration type (1-4): ')

    const baseDir = process.cwd()
    
    switch (migrationType) {
      case '1':
        await createUnifiedPreview(templateId, templateName, baseDir)
        break
      case '2':
        await createUnifiedPDF(templateId, templateName, baseDir)
        break
      case '3':
        await createUnifiedPreview(templateId, templateName, baseDir)
        await createUnifiedPDF(templateId, templateName, baseDir)
        break
      case '4':
        await updateTemplateMetadata(templateId, templateName, baseDir)
        break
      default:
        console.log('❌ Invalid option selected')
        return
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Test the new unified components')
    console.log('2. Update any references to use the new components')
    console.log('3. Run consistency validation tests')
    console.log('4. Remove old template files if no longer needed')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    rl.close()
  }
}

async function createUnifiedPreview(templateId, templateName, baseDir) {
  console.log(`\n📝 Creating unified preview component for ${templateId}...`)
  
  const previewDir = path.join(baseDir, 'components', 'editor', 'templates', templateId)
  const unifiedPreviewPath = path.join(previewDir, `${templateName.replace(/\s+/g, '')}PreviewUnified.tsx`)
  
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true })
  }

  const unifiedPreviewContent = `import React from 'react'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { UnifiedTemplateBase, UnifiedTemplateProps } from '@/components/shared/unified-template-base'
import { SharedFontSettings } from '@/components/shared/menu-components'

/**
 * Unified ${templateName} Preview Component
 * Uses the same shared components as PDF templates for perfect consistency
 */
const ${templateName.replace(/\s+/g, '')}PreviewUnified: React.FC = () => {
  const {
    categories,
    restaurant,
    pageBackgroundSettings,
    fontSettings,
    rowStyleSettings,
    appliedRowStyles,
    currentLanguage,
    moveItem,
    handleAddCategory,
  } = useMenuEditor()

  const handleAddCategoryClick = () => {
    handleAddCategory()
  }

  // Convert context data to unified template props
  const unifiedProps: UnifiedTemplateProps = {
    restaurant: {
      id: restaurant?.id || '',
      name: restaurant?.name || '',
      category: restaurant?.category || '',
      logo_url: restaurant?.logo_url || undefined,
      address: restaurant?.address || undefined,
      phone: restaurant?.phone || undefined,
      website: restaurant?.website || undefined,
      color_palette: restaurant?.color_palette || undefined,
      currency: restaurant?.currency || undefined
    },
    categories: categories || [],
    language: currentLanguage,
    fontSettings: fontSettings as SharedFontSettings,
    customizations: {
      pageBackgroundSettings,
      rowStyles: rowStyleSettings
    },
    isPdfGeneration: false,
    isPreview: true,
    showFooter: true,
    showImages: true
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ScrollArea className="h-full w-full">
        <div className="relative">
          {/* Unified Template Base */}
          <UnifiedTemplateBase {...unifiedProps} />
          
          {/* Preview-specific controls */}
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              onClick={handleAddCategoryClick}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              {currentLanguage === 'ar' ? 'إضافة قسم' : 'Add Category'}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </DndProvider>
  )
}

export default ${templateName.replace(/\s+/g, '')}PreviewUnified
`

  fs.writeFileSync(unifiedPreviewPath, unifiedPreviewContent)
  console.log(`✅ Created unified preview: ${unifiedPreviewPath}`)
}

async function createUnifiedPDF(templateId, templateName, baseDir) {
  console.log(`\n📝 Creating unified PDF component for ${templateId}...`)
  
  const pdfDir = path.join(baseDir, 'lib', 'pdf-server-components', 'templates')
  const unifiedPdfPath = path.join(pdfDir, `${templateName.replace(/\s+/g, '')}PDFTemplateUnified.tsx`)
  
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true })
  }

  const unifiedPdfContent = `import React from 'react'
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

interface ${templateName.replace(/\s+/g, '')}PDFTemplateUnifiedProps {
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
 * Unified ${templateName} PDF Template Component
 * Uses the same shared components as the preview for perfect consistency
 * This ensures that the PDF output matches exactly what users see in the preview
 */
export function ${templateName.replace(/\s+/g, '')}PDFTemplateUnified({
  restaurant,
  categories,
  language = 'ar',
  customizations = {}
}: ${templateName.replace(/\s+/g, '')}PDFTemplateUnifiedProps) {
  
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
      currency: restaurant.currency
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
        dietary_info: item.dietary_info
      }))
    })),
    language,
    fontSettings: customizations.fontSettings || {
      arabic: { font: 'Cairo', weight: 'normal' },
      english: { font: 'Roboto', weight: 'normal' }
    },
    customizations: {
      pageBackgroundSettings: customizations.pageBackgroundSettings,
      rowStyles: customizations.rowStyles
    },
    isPdfGeneration: true,
    isPreview: false,
    showFooter: true,
    showImages: true
  }

  return <UnifiedTemplateBase {...unifiedProps} />
}

export default ${templateName.replace(/\s+/g, '')}PDFTemplateUnified
`

  fs.writeFileSync(unifiedPdfPath, unifiedPdfContent)
  console.log(`✅ Created unified PDF: ${unifiedPdfPath}`)
}

async function updateTemplateMetadata(templateId, templateName, baseDir) {
  console.log(`\n📝 Updating template metadata for ${templateId}...`)
  
  const metadataPath = path.join(baseDir, 'data', 'pdf-templates-metadata.json')
  
  if (!fs.existsSync(metadataPath)) {
    console.log('❌ Template metadata file not found')
    return
  }

  const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
  const metadata = JSON.parse(metadataContent)

  // Update template metadata
  if (metadata.templates[templateId]) {
    metadata.templates[templateId].componentPath = `./templates/${templateName.replace(/\s+/g, '')}PDFTemplateUnified`
    metadata.templates[templateId].previewComponentPath = `../components/editor/templates/${templateId}/${templateName.replace(/\s+/g, '')}PreviewUnified`
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
    console.log(`✅ Updated template metadata for ${templateId}`)
  } else {
    console.log(`❌ Template ${templateId} not found in metadata`)
  }
}

// Run the migration utility
migrateTemplate().catch(console.error) 