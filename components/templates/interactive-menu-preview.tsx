"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import type { MenuCategory, MenuItem } from "@/contexts/menu-editor-context"

export function InteractiveMenuPreview() {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const { 
    categories, 
    restaurant, 
    isPreviewMode, 
    handleAddCategory, 
    handleAddItem, 
    handleUpdateCategory, 
    handleDeleteCategory,
    handleUpdateItem,
    handleDeleteItem
  } = useMenuEditor()

  const addCategory = () => {
    handleAddCategory()
  }

  const updateCategory = (categoryId: string, updates: Partial<MenuCategory>) => {
    if (updates.name) {
      handleUpdateCategory(categoryId, 'name', updates.name)
    }
  }

  const deleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category and all its items?")) {
      handleDeleteCategory(categoryId)
    }
  }

  const addItem = (categoryId: string) => {
    handleAddItem(categoryId)
  }

  const editItem = (itemId: string) => {
    setEditingItemId(itemId)
  }

  const saveItem = (categoryId: string, itemData: Partial<MenuItem>, itemId?: string) => {
    if (itemId) {
      handleUpdateItem({ ...itemData, id: itemId } as MenuItem)
      setEditingItemId(null)
    }
  }

  const deleteItem = (categoryId: string, itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      handleDeleteItem(itemId)
    }
  }

  const startEditingCategory = (categoryId: string, currentName: string) => {
    setEditingCategoryId(categoryId)
    setEditingCategoryName(currentName)
  }

  const saveCategory = () => {
    if (editingCategoryId) {
      updateCategory(editingCategoryId, { name: editingCategoryName })
      setEditingCategoryId(null)
      setEditingCategoryName("")
    }
  }

  const cancelEditingCategory = () => {
    setEditingCategoryId(null)
    setEditingCategoryName("")
  }

  const generatePDF = () => {
    console.log("Menu data for PDF generation:", JSON.stringify(categories, null, 2))
    alert(
      "🎉 Menu data logged to console! Check the browser console to see the complete menu structure ready for PDF generation.",
    )
  }

  return (
    <div className="bg-[#f5f1eb] min-h-screen">
      {/* Header with controls */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Editor</h1>
            <p className="text-gray-600">{restaurant.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {!isPreviewMode && (
              <Button onClick={addCategory} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
            <Button onClick={generatePDF} className="bg-black hover:bg-gray-800">
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="p-12 font-serif">
        <div className="max-w-4xl mx-auto">
          {/* Menu Title */}
          <div className="text-center mb-16">
            <h1 className="text-8xl font-bold tracking-wider text-black mb-4">MENU</h1>
            <div className="w-full h-px bg-black"></div>
          </div>

          {/* Menu Content - Two Column Layout */}
          <div className="grid grid-cols-2 gap-16">
            {/* Left Column */}
            <div className="space-y-12">
              {categories.slice(0, Math.ceil(categories.length / 2)).map((category, index) => (
                <div key={category.id} className="group relative">
                  <div className="bg-white p-6 shadow-sm">
                    {/* Category Controls */}
                    {!isPreviewMode && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingCategory(category.id, category.name)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCategory(category.id)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addItem(category.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {editingCategoryId === category.id ? (
                      <div className="mb-6">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onBlur={saveCategory}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveCategory()
                            if (e.key === "Escape") cancelEditingCategory()
                          }}
                          className="text-2xl font-bold"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <h2
                        className="text-2xl font-bold mb-6 cursor-pointer hover:text-gray-700"
                        onClick={() =>
                          !isPreviewMode && startEditingCategory(category.id, category.name)
                        }
                      >
                        {category.name}.
                      </h2>
                    )}

                    <div className="space-y-4">
                      {category.menu_items.map((item, itemIndex) => (
                        <div key={item.id} className="group/item relative">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {editingItemId === item.id ? (
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) =>
                                      saveItem(
                                        category.id,
                                        { ...item, name: e.target.value },
                                        item.id,
                                      )
                                    }
                                    onBlur={() => setEditingItemId(null)}
                                    className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-black"
                                  />
                                ) : (
                                  <h3 
                                    className="text-lg font-semibold mb-1 cursor-pointer hover:text-gray-700"
                                    onClick={() => !isPreviewMode && editItem(item.id)}
                                  >
                                    {item.name}
                                  </h3>
                                )}
                              </div>
                              {editingItemId === item.id ? (
                                <input
                                  type="text"
                                  value={item.description || ""}
                                  onChange={(e) =>
                                    saveItem(
                                      category.id,
                                      { ...item, description: e.target.value },
                                      item.id,
                                    )
                                  }
                                  onBlur={() => setEditingItemId(null)}
                                  className="text-sm text-gray-600 leading-relaxed pr-4 bg-transparent border-b border-gray-300 focus:border-black"
                                />
                              ) : (
                                item.description && (
                                  <p className="text-sm text-gray-600 leading-relaxed pr-4">
                                    {item.description}
                                  </p>
                                )
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold">
                                ${(item.price || 0).toFixed(2)}
                              </span>
                              {!isPreviewMode && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteItem(category.id, item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              {categories.slice(Math.ceil(categories.length / 2)).map((category, index) => (
                <div key={category.id} className="group relative">
                  <div className="bg-white p-6 shadow-sm">
                    {/* Category Controls */}
                    {!isPreviewMode && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingCategory(category.id, category.name)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCategory(category.id)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addItem(category.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {editingCategoryId === category.id ? (
                      <div className="mb-6">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onBlur={saveCategory}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveCategory()
                            if (e.key === "Escape") cancelEditingCategory()
                          }}
                          className="text-2xl font-bold"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <h2
                        className="text-2xl font-bold mb-6 cursor-pointer hover:text-gray-700"
                        onClick={() =>
                          !isPreviewMode && startEditingCategory(category.id, category.name)
                        }
                      >
                        {category.name}.
                      </h2>
                    )}

                    <div className="space-y-4">
                      {category.menu_items.map((item, itemIndex) => (
                        <div key={item.id} className="group/item relative">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {editingItemId === item.id ? (
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) =>
                                      saveItem(
                                        category.id,
                                        { ...item, name: e.target.value },
                                        item.id,
                                      )
                                    }
                                    onBlur={() => setEditingItemId(null)}
                                    className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-black"
                                  />
                                ) : (
                                  <h3 
                                    className="text-lg font-semibold mb-1 cursor-pointer hover:text-gray-700"
                                    onClick={() => !isPreviewMode && editItem(item.id)}
                                  >
                                    {item.name}
                                  </h3>
                                )}
                              </div>
                              {editingItemId === item.id ? (
                                <input
                                  type="text"
                                  value={item.description || ""}
                                  onChange={(e) =>
                                    saveItem(
                                      category.id,
                                      { ...item, description: e.target.value },
                                      item.id,
                                    )
                                  }
                                  onBlur={() => setEditingItemId(null)}
                                  className="text-sm text-gray-600 leading-relaxed pr-4 bg-transparent border-b border-gray-300 focus:border-black"
                                />
                              ) : (
                                item.description && (
                                  <p className="text-sm text-gray-600 leading-relaxed pr-4">
                                    {item.description}
                                  </p>
                                )
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold">
                                ${(item.price || 0).toFixed(2)}
                              </span>
                              {!isPreviewMode && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteItem(category.id, item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
