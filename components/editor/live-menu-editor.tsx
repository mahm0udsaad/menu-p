"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, FileText, Loader2, Eye, CheckCircle, QrCode, ExternalLink, Languages, X, Database, Globe } from "lucide-react"
import ProfessionalCafeMenuPreview from "./professional-cafe-menu-preview-refactored"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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
import { saveMenuTranslation,  deleteMenuTranslation } from "@/lib/actions/menu-translation"
import { QuickActionsBar } from "./floating-controls"
import ConfirmationModal from "@/components/ui/confirmation-modal"
import { PublishingProgressBox } from "./PublishingProgressBox"

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

// New PDF generation function using the template system
async function generateMenuPdfWithTemplates(
  restaurant: any,
  categories: any[],
  templateId: string,
  language: string,
  customizations: any,
  menuName: string = "Current Menu",
  parentMenuId?: string
): Promise<{ pdfUrl?: string; error?: string; menuId?: string }> {
  try {
    // Step 1: Generate PDF using the new template API
    const response = await fetch('/api/menu-pdf/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        menuId: restaurant.id,
        templateId,
        language,
        customizations,
        format: 'A4',
        forceRegenerate: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.details || 'Failed to generate PDF');
      } catch (e) {
        console.error("Non-JSON error response from server:", errorText);
        throw new Error('An unexpected server error occurred. Check server logs for details.');
      }
    }

    const { pdfUrl } = await response.json()

    // Step 2: Save to published_menus table for menu management
    const menuUuid = crypto.randomUUID()

    const languageNames: { [key: string]: string } = {
      'ar': 'الأصل',
      'en': 'English', 
      'fr': 'Français',
      'es': 'Español'
    }

    const { error: dbError } = await supabase
      .from("published_menus")
      .insert({
        id: menuUuid,
        restaurant_id: restaurant.id,
        menu_name: menuName,
        pdf_url: pdfUrl,
        language_code: language,
        version_name: languageNames[language] || language,
        parent_menu_id: parentMenuId,
        is_primary_version: language === 'ar' && !parentMenuId
      })

    if (dbError) {
      console.error("DB Insert Error:", dbError)
      throw new Error(`Failed to save menu: ${dbError.message}`)
    }

    return { pdfUrl, menuId: menuUuid }
  } catch (error: any) {
    console.error("PDF Generation Error:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
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
    selectedTemplate,
    confirmAction,
    hideConfirmation,
    setCurrentLanguage,
    isPreviewMode,
    setIsPreviewMode,
  } = useMenuEditor()
  
  const [refreshing, setRefreshing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [publishResult, setPublishResult] = useState<{ pdfUrl?: string; menuId?: string } | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showTranslationDrawer, setShowTranslationDrawer] = useState(false)
  const [showProgressBox, setShowProgressBox] = useState(false)
  
  // New states for multi-version support
  const [menuVersions, setMenuVersions] = useState<{ [language: string]: { categories: MenuCategory[], pdfUrl?: string } }>({
    'ar': { categories: categories },
    ...initialTranslations,
  })
  const [activeVersion, setActiveVersion] = useState<string>('ar')
  const [planInfo, setPlanInfo] = useState(initialPlanInfo)
  const [publishingProgress, setPublishingProgress] = useState<{ 
    current: string; 
    total: number; 
    completed: number; 
    error?: string;
    steps?: Array<{
      id: string;
      label: string;
      status: 'pending' | 'active' | 'completed' | 'error';
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  }>({ current: '', total: 0, completed: 0 })
  
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
    }));
    setCurrentLanguage(activeVersion);
  }, [categories, activeVersion]);

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
    // if (!hasPaidPlan) {
    //   setShowPaymentModal(true)
    //   return
    // }

    setIsPublishing(true)
    setShowProgressBox(true)
    
    // Get all available language versions
    const availableLanguages = Object.keys(menuVersions).filter(lang => {
      const version = menuVersions[lang];
      return version && version.categories && version.categories.length > 0;
    });
    
    if (availableLanguages.length === 0) {
      setPublishingProgress(prev => ({ 
        ...prev, 
        error: "لا توجد نسخ صالحة للنشر" 
      }));
      setIsPublishing(false);
      return;
    }

    // Initialize steps based on available languages
    const initialSteps = [
      { id: 'preparing', label: 'Preparing menu data...', status: 'active' as const, icon: Database },
      ...availableLanguages.map(lang => {
        const langName = SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name || lang;
        return {
          id: `publish-${lang}`,
          label: `Publishing ${langName} version`,
          status: 'pending' as const,
          icon: Globe
        };
      }),
      { id: 'finishing', label: 'Finalizing publication...', status: 'pending' as const, icon: CheckCircle }
    ];
    
    setPublishingProgress({ 
      current: 'Preparing data...', 
      total: availableLanguages.length, 
      completed: 0,
      steps: initialSteps
    });
    
    try {
      console.log('🎨 Publishing menu with Playwright...', {
        template: selectedTemplate,
        restaurant: restaurant.name,
        availableLanguages: availableLanguages,
        totalLanguages: availableLanguages.length
      })

      // Step 1: Complete preparation
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      setPublishingProgress(prev => ({
        ...prev,
        steps: prev.steps?.map(step => 
          step.id === 'preparing' 
            ? { ...step, status: 'completed' as const }
            : step
        )
      }));

      // Map template names for the Playwright PDF generator
      const getPlaywrightTemplate = (template: string | null) => {
        switch (template) {
          case 'classic':
            return 'cafe';
          case 'painting':
            return 'painting';
          case 'vintage':
            return 'vintage';
          case 'modern':
            return 'modern';
          default:
            return 'cafe'; // Default fallback
        }
      };
      
      const templateForPlaywright = getPlaywrightTemplate(selectedTemplate);

      console.log('🎨 Template mapping:', {
        original: selectedTemplate,
        mapped: templateForPlaywright,
        availableLanguages: availableLanguages.length
      });

      // Prepare customizations for Playwright
      const customizations = {
        fontSettings: appliedFontSettings,
        pageBackgroundSettings: appliedPageBackgroundSettings,
        rowStyles: appliedRowStyles,
      }

      const publishResults: { language: string; result: any }[] = [];
      let primaryMenuId: string | null = null;

      // Publish each language version
      for (let i = 0; i < availableLanguages.length; i++) {
        const language = availableLanguages[i];
        const languageData = menuVersions[language];
        
        // Update progress to show current language being processed
        const langName = SUPPORTED_LANGUAGES.find(lang => lang.code === language)?.name || language;
        setPublishingProgress(prev => ({ 
          ...prev, 
          current: langName,
          steps: prev.steps?.map(step => 
            step.id === `publish-${language}`
              ? { ...step, status: 'active' as const }
              : step
          )
        }));
        
        if (!languageData || !languageData.categories || languageData.categories.length === 0) {
          console.warn(`Skipping ${language}: No valid menu data`);
          // Mark step as error
          setPublishingProgress(prev => ({
            ...prev,
            steps: prev.steps?.map(step => 
              step.id === `publish-${language}`
                ? { ...step, status: 'error' as const }
                : step
            )
          }));
          continue;
        }

        console.log(`📄 Generating PDF for ${language}...`);
        
        try {
          const result = await generateMenuPdfWithTemplates(
            restaurant,
            languageData.categories,
            templateForPlaywright,
            language,
            customizations,
            "Current Menu",
            language === 'ar' ? undefined : primaryMenuId || undefined // Set parent for non-Arabic versions
          );

          if (result.pdfUrl && result.menuId) {
            publishResults.push({ language, result });
            
            // Set the primary menu ID (usually Arabic) for other versions to reference
            if (language === 'ar' || !primaryMenuId) {
              primaryMenuId = result.menuId;
            }
            
            // Update the menu version with the PDF URL
            setMenuVersions(prev => ({
              ...prev,
              [language]: {
                ...prev[language],
                pdfUrl: result.pdfUrl
              }
            }));
            
            // Mark step as completed
            setPublishingProgress(prev => ({
              ...prev,
              completed: i + 1,
              steps: prev.steps?.map(step => 
                step.id === `publish-${language}`
                  ? { ...step, status: 'completed' as const }
                  : step
              )
            }));
            
            console.log(`✅ Successfully published ${language} version`);
          } else {
            console.error(`❌ Failed to publish ${language}:`, result.error);
            throw new Error(`Failed to publish ${language}: ${result.error}`);
          }
        } catch (languageError: any) {
          console.error(`❌ Error publishing ${language}:`, languageError);
          // Mark step as error
          setPublishingProgress(prev => ({
            ...prev,
            steps: prev.steps?.map(step => 
              step.id === `publish-${language}`
                ? { ...step, status: 'error' as const }
                : step
            )
          }));
          throw new Error(`Failed to publish ${language}: ${languageError.message}`);
        }
      }

      if (publishResults.length === 0) {
        throw new Error('No valid language versions found to publish');
      }

      console.log('📊 Publishing results:', {
        totalResults: publishResults.length,
        languages: publishResults.map(r => r.language),
        primaryResult: publishResults.find(r => r.language === 'ar') || publishResults[0]
      });

      // Step 3: Finishing
      setPublishingProgress(prev => ({
        ...prev,
        current: 'Finalizing...',
        steps: prev.steps?.map(step => 
          step.id === 'finishing'
            ? { ...step, status: 'active' as const }
            : step
        )
      }));

      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX

      // Complete finishing step
      setPublishingProgress(prev => ({
        ...prev,
        steps: prev.steps?.map(step => 
          step.id === 'finishing'
            ? { ...step, status: 'completed' as const }
            : step
        )
      }));

      // Set the primary result for the success dialog
      const primaryResult = publishResults.find(r => r.language === 'ar') || publishResults[0];
      setPublishResult({
        pdfUrl: primaryResult.result.pdfUrl,
        menuId: primaryResult.result.menuId
      });

      console.log('✅ Publishing completed successfully, showing success dialog');
      
      // Close the progress box and show success dialog after a short delay
      setTimeout(() => {
        setShowProgressBox(false);
        setShowSuccessDialog(true);
      }, 1000);

      // Show success notification with actual language count
      const languageCount = publishResults.length;
      const publishedLanguages = publishResults.map(r => {
        const langName = SUPPORTED_LANGUAGES.find(lang => lang.code === r.language)?.name || r.language;
        return langName;
      }).join('، ');

      showNotification("success", "تم نشر القائمة بنجاح", 
        `تم نشر القائمة بـ ${languageCount} ${languageCount === 1 ? 'لغة' : 'لغات'}: ${publishedLanguages}`);
      
    } catch (error: any) {
      console.error("Publishing error:", error)
      setPublishingProgress(prev => ({ 
        ...prev, 
        error: error.message || "حدث خطأ أثناء نشر القائمة",
        steps: prev.steps?.map(step => 
          step.status === 'active' 
            ? { ...step, status: 'error' as const }
            : step
        )
      }));
      showNotification("error", "خطأ في النشر", `حدث خطأ أثناء نشر القائمة: ${error.message}`)
    } finally {
      setIsPublishing(false)
      // Don't automatically close the progress box on error - let user see the error
    }
  }

  const handleTogglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
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

  const handleDeleteLanguage = async () => {
    if (languageToDelete && menuVersions[languageToDelete]) {
      try {
        // Delete from database
        const result = await deleteMenuTranslation(restaurant.id, languageToDelete)
        
        if (result.success) {
          // Update local state only after successful database deletion
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
          
          const languageName = SUPPORTED_LANGUAGES.find(lang => lang.code === languageToDelete)?.name || languageToDelete
          toast({
            title: "تم الحذف بنجاح",
            description: `تم حذف ترجمة ${languageName} بنجاح`,
          })
        } else {
          toast({
            title: "فشل في الحذف",
            description: result.error || "حدث خطأ أثناء حذف الترجمة",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error deleting translation:", error)
        toast({
          title: "فشل في الحذف",
          description: "حدث خطأ غير متوقع أثناء حذف الترجمة",
          variant: "destructive"
        })
      }
    }
    setShowDeleteLangModal(false)
    setLanguageToDelete(null)
  }

  return (
    <>
      <div className="space-y-4 h-full flex flex-col">
        {/* Unified Control Bar */}
        <div className="w-11/12 mx-auto sticky top-1 z-50 flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md border border-red-200 rounded-xl p-2 shadow-lg">
          
          {/* Left Side: Publish Button */}
          <div className="flex-shrink-0 relative">
            <Button
              onClick={handlePublishMenu}
              disabled={isPublishing}
              size="sm"
              className={`h-8 px-4 transition-colors flex items-center ${
                isPublishing 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
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
            <PublishingProgressBox
              isOpen={showProgressBox}
              progress={publishingProgress}
              onClose={() => setShowProgressBox(false)}
            />
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
              disabled={refreshing || isPreviewMode}
              size="sm"
              className={`border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 transition-colors flex-shrink-0 ${isPreviewMode ? 'opacity-50' : ''}`}
              title="تحديث"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {!isPreviewMode && (
              <Button
                variant="outline"
                onClick={handlePdfPreview}
                size="sm"
                className={`border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 transition-colors flex-shrink-0 ${!hasPaidPlan && !paymentLoading ? 'opacity-75' : ''}`}
                title={!hasPaidPlan && !paymentLoading ? 'الترقية للمعاينة' : 'معاينة PDF'}
                disabled={paymentLoading}
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleTogglePreviewMode}
              size="sm"
              className={`border-red-200 text-gray-600 hover:text-red-600 hover:bg-red-50 h-8 px-3 transition-colors flex-shrink-0 ${isPreviewMode ? 'bg-red-50 text-red-600' : ''}`}
              title={isPreviewMode ? 'العودة للتحرير' : 'معاينة القائمة'}
            >
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs">
                {isPreviewMode ? 'تحرير' : 'معاينة'}
              </span>
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
        {!isPreviewMode && <QuickActionsBar />}
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
              تم إنشاء ملف PDF للقائمة وحفظه بنجاح! 
              {Object.keys(menuVersions).length > 1 
                ? ` تم نشر ${Object.keys(menuVersions).length} نسخة بلغات مختلفة.`
                : ''
              }
              {' '}يمكنك الآن:
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
          currentLanguage={activeVersion}
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

      <ConfirmationModal
        isOpen={confirmAction.show}
        onClose={hideConfirmation}
        onConfirm={() => {
          confirmAction.action()
          hideConfirmation()
        }}
        title={confirmAction.title}
        description={confirmAction.description}
        type={confirmAction.type}
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