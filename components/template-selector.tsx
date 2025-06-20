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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchTemplates} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Template</h2>
          <p className="text-slate-300">Select a template that matches your {restaurantCategory} style</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="relative group cursor-pointer" onClick={() => onTemplateSelect(template)}>
              {/* Full Image Card */}
              <div className={`relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${
                selectedTemplateId === template.id ? "ring-2 ring-emerald-400" : ""
              }`}>
                
                {/* Template Image - Full Coverage */}
                <Image 
                  src={template.preview_image_url || "/placeholder.svg?height=400&width=300"}
                  alt={template.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay for Better Button Visibility */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="text-right space-y-2 mb-4">
                    <h2 className="text-white text-2xl font-bold drop-shadow-lg">
                      {template.name}
                    </h2>
                    <p className="text-white/90 text-base drop-shadow-md">
                      {template.description}
                    </p>
                  </div>
                </div>
                
                {/* Floating Action Buttons - Center */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  
                  {/* Preview Button */}
                  <Button
                    onClick={(e) => handlePreview(template, e)}
                    className="flex items-center gap-3 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-xl font-semibold text-gray-800 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 hover:scale-105"
                  >
                    <Eye className="w-5 h-5" />
                    <span>معاينة</span>
                  </Button>
                  
                  {/* Select Button */}
                  <Button
                    onClick={() => onTemplateSelect(template)}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                  >
                    <Check className="w-5 h-5" />
                    <span>اختيار</span>
                  </Button>
                </div>
                
                {/* Category Badge - Top Right */}
                <div className="absolute top-4 right-4 bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-emerald-400/30">
                  {template.category === "both" ? "Universal" : template.category}
                </div>
                
                {/* Subtle Frame Effect */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/10 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center p-8">
            <p className="text-slate-400">No templates available for your restaurant type.</p>
          </div>
        )}
      </div>

      {/* Preview Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-slate-900 border-slate-700 max-h-[90vh]">
          <DrawerHeader className="border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-white text-xl">
                  {previewTemplate?.name}
                </DrawerTitle>
                <p className="text-slate-400 text-sm mt-1">
                  {previewTemplate?.description}
                </p>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={handleCloseDrawer}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="p-6 overflow-auto">
            {previewTemplate?.preview_image_url && (
              <div className="flex justify-center">
                <div className="relative max-w-4xl w-full">
                  <Image
                    src={previewTemplate.preview_image_url}
                    alt={`${previewTemplate.name} full preview`}
                    width={800}
                    height={1000}
                    className="rounded-lg shadow-2xl object-contain w-full h-auto"
                    priority
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  if (previewTemplate) {
                    onTemplateSelect(previewTemplate)
                  }
                  handleCloseDrawer()
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Select This Template
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseDrawer}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}