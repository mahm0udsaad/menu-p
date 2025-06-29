"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Image, Crown, UtensilsCrossed, Coffee, ChefHat, Star, Heart, Leaf, Sparkles, Save, RotateCcw } from "lucide-react"

interface WatermarkSettings {
  enabled: boolean
  image: string | null
  opacity: number
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size: 'small' | 'medium' | 'large'
  repeat: boolean
}

interface PDFWatermarkModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: WatermarkSettings) => void
  currentSettings: WatermarkSettings
}

// Built-in watermark images based on search results
const builtInWatermarks = [
  {
    id: 'chef-hat-1',
    name: 'قبعة شيف كلاسيكية',
    category: 'chef',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01MCA5MEM2OS4zMzA2IDkwIDg1IDc0LjMzMDYgODUgNTVDODUgMzUuNjY5NCA2OS4zMzA2IDIwIDUwIDIwQzMwLjY2OTQgMjAgMTUgMzUuNjY5NCAxNSA1NUMxNSA3NC4zMzA2IDMwLjY2OTQgOTAgNTAgOTBaIiBmaWxsPSIjZjNmNGY2IiBzdHJva2U9IiM2YjdiODAiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMzAgNzVIMjBWODBIMzBWNzVaIiBmaWxsPSIjNmI3YjgwIi8+CjxwYXRoIGQ9Ik04MCA3NUg3MFY4MEg4MFY3NVoiIGZpbGw9IiM2YjdiODAiLz4KPHN2Zz4K'
  },
  {
    id: 'chef-hat-2',
    name: 'شيف بالشارب',
    category: 'chef',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMwIiBmaWxsPSIjZjNmNGY2IiBzdHJva2U9IiM2YjdiODAiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNDAgNjBINjBWNjVINDBWNjBaIiBmaWxsPSIjNmI3YjgwIi8+CjxjaXJjbGUgY3g9IjQzIiBjeT0iNDUiIHI9IjIiIGZpbGw9IiM2YjdiODAiLz4KPGN0cmNsZSBjeD0iNTciIGN5PSI0NSIgcj0iMiIgZmlsbD0iIzZiN2I4MCIvPgo8L3N2Zz4K'
  },
  {
    id: 'utensils-1',
    name: 'أدوات المائدة المتقاطعة',
    category: 'utensils',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMCAyMEw4MCA4ME0yMCA4MEw4MCAyMCIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'coffee-cup',
    name: 'كوب قهوة',
    category: 'beverages',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjMwIiB5PSI0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjMiLz4KPHN0cmNsZSB4PSI3MCIgeT0iNTUiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxMCIgcng9IjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVkYiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0zNSAzNUM0MCAzMCA0NSAzMCA1MCAzNSIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K'
  },
  {
    id: 'star-rating',
    name: 'تقييم النجوم',
    category: 'rating',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01MCAyMEw1NS41IDE0MEg3NEw2MiA1Mkw4MCAzNEg2MS41TDUwIDIwTDM4LjUgMzRIMjBMMzggNTJMMjYgNzBINDQuNUw1MCA4MEw1NS41IDcwSDc0TDYyIDUyTDUwIDIwWiIgZmlsbD0iI2ZmZGY1NiIgc3Ryb2tlPSIjZjU5ZTBiIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'restaurant-crown',
    name: 'تاج المطعم',
    category: 'premium',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMCA3MEw1MCA0MEw4MCA3MEwyMCA3MFoiIGZpbGw9IiNmZmRmNTYiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjI1IiBjeT0iNjUiIHI9IjMiIGZpbGw9IiNmNTllMGIiLz4KPGN0cmNsZSBjeD0iNTAiIGN5PSI0NSIgcj0iMyIgZmlsbD0iI2Y1OWUwYiIvPgo8Y2lyY2xlIGN4PSI3NSIgY3k9IjY1IiByPSIzIiBmaWxsPSIjZjU5ZTBiIi8+CjxyZWN0IHg9IjIwIiB5PSI3MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjgiIGZpbGw9IiNmNTllMGIiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'heart-favorite',
    name: 'الأطباق المفضلة',
    category: 'favorite',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01MCA4MEM0NS41IDc1QzMwIDY1QzIwIDUwQzIwIDM1QzMwIDI1QzQwIDI1QzQ1IDMwQzUwIDM1QzU1IDMwQzYwIDI1QzcwIDI1QzgwIDM1QzgwIDUwQzcwIDY1QzU0LjUgNzVMNTAgODBaIiBmaWxsPSIjZmI3MTg1IiBzdHJva2U9IiNlMTFlNDgiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'
  },
  {
    id: 'leaf-organic',
    name: 'طعام عضوي',
    category: 'organic',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMCA4MEM0MCA2MEM2MCA0MEM4MCAyMEM4MCA0MEM2MCA2MEM0MCA4MEMyMCA4MEMyMCA2MEM0MCA0MEMyMCA4MFoiIGZpbGw9IiM4NENjMTYiIHN0cm9rZT0iIzY1YTMwZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0zMCA3MEM0MCA2MEM1MCA1MEw2MCA2MEM3MCA3MEw2MCA2MEw1MCA1MEw0MCA2MEwzMCA3MFoiIHN0cm9rZT0iIzY1YTMwZCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo='
  }
]

