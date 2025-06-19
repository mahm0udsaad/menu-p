"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function quickUpdateCategory(categoryId: string, field: string, value: string | null) {
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

    const { error } = await supabase.from("menu_categories").update(updateData).eq("id", categoryId)

    if (error) throw error

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Error updating category:", error)
    return { error: "Failed to update category" }
  }
}

export async function quickDeleteCategory(categoryId: string) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in" }
  }

  try {
    // First delete all menu items in this category
    const { error: itemsError } = await supabase.from("menu_items").delete().eq("category_id", categoryId)

    if (itemsError) throw itemsError

    // Then delete the category
    const { error: categoryError } = await supabase.from("menu_categories").delete().eq("id", categoryId)

    if (categoryError) throw categoryError

    revalidatePath("/menu-editor")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: "Failed to delete category" }
  }
}

export async function quickAddCategory(restaurantId: string, name: string) {
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
    const { data: lastCategory } = await supabase
      .from("menu_categories")
      .select("display_order")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    const displayOrder = (lastCategory?.display_order || 0) + 1

    const { data, error } = await supabase
      .from("menu_categories")
      .insert({
        restaurant_id: restaurantId,
        name,
        description: null,
        display_order: displayOrder,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/menu-editor")
    return { success: true, category: data }
  } catch (error) {
    console.error("Error adding category:", error)
    return { error: "Failed to add category" }
  }
}
