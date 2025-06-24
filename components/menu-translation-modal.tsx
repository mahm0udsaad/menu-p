"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Languages, Loader2, Sparkles, CheckCircle, AlertCircle, X } from "lucide-react"
import { translateMenuWithAI } from "@/lib/actions/menu-translation"
import { SUPPORTED_LANGUAGES, type Language } from "@/lib/utils/translation-constants"
import { toast } from "sonner"

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

interface MenuTranslationModalProps {
  isOpen: boolean
  onClose: () => void
  categories: MenuCategory[]
  onTranslationComplete: (translatedCategories: MenuCategory[], targetLanguage: string) => void
}

export default function MenuTranslationModal({
  isOpen,
  onClose,
  categories,
  onTranslationComplete,
}: MenuTranslationModalProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [sourceLanguage, setSourceLanguage] = useState<string>("ar")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [currentTranslatingLang, setCurrentTranslatingLang] = useState<string>("")

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode) 
        ? prev.filter(code => code !== languageCode)
        : [...prev, languageCode]
    )
  }

  const handleTranslate = async () => {
    if (selectedLanguages.length === 0) {
      toast.error("يرجى اختيار لغة واحدة على الأقل للترجمة")
      return
    }

    if (categories.length === 0) {
      toast.error("لا توجد عناصر قائمة للترجمة")
      return
    }

    setIsTranslating(true)
    setTranslationStatus('idle')

    try {
      // Translate to each selected language
      for (const targetLanguage of selectedLanguages) {
        setCurrentTranslatingLang(targetLanguage)
        
        const result = await translateMenuWithAI({
          categories,
          targetLanguage,
          sourceLanguage,
        })

        if (result.success && result.data) {
          onTranslationComplete(result.data, targetLanguage)
          toast.success(`تمت الترجمة بنجاح إلى ${SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name}!`)
        } else {
          toast.error(`فشل في الترجمة إلى ${SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name}: ${result.error}`)
        }
      }
      
      setTranslationStatus('success')
      
      // Close drawer after a short delay to show success state
      setTimeout(() => {
        onClose()
        setTranslationStatus('idle')
        setSelectedLanguages([])
        setCurrentTranslatingLang("")
      }, 2000)
    } catch (error) {
      setTranslationStatus('error')
      console.error("Translation error:", error)
      toast.error("حدث خطأ أثناء الترجمة")
    } finally {
      setIsTranslating(false)
      setCurrentTranslatingLang("")
    }
  }

  const handleClose = () => {
    if (!isTranslating) {
      onClose()
      setTranslationStatus('idle')
      setSelectedLanguages([])
      setCurrentTranslatingLang("")
    }
  }

  const getMenuItemsCount = () => {
    return categories.reduce((total, category) => total + category.menu_items.length, 0)
  }

  const availableLanguages = SUPPORTED_LANGUAGES.filter((lang: Language) => lang.code !== sourceLanguage)

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[90vh] bg-slate-900 border-slate-700">
        <DrawerHeader className="border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-lg shadow-lg">
                <Languages className="h-5 w-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-bold text-white text-right">
                  ترجمة القائمة بالذكاء الاصطناعي
                </DrawerTitle>
                <DrawerDescription className="text-slate-400 text-right">
                  اختر اللغات المطلوبة وسيتم الترجمة باستخدام Gemini 2.0 Flash
                </DrawerDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              disabled={isTranslating}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Menu Summary */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="font-medium mb-4 text-white text-right">ملخص القائمة</h3>
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <Badge variant="outline" className="bg-emerald-600/20 text-emerald-400 border-emerald-400/30">
                    {categories.length} فئة
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-600/20 text-emerald-400 border-emerald-400/30">
                    {getMenuItemsCount()} عنصر
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm">
                  ستتم ترجمة جميع أسماء الفئات والعناصر والأوصاف
                </p>
              </div>
            </div>

            {/* Source Language Selection */}
            <div className="space-y-3">
              <label className="text-lg font-medium text-white text-right block">اللغة المصدر</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white text-right h-12">
                  <SelectValue placeholder="اختر اللغة المصدر" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {SUPPORTED_LANGUAGES.map((lang: Language) => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Languages Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium text-white text-right">اللغات المطلوب الترجمة إليها</label>
                <Badge variant="outline" className="bg-purple-600/20 text-purple-400 border-purple-400/30">
                  {selectedLanguages.length} مختارة
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableLanguages.map((lang: Language) => (
                  <div
                    key={lang.code}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedLanguages.includes(lang.code)
                        ? 'bg-emerald-600/20 border-emerald-400/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600'
                    }`}
                    onClick={() => handleLanguageToggle(lang.code)}
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Checkbox
                        checked={selectedLanguages.includes(lang.code)}
                        onCheckedChange={() => handleLanguageToggle(lang.code)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span className={`font-medium text-right ${
                        selectedLanguages.includes(lang.code) ? 'text-emerald-300' : 'text-white'
                      }`}>
                        {lang.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Translation Info */}
            <div className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 p-6 rounded-xl border border-emerald-700/50">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-emerald-400 mt-1 flex-shrink-0" />
                <div className="text-right">
                  <h4 className="font-medium text-emerald-300 mb-2 text-lg">الترجمة بالذكاء الاصطناعي</h4>
                  <p className="text-emerald-200 mb-3">
                    سيتم استخدام نموذج Gemini 2.0 Flash لترجمة احترافية مع الحفاظ على بنية القائمة والأسعار
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Badge variant="outline" className="bg-emerald-600/20 text-emerald-300 border-emerald-400/30">
                      ✨ ترجمة ذكية
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-600/20 text-emerald-300 border-emerald-400/30">
                      🔒 حفظ الأسعار
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-600/20 text-emerald-300 border-emerald-400/30">
                      📋 حفظ البنية
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Translation Progress */}
            {isTranslating && currentTranslatingLang && (
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
                  <div className="text-right">
                    <p className="text-white font-medium">
                      جاري الترجمة إلى {SUPPORTED_LANGUAGES.find(lang => lang.code === currentTranslatingLang)?.name}...
                    </p>
                    <p className="text-slate-400 text-sm">
                      قد تستغرق العملية بضع ثوان
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="border-t border-slate-700 bg-slate-800/50 p-6">
          <div className="max-w-4xl mx-auto flex gap-4">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isTranslating}
              className="flex-1 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white h-12"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleTranslate}
              disabled={selectedLanguages.length === 0 || isTranslating}
              className="flex-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white h-12 px-8"
            >
              {isTranslating && <Loader2 className="h-5 w-5 ml-3 animate-spin" />}
              {translationStatus === 'success' && <CheckCircle className="h-5 w-5 ml-3" />}
              {translationStatus === 'error' && <AlertCircle className="h-5 w-5 ml-3" />}
              {isTranslating ? 
                `جاري الترجمة... (${selectedLanguages.length} لغة)` : 
               translationStatus === 'success' ? 'تمت الترجمة بنجاح!' :
               translationStatus === 'error' ? 'حدث خطأ في الترجمة' : 
               `ترجمة إلى ${selectedLanguages.length} لغة بالذكاء الاصطناعي`}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 