"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useMenuEditor, TemplateId } from "@/contexts/menu-editor-context"
import { CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

interface TemplateMetadata {
  id: string
  name: string
  description: string
  componentPath: string
  previewComponentPath: string
  category: string
  features: string[]
  defaultSettings: any
  previewImageUrl: string
}

interface TemplateRegistry {
  templates: Record<string, TemplateMetadata>
  categories: Record<string, { name: string; description: string }>
  defaultTemplate: string
  version: string
}

interface Template {
  id: string
  name: string
  previewUrl: string
}

export function TemplateSwitcherModal() {
  const { showTemplateSwitcherModal, setShowTemplateSwitcherModal, selectedTemplate, handleTemplateChange } = useMenuEditor()
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
          previewUrl: template.previewImageUrl,
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

  if (loading) {
    return (
      <Dialog open={showTemplateSwitcherModal} onOpenChange={setShowTemplateSwitcherModal}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Choose a Menu Template</DialogTitle>
            <DialogDescription>
              Loading available templates...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={showTemplateSwitcherModal} onOpenChange={setShowTemplateSwitcherModal}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Choose a Menu Template</DialogTitle>
          <DialogDescription>
            Select a template that best fits your restaurant's style. Your content will automatically adapt.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-400'
                }`}
                onClick={() => handleTemplateChange(template.id as TemplateId)}
              >
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 z-10 bg-white rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                )}
                <div className="overflow-hidden rounded-md">
                  <Image
                    src={template.previewUrl}
                    alt={template.name}
                    width={300}
                    height={400}
                    className="object-cover w-full h-auto"
                  />
                </div>
                <div className="p-3 bg-white rounded-b-lg">
                  <h3 className="font-semibold text-center text-sm">{template.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 