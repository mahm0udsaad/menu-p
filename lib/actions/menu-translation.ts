"use server"

import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

// Schema for translated menu item
const TranslatedMenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  image_url: z.string().nullable(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  dietary_info: z.array(z.string()),
})

// Schema for translated category
const TranslatedCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  background_image_url: z.string().nullable(),
  menu_items: z.array(TranslatedMenuItemSchema),
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

IMPORTANT INSTRUCTIONS:
1. Preserve the exact same structure and IDs - do not change any IDs
2. Translate only the "name" and "description" fields for categories and menu items
3. Keep all other fields (price, image_url, is_available, is_featured, dietary_info, etc.) exactly the same
4. For food names, use culturally appropriate translations that sound appetizing in ${targetLangName}
5. For descriptions, maintain the appetizing and descriptive tone while being accurate
6. If dietary_info contains terms like "vegan", "vegetarian", "gluten-free", translate them appropriately
7. Keep prices in the same currency and format
8. Preserve all boolean values and arrays exactly as they are
9. If a description is null, keep it as null

Here is the menu to translate:

${JSON.stringify(categories, null, 2)}

Return the translated menu with the exact same structure, only changing the text content where appropriate.`

    console.log('🤖 Starting menu translation with Gemini 2.0 Flash...')
    
    const result = await generateObject({
      model,
      schema: TranslatedMenuSchema,
      prompt,
      maxTokens: 4000,
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

