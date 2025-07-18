"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type MenuItemFormState = {
  error?: string
  success?: boolean
} | null

// Server action to fetch menu data for a restaurant
export async function getMenuData(restaurantId: string) {
  const supabase = createClient()

  // Get the current user for auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in", data: null }
  }

  try {
    const { data: categoriesData, error } = await supabase
      .from("menu_categories")
      .select(`
        *,
        menu_items (*)
      `)
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("display_order", { foreignTable: "menu_items", ascending: true })

    if (error) throw error

    const processedCategories =
      categoriesData?.map((category) => ({
        ...category,
        menu_items: category.menu_items || [], // Ensure menu_items is always an array
      })) || []

    return { data: processedCategories, error: null }
  } catch (error) {
    console.error("Error fetching menu data:", error)
    return { error: "Failed to fetch menu data", data: null }
  }
}

// Server action to fetch templates
export async function getTemplates(restaurantCategory: string) {
  const supabase = createClient()

  // Get the current user for auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in", data: null }
  }

  try {
    // Fetch templates that match the restaurant category or are universal
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .in("category", [restaurantCategory, "both"])
      .eq("is_active", true)
      .order("name")

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error fetching templates:", error)
    return { error: "Failed to fetch templates", data: null }
  }
}

// Server action to fetch restaurant and published menus for dashboard
export async function getDashboardData() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in", data: null }
  }

  try {
    // Fetch restaurant data
    const { data: restaurantData, error: restaurantError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (restaurantError || !restaurantData) {
      return { error: "Restaurant not found", data: null, redirectTo: "/onboarding" }
    }

    // Fetch published menus
    const { data: menusData, error: menusError } = await supabase
      .from("published_menus")
      .select("*")
      .eq("restaurant_id", restaurantData.id)
      .order("created_at", { ascending: false })

    if (menusError) {
      console.error("Error fetching published menus:", menusError)
    }

    // Get total menu items count for the restaurant (approximation for all menus)
    const { count: totalMenuItems } = await supabase
      .from("menu_items")
      .select("*", { count: 'exact', head: true })
      .eq("restaurant_id", restaurantData.id)
      .eq("is_available", true)

    // Add estimated item count to each menu (since we can't track items per published menu)
    const menusWithCounts = (menusData || []).map(menu => ({
      ...menu,
      _count: {
        menu_items: Math.floor((totalMenuItems || 0) / Math.max(1, menusData?.length || 1))
      }
    }))

    return {
      data: {
        restaurant: restaurantData,
        publishedMenus: menusWithCounts,
        user,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return { error: "Failed to fetch dashboard data", data: null }
  }
}

export async function getMenuDataForTemplate(restaurantId: string) {
  if (!restaurantId) {
    console.error('getMenuDataForTemplate: restaurantId is required');
    return null;
  }
  
  const supabase = createClient();

  try {
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select(
        `
        *,
        categories:menu_categories (
          *,
          menu_items (
            *
          )
        )
      `
      )
      .eq('id', restaurantId)
      .single();

    if (error) {
      console.error(`Error fetching menu data for template (restaurantId: ${restaurantId}):`, error);
      throw error;
    }
    
    if (!restaurant) {
      return null;
    }

    // Sort categories and menu items by display_order
    const sortedCategories = restaurant.categories
      .map(category => ({
        ...category,
        menu_items: category.menu_items.sort((a, b) => a.display_order - b.display_order),
      }))
      .sort((a, b) => a.display_order - b.display_order);
      
    return { ...restaurant, categories: sortedCategories };

  } catch (error) {
    console.error('Unexpected error in getMenuDataForTemplate:', error);
    return null;
  }
}

export async function addMenuItem(prevState: MenuItemFormState, formData: FormData): Promise<MenuItemFormState> {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  // Extract form data
  const restaurantId = formData.get("restaurantId") as string
  const categoryId = formData.get("categoryId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = formData.get("price") as string
  const isAvailable = formData.get("is_available") === "on"
  const isFeatured = formData.get("is_featured") === "on"
  const imageFile = formData.get("image") as File

  // Validate required fields
  if (!name || !restaurantId || !categoryId) {
    return { error: "Name is required" }
  }

  try {
    let imageUrl: string | null = null

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return { error: "Please upload an image file" }
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        return { error: "Image must be less than 5MB" }
      }

      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${restaurantId}/menu-items/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(fileName, imageFile)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return { error: "Failed to upload image" }
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("restaurant-logos").getPublicUrl(uploadData.path)

      imageUrl = publicUrl
    }

    // Get the next display order
    const { data: lastItem } = await supabase
      .from("menu_items")
      .select("display_order")
      .eq("category_id", categoryId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    const displayOrder = (lastItem?.display_order || 0) + 1

    // Insert the menu item
    const { error: insertError } = await supabase.from("menu_items").insert({
      restaurant_id: restaurantId,
      category_id: categoryId,
      name,
      description: description || null,
      price: price ? Number.parseFloat(price) : null,
      image_url: imageUrl,
      is_available: isAvailable,
      is_featured: isFeatured,
      display_order: displayOrder,
    })

    if (insertError) {
      console.error("Insert error:", insertError)
      return { error: "Failed to add menu item" }
    }

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function updateMenuItem(prevState: MenuItemFormState, formData: FormData): Promise<MenuItemFormState> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  const itemId = formData.get("itemId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = formData.get("price") as string
  const isAvailable = formData.get("is_available") === "on"
  const isFeatured = formData.get("is_featured") === "on"
  const imageFile = formData.get("image") as File

  if (!name || !itemId) {
    return { error: "Name is required" }
  }

  try {
    let imageUrl: string | undefined

    // Handle image upload if new image provided
    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return { error: "Please upload an image file" }
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        return { error: "Image must be less than 5MB" }
      }

      const fileExt = imageFile.name.split(".").pop()
      const fileName = `menu-items/${itemId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(fileName, imageFile)

      if (uploadError) {
        return { error: "Failed to upload image" }
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("restaurant-logos").getPublicUrl(uploadData.path)

      imageUrl = publicUrl
    }

    // Update the menu item
    const updateData: any = {
      name,
      description: description || null,
      price: price ? Number.parseFloat(price) : null,
      is_available: isAvailable,
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    }

    if (imageUrl) {
      updateData.image_url = imageUrl
    }

    const { error: updateError } = await supabase.from("menu_items").update(updateData).eq("id", itemId)

    if (updateError) {
      console.error("Update error:", updateError)
      return { error: "Failed to update menu item" }
    }

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function deleteMenuItem(itemId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  try {
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId)

    if (error) {
      console.error("Delete error:", error)
      return { error: "Failed to delete item" }
    }

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function uploadCategoryBackgroundImage(
  prevState: { url?: string; error?: string } | null,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  const categoryId = formData.get("categoryId") as string
  const file = formData.get("file") as File

  if (!categoryId || !file) {
    return { error: "Category ID and file are required" }
  }

  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      return { error: "Please upload an image file" }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: "Image must be less than 5MB" }
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `templates/category-backgrounds/${categoryId}-bg-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("restaurant-logos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: "Failed to upload image. Please try again." }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("restaurant-logos").getPublicUrl(uploadData.path)

    // Update category background image
    const { error: updateError } = await supabase
      .from("menu_categories")
      .update({ background_image_url: publicUrl })
      .eq("id", categoryId)

    if (updateError) {
      console.error("Update error:", updateError)
      return { error: "Failed to update category background" }
    }

    revalidatePath("/menu-editor")
    return { url: publicUrl }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

/**
 * Check if user can publish more menus based on their plan
 */
export async function canPublishMenu(restaurantId: string) {
  const supabase = createClient()
  
  try {
    // Update restaurant plan first (in case payment status changed)
    await supabase.rpc('update_restaurant_plan', { restaurant_uuid: restaurantId })
    
    // Get restaurant plan info
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('plan_type, max_menus')
      .eq('id', restaurantId)
      .single()
    
    if (restaurantError) throw restaurantError
    
    // Count current primary menus
    const { count: currentMenus, error: countError } = await supabase
      .from('published_menus')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('is_primary_version', true)
    
    if (countError) throw countError
    
    const canPublish = (currentMenus || 0) < (restaurant.max_menus || 0)
    
    return {
      success: true,
      canPublish,
      currentMenus: currentMenus || 0,
      maxMenus: restaurant.max_menus || 0,
      planType: restaurant.plan_type || 'free'
    }
  } catch (error) {
    console.error('Error checking menu limits:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check menu limits',
      canPublish: false,
      currentMenus: 0,
      maxMenus: 0,
      planType: 'free'
    }
  }
}

/**
 * Get user's plan information and limits
 */
export async function getUserPlanInfo(userId: string) {
  const supabase = createClient()
  
  try {
    // Get user's restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, plan_type, max_menus')
      .eq('user_id', userId)
      .single()
    
    if (restaurantError) throw restaurantError
    
    // Update plan based on latest payments
    await supabase.rpc('update_restaurant_plan', { restaurant_uuid: restaurant.id })
    
    // Get updated restaurant info
    const { data: updatedRestaurant, error: updateError } = await supabase
      .from('restaurants')
      .select('plan_type, max_menus')
      .eq('id', restaurant.id)
      .single()
    
    if (updateError) throw updateError
    
    // Count current menus
    const { count: currentMenus, error: countError } = await supabase
      .from('published_menus')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .eq('is_primary_version', true)
    
    if (countError) throw countError
    
    return {
      success: true,
      planType: updatedRestaurant.plan_type || 'free',
      maxMenus: updatedRestaurant.max_menus || 0,
      currentMenus: currentMenus || 0,
      canPublish: (currentMenus || 0) < (updatedRestaurant.max_menus || 0)
    }
  } catch (error) {
    console.error('Error getting plan info:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get plan info',
      planType: 'free',
      maxMenus: 0,
      currentMenus: 0,
      canPublish: false
    }
  }
}

/**
 * Create menu version (for translations)
 */
export async function createMenuVersion(
  parentMenuId: string,
  languageCode: string,
  versionName: string,
  pdfUrl: string
) {
  const supabase = createClient()
  
  try {
    // Get parent menu info
    const { data: parentMenu, error: parentError } = await supabase
      .from('published_menus')
      .select('restaurant_id, menu_name')
      .eq('id', parentMenuId)
      .single()
    
    if (parentError) throw parentError
    
    // Create version
    const { data: menuVersion, error: versionError } = await supabase
      .from('published_menus')
      .insert({
        restaurant_id: parentMenu.restaurant_id,
        menu_name: `${parentMenu.menu_name} - ${versionName}`,
        pdf_url: pdfUrl,
        language_code: languageCode,
        version_name: versionName,
        parent_menu_id: parentMenuId,
        is_primary_version: false
      })
      .select()
      .single()
    
    if (versionError) throw versionError
    
    return {
      success: true,
      menuVersion
    }
  } catch (error) {
    console.error('Error creating menu version:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create menu version'
    }
  }
}

/**
 * Get all versions of a menu
 */
export async function getMenuVersions(restaurantId: string) {
  const supabase = createClient()
  
  try {
    const { data: menus, error } = await supabase
      .from('published_menus')
      .select(`
        id,
        menu_name,
        pdf_url,
        language_code,
        version_name,
        parent_menu_id,
        is_primary_version,
        created_at
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Group by primary menu
    const groupedMenus = menus?.reduce((acc, menu) => {
      const primaryId = menu.is_primary_version ? menu.id : menu.parent_menu_id
      if (!acc[primaryId!]) {
        acc[primaryId!] = {
          primary: null,
          versions: []
        }
      }
      
      if (menu.is_primary_version) {
        acc[primaryId!].primary = menu
      } else {
        acc[primaryId!].versions.push(menu)
      }
      
      return acc
    }, {} as Record<string, { primary: any, versions: any[] }>)
    
    return {
      success: true,
      groupedMenus: groupedMenus || {},
      allMenus: menus || []
    }
  } catch (error) {
    console.error('Error getting menu versions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get menu versions',
      groupedMenus: {},
      allMenus: []
    }
  }
}
