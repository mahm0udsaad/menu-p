"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Coffee, UtensilsCrossed, Cake, Star } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { deleteMenuItem } from "@/lib/actions/menu"
import MenuItemForm from "./menu-item-form"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  category_id: string
  is_available: boolean
  is_featured: boolean
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface SimpleMenuEditorProps {
  restaurantId: string
  restaurantCategory: string
}

export default function SimpleMenuEditor({ restaurantId, restaurantCategory }: SimpleMenuEditorProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    fetchMenuData()
  }, [restaurantId])

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
    if (!confirm("Are you sure you want to delete this item?")) return

    const result = await deleteMenuItem(itemId)
    if (result.success) {
      fetchMenuData() // Refresh the data
    } else {
      alert(result.error || "Failed to delete item")
    }
  }

  const handleFormSuccess = () => {
    fetchMenuData() // Refresh the data
    setShowItemForm(false)
    setEditingItem(null)
  }

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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Build Your Menu</h2>
        <p className="text-slate-300">Add items to your menu categories. It's that simple!</p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.id} className="bg-slate-800/30 border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  {getCategoryIcon(category.name)}
                  {category.name}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => handleAddItem(category.id)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {category.description && <p className="text-slate-300 text-sm">{category.description}</p>}
            </CardHeader>

            <CardContent>
              {category.menu_items.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-3">No items yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddItem(category.id)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Add your first item
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {category.menu_items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-400/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
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
                              <div className="flex items-center gap-2">
                                <h4 className="text-white font-medium">{item.name}</h4>
                                {item.is_featured && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                              </div>
                              {item.description && <p className="text-slate-300 text-sm mt-1">{item.description}</p>}
                              <div className="flex items-center gap-2 mt-2">
                                {item.price && (
                                  <span className="text-emerald-400 font-semibold">${item.price.toFixed(2)}</span>
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
                                onClick={() => handleEditItem(item)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Menu Item Form Modal */}
      <MenuItemForm
        isOpen={showItemForm}
        onClose={() => setShowItemForm(false)}
        categoryId={selectedCategoryId}
        restaurantId={restaurantId}
        item={editingItem}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
