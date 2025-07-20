"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Loader2, Check, Eye, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"

interface Template {
  id: string
  name: string
  description: string
  category: string
  layout_config: any
  preview_image_url: string | null
  previewImageUrl?: string
}

interface TemplateSelectorProps {
  restaurantCategory: string
  onTemplateSelect: (template: Template) => void
  selectedTemplateId?: string
  initialTemplates?: Template[]
}

export default function TemplateSelector({
  restaurantCategory,
  onTemplateSelect,
  selectedTemplateId,
  initialTemplates = [],
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [loading, setLoading] = useState(!initialTemplates.length)
  const [error, setError] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialTemplates.length) {
      fetchTemplates()
    }
  }, [restaurantCategory, initialTemplates.length])

  const fetchTemplates = async () => {
    try {
      setLoading(true)

      // Fetch templates that match the restaurant category or are universal
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .in("category", [restaurantCategory, "both"])
        .eq("is_active", true)
        .order("name")

      if (error) throw error

      setTemplates(data || [])
    } catch (err) {
      console.error("Error fetching templates:", err)
      setError("Failed to load templates")
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card selection when clicking preview
    setPreviewTemplate(template)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setPreviewTemplate(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchTemplates} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
          حاول مرة أخرى
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center sm:text-right">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">اختر القالب المناسب</h2>
          <p className="text-gray-600 text-sm sm:text-base">اختر قالب يناسب طابع {restaurantCategory === 'both' ? 'مطعمك ومقهاك' : restaurantCategory}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates.map((template) => (
            <div key={template.id} className="relative group cursor-pointer" onClick={() => onTemplateSelect(template)}>
              {/* Full Image Card */}
              <div className={`relative w-full h-[350px] sm:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                selectedTemplateId === template.id ? "ring-2 ring-red-400 shadow-red-200/50" : ""
              }`}>
                
                {/* Template Image - Full Coverage */}
                <Image 
                  src={template.previewImageUrl || template.preview_image_url || "/placeholder.svg?height=400&width=300"}
                  alt={template.name}
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay for Better Button Visibility */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                {/* Content Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6">
                  <div className="text-right space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <h2 className="text-white text-lg sm:text-2xl font-bold drop-shadow-lg">
                      {template.name}
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base drop-shadow-md line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
                
                {/* Floating Action Buttons - Mobile Optimized */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  
                  {/* Preview Button */}
                  <Button
                    onClick={(e) => handlePreview(template, e)}
                    className="flex items-center gap-1 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl font-semibold text-gray-800 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  >
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>معاينة</span>
                  </Button>
                  
                  {/* Select Button */}
                  <Button
                    onClick={() => onTemplateSelect(template)}
                    className="flex items-center gap-1 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-red-500 rounded-lg sm:rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:bg-red-600 transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>اختيار</span>
                  </Button>
                </div>
                
                {/* Category Badge - Top Right */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-100/90 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg border border-red-200">
                  {template.category === "both" ? "شامل" : template.category}
                </div>
                
                {/* Selected Indicator */}
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    مُختار
                  </div>
                )}
                
                {/* Subtle Frame Effect */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-black/10 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center p-6 sm:p-8">
            <p className="text-gray-500 text-sm sm:text-base">لا توجد قوالب متاحة لنوع مطعمك.</p>
          </div>
        )}
      </div>

      {/* Preview Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-white border-red-200 max-h-[90vh]">
          <DrawerHeader className="border-b border-red-200 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-gray-900 text-lg sm:text-xl truncate">
                  {previewTemplate?.name}
                </DrawerTitle>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                  {previewTemplate?.description}
                </p>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {previewTemplate && (
              <div className="max-w-2xl mx-auto">
                <div className="aspect-[3/4] w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-xl border border-red-200">
                  <Image
                    src={previewTemplate.previewImageUrl || previewTemplate.preview_image_url || "/placeholder.svg?height=600&width=450"}
                    alt={previewTemplate.name}
                    width={450}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="mt-6 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{previewTemplate.name}</h3>
                    <p className="text-gray-600">{previewTemplate.description}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => {
                        onTemplateSelect(previewTemplate)
                        handleCloseDrawer()
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      اختيار هذا القالب
                    </Button>
                    <Button
                      onClick={handleCloseDrawer}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 px-8 py-2 transition-colors"
                    >
                      إغلاق
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}