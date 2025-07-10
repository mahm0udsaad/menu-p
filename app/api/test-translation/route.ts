import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing translation API')
    
    // Simple test menu data
    const testCategories = [
      {
        id: 'cat-1',
        name: 'المقبلات',
        description: 'مجموعة من المقبلات الشهية',
        background_image_url: null,
        menu_items: [
          {
            id: 'item-1',
            name: 'حمص',
            description: 'حمص طازج مع زيت الزيتون',
            price: 15,
            image_url: null,
            is_available: true,
            is_featured: false,
            dietary_info: ['vegetarian']
          },
          {
            id: 'item-2',
            name: 'متبل',
            description: 'متبل باذنجان مشوي',
            price: 18,
            image_url: null,
            is_available: true,
            is_featured: true,
            dietary_info: ['vegan']
          }
        ]
      }
    ]

    // Test translation to English
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/translate-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categories: testCategories,
        targetLanguage: 'en',
        sourceLanguage: 'ar'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Translation API returned error:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API returned ${response.status}: ${errorText}` 
      }, { status: 500 })
    }

    console.log('✅ Translation API returned success status')
    
    // Read the streaming response
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let result = ''
    let finalObject = null

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        result += chunk
        
        // Parse streaming data
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.final && data.object) {
                finalObject = data.object
              }
            } catch (e) {
              console.warn('Failed to parse line:', line)
            }
          }
        }
      }
    }

    console.log('🎯 Translation test completed')
    console.log('📄 Raw response length:', result.length)
    console.log('📦 Final object received:', !!finalObject)

    if (finalObject) {
      console.log('✅ Translation successful!')
      console.log('📊 Categories count:', finalObject.categories?.length)
      console.log('📝 First category name:', finalObject.categories?.[0]?.name)
      console.log('🍽️ First item name:', finalObject.categories?.[0]?.menu_items?.[0]?.name)
      
      return NextResponse.json({
        success: true,
        message: 'Translation test completed successfully',
        result: finalObject,
        rawResponseLength: result.length
      })
    } else {
      console.error('❌ No final object received')
      return NextResponse.json({
        success: false,
        error: 'No final translation object received',
        rawResponse: result.slice(0, 1000) // First 1000 chars for debugging
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test translation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 