"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, Palette, Layers, Image, Save, RotateCcw } from "lucide-react"
import { PageBackgroundSettings, useMenuEditor } from '@/contexts/menu-editor-context'
import { toast } from "sonner"

interface PageBackgroundModalProps {
  isOpen: boolean
  onClose: () => void
}

// Pre-defined background colors
const backgroundColors = [
  { name: 'أبيض', value: '#ffffff' },
  { name: 'رمادي فاتح', value: '#f8fafc' },
  { name: 'بيج', value: '#f5f5dc' },
  { name: 'كريمي', value: '#fff8dc' },
  { name: 'أخضر فاتح', value: '#f0f9ff' },
  { name: 'وردي فاتح', value: '#fdf2f8' },
  { name: 'أصفر فاتح', value: '#fffbeb' },
  { name: 'بني فاتح', value: '#fdf6e3' },
]

// Gradient directions
const gradientDirections = [
  { value: 'to-b', label: 'من الأعلى للأسفل' },
  { value: 'to-r', label: 'من اليسار لليمين' },
  { value: 'to-br', label: 'قطري' },
  { value: 'to-tr', label: 'قطري معكوس' },
]

export default function PageBackgroundModal({ isOpen, onClose }: PageBackgroundModalProps) {
  const { 
    pageBackgroundSettings, 
    setPageBackgroundSettings, 
    handleSavePageBackground,
    handlePageBgImageUpload,
    appliedPageBackgroundSettings 
  } = useMenuEditor()

  const [settings, setSettings] = useState<PageBackgroundSettings>(pageBackgroundSettings)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)
      const imageUrl = await handlePageBgImageUpload(file)
      setSettings(prev => ({
        ...prev,
        backgroundImage: imageUrl,
        backgroundType: 'image'
      }))
      toast.success("تم رفع صورة الخلفية بنجاح")
    } catch (error) {
      console.error('Failed to upload background image:', error)
      toast.error("فشل في رفع صورة الخلفية")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSave = () => {
    setPageBackgroundSettings(settings)
    handleSavePageBackground(settings)
    toast.success("تم حفظ إعدادات الخلفية بنجاح")
    onClose()
  }

  const resetToDefault = () => {
    setSettings({
      backgroundColor: '#ffffff',
      backgroundImage: null,
      backgroundType: 'solid',
      gradientFrom: '#ffffff',
      gradientTo: '#f8fafc',
      gradientDirection: 'to-b'
    })
  }

  const getBackgroundStyle = () => {
    if (settings.backgroundType === 'image' && settings.backgroundImage) {
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    } else if (settings.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${settings.gradientDirection}, ${settings.gradientFrom}, ${settings.gradientTo})`
      }
    }
    return { backgroundColor: settings.backgroundColor }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Layers className="h-6 w-6 text-purple-600" />
            إعدادات خلفية الصفحة
          </DialogTitle>
        </DialogHeader>

        {/* Preview Section - First Thing in Modal */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold mb-4">معاينة الخلفية</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div 
              className="w-full h-32 rounded-lg border border-gray-300 transition-all"
              style={getBackgroundStyle()}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-white bg-opacity-80 p-4 rounded-lg">
                  <p className="text-gray-700 text-center">عينة من محتوى القائمة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Background Type */}
            <div className="space-y-2">
              <Label>نوع الخلفية</Label>
              <Select 
                value={settings.backgroundType} 
                onValueChange={(value: 'solid' | 'image' | 'gradient') => 
                  setSettings(prev => ({ ...prev, backgroundType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      لون واحد
                    </div>
                  </SelectItem>
                  <SelectItem value="gradient">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      تدرج لوني
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      صورة خلفية
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Solid Color */}
            {settings.backgroundType === 'solid' && (
              <div className="space-y-3">
                <Label>لون الخلفية</Label>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-full h-12 rounded-lg border-2 transition-all ${
                        settings.backgroundColor === color.value 
                          ? 'border-purple-500 ring-2 ring-purple-200' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSettings(prev => ({ ...prev, backgroundColor: color.value }))}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Gradient Colors */}
            {settings.backgroundType === 'gradient' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>اللون الأول</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.gradientFrom}
                      onChange={(e) => setSettings(prev => ({ ...prev, gradientFrom: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={settings.gradientFrom}
                      onChange={(e) => setSettings(prev => ({ ...prev, gradientFrom: e.target.value }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>اللون الثاني</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.gradientTo}
                      onChange={(e) => setSettings(prev => ({ ...prev, gradientTo: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={settings.gradientTo}
                      onChange={(e) => setSettings(prev => ({ ...prev, gradientTo: e.target.value }))}
                      placeholder="#f8fafc"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>اتجاه التدرج</Label>
                  <Select
                    value={settings.gradientDirection}
                    onValueChange={(value: 'to-b' | 'to-br' | 'to-r' | 'to-tr') =>
                      setSettings(prev => ({ ...prev, gradientDirection: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientDirections.map((direction) => (
                        <SelectItem key={direction.value} value={direction.value}>
                          {direction.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Image Upload */}
            {settings.backgroundType === 'image' && (
              <div className="space-y-3">
                <Label>صورة الخلفية</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="page-bg-upload"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="page-bg-upload"
                    className={`flex items-center gap-2 px-4 py-2 border border-purple-300 rounded-lg transition-colors ${
                      isUploadingImage 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:bg-purple-50'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingImage ? "جاري الرفع..." : "اختر صورة"}
                  </label>
                </div>
                
                {isUploadingImage ? (
                  <div className="mt-2">
                    <Skeleton className="w-full h-24 rounded-lg" />
                  </div>
                ) : settings.backgroundImage && (
                  <div className="mt-2">
                    <img 
                      src={settings.backgroundImage} 
                      alt="Background preview" 
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Applied Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الإعدادات المطبقة حالياً</h3>
            <div 
              className="w-full h-48 rounded-lg border border-gray-300"
              style={{
                background: appliedPageBackgroundSettings.backgroundType === 'image' && appliedPageBackgroundSettings.backgroundImage
                  ? `url(${appliedPageBackgroundSettings.backgroundImage})`
                  : appliedPageBackgroundSettings.backgroundType === 'gradient'
                  ? `linear-gradient(${appliedPageBackgroundSettings.gradientDirection}, ${appliedPageBackgroundSettings.gradientFrom}, ${appliedPageBackgroundSettings.gradientTo})`
                  : appliedPageBackgroundSettings.backgroundColor,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={resetToDefault}>
            <RotateCcw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 