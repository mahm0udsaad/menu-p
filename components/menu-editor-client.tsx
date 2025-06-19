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

interface MenuEditorClientProps {
  restaurant: Restaurant
}

export default function MenuEditorClient({ restaurant }: MenuEditorClientProps) {
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
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  العودة للوحة التحكم
                </Button>
              </Link>

              <div className="h-6 w-px bg-slate-600" />

              <div>
                <h1 className="text-xl font-bold text-white">محرر القائمة</h1>
                <p className="text-sm text-slate-400">{restaurant.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedTemplate && (
                <>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-600/20 text-emerald-400 border-emerald-400/30 rounded-lg"
                  >
                    {selectedTemplate.name}
                  </Badge>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!canNavigatePrev}
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="text-sm text-slate-300 px-2">
                        صفحة {currentPage} من {totalPages}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!canNavigateNext}
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="border-slate-600 hover:bg-slate-700/50 rounded-xl"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    تغيير القالب
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2 relative z-10">
        {!selectedTemplate ? (
          // Template Selection - Compact Layout
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">اختر قالب قائمتك</h2>
              <p className="text-slate-400">ابدأ بتحديد القالب المناسب لمطعمك</p>
            </div>
            <TemplateSelector
              restaurantCategory={restaurant.category}
              onTemplateSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate ? selectedTemplate.id : undefined}
            />
          </div>
        ) : (
          // Live Menu Editor - Full Layout
          <div className="h-[calc(100vh-120px)]">
            <LiveMenuEditor restaurant={restaurant} />
          </div>
        )}
      </main>
    </div>
  )
}
