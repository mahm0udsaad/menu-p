"use client"

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Palette, Type, Image, Save, RotateCcw, Eye, Smartphone, Monitor, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import { useMenuEditor, colorPalettes, type RowStyleSettings, type BorderSetting } from "@/contexts/menu-editor-context"
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'

interface RowStylingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: RowStyleSettings) => void
  currentSettings: RowStyleSettings
}

type BorderSide = 'borderTop' | 'borderBottom' | 'borderLeft' | 'borderRight'

// Pre-defined background colors - optimized for mobile
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
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')
  const { handleUpdateColorPalette, selectedPalette, setSelectedPalette, isUpdatingPalette } = useMenuEditor()

  useEffect(() => {
    setSettings(s => ({
      ...currentSettings,
      borderRadius: Math.max(1, currentSettings.borderRadius || 1),
      borderTop: currentSettings.borderTop || { enabled: false, color: '#e5e7eb', width: 1 },
      borderBottom: currentSettings.borderBottom || { enabled: false, color: '#e5e7eb', width: 1 },
      borderLeft: currentSettings.borderLeft || { enabled: false, color: '#e5e7eb', width: 1 },
      borderRight: currentSettings.borderRight || { enabled: false, color: '#e5e7eb', width: 1 }
    }));
  }, [currentSettings])

  const sampleMenuItem = useMemo(() => ({
    name: "برجر اللحم المشوي",
    description: "برجر لحم مشوي طازج مع الخضار والصوص الخاص",
    price: "45",
    currency: "ج.م"
  }), [])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [])

  const handleSave = useCallback(() => {
    onSave(settings)
    onClose()
  }, [settings, onSave, onClose])

  const resetToDefault = useCallback(() => {
    setSettings({
      backgroundColor: '#ffffff',
      backgroundImage: null,
      backgroundType: 'solid',
      itemColor: '#000000',
      descriptionColor: '#6b7280',
      priceColor: '#dc2626',
      textShadow: false,
      borderTop: { enabled: false, color: '#e5e7eb', width: 1 },
      borderBottom: { enabled: false, color: '#e5e7eb', width: 1 },
      borderLeft: { enabled: false, color: '#e5e7eb', width: 1 },
      borderRight: { enabled: false, color: '#e5e7eb', width: 1 },
      borderRadius: 1
    })
  }, [])

  const getItemBackgroundStyle = useCallback(() => {
    const style: React.CSSProperties = {}
    if (settings.backgroundType === 'image' && settings.backgroundImage) {
      if (settings.backgroundImage.includes('|')) {
        const [pattern, size] = settings.backgroundImage.split('|')
        style.background = pattern
        style.backgroundSize = size
      } else {
        style.backgroundImage = `url(${settings.backgroundImage})`
        style.backgroundSize = 'cover'
        style.backgroundPosition = 'center'
      }
    } else {
      style.backgroundColor = settings.backgroundColor
    }
    
    const { borderTop, borderBottom, borderLeft, borderRight, borderRadius } = settings
    if (borderTop?.enabled) style.borderTop = `${borderTop.width}px solid ${borderTop.color}`
    if (borderBottom?.enabled) style.borderBottom = `${borderBottom.width}px solid ${borderBottom.color}`
    if (borderLeft?.enabled) style.borderLeft = `${borderLeft.width}px solid ${borderLeft.color}`
    if (borderRight?.enabled) style.borderRight = `${borderRight.width}px solid ${borderRight.color}`
    
    style.borderRadius = `${borderRadius || 1}px`

    return style
  }, [settings])
  
  const handleBorderChange = (side: BorderSide, newValues: Partial<BorderSetting>) => {
    const defaultBorder: BorderSetting = { enabled: false, color: '#e5e7eb', width: 1 }
    setSettings(prev => ({
      ...prev,
      [side]: {
        ...defaultBorder,
        ...(prev[side] || {}),
        ...newValues
      }
    }))
  }
  
  const borderControls: { side: BorderSide; label: string; icon: React.ReactNode }[] = [
    { side: 'borderTop', label: 'الإطار العلوي', icon: <ArrowUp className="w-4 h-4" /> },
    { side: 'borderBottom', label: 'الإطار السفلي', icon: <ArrowDown className="w-4 h-4" /> },
    { side: 'borderLeft', label: 'الإطار الأيسر', icon: <ArrowLeft className="w-4 h-4" /> },
    { side: 'borderRight', label: 'الإطار الأيمن', icon: <ArrowRight className="w-4 h-4" /> },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 overflow-hidden flex flex-col">
        
        {/* Preview Section - replaces header for better mobile UX */}
        <div className="border-b bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                معاينة
              </h3>
              <div className="flex gap-1 bg-white rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  <Smartphone className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  <Monitor className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className={`bg-white rounded-md border shadow-sm mx-auto ${previewMode === 'mobile' ? 'max-w-[320px]' : 'w-full'}`}>
              <div 
                className="p-3 rounded-md transition-all duration-200"
                style={getItemBackgroundStyle()}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold text-sm mb-0.5 truncate"
                      style={{ 
                        color: settings.itemColor,
                        textShadow: settings.textShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {sampleMenuItem.name}
                    </h4>
                    <p 
                      className="text-xs opacity-90 line-clamp-2"
                      style={{ 
                        color: settings.descriptionColor,
                        textShadow: settings.textShadow ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
                      }}
                    >
                      {sampleMenuItem.description}
                    </p>
                  </div>
                  <div 
                    className="font-bold text-base whitespace-nowrap"
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

          {/* Settings Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="design" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 sticky top-0 bg-white z-10 border-b rounded-none">
                <TabsTrigger value="design" className="text-sm sm:text-base flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  تصميم العناصر
                </TabsTrigger>
                <TabsTrigger value="palettes" className="text-sm sm:text-base flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  قوالب جاهزة
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="design" className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Background Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-base border-b pb-2">إعدادات الخلفية</h3>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">نوع الخلفية</Label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, backgroundType: 'solid' }))}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                            settings.backgroundType === 'solid' 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-5 h-5 rounded bg-gray-300 mx-auto mb-1.5"></div>
                            <span className="text-xs font-medium">لون صلب</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, backgroundType: 'image' }))}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                            settings.backgroundType === 'image' 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <Image className="w-5 h-5 mx-auto mb-1.5" />
                            <span className="text-xs font-medium">صورة خلفية</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {settings.backgroundType === 'solid' && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">لون الخلفية</Label>
                        <div className="w-full sm:w-2/3">
                          <ColorPicker
                            color={settings.backgroundColor}
                            onChange={(color) => setSettings(prev => ({ ...prev, backgroundColor: color }))}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {backgroundColors.map(c => (
                            <button key={c.value} title={c.name} onClick={() => setSettings(p => ({...p, backgroundColor: c.value}))} className="w-5 h-5 rounded-full border" style={{backgroundColor: c.value}} />
                          ))}
                        </div>
                      </div>
                    )}

                    {settings.backgroundType === 'image' && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">نماذج جاهزة</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {backgroundPatterns.map((pattern, index) => (
                              <button
                                key={index}
                                className="h-10 border rounded-lg transition-all hover:border-blue-500"
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

                        <div>
                          <Label className="text-sm font-medium">رفع صورة مخصصة</Label>
                          <div className="mt-2">
                            <Label className="flex items-center gap-2 p-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-xs">اختر صورة</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </Label>
                            {selectedFile && (
                              <p className="text-xs text-gray-600 mt-1">{selectedFile.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Border Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-base border-b pb-2">إعدادات الإطار</h3>
                    <div className="space-y-2">
                      <Label htmlFor="border-radius" className="text-sm font-medium">حواف دائرية (Radius)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="border-radius"
                          min={1}
                          max={32}
                          step={1}
                          value={[settings.borderRadius]}
                          onValueChange={(value) => setSettings({ ...settings, borderRadius: value[0] })}
                          className="flex-1"
                        />
                        <span className="text-xs w-10 text-center">{settings.borderRadius}px</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {borderControls.map(({ side, label, icon }) => (
                        <div key={side} className="p-2.5 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${side}-toggle`} className="flex items-center gap-1.5 font-medium text-xs">
                              {icon}
                              {label}
                            </Label>
                            <Switch
                              id={`${side}-toggle`}
                              checked={settings[side]?.enabled || false}
                              onCheckedChange={(checked) => handleBorderChange(side, { enabled: checked })}
                            />
                          </div>

                          {settings[side]?.enabled && (
                            <div className="space-y-3 pt-3 border-t">
                              <div className="space-y-1.5">
                                <Label className="text-xs">لون الإطار</Label>
                                <div className="w-full sm:w-2/3">
                                  <ColorPicker
                                    color={settings[side].color}
                                    onChange={(color) => handleBorderChange(side, { color })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">سماكة الإطار (px)</Label>
                                <div className="flex items-center gap-2">
                                  <Slider
                                      min={1} max={10} step={1}
                                      value={[settings[side].width]}
                                      onValueChange={(value) => handleBorderChange(side, { width: value[0] })}
                                    />
                                    <span className="text-xs w-10 text-center">{settings[side].width}px</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-base border-b pb-2">إعدادات النص</h3>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">لون اسم العنصر</Label>
                      <div className="w-full sm:w-2/3">
                        <ColorPicker
                          color={settings.itemColor}
                          onChange={(color) => setSettings(prev => ({ ...prev, itemColor: color }))}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {textColors.map(c => (
                          <button key={c.value} title={c.name} onClick={() => setSettings(p => ({...p, itemColor: c.value}))} className="w-5 h-5 rounded-full border" style={{backgroundColor: c.value}} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">لون الوصف</Label>
                      <div className="w-full sm:w-2/3">
                        <ColorPicker
                          color={settings.descriptionColor}
                          onChange={(color) => setSettings(prev => ({ ...prev, descriptionColor: color }))}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {textColors.map(c => (
                          <button key={c.value} title={c.name} onClick={() => setSettings(p => ({...p, descriptionColor: c.value}))} className="w-5 h-5 rounded-full border" style={{backgroundColor: c.value}} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">لون السعر</Label>
                      <div className="w-full sm:w-2/3">
                        <ColorPicker
                          color={settings.priceColor}
                          onChange={(color) => setSettings(prev => ({ ...prev, priceColor: color }))}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {textColors.map(c => (
                          <button key={c.value} title={c.name} onClick={() => setSettings(p => ({...p, priceColor: c.value}))} className="w-5 h-5 rounded-full border" style={{backgroundColor: c.value}} />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="text-shadow-toggle" className="text-sm">تفعيل ظل للنص</Label>
                      <Switch
                        id="text-shadow-toggle"
                        checked={settings.textShadow}
                        onCheckedChange={(checked) => setSettings({ ...settings, textShadow: checked })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="palettes" className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="font-medium text-base border-b pb-2">قوالب الألوان الجاهزة</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colorPalettes.map((palette) => (
                      <div
                        key={palette.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedPalette === palette.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedPalette(palette.id)
                          handleUpdateColorPalette(palette.id)
                          // Apply palette colors to the current settings
                          setSettings(prev => ({
                            ...prev,
                            itemColor: palette.primary,
                            descriptionColor: palette.secondary,
                            priceColor: palette.accent
                          }))
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            {palette.preview.map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-xs">{palette.name}</span>
                        </div>
                        
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: palette.primary }} />
                            <span>رئيسي</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: palette.secondary }} />
                            <span>ثانوي</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: palette.accent }} />
                            <span>تمييز</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {isUpdatingPalette && (
                    <div className="flex items-center justify-center p-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">جاري تطبيق لوحة الألوان...</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sticky Footer */}
          <div className="p-2 border-t bg-white">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="flex items-center gap-2 order-3 sm:order-1"
              >
                <RotateCcw className="w-4 h-4" />
                إعادة تعيين
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1 order-2 sm:order-2"
              >
                إغلاق
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex items-center gap-2 flex-1 order-1 sm:order-3"
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}