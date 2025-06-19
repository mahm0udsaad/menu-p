"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { jsPDF } from "jspdf"
import qrcode from "qrcode" // npm package for server-side QR generation

interface GenerateQrCardPdfState {
  pdfUrl?: string
  error?: string
}

export async function generateQrCardPdf(
  prevState: GenerateQrCardPdfState | null,
  formData: FormData,
): Promise<GenerateQrCardPdfState> {
  const restaurantName = formData.get("restaurantName")?.toString() || "مطعمك"
  const restaurantLogoUrl = formData.get("restaurantLogoUrl")?.toString()
  const qrCodeUrl = formData.get("qrCodeUrl")?.toString() || "https://menu-p.com" // Fallback
  const customText = formData.get("customText")?.toString() || "امسح الكود لعرض قائمتنا الرقمية!"
  const cardBgColor = formData.get("cardBgColor")?.toString() || "#FFFFFF" // New: Card background color
  const textColor = formData.get("textColor")?.toString() || "#000000" // New: Text color
  const qrCodeSize = Number.parseInt(formData.get("qrCodeSize")?.toString() || "200") // New: QR code size in pixels
  const showBorder = formData.get("showBorder") === "on" // New: Show border
  const borderColor = formData.get("borderColor")?.toString() || "#000000" // New: Border color
  const logoPosition = formData.get("logoPosition")?.toString() || "top" // New: Logo position

  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated." }
  }

  try {
    // 1. Generate QR code as a data URL (plain, no logo embedded here)
    const qrCodeDataUrl = await qrcode.toDataURL(qrCodeUrl, {
      errorCorrectionLevel: "H", // High error correction for potential logo overlay
      margin: 1,
      width: qrCodeSize, // Use dynamic QR code size
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 150], // Custom format for a card-like size (e.g., 100mm x 150mm)
    })

    // Set card background
    doc.setFillColor(cardBgColor)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F")

    // Set font for Arabic text
    doc.setFont("helvetica", "normal")
    doc.setTextColor(textColor) // Set text color

    let yPosition = 10 // Initial Y position

    // Restaurant Logo (if available and position is 'top' or 'both')
    if (restaurantLogoUrl && (logoPosition === "top" || logoPosition === "both")) {
      try {
        const logoResponse = await fetch(restaurantLogoUrl)
        const logoBlob = await logoResponse.blob()
        const logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(logoBlob)
        })
        // Add logo to PDF
        doc.addImage(logoDataUrl, "PNG", (doc.internal.pageSize.getWidth() - 30) / 2, yPosition, 30, 30) // Centered, 30x30mm
        yPosition += 35 // Space after logo
      } catch (logoError) {
        console.warn("Failed to add restaurant logo to PDF (top position):", logoError)
        // Continue without logo if fetch fails
      }
    }

    // Restaurant Name
    doc.setFontSize(16)
    doc.text(restaurantName, doc.internal.pageSize.getWidth() / 2, yPosition, { align: "center" })
    yPosition += 8

    // Custom Text
    doc.setFontSize(10)
    const splitCustomText = doc.splitTextToSize(customText, doc.internal.pageSize.getWidth() - 20) // Wrap text
    doc.text(splitCustomText, doc.internal.pageSize.getWidth() / 2, yPosition, { align: "center" })
    yPosition += splitCustomText.length * 5 + 10 // Adjust line height and add space

    // QR Code
    const qrCodeDisplaySize = 50 // Fixed display size in mm for PDF, QR code image will scale
    const qrCodeX = (doc.internal.pageSize.getWidth() - qrCodeDisplaySize) / 2
    const qrCodeY = yPosition
    doc.addImage(qrCodeDataUrl, "PNG", qrCodeX, qrCodeY, qrCodeDisplaySize, qrCodeDisplaySize) // 50x50mm QR code
    yPosition += qrCodeDisplaySize + 5 // Space after QR code

    // Restaurant Logo (if available and position is 'middle' or 'both' - drawn over QR)
    if (restaurantLogoUrl && (logoPosition === "middle" || logoPosition === "both")) {
      try {
        const logoResponse = await fetch(restaurantLogoUrl)
        const logoBlob = await logoResponse.blob()
        const logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(logoBlob)
        })
        // Calculate center of QR code for logo placement
        const logoOverlaySize = 20 // Smaller size for overlay logo
        const logoOverlayX = qrCodeX + (qrCodeDisplaySize - logoOverlaySize) / 2
        const logoOverlayY = qrCodeY + (qrCodeDisplaySize - logoOverlaySize) / 2
        doc.addImage(logoDataUrl, "PNG", logoOverlayX, logoOverlayY, logoOverlaySize, logoOverlaySize)
      } catch (logoError) {
        console.warn("Failed to add restaurant logo to PDF (middle position):", logoError)
      }
    }

    // Footer text (e.g., "Scan to view menu")
    doc.setFontSize(8)
    doc.text("امسح الكود لعرض القائمة", doc.internal.pageSize.getWidth() / 2, yPosition, { align: "center" })
    yPosition += 5

    doc.text("Powered by Menu-p.com", doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, {
      align: "center",
    })

    // Add border if requested
    if (showBorder) {
      doc.setDrawColor(borderColor)
      doc.setLineWidth(1)
      doc.rect(5, 5, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10, "S") // Draw border
    }

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    // Upload PDF to Supabase Storage
    const filePath = `${user.id}/qr_cards/${Date.now()}_qr_card.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("restaurant-logos") // Using the same bucket, consider a new one if needed
      .upload(filePath, pdfBuffer, {
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

    revalidatePath("/dashboard") // Revalidate dashboard to show new QR card if listed
    return { pdfUrl: publicUrl }
  } catch (error: any) {
    console.error("QR Card PDF Generation Error:", error)
    return { error: `An unexpected error occurred during QR card generation: ${error.message}` }
  }
}
