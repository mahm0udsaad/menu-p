#!/usr/bin/env node

/**
 * Template Management Utility
 * Easily add new templates to the PDF generation system
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

async function addTemplate() {
  console.log('🎨 Template Addition Utility')
  console.log('============================\n')

  try {
    // Load existing metadata
    const metadataPath = path.join(process.cwd(), 'data', 'pdf-templates-metadata.json')
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)

    // Get template details
    const templateId = await question('Template ID (e.g., "elegant", "minimal"): ')
    const templateName = await question('Template Name (e.g., "Elegant Style"): ')
    const description = await question('Description: ')
    
    console.log('\nAvailable categories:')
    Object.entries(metadata.categories).forEach(([key, category]) => {
      console.log(`  ${key}: ${category.name} - ${category.description}`)
    })
    
    const category = await question('Category (or enter new category name): ')
    
    console.log('\nAvailable features:')
    console.log('  header, sections, footer, images, featured-items, gradients, artistic-elements, vintage-elements, coffee-elements')
    const features = await question('Features (comma-separated): ')
    
    const componentPath = await question('Component path (relative to lib/pdf-server-components/, e.g., "./templates/ElegantTemplate"): ')
    const previewComponentPath = await question('Preview component path (relative to lib/, e.g., "../components/editor/templates/elegant-preview"): ')

    // Font settings
    console.log('\nFont Settings:')
    const arabicFont = await question('Arabic font (e.g., "Cairo", "Amiri"): ')
    const arabicWeight = await question('Arabic font weight (e.g., "normal", "bold"): ')
    const englishFont = await question('English font (e.g., "Roboto", "Georgia"): ')
    const englishWeight = await question('English font weight (e.g., "normal", "bold"): ')

    // Color palette
    console.log('\nColor Palette:')
    const primaryColor = await question('Primary color (hex, e.g., "#065f46"): ')
    const secondaryColor = await question('Secondary color (hex, e.g., "#6b7280"): ')
    const accentColor = await question('Accent color (hex, e.g., "#f59e0b"): ')

    // Create new template object
    const newTemplate = {
      id: templateId,
      name: templateName,
      description: description,
      componentPath: componentPath,
      previewComponentPath: previewComponentPath,
      category: category,
      features: features.split(',').map(f => f.trim()),
      defaultSettings: {
        fontSettings: {
          arabic: { font: arabicFont, weight: arabicWeight },
          english: { font: englishFont, weight: englishWeight }
        },
        colorPalette: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor
        }
      }
    }

    // Add new category if it doesn't exist
    if (!metadata.categories[category]) {
      const categoryDescription = await question(`Description for new category "${category}": `)
      metadata.categories[category] = {
        name: category,
        description: categoryDescription
      }
    }

    // Add template to metadata
    metadata.templates[templateId] = newTemplate

    // Save updated metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    console.log('\n✅ Template added successfully!')
    console.log('\n📋 Next steps:')
    console.log(`1. Create the template component file: lib/pdf-server-components/${componentPath}.tsx`)
    console.log(`2. Create the preview component file: lib/${previewComponentPath}.tsx`)
    console.log('3. Test the template by generating a PDF')
    console.log('4. Update the HTML template generator if needed')

    // Create template component stub
    const templateComponentPath = path.join(process.cwd(), 'lib', 'pdf-server-components', `${componentPath}.tsx`)
    const templateComponentDir = path.dirname(templateComponentPath)
    
    if (!fs.existsSync(templateComponentDir)) {
      fs.mkdirSync(templateComponentDir, { recursive: true })
    }

    if (!fs.existsSync(templateComponentPath)) {
      const templateComponentStub = `import React from 'react'
import { PDFTemplateProps } from '../pdf-template-factory'

/**
 * ${templateName} PDF Template
 * ${description}
 */
const ${templateName.replace(/\s+/g, '')}PDFTemplate: React.FC<PDFTemplateProps> = ({ 
  restaurant, 
  categories, 
  language = 'ar', 
  customizations = {} 
}) => {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  const currency = restaurant.currency || 'ر.س'

  return (
    <div style={{ 
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: isRTL ? 'Cairo, Arial, sans-serif' : 'Roboto, Arial, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5em', 
          color: '${primaryColor}',
          marginBottom: '10px'
        }}>
          {restaurant.name}
        </h1>
        <p style={{ fontSize: '1.2em', color: '${secondaryColor}' }}>
          {restaurant.category}
        </p>
      </div>

      {/* Menu Sections */}
      {categories.map((category) => (
        <div key={category.id} style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '1.8em', 
            color: '${primaryColor}',
            borderBottom: \`2px solid \${primaryColor}\`,
            paddingBottom: '10px',
            marginBottom: '20px'
          }}>
            {category.name}
          </h2>
          
          {category.menu_items?.filter(item => item.is_available).map((item) => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '15px 0',
              borderBottom: '1px solid #eee'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '1.3em', 
                  color: '#333',
                  marginBottom: '5px'
                }}>
                  {item.name}
                </h3>
                {item.description && (
                  <p style={{ 
                    fontSize: '1em', 
                    color: '${secondaryColor}',
                    marginBottom: '5px'
                  }}>
                    {item.description}
                  </p>
                )}
              </div>
              {item.price && (
                <div style={{ 
                  fontSize: '1.4em', 
                  color: '${primaryColor}',
                  fontWeight: 'bold'
                }}>
                  {item.price.toFixed(2)} {currency}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Footer */}
      <footer style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        textAlign: 'center',
        color: '${secondaryColor}'
      }}>
        <p>{restaurant.address || 'Address'}</p>
        <p>{restaurant.phone || 'Phone'}</p>
        <p>{restaurant.website || 'Website'}</p>
      </footer>
    </div>
  )
}

export default ${templateName.replace(/\s+/g, '')}PDFTemplate
`
      fs.writeFileSync(templateComponentPath, templateComponentStub)
      console.log(`📄 Created template component stub: ${templateComponentPath}`)
    }

  } catch (error) {
    console.error('❌ Error adding template:', error)
  } finally {
    rl.close()
  }
}

// Run the utility
addTemplate().catch(console.error) 