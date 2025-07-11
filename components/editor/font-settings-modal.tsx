"use client"

import "@/styles/globals.css"
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
  Loader2,
} from "lucide-react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import { toast } from "sonner"
import { fontOptions, fontWeights, resolveFontFamily } from "@/lib/font-config"

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

export const FontSettingsModal: React.FC = () => {
  const {
    showDesignModal,
    setShowDesignModal,
    fontSettings,
    setFontSettings,
    handleSaveDesignChanges,
  } = useMenuEditor()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await handleSaveDesignChanges()
      toast.success("Font settings saved successfully!")
      setShowDesignModal(false)
    } catch (error) {
      toast.error("Failed to save font settings.")
    } finally {
      setIsSaving(false)
    }
  }

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

  const StickyPreview = () => (
    <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 shadow-sm z-10 border-b">
        <div
            className="text-3xl font-bold text-gray-800 text-center truncate"
            style={{
                fontFamily: resolveFontFamily(fontSettings[activeTab].font),
                fontWeight: fontSettings[activeTab].weight,
            }}
        >
            {previewText[activeTab]}
        </div>
    </div>
  )

  return (
    <Dialog open={showDesignModal} onOpenChange={setShowDesignModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Type className="h-6 w-6 text-blue-600" />
            إعدادات الخطوط
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 flex flex-col">
          {isLoading ? (
            <div className="space-y-6 p-6">
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          ) : (
            <>
              <StickyPreview />
              <div className="p-6 space-y-6">
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
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row justify-between gap-3 z-10">
          <Button variant="outline" onClick={resetToDefault} disabled={isLoading || isSaving} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDesignModal(false)} disabled={isSaving}>إغلاق</Button>
            <Button onClick={handleSave} disabled={isLoading || isSaving} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-[140px]">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "جار الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
