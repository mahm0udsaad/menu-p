"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  FileText,
  Settings,
  Package,
} from "lucide-react"
import TemplateSelector from "@/components/template-selector"
import LiveMenuEditor from "@/components/editor/live-menu-editor"
import MenuImportModal from "@/components/ui/menu-import-modal"
import { MenuEditorProvider } from "@/contexts/menu-editor-context"

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
  background_image_url?: string | null
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

interface MenuEditorTabsProps {
  activeTab: string
  selectedTemplate: Template | null
  restaurant: Restaurant
  initialMenuData: MenuCategory[]
  initialTemplates: Template[]
  isNewMenu: boolean
}

export default function MenuEditorTabs({
  activeTab,
  selectedTemplate,
  restaurant,
  initialMenuData,
  initialTemplates,
  isNewMenu
}: MenuEditorTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showImportModal, setShowImportModal] = useState(false)
  const [menuData, setMenuData] = useState<MenuCategory[]>(initialMenuData)

  // Show import modal automatically for new menus when they reach the editor tab
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

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (newTab === "template") {
      params.set("tab", "template")
      // Remove template param when going back to template selection
      params.delete("template")
    } else if (newTab === "editor" && selectedTemplate) {
      params.set("tab", "editor")
      params.set("template", selectedTemplate.id)
    }
    
    router.push(`/menu-editor?${params.toString()}`)
  }

  const handleTemplateSelect = (template: Template) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", "editor")
    params.set("template", template.id)
    router.push(`/menu-editor?${params.toString()}`)
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

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
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
              <MenuEditorProvider
                restaurant={restaurant}
                initialCategories={menuData}
                onRefresh={() => {}}
              >
              <LiveMenuEditor
                restaurant={restaurant}
                initialMenuData={menuData}
              />
              </MenuEditorProvider>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Import Modal */}
      <MenuImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        restaurantId={restaurant.id}
        onImportComplete={handleImportComplete}
      />
    </>
  )
} 