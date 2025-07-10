"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { pdf } from "@react-pdf/renderer"
import { CafeMenuPDF } from "@/components/pdf/cafe-menu-pdf"
import { Loader2 } from "lucide-react"
import type { RowStyleSettings } from "@/contexts/menu-editor-context"

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
  background_image_url?: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  color_palette?: {
    id: string
    name: string
    primary: string
    secondary: string
    accent: string
  } | null
}

interface PdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  restaurant: Restaurant
  categories: MenuCategory[]
  appliedFontSettings?: {
    arabic: { font: string; weight: string }
    english: { font: string; weight: string }
  }
  appliedPageBackgroundSettings?: {
    backgroundColor: string
    backgroundImage: string | null
    backgroundType: 'solid' | 'image' | 'gradient'
    gradientFrom: string
    gradientTo: string
    gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
  }
  appliedRowStyles?: RowStyleSettings
}

export default function PdfPreviewModal({ 
  isOpen, 
  onClose, 
  restaurant, 
  categories, 
  appliedFontSettings, 
  appliedPageBackgroundSettings, 
  appliedRowStyles 
}: PdfPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add safety checks to prevent undefined errors
  if (!restaurant || !categories) {
    return null
  }

  // Filter out any invalid categories
  const validCategories = categories.filter(cat => 
    cat && 
    cat.id && 
    cat.name && 
    Array.isArray(cat.menu_items)
  )

  useEffect(() => {
    if (isOpen && validCategories.length > 0) {
      generatePdfPreview()
    }
    
    // Cleanup blob URL when modal closes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [isOpen, validCategories.length])

  const generatePdfPreview = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Ensure restaurant has all required properties for PDF generation
      const restaurantForPdf = {
        ...restaurant,
        logo_url: restaurant.logo_url || undefined,
        color_palette: restaurant.color_palette || {
          id: "emerald",
          name: "Emerald",
          primary: "#10b981",
          secondary: "#059669", 
          accent: "#34d399"
        }
      }
      
      // Ensure categories have proper structure for PDF
      const categoriesForPdf = validCategories.map(cat => ({
        ...cat,
        description: cat.description || undefined,
        background_image_url: cat.background_image_url || undefined,
        menu_items: cat.menu_items.map(item => ({
          ...item,
          description: item.description || undefined,
          price: item.price || 0,
          image_url: item.image_url || undefined
        }))
      }))
      
      // Generate PDF blob
      const blob = await pdf(
        <CafeMenuPDF 
          restaurant={restaurantForPdf} 
          categories={categoriesForPdf}
          appliedFontSettings={appliedFontSettings}
          appliedPageBackgroundSettings={appliedPageBackgroundSettings}
          appliedRowStyles={appliedRowStyles}
        />
      ).toBlob()
      
      // Create object URL for iframe
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err: any) {
      console.error('PDF generation error:', err)
      setError(err.message || 'Failed to generate PDF preview')
    } finally {
      setLoading(false)
    }
  }

  if (validCategories.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p>No valid menu categories available for preview</p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-slate-800 border-slate-700 text-white flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-white">معاينة القائمة PDF</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-400" />
                <p className="text-slate-300">جاري إنشاء معاينة PDF...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-400">
                <p>خطأ في إنشاء المعاينة: {error}</p>
                <button 
                  onClick={generatePdfPreview}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          )}
          
          {pdfUrl && !loading && !error && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none rounded-lg"
              title="PDF Preview"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}