"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, FileText, Loader2, Eye, CheckCircle, QrCode, ExternalLink, Languages } from "lucide-react" // Added Languages icon
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
import MenuTranslationDrawer from "@/components/menu-translation-drawer" // Added translation drawer import
import { useToast } from "@/hooks/use-toast"

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
  const [showTranslationDrawer, setShowTranslationDrawer] = useState(false)
  const [translatedVersions, setTranslatedVersions] = useState<{ [language: string]: MenuCategory[] }>({})
  
  // New states for multi-version support
  const [menuVersions, setMenuVersions] = useState<{ [language: string]: { categories: MenuCategory[], pdfUrl?: string } }>({
    'ar': { categories: initialMenuData }
  })
  const [activeVersion, setActiveVersion] = useState<string>('ar')
  const [planInfo, setPlanInfo] = useState<{
    planType: string
    maxMenus: number
    currentMenus: number
    canPublish: boolean
  } | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  
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

  const { toast } = useToast()
  
  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    if (type === "success") {
      toast({
        title,
        description,
        variant: "default",
      })
    } else if (type === "error") {
      toast({
        title,
        description,
        variant: "destructive",
      })
    } else {
      toast({
        title,
        description,
        variant: "default",
      })
    }
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

  // Fetch plan information
  const fetchPlanInfo = async () => {
    setPlanLoading(true)
    try {
      const { canPublishMenu } = await import("@/lib/actions/menu")
      const result = await canPublishMenu(restaurant.id)
      
      if (result.success) {
        setPlanInfo({
          planType: result.planType,
          maxMenus: result.maxMenus,
          currentMenus: result.currentMenus,
          canPublish: result.canPublish
        })
      }
    } catch (error) {
      console.error("Error fetching plan info:", error)
    } finally {
      setPlanLoading(false)
    }
  }

  // Fetch plan info on mount
  useEffect(() => {
    fetchPlanInfo()
  }, [restaurant.id])

  // Updated translation handler to handle multiple languages with versions
  const handleTranslationComplete = (translatedCategories: MenuCategory[], targetLanguage: string) => {
    setMenuVersions(prev => ({
      ...prev,
      [targetLanguage]: {
        categories: translatedCategories,
        languageCode: targetLanguage
      }
    }))
    
    setShowTranslationDrawer(false)
    showNotification("success", "تمت الترجمة بنجاح", `تمت ترجمة القائمة إلى ${targetLanguage === 'en' ? 'الإنجليزية' : targetLanguage === 'fr' ? 'الفرنسية' : targetLanguage === 'es' ? 'الإسبانية' : targetLanguage}. يمكنك الآن معاينة النسخة المترجمة والنشر عند الاستعداد.`)
    
    // Switch to the newly translated version for preview
    setActiveVersion(targetLanguage)
      setCategories(translatedCategories)
  }

  // Handle version tab switch
  const handleVersionSwitch = (languageCode: string) => {
    setActiveVersion(languageCode)
    const version = menuVersions[languageCode]
    if (version) {
      setCategories(version.categories)
    }
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
      const { generateAndSaveMenuPdf } = await import("@/lib/actions/pdf-actions")
      
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
      
      const menuName = `Menu - ${new Date().toLocaleDateString()}`
      let primaryMenuId: string | null = null
      let publishResults: Array<{ pdfUrl: string; menuId: string; language: string }> = []

      // Publish all language versions
      const languagesToPublish = [
        { code: 'ar', categories: menuVersions.ar?.categories || categories, isPrimary: true },
        ...Object.entries(menuVersions)
          .filter(([code]) => code !== 'ar')
          .map(([code, version]) => ({ code, categories: version.categories, isPrimary: false }))
      ]

      for (const { code, categories: langCategories, isPrimary } of languagesToPublish) {
        try {
          // Create PDF blob for this language
      const pdfBlob = await pdf(
            <CafeMenuPDF restaurant={restaurantForPdf} categories={langCategories} />
      ).toBlob()

      // Create FormData and upload
      const formData = new FormData()
          formData.append("pdfFile", pdfBlob, `menu_${code}.pdf`)
      formData.append("restaurantId", restaurant.id)
          formData.append("menuName", menuName)
          formData.append("languageCode", code)
          
          // Add parent menu ID for non-primary versions
          if (!isPrimary && primaryMenuId) {
            formData.append("parentMenuId", primaryMenuId)
          }

      const result = await generateAndSaveMenuPdf(null, formData)

      if (result.pdfUrl && result.menuId) {
            if (isPrimary) {
              primaryMenuId = result.menuId
            }
            publishResults.push({
              pdfUrl: result.pdfUrl,
              menuId: result.menuId,
              language: code
            })
          } else {
            throw new Error(`Failed to publish ${code} version: ${result.error}`)
          }
        } catch (langError: any) {
          console.error(`Error publishing ${code} version:`, langError)
          throw new Error(`خطأ في نشر النسخة ${code === 'ar' ? 'العربية' : code === 'en' ? 'الإنجليزية' : code === 'fr' ? 'الفرنسية' : 'الإسبانية'}: ${langError.message}`)
        }
      }

      // Show success for all published versions
      const primaryResult = publishResults.find(r => r.language === 'ar')
      if (primaryResult) {
        setPublishResult({
          pdfUrl: primaryResult.pdfUrl,
          menuId: primaryResult.menuId
        })
        setShowSuccessDialog(true)
      }

      const languageCount = publishResults.length
      showNotification("success", "تم نشر القائمة بنجاح", 
        `تم نشر القائمة بـ ${languageCount} ${languageCount === 1 ? 'لغة' : 'لغات'} بنجاح!`)
      
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل قائمتك...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 h-full flex flex-col">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/70 backdrop-blur-sm border border-red-200 rounded-xl p-3 shadow-sm space-y-3 sm:space-y-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
            <div className="text-xs text-gray-500 hidden lg:flex items-center gap-3">
              <span>💡 اضغط للتعديل</span>
              <span>⭐ اضغط النجمة للمميز</span>
            </div>
            
            {/* Mobile Language Selection Button */}
            {Object.keys(menuVersions).length > 1 && (
              <div className="flex sm:hidden items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranslationDrawer(true)}
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 px-3 py-1 text-xs"
                >
                  <Languages className="h-3 w-3 mr-1" />
                  <span>{Object.keys(menuVersions).length} لغات</span>
                </Button>
                <span className="text-xs text-gray-500">
                  {activeVersion === 'ar' ? 'العربية' : 
                   activeVersion === 'en' ? 'English' :
                   activeVersion === 'fr' ? 'Français' :
                   activeVersion === 'es' ? 'Español' : activeVersion}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto overflow-x-auto">
            {/* Plan Info */}
            {planInfo && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-red-50 rounded-lg border border-red-200 flex-shrink-0">
                <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                  {planInfo.currentMenus}/{planInfo.maxMenus} قائمة
                </span>
                <span className="text-xs text-red-500 whitespace-nowrap">
                  ({planInfo.planType === 'basic' ? 'أساسي' : planInfo.planType === 'pro' ? 'احترافي' : 'مجاني'})
                </span>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
              className="border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 sm:px-3 transition-colors flex-shrink-0"
              title="تحديث"
            >
              {refreshing ? <RefreshCw className="h-3 w-3 sm:mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 sm:mr-1" />}
              <span className="hidden lg:inline">تحديث</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePdfPreview}
              size="sm"
              className={`border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 sm:px-3 transition-colors flex-shrink-0 ${!hasPaidPlan && !paymentLoading ? 'opacity-75' : ''}`}
              title={!hasPaidPlan && !paymentLoading ? 'يتطلب اشتراك مدفوع - معاينة PDF' : paymentLoading ? 'جاري التحقق من حالة الاشتراك...' : 'معاينة PDF'}
              disabled={paymentLoading}
            >
              {paymentLoading ? <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" /> : <Eye className="h-3 w-3 sm:mr-1" />}
              <span className="hidden lg:inline">معاينة PDF</span>
              {!hasPaidPlan && !paymentLoading && <span className="text-yellow-500 ml-1 hidden sm:inline">👑</span>}
            </Button>
            
            {/* Desktop Translation Button */}
            <Button
              variant="outline"
              onClick={() => setShowTranslationDrawer(true)}
              disabled={loading || categories.length === 0}
              size="sm"
              className="flex hover:bg-purple-50 border-purple-200 hover:text-purple-600 bg-purple-50 text-purple-600 px-2 sm:px-3 transition-colors flex-shrink-0"
              title="ترجمة القائمة بالذكاء الاصطناعي"
            >
              <Languages className="h-3 w-3 sm:mr-1" />
              <span className="hidden lg:inline">ترجمة AI</span>
              <span className="lg:hidden">ترجمة</span>
            </Button>
            
            <Button
              onClick={handlePublishMenu}
              disabled={isPublishing || categories.length === 0 || paymentLoading || (planInfo && !planInfo.canPublish && hasPaidPlan)}
              size="sm"
              className={`bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 transition-colors shadow-sm flex-shrink-0 ${!hasPaidPlan && !paymentLoading ? 'opacity-75' : ''} ${planInfo && !planInfo.canPublish && hasPaidPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                !hasPaidPlan && !paymentLoading ? 'يتطلب اشتراك مدفوع - نشر القائمة' : 
                paymentLoading ? 'جاري التحقق من حالة الاشتراك...' :
                planInfo && !planInfo.canPublish && hasPaidPlan ? `تم الوصول للحد الأقصى (${planInfo.currentMenus}/${planInfo.maxMenus})` :
                'نشر القائمة'
              }
            >
              {isPublishing ? <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" /> : paymentLoading ? <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" /> : <FileText className="h-3 w-3 sm:mr-1" />}
              <span>
                {isPublishing ? "جاري النشر..." : paymentLoading ? "جاري التحقق..." : "نشر القائمة"}
              </span>
              {!hasPaidPlan && !paymentLoading && <span className="text-yellow-400 ml-1 hidden sm:inline">👑</span>}
            </Button>
          </div>
        </div>

        {/* Desktop Version Tabs */}
        {Object.keys(menuVersions).length > 1 && (
          <div className="hidden sm:block bg-white/70 backdrop-blur-sm border border-red-200 rounded-xl p-1 shadow-sm">
            <div className="flex gap-1 overflow-x-auto">
              {Object.entries(menuVersions).map(([langCode, version]) => {
                const isActive = activeVersion === langCode
                const versionName = langCode === 'ar' ? 'العربية' :
                                 langCode === 'en' ? 'English' :
                                 langCode === 'fr' ? 'Français' :
                                 langCode === 'es' ? 'Español' : langCode
                
                return (
                  <Button
                    key={langCode}
                    onClick={() => handleVersionSwitch(langCode)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{versionName}</span>
                    {version.pdfUrl && (
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-1" title="تم نشر PDF" />
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Plan Limit Warning */}
        {planInfo && hasPaidPlan && !planInfo.canPublish && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-2 rounded-lg flex-shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  تم الوصول للحد الأقصى من القوائم
                </h3>
                <p className="text-gray-600 text-sm">
                  لقد استخدمت {planInfo.currentMenus} من {planInfo.maxMenus} قائمة مسموحة في خطة {planInfo.planType === 'basic' ? 'الأساسية' : 'الاحترافية'}.
                  قم بترقية خطتك لإنشاء المزيد من القوائم.
                </p>
              </div>
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                ترقية الخطة
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Preview - Full Height */}
        <div className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-xl flex-1 min-h-0 shadow-sm">
          <div className="h-full overflow-auto p-4">
            <div className="bg-white rounded-lg shadow-lg h-full border border-red-100">
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
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <DialogHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-red-800 text-center">
                تم نشر القائمة بنجاح! 🎉
              </DialogTitle>
              <p className="text-red-700 text-center">
                تم إنشاء قائمة PDF جديدة وحفظها بنجاح. يمكنك الآن إنشاء بطاقة QR لقائمتك.
              </p>
            </DialogHeader>
            
            <div className="space-y-3 mt-6">
              <Button
                onClick={handleDesignQRCard}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-200"
              >
                <QrCode className="mr-2 h-5 w-5" />
                تصميم الQR كارت
              </Button>
              
              <Button
                onClick={handleViewPublishedMenus}
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50 py-4 rounded-xl transition-colors"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                عرض القوائم المنشورة
              </Button>
              
              {publishResult?.pdfUrl && (
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-red-600 hover:bg-red-50 py-4 rounded-xl transition-colors"
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
        currentPath={typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/menu-editor'}
        currentTab={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || undefined : undefined}
        returnStep={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('step') || undefined : undefined}
      />

      {/* Translation Drawer */}
      <MenuTranslationDrawer
        isOpen={showTranslationDrawer}
        onClose={() => setShowTranslationDrawer(false)}
        categories={categories}
        onTranslationComplete={handleTranslationComplete}
      />
    </>
  )
}
