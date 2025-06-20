"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
}

export default function TemplateSelector({
  restaurantCategory,
  onTemplateSelect,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [restaurantCategory])

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
            <Card
              key={template.id}
              className={`bg-slate-800/50 border-slate-700 backdrop-blur cursor-pointer transition-all hover:border-emerald-400 ${
                selectedTemplateId === template.id ? "border-emerald-400 ring-2 ring-emerald-400/20" : ""
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                  {selectedTemplateId === template.id && <Check className="h-5 w-5 text-emerald-400" />}
                </div>
                <Badge variant="secondary" className="w-fit bg-emerald-600/20 text-emerald-400 border-emerald-400/30">
                  {template.category === "both" ? "Universal" : template.category}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {template.preview_image_url && (
                  <div className="relative group">
                    {/* Larger image preview */}
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-slate-700">
                      <Image
                        src={template.preview_image_url || "/placeholder.svg?height=400&width=300"}
                        alt={`${template.name} preview`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      
                      {/* Preview overlay button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30"
                          onClick={(e) => handlePreview(template, e)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-slate-300 text-sm">{template.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{template.layout_config.pages || 1} page(s)</span>
                  <span>{template.layout_config.sections?.length || 0} sections</span>
                </div>

                {/* Preview button for mobile or as alternative */}
                {template.preview_image_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={(e) => handlePreview(template, e)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Full Preview
                  </Button>
                )}
              </CardContent>
            </Card>
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