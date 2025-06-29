"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Palette, Type, Image, Save, RotateCcw } from "lucide-react"
import { useMenuEditor, colorPalettes } from "@/contexts/menu-editor-context"

interface RowStyleSettings {
  backgroundColor: string
  backgroundImage: string | null
  backgroundType: 'solid' | 'image'
  itemColor: string
  descriptionColor: string
  priceColor: string
  textShadow: boolean
}

interface RowStylingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: RowStyleSettings) => void
  currentSettings: RowStyleSettings
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

// Pre-defined text colors
const textColors = [
  { name: 'أسود', value: '#000000' },
  { name: 'رمادي داكن', value: '#374151' },
  { name: 'بني داكن', value: '#92400e' },
  { name: 'أخضر داكن', value: '#065f46' },
  { name: 'أزرق داكن', value: '#1e3a8a' },
  { name: 'أحمر داكن', value: '#991b1b' },
  { name: 'بنفسجي', value: '#581c87' },
  { name: 'ذهبي', value: '#d97706' },
]

// Built-in background patterns
const backgroundPatterns = [
  { name: 'نقاط صغيرة', value: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)', size: '20px 20px' },
  { name: 'خطوط قطرية', value: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%)', size: '20px 20px' },
  { name: 'شبكة', value: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', size: '20px 20px' },
  { name: 'موجات', value: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)', size: 'auto' },
]

export default function RowStylingModal({ isOpen, onClose, onSave, currentSettings }: RowStylingModalProps) {
  const [settings, setSettings] = useState<RowStyleSettings>(currentSettings)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { handleUpdateColorPalette, selectedPalette, setSelectedPalette, isUpdatingPalette } = useMenuEditor()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSettings(prev => ({
          ...prev,
          backgroundImage: result,
          backgroundType: 'image'
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  const resetToDefault = () => {
    setSettings({
      backgroundColor: '#ffffff',
      backgroundImage: null,
      backgroundType: 'solid',
      itemColor: '#000000',
      descriptionColor: '#6b7280',
      priceColor: '#dc2626',
      textShadow: false
    })
  }

  const sampleMenuItem = {
    name: "برجر اللحم المشوي",
    description: "برجر لحم مشوي طازج مع الخضار والصوص الخاص",
    price: "45",
    currency: "ج.م"
  }

  const getItemBackgroundStyle = () => {
    if (settings.backgroundType === 'image' && settings.backgroundImage) {
      if (settings.backgroundImage.includes('|')) {
        const [pattern, size] = settings.backgroundImage.split('|')
        return {
          background: pattern,
          backgroundSize: size
        }
      }
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return { backgroundColor: settings.backgroundColor }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-6 w-6 text-purple-600" />
            تخصيص مظهر عناصر القائمة
          </DialogTitle>
        </DialogHeader>

        {/* Preview Section - First Thing in Modal */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold mb-4">معاينة العنصر</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div 
              className="p-4 rounded-lg border border-gray-200 transition-all"
              style={getItemBackgroundStyle()}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 
                    className="text-lg font-semibold mb-1 transition-colors"
                    style={{ 
                      color: settings.itemColor,
                      textShadow: settings.textShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {sampleMenuItem.name}
                  </h4>
                  <p 
                    className="text-sm mb-2 transition-colors"
                    style={{ 
                      color: settings.descriptionColor,
                      textShadow: settings.textShadow ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {sampleMenuItem.description}
                  </p>
                </div>
                <div 
                  className="text-xl font-bold transition-colors ml-4"
                  style={{ 
                    color: settings.priceColor,
                    textShadow: settings.textShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  {sampleMenuItem.price} {sampleMenuItem.currency}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="styling" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="styling">تصميم العناصر</TabsTrigger>
            <TabsTrigger value="templates">قوالب جاهزة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="styling" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Background Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  إعدادات الخلفية
                </h3>
                
                {/* Background Type */}
                <div className="space-y-2">
                  <Label>نوع الخلفية</Label>
                  <Select value={settings.backgroundType} onValueChange={(value: 'solid' | 'image') => 
                    setSettings(prev => ({ ...prev, backgroundType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">لون صلب</SelectItem>
                      <SelectItem value="image">صورة خلفية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Color */}
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

                {/* Background Image */}
                {settings.backgroundType === 'image' && (
                  <div className="space-y-3">
                    <Label>صورة الخلفية</Label>
                    
                    {/* Pattern Options */}
                    <div className="space-y-2">
                      <Label className="text-sm">نماذج جاهزة:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {backgroundPatterns.map((pattern, index) => (
                          <button
                            key={index}
                            className="h-16 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                            style={{ 
                              background: pattern.value,
                              backgroundSize: pattern.size 
                            }}
                            onClick={() => setSettings(prev => ({ 
                              ...prev, 
                              backgroundImage: `${pattern.value}|${pattern.size}`,
                              backgroundType: 'image'
                            }))}
                            title={pattern.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Custom Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm">رفع صورة مخصصة:</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="background-upload"
                        />
                        <label
                          htmlFor="background-upload"
                          className="flex items-center gap-2 px-4 py-2 border border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          اختر صورة
                        </label>
                        {selectedFile && (
                          <span className="text-sm text-gray-600">{selectedFile.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Style Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  إعدادات النص
                </h3>

                {/* Item Name Color */}
                <div className="space-y-3">
                  <Label>لون اسم العنصر</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {textColors.map((color) => (
                      <button
                        key={color.value}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          settings.itemColor === color.value 
                            ? 'border-purple-500 ring-2 ring-purple-200' 
                            : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSettings(prev => ({ ...prev, itemColor: color.value }))}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.itemColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, itemColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={settings.itemColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, itemColor: e.target.value }))}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Description Color */}
                <div className="space-y-3">
                  <Label>لون الوصف</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.descriptionColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, descriptionColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={settings.descriptionColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, descriptionColor: e.target.value }))}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Price Color */}
                <div className="space-y-3">
                  <Label>لون السعر</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.priceColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, priceColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={settings.priceColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, priceColor: e.target.value }))}
                      placeholder="#dc2626"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Text Shadow */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="textShadow"
                    checked={settings.textShadow}
                    onChange={(e) => setSettings(prev => ({ ...prev, textShadow: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="textShadow">إضافة ظل للنص</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                قوالب الألوان الجاهزة
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colorPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPalette === palette.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedPalette(palette.id)
                      handleUpdateColorPalette(palette.id)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        {palette.preview.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{palette.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: palette.primary }}
                        />
                        <span className="text-xs text-gray-600">رئيسي</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: palette.secondary }}
                        />
                        <span className="text-xs text-gray-600">ثانوي</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: palette.accent }}
                        />
                        <span className="text-xs text-gray-600">تمييز</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {isUpdatingPalette && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-purple-600">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    جاري تطبيق لوحة الألوان...
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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