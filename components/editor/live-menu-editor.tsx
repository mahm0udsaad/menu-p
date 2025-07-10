"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, FileText, Loader2, Eye, CheckCircle, QrCode, ExternalLink, Languages } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import ProfessionalCafeMenuPreview from "./professional-cafe-menu-preview-refactored"
import { generateAndSaveMenuPdf } from "@/lib/actions/pdf-actions"
import { useRouter } from "next/navigation"
import { pdf } from "@react-pdf/renderer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import PaymentForPublishModal from '@/components/ui/payment-for-publish-modal'
import { usePaymentStatus } from '@/lib/hooks/use-payment-status'
import MenuTranslationDrawer from "@/components/menu-translation-drawer"
import { useToast } from "@/hooks/use-toast"
import { SUPPORTED_LANGUAGES } from "@/lib/utils/translation-constants"
import { useMenuEditor } from "@/contexts/menu-editor-context"

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
  display_order?: number
  category_id?: string
  created_at?: string
  updated_at?: string
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
  
  const router = useRouter()
  const { hasPaidPlan, loading: paymentLoading, refetch: refetchPaymentStatus } = usePaymentStatus()
  const { toast } = useToast()
  const { appliedFontSettings, appliedPageBackgroundSettings, appliedRowStyles } = useMenuEditor()
  
  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    toast({
      title,
      description,
      variant: type === "error" ? "destructive" : "default",
    })
  }

  // Auto-publish effect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auto_publish') === 'true' && !paymentLoading && hasPaidPlan) {
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => handlePublishMenu(), 1000)
    }
  }, [hasPaidPlan, paymentLoading])

  useEffect(() => {
    if (!initialMenuData.length) {
      fetchMenuData()
    }
  }, [restaurant.id, initialMenuData.length])

  const fetchMenuData = async () => {
    try {
      setLoading(true)
      const { data: categoriesData, error } = await supabase
        .from("menu_categories")
        .select(`*, menu_items (*)`)
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("display_order", { foreignTable: "menu_items", ascending: true })

      if (error) throw error
      const processedCategories = categoriesData?.map((category) => ({
        ...category,
        menu_items: category.menu_items || [],
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

  // Fetch plan info
  useEffect(() => {
    const fetchPlanInfo = async () => {
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
      }
    }
    fetchPlanInfo()
  }, [restaurant.id])

  const handleTranslationComplete = (translatedCategories: MenuCategory[], targetLanguage: string) => {
    const targetLangName = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name || targetLanguage
    
    setMenuVersions(prev => ({
      ...prev,
      ar: prev.ar || { categories: categories },
      [targetLanguage]: { categories: translatedCategories }
    }))
    
    setActiveVersion(targetLanguage)
    setCategories(translatedCategories)
    setShowTranslationDrawer(false)
    
    showNotification("success", "تمت الترجمة بنجاح", `تمت ترجمة القائمة إلى ${targetLangName} بنجاح!`)
  }

  const handleVersionSwitch = (languageCode: string) => {
    setActiveVersion(languageCode)
    const version = menuVersions[languageCode]
    if (version) {
      setCategories(version.categories)
    }
  }

  const handlePublishMenu = async () => {
    if (!hasPaidPlan) {
      setShowPaymentModal(true)
      return
    }

    setIsPublishing(true)
    try {
      const { CafeMenuPDF } = await import("@/components/pdf/cafe-menu-pdf")
      
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

      const languagesToPublish = [
        { code: 'ar', categories: menuVersions.ar?.categories || categories, isPrimary: true },
        ...Object.entries(menuVersions)
          .filter(([code]) => code !== 'ar')
          .map(([code, version]) => ({ code, categories: version.categories, isPrimary: false }))
      ]

      for (const { code, categories: langCategories, isPrimary } of languagesToPublish) {
        try {
          // Convert categories to match PDF component types - filter out items without price
          const categoriesForPdf = langCategories.map(cat => ({
            ...cat,
            background_image_url: cat.background_image_url || undefined,
            menu_items: cat.menu_items
              .filter(item => item.price !== null && item.is_available)
              .map(item => ({
                ...item,
                description: item.description || undefined,
                price: item.price!
              }))
          }))
          
          const pdfBlob = await pdf(
            <CafeMenuPDF 
              restaurant={restaurantForPdf} 
              categories={categoriesForPdf}
              appliedFontSettings={appliedFontSettings}
              appliedPageBackgroundSettings={appliedPageBackgroundSettings}
              appliedRowStyles={appliedRowStyles}
            />
          ).toBlob()

          const formData = new FormData()
          formData.append("pdfFile", pdfBlob, `menu_${code}.pdf`)
          formData.append("restaurantId", restaurant.id)
          formData.append("menuName", menuName)
          formData.append("languageCode", code)
          
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
          throw new Error(`خطأ في نشر النسخة ${code}: ${langError.message}`)
        }
      }

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/70 backdrop-blur-sm border border-red-200 rounded-xl p-3 shadow-sm space-y-3 sm:space-y-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
            <div className="text-xs text-gray-500 hidden lg:flex items-center gap-3">
              <span>💡 اضغط للتعديل</span>
              <span>⭐ اضغط النجمة للمميز</span>
            </div>
            
            {/* Mobile Language Selection */}
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
                  {SUPPORTED_LANGUAGES.find(lang => lang.code === activeVersion)?.name || activeVersion}
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
              title={!hasPaidPlan && !paymentLoading ? 'يتطلب اشتراك مدفوع - معاينة PDF' : 'معاينة PDF'}
              disabled={paymentLoading}
            >
              {paymentLoading ? <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" /> : <Eye className="h-3 w-3 sm:mr-1" />}
              <span className="hidden lg:inline">معاينة PDF</span>
              {!hasPaidPlan && !paymentLoading && <span className="text-yellow-500 ml-1 hidden sm:inline">👑</span>}
            </Button>
            
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
              disabled={isPublishing || categories.length === 0 || paymentLoading || (planInfo ? !planInfo.canPublish && hasPaidPlan : false)}
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
                const versionName = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode)?.name || langCode
                
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
                    <span className="text-sm">{versionName}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Menu Preview */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ProfessionalCafeMenuPreview
            restaurant={restaurant}
            categories={categories}
            onRefresh={() => {}}
          />
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              تم نشر القائمة بنجاح
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">
              تم إنشاء ملف PDF للقائمة وحفظه بنجاح! يمكنك الآن:
            </p>
            <div className="space-y-2">
              {publishResult?.pdfUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(publishResult.pdfUrl, "_blank")}
                  className="w-full justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  عرض ملف PDF
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleDesignQRCard}
                className="w-full justify-start"
              >
                <QrCode className="h-4 w-4 mr-2" />
                تصميم بطاقة QR
              </Button>
              <Button
                onClick={handleViewPublishedMenus}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                عرض القوائم المنشورة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Modal */}
      {showPdfPreviewModal && (
        <PdfPreviewModal
          isOpen={showPdfPreviewModal}
          onClose={() => setShowPdfPreviewModal(false)}
          restaurant={restaurant}
          categories={categories}
          appliedFontSettings={appliedFontSettings}
          appliedPageBackgroundSettings={appliedPageBackgroundSettings}
          appliedRowStyles={appliedRowStyles}
        />
      )}

      {/* Payment Modal */}
      <PaymentForPublishModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        restaurantId={restaurant.id}
        currentPath="/menu-editor"
      />

      {/* Translation Drawer */}
      <MenuTranslationDrawer
        isOpen={showTranslationDrawer}
        onClose={() => setShowTranslationDrawer(false)}
        categories={categories.map(cat => ({
          ...cat,
          background_image_url: cat.background_image_url || null
        }))}
        onTranslationComplete={handleTranslationComplete}
      />
    </>
  )
} 