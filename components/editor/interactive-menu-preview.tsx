"use client"

import { useState, useCallback, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit, Leaf, Wheat } from "lucide-react"
import { quickAddItem, quickDeleteItem, reorderMenuItems } from "@/lib/actions/editor/quick-menu-actions"
import { quickUpdateCategory, quickDeleteCategory, quickAddCategory } from "@/lib/actions/editor/quick-category-actions"
import InlineEditable from "../inline-editable"
import EditableMenuItem from "./editable-menu-item"
import Image from "next/image"
import { toast } from "sonner"

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

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
}

interface InteractiveMenuPreviewProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  onRefresh: () => void
}

export default function InteractiveMenuPreview({
  restaurant,
  categories: initialCategories,
  onRefresh,
}: InteractiveMenuPreviewProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories)

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const handleAddItem = async (categoryId: string) => {
    const result = await quickAddItem(categoryId, restaurant.id)
    if (result.success && result.item) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, menu_items: [...cat.menu_items, result.item as MenuItem] } : cat,
        ),
      )
      toast.success("تم إضافة عنصر جديد للقائمة")
    } else {
      toast.error(result.error || "فشل في إضافة العنصر")
    }
  }

  const handleUpdateItem = (updatedItem: MenuItem) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        menu_items: cat.menu_items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      })),
    )
  }

  const handleDeleteItem = async (itemId: string) => {
    toast.promise(
      quickDeleteItem(itemId),
      {
        loading: 'جاري حذف العنصر...',
        success: (result) => {
    if (result.success) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          menu_items: cat.menu_items.filter((item) => item.id !== itemId),
        })),
      )
            return 'تم حذف العنصر بنجاح'
    } else {
            throw new Error(result.error || 'فشل في حذف العنصر')
          }
        },
        error: (error) => error.message || 'فشل في حذف العنصر'
    }
    )
  }

  const handleUpdateCategory = async (categoryId: string, field: string, value: string | null) => {
    const result = await quickUpdateCategory(categoryId, field, value)
    if (result.success) {
      setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, [field]: value } : cat)))
    } else {
      toast.error(result.error || "فشل في تحديث القسم")
      onRefresh() // Revert on error
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    toast.promise(
      quickDeleteCategory(categoryId),
      {
        loading: 'جاري حذف القسم...',
        success: (result) => {
    if (result.success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
            return 'تم حذف القسم وجميع عناصره بنجاح'
    } else {
            throw new Error(result.error || 'فشل في حذف القسم')
          }
        },
        error: (error) => error.message || 'فشل في حذف القسم'
    }
    )
  }

  const handleAddCategory = async () => {
    const result = await quickAddCategory(restaurant.id, "قسم جديد")
    if (result.success && result.category) {
      setCategories((prev) => [...prev, { ...result.category, menu_items: [] }])
      toast.success("تم إضافة قسم جديد")
    } else {
      toast.error(result.error || "فشل في إضافة القسم")
    }
  }

  const moveItem = useCallback(
    (categoryId: string, dragIndex: number, hoverIndex: number) => {
      setCategories((prevCategories) => {
        const newCategories = [...prevCategories]
        const categoryIndex = newCategories.findIndex((cat) => cat.id === categoryId)
        if (categoryIndex === -1) return prevCategories

        const category = newCategories[categoryIndex]
        const newItems = [...category.menu_items]
        const [draggedItem] = newItems.splice(dragIndex, 1)
        newItems.splice(hoverIndex, 0, draggedItem)

        newCategories[categoryIndex] = { ...category, menu_items: newItems }
        return newCategories
      })
    },
    [setCategories],
  )

  const handleDropItem = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const itemIds = category.menu_items.map((item) => item.id)
    await reorderMenuItems(categoryId, itemIds)
    onRefresh() // Refresh from DB to ensure order is persisted
  }

  const getDietaryIcon = (dietary: string) => {
    switch (dietary.toLowerCase()) {
      case "vegetarian":
        return <Leaf className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
      case "vegan":
        return <Leaf className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
      case "gluten-free":
        return <Wheat className="h-2 w-2 sm:h-3 sm:w-3 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white text-black min-h-[800px] max-w-3xl mx-auto shadow-2xl font-serif">
        {/* Header */}
        <div className="text-center py-6 sm:py-12 px-4 sm:px-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-6">
            {restaurant.logo_url && (
              <Image
                src={restaurant.logo_url || "/placeholder.svg?height=80&width=80"}
                alt={`${restaurant.name} logo`}
                width={50}
                height={50}
                className="rounded-full object-cover shadow-lg sm:w-[80px] sm:h-[80px]"
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-1 sm:mb-2 tracking-wide">{restaurant.name}</h1>
              <p className="text-slate-600 capitalize text-sm sm:text-lg font-light">{restaurant.category}</p>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="px-8 py-8 space-y-12">
          {categories.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-8xl mb-6">🍽️</div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-600">قائمتك في انتظارك</h3>
              <p className="text-lg mb-6">ابدأ في بناء قائمة طعامك اللذيذة</p>
              <Button onClick={handleAddCategory} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3">
                <Plus className="h-5 w-5 mr-2" />
                إضافة أول قسم
              </Button>
            </div>
          ) : (
            <>
              {categories.map((category) => (
                <div key={category.id} className="space-y-6" onDrop={() => handleDropItem(category.id)}>
                  {/* Category Header */}
                  <div className="border-b-2 border-slate-300 pb-4 mb-6 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <InlineEditable
                          value={category.name}
                          onSave={(value) => handleUpdateCategory(category.id, "name", value)}
                          className="text-3xl font-bold text-slate-800 hover:bg-slate-100 uppercase tracking-wider"
                          placeholder="اسم القسم"
                        />
                        <InlineEditable
                          value={category.description || ""}
                          onSave={(value) => handleUpdateCategory(category.id, "description", value || null)}
                          placeholder="إضافة وصف للقسم..."
                          className="text-slate-600 text-base mt-2 hover:bg-slate-100 italic"
                        />
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                          title="تعديل القسم"
                          onClick={(e) => {
                            const parentDiv = e.currentTarget.closest('.space-y-6');
                            const nameElement = parentDiv?.querySelector('.text-3xl.font-bold');
                            if (nameElement) {
                              (nameElement as HTMLElement).click();
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteCategory(category.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    {category.menu_items.map((item, index) => (
                      <EditableMenuItem
                        key={item.id}
                        item={item}
                        index={index}
                        categoryId={category.id}
                        onUpdate={handleUpdateItem}
                        onDelete={handleDeleteItem}
                        moveItem={(dragIndex, hoverIndex) => moveItem(category.id, dragIndex, hoverIndex)}
                      />
                    ))}
                  </div>

                  {/* Add Item Button */}
                  <div className="text-center pt-4">
                      <Button
                        onClick={() => handleAddItem(category.id)}
                        variant="outline"
                        size="sm"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                      إضافة عنصر إلى {category.name}
                      </Button>
                  </div>
                </div>
              ))}

              {/* Add Category Button */}
              <div className="text-center py-8 border-t-2 border-slate-200">
                <Button
                  onClick={handleAddCategory}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة قسم جديد
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-8 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500 font-light">
            Scan the QR code to view this menu • Generated by Menu-p.com
          </p>
        </div>
      </div>
    </DndProvider>
  )
}
