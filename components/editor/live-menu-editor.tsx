"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, FileText, Loader2, Eye, CheckCircle, QrCode, ExternalLink } from "lucide-react" // Added new icons
import { supabase } from "@/lib/supabase/client"
import ProfessionalCafeMenuPreview from "./professional-cafe-menu-preview"
import { generateAndSaveMenuPdf } from "@/lib/actions/pdf-actions"
import { useRouter } from "next/navigation"
import PdfPreviewModal from "@/components/pdf-preview-modal"
import { pdf } from "@react-pdf/renderer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

interface LiveMenuEditorProps {
  restaurant: Restaurant
}

export default function LiveMenuEditor({ restaurant }: LiveMenuEditorProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [publishResult, setPublishResult] = useState<{ pdfUrl?: string; menuId?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchMenuData()
  }, [restaurant.id])

  const fetchMenuData = async () => {
    try {
      setLoading(true)

      const { data: categoriesData, error } = await supabase
        .from("menu_categories")
        .select(
          `
          *,
          menu_items (*)
        `,
        )
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true }) // Order categories by their display_order
        .order("display_order", { foreignTable: "menu_items", ascending: true }) // Order embedded menu_items by their display_order

      if (error) throw error

      const processedCategories =
        categoriesData?.map((category) => ({
          ...category,
          menu_items: category.menu_items || [], // Ensure menu_items is always an array
        })) || []

      setCategories(processedCategories)
    } catch (error) {
      console.error("Error fetching menu data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMenuData()
    setRefreshing(false)
  }

  const handlePublishMenu = async () => {
    setIsPublishing(true)
    try {
      const { CafeMenuPDF } = await import("@/components/pdf/cafe-menu-pdf")
      const pdfBlob = await pdf(<CafeMenuPDF restaurant={restaurant} categories={categories} />).toBlob()

      const formData = new FormData()
      formData.append("pdfFile", pdfBlob, "menu.pdf")
      formData.append("restaurantId", restaurant.id)
      formData.append("menuName", `Menu - ${new Date().toLocaleDateString()}`)

      const result = await generateAndSaveMenuPdf(null, formData)

      if (result.pdfUrl && result.menuId) {
        setPublishResult(result)
        setShowSuccessDialog(true)
      } else {
        alert(`Failed to publish menu: ${result.error}`)
      }
    } catch (error: any) {
      console.error("Publishing error:", error)
      alert(`An error occurred during publishing: ${error.message}`)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDesignQRCard = () => {
    setShowSuccessDialog(false)
    router.push("/dashboard?tab=qr-cards")
  }

  const handleViewPublishedMenus = () => {
    setShowSuccessDialog(false)
    router.push("/dashboard?tab=published-menus")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your menu...</p>
        </div>
      </div>
    )
  }

  return (
<div className="space-y-4 h-full flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-slate-800/30 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white">محرر القائمة المباشر</h2>
          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>💡 اضغط للتعديل</span>
            <span>⭐ اضغط النجمة للمميز</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="border-slate-600"
          >
            {refreshing ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            تحديث
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPdfPreviewModal(true)}
            size="sm"
            className="border-slate-600 "
          >
            <Eye className="h-3 w-3 mr-1" />
            معاينة PDF
          </Button>
          <Button
            onClick={handlePublishMenu}
            disabled={isPublishing || categories.length === 0}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isPublishing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}
            {isPublishing ? "جاري النشر..." : "نشر القائمة"}
          </Button>
        </div>
      </div>

      {/* Interactive Preview - Full Height */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg flex-1 min-h-0">
      <div className="h-full overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg h-full">
            <ProfessionalCafeMenuPreview restaurant={restaurant} categories={categories} onRefresh={handleRefresh} />
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={showPdfPreviewModal}
        onClose={() => setShowPdfPreviewModal(false)}
        restaurant={restaurant}
        categories={categories}
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-emerald-800 text-center">
              تم نشر القائمة بنجاح! 🎉
            </DialogTitle>
            <p className="text-emerald-700 text-center">
              تم إنشاء قائمة PDF جديدة وحفظها بنجاح. يمكنك الآن إنشاء بطاقة QR لقائمتك.
            </p>
          </DialogHeader>
          
          <div className="space-y-3 mt-6">
            <Button
              onClick={handleDesignQRCard}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-200"
            >
              <QrCode className="mr-2 h-5 w-5" />
              تصميم الQR كارت
            </Button>
            
            <Button
              onClick={handleViewPublishedMenus}
              variant="outline"
              className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-4 rounded-xl"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              عرض القوائم المنشورة
            </Button>
            
            {publishResult?.pdfUrl && (
              <Button
                asChild
                variant="ghost"
                className="w-full text-emerald-600 hover:bg-emerald-50 py-4 rounded-xl"
              >
                <a href={publishResult.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  تحميل ملف PDF
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
