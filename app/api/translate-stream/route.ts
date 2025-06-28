import { streamObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { LANGUAGE_NAMES } from "@/lib/utils/translation-constants"

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
    const estimatedTokens = Math.max(8000, totalItems * 150 + categories.length * 200)
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

    const prompt = `You are a professional food and beverage translator specializing in restaurant menus. 

Translate the following menu from ${sourceLangName} to ${targetLangName}. 

CRITICAL REQUIREMENTS:
1. You MUST complete the entire JSON structure - do not truncate or leave incomplete
2. Preserve the exact same structure and IDs - do not change any IDs
3. Translate only the "name" and "description" fields for categories and menu items
4. Keep all other fields (price, image_url, is_available, is_featured, dietary_info, etc.) exactly the same
5. For food names, use culturally appropriate translations that sound appetizing in ${targetLangName}
6. For descriptions, maintain the appetizing and descriptive tone while being accurate
7. If dietary_info contains terms like "vegan", "vegetarian", "gluten-free", translate them appropriately
8. Keep prices in the same currency and format
9. Preserve all boolean values and arrays exactly as they are
10. If a description is null, keep it as null
11. ENSURE ALL CATEGORIES AND MENU ITEMS ARE INCLUDED IN THE RESPONSE

Here is the menu to translate:

${JSON.stringify(categories, null, 2)}

Return the complete translated menu with the exact same structure, ensuring every category and menu item is fully translated and included.`

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
          
          console.log('✅ Translation completed successfully')
          
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