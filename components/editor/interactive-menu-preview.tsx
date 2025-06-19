"use client"

import { useState, useCallback, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"
import { quickAddItem, quickDeleteItem, reorderMenuItems } from "@/lib/actions/editor/quick-menu-actions"
import { quickUpdateCategory, quickDeleteCategory, quickAddCategory } from "@/lib/actions/editor/quick-category-actions"
import InlineEditable from "../inline-editable" // Adjusted path
import EditableMenuItem from "./editable-menu-item" // Adjusted path
import Image from "next/image"
import { Leaf, Wheat } from "lucide-react"

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
    } else {
      alert(result.error)
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
    if (!confirm("Delete this item?")) return
    const result = await quickDeleteItem(itemId)
    if (result.success) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          menu_items: cat.menu_items.filter((item) => item.id !== itemId),
        })),
      )
    } else {
      alert(result.error)
    }
  }

  const handleUpdateCategory = async (categoryId: string, field: string, value: string | null) => {
    const result = await quickUpdateCategory(categoryId, field, value)
    if (result.success) {
      setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, [field]: value } : cat)))
    } else {
      alert(result.error)
      onRefresh() // Revert on error
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Delete this entire category and all its items?")) return
    const result = await quickDeleteCategory(categoryId)
    if (result.success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    } else {
      alert(result.error)
    }
  }

  const handleAddCategory = async () => {
    const result = await quickAddCategory(restaurant.id, "New Category")
    if (result.success && result.category) {
      setCategories((prev) => [...prev, { ...result.category, menu_items: [] }])
    } else {
      alert(result.error)
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
        return <Leaf className="h-3 w-3 text-green-500" />
      case "vegan":
        return <Leaf className="h-3 w-3 text-green-600" />
      case "gluten-free":
        return <Wheat className="h-3 w-3 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white text-black min-h-[800px] max-w-3xl mx-auto shadow-2xl font-serif">
        {/* Header */}
        <div className="text-center py-12 px-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="flex items-center justify-center gap-6 mb-6">
            {restaurant.logo_url && (
              <Image
                src={restaurant.logo_url || "/placeholder.svg?height=80&width=80"}
                alt={`${restaurant.name} logo`}
                width={80}
                height={80}
                className="rounded-full object-cover shadow-lg"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2 tracking-wide">{restaurant.name}</h1>
              <p className="text-slate-600 capitalize text-lg font-light">{restaurant.category}</p>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="px-8 py-8 space-y-12">
          {categories.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-8xl mb-6">🍽️</div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-600">Your menu awaits</h3>
              <p className="text-lg mb-6">Start building your delicious menu</p>
              <Button onClick={handleAddCategory} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Add First Category
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
                          placeholder="Category name"
                        />
                        <InlineEditable
                          value={category.description || ""}
                          onSave={(value) => handleUpdateCategory(category.id, "description", value || null)}
                          placeholder="Add category description..."
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
                            // Trigger edit mode for category name
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
                    <div className="mt-6 text-center">
                      <Button
                        onClick={() => handleAddItem(category.id)}
                        variant="outline"
                        size="sm"
                        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item to {category.name}
                      </Button>
                    </div>
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
                  Add New Category
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
