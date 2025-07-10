import { NextRequest } from 'next/server'
import { saveMenuTranslation, getMenuTranslation, getAllMenuTranslations } from '@/lib/actions/menu-translation-storage'

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, languageCode, sourceLanguageCode, translatedData } = await request.json()

    if (!restaurantId || !languageCode || !translatedData) {
      return Response.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    const result = await saveMenuTranslation(
      restaurantId, 
      languageCode, 
      sourceLanguageCode || 'ar', 
      translatedData
    )

    if (!result.success) {
      return Response.json(
        { error: result.error }, 
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error saving menu translation:', error)
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const languageCode = searchParams.get('languageCode')

    if (!restaurantId) {
      return Response.json(
        { error: 'Restaurant ID is required' }, 
        { status: 400 }
      )
    }

    if (languageCode) {
      // Get specific translation
      const result = await getMenuTranslation(restaurantId, languageCode)
      if (!result.success) {
        return Response.json(
          { error: result.error }, 
          { status: 500 }
        )
      }
      return Response.json({ success: true, data: result.data })
    } else {
      // Get all translations for restaurant
      const result = await getAllMenuTranslations(restaurantId)
      if (!result.success) {
        return Response.json(
          { error: result.error }, 
          { status: 500 }
        )
      }
      return Response.json({ success: true, data: result.data })
    }
  } catch (error) {
    console.error('Error fetching menu translations:', error)
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 