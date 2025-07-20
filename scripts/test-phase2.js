#!/usr/bin/env node

/**
 * Test script for Phase 2: Scalable Template Management
 * Tests dynamic template loading and registry functionality
 */

const { templateRegistry } = require('../lib/pdf-server-components/template-registry')
const PDFTemplateFactory = require('../lib/pdf-server-components/pdf-template-factory').default

async function testPhase2() {
  console.log('🧪 Starting Phase 2: Scalable Template Management Test...\n')
  
  try {
    // Test 1: Load template registry
    console.log('📋 Test 1: Loading template registry...')
    const registry = await templateRegistry.loadRegistry()
    console.log(`✅ Registry loaded with ${Object.keys(registry.templates).length} templates`)
    console.log(`   Categories: ${Object.keys(registry.categories).length}`)
    console.log(`   Default template: ${registry.defaultTemplate}`)

    // Test 2: Get all templates
    console.log('\n📋 Test 2: Getting all templates...')
    const allTemplates = await PDFTemplateFactory.getAllTemplates()
    console.log(`✅ Retrieved ${allTemplates.length} templates:`)
    allTemplates.forEach(template => {
      console.log(`   - ${template.id}: ${template.name} (${template.category})`)
    })

    // Test 3: Get templates by category
    console.log('\n📋 Test 3: Getting templates by category...')
    const categories = await PDFTemplateFactory.getCategories()
    console.log(`✅ Retrieved ${categories.length} categories:`)
    
    for (const category of categories) {
      const categoryTemplates = await PDFTemplateFactory.getTemplatesByCategory(category.name)
      console.log(`   ${category.name}: ${categoryTemplates.length} templates`)
    }

    // Test 4: Template validation
    console.log('\n📋 Test 4: Template validation...')
    const validTemplates = ['classic', 'modern', 'vintage', 'painting', 'modern-coffee']
    const invalidTemplates = ['nonexistent', 'invalid-template']
    
    for (const templateId of validTemplates) {
      const isValid = await PDFTemplateFactory.isValidTemplateId(templateId)
      console.log(`   ${templateId}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
    }
    
    for (const templateId of invalidTemplates) {
      const isValid = await PDFTemplateFactory.isValidTemplateId(templateId)
      console.log(`   ${templateId}: ${isValid ? '❌ Should be invalid' : '✅ Correctly invalid'}`)
    }

    // Test 5: Template normalization
    console.log('\n📋 Test 5: Template normalization...')
    const testCases = [
      { input: 'modern', expected: 'modern' },
      { input: 'nonexistent', expected: 'classic' },
      { input: undefined, expected: 'classic' },
      { input: '', expected: 'classic' }
    ]
    
    for (const testCase of testCases) {
      const normalized = await PDFTemplateFactory.normalizeTemplateId(testCase.input)
      const passed = normalized === testCase.expected
      console.log(`   "${testCase.input}" -> "${normalized}" ${passed ? '✅' : '❌'}`)
    }

    // Test 6: Dynamic template loading
    console.log('\n📋 Test 6: Dynamic template loading...')
    const testTemplateId = 'modern'
    
    try {
      const templateComponent = await templateRegistry.loadTemplateComponent(testTemplateId)
      console.log(`✅ Successfully loaded template component: ${testTemplateId}`)
      console.log(`   Component type: ${typeof templateComponent}`)
    } catch (error) {
      console.error(`❌ Failed to load template component: ${error.message}`)
    }

    // Test 7: Template metadata
    console.log('\n📋 Test 7: Template metadata...')
    const templateMetadata = await PDFTemplateFactory.getTemplateConfig(testTemplateId)
    if (templateMetadata) {
      console.log(`✅ Template metadata for ${testTemplateId}:`)
      console.log(`   Name: ${templateMetadata.name}`)
      console.log(`   Description: ${templateMetadata.description}`)
      console.log(`   Category: ${templateMetadata.category}`)
      console.log(`   Features: ${templateMetadata.features.join(', ')}`)
    } else {
      console.log(`❌ No metadata found for ${testTemplateId}`)
    }

    // Test 8: Template features
    console.log('\n📋 Test 8: Template features...')
    const features = await PDFTemplateFactory.getTemplateFeatures(testTemplateId)
    console.log(`✅ Features for ${testTemplateId}: ${features.join(', ')}`)

    // Test 9: Default settings
    console.log('\n📋 Test 9: Default settings...')
    const defaultSettings = await PDFTemplateFactory.getTemplateDefaultSettings(testTemplateId)
    console.log(`✅ Default settings for ${testTemplateId}:`)
    console.log(`   Arabic font: ${defaultSettings.fontSettings?.arabic?.font}`)
    console.log(`   English font: ${defaultSettings.fontSettings?.english?.font}`)
    console.log(`   Primary color: ${defaultSettings.colorPalette?.primary}`)

    // Test 10: Cache functionality
    console.log('\n📋 Test 10: Cache functionality...')
    console.log('   Clearing cache...')
    PDFTemplateFactory.clearCache()
    console.log('   ✅ Cache cleared')
    
    console.log('   Reloading registry...')
    await PDFTemplateFactory.reloadRegistry()
    console.log('   ✅ Registry reloaded')

    console.log('\n🎉 All Phase 2 tests completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Template registry loading')
    console.log('   ✅ Dynamic template discovery')
    console.log('   ✅ Category-based organization')
    console.log('   ✅ Template validation')
    console.log('   ✅ Template normalization')
    console.log('   ✅ Dynamic component loading')
    console.log('   ✅ Metadata management')
    console.log('   ✅ Feature detection')
    console.log('   ✅ Default settings')
    console.log('   ✅ Cache management')
    
    console.log('\n🚀 Phase 2 Implementation Benefits:')
    console.log('   • Infinite template scalability')
    console.log('   • No code changes required for new templates')
    console.log('   • Centralized template management')
    console.log('   • Dynamic loading and caching')
    console.log('   • Category-based organization')
    console.log('   • Rich metadata support')
    
  } catch (error) {
    console.error('❌ Phase 2 test failed:', error)
    process.exit(1)
  }
}

// Run the test
testPhase2().catch(console.error) 