"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Type,
  Check,
  Palette,
  RotateCcw,
  Save,
  Eye,
} from "lucide-react"
import { useMenuEditor } from "@/contexts/menu-editor-context"

interface FontOption {
  id: string
  name: string
  arabicName: string
  family: string
  preview: string
  arabicPreview: string
  category: "arabic" | "english" | "both"
}

interface FontWeight {
  value: string
  label: string
  arabicLabel: string
}

const fontOptions: FontOption[] = [
  { id: "cairo", name: "Cairo", arabicName: "خط القاهرة", family: "Cairo, sans-serif", preview: "Cairo Font", arabicPreview: "خط القاهرة الجميل", category: "arabic" },
  { id: "noto-kufi", name: "Noto Kufi Arabic", arabicName: "نوتو كوفي", family: "Noto Kufi Arabic, sans-serif", preview: "Noto Kufi", arabicPreview: "نوتو كوفي العربي", category: "arabic" },
  { id: "amiri", name: "Amiri", arabicName: "الأميري", family: "Amiri, serif", preview: "Amiri", arabicPreview: "الخط الأميري", category: "arabic" },
  { id: "tajawal", name: "Tajawal", arabicName: "تجول", family: "Tajawal, sans-serif", preview: "Tajawal", arabicPreview: "خط تجول", category: "arabic" },
  { id: "open-sans", name: "Open Sans", arabicName: "أوبن سانس", family: "Open Sans, sans-serif", preview: "Open Sans Font", arabicPreview: "أوبن سانس", category: "english" },
  { id: "roboto", name: "Roboto", arabicName: "روبوتو", family: "Roboto, sans-serif", preview: "Roboto Font", arabicPreview: "روبوتو", category: "english" },
  { id: "inter", name: "Inter", arabicName: "إنتر", family: "Inter, sans-serif", preview: "Inter Font", arabicPreview: "إنتر", category: "english" },
  { id: "poppins", name: "Poppins", arabicName: "بوبينز", family: "Poppins, sans-serif", preview: "Poppins Font", arabicPreview: "بوبينز", category: "english" },
]

const fontWeights: FontWeight[] = [
  { value: "300", label: "Light", arabicLabel: "خفيف" },
  { value: "400", label: "Regular", arabicLabel: "عادي" },
  { value: "500", label: "Medium", arabicLabel: "متوسط" },
  { value: "600", label: "Semi Bold", arabicLabel: "نصف عريض" },
  { value: "700", label: "Bold", arabicLabel: "عريض" },
  { value: "800", label: "Extra Bold", arabicLabel: "عريض جداً" },
]

export const FontSettingsModal: React.FC = () => {
  const {
    showDesignModal,
    setShowDesignModal,
    fontSettings,
    setFontSettings,
    handleSaveDesignChanges,
  } = useMenuEditor()

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"arabic" | "english">("arabic")
  const [previewText, setPreviewText] = useState({
    arabic: "مطعم المذاق الأصيل",
    english: "Authentic Taste Restaurant",
  })

  useEffect(() => {
    if (showDesignModal) {
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 600)
    }
  }, [showDesignModal])

  const handleFontChange = (fontId: string, language: "arabic" | "english") => {
    setFontSettings(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        font: fontId,
      },
    }))
  }

  const handleWeightChange = (weight: string, language: "arabic" | "english") => {
    setFontSettings(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        weight: weight,
      },
    }))
  }

  const resetToDefault = () => {
    setFontSettings({
      arabic: { font: "cairo", weight: "400" },
      english: { font: "open-sans", weight: "400" },
    })
  }

  const resolveFontFamily = (id: string): string => {
    return fontOptions.find(f => f.id === id)?.family || "inherit"
  }

  const FontSelector = ({ language }: { language: "arabic" | "english" }) => {
    const fonts = fontOptions.filter(f => f.category === language || f.category === "both")
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fonts.map(font => (
            <button
              key={font.id}
              onClick={() => handleFontChange(font.id, language)}
              className={`p-4 rounded-lg border-2 transition-all ${
                fontSettings[language].font === font.id
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-left">
                  <div className="font-medium text-sm">{font.name}</div>
                  <div className="text-xs text-gray-500">{font.arabicName}</div>
                </div>
                {fontSettings[language].font === font.id && <Check className="h-5 w-5 text-blue-500" />}
              </div>
              <div
                className={`text-lg ${language === "arabic" ? "text-right" : "text-left"}`}
                style={{ fontFamily: font.family }}
              >
                {language === "arabic" ? font.arabicPreview : font.preview}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">
            {language === "arabic" ? "سماكة الخط" : "Font Weight"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {fontWeights.map(weight => (
              <button
                key={weight.value}
                onClick={() => handleWeightChange(weight.value, language)}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  fontSettings[language].weight === weight.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">
                  {language === "arabic" ? weight.arabicLabel : weight.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const PreviewSection = () => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border z-20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          معاينة مباشرة
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewText({
            arabic: "مطعم المذاق الأصيل", english: "Authentic Taste Restaurant"
          })}>نموذج المطعم</Button>
          <Button variant="outline" size="sm" onClick={() => setPreviewText({
            arabic: "برجر اللحم المشوي", english: "Grilled Beef Burger"
          })}>نموذج الطعام</Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div className="text-center border-b pb-4">
          <div
            className="text-3xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: resolveFontFamily(fontSettings.arabic.font), fontWeight: fontSettings.arabic.weight }}
          >
            {previewText.arabic}
          </div>
          <div
            className="text-xl text-gray-600"
            style={{ fontFamily: resolveFontFamily(fontSettings.english.font), fontWeight: fontSettings.english.weight }}
          >
            {previewText.english}
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div
              className="text-xl font-semibold text-gray-800 mb-2"
              style={{ fontFamily: resolveFontFamily(fontSettings.arabic.font), fontWeight: fontSettings.arabic.weight }}
            >
              برجر اللحم المشوي
            </div>
            <div
              className="text-sm text-gray-600 leading-relaxed"
              style={{ fontFamily: resolveFontFamily(fontSettings.arabic.font), fontWeight: "400" }}
            >
              برجر لحم مشوي طازج مع الخضار والصوص الخاص
            </div>
          </div>
          <div
            className="text-xl font-bold text-green-600 ml-4"
            style={{ fontFamily: resolveFontFamily(fontSettings.english.font), fontWeight: fontSettings.english.weight }}
          >
            45 ج.م
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={showDesignModal} onOpenChange={setShowDesignModal}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Type className="h-6 w-6 text-blue-600" />
            إعدادات الخطوط
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-6 px-1 sm:px-4 pb-6">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          ) : (
            <>
              <PreviewSection />
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab("arabic")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    activeTab === "arabic"
                      ? "bg-white shadow-sm font-medium text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  الخطوط العربية
                </button>
                <button
                  onClick={() => setActiveTab("english")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    activeTab === "english"
                      ? "bg-white shadow-sm font-medium text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  English Fonts
                </button>
              </div>

              <div className="min-h-[400px]">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    {activeTab === "arabic" ? "اختر الخط العربي" : "Choose English Font"}
                  </h3>
                  <FontSelector language={activeTab} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t pt-4 flex flex-col sm:flex-row justify-between gap-3 px-4 pb-4 z-10">
          <Button variant="outline" onClick={resetToDefault} disabled={isLoading} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDesignModal(false)}>إغلاق</Button>
            <Button onClick={handleSaveDesignChanges} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
