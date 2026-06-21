"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface GenerateQrCardPdfState {
  pdfUrl?: string
  cardId?: string
  error?: string
}

export async function generateAndSaveQrCardPdf(
  prevState: GenerateQrCardPdfState | null,
  formData: FormData,
): Promise<GenerateQrCardPdfState> {
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
  const cardName = formData.get("cardName")?.toString() || "QR Card"
  const qrCodeUrl = formData.get("qrCodeUrl")?.toString() || ""
  const customText = formData.get("customText")?.toString() || ""
  const cardOptions = formData.get("cardOptions")?.toString() || "{}"
  const menuId = formData.get("menuId")?.toString() || null

  if (!pdfFile || pdfFile.size === 0) {
    return { error: "No PDF file provided." }
  }
  if (!restaurantId) {
    return { error: "Restaurant ID is missing." }
  }
  if (!menuId) {
    return { error: "Published menu is missing." }
  }

  try {
    const [{ data: restaurant }, { data: publishedMenu }] = await Promise.all([
      supabase
        .from("restaurants")
        .select("id")
        .eq("id", restaurantId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("published_menus")
        .select("id, restaurant_id")
        .eq("id", menuId)
        .eq("restaurant_id", restaurantId)
        .single(),
    ])

    if (!restaurant || !publishedMenu) {
      return { error: "The selected published menu could not be verified." }
    }

    try {
      const parsedQrUrl = new URL(qrCodeUrl)
      if (parsedQrUrl.pathname !== `/menus/${publishedMenu.id}`) {
        return { error: "The QR destination does not match the selected menu." }
      }
    } catch {
      return { error: "The QR destination URL is invalid." }
    }

    // Upload PDF to Supabase Storage
    const safeCardName = cardName.replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 80) || "QR_Card"
    const filePath = `${restaurantId}/qr_cards/${Date.now()}_${safeCardName}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("restaurant-logos") // Using the same bucket as menus
      .upload(filePath, pdfFile, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("QR Card PDF Upload Error:", uploadError)
      return { error: `Failed to upload QR card PDF: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("restaurant-logos").getPublicUrl(uploadData.path)

    // Parse card options and add menu ID
    let parsedCardOptions = {}
    try {
      parsedCardOptions = JSON.parse(cardOptions)
    } catch (e) {
      console.warn("Failed to parse card options, using empty object")
    }
    
    // Add menu ID to card options for tracking
    if (menuId) {
      parsedCardOptions = { ...parsedCardOptions, menuId }
    }

    // Save QR card info to published_qr_cards table
    const insertResult = await supabase
      .from("published_qr_cards")
      .insert({
        restaurant_id: restaurantId,
        card_name: cardName,
        pdf_url: publicUrl,
        qr_code_url: qrCodeUrl,
        custom_text: customText,
        card_options: parsedCardOptions
      })
      .select("id")
      .single()

    const { data: publishedCard, error: dbError } = insertResult

    if (dbError) {
      console.error("DB Insert Error:", dbError)
      // Attempt to delete uploaded PDF if DB insert fails
      await supabase.storage.from("restaurant-logos").remove([filePath])
      return { error: `Failed to save QR card details: ${dbError.message}` }
    }

    revalidatePath("/dashboard") // Revalidate dashboard to show new QR card
    return { pdfUrl: publicUrl, cardId: publishedCard?.id }
  } catch (error: any) {
    console.error("QR Card PDF Generation Error:", error)
    return { error: `An unexpected error occurred during QR card generation: ${error.message}` }
  }
}

// Add function to get published QR cards for dashboard
export async function getPublishedQrCards() {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated.", data: null }
  }

  try {
    // Get restaurant data
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (restaurantError || !restaurant) {
      return { error: "Restaurant not found", data: null }
    }

    // Fetch published QR cards
    const { data: qrCards, error: qrCardsError } = await supabase
      .from("published_qr_cards")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })

    if (qrCardsError) {
      console.error("Error fetching published QR cards:", qrCardsError)
      return { error: "Failed to fetch QR cards", data: null }
    }

    return { data: qrCards || [], error: null }
  } catch (error) {
    console.error("Error in getPublishedQrCards:", error)
    return { error: "Failed to fetch QR cards", data: null }
  }
}

// Add function to delete a QR card
export async function deleteQrCard(cardId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated." }
  }

  try {
    // Get the QR card to verify ownership and get file path
    const { data: qrCard, error: fetchError } = await supabase
      .from("published_qr_cards")
      .select(`
        pdf_url,
        restaurant_id
      `)
      .eq("id", cardId)
      .single()

    if (fetchError || !qrCard) {
      return { error: "QR card not found" }
    }

    // Get restaurant info to verify ownership
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("user_id")
      .eq("id", qrCard.restaurant_id)
      .single()

    if (restaurantError || !restaurant) {
      return { error: "Restaurant not found" }
    }

    // Verify ownership through restaurant
    if (restaurant.user_id !== user.id) {
      return { error: "Access denied" }
    }

    // Extract file path from URL for deletion
    const url = new URL(qrCard.pdf_url)
    const filePath = url.pathname.split('/').slice(-2).join('/') // Get last two parts of path

    // Delete from database
    const { error: deleteError } = await supabase
      .from("published_qr_cards")
      .delete()
      .eq("id", cardId)

    if (deleteError) {
      console.error("Error deleting QR card from database:", deleteError)
      return { error: "Failed to delete QR card" }
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from("restaurant-logos")
      .remove([filePath])

    if (storageError) {
      console.error("Error deleting QR card file:", storageError)
      // Note: We don't return error here since DB deletion succeeded
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteQrCard:", error)
    return { error: "Failed to delete QR card" }
  }
}
