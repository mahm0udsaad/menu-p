"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, FileText, Download, Eye, Palette } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: string
  name: string
  description: string
}

interface PDFTemplateSelectorProps {
  menuId: string
  currentTemplate?: string
  onTemplateSelect?: (templateId: string) => void
  onPDFGenerated?: (pdfUrl: string) => void
  customizations?: any
  language?: string
}

export const PDFTemplateSelector: React.FC<PDFTemplateSelectorProps> = ({
  menuId,
  currentTemplate = 'classic',
  onTemplateSelect,
  onPDFGenerated,
  customizations = {},
  language = 'ar'
}) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  // Load available templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/menu-pdf/generate')
        if (!response.ok) throw new Error('Failed to load templates')
        
        const data = await response.json()
        setTemplates(data.templates || [])
      } catch (error) {
        console.error('Error loading templates:', error)
        toast({
          title: "خطأ في تحميل القوالب",
          description: "حدث خطأ أثناء تحميل قوالب PDF",
          variant: "destructive"
        })
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    loadTemplates()
  }, [toast])

  // Update selected template when prop changes
  useEffect(() => {
    setSelectedTemplate(currentTemplate)
  }, [currentTemplate])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    onTemplateSelect?.(templateId)
  }

  const generatePDF = async (templateId: string) => {
    if (!menuId) {
      toast({
        title: "خطأ",
        description: "معرف القائمة مطلوب لإنشاء PDF",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/menu-pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuId,
          templateId,
          language,
          customizations,
          format: 'A4'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'فشل في إنشاء PDF')
      }

      const data = await response.json()
      
      toast({
        title: "تم إنشاء PDF بنجاح",
        description: data.cached 
          ? "تم استخدام نسخة محفوظة من PDF" 
          : "تم إنشاء PDF جديد بنجاح",
      })

      onPDFGenerated?.(data.pdfUrl)
      
      // Open PDF in new tab
      window.open(data.pdfUrl, '_blank')
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "خطأ في إنشاء PDF",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const previewTemplate = (templateId: string) => {
    // This could open a preview modal or navigate to preview page
    toast({
      title: "معاينة القالب",
      description: `معاينة قالب ${templates.find(t => t.id === templateId)?.name}`,
    })
  }

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'modern':
        return '🎨'
      case 'vintage':
        return '📜'
      case 'painting':
        return '🖼️'
      case 'classic':
      case 'cafe':
      default:
        return '☕'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          إنشاء PDF
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            اختر قالب PDF
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[60vh]">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">جاري تحميل القوالب...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getTemplateIcon(template.id)}
                        </span>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      {selectedTemplate === template.id && (
                        <Badge variant="default">مختار</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 text-right">
                      {template.description}
                    </CardDescription>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          previewTemplate(template.id)
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        معاينة
                      </Button>
                      
                      <Button
                        variant={selectedTemplate === template.id ? "default" : "secondary"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          generatePDF(template.id)
                        }}
                        disabled={isGenerating}
                        className="flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            جاري الإنشاء...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            إنشاء PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {!isLoadingTemplates && templates.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد قوالب متاحة</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PDFTemplateSelector 