"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useMenuEditor, colorPalettes } from "@/contexts/menu-editor-context"

export const ColorPaletteModal: React.FC = () => {
  const {
    showColorModal,
    setShowColorModal,
    selectedPalette,
    setSelectedPalette,
    isUpdatingPalette,
    restaurant,
    handleUpdateColorPalette
  } = useMenuEditor()

  return (
    <Dialog open={showColorModal} onOpenChange={setShowColorModal}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-right">اختر لوحة الألوان</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {colorPalettes.map((palette) => (
            <div key={palette.id} className="flex items-center space-x-2 space-x-reverse">
              <input
                type="radio"
                name="colorPalette"
                value={palette.id}
                id={`modal-${palette.id}`}
                checked={selectedPalette === palette.id}
                onChange={() => setSelectedPalette(palette.id)}
                className="sr-only"
              />
              <Label
                htmlFor={`modal-${palette.id}`}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex-1 ${
                  selectedPalette === palette.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{palette.name}</span>
                  <div className="flex space-x-1 space-x-reverse">
                    {palette.preview.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowColorModal(false)}
            disabled={isUpdatingPalette}
          >
            إلغاء
          </Button>
          <Button
            onClick={() => handleUpdateColorPalette(selectedPalette)}
            disabled={isUpdatingPalette || selectedPalette === restaurant.color_palette?.id}
            style={{ backgroundColor: colorPalettes.find(p => p.id === selectedPalette)?.primary }}
            className="text-white"
          >
            {isUpdatingPalette ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            {isUpdatingPalette ? "جاري التحديث..." : "تطبيق الألوان"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 