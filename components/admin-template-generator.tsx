"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, Camera, RefreshCw, Eye, Palette } from "lucide-react"
import { toPng, toJpeg, toSvg } from 'html-to-image'
import ProfessionalCafeMenuPreview from "./editor/professional-cafe-menu-preview"

// Sample restaurant data for template generation
const sampleRestaurants = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "مقهى الحبة الذهبية",
    category: "cafe",
    logo_url: null,
    color_palette: {
      id: "emerald",
      name: "زمردي كلاسيكي",
      primary: "#10b981",
      secondary: "#059669",
      accent: "#34d399"
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000002", 
    name: "مطعم الأصالة",
    category: "restaurant",
    logo_url: null,
    color_palette: {
      id: "amber",
      name: "عنبري دافئ",
      primary: "#f59e0b",
      secondary: "#d97706",
      accent: "#fbbf24"
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "بيسترو المدينة",
    category: "both",
    logo_url: null,
    color_palette: {
      id: "blue",
      name: "أزرق احترافي",
      primary: "#3b82f6",
      secondary: "#2563eb",
      accent: "#60a5fa"
    }
  }
]

// Sample menu data
const sampleMenuData = [
  {
    id: "cat-1",
    name: "المقبلات",
    description: "مقبلات شهية ومتنوعة",
    menu_items: [
      {
        id: "item-1",
        name: "حمص بالطحينة",
        description: "حمص كريمي مع طحينة وزيت الزيتون",
        price: 18.00,
        is_available: true,
        is_featured: true,
        dietary_info: ["vegan", "gluten-free"],
        image_url: null,
        display_order: 1,
        category_id: "cat-1"
      },
      {
        id: "item-2",
        name: "متبل الباذنجان",
        description: "باذنجان مشوي مع طحينة وثوم",
        price: 16.00,
        is_available: true,
        is_featured: false,
        dietary_info: ["vegan"],
        image_url: null,
        display_order: 2,
        category_id: "cat-1"
      }
    ]
  },
  {
    id: "cat-2",
    name: "الأطباق الرئيسية",
    description: "أطباق رئيسية مميزة",
    menu_items: [
      {
        id: "item-3",
        name: "كباب الدجاج",
        description: "قطع دجاج مشوية مع الأرز والسلطة",
        price: 45.00,
        is_available: true,
        is_featured: true,
        dietary_info: ["gluten-free"],
        image_url: null,
        display_order: 1,
        category_id: "cat-2"
      },
      {
        id: "item-4",
        name: "سمك مشوي",
        description: "سمك طازج مشوي مع الخضروات",
        price: 55.00,
        is_available: true,
        is_featured: false,
        dietary_info: ["gluten-free"],
        image_url: null,
        display_order: 2,
        category_id: "cat-2"
      }
    ]
  },
  {
    id: "cat-3",
    name: "المشروبات",
    description: "مشروبات ساخنة وباردة",
    menu_items: [
      {
        id: "item-5",
        name: "قهوة عربية",
        description: "قهوة عربية تقليدية مع الهيل",
        price: 12.00,
        is_available: true,
        is_featured: true,
        dietary_info: ["vegan", "gluten-free"],
        image_url: null,
        display_order: 1,
        category_id: "cat-3"
      },
      {
        id: "item-6",
        name: "شاي بالنعناع",
        description: "شاي أخضر منعش بأوراق النعناع",
        price: 10.00,
        is_available: true,
        is_featured: false,
        dietary_info: ["vegan", "gluten-free"],
        image_url: null,
        display_order: 2,
        category_id: "cat-3"
      }
    ]
  }
]

const colorPalettes = [
  {
    id: "emerald",
    name: "زمردي كلاسيكي",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399"
  },
  {
    id: "amber",
    name: "عنبري دافئ",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24"
  },
  {
    id: "rose",
    name: "وردي أنيق",
    primary: "#e11d48",
    secondary: "#be185d",
    accent: "#f43f5e"
  },
  {
    id: "blue",
    name: "أزرق احترافي",
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa"
  },
  {
    id: "purple",
    name: "بنفسجي ملكي",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    accent: "#a78bfa"
  },
  {
    id: "teal",
    name: "تيل عصري",
    primary: "#14b8a6",
    secondary: "#0d9488",
    accent: "#2dd4bf"
  }
]

