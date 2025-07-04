"use server"

import { createClient } from "@/lib/supabase/server"
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
    const supabase = createClient()
    
    // First try to get existing customizations
    const { data: existing, error: fetchError } = await supabase
      .from('menu_customizations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single()

    if (existing && !fetchError) {
      return { success: true, data: existing }
    }

    // If not found, create with defaults
    const defaultCustomizations = {
      restaurant_id: restaurantId,
      page_background_settings: {
        backgroundColor: '#ffffff',
        backgroundImage: null,
        backgroundType: 'solid',
        gradientFrom: '#ffffff',
        gradientTo: '#f3f4f6',
        gradientDirection: 'to-b'
      },
      font_settings: {
        arabic: { font: 'cairo', weight: 'normal' },
        english: { font: 'roboto', weight: 'normal' }
      },
      row_styles: {
        backgroundColor: 'transparent',
        backgroundImage: null,
        backgroundType: 'solid',
        itemColor: '#1f2937',
        descriptionColor: '#6b7280',
        priceColor: '#dc2626',
        textShadow: false
      },
      element_styles: {},
      theme_settings: {}
    }

    const { data, error } = await supabase
      .from('menu_customizations')
      .insert(defaultCustomizations)
      .select()
      .single()

    if (error) {
      console.error('Error creating menu customizations:', error)
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
    const supabase = createClient()
    
    // First check if customizations exist
    const { data: existing } = await supabase
      .from('menu_customizations')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('menu_customizations')
        .update({ page_background_settings: settings })
        .eq('restaurant_id', restaurantId)
        .select()

      if (error) {
        console.error('Error saving page background settings:', error)
        return { success: false, error: error.message }
      }

      // Revalidate relevant pages
      revalidatePath('/menu-editor')
      revalidatePath('/dashboard')

      return { success: true, data }
    } else {
      // Create new record with defaults
      const result = await getMenuCustomizations(restaurantId)
      if (result.success) {
        return await savePageBackgroundSettings(restaurantId, settings)
      }
      return result
    }
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
    const supabase = createClient()
    
    // First check if customizations exist
    const { data: existing } = await supabase
      .from('menu_customizations')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('menu_customizations')
        .update({ font_settings: settings })
        .eq('restaurant_id', restaurantId)
        .select()

      if (error) {
        console.error('Error saving font settings:', error)
        return { success: false, error: error.message }
      }

      revalidatePath('/menu-editor')
      revalidatePath('/dashboard')

      return { success: true, data }
    } else {
      // Create new record with defaults
      const result = await getMenuCustomizations(restaurantId)
      if (result.success) {
        return await saveFontSettings(restaurantId, settings)
      }
      return result
    }
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
    const supabase = createClient()
    
    // First check if customizations exist
    const { data: existing } = await supabase
      .from('menu_customizations')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('menu_customizations')
        .update({ row_styles: settings })
        .eq('restaurant_id', restaurantId)
        .select()

      if (error) {
        console.error('Error saving row styles:', error)
        return { success: false, error: error.message }
      }

      revalidatePath('/menu-editor')
      revalidatePath('/dashboard')

      return { success: true, data }
    } else {
      // Create new record with defaults
      const result = await getMenuCustomizations(restaurantId)
      if (result.success) {
        return await saveRowStyles(restaurantId, settings)
      }
      return result
    }
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
    const supabase = createClient()
    
    // First check if customizations exist
    const { data: existing } = await supabase
      .from('menu_customizations')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .single()

    const updateData: any = {}
    if (settings.page_background_settings) updateData.page_background_settings = settings.page_background_settings
    if (settings.font_settings) updateData.font_settings = settings.font_settings
    if (settings.row_styles) updateData.row_styles = settings.row_styles
    if (settings.element_styles) updateData.element_styles = settings.element_styles
    if (settings.theme_settings) updateData.theme_settings = settings.theme_settings

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('menu_customizations')
        .update(updateData)
        .eq('restaurant_id', restaurantId)
        .select()

      if (error) {
        console.error('Error saving all customizations:', error)
        return { success: false, error: error.message }
      }

      revalidatePath('/menu-editor')
      revalidatePath('/dashboard')

      return { success: true, data }
    } else {
      // Create new record with defaults
      const result = await getMenuCustomizations(restaurantId)
      if (result.success) {
        return await saveAllCustomizations(restaurantId, settings)
      }
      return result
    }
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