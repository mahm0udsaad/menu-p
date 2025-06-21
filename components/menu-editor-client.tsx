"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  FileText,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Coffee,
  UtensilsCrossed,
  Star,
  Heart,
  BarChart3,
} from "lucide-react"
import TemplateSelector from "./template-selector"
import Link from "next/link"
import LiveMenuEditor from "./editor/live-menu-editor"

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  layout_config: any
  preview_image_url: string | null
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuEditorClientProps {
  restaurant: Restaurant
  initialMenuData: MenuCategory[]
  initialTemplates: Template[]
}

export default function MenuEditorClient({ 
  restaurant, 
  initialMenuData, 
  initialTemplates 
}: MenuEditorClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState("template")
  const [draftData, setDraftData] = useState<any>({})

  useEffect(() => {
    if (selectedTemplate) {
      setTotalPages(selectedTemplate.layout_config.pages || 1)
      setActiveTab("editor")
    }
  }, [selectedTemplate])

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setCurrentPage(1)
  }

  const handleSaveDraft = (data: any) => {
    setDraftData((prev: any) => ({
      ...prev,
      [currentPage]: data,
    }))
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const canNavigateNext = currentPage < totalPages
  const canNavigatePrev = currentPage > 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 animate-bounce delay-100">
          <Coffee className="h-8 w-8 text-emerald-400/5" />
        </div>
        <div className="absolute top-40 left-32 animate-pulse delay-300">
          <UtensilsCrossed className="h-12 w-12 text-emerald-300/5" />
        </div>
        <div className="absolute top-60 right-1/3 animate-bounce delay-500">
          <QrCode className="h-10 w-10 text-emerald-500/5" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-700">
          <FileText className="h-14 w-14 text-emerald-400/5" />
        </div>
        <div className="absolute bottom-60 right-20 animate-bounce delay-1000">
          <Star className="h-8 w-8 text-emerald-300/5" />
        </div>
        <div className="absolute top-1/3 left-1/4 animate-pulse delay-200">
          <Star className="h-6 w-6 text-yellow-400/5" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-800">
          <Heart className="h-7 w-7 text-red-400/5" />
        </div>
        <div className="absolute top-1/2 right-10 animate-pulse delay-600">
          <BarChart3 className="h-9 w-9 text-emerald-400/5" />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="ghost" asChild className="text-slate-400 hover:text-white">
              <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  العودة للوحة التحكم
                </Link>
                </Button>
              <div className="w-px h-6 bg-slate-600"></div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">محرر القائمة</h1>
                <p className="text-slate-300">{restaurant.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400 border-emerald-400/30">
                {restaurant.category === "both" ? "مطعم ومقهى" : restaurant.category}
                  </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 rounded-xl p-1">
            <TabsTrigger
              value="template"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white rounded-lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              اختر القالب
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              disabled={!selectedTemplate}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white rounded-lg disabled:opacity-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              محرر القائمة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template">
            <TemplateSelector
              restaurantCategory={restaurant.category}
              onTemplateSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
              initialTemplates={initialTemplates}
            />
          </TabsContent>

          <TabsContent value="editor">
            {selectedTemplate && (
              <div className="space-y-6">
                {/* Page Navigation */}
                {totalPages > 1 && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!canNavigatePrev}
                          className="border-slate-600"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          السابق
                        </Button>
                        <span className="text-white px-4">
                          صفحة {currentPage} من {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!canNavigateNext}
                          className="border-slate-600"
                        >
                          التالي
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                      <div className="text-slate-400 text-sm">
                        تحرير قالب: {selectedTemplate.name}
                      </div>
                    </div>
          </div>
                )}

                {/* Live Menu Editor */}
                <LiveMenuEditor restaurant={restaurant} initialMenuData={initialMenuData} />
          </div>
        )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
