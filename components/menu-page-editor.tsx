"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, GripVertical, Save, Eye, Coffee, UtensilsCrossed, Cake } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useDebounce } from "@/hooks/use-debounce"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  category_id: string
  display_order: number
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  menu_items: MenuItem[]
}

interface MenuPageEditorProps {
  restaurantId: string
  restaurantCategory: string
  templateId: string
  pageNumber: number
  onSave: (data: any) => void
}

const ItemTypes = {
  MENU_ITEM: "menu_item",
  CATEGORY: "category",
}

// Draggable Menu Item Component
function DraggableMenuItem({
  item,
  index,
  categoryId,
  onEdit,
  onDelete,
  moveItem,
}: {
  item: MenuItem
  index: number
  categoryId: string
  onEdit: (item: MenuItem) => void
  onDelete: (itemId: string) => void
  moveItem: (dragIndex: number, hoverIndex: number, categoryId: string) => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MENU_ITEM,
    item: { index, categoryId, itemId: item.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: ItemTypes.MENU_ITEM,
    hover: (draggedItem: any) => {
      if (draggedItem.categoryId === categoryId && draggedItem.index !== index) {
        moveItem(draggedItem.index, index, categoryId)
        draggedItem.index = index
      }
    },
  })

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-slate-700/50 rounded-lg p-4 border border-slate-600 cursor-move transition-all ${
        isDragging ? "opacity-50" : "hover:border-emerald-400"
      }`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-slate-400 mt-1 flex-shrink-0" />

        {item.image_url && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
            <Image
              src={item.image_url || "/placeholder.svg?height=64&width=64"}
              alt={item.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-white font-medium truncate">{item.name}</h4>
              {item.description && <p className="text-slate-300 text-sm mt-1 line-clamp-2">{item.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                {item.price && <span className="text-emerald-400 font-semibold">${item.price.toFixed(2)}</span>}
                {item.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
                {!item.is_available && (
                  <Badge variant="destructive" className="text-xs">
                    Unavailable
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(item)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Category Section Component
function CategorySection({
  category,
  onAddItem,
  onEditItem,
  onDeleteItem,
  moveItem,
}: {
  category: MenuCategory
  onAddItem: (categoryId: string) => void
  onEditItem: (item: MenuItem) => void
  onDeleteItem: (itemId: string) => void
  moveItem: (dragIndex: number, hoverIndex: number, categoryId: string) => void
}) {
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes("coffee") || name.includes("beverage") || name.includes("drink")) {
      return <Coffee className="h-5 w-5 text-emerald-400" />
    }
    if (name.includes("dessert") || name.includes("pastry") || name.includes("cake")) {
      return <Cake className="h-5 w-5 text-emerald-400" />
    }
    return <UtensilsCrossed className="h-5 w-5 text-emerald-400" />
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            {getCategoryIcon(category.name)}
            {category.name}
          </CardTitle>
          <Button size="sm" onClick={() => onAddItem(category.id)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        {category.description && <p className="text-slate-300 text-sm">{category.description}</p>}
      </CardHeader>

      <CardContent className="space-y-3">
        {category.menu_items.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No items in this category yet</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddItem(category.id)}
              className="mt-2 text-emerald-400 hover:text-emerald-300"
            >
              Add your first item
            </Button>
          </div>
        ) : (
          category.menu_items.map((item, index) => (
            <DraggableMenuItem
              key={item.id}
              item={item}
              index={index}
              categoryId={category.id}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              moveItem={moveItem}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function MenuPageEditor({
  restaurantId,
  restaurantCategory,
  templateId,
  pageNumber,
  onSave,
}: MenuPageEditorProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")

  // Debounced auto-save
  const debouncedCategories = useDebounce(categories, 1000)

  useEffect(() => {
    fetchMenuData()
  }, [restaurantId])

  useEffect(() => {
    if (debouncedCategories.length > 0) {
      autoSave()
    }
  }, [debouncedCategories])

  const fetchMenuData = async () => {
    try {
      setLoading(true)

      const { data: categoriesData, error } = await supabase
        .from("menu_categories")
        .select(`
          *,
          menu_items (*)
        `)
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("display_order")

      if (error) throw error

      // Sort menu items within each category
      const processedCategories =
        categoriesData?.map((category) => ({
          ...category,
          menu_items: category.menu_items.sort((a: MenuItem, b: MenuItem) => a.display_order - b.display_order),
        })) || []

      setCategories(processedCategories)
    } catch (error) {
      console.error("Error fetching menu data:", error)
    } finally {
      setLoading(false)
    }
  }

  const autoSave = useCallback(async () => {
    if (!categories.length) return

    try {
      setSaving(true)

      const draftData = {
        categories: categories.map((cat) => ({
          ...cat,
          menu_items: cat.menu_items.map((item, index) => ({
            ...item,
            display_order: index,
          })),
        })),
        template_id: templateId,
        last_modified: new Date().toISOString(),
      }

      const { error } = await supabase.from("menu_drafts").upsert({
        restaurant_id: restaurantId,
        template_id: templateId,
        page_number: pageNumber,
        draft_data: draftData,
        last_saved_at: new Date().toISOString(),
      })

      if (error) throw error

      onSave(draftData)
    } catch (error) {
      console.error("Error auto-saving:", error)
    } finally {
      setSaving(false)
    }
  }, [categories, restaurantId, templateId, pageNumber, onSave])

  const moveItem = useCallback((dragIndex: number, hoverIndex: number, categoryId: string) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id === categoryId) {
          const items = [...category.menu_items]
          const draggedItem = items[dragIndex]
          items.splice(dragIndex, 1)
          items.splice(hoverIndex, 0, draggedItem)
          return { ...category, menu_items: items }
        }
        return category
      }),
    )
  }, [])

  const handleAddItem = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setEditingItem(null)
    setShowItemForm(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setSelectedCategoryId(item.category_id)
    setShowItemForm(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", itemId)

      if (error) throw error

      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          menu_items: category.menu_items.filter((item) => item.id !== itemId),
        })),
      )
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your menu...</p>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Menu Editor - Page {pageNumber}</h2>
            <p className="text-slate-300">Drag and drop to reorder items</p>
          </div>

          <div className="flex items-center gap-3">
            {saving && (
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}

            <Button variant="outline" className="border-slate-600 text-white">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <Button onClick={autoSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" />
              Save Now
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              moveItem={moveItem}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No menu categories found</h3>
            <p className="text-slate-400 mb-4">
              It looks like your restaurant doesn't have any menu categories set up yet.
            </p>
            <Button onClick={fetchMenuData} className="bg-emerald-600 hover:bg-emerald-700">
              Refresh Menu
            </Button>
          </div>
        )}
      </div>
    </DndProvider>
  )
}
