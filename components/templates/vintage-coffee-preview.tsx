"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Plus, Edit, Trash2, GripVertical, FileText, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InlineItemForm } from "./inline-item-form"
import type { Menu, MenuCategory, MenuItem } from "@/types/menu"
import { useMenuEditor } from "@/contexts/menu-editor-context"

interface VintageCoffeePreviewProps {
  menu: Menu
  onUpdateMenu: (menu: Menu) => void
}

export function VintageCoffeePreview({ menu, onUpdateMenu }: VintageCoffeePreviewProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [addingItemToCategoryId, setAddingItemToCategoryId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const { isPreviewMode } = useMenuEditor()

  const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addCategory = () => {
    const newCategoryId = generateId()
    const newCategory: MenuCategory = {
      id: newCategoryId,
      name: "NEW CATEGORY",
      description: "",
      items: [],
      isSpecial: false,
    }
    onUpdateMenu({
      ...menu,
      categories: [...menu.categories, newCategory],
    })

    setTimeout(() => {
      startEditingCategory(newCategoryId, "NEW CATEGORY")
    }, 100)
  }

  const updateCategory = (categoryId: string, updates: Partial<MenuCategory>) => {
    onUpdateMenu({
      ...menu,
      categories: menu.categories.map((cat) => (cat.id === categoryId ? { ...cat, ...updates } : cat)),
    })
  }

  const deleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category and all its items?")) {
      onUpdateMenu({
        ...menu,
        categories: menu.categories.filter((cat) => cat.id !== categoryId),
      })
    }
  }

  const addItem = (categoryId: string) => {
    setAddingItemToCategoryId(categoryId)
  }

  const editItem = (itemId: string) => {
    setEditingItemId(itemId)
  }

  const saveItem = (categoryId: string, itemData: Omit<MenuItem, "id">, itemId?: string) => {
    if (itemId) {
      onUpdateMenu({
        ...menu,
        categories: menu.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) => (item.id === itemId ? { ...item, ...itemData } : item)),
              }
            : cat,
        ),
      })
      setEditingItemId(null)
    } else {
      const newItem: MenuItem = {
        ...itemData,
        id: generateId(),
      }
      onUpdateMenu({
        ...menu,
        categories: menu.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat,
        ),
      })
      setAddingItemToCategoryId(null)
    }
  }

  const deleteItem = (categoryId: string, itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      onUpdateMenu({
        ...menu,
        categories: menu.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) } : cat,
        ),
      })
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === "CATEGORY") {
      const newCategories = Array.from(menu.categories)
      const [reorderedCategory] = newCategories.splice(source.index, 1)
      newCategories.splice(destination.index, 0, reorderedCategory)

      onUpdateMenu({
        ...menu,
        categories: newCategories,
      })
    } else if (type === "ITEM") {
      const sourceCategoryId = source.droppableId
      const destinationCategoryId = destination.droppableId

      if (sourceCategoryId === destinationCategoryId) {
        const category = menu.categories.find((cat) => cat.id === sourceCategoryId)
        if (!category) return

        const newItems = Array.from(category.items)
        const [reorderedItem] = newItems.splice(source.index, 1)
        newItems.splice(destination.index, 0, reorderedItem)

        onUpdateMenu({
          ...menu,
          categories: menu.categories.map((cat) => (cat.id === sourceCategoryId ? { ...cat, items: newItems } : cat)),
        })
      } else {
        const sourceCategory = menu.categories.find((cat) => cat.id === sourceCategoryId)
        const destinationCategory = menu.categories.find((cat) => cat.id === destinationCategoryId)

        if (!sourceCategory || !destinationCategory) return

        const sourceItems = Array.from(sourceCategory.items)
        const destinationItems = Array.from(destinationCategory.items)
        const [movedItem] = sourceItems.splice(source.index, 1)
        destinationItems.splice(destination.index, 0, movedItem)

        onUpdateMenu({
          ...menu,
          categories: menu.categories.map((cat) => {
            if (cat.id === sourceCategoryId) {
              return { ...cat, items: sourceItems }
            }
            if (cat.id === destinationCategoryId) {
              return { ...cat, items: destinationItems }
            }
            return cat
          }),
        })
      }
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
    console.log("Menu data for PDF generation:", JSON.stringify(menu, null, 2))
    alert(
      "🎉 Menu data logged to console! Check the browser console to see the complete menu structure ready for PDF generation.",
    )
  }

  // Hand-drawn style SVG components
  const CoffeeBeans = () => (
    <svg width="80" height="60" viewBox="0 0 80 60" className="text-amber-800">
      <g fill="currentColor" stroke="currentColor" strokeWidth="1.5" fillRule="evenodd">
        <ellipse cx="25" cy="20" rx="12" ry="18" transform="rotate(-15 25 20)" />
        <ellipse cx="25" cy="20" rx="8" ry="14" transform="rotate(-15 25 20)" fill="none" />
        <path d="M20 12c2-1 4-1 6 0" strokeLinecap="round" />
        <ellipse cx="55" cy="35" rx="10" ry="15" transform="rotate(25 55 35)" />
        <ellipse cx="55" cy="35" rx="6" ry="11" transform="rotate(25 55 35)" fill="none" />
        <path d="M52 25c2-1 4-1 5 1" strokeLinecap="round" />
      </g>
    </svg>
  )

  const CoffeePlant = () => (
    <svg width="120" height="100" viewBox="0 0 120 100" className="text-amber-800">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M60 10 Q65 20 70 30 Q75 40 80 50 Q85 60 90 70" />
        <path d="M65 25 Q70 30 75 35 Q80 40 85 45" />
        <path d="M55 35 Q50 40 45 45 Q40 50 35 55" />
        <ellipse cx="75" cy="35" rx="3" ry="6" transform="rotate(30 75 35)" fill="currentColor" />
        <ellipse cx="80" cy="45" rx="3" ry="6" transform="rotate(45 80 45)" fill="currentColor" />
        <ellipse cx="45" cy="45" rx="3" ry="6" transform="rotate(-30 45 45)" fill="currentColor" />
        <ellipse cx="40" cy="55" rx="3" ry="6" transform="rotate(-45 40 55)" fill="currentColor" />
        <path d="M70 30 Q75 25 80 30 Q85 35 80 40 Q75 35 70 30" fill="currentColor" />
        <path d="M50 40 Q45 35 40 40 Q35 45 40 50 Q45 45 50 40" fill="currentColor" />
      </g>
    </svg>
  )

  const PourOver = () => (
    <svg width="100" height="120" viewBox="0 0 100 120" className="text-amber-800">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 30 Q25 25 35 25 Q65 25 75 25 Q85 25 90 30" />
        <path d="M20 30 L25 45 Q30 55 35 65 L40 80" />
        <path d="M90 30 L85 45 Q80 55 75 65 L70 80" />
        <path d="M40 80 Q50 85 60 85 Q70 85 70 80" />
        <ellipse cx="55" cy="90" rx="25" ry="15" />
        <path d="M30 90 Q35 95 40 100 Q50 105 60 105 Q70 105 80 100 Q85 95 90 90" />
        <path d="M45 35 Q50 40 55 45 Q60 50 65 55" strokeWidth="1" />
        <circle cx="50" cy="40" r="2" fill="currentColor" />
        <circle cx="60" cy="50" r="2" fill="currentColor" />
      </g>
    </svg>
  )

  const CoffeeJars = () => (
    <svg width="80" height="120" viewBox="0 0 80 120" className="text-amber-800">
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="15" y="30" width="50" height="70" rx="5" />
        <rect x="20" y="35" width="40" height="60" rx="3" fill="currentColor" fillOpacity="0.1" />
        <rect x="10" y="20" width="60" height="15" rx="7" />
        <rect x="12" y="22" width="56" height="11" rx="5" fill="currentColor" fillOpacity="0.1" />
        <path d="M25 45 L55 45 M25 55 L55 55 M25 65 L55 65 M25 75 L55 75" strokeWidth="1" />
        <circle cx="40" cy="15" r="3" fill="currentColor" />
      </g>
    </svg>
  )

  const LatteArt = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" className="text-amber-800">
      <g fill="currentColor" stroke="currentColor" strokeWidth="1.5">
        <circle cx="40" cy="40" r="35" fill="none" strokeWidth="2" />
        <circle cx="40" cy="40" r="30" fill="currentColor" fillOpacity="0.1" />
        <path d="M40 20 Q30 30 25 40 Q30 50 40 60 Q50 50 55 40 Q50 30 40 20" />
        <path d="M40 25 Q35 30 32 35 Q35 40 40 45 Q45 40 48 35 Q45 30 40 25" fill="none" />
      </g>
    </svg>
  )

  return (
    <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 min-h-screen relative">
      {/* Header with controls */}
      <div className="bg-stone-100/80 backdrop-blur-sm border-b border-amber-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8 text-amber-800" />
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Vintage Coffee Editor</h1>
              <p className="text-amber-700">{menu.restaurant.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isPreviewMode && (
              <Button
                onClick={addCategory}
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-50 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
            <Button onClick={generatePDF} className="bg-amber-800 hover:bg-amber-900 text-white">
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-8 relative">
          <div className="max-w-2xl mx-auto relative">
            {/* Decorative Illustrations */}
            <div className="absolute -left-32 top-20 opacity-60">
              <CoffeeBeans />
            </div>
            <div className="absolute -right-32 top-32 opacity-60">
              <CoffeePlant />
            </div>
            <div className="absolute -left-28 top-80 opacity-60">
              <PourOver />
            </div>
            <div className="absolute -right-24 bottom-40 opacity-60">
              <CoffeeJars />
            </div>
            <div className="absolute -left-20 bottom-20 opacity-60">
              <LatteArt />
            </div>

            {/* Menu Content */}
            <div className="space-y-16 relative z-10">
              <Droppable droppableId="categories" type="CATEGORY">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-16">
                    {menu.categories.map((category, index) => (
                      <Draggable key={category.id} draggableId={category.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group relative ${snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""}`}
                          >
                            <div className="relative">
                              {/* Category Controls */}
                              <div
                                className={`absolute -top-2 -right-2 flex gap-1 z-20 transition-all duration-300 ease-in-out ${
                                  isPreviewMode
                                    ? "opacity-100 translate-x-0 pointer-events-auto"
                                    : "opacity-0 translate-x-4 pointer-events-none"
                                }`}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab p-2 hover:bg-amber-100 rounded-lg bg-amber-50 border border-amber-200"
                                >
                                  <GripVertical className="w-4 h-4 text-amber-700" />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingCategory(category.id, category.name)}
                                  className="h-8 w-8 p-0 text-amber-700 hover:text-amber-800 hover:bg-amber-100 bg-amber-50 border border-amber-200"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteCategory(category.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-amber-50 border border-amber-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => addItem(category.id)}
                                  className="h-8 w-8 p-0 text-amber-700 hover:text-amber-800 hover:bg-amber-100 bg-amber-50 border border-amber-200"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Category Header */}
                              <div className="text-center mb-8">
                                {editingCategoryId === category.id ? (
                                  <Input
                                    value={editingCategoryName}
                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                    onBlur={saveCategory}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveCategory()
                                      if (e.key === "Escape") cancelEditingCategory()
                                    }}
                                    className="text-3xl font-bold bg-transparent border-b-2 border-amber-400 text-amber-900 text-center tracking-[0.3em]"
                                    autoFocus
                                  />
                                ) : (
                                  <h2
                                    className="text-3xl font-bold text-amber-900 tracking-[0.3em] cursor-pointer hover:text-amber-700 transition-colors"
                                    onClick={() => startEditingCategory(category.id, category.name)}
                                  >
                                    {category.name.toUpperCase()}
                                  </h2>
                                )}
                              </div>

                              {/* Items */}
                              <Droppable droppableId={category.id} type="ITEM">
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`space-y-4 min-h-[50px] ${
                                      snapshot.isDraggingOver ? "bg-amber-100/30 rounded-xl p-4" : ""
                                    }`}
                                  >
                                    {category.menu_items.map((item, itemIndex) => (
                                      <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`group/item relative ${
                                              snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""
                                            }`}
                                          >
                                            <div className="flex justify-between items-center py-3 border-b border-amber-200/50">
                                              <div className="flex items-center gap-3 flex-1">
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className={`cursor-grab p-1 hover:bg-amber-100 rounded bg-amber-50 transition-all duration-300 ease-in-out ${
                                                    isPreviewMode
                                                      ? "opacity-100 translate-x-0 pointer-events-auto"
                                                      : "opacity-0 translate-x-4 pointer-events-none"
                                                  }`}
                                                >
                                                  <GripVertical className="w-4 h-4 text-amber-600/70" />
                                                </div>
                                                {editingItemId === item.id ? (
                                                  <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) =>
                                                      saveItem(category.id, { ...item, name: e.target.value }, item.id)
                                                    }
                                                    onBlur={() => setEditingItemId(null)}
                                                    className="text-lg text-amber-900 bg-transparent border-b border-amber-400 focus:border-amber-600 outline-none font-medium"
                                                    autoFocus
                                                  />
                                                ) : (
                                                  <h4 className="text-lg text-amber-900 font-medium">{item.name}</h4>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-3">
                                                {editingItemId === item.id ? (
                                                  <input
                                                    type="number"
                                                    step="0.1"
                                                    value={item.price}
                                                    onChange={(e) =>
                                                      saveItem(
                                                        category.id,
                                                        { ...item, price: Number.parseFloat(e.target.value) },
                                                        item.id,
                                                      )
                                                    }
                                                    onBlur={() => setEditingItemId(null)}
                                                    className="text-lg font-medium text-amber-900 bg-transparent border-b border-amber-400 focus:border-amber-600 outline-none w-20 text-right"
                                                  />
                                                ) : (
                                                  <div className="text-lg font-medium text-amber-900">
                                                    $ {item.price.toFixed(1)}
                                                  </div>
                                                )}
                                                <div
                                                  className={`flex gap-1 transition-all duration-300 ease-in-out ${
                                                    isPreviewMode
                                                      ? "opacity-100 translate-x-0 pointer-events-auto"
                                                      : "opacity-0 translate-x-4 pointer-events-none"
                                                  }`}
                                                >
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => editItem(item.id)}
                                                    className="h-6 w-6 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100 bg-amber-50"
                                                  >
                                                    <Edit className="w-3 h-3" />
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteItem(category.id, item.id)}
                                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-amber-50"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {addingItemToCategoryId === category.id && (
                                      <div className="bg-amber-50/80 rounded-lg p-4 border border-amber-200">
                                        <InlineItemForm
                                          onSave={(itemData) => saveItem(category.id, itemData)}
                                          onCancel={() => setAddingItemToCategoryId(null)}
                                          isSpecialCategory={false}
                                        />
                                      </div>
                                    )}
                                    {category.menu_items.length === 0 &&
                                      addingItemToCategoryId !== category.id &&
                                      isPreviewMode && (
                                        <div className="text-center py-6">
                                          <Button
                                            variant="ghost"
                                            onClick={() => addItem(category.id)}
                                            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                                          >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add first item
                                          </Button>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {/* Add Category Button */}
                    {isPreviewMode && (
                      <div className="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center hover:border-amber-400 transition-colors bg-amber-50/50">
                        <Button
                          onClick={addCategory}
                          variant="outline"
                          className="border-amber-300 text-amber-800 hover:bg-amber-100 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Category
                        </Button>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}
