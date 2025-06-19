"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
}

export async function generateAndSaveMenuPdf(
  prevState: any,
  formData: FormData,
): Promise<{ pdfUrl?: string; error?: string; menuId?: string }> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated." }
  }

  const pdfFile = formData.get("pdfFile") as File
  const restaurantId = formData.get("restaurantId") as string
  const menuName = formData.get("menuName")?.toString() || "Current Menu"

  if (!pdfFile || pdfFile.size === 0) {
    return { error: "No PDF file provided." }
  }
  if (!restaurantId) {
    return { error: "Restaurant ID is missing." }
  }

  try {
    // Upload PDF to Supabase Storage
    const filePath = `${restaurantId}/menus/${Date.now()}_${menuName.replace(/\s+/g, "_")}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("restaurant-logos")
      .upload(filePath, pdfFile, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("PDF Upload Error:", uploadError)
      return { error: `Failed to upload PDF: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("restaurant-logos").getPublicUrl(uploadData.path)

    // Save PDF info to published_menus table
    const { data: publishedMenu, error: dbError } = await supabase
      .from("published_menus")
      .insert({
        restaurant_id: restaurantId,
        menu_name: menuName,
        pdf_url: publicUrl,
      })
      .select("id")
      .single()

    if (dbError) {
      console.error("DB Insert Error:", dbError)
      // Attempt to delete uploaded PDF if DB insert fails
      await supabase.storage.from("restaurant-logos").remove([filePath])
      return { error: `Failed to save menu details: ${dbError.message}` }
    }

    revalidatePath("/dashboard")
    return { pdfUrl: publicUrl, menuId: publishedMenu?.id }
  } catch (error: any) {
    console.error("PDF Save Action Error:", error)
    return { error: `An unexpected error occurred: ${error.message}` }
  }
}
