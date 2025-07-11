"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { PostgrestSingleResponse } from "@supabase/supabase-js"

export type MenuItemFormState = {
  error?: string
  success?: boolean
} | null

interface NewMenuItemData {
  name: string
  description: string | null
  price: number | null
}

export async function quickAddItem(
  categoryId: string, 
  restaurantId: string,
  itemData: NewMenuItemData
) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get the next display order
    const { data: lastItem }: PostgrestSingleResponse<{ display_order: number }> = await supabase
      .from("menu_items")
      .select("display_order")
      .eq("category_id", categoryId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    const displayOrder = (lastItem?.display_order || 0) + 1

    // Insert a new blank item
    const { data, error }: PostgrestSingleResponse<any> = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurantId,
        category_id: categoryId,
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        is_available: true,
        is_featured: false,
        display_order: displayOrder,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/menu-editor")
    return { success: true, item: data }
  } catch (error) {
    console.error("Error adding item:", error)
    return { error: "Failed to add item" }
  }
}

export async function updateMenuItemData(
  itemId: string,
  data: { name?: string; description?: string | null; price?: number | null },
) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  try {
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedItem, error }: PostgrestSingleResponse<any> = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", itemId)
      .select()
      .single()

    if (error) {
      console.error("Update error:", error)
      throw new Error("Failed to update item in database.")
    }

    revalidatePath("/menu-editor")
    return { success: true, item: updatedItem }
  } catch (error) {
    console.error("Unexpected error in updateMenuItemData:", error)
    return { error: "An unexpected error occurred while updating the item." }
  }
}

export async function quickUpdateItem(itemId: string, field: string, value: string | number | boolean) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  try {
    const updateData: any = {
      [field]: value,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("menu_items").update(updateData).eq("id", itemId)

    if (error) throw error

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Error updating item:", error)
    return { error: "Failed to update item" }
  }
}

export async function quickDeleteItem(itemId: string) {
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

    if (error) throw error

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { error: "Failed to delete item" }
  }
}

export async function reorderMenuItems(categoryId: string, itemIds: string[]) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  try {
    const updates = itemIds.map((id, index) =>
      supabase.from("menu_items").update({ display_order: index }).eq("id", id),
    )

    const results = await Promise.all(updates)
    const firstError = results.find((res) => res.error)

    if (firstError) {
      throw firstError.error
    }

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Reorder error:", error)
    return { error: "Failed to reorder items." }
  }
}
