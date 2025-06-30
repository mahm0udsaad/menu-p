"use server"

import { supabase } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface MenuCustomizations {
  id: string
  restaurant_id: string
  page_background_settings: {
    backgroundColor: string
    backgroundImage: string | null
    backgroundType: 'solid' | 'image' | 'gradient'
    gradientFrom: string
    gradientTo: string
    gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
  }
  font_settings: {
    arabic: { font: string; weight: string }
    english: { font: string; weight: string }
  }
  row_styles: {
    backgroundColor: string
    backgroundImage: string | null
    backgroundType: 'solid' | 'image'
    itemColor: string
    descriptionColor: string
    priceColor: string
    textShadow: boolean
  }
  element_styles: Record<string, any>
  theme_settings: Record<string, any>
  created_at: string
  updated_at: string
}

// Get menu customizations for a restaurant
export async function getMenuCustomizations(restaurantId: string) {
  try {
    // First try to get existing customizations
    const { data: existing, error: fetchError } = await supabase
      .from('menu_customizations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single()

    if (existing && !fetchError) {
      return { success: true, data: existing }
    }

    // If not found, create with defaults using our helper function
    const { data, error } = await supabase
      .rpc('get_or_create_menu_customizations', { restaurant_uuid: restaurantId })

    if (error) {
      console.error('Error getting/creating menu customizations:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in getMenuCustomizations:', error)
    return { success: false, error: error.message }
  }
}

// Save page background settings
export async function savePageBackgroundSettings(
  restaurantId: string,
  settings: {
    backgroundColor: string
    backgroundImage: string | null
    backgroundType: 'solid' | 'image' | 'gradient'
    gradientFrom: string
    gradientTo: string
    gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
  }
) {
  try {
    const { data, error } = await supabase
      .rpc('update_page_background_settings', {
        restaurant_uuid: restaurantId,
        background_settings: settings
      })

    if (error) {
      console.error('Error saving page background settings:', error)
      return { success: false, error: error.message }
    }

    // Revalidate relevant pages
    revalidatePath('/menu-editor')
    revalidatePath('/dashboard')

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in savePageBackgroundSettings:', error)
    return { success: false, error: error.message }
  }
}

// Save font settings
export async function saveFontSettings(
  restaurantId: string,
  settings: {
    arabic: { font: string; weight: string }
    english: { font: string; weight: string }
  }
) {
  try {
    const { data, error } = await supabase
      .rpc('update_font_settings', {
        restaurant_uuid: restaurantId,
        font_settings_data: settings
      })

    if (error) {
      console.error('Error saving font settings:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/menu-editor')
    revalidatePath('/dashboard')

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in saveFontSettings:', error)
    return { success: false, error: error.message }
  }
}

// Save row styles
export async function saveRowStyles(
  restaurantId: string,
  settings: {
    backgroundColor: string
    backgroundImage: string | null
    backgroundType: 'solid' | 'image'
    itemColor: string
    descriptionColor: string
    priceColor: string
    textShadow: boolean
  }
) {
  try {
    const { data, error } = await supabase
      .rpc('update_row_styles', {
        restaurant_uuid: restaurantId,
        row_styles_data: settings
      })

    if (error) {
      console.error('Error saving row styles:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/menu-editor')
    revalidatePath('/dashboard')

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in saveRowStyles:', error)
    return { success: false, error: error.message }
  }
}

// Save all customization settings at once
export async function saveAllCustomizations(
  restaurantId: string,
  settings: {
    page_background_settings?: {
      backgroundColor: string
      backgroundImage: string | null
      backgroundType: 'solid' | 'image' | 'gradient'
      gradientFrom: string
      gradientTo: string
      gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
    }
    font_settings?: {
      arabic: { font: string; weight: string }
      english: { font: string; weight: string }
    }
    row_styles?: {
      backgroundColor: string
      backgroundImage: string | null
      backgroundType: 'solid' | 'image'
      itemColor: string
      descriptionColor: string
      priceColor: string
      textShadow: boolean
    }
    element_styles?: Record<string, any>
    theme_settings?: Record<string, any>
  }
) {
  try {
    const { data, error } = await supabase
      .rpc('update_all_customizations', {
        restaurant_uuid: restaurantId,
        page_bg_settings: settings.page_background_settings || null,
        font_settings_data: settings.font_settings || null,
        row_styles_data: settings.row_styles || null,
        element_styles_data: settings.element_styles || null,
        theme_settings_data: settings.theme_settings || null
      })

    if (error) {
      console.error('Error saving all customizations:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/menu-editor')
    revalidatePath('/dashboard')

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in saveAllCustomizations:', error)
    return { success: false, error: error.message }
  }
}

// Client-side action for updating background settings
export async function updatePageBackgroundAction(formData: FormData) {
  const restaurantId = formData.get('restaurantId') as string
  const backgroundColor = formData.get('backgroundColor') as string
  const backgroundImage = formData.get('backgroundImage') as string | null
  const backgroundType = formData.get('backgroundType') as 'solid' | 'image' | 'gradient'
  const gradientFrom = formData.get('gradientFrom') as string
  const gradientTo = formData.get('gradientTo') as string
  const gradientDirection = formData.get('gradientDirection') as 'to-b' | 'to-br' | 'to-r' | 'to-tr'

  if (!restaurantId) {
    return { success: false, error: 'Restaurant ID is required' }
  }

  return await savePageBackgroundSettings(restaurantId, {
    backgroundColor: backgroundColor || '#ffffff',
    backgroundImage,
    backgroundType: backgroundType || 'solid',
    gradientFrom: gradientFrom || '#ffffff',
    gradientTo: gradientTo || '#f3f4f6',
    gradientDirection: gradientDirection || 'to-b'
  })
} 