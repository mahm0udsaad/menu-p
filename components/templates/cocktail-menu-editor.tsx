"use client"

import { memo, useState } from "react"
import type { MenuData } from "../types/menu"
import { CocktailMenuPreview } from "./cocktail-menu-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit3, Download, Save } from "lucide-react"
import { MenuItemForm } from "./menu-item-form"

const defaultCocktailMenu: MenuData = {
  restaurantName: "Cocktail Bar",
  categories: [
    {
      id: "cocktails",
      name: "Cocktails",
      items: [
        {
          id: "old-fashioned",
          name: "Old Fashioned",
          description: "Whiskey, bitters, sugar.",
          price: 16,
        },
        {
          id: "daiquiri",
          name: "Daiquiri",
          description: "Rum, citrus juice and sugar.",
          price: 14,
        },
        {
          id: "gimlet",
          name: "Gimlet",
          description: "combining gin and lime.",
          price: 16,
        },
        {
          id: "manhattan",
          name: "Manhattan",
          description: "whiskey, sweet vermouth.",
          price: 15,
        },
        {
          id: "espresso-martini",
          name: "Espresso Martini",
          description: "vodka and Coffee.",
          price: 16,
        },
        {
          id: "mimosa",
          name: "Mimosa",
          description: "champagne and chilled orange juice.",
          price: 17,
        },
      ],
    },
  ],
}

const CocktailMenuEditorComponent = () => {
  const [menuData, setMenuData] = useState<MenuData>(defaultCocktailMenu)
  const [editingItem, setEditingItem] = useState<{ categoryId: string; itemId: string } | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")

  const handleEditItem = (categoryId: string, itemId: string) => {
    setEditingItem({ categoryId, itemId })
  }

  const handleSaveItem = (categoryId: string, itemId: string, updatedItem: any) => {
    setMenuData((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) => (item.id === itemId ? { ...item, ...updatedItem } : item)),
            }
          : category,
      ),
    }))
    setEditingItem(null)
  }

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    setMenuData((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }
          : category,
      ),
    }))
  }

  const handleAddItem = (categoryId: string) => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: "New Cocktail",
      description: "Description here",
      price: 15,
    }

    setMenuData((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: [...category.items, newItem],
            }
          : category,
      ),
    }))
  }

  const handleEditCategory = (categoryId: string) => {
    setEditingCategory(categoryId)
    const category = menuData.categories.find((c) => c.id === categoryId)
    setNewCategoryName(category?.name || "")
  }

  const handleSaveCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      setMenuData((prev) => ({
        ...prev,
        categories: prev.categories.map((category) =>
          category.id === editingCategory ? { ...category, name: newCategoryName.trim() } : category,
        ),
      }))
    }
    setEditingCategory(null)
    setNewCategoryName("")
  }

  const handleAddCategory = () => {
    const newCategory = {
      id: `category-${Date.now()}`,
      name: "New Category",
      items: [],
    }
    setMenuData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }))
  }

  const handleDeleteCategory = (categoryId: string) => {
    setMenuData((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== categoryId),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Editor */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cocktail Menu Editor</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          {/* Restaurant Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
            <Input
              value={menuData.restaurantName}
              onChange={(e) => setMenuData((prev) => ({ ...prev, restaurantName: e.target.value }))}
              placeholder="Enter restaurant name"
            />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <Button size="sm" onClick={handleAddCategory}>
                <Plus className="w-4 h-4 mr-1" />
                Add Category
              </Button>
            </div>

            {menuData.categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    {editingCategory === category.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => e.key === "Enter" && handleSaveCategory()}
                        />
                        <Button size="sm" onClick={handleSaveCategory}>
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditCategory(category.id)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">${item.price}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditItem(category.id, item.id)}>
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(category.id, item.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => handleAddItem(category.id)} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 overflow-y-auto">
        <CocktailMenuPreview
          menuData={menuData}
          onEditItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          isEditing={true}
        />
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
            <MenuItemForm
              item={menuData.categories
                .find((c) => c.id === editingItem.categoryId)
                ?.items.find((i) => i.id === editingItem.itemId)}
              onSave={(updatedItem) => handleSaveItem(editingItem.categoryId, editingItem.itemId, updatedItem)}
              onCancel={() => setEditingItem(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const CocktailMenuEditor = memo(CocktailMenuEditorComponent)

CocktailMenuEditor.displayName = "CocktailMenuEditor"

export { CocktailMenuEditor }
