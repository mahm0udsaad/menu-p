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
  Package,
  Plus,
  Languages,
  Type,
  Palette
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import TemplateSelector from "./template-selector"
import Link from "next/link"
import LiveMenuEditor from "./editor/live-menu-editor"
import MenuImportModal from "./ui/menu-import-modal"
import LanguageSelector from "./language-selector"
import FontSettings from "./font-settings"

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
  background_image_url: string | null
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
  const [showImportModal, setShowImportModal] = useState(false)
  const [menuData, setMenuData] = useState<MenuCategory[]>(initialMenuData)

  useEffect(() => {
    if (selectedTemplate) {
      setTotalPages(selectedTemplate.layout_config.pages || 1)
      setActiveTab("editor")
    }
  }, [selectedTemplate])

  // Check if this is a new menu (no items) to show import option
  const isNewMenu = menuData.every(category => 
    !category.menu_items || category.menu_items.length === 0
  )

  // Show import modal automatically for new menus
  useEffect(() => {
    if (isNewMenu && selectedTemplate && activeTab === "editor") {
      // Only show once per session
      const hasShownImport = sessionStorage.getItem(`import-shown-${restaurant.id}`)
      if (!hasShownImport) {
        setShowImportModal(true)
        sessionStorage.setItem(`import-shown-${restaurant.id}`, "true")
      }
    }
  }, [isNewMenu, selectedTemplate, activeTab, restaurant.id])

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

  const handleImportComplete = (importedCategories: MenuCategory[]) => {
    // Merge imported categories with existing ones
    setMenuData(prevData => {
      const newData = [...prevData]
      
      importedCategories.forEach(importedCategory => {
        // Check if category already exists
        const existingCategoryIndex = newData.findIndex(
          cat => cat.name.toLowerCase() === importedCategory.name.toLowerCase()
        )
        
        if (existingCategoryIndex >= 0) {
          // Merge items into existing category
          const existingCategory = newData[existingCategoryIndex]
          const mergedItems = [
            ...existingCategory.menu_items,
            ...importedCategory.menu_items.map(item => ({
              ...item,
              id: `imported-${Date.now()}-${Math.random()}`, // Generate new ID for imported items
              category_id: existingCategory.id
            }))
          ]
          newData[existingCategoryIndex] = {
            ...existingCategory,
            menu_items: mergedItems
          }
        } else {
          // Add new category
          newData.push({
            ...importedCategory,
            id: `imported-cat-${Date.now()}-${Math.random()}`, // Generate new ID for imported category
            menu_items: importedCategory.menu_items.map(item => ({
              ...item,
              id: `imported-${Date.now()}-${Math.random()}`, // Generate new ID for imported items
              category_id: importedCategory.id
            }))
          })
        }
      })
      
      return newData
    })
  }

  const canNavigateNext = currentPage < totalPages
  const canNavigatePrev = currentPage > 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 relative overflow-hidden">
      {/* Subtle background elements - no animations for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-red-100/20 to-rose-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-pink-100/20 to-red-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b border-red-200/50 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
  <div className="px-3 sm:px-4 py-2 sm:py-2.5">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Button 
          variant="ghost" 
          asChild 
          className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-1.5 sm:p-2 transition-colors h-8 w-8 sm:h-auto sm:w-auto sm:px-3"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline sm:mr-2">العودة</span>
          </Link>
        </Button>
        
        <div className="w-px h-4 bg-red-200 hidden sm:block"></div>
        
        <div className="bg-gradient-to-r from-red-500 to-rose-500 p-1.5 rounded-lg shadow-md flex-shrink-0">
          <FileText className="h-4 w-4 text-white" />
        </div>
        
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-tight">
            محرر القائمة
          </h1>
          <p className="text-xs text-gray-600 truncate leading-tight">
            {restaurant.name}
          </p>
        </div>
      </div>
      
      <Badge 
        variant="secondary" 
        className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1 font-medium flex-shrink-0"
      >
        <span className="hidden sm:inline">
          {restaurant.category === "both" ? "مطعم ومقهى" : restaurant.category}
        </span>
        <span className="sm:hidden">
          {restaurant.category === "both" ? "مختلط" : 
           restaurant.category === "restaurant" ? "مطعم" : "مقهى"}
        </span>
      </Badge>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-xl p-1 w-full flex h-auto sm:h-10 gap-1 shadow-sm">
            <TabsTrigger
              value="template"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all rounded-lg text-xs sm:text-sm px-2 sm:px-4 py-2 flex-1 sm:flex-none"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:mr-2" />
              <span className="hidden sm:inline">اختر القالب</span>
              <span className="sm:hidden">القالب</span>
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              disabled={!selectedTemplate}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-4 py-2 flex-1 sm:flex-none"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:mr-2" />
              <span className="hidden sm:inline">محرر القائمة</span>
              <span className="sm:hidden">المحرر</span>
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
              <div className="space-y-4 sm:space-y-6">
                {/* Import Option for New Menus */}
                {isNewMenu && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-500 p-2 rounded-lg flex-shrink-0 shadow-sm">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            استيراد منتجات من قائمة سابقة؟
                          </h3>
                          <p className="text-gray-600 text-sm">
                            يمكنك توفير الوقت بنسخ المنتجات من قوائمك السابقة وتعديلها حسب الحاجة
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowImportModal(true)}
                        className="bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors whitespace-nowrap"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        استيراد منتجات
                      </Button>
                    </div>
                  </div>
                )}

                {/* Live Editor */}
                <LiveMenuEditor
                  restaurant={restaurant}
                  initialMenuData={menuData}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Import Modal */}
      <MenuImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        restaurantId={restaurant.id}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}
