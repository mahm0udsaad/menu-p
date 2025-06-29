"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Type } from "lucide-react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import SimplifiedFontSettings from "../simplified-font-settings"

export const FontSettingsModal: React.FC = () => {
  const {
    showDesignModal,
    setShowDesignModal,
    fontSettings,
    setFontSettings,
    appliedFontSettings,
    handleSaveDesignChanges
  } = useMenuEditor()

  return (
    <Dialog open={showDesignModal} onOpenChange={setShowDesignModal}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Type className="h-5 w-5" />
            إعدادات الخط
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Preview Section - First Thing in Modal */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-4">معاينة الخط</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <div 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: appliedFontSettings.arabic.font === 'cairo' ? 'Cairo, sans-serif' : 
                               appliedFontSettings.arabic.font === 'noto-kufi' ? 'Noto Kufi Arabic, sans-serif' : 'inherit',
                    fontWeight: appliedFontSettings.arabic.weight 
                  }}
                >
                  مطعم المذاق الأصيل
                </div>
                <div 
                  className="text-lg"
                  style={{ 
                    fontFamily: appliedFontSettings.english.font === 'open-sans' ? 'Open Sans, sans-serif' : 
                               appliedFontSettings.english.font === 'roboto' ? 'Roboto, sans-serif' : 'inherit',
                    fontWeight: appliedFontSettings.english.weight 
                  }}
                >
                  Authentic Taste Restaurant
                </div>
                <div className="space-y-2">
                  <div 
                    className="text-lg font-semibold"
                    style={{ 
                      fontFamily: appliedFontSettings.arabic.font === 'cairo' ? 'Cairo, sans-serif' : 
                                 appliedFontSettings.arabic.font === 'noto-kufi' ? 'Noto Kufi Arabic, sans-serif' : 'inherit',
                      fontWeight: appliedFontSettings.arabic.weight 
                    }}
                  >
                    برجر اللحم المشوي
                  </div>
                  <div 
                    className="text-sm text-gray-600"
                    style={{ 
                      fontFamily: appliedFontSettings.arabic.font === 'cairo' ? 'Cairo, sans-serif' : 
                                 appliedFontSettings.arabic.font === 'noto-kufi' ? 'Noto Kufi Arabic, sans-serif' : 'inherit',
                      fontWeight: '400'
                    }}
                  >
                    برجر لحم مشوي طازج مع الخضار والصوص الخاص
                  </div>
                  <div 
                    className="text-lg font-bold text-red-600"
                    style={{ 
                      fontFamily: appliedFontSettings.english.font === 'open-sans' ? 'Open Sans, sans-serif' : 
                                 appliedFontSettings.english.font === 'roboto' ? 'Roboto, sans-serif' : 'inherit',
                      fontWeight: appliedFontSettings.english.weight 
                    }}
                  >
                    45 ج.م
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Font Settings */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Type className="h-5 w-5" />
              إعدادات الخط
            </h3>
            
            <SimplifiedFontSettings
              settings={fontSettings}
              onSettingsChange={setFontSettings}
              className="bg-transparent border-0 shadow-none p-0"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setShowDesignModal(false)}
          >
            إغلاق
          </Button>
          <Button
            onClick={handleSaveDesignChanges}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            تطبيق التغييرات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}