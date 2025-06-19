"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type MenuItemFormState = {
  error?: string
  success?: boolean
} | null

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
