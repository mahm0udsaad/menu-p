"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, FileText, Loader2, Eye, CheckCircle, QrCode, ExternalLink, Languages, X } from "lucide-react"
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
import { saveMenuTranslation, getMenuTranslations } from "@/lib/actions/menu-translation"
import { QuickActionsBar } from "./floating-controls"

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
  initialPlanInfo?: {
    planType: string
    maxMenus: number
    currentMenus: number
    canPublish: boolean
  } | null
  initialTranslations?: { [language: string]: { categories: MenuCategory[] } }
}

export default function LiveMenuEditor({ 
  restaurant, 
  initialMenuData = [], 
  initialPlanInfo = null,
  initialTranslations = {}
}: LiveMenuEditorProps) {
  const { 
    categories, 
    setCategories, 
    appliedFontSettings, 
    appliedPageBackgroundSettings, 
    appliedRowStyles,
    selectedTemplate 
  } = useMenuEditor()
  
  const [refreshing, setRefreshing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [publishResult, setPublishResult] = useState<{ pdfUrl?: string; menuId?: string } | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showTranslationDrawer, setShowTranslationDrawer] = useState(false)
  
  // New states for multi-version support
  const [menuVersions, setMenuVersions] = useState<{ [language: string]: { categories: MenuCategory[], pdfUrl?: string } }>({
    'ar': { categories: categories },
    ...initialTranslations,
  })
  const [activeVersion, setActiveVersion] = useState<string>('ar')
  const [planInfo, setPlanInfo] = useState(initialPlanInfo)
  
  const router = useRouter()
  const { hasPaidPlan, loading: paymentLoading, refetch: refetchPaymentStatus } = usePaymentStatus()
  const { toast } = useToast()
  
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
    // This effect syncs any changes made to the menu (via the context)
    // with the `menuVersions` state for the currently active language.
    // This is crucial for multi-language support, ensuring edits are not lost when switching versions.
    setMenuVersions(prev => ({
      ...prev,
      [activeVersion]: {
        ...(prev[activeVersion] || {}),
        categories: categories,
      }
    }))
  }, [categories, activeVersion])

  const { onRefresh } = useMenuEditor()

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    // The onRefresh from the provider will update the categories in the context
    // We just need to sync the menuVersions state with the updated categories
    setMenuVersions(prev => ({
        ...prev,
        [activeVersion]: { categories: categories }
    }))
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

  const handleTranslationComplete = async (translatedCategories: MenuCategory[], targetLanguage: string) => {
    const targetLangName = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name || targetLanguage
    
    // Save the translation to the database
    await saveMenuTranslation(restaurant.id, targetLanguage, activeVersion, translatedCategories)

    setMenuVersions(prev => ({
      ...prev,
      ar: prev.ar || { categories }, // Ensure 'ar' version is always present
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
      let PdfComponent: React.ElementType
      let props: any = {
        restaurant: restaurant,
        categories: categories,
      }

      if (selectedTemplate === 'painting') {
        const { PaintingStylePdf } = await import("@/components/pdf/templates/painting-style/PaintingStylePdf")
        PdfComponent = PaintingStylePdf
      } else {
        const { CafeMenuPDF } = await import("@/components/pdf/cafe-menu-pdf")
        PdfComponent = CafeMenuPDF
        props = {
          ...props,
          appliedFontSettings,
          appliedPageBackgroundSettings,
          appliedRowStyles,
        }
      }
      
      const blob = await pdf(React.createElement(PdfComponent, props)).toBlob()

      const formData = new FormData()
      formData.append("pdfFile", blob, "menu.pdf")
      formData.append("restaurantId", restaurant.id)

      const result = await generateAndSaveMenuPdf(null, formData)

      if (result.pdfUrl && result.menuId) {
        setPublishResult({
          pdfUrl: result.pdfUrl,
          menuId: result.menuId
        })
        setShowSuccessDialog(true)
      } else {
        throw new Error(`Failed to publish: ${result.error}`)
      }

      const languageCount = 1 // Always publish one version for now
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
    router.push(`/dashboard/menu/${publishResult?.menuId}/qr-design`)
  }

  const handleViewPublishedMenus = () => {
    setShowSuccessDialog(false)
    router.push("/dashboard?tab=published-menus")
  }

  const [languageToDelete, setLanguageToDelete] = useState<string | null>(null)
  const [showDeleteLangModal, setShowDeleteLangModal] = useState(false)

  const handleDeleteLanguage = () => {
    if (languageToDelete && menuVersions[languageToDelete]) {
      setMenuVersions(prev => {
        const updated = { ...prev }
        delete updated[languageToDelete]
        return updated
      })
      // If the deleted language was active, switch to 'ar' or first available
      if (activeVersion === languageToDelete) {
        const fallback = Object.keys(menuVersions).find(l => l !== languageToDelete) || 'ar'
        setActiveVersion(fallback)
        setCategories(menuVersions[fallback]?.categories || [])
      }
    }
    setShowDeleteLangModal(false)
    setLanguageToDelete(null)
  }

  return (
    <>
      <div className="space-y-4 h-full flex flex-col">
        {/* Unified Control Bar */}
        <div className="w-11/12 mx-auto sticky top-1 z-50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-md border border-red-200 rounded-xl p-2 shadow-lg">
          
          {/* Left Side: Publish Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handlePublishMenu}
              disabled={isPublishing || !planInfo?.canPublish || categories.length === 0}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white h-8 px-4 transition-colors flex items-center"
              title={!planInfo?.canPublish && planInfo ? `لقد وصلت إلى الحد الأقصى (${planInfo.currentMenus}/${planInfo.maxMenus}) للقوائم في خطتك.` : "نشر القائمة"}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <FileText className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline text-xs">
                {isPublishing ? "جاري النشر..." : "نشر القائمة"}
              </span>
            </Button>
          </div>

          {/* Center: Language Controls */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-center">
            {Object.keys(menuVersions).length > 1 && (
              <div className="flex gap-1">
                {Object.entries(menuVersions).map(([langCode, version]) => {
                  const isActive = activeVersion === langCode
                  const versionName = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode)?.name || langCode
                  return (
                    <div key={langCode} className="relative group">
                      <Button
                        onClick={() => handleVersionSwitch(langCode)}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap transition-all text-xs h-8 px-3 ${
                          isActive 
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {versionName}
                      </Button>
                      {langCode !== 'ar' && (
                        <button
                          type="button"
                          className="absolute -top-1.5 -right-1.5 bg-white border border-red-300 rounded-full w-4 h-4 flex items-center justify-center shadow-md z-10 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { setLanguageToDelete(langCode); setShowDeleteLangModal(true); }}
                          aria-label={`Delete ${versionName} language`}
                        >
                          <X className="w-2.5 h-2.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowTranslationDrawer(true)}
              disabled={categories.length === 0}
              size="sm"
              className="flex items-center hover:bg-purple-50 border-purple-200 hover:text-purple-600 bg-purple-50 text-purple-600 h-8 px-3 transition-colors flex-shrink-0"
              title="ترجمة القائمة بالذكاء الاصطناعي"
            >
              <Languages className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs">ترجمة AI</span>
            </Button>
          </div>

          {/* Right Side: Action Buttons & Plan Info */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {planInfo && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-red-50 rounded-lg border border-red-200">
                <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                  {planInfo.currentMenus}/{planInfo.maxMenus} قائمة
                </span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
              className="border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 transition-colors flex-shrink-0"
              title="تحديث"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handlePdfPreview}
              size="sm"
              className={`border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 transition-colors flex-shrink-0 ${!hasPaidPlan && !paymentLoading ? 'opacity-75' : ''}`}
              title={!hasPaidPlan && !paymentLoading ? 'الترقية للمعاينة' : 'معاينة PDF'}
              disabled={paymentLoading}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Menu Preview */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ProfessionalCafeMenuPreview
            restaurant={restaurant}
            categories={categories}
            onRefresh={() => {}}
          />
        </div>
        <QuickActionsBar />
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
      {showPdfPreviewModal && selectedTemplate && (
        <PdfPreviewModal
          isOpen={showPdfPreviewModal}
          onClose={() => setShowPdfPreviewModal(false)}
          restaurant={restaurant}
          categories={categories}
          appliedFontSettings={appliedFontSettings}
          appliedPageBackgroundSettings={appliedPageBackgroundSettings}
          appliedRowStyles={appliedRowStyles}
          selectedTemplate={selectedTemplate}
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

      <Dialog open={showDeleteLangModal} onOpenChange={setShowDeleteLangModal}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              حذف اللغة
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-gray-700 mb-4">هل أنت متأكد أنك تريد حذف هذه النسخة من القائمة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="destructive" onClick={handleDeleteLanguage}>حذف</Button>
              <Button variant="outline" onClick={() => setShowDeleteLangModal(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 