// Categories for built-in watermarks
const watermarkCategories = [
  { id: 'all', name: 'الكل', icon: Sparkles },
  { id: 'chef', name: 'الشيف', icon: ChefHat },
  { id: 'utensils', name: 'أدوات المائدة', icon: UtensilsCrossed },
  { id: 'beverages', name: 'المشروبات', icon: Coffee },
  { id: 'rating', name: 'التقييم', icon: Star },
  { id: 'premium', name: 'مميز', icon: Crown },
  { id: 'favorite', name: 'مفضل', icon: Heart },
  { id: 'organic', name: 'عضوي', icon: Leaf },
]

export default function PDFWatermarkModal({ isOpen, onClose, onSave, currentSettings }: PDFWatermarkModalProps) {
  const [settings, setSettings] = useState<WatermarkSettings>(currentSettings)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSettings(prev => ({
          ...prev,
          image: result,
          enabled: true
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
      enabled: false,
      image: null,
      opacity: 20,
      position: 'center',
      size: 'medium',
      repeat: false
    })
    setSelectedFile(null)
  }

  const filteredWatermarks = selectedCategory === 'all' 
    ? builtInWatermarks 
    : builtInWatermarks.filter(w => w.category === selectedCategory)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Image className="h-6 w-6 text-blue-600" />
            إعدادات العلامة المائية للـ PDF
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">معرض الصور المدمج</TabsTrigger>
            <TabsTrigger value="upload">رفع صورة مخصصة</TabsTrigger>
          </TabsList>

          {/* Built-in Gallery */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">اختر من المعرض المدمج</h3>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {watermarkCategories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      {category.name}
                    </Button>
                  )
                })}
              </div>

              {/* Watermark Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredWatermarks.map((watermark) => (
                  <div
                    key={watermark.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      settings.image === watermark.url
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSettings(prev => ({ 
                      ...prev, 
                      image: watermark.url,
                      enabled: true
                    }))}
                  >
                    <div className="aspect-square flex items-center justify-center mb-2">
                      <img
                        src={watermark.url}
                        alt={watermark.name}
                        className="w-16 h-16 object-contain opacity-60"
                      />
                    </div>
                    <p className="text-sm text-center font-medium">{watermark.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Upload Custom Image */}
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">رفع صورة مخصصة</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">اسحب الصورة هنا أو انقر للاختيار</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('watermark-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  اختر صورة
                </Button>
                <input
                  id="watermark-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    تم اختيار: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Upload Tips */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">نصائح لأفضل النتائج:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• استخدم صور بخلفية شفافة (PNG) للحصول على أفضل النتائج</li>
                  <li>• اختر صور بسيطة وواضحة لتجنب التداخل مع النص</li>
                  <li>• الحجم المثالي: 200x200 بكسل أو أكبر</li>
                  <li>• تجنب الصور المعقدة أو ذات التفاصيل الكثيرة</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings Panel */}
        {settings.image && (
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-semibold">إعدادات العلامة المائية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Opacity */}
              <div className="space-y-2">
                <Label>الشفافية</Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={settings.opacity}
                    onChange={(e) => setSettings(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 text-center">{settings.opacity}%</p>
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label>الموضع</Label>
                <Select 
                  value={settings.position} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">الوسط</SelectItem>
                    <SelectItem value="top-left">أعلى اليسار</SelectItem>
                    <SelectItem value="top-right">أعلى اليمين</SelectItem>
                    <SelectItem value="bottom-left">أسفل اليسار</SelectItem>
                    <SelectItem value="bottom-right">أسفل اليمين</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label>الحجم</Label>
                <Select 
                  value={settings.size} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, size: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">صغير</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="large">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Repeat */}
              <div className="space-y-2">
                <Label>تكرار الصورة</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="repeat"
                    checked={settings.repeat}
                    onChange={(e) => setSettings(prev => ({ ...prev, repeat: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="repeat" className="text-sm">تكرار في كامل الصفحة</Label>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>معاينة</Label>
              <div 
                className="w-full h-48 border border-gray-300 rounded-lg relative bg-gray-50 overflow-hidden"
                style={{
                  backgroundImage: settings.repeat 
                    ? `url(${settings.image})` 
                    : 'none',
                  backgroundSize: settings.repeat 
                    ? `${settings.size === 'small' ? '60px' : settings.size === 'medium' ? '100px' : '140px'} auto`
                    : 'auto',
                  backgroundRepeat: 'repeat',
                  opacity: settings.repeat ? settings.opacity / 100 : 1
                }}
              >
                {!settings.repeat && settings.image && (
                  <img
                    src={settings.image}
                    alt="Watermark preview"
                    className="absolute"
                    style={{
                      opacity: settings.opacity / 100,
                      width: settings.size === 'small' ? '60px' : settings.size === 'medium' ? '100px' : '140px',
                      height: 'auto',
                      ...(() => {
                        switch (settings.position) {
                          case 'center':
                            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                          case 'top-left':
                            return { top: '10px', left: '10px' }
                          case 'top-right':
                            return { top: '10px', right: '10px' }
                          case 'bottom-left':
                            return { bottom: '10px', left: '10px' }
                          case 'bottom-right':
                            return { bottom: '10px', right: '10px' }
                          default:
                            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                        }
                      })()
                    }}
                  />
                )}
                
                {/* Sample content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-gray-800">
                  <h3 className="text-xl font-bold mb-2">قائمة المطعم</h3>
                  <p className="text-sm mb-4">أطباق لذيذة وخدمة ممتازة</p>
                  <div className="space-y-2 w-full max-w-xs">
                    <div className="flex justify-between">
                      <span>برجر لحم</span>
                      <span>45 ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>سلطة يونانية</span>
                      <span>35 ج.م</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={resetToDefault} 
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 