"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface MenuTranslation {
  id: string
  restaurant_id: string
  language_code: string
  source_language_code: string
  translated_data: any
  is_published: boolean
  created_at: string
  updated_at: string
}

export async function saveMenuTranslation(
  restaurantId: string,
  languageCode: string,
  sourceLanguageCode: string,
  translatedData: any
) {
  try {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Use the upsert function we created
    const { data, error } = await supabase.rpc('upsert_menu_translation', {
      p_restaurant_id: restaurantId,
      p_language_code: languageCode,
      p_source_language_code: sourceLanguageCode,
      p_translated_data: translatedData
    })

    if (error) {
      console.error('Error saving translation:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/menu-editor')
    
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving translation:', error)
    return { success: false, error: 'Failed to save translation' }
  }
}

export async function getMenuTranslation(restaurantId: string, languageCode: string) {
  try {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('menu_translations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('language_code', languageCode)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('Error fetching translation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || null }
  } catch (error) {
    console.error('Unexpected error fetching translation:', error)
    return { success: false, error: 'Failed to fetch translation' }
  }
}

export async function getAllMenuTranslations(restaurantId: string) {
  try {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('menu_translations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching translations:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error fetching translations:', error)
    return { success: false, error: 'Failed to fetch translations' }
  }
}

export async function deleteMenuTranslation(restaurantId: string, languageCode: string) {
  try {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('menu_translations')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('language_code', languageCode)

    if (error) {
      console.error('Error deleting translation:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/menu-editor')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting translation:', error)
    return { success: false, error: 'Failed to delete translation' }
  }
}

export async function publishMenuTranslation(restaurantId: string, languageCode: string) {
  try {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('menu_translations')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('restaurant_id', restaurantId)
      .eq('language_code', languageCode)
      .select()
      .single()

    if (error) {
      console.error('Error publishing translation:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/menu-editor')
    
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error publishing translation:', error)
    return { success: false, error: 'Failed to publish translation' }
  }
} 