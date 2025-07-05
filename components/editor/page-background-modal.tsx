"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, Palette, Layers, Image, Save, RotateCcw, Check } from "lucide-react"
import { PageBackgroundSettings, useMenuEditor } from '@/contexts/menu-editor-context'
import { toast } from "sonner"
import { ColorPicker } from '@/components/ui/color-picker'

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

// Recommended menu background images
const recommendedImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    alt: 'خلفية مطعم أنيقة',
    description: 'خلفية مطعم كلاسيكية'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    alt: 'خلفية مطعم حديثة',
    description: 'تصميم مطعم عصري'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    alt: 'خلفية مقهى دافئة',
    description: 'أجواء مقهى دافئة'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
    alt: 'خلفية مطعم فاخر',
    description: 'مطعم فاخر وأنيق'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=600&fit=crop',
    alt: 'خلفية طعام طبيعية',
    description: 'خلفية طبيعية للطعام'
  }
]

// Gradient directions
const gradientDirections = [
  { value: 'to-b', label: 'من الأعلى للأسفل' },
  { value: 'to-r', label: 'من اليسار لليمين' },
  { value: 'to-br', label: 'قطري' },
  { value: 'to-tr', label: 'قطري معكوس' },
]

type BackgroundType = 'solid' | 'gradient' | 'image'

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
  const [isLoading, setIsLoading] = useState(true)
  const [loadingRecommendedImages, setLoadingRecommendedImages] = useState(true)

  // Simulate loading content dynamically
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Simulate API call or heavy computation
      setTimeout(() => {
        setSettings(pageBackgroundSettings)
        setIsLoading(false)
      }, 800)

      // Load recommended images
      setTimeout(() => {
        setLoadingRecommendedImages(false)
      }, 1200)
    }
  }, [isOpen, pageBackgroundSettings])

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

  const handleRecommendedImageSelect = (imageUrl: string) => {
    setSettings(prev => ({
      ...prev,
      backgroundImage: imageUrl,
      backgroundType: 'image'
    }))
    toast.success("تم اختيار صورة الخلفية")
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

  const BackgroundTypeSelector = () => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">نوع الخلفية</Label>
      <div className="flex gap-2">
        <Button
          variant={settings.backgroundType === 'solid' ? 'default' : 'outline'}
          onClick={() => setSettings(prev => ({ ...prev, backgroundType: 'solid' }))}
          className="flex-1 flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          لون واحد
          {settings.backgroundType === 'solid' && <Check className="h-4 w-4" />}
        </Button>
        <Button
          variant={settings.backgroundType === 'gradient' ? 'default' : 'outline'}
          onClick={() => setSettings(prev => ({ ...prev, backgroundType: 'gradient' }))}
          className="flex-1 flex items-center gap-2"
        >
          <Layers className="h-4 w-4" />
          تدرج لوني
          {settings.backgroundType === 'gradient' && <Check className="h-4 w-4" />}
        </Button>
        <Button
          variant={settings.backgroundType === 'image' ? 'default' : 'outline'}
          onClick={() => setSettings(prev => ({ ...prev, backgroundType: 'image' }))}
          className="flex-1 flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          صورة
          {settings.backgroundType === 'image' && <Check className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  const RecommendedImagesSection = () => (
    <div className="space-y-4">
      <Label className="text-base font-semibold">صور مقترحة للقوائم</Label>
      {loadingRecommendedImages ? (
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {recommendedImages.map((img) => (
            <button
              key={img.id}
              onClick={() => handleRecommendedImageSelect(img.url)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                settings.backgroundImage === img.url 
                  ? 'border-purple-500 ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              title={img.description}
            >
              <img 
                src={img.url} 
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {settings.backgroundImage === img.url && (
                <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const CustomUploadSection = () => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">أو ارفع صورة مخصصة</Label>
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
      ) : settings.backgroundImage && !recommendedImages.some(img => img.url === settings.backgroundImage) && (
        <div className="mt-2">
          <img 
            src={settings.backgroundImage} 
            alt="Background preview" 
            className="w-full h-24 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Layers className="h-6 w-6 text-purple-600" />
            إعدادات خلفية الصفحة
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Preview Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-4">معاينة الخلفية</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div 
                  className="w-full h-32 rounded-lg border border-gray-300 transition-all duration-300"
                  style={getBackgroundStyle()}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-sm">
                      <p className="text-gray-700 text-center font-medium">عينة من محتوى القائمة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Settings Panel */}
              <div className="lg:col-span-2 space-y-6">
                <BackgroundTypeSelector />

                {/* Solid Color */}
                {settings.backgroundType === 'solid' && (
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">لون الخلفية</Label>
                    <ColorPicker
                      color={settings.backgroundColor}
                      onChange={(color) => setSettings(prev => ({ ...prev, backgroundColor: color }))}
                    />
                  </div>
                )}

                {/* Gradient Colors */}
                {settings.backgroundType === 'gradient' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اللون الأول</Label>
                        <ColorPicker
                          color={settings.gradientFrom}
                          onChange={(color) => setSettings(prev => ({ ...prev, gradientFrom: color }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>اللون الثاني</Label>
                        <ColorPicker
                          color={settings.gradientTo}
                          onChange={(color) => setSettings(prev => ({ ...prev, gradientTo: color }))}
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
                  <div className="space-y-6">
                    <RecommendedImagesSection />
                    <CustomUploadSection />
                  </div>
                )}
              </div>

              {/* Current Applied Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الإعدادات المطبقة حالياً</h3>
                <div 
                  className="w-full h-64 rounded-lg border border-gray-300 transition-all duration-300"
                  style={{
                    background: appliedPageBackgroundSettings.backgroundType === 'image' && appliedPageBackgroundSettings.backgroundImage
                      ? `url(${appliedPageBackgroundSettings.backgroundImage})`
                      : appliedPageBackgroundSettings.backgroundType === 'gradient'
                      ? `linear-gradient(${appliedPageBackgroundSettings.gradientDirection}, ${appliedPageBackgroundSettings.gradientFrom}, ${appliedPageBackgroundSettings.gradientTo})`
                      : appliedPageBackgroundSettings.backgroundColor,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-sm">
                      <p className="text-gray-700 text-center text-sm">الخلفية الحالية</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="flex gap-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={resetToDefault} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}