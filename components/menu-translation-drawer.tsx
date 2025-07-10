"use client"

import { useState, useEffect, useCallback } from "react"
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
import { saveMenuTranslation } from "@/lib/actions/menu-translation-storage";

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
  restaurant_id?: string // Add optional restaurant_id field
}

interface MenuTranslationDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: MenuCategory[]
  onTranslationComplete: (allTranslations: Record<string, MenuCategory[]>) => void
  restaurantId: string
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
                    console.error('Server returned error:', data.error, data.details)
                    onError(data.details || data.error)
                    return
                  }
                  
                  if (data.final) {
                    // Final complete object
                    if (!data.object || !data.object.categories) {
                      onError('Invalid response: Missing translated categories')
                      return
                    }
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
                  console.warn('Failed to parse streaming data:', parseError, 'Raw data:', line)
                  // If we can't parse the data and it contains error keywords, treat as error
                  const lowercaseLine = line.toLowerCase()
                  if (lowercaseLine.includes('error') || lowercaseLine.includes('validation') || lowercaseLine.includes('schema')) {
                    onError(`Parse error: ${line.slice(6)}`)
                    return
                  }
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
    <div className="p-6 space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-3">
        <div className="relative">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
            <Brain className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Wand2 className="h-3 w-3 text-white animate-bounce" />
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ترجمة القائمة بالذكاء الاصطناعي
          </h3>
          <p className="text-gray-600">
            جاري الترجمة إلى {SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name}...
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: isComplete ? '100%' : '45%',
              animation: isComplete ? 'none' : 'pulse 2s infinite'
            }}
          />
        </div>
      </div>

      {/* Translation Content */}
      <div className="flex gap-6 h-96">
        {/* Translated Content */}
        <div className="flex-1 bg-red-50 rounded-xl border border-red-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-100 to-rose-100 p-4 border-b border-red-200">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-600" />
              <span className="text-center text-red-900 font-medium">المحتوى المترجم</span>
              {!isComplete && <Wand2 className="h-4 w-4 text-red-600 animate-bounce" />}
            </div>
          </div>
          
          <ScrollArea className="h-80 p-4">
            {partialTranslation?.categories ? (
              <div className="space-y-4">
                {partialTranslation.categories.map((category: any, categoryIndex: number) => (
                  <div key={category?.id || categoryIndex} className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-red-700">
                        {category?.name || "جاري الترجمة..."}
                      </h4>
                      {category?.description && (
                        <p className="text-red-600 text-sm mt-1">{category.description}</p>
                      )}
                    </div>
                    
                    {category?.menu_items?.slice(0, 3).map((item: any, itemIndex: number) => (
                      <div key={item?.id || itemIndex} className="py-2 border-b border-red-100 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800 text-sm">{item?.name || "جاري الترجمة..."}</h5>
                            {item?.description && (
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          {item?.price && (
                            <span className="text-sm font-medium text-red-600 ml-2">
                              {item.price} ر.س
                            </span>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="py-4 text-center">
                        <div className="inline-flex items-center gap-2 text-red-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">جاري ترجمة العناصر...</span>
                        </div>
                      </div>
                    )}
                    
                    {category?.menu_items?.length > 3 && (
                      <p className="text-xs text-red-500 mt-2">
                        +{category.menu_items.length - 3} عنصر آخر...
                      </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-red-500 animate-spin mx-auto mb-3" />
                  <p className="text-red-600 text-sm">بدء الترجمة...</p>
                </div>
            </div>
          )}
        </ScrollArea>
        </div>
      </div>

      {/* Status Messages */}
      <div className="text-center">
        {isComplete ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">تمت الترجمة بنجاح!</span>
        </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-red-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>جاري الترجمة باستخدام الذكاء الاصطناعي...</span>
        </div>
        )}
      </div>
    </div>
  )
}

export default function MenuTranslationDrawer({
  isOpen,
  onClose,
  categories,
  onTranslationComplete,
  restaurantId,
}: MenuTranslationDrawerProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [sourceLanguage, setSourceLanguage] = useState<string>("ar")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'in_progress' | 'success' | 'error'>('idle')
  const [currentTranslatingLang, setCurrentTranslatingLang] = useState<string>("")
  const [completedLanguages, setCompletedLanguages] = useState<string[]>([])
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0)
  const [allTranslations, setAllTranslations] = useState<Record<string, MenuCategory[]>>({})

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode) 
        ? prev.filter(code => code !== languageCode)
        : [...prev, languageCode]
    )
  }

  const handleTranslate = () => {
    if (selectedLanguages.length === 0) {
      toast.error("يرجى اختيار لغة واحدة على الأقل للترجمة")
      return
    }
    if (categories.length === 0) {
      toast.error("لا توجد عناصر قائمة للترجمة")
      return
    }

    setIsTranslating(true)
    setTranslationStatus('in_progress')
    setCompletedLanguages([])
    setCurrentLanguageIndex(0)
    setAllTranslations({})
    setCurrentTranslatingLang(selectedLanguages[0])
  }

  const handleNextLanguage = useCallback(() => {
    const nextIndex = currentLanguageIndex + 1;
    if (nextIndex >= selectedLanguages.length) {
      setTranslationStatus('success');
      setIsTranslating(false);
      onTranslationComplete(allTranslations);
    } else {
      setCurrentLanguageIndex(nextIndex);
      setCurrentTranslatingLang(selectedLanguages[nextIndex]);
    }
  }, [currentLanguageIndex, selectedLanguages, allTranslations, onTranslationComplete]);


  const handleStreamingComplete = useCallback(async (translatedCategories: MenuCategory[]) => {
    const completedLang = selectedLanguages[currentLanguageIndex];
    
    const newTranslations = { ...allTranslations, [completedLang]: translatedCategories };
    setAllTranslations(newTranslations);
    setCompletedLanguages(prev => [...prev, completedLang]);
    
    try {
      await saveMenuTranslation({
        restaurant_id: restaurantId,
        language_code: completedLang,
        source_language_code: sourceLanguage,
        translated_data: { categories: translatedCategories },
        is_published: false
      });
      toast.success(`تم حفظ ترجمة ${SUPPORTED_LANGUAGES.find(lang => lang.code === completedLang)?.name}`);
    } catch (error) {
      console.error("Failed to save translation:", error);
      toast.error(`فشل حفظ ترجمة ${SUPPORTED_LANGUAGES.find(lang => lang.code === completedLang)?.name}`);
    }

    handleNextLanguage();
  }, [allTranslations, currentLanguageIndex, handleNextLanguage, restaurantId, selectedLanguages, sourceLanguage]);

  const handleStreamingError = (error: string) => {
    const langName = SUPPORTED_LANGUAGES.find(lang => lang.code === currentTranslatingLang)?.name;
    toast.error(`حدث خطأ أثناء ترجمة ${langName}`);
    setTranslationStatus('error');
    // Stop translating process on error
    setIsTranslating(false);
  }

  const handleClose = () => {
    if (isTranslating) {
      // Maybe show a confirmation dialog
      return;
    }
    onClose()
    setTranslationStatus('idle')
    setSelectedLanguages([])
    setCurrentTranslatingLang("")
    setCompletedLanguages([])
    setCurrentLanguageIndex(0)
    setAllTranslations({})
  }

  const getMenuItemsCount = () => {
    return categories.reduce((total, category) => total + category.menu_items.length, 0)
  }

  const availableLanguages = SUPPORTED_LANGUAGES.filter((lang: Language) => lang.code !== sourceLanguage)

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[90vh] bg-white border-red-200">
        <DrawerHeader className="border-b border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 p-2 rounded-lg shadow-lg">
                <Languages className="h-5 w-5 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-bold text-gray-900 text-right">
                  ترجمة القائمة بالذكاء الاصطناعي
                </DrawerTitle>
                <DrawerDescription className="text-gray-600 text-right">
                  اختر اللغات المطلوبة وسيتم الترجمة باستخدام Gemini 2.0 Flash
                </DrawerDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              disabled={isTranslating}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
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
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border border-red-200">
                <h3 className="font-medium mb-4 text-gray-900 text-right">ملخص القائمة</h3>
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                      {categories.length} فئة
                    </Badge>
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                      {getMenuItemsCount()} عنصر
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">
                    ستتم ترجمة جميع أسماء الفئات والعناصر والأوصاف
                  </p>
                </div>
              </div>

              {/* Source Language Selection */}
              <div className="space-y-3">
                <label className="text-lg font-medium text-gray-900 text-right block">اللغة المصدر</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-right h-12">
                    <SelectValue placeholder="اختر اللغة المصدر" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 gap-2">
                    {SUPPORTED_LANGUAGES.map((lang: Language) => (
                      <SelectItem 
                        key={lang.code} 
                        value={lang.code}
                        className="text-gray-900 hover:bg-red-50 focus:bg-red-50"
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
                  <label className="text-lg font-medium text-gray-900 text-right">اللغات المطلوب الترجمة إليها</label>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                    {selectedLanguages.length} مختارة
                  </Badge>
                </div>
              
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableLanguages.map((lang: Language) => (
                    <div
                      key={lang.code}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedLanguages.includes(lang.code)
                          ? 'bg-red-50 border-red-300 shadow-lg shadow-red-500/10'
                          : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-200'
                      }`}
                      onClick={() => handleLanguageToggle(lang.code)}
                    >
                      <div className="flex items-center gap-3 gap-reverse">
                        <Checkbox
                          checked={selectedLanguages.includes(lang.code)}
                          onCheckedChange={() => handleLanguageToggle(lang.code)}
                          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <span className={`font-medium text-right ${
                          selectedLanguages.includes(lang.code) ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {lang.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Translation Info */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div className="text-right">
                    <h4 className="font-medium text-emerald-800 mb-2 text-lg">الترجمة بالذكاء الاصطناعي</h4>
                    <p className="text-emerald-700 mb-3">
                      سيتم استخدام نموذج Gemini 2.0 Flash لترجمة احترافية مع الحفاظ على بنية القائمة والأسعار
                    </p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        ✨ ترجمة ذكية
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        🔒 حفظ الأسعار
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
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
        <div className="border-t border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-6">
          <div className="max-w-4xl mx-auto flex gap-4">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isTranslating}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 h-12"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleTranslate}
              disabled={selectedLanguages.length === 0 || isTranslating}
              className="flex-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white h-12 px-8"
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