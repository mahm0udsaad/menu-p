"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check } from "lucide-react"
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
                <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-slate-700">
                  <Image
                    src={template.preview_image_url || "/placeholder.svg?height=200&width=300"}
                    alt={`${template.name} preview`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-slate-300 text-sm">{template.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{template.layout_config.pages || 1} page(s)</span>
                <span>{template.layout_config.sections?.length || 0} sections</span>
              </div>
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
  )
}
