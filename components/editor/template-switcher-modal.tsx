"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useMenuEditor, TemplateId } from "@/contexts/menu-editor-context"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"

const templates = [
  {
    id: 'classic',
    name: 'Classic Professional',
    previewUrl: '/previews/classic-preview.png', // Placeholder path
  },
  {
    id: 'painting',
    name: 'Artistic Painting',
    previewUrl: '/previews/painting-preview.png', // Placeholder path
  },
  {
    id: 'vintage',
    name: 'Classic Vintage',
    previewUrl: '/previews/painting-preview.png', // Placeholder for vintage style
  },
  {
    id: 'modern',
    name: 'Modern Style',
    previewUrl: '/previews/modern-preview.png',
  },
]

export function TemplateSwitcherModal() {
  const { showTemplateSwitcherModal, setShowTemplateSwitcherModal, selectedTemplate, handleTemplateChange } = useMenuEditor()

  return (
    <Dialog open={showTemplateSwitcherModal} onOpenChange={setShowTemplateSwitcherModal}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a Menu Template</DialogTitle>
          <DialogDescription>
            Select a template that best fits your restaurant's style. Your content will automatically adapt.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
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
                  width={400}
                  height={560}
                  className="object-cover w-full h-auto"
                />
              </div>
              <div className="p-3 bg-white rounded-b-lg">
                <h3 className="font-semibold text-center">{template.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 