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
import TemplatePreviewRenderer from "./template-preview-renderer"

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
    description: "مشروبات منعشة",
    menu_items: [
      {
        id: "item-5",
        name: "قهوة تركية",
        description: "قهوة تركية تقليدية",
        price: 12.00,
        is_available: true,
        is_featured: true,
        dietary_info: ["vegan"],
        image_url: null,
        display_order: 1,
        category_id: "cat-3"
      },
      {
        id: "item-6",
        name: "شاي بالنعناع",
        description: "شاي أخضر مع النعناع الطازج",
        price: 8.00,
        is_available: true,
        is_featured: false,
        dietary_info: ["vegan"],
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
      // Fetch from the PDF templates metadata file
      const response = await fetch('/data/pdf-templates-metadata.json')
      if (!response.ok) {
        throw new Error('Failed to fetch PDF template metadata')
      }
      
      const registry = await response.json()
      const templateList = Object.values(registry.templates) as TemplateMetadata[]
      setTemplates(templateList)
      
      if (templateList.length > 0) {
        setSelectedTemplate(templateList[0].id)
      }
    } catch (error) {
      console.error('Error loading PDF templates:', error)
    }
  }

  const handleRestaurantChange = (restaurantId: string) => {
    const restaurant = sampleRestaurants.find(r => r.id === restaurantId)
    if (restaurant) {
      setSelectedRestaurant(restaurant)
    }
  }

  const generateSinglePreview = async (templateId: string) => {
    try {
      // Ensure we have the template data
      const templateData = templates.find(t => t.id === templateId)
      if (!templateData) {
        console.error(`❌ Template data not found for ${templateId}`)
        return await generateFallbackPreview(templateId)
      }
      
      // Set the selected template to trigger re-render
      setSelectedTemplate(templateId)
      
      // Wait a bit for the component to re-render
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if the element is visible and has content
      const element = templateRef.current
      if (!element) {
        console.error(`❌ Template element not found for ${templateId}`)
        return await generateFallbackPreview(templateId)
      }
      
      // Wait a bit more for the template to fully render
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if the template has content (not just empty div)
      const hasContent = element.children.length > 0 && element.innerHTML.trim().length > 100
      if (!hasContent) {
        console.error(`❌ Template element has no content for ${templateId}`)
        return await generateFallbackPreview(templateId)
      }
      
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.error(`❌ Template element has no dimensions for ${templateId}: ${element.offsetWidth}x${element.offsetHeight}`)
        return await generateFallbackPreview(templateId)
      }

      console.log(`📸 Capturing preview for ${templateId} with dimensions ${element.offsetWidth}x${element.offsetHeight}`)

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

      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
        console.error(`❌ Generated invalid data URL for ${templateId}`)
        return await generateFallbackPreview(templateId)
      }

      console.log(`✅ Successfully generated preview for ${templateId}`)
      return dataUrl
    } catch (error) {
      console.error(`❌ Error generating image for template ${templateId}:`, error)
      
      // Fallback: create a simple canvas-based preview
      try {
        console.log(`🔄 Attempting fallback preview for ${templateId}`)
        return await generateFallbackPreview(templateId)
      } catch (fallbackError) {
        console.error(`❌ Fallback preview generation also failed for ${templateId}:`, fallbackError)
        return null
      }
    }
  }

  const generateFallbackPreview = async (templateId: string) => {
    try {
      console.log(`🎨 Generating fallback preview for ${templateId}`)
      
      // Create a canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        console.error(`❌ Could not get canvas context for ${templateId}`)
        return null
      }
      
      canvas.width = imageWidth
      canvas.height = imageHeight
      
      // Fill background with a gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f8fafc')
      gradient.addColorStop(1, '#e2e8f0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add a border
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
      
      // Add template name with better styling
      ctx.fillStyle = '#334155'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Template: ${templateId}`, canvas.width / 2, 80)
      
      // Add fallback message
      ctx.font = '16px Arial'
      ctx.fillStyle = '#64748b'
      ctx.fillText('Preview generation failed', canvas.width / 2, 120)
      ctx.fillText('Using fallback canvas preview', canvas.width / 2, 150)
      
      // Add timestamp
      ctx.font = '12px Arial'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(`Generated: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 30)
      
      const dataUrl = canvas.toDataURL('image/png')
      
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
        console.error(`❌ Fallback canvas generated invalid data URL for ${templateId}`)
        return null
      }
      
      console.log(`✅ Fallback preview generated for ${templateId}`)
      return dataUrl
    } catch (error) {
      console.error(`❌ Error generating fallback preview for ${templateId}:`, error)
      return null
    }
  }

  const savePreviewToMetadata = async (templateId: string, imageDataUrl: string) => {
    try {
      console.log(`💾 Saving preview for ${templateId}...`)
      
      // Validate the data URL
      if (!imageDataUrl || imageDataUrl === 'data:,' || imageDataUrl.length < 100) {
        console.error(`❌ Invalid data URL for ${templateId}`)
        return null
      }
      
      // Convert data URL to blob
      const response = await fetch(imageDataUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch data URL: ${response.status}`)
      }
      
      const blob = await response.blob()
      if (blob.size === 0) {
        throw new Error('Generated blob is empty')
      }
      
      console.log(`📦 Blob size for ${templateId}: ${blob.size} bytes`)
      
      // Create FormData to send to server
      const formData = new FormData()
      formData.append('templateId', templateId)
      formData.append('image', blob, `${templateId}-preview.png`)
      
      // Send to server to save in public/previews folder
      const saveResponse = await fetch('/api/templates/save-preview', {
        method: 'POST',
        body: formData
      })
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        throw new Error(`Failed to save preview image: ${saveResponse.status} - ${errorText}`)
      }
      
      const result = await saveResponse.json()
      
      if (!result.imageUrl) {
        throw new Error('Server did not return image URL')
      }
      
      console.log(`✅ Image saved for ${templateId}: ${result.imageUrl}`)
      
      // Update metadata with the saved image URL
      const updateResponse = await fetch('/api/templates/update-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          previewImageUrl: result.imageUrl
        })
      })
      
      if (!updateResponse.ok) {
        console.warn(`⚠️ Failed to update metadata for ${templateId}, but image was saved`)
        const errorText = await updateResponse.text()
        console.warn(`Metadata update error: ${updateResponse.status} - ${errorText}`)
      } else {
        console.log(`✅ Metadata updated for ${templateId}`)
      }
      
      return result.imageUrl
    } catch (error) {
      console.error(`❌ Error saving preview for ${templateId}:`, error)
      return null
    }
  }

  const generateAllPreviews = async () => {
    setIsGeneratingAll(true)
    setProgress(0)
    setGenerationStatus({ success: [], failed: [], inProgress: [] })
    
    const templateIds = templates.map(t => t.id)
    const totalTemplates = templateIds.length
    let successfulCount = 0
    let failedCount = 0
    
    for (let i = 0; i < templateIds.length; i++) {
      const templateId = templateIds[i]
      setCurrentTemplate(templateId)
      setProgress((i / totalTemplates) * 100)
      
      setGenerationStatus(prev => ({
        ...prev,
        inProgress: [...prev.inProgress, templateId]
      }))
      
      try {
        console.log(`🔄 Generating preview for template: ${templateId}`)
        let imageDataUrl = await generateSinglePreview(templateId)
        
        // Retry once if the first attempt fails
        if (!imageDataUrl) {
          console.log(`🔄 First attempt failed for ${templateId}, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
          imageDataUrl = await generateSinglePreview(templateId)
        }
        
        if (imageDataUrl) {
          console.log(`✅ Generated image for ${templateId}, saving to metadata...`)
          // Save the image to public/previews folder
          const savedUrl = await savePreviewToMetadata(templateId, imageDataUrl)
          
          if (savedUrl) {
            console.log(`✅ Successfully saved preview for ${templateId}: ${savedUrl}`)
            successfulCount++
            setGenerationStatus(prev => ({
              ...prev,
              success: [...prev.success, templateId],
              inProgress: prev.inProgress.filter(id => id !== templateId)
            }))
          } else {
            console.error(`❌ Failed to save preview for ${templateId}`)
            failedCount++
            setGenerationStatus(prev => ({
              ...prev,
              failed: [...prev.failed, templateId],
              inProgress: prev.inProgress.filter(id => id !== templateId)
            }))
          }
        } else {
          console.error(`❌ Failed to generate image for ${templateId} after retry`)
          failedCount++
          setGenerationStatus(prev => ({
            ...prev,
            failed: [...prev.failed, templateId],
            inProgress: prev.inProgress.filter(id => id !== templateId)
          }))
        }
      } catch (error) {
        console.error(`❌ Error generating preview for ${templateId}:`, error)
        failedCount++
        setGenerationStatus(prev => ({
          ...prev,
          failed: [...prev.failed, templateId],
          inProgress: prev.inProgress.filter(id => id !== templateId)
        }))
      }
      
      // Small delay between generations to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    setProgress(100)
    setIsGeneratingAll(false)
    setCurrentTemplate("")
    
    // Log final results
    console.log(`🎉 Preview generation completed!`)
    console.log(`✅ Successful: ${successfulCount} templates`)
    console.log(`❌ Failed: ${failedCount} templates`)
    
    if (successfulCount > 0) {
      console.log(`💾 Successfully saved ${successfulCount} preview(s) to metadata`)
    }
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

            {/* Show Preview Toggle */}
            <div className="space-y-2">
              <Label className="text-slate-300">Show Preview</Label>
              <Button
                variant={showPreview ? "default" : "outline"}
                onClick={() => setShowPreview(!showPreview)}
                className="w-full bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
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
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Test Preview
                </>
              )}
            </Button>

            <Button
              onClick={generateAllPreviews}
              disabled={isGeneratingAll || templates.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isGeneratingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating All...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Generate All Previews
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {isGeneratingAll && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Generation Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="text-center text-slate-300">
              {currentTemplate && (
                <div>Currently generating: <Badge variant="secondary">{currentTemplate}</Badge></div>
              )}
              <div>Progress: {Math.round(progress)}%</div>
            </div>

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
                  {generationStatus.success.length > 0 && (
                    <div className="mt-2 text-sm">
                      💡 {generationStatus.success.length} preview(s) were successfully generated and saved. You can continue using the application normally.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      {(showPreview || isGeneratingAll) && selectedTemplateData && (
        <Card className={`bg-white ${isGeneratingAll ? 'hidden' : ''}`}>
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
                <TemplatePreviewRenderer
                  templateId={selectedTemplateData.id}
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