export default function AdminTemplateGenerator() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(sampleRestaurants[0])
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg' | 'svg'>('png')
  const [imageQuality, setImageQuality] = useState(1.0)
  const [imageWidth, setImageWidth] = useState(1200)
  const [imageHeight, setImageHeight] = useState(1600)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  
  const templateRef = useRef<HTMLDivElement>(null)

  const handleRestaurantChange = (restaurantId: string) => {
    const restaurant = sampleRestaurants.find(r => r.id === restaurantId)
    if (restaurant) {
      setSelectedRestaurant(restaurant)
    }
  }

  const handleColorPaletteChange = (paletteId: string) => {
    const palette = colorPalettes.find(p => p.id === paletteId)
    if (palette) {
      setSelectedRestaurant(prev => ({
        ...prev,
        color_palette: palette
      }))
    }
  }

  const generateImage = async () => {
    if (!templateRef.current) return

    setIsGenerating(true)
    try {
      let dataUrl: string

      const options = {
        quality: imageQuality,
        width: imageWidth,
        height: imageHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      }

      switch (selectedFormat) {
        case 'png':
          dataUrl = await toPng(templateRef.current, options)
          break
        case 'jpeg':
          dataUrl = await toJpeg(templateRef.current, options)
          break
        case 'svg':
          dataUrl = await toSvg(templateRef.current, options)
          break
        default:
          dataUrl = await toPng(templateRef.current, options)
      }

      setGeneratedImageUrl(dataUrl)
      
      // Auto-download the image
      const link = document.createElement('a')
      link.download = `template-${selectedRestaurant.id}-${selectedRestaurant.color_palette?.id}.${selectedFormat}`
      link.href = dataUrl
      link.click()

    } catch (error) {
      console.error('Error generating image:', error)
      alert('فشل في توليد الصورة. حاول مرة أخرى.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Template Image Generator Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Restaurant Selection */}
            <div className="space-y-2">
              <Label className="text-slate-300">Sample Restaurant</Label>
              <Select value={selectedRestaurant.id} onValueChange={handleRestaurantChange}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {sampleRestaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} ({restaurant.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Palette Selection */}
            <div className="space-y-2">
              <Label className="text-slate-300">Color Palette</Label>
              <Select 
                value={selectedRestaurant.color_palette?.id} 
                onValueChange={handleColorPaletteChange}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {colorPalettes.map((palette) => (
                    <SelectItem key={palette.id} value={palette.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: palette.primary }}
                        />
                        {palette.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Format */}
            <div className="space-y-2">
              <Label className="text-slate-300">Image Format</Label>
              <Select value={selectedFormat} onValueChange={(value: 'png' | 'jpeg' | 'svg') => setSelectedFormat(value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="png">PNG (Best Quality)</SelectItem>
                  <SelectItem value="jpeg">JPEG (Smaller Size)</SelectItem>
                  <SelectItem value="svg">SVG (Vector)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Width */}
            <div className="space-y-2">
              <Label className="text-slate-300">Width (px)</Label>
              <Input
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(Number(e.target.value))}
                className="bg-slate-700/50 border-slate-600 text-white"
                min={400}
                max={3000}
              />
            </div>

            {/* Image Height */}
            <div className="space-y-2">
              <Label className="text-slate-300">Height (px)</Label>
              <Input
                type="number"
                value={imageHeight}
                onChange={(e) => setImageHeight(Number(e.target.value))}
                className="bg-slate-700/50 border-slate-600 text-white"
                min={400}
                max={4000}
              />
            </div>

            {/* Image Quality */}
            <div className="space-y-2">
              <Label className="text-slate-300">Quality (0.1 - 1.0)</Label>
              <Input
                type="number"
                value={imageQuality}
                onChange={(e) => setImageQuality(Number(e.target.value))}
                className="bg-slate-700/50 border-slate-600 text-white"
                min={0.1}
                max={1.0}
                step={0.1}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={generateImage}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Generate & Download Image"}
            </Button>

            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>

          {/* Current Settings Display */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Restaurant: {selectedRestaurant.name}
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Format: {selectedFormat.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Size: {imageWidth}x{imageHeight}
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Quality: {imageQuality}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      {showPreview && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-center">Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={templateRef}
              className="template-container"
              style={{ 
                width: imageWidth, 
                height: imageHeight,
                transform: 'scale(0.5)',
                transformOrigin: 'top left',
                overflow: 'hidden'
              }}
            >
              <ProfessionalCafeMenuPreview
                restaurant={selectedRestaurant}
                categories={sampleMenuData}
                onRefresh={() => {}}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Image Preview */}
      {generatedImageUrl && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Generated Image Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <img 
                src={generatedImageUrl} 
                alt="Generated Template" 
                className="max-w-full h-auto border border-slate-600 rounded-lg"
                style={{ maxHeight: '600px' }}
              />
              <div className="mt-4">
                <Button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.download = `template-${selectedRestaurant.id}-${selectedRestaurant.color_palette?.id}.${selectedFormat}`
                    link.href = generatedImageUrl
                    link.click()
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 