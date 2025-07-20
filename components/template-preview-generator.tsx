"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Camera, RefreshCw, Eye, Palette, CheckCircle, AlertCircle, Settings } from "lucide-react"
import { toPng } from 'html-to-image'
import { Alert, AlertDescription } from "@/components/ui/alert"
import SimpleTemplatePreview from "./simple-template-preview"

// Sample restaurant data for template generation
const sampleRestaurants = [
  {
    id: "sample-1",
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
    id: "sample-2", 
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
    id: "sample-3",
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

interface TemplateMetadata {
  id: string
  name: string
  description: string
  componentPath: string
  previewComponentPath: string
  category: string
  features: string[]
  defaultSettings: any
  previewImageUrl?: string
}

interface TemplateRegistry {
  templates: Record<string, TemplateMetadata>
  categories: Record<string, { name: string; description: string }>
  defaultTemplate: string
  version: string
}

export default function TemplatePreviewGenerator() {
  const [templates, setTemplates] = useState<TemplateMetadata[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedRestaurant, setSelectedRestaurant] = useState(sampleRestaurants[0])
  const [imageWidth, setImageWidth] = useState(400)
  const [imageHeight, setImageHeight] = useState(600)
  const [imageQuality, setImageQuality] = useState(0.9)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentTemplate, setCurrentTemplate] = useState<string>("")
  const [generationStatus, setGenerationStatus] = useState<{
    success: string[]
    failed: string[]
    inProgress: string[]
  }>({ success: [], failed: [], inProgress: [] })
  
  const templateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates/metadata')
      if (!response.ok) {
        throw new Error('Failed to fetch template metadata')
      }
      
      const registry: TemplateRegistry = await response.json()
      const templateList = Object.values(registry.templates)
      setTemplates(templateList)
      
      if (templateList.length > 0) {
        setSelectedTemplate(templateList[0].id)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleRestaurantChange = (restaurantId: string) => {
    const restaurant = sampleRestaurants.find(r => r.id === restaurantId)
    if (restaurant) {
      setSelectedRestaurant(restaurant)
    }
  }

  const generateSinglePreview = async (templateId: string) => {
    if (!templateRef.current) return null

    try {
      // Set the selected template to trigger re-render
      setSelectedTemplate(templateId)
      
      // Wait a bit for the component to re-render
      await new Promise(resolve => setTimeout(resolve, 300))

      // Check if the element is visible and has content
      const element = templateRef.current
      if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.error('Template element is not visible or has no dimensions')
        return null
      }

      const dataUrl = await toPng(element, {
        quality: imageQuality,
        width: imageWidth,
        height: imageHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        filter: (node) => {
          // Filter out any problematic nodes
          return !node.classList?.contains('no-capture')
        }
      })

      return dataUrl
    } catch (error) {
      console.error('Error generating image for template:', templateId, error)
      
      // Fallback: create a simple canvas-based preview
      try {
        return await generateFallbackPreview(templateId)
      } catch (fallbackError) {
        console.error('Fallback preview generation also failed:', fallbackError)
        return null
      }
    }
  }

  const generateFallbackPreview = async (templateId: string) => {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = imageWidth
    canvas.height = imageHeight

    // Get template style
    const template = templates.find(t => t.id === templateId)
    if (!template) return null

    // Simple fallback styling
    const bgColor = templateId === 'modern' ? '#1f2937' : 
                   templateId === 'painting' ? '#fef3c7' : 
                   templateId === 'vintage' ? '#f5f5dc' : '#ffffff'
    
    const textColor = templateId === 'modern' ? '#ffffff' : '#000000'

    // Fill background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add template name
    ctx.fillStyle = textColor
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(template.name, canvas.width / 2, 50)

    // Add description
    ctx.font = '16px Arial'
    ctx.fillText(template.description, canvas.width / 2, 80)

    // Add restaurant name
    ctx.font = '20px Arial'
    ctx.fillText(selectedRestaurant.name, canvas.width / 2, 120)

    return canvas.toDataURL('image/png', imageQuality)
  }

  const savePreviewToMetadata = async (templateId: string, imageDataUrl: string) => {
    try {
      const response = await fetch('/api/templates/update-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          previewImageUrl: imageDataUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save preview to metadata')
      }

      return true
    } catch (error) {
      console.error('Error saving preview to metadata:', error)
      return false
    }
  }

  const generateAllPreviews = async () => {
    setIsGeneratingAll(true)
    setProgress(0)
    setGenerationStatus({ success: [], failed: [], inProgress: [] })

    const totalTemplates = templates.length
    let completed = 0

    for (const template of templates) {
      setCurrentTemplate(template.name)
      setGenerationStatus(prev => ({
        ...prev,
        inProgress: [...prev.inProgress, template.name]
      }))

      // Generate preview for this template
      console.log(`Generating preview for template: ${template.id}`)
      const imageDataUrl = await generateSinglePreview(template.id)
      
      if (imageDataUrl) {
        console.log(`Successfully generated image for ${template.id}, saving to metadata...`)
        // Save to metadata
        const saved = await savePreviewToMetadata(template.id, imageDataUrl)
        
        if (saved) {
          console.log(`Successfully saved metadata for ${template.id}`)
          setGenerationStatus(prev => ({
            ...prev,
            success: [...prev.success, template.name],
            inProgress: prev.inProgress.filter(name => name !== template.name)
          }))
        } else {
          console.error(`Failed to save metadata for ${template.id}`)
          setGenerationStatus(prev => ({
            ...prev,
            failed: [...prev.failed, template.name],
            inProgress: prev.inProgress.filter(name => name !== template.name)
          }))
        }
      } else {
        console.error(`Failed to generate image for ${template.id}`)
        setGenerationStatus(prev => ({
          ...prev,
          failed: [...prev.failed, template.name],
          inProgress: prev.inProgress.filter(name => name !== template.name)
        }))
      }

      completed++
      setProgress((completed / totalTemplates) * 100)
      
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setIsGeneratingAll(false)
    setCurrentTemplate("")
  }

  const generateSingleTemplatePreview = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    setGeneratedImageUrl(null)

    try {
      const imageDataUrl = await generateSinglePreview(selectedTemplate)
      
      if (imageDataUrl) {
        setGeneratedImageUrl(imageDataUrl)
        
        // Auto-download the image
        const link = document.createElement('a')
        link.download = `template-${selectedTemplate}-preview.png`
        link.href = imageDataUrl
        link.click()
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('فشل في توليد الصورة. حاول مرة أخرى.')
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-8">
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template Preview Generator Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label className="text-slate-300">Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {/* Image Width */}
            <div className="space-y-2">
              <Label className="text-slate-300">Width (px)</Label>
              <Input
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(Number(e.target.value))}
                className="bg-slate-700/50 border-slate-600 text-white"
                min={200}
                max={800}
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
                min={300}
                max={1200}
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
              onClick={generateSingleTemplatePreview}
              disabled={isGenerating || !selectedTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Generate Single Preview"}
            </Button>

            <Button
              onClick={generateAllPreviews}
              disabled={isGeneratingAll || templates.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isGeneratingAll ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGeneratingAll ? "Generating All..." : "Generate All Previews"}
            </Button>

            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>

            <Button
              onClick={async () => {
                console.log('Testing preview generation...')
                const result = await generateSinglePreview(selectedTemplate || templates[0]?.id)
                console.log('Test result:', result ? 'Success' : 'Failed')
                if (result) {
                  setGeneratedImageUrl(result)
                }
              }}
              variant="outline"
              className="border-yellow-600 text-yellow-300 hover:bg-yellow-700"
            >
              Test Preview
            </Button>
          </div>

          {/* Current Settings Display */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Template: {selectedTemplateData?.name || "None"}
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Restaurant: {selectedRestaurant.name}
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

      {/* Batch Generation Progress */}
      {isGeneratingAll && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Generating All Template Previews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            {currentTemplate && (
              <div className="text-center text-slate-300">
                Currently generating: <span className="font-semibold">{currentTemplate}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-green-400">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Success: {generationStatus.success.length}
              </div>
              <div className="text-red-400">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Failed: {generationStatus.failed.length}
              </div>
              <div className="text-yellow-400">
                <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" />
                In Progress: {generationStatus.inProgress.length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Results */}
      {!isGeneratingAll && (generationStatus.success.length > 0 || generationStatus.failed.length > 0) && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Generation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generationStatus.success.length > 0 && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  Successfully generated {generationStatus.success.length} preview(s): {generationStatus.success.join(', ')}
                </AlertDescription>
              </Alert>
            )}
            
            {generationStatus.failed.length > 0 && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  Failed to generate {generationStatus.failed.length} preview(s): {generationStatus.failed.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      {showPreview && selectedTemplateData && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-center">Template Preview - {selectedTemplateData.name}</CardTitle>
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
              {selectedTemplateData && (
                <SimpleTemplatePreview
                  templateId={selectedTemplateData.id}
                  templateName={selectedTemplateData.name}
                  templateDescription={selectedTemplateData.description}
                  restaurant={selectedRestaurant}
                  categories={sampleMenuData}
                />
              )}
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
                    link.download = `template-${selectedTemplate}-preview.png`
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