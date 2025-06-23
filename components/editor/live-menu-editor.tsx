"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, FileText, Loader2, Eye, CheckCircle, QrCode, ExternalLink } from "lucide-react" // Added new icons
import { supabase } from "@/lib/supabase/client"
import ProfessionalCafeMenuPreview from "./professional-cafe-menu-preview"
import { generateAndSaveMenuPdf } from "@/lib/actions/pdf-actions"
import { useRouter } from "next/navigation"
import { pdf } from "@react-pdf/renderer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import NotificationModal from "@/components/ui/notification-modal"
import dynamic from "next/dynamic"
import PaymentForPublishModal from '@/components/ui/payment-for-publish-modal'
import { usePaymentStatus } from '@/lib/hooks/use-payment-status'

const PdfPreviewModal = dynamic(() => import("@/components/pdf-preview-modal"), {
  loading: () => <div className="h-96 bg-slate-800 rounded-lg animate-pulse"></div>,
  ssr: false
})

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
  background_image_url: string | null
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
  }
}

interface LiveMenuEditorProps {
  restaurant: Restaurant
  initialMenuData?: MenuCategory[]
}

export default function LiveMenuEditor({ restaurant, initialMenuData = [] }: LiveMenuEditorProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialMenuData)
  const [loading, setLoading] = useState(!initialMenuData.length)
  const [refreshing, setRefreshing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [publishResult, setPublishResult] = useState<{ pdfUrl?: string; menuId?: string } | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const router = useRouter()

  // Use optimized payment status hook
  const { hasPaidPlan, loading: paymentLoading, refetch: refetchPaymentStatus } = usePaymentStatus()

  // Notification modal state
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    description: string
  }>({
    show: false,
    type: "info",
    title: "",
    description: ""
  })

  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    setNotification({ show: true, type, title, description })
  }

  // Auto-publish if redirected after payment and refresh payment status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auto_publish') === 'true') {
      console.log('🔄 Auto-publish detected, refreshing payment status...')
      
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname)
      
      // Force refresh payment status first
      refetchPaymentStatus()
      
      // Auto-publish when payment status is loaded and user has paid
      if (!paymentLoading && hasPaidPlan) {
        console.log('✅ User has paid plan, auto-publishing menu...')
        setTimeout(() => {
          handlePublishMenu()
        }, 1000) // Small delay to ensure UI updates
      }
    }
  }, [hasPaidPlan, paymentLoading, refetchPaymentStatus])

  // Additional effect to handle when payment status becomes available after auto_publish
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auto_publish') === 'true' && !paymentLoading && hasPaidPlan) {
      console.log('✅ Payment status updated - user has paid plan, proceeding with auto-publish')
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      // Auto-publish
      setTimeout(() => {
        handlePublishMenu()
      }, 1000)
    }
  }, [hasPaidPlan])

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialMenuData.length) {
      fetchMenuData()
    }
  }, [restaurant.id, initialMenuData.length])

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
    // Check if user has paid plan
    if (!hasPaidPlan) {
      setShowPaymentModal(true)
      return
    }

    setIsPublishing(true)
    try {
      const { CafeMenuPDF } = await import("@/components/pdf/cafe-menu-pdf")
      
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
      
      // Ensure categories have proper structure
      const categoriesForPdf = categories.map(cat => ({
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
      
      const pdfBlob = await pdf(
        <CafeMenuPDF 
          restaurant={restaurantForPdf} 
          categories={categoriesForPdf} 
        />
      ).toBlob()

      const formData = new FormData()
      formData.append("pdfFile", pdfBlob, "menu.pdf")
      formData.append("restaurantId", restaurant.id)
      formData.append("menuName", `Menu - ${new Date().toLocaleDateString()}`)

      const result = await generateAndSaveMenuPdf(null, formData)

      if (result.pdfUrl && result.menuId) {
        setPublishResult(result)
        setShowSuccessDialog(true)
      } else {
        showNotification("error", "فشل في نشر القائمة", result.error || "حدث خطأ غير متوقع أثناء نشر القائمة")
      }
    } catch (error: any) {
      console.error("Publishing error:", error)
      showNotification("error", "خطأ في النشر", `حدث خطأ أثناء نشر القائمة: ${error.message}`)
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePdfPreview = () => {
    // Check if user has paid plan
    if (!hasPaidPlan) {
      setShowPaymentModal(true)
      return
    }
    
    setShowPdfPreviewModal(true)
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
    <>
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
              onClick={handlePdfPreview}
              size="sm"
              className={`border-slate-600 ${!hasPaidPlan && !paymentLoading ? 'opacity-75' : ''}`}
              title={!hasPaidPlan && !paymentLoading ? 'يتطلب اشتراك مدفوع' : paymentLoading ? 'جاري التحقق من حالة الاشتراك...' : ''}
              disabled={paymentLoading}
            >
              {paymentLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />}
              معاينة PDF
              {!hasPaidPlan && !paymentLoading && <span className="text-yellow-400 ml-1">👑</span>}
            </Button>
            <Button
              onClick={handlePublishMenu}
              disabled={isPublishing || categories.length === 0 || paymentLoading}
              size="sm"
              className={`bg-emerald-600 hover:bg-emerald-700 ${!hasPaidPlan && !paymentLoading ? 'opacity-75' : ''}`}
              title={!hasPaidPlan && !paymentLoading ? 'يتطلب اشتراك مدفوع' : paymentLoading ? 'جاري التحقق من حالة الاشتراك...' : ''}
            >
              {isPublishing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : paymentLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}
              {isPublishing ? "جاري النشر..." : paymentLoading ? "جاري التحقق..." : "نشر القائمة"}
              {!hasPaidPlan && !paymentLoading && <span className="text-yellow-400 ml-1">👑</span>}
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

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        title={notification.title}
        description={notification.description}
        type={notification.type}
      />

      {/* Payment for Publish Modal */}
      <PaymentForPublishModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        restaurantId={restaurant.id}
        currentPath={typeof window !== 'undefined' ? window.location.pathname : '/menu-editor'}
      />
    </>
  )
}
