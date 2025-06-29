"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export type RestaurantFormState = {
  error?: string
  success?: boolean
} | null

export async function createRestaurant(
  prevState: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to create a restaurant profile" }
  }

  // Extract form data
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const currency = formData.get("currency") as string
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string
  const logoFile = formData.get("logo") as File

  // Validate required fields
  if (!name || !category) {
    return { error: "Restaurant name and category are required" }
  }

  if (!["cafe", "restaurant", "both"].includes(category)) {
    return { error: "Invalid category selected" }
  }

  try {
    let logoUrl: string | null = null

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
      // Validate file type
      if (!logoFile.type.startsWith("image/")) {
        return { error: "Logo must be an image file" }
      }

      // Validate file size (5MB limit)
      if (logoFile.size > 5 * 1024 * 1024) {
        return { error: "Logo file size must be less than 5MB" }
      }

      // Create unique filename
      const fileExt = logoFile.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(fileName, logoFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return { error: "Failed to upload logo. Please try again." }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("restaurant-logos").getPublicUrl(uploadData.path)

      logoUrl = publicUrl
    }

    // Check if user already has a restaurant
    const { data: existingRestaurant } = await supabase.from("restaurants").select("id").eq("user_id", user.id).single()

    if (existingRestaurant) {
      // Update existing restaurant
      const { error: updateError } = await supabase
        .from("restaurants")
        .update({
          name,
          category,
          currency: currency || 'EGP',
          address: address || null,
          phone: phone || null,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Update error:", updateError)
        return { error: "Failed to update restaurant profile" }
      }
    } else {
      // Create new restaurant
      const { error: insertError } = await supabase.from("restaurants").insert({
        user_id: user.id,
        name,
        category,
        currency: currency || 'EGP',
        address: address || null,
        phone: phone || null,
        logo_url: logoUrl,
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        return { error: "Failed to create restaurant profile" }
      }
    }

    // Revalidate and redirect
    revalidatePath("/dashboard")
    redirect("/dashboard")
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
