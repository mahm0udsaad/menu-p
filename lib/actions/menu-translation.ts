"use server"

import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

// Schema for translated menu item
const TranslatedMenuItemSchema = z.object({
  id: z.string().describe("The original, untranslated ID of the menu item. This must be preserved exactly."),
  name: z.string().optional().describe("The translated name of the menu item. Should be preserved if missing."),
  description: z.string().nullable().describe("The translated description of the menu item. Should be null if the original is null."),
  price: z.number().nullable().optional().describe("The price of the item. This should not be translated or changed."),
  image_url: z.string().nullable().describe("The URL for the item's image. This should not be translated or changed."),
  is_available: z.boolean().describe("The availability status of the item. This should not be translated or changed."),
  is_featured: z.boolean().describe("The featured status of the item. This should not be translated or changed."),
  dietary_info: z.array(z.string()).describe("An array of dietary information tags (e.g., 'vegan', 'gluten-free'). These should be translated."),
})

// Schema for translated category
const TranslatedCategorySchema = z.object({
  id: z.string().describe("The original, untranslated ID of the category. This must be preserved exactly."),
  name: z.string().optional().describe("The translated name of the category. Should be preserved if missing."),
  description: z.string().nullable().describe("The translated description of the category. Should be null if the original is null."),
  background_image_url: z.string().nullable().describe("The URL for the category's background image. This should not be translated or changed."),
  menu_items: z.array(TranslatedMenuItemSchema).describe("The list of menu items within this category."),
})

// Schema for the complete translated menu
const TranslatedMenuSchema = z.object({
  categories: z.array(TranslatedCategorySchema),
})

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
  background_image_url: string | null
  menu_items: MenuItem[]
}

interface TranslateMenuParams {
  categories: MenuCategory[]
  targetLanguage: string
  sourceLanguage?: string
}

import { LANGUAGE_NAMES } from "@/lib/utils/translation-constants"

export async function translateMenuWithAI({ 
  categories, 
  targetLanguage, 
  sourceLanguage = 'ar' 
}: TranslateMenuParams) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('Google Generative AI API key is required')
    }

    const sourceLangName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage
    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage

    // Create the model with Gemini 2.0 Flash
    const model = google('gemini-2.0-flash-exp')

    const prompt = `You are a professional food and beverage translator specializing in restaurant menus. 

Translate the following menu from ${sourceLangName} to ${targetLangName}. 

CRITICAL REQUIREMENTS FOR VALID JSON OUTPUT:
1. You MUST output COMPLETE, VALID JSON - do not truncate strings or leave incomplete objects
2. EVERY string value must be properly closed with quotes - no broken strings like "Mo{" 
3. EVERY JSON object and array must be properly closed with closing brackets
4. Preserve the exact same structure and IDs - do not change any IDs
5. If a category or menu item is missing "name" field, do not add it - preserve structure exactly
6. Translate only existing "name" and "description" fields for categories and menu items
7. Keep all other fields (price, image_url, is_available, is_featured, dietary_info, etc.) exactly the same
8. For food names, use culturally appropriate translations that sound appetizing in ${targetLangName}
9. For descriptions, maintain the appetizing and descriptive tone while being accurate
10. If dietary_info contains terms like "vegan", "vegetarian", "gluten-free", translate them appropriately
11. Keep prices in the same currency and format
12. Preserve all boolean values and arrays exactly as they are
13. If a description is null, keep it as null
14. ENSURE ALL CATEGORIES AND MENU ITEMS ARE INCLUDED IN THE RESPONSE
15. DOUBLE-CHECK that your JSON is valid and complete before finishing

JSON TO TRANSLATE:
${JSON.stringify(categories, null, 2)}

IMPORTANT: Return ONLY the complete, valid JSON object with proper formatting. Do not include any explanatory text before or after the JSON.`

    console.log('🤖 Starting menu translation with Gemini 2.0 Flash...')
    
    const result = await generateObject({
      model,
      schema: TranslatedMenuSchema,
      prompt,
      maxTokens: 8000,
    })

    console.log('✅ Translation completed successfully')
    
    return {
      success: true,
      data: result.object.categories,
      usage: result.usage,
    }
  } catch (error) {
    console.error('❌ Translation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
      data: null,
    }
  }
}

