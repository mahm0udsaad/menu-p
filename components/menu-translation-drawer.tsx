"use client"

import { useState, useEffect } from "react"
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
import { Languages, Loader2, Sparkles, CheckCircle, AlertCircle, X, Brain, Wand2, FileText } from "lucide-react"
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

interface MenuTranslationDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: MenuCategory[]
  onTranslationComplete: (translatedCategories: MenuCategory[], targetLanguage: string) => void
}

function StreamingTranslationScreen({ 
  categories, 
  targetLanguage, 
  sourceLanguage,
  onComplete,
  onError 
}: { 
  categories: MenuCategory[]
  targetLanguage: string
  sourceLanguage: string
  onComplete: (translatedCategories: MenuCategory[]) => void
  onError: (error: string) => void
}) {
  const [partialTranslation, setPartialTranslation] = useState<any>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    async function startStreaming() {
      try {
        const response = await fetch('/api/translate-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categories,
            targetLanguage,
            sourceLanguage,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to start translation' }))
          throw new Error(errorData.error || 'Failed to start translation')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          let buffer = ""
          
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              break
            }
            
            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            
            // Process complete lines
            const lines = buffer.split('\n')
            buffer = lines.pop() || "" // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6)) // Remove 'data: ' prefix
                  
                  if (data.error) {
                    onError(data.error)
                    return
                  }
                  
                  if (data.final) {
                    // Final complete object
                    setPartialTranslation(data.object)
                    setIsComplete(true)
                    setTimeout(() => {
                      onComplete(data.object.categories)
                    }, 1500)
                  } else {
                    // Partial object update
                    setPartialTranslation(data)
                  }
                } catch (parseError) {
                  console.warn('Failed to parse streaming data:', parseError)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming translation error:', error)
        onError(error instanceof Error ? error.message : 'Translation failed')
      }
    }

    startStreaming()
  }, [categories, targetLanguage, sourceLanguage, onComplete, onError])

  const targetLangName = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name || targetLanguage

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-full shadow-xl">
            <Brain className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">
            {isComplete ? "✅ تمت الترجمة بنجاح!" : "🤖 جاري الترجمة..."}
          </h3>
          <p className="text-slate-300">
            {isComplete ? "تم إنجاز الترجمة بالكامل" : `جاري الترجمة إلى ${targetLangName} باستخدام الذكاء الاصطناعي`}
          </p>
        </div>
      </div>

      {/* Translation Progress Box */}
      <div className="flex-1 bg-slate-800/90 rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span className="text-white font-medium">المحتوى المترجم</span>
            {!isComplete && <Wand2 className="h-4 w-4 text-emerald-400 animate-bounce" />}
          </div>
        </div>
        
        <ScrollArea className="h-96 p-4">
          {partialTranslation?.categories ? (
            <div className="space-y-4">
              {partialTranslation.categories.map((category: any, categoryIndex: number) => (
                <div key={category?.id || categoryIndex} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                  <div className="mb-3">
                    <h4 className="text-lg font-semibold text-emerald-300">
                      {category?.name || "جاري الترجمة..."}
                    </h4>
                    {category?.description && (
                      <p className="text-slate-400 text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                  
                  {category?.menu_items && (
                    <div className="space-y-2">
                      {category.menu_items.map((item: any, itemIndex: number) => (
                        <div key={item?.id || itemIndex} className="bg-slate-800/50 rounded p-3 border border-slate-700">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="text-white font-medium">
                                {item?.name || "جاري الترجمة..."}
                              </h5>
                              {item?.description && (
                                <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                              )}
                            </div>
                            {item?.price && (
                              <span className="text-emerald-400 font-semibold ml-3">
                                {item.price} ج.م
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent mx-auto"></div>
                <p className="text-slate-400">انتظار بدء الترجمة...</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Progress Indicator */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm">تقدم الترجمة</span>
          <span className="text-emerald-400 text-sm">
            {isComplete ? "100%" : "جاري العمل..."}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isComplete 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 w-full" 
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 w-1/2 animate-pulse"
            }`}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default function MenuTranslationDrawer({
  isOpen,
  onClose,
  categories,
  onTranslationComplete,
}: MenuTranslationDrawerProps) {
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
    setCurrentTranslatingLang(selectedLanguages[0]) // Start with first language
  }

  const handleStreamingComplete = (translatedCategories: MenuCategory[]) => {
    onTranslationComplete(translatedCategories, currentTranslatingLang)
    toast.success(`تمت الترجمة بنجاح إلى ${SUPPORTED_LANGUAGES.find(lang => lang.code === currentTranslatingLang)?.name}!`)
    
    setTranslationStatus('success')
    setTimeout(() => {
      onClose()
      setIsTranslating(false)
      setTranslationStatus('idle')
      setSelectedLanguages([])
      setCurrentTranslatingLang("")
    }, 2000)
  }

  const handleStreamingError = (error: string) => {
    setTranslationStatus('error')
    setIsTranslating(false)
    console.error("Streaming translation error:", error)
    toast.error("حدث خطأ أثناء الترجمة")
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

        <ScrollArea className="flex-1">
          {isTranslating ? (
            <StreamingTranslationScreen
              categories={categories}
              targetLanguage={currentTranslatingLang}
              sourceLanguage={sourceLanguage}
              onComplete={handleStreamingComplete}
              onError={handleStreamingError}
            />
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 p-6">
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
            </div>
          )}
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