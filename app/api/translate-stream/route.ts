import { streamObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { LANGUAGE_NAMES } from "@/lib/utils/translation-constants"

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

export async function POST(req: Request) {
  console.log('🔥 Translation API called')
  
  try {
    // Check environment variables first
    console.log('🔑 Checking API key...')
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('❌ Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
      return new Response(JSON.stringify({ 
        error: 'Google Generative AI API key is required',
        details: 'Environment variable GOOGLE_GENERATIVE_AI_API_KEY is not set'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    console.log('✅ API key found')

    // Parse request body
    console.log('📝 Parsing request body...')
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { categories, targetLanguage, sourceLanguage = 'ar' } = requestData
    console.log('📊 Request data:', { 
      categoriesCount: categories?.length, 
      targetLanguage, 
      sourceLanguage 
    })

    // Validate required parameters
    if (!categories || !targetLanguage) {
      console.error('❌ Missing required parameters')
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        details: 'Both categories and targetLanguage are required'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      console.error('❌ Invalid categories data')
      return new Response(JSON.stringify({ 
        error: 'Invalid categories data',
        details: 'Categories must be a non-empty array'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get language names
    const sourceLangName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage
    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage
    console.log(`🌍 Translating from ${sourceLangName} to ${targetLangName}`)

    // Calculate estimated token requirement based on menu size
    const totalItems = categories.reduce((sum, cat) => sum + (cat.menu_items?.length || 0), 0)
    const estimatedTokens = Math.max(16000, totalItems * 300 + categories.length * 500)
    console.log(`📏 Estimated tokens needed: ${estimatedTokens} (${categories.length} categories, ${totalItems} items)`)

    // Initialize Google AI model
    console.log('🤖 Initializing Google AI model...')
    let model
    try {
      model = google('gemini-2.0-flash-exp')
    } catch (modelError) {
      console.error('❌ Failed to initialize Google AI model:', modelError)
      return new Response(JSON.stringify({ 
        error: 'Failed to initialize AI model',
        details: modelError instanceof Error ? modelError.message : 'Unknown model error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create simplified categories for translation (remove complex nested structures)
    const simplifiedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name || '',
      description: cat.description,
      background_image_url: cat.background_image_url,
      menu_items: (cat.menu_items || []).map((item: any) => ({
        id: item.id,
        name: item.name || '',
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        is_available: item.is_available,
        is_featured: item.is_featured,
        dietary_info: item.dietary_info || []
      }))
    }))

    const prompt = `You are a professional restaurant menu translator. Translate from ${sourceLangName} to ${targetLangName}.

⚠️ CRITICAL: Output ONLY valid JSON. No text before or after. No explanations.

🔧 RULES:
1. Preserve ALL IDs exactly
2. Translate ONLY "name" and "description" fields  
3. Keep ALL other fields unchanged (price, URLs, booleans, arrays)
4. Use proper JSON escaping for quotes in strings
5. If "name" is missing, don't add it
6. If "description" is null, keep null
7. Make food names appetizing in ${targetLangName}

📋 DIETARY TERMS:
- "vegan" → "${targetLanguage === 'en' ? 'vegan' : targetLanguage === 'fr' ? 'végétalien' : 'نباتي'}"
- "vegetarian" → "${targetLanguage === 'en' ? 'vegetarian' : targetLanguage === 'fr' ? 'végétarien' : 'نباتي جزئي'}"
- "gluten-free" → "${targetLanguage === 'en' ? 'gluten-free' : targetLanguage === 'fr' ? 'sans gluten' : 'خالي من الجلوتين'}"

INPUT:
${JSON.stringify(simplifiedCategories, null, 2)}

OUTPUT (JSON only):`

    console.log('🚀 Starting streaming translation...')
    
    // Start streaming translation with increased token limit
    let streamResult
    try {
      streamResult = streamObject({
        model,
        schema: TranslatedMenuSchema,
        prompt,
        maxTokens: estimatedTokens, // Dynamic token limit based on menu size
      })
    } catch (streamError) {
      console.error('❌ Failed to start streaming:', streamError)
      return new Response(JSON.stringify({ 
        error: 'Failed to start translation stream',
        details: streamError instanceof Error ? streamError.message : 'Unknown streaming error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { partialObjectStream, object } = streamResult

    // Create a custom streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('📡 Starting stream controller...')
          
          // Stream partial objects
          for await (const partialObject of partialObjectStream) {
            console.log('📦 Streaming partial object...')
            const chunk = encoder.encode(`data: ${JSON.stringify(partialObject)}\n\n`)
            controller.enqueue(chunk)
          }

          // Send final complete object
          console.log('🏁 Getting final object...')
          const finalObject = await object
          
          // Validate the final object has all required data
          if (!finalObject.categories || finalObject.categories.length !== categories.length) {
            throw new Error(`Translation incomplete: Expected ${categories.length} categories, got ${finalObject.categories?.length || 0}`)
          }
          
          // Validate each category has the right number of items
          for (let i = 0; i < categories.length; i++) {
            const originalItemCount = categories[i].menu_items?.length || 0
            const translatedItemCount = finalObject.categories[i]?.menu_items?.length || 0
            if (originalItemCount !== translatedItemCount) {
              throw new Error(`Category ${i} item count mismatch: Expected ${originalItemCount}, got ${translatedItemCount}`)
            }
          }
          
          console.log('✅ Translation completed and validated successfully')
          
          const finalChunk = encoder.encode(`data: ${JSON.stringify({ final: true, object: finalObject })}\n\n`)
          controller.enqueue(finalChunk)
          
          controller.close()
        } catch (error) {
          console.error('❌ Stream controller error:', error)
          const errorChunk = encoder.encode(`data: ${JSON.stringify({ 
            error: 'Translation failed during streaming',
            details: error instanceof Error ? error.message : 'Unknown streaming error'
          })}\n\n`)
          controller.enqueue(errorChunk)
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('❌ Unexpected error in translation API:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}