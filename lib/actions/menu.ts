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
