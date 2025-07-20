"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Eye } from "lucide-react"
import Link from "next/link"

interface Template {
  id: string
  name: string
  description: string
  preview: string
  category: string
  isNew?: boolean
  menuPath?: string
}

interface TemplateMetadata {
  id: string
  name: string
  description: string
  componentPath: string
  previewComponentPath: string
  category: string
  features: string[]
  defaultSettings: any
}

interface TemplateRegistry {
  templates: Record<string, TemplateMetadata>
  categories: Record<string, { name: string; description: string }>
  defaultTemplate: string
  version: string
}

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/templates/metadata')
        if (!response.ok) {
          throw new Error('Failed to fetch template metadata')
        }
        
        const registry: TemplateRegistry = await response.json()
        
        // Convert registry templates to Template format
        const templateList: Template[] = Object.values(registry.templates).map((template) => ({
          id: template.id,
          name: template.name,
          description: template.description,
          preview: `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(template.name)}`,
          category: registry.categories[template.category]?.name || template.category,
          isNew: template.id.includes('fast-food') || template.id.includes('elegant-cocktail') || 
                 template.id.includes('sweet-treats') || template.id.includes('simple-coffee') || 
                 template.id.includes('borcelle-coffee') || template.id.includes('luxury-menu') ||
                 template.id.includes('chalkboard-coffee') || template.id.includes('botanical-cafe') ||
                 template.id.includes('cocktail-menu') || template.id.includes('vintage-bakery') ||
                 template.id.includes('vintage-coffee') || template.id.includes('interactive-menu'),
          menuPath: `/menus/${template.id}`,
        }))
        
        setTemplates(templateList)
        setLoading(false)
      } catch (error) {
        console.error('Error loading templates:', error)
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))]

  const filteredTemplates =
    selectedCategory === "All" ? templates : templates.filter((t) => t.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Templates...</h1>
            <p className="text-xl text-gray-600">Please wait while we load the available templates.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Menu Template</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our collection of professionally designed menu templates. Each template is fully customizable
            with inline editing capabilities.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <CardContent className="p-0">
                {/* Preview Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  {template.isNew && (
                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">New</Badge>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{template.description}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={() => onSelectTemplate(template.id)} className="flex-1" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {template.menuPath && (
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href={template.menuPath} target="_blank">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Preview
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>All templates include inline editing, drag & drop functionality, and export options</p>
          <p className="text-sm mt-2">
            Templates with preview links show the published menu page • Edit mode allows customization
          </p>
        </div>
      </div>
    </div>
  )
}
