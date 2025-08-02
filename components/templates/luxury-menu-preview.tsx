"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Plus, Edit, Trash2, GripVertical, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InlineItemForm } from "./inline-item-form"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  is_available: boolean
  is_featured: boolean
  isTemporary?: boolean
}

interface MenuCategory {
  id: string
  name: string
  description: string
  menu_items: MenuItem[]
  isSpecial: boolean
}

interface Menu {
  id: string
  name: string
  description: string | null
  categories: MenuCategory[]
  restaurant?: any
  designSettings?: any
  customizations?: any
}

import { useMenuEditor } from "@/contexts/menu-editor-context"

interface LuxuryMenuPreviewProps {
  menu: Menu
  onUpdateMenu: (menu: Menu) => void
}

export function LuxuryMenuPreview({ menu, onUpdateMenu }: LuxuryMenuPreviewProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [addingItemToCategoryId, setAddingItemToCategoryId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const { isPreviewMode } = useMenuEditor()

  // Ensure menu.categories is always an array
  const categories = menu.categories || []

  const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addCategory = () => {
    const newCategoryId = generateId()
    const newCategory: MenuCategory = {
      id: newCategoryId,
      name: "NEW CATEGORY",
      description: "",
      menu_items: [],
      isSpecial: false,
    }
    onUpdateMenu({
      ...menu,
      categories: [...categories, newCategory],
    })

    setTimeout(() => {
      startEditingCategory(newCategoryId, "NEW CATEGORY")
    }, 100)
  }

  const updateCategory = (categoryId: string, updates: Partial<MenuCategory>) => {
    onUpdateMenu({
      ...menu,
      categories: categories.map((cat: MenuCategory) => (cat.id === categoryId ? { ...cat, ...updates } : cat)),
    })
  }

  const deleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category and all its items?")) {
      onUpdateMenu({
        ...menu,
        categories: categories.filter((cat: MenuCategory) => cat.id !== categoryId),
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
        categories: categories.map((cat: MenuCategory) =>
          cat.id === categoryId
            ? {
                ...cat,
                menu_items: cat.menu_items.map((item: MenuItem) => (item.id === itemId ? { ...item, ...itemData } : item)),
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
        categories: menu.categories.map((cat: MenuCategory) =>
          cat.id === categoryId ? { ...cat, menu_items: [...cat.menu_items, newItem] } : cat,
        ),
      })
      setAddingItemToCategoryId(null)
    }
  }

  const deleteItem = (categoryId: string, itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      onUpdateMenu({
        ...menu,
        categories: menu.categories.map((cat: MenuCategory) =>
          cat.id === categoryId ? { ...cat, menu_items: cat.menu_items.filter((item: MenuItem) => item.id !== itemId) } : cat,
        ),
      })
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === "CATEGORY") {
      const newCategories = Array.from(categories)
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
        const category = categories.find((cat: MenuCategory) => cat.id === sourceCategoryId)
        if (!category) return

        const newItems = Array.from(category.menu_items)
        const [reorderedItem] = newItems.splice(source.index, 1)
        newItems.splice(destination.index, 0, reorderedItem)

        onUpdateMenu({
          ...menu,
          categories: categories.map((cat: MenuCategory) => (cat.id === sourceCategoryId ? { ...cat, menu_items: newItems } : cat)),
        })
      } else {
        const sourceCategory = menu.categories.find((cat: MenuCategory) => cat.id === sourceCategoryId)
        const destinationCategory = menu.categories.find((cat: MenuCategory) => cat.id === destinationCategoryId)

        if (!sourceCategory || !destinationCategory) return

        const sourceItems = Array.from(sourceCategory.menu_items)
        const destinationItems = Array.from(destinationCategory.menu_items)
        const [movedItem] = sourceItems.splice(source.index, 1)
        destinationItems.splice(destination.index, 0, movedItem)

        onUpdateMenu({
          ...menu,
          categories: menu.categories.map((cat: MenuCategory) => {
            if (cat.id === sourceCategoryId) {
              return { ...cat, menu_items: sourceItems }
            }
            if (cat.id === destinationCategoryId) {
              return { ...cat, menu_items: destinationItems }
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

  const toggleSpecialCategory = (categoryId: string, isSpecial: boolean) => {
    updateCategory(categoryId, { isSpecial: !isSpecial })
  }

  const generatePDF = () => {
    console.log("Menu data for PDF generation:", JSON.stringify(menu, null, 2))
    alert(
      "🎉 Menu data logged to console! Check the browser console to see the complete menu structure ready for PDF generation.",
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
 
 

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="relative p-8">
          {/* Decorative Border */}
          <div className="absolute inset-4 border-2 border-yellow-600/30 rounded-lg pointer-events-none">
            {/* Corner Decorations */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-l-2 border-t-2 border-yellow-600 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-r-2 border-t-2 border-yellow-600 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-2 border-b-2 border-yellow-600 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-2 border-b-2 border-yellow-600 rounded-br-lg"></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Menu Header */}
            <div className="text-center mb-16">
              <div className="mb-6">
                <h1 className="text-6xl font-serif text-[#d4af37] mb-2 tracking-wider">
                  <span className="font-script text-7xl">Think</span>
                </h1>
                <h2 className="text-5xl font-serif text-[#d4af37] tracking-[0.3em] font-light">UNLIMITED</h2>
              </div>
              <div className="text-yellow-200/80 text-lg tracking-[0.2em] font-light mb-6">A TASTE OF COMFORT</div>
              {/* Decorative Divider */}
              <div className="flex items-center justify-center">
                <div className="w-24 h-px bg-yellow-600"></div>
                <div className="mx-4 text-yellow-600 text-2xl">❦</div>
                <div className="w-24 h-px bg-yellow-600"></div>
              </div>
            </div>

            {/* Menu Content - Two Column Layout */}
            <div className="grid grid-cols-2 gap-16">
              {/* Left Column */}
              <div className="space-y-12">
                <Droppable droppableId="left-column" type="CATEGORY">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-12">
                      {(menu.categories || []).slice(0, Math.ceil((menu.categories || []).length / 2)).map((category: MenuCategory, index: number) => (
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
                                  className={`absolute top-0 right-0 flex gap-1 transition-all duration-300 ease-in-out ${
                                    isPreviewMode
                                      ? "opacity-100 translate-x-0 pointer-events-auto"
                                      : "opacity-0 translate-x-4 pointer-events-none"
                                  }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab p-1 hover:bg-yellow-600/20 rounded bg-yellow-600/10"
                                  >
                                    <GripVertical className="w-4 h-4 text-[#d4af37]/70" />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleSpecialCategory(category.id, category.isSpecial || false)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditingCategory(category.id, category.name)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteCategory(category.id)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-red-400 hover:bg-red-500/20 bg-yellow-600/10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addItem(category.id)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>

                                {/* Category Header */}
                                {editingCategoryId === category.id ? (
                                  <div className="mb-4">
                                    <Input
                                      value={editingCategoryName}
                                      onChange={(e) => setEditingCategoryName(e.target.value)}
                                      onBlur={saveCategory}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveCategory()
                                        if (e.key === "Escape") cancelEditingCategory()
                                      }}
                                      className="text-2xl font-serif font-bold bg-yellow-600/20 border-yellow-600/50 text-[#d4af37] tracking-wider"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <div className="mb-4">
                                    <h3
                                      className="text-2xl font-serif font-bold text-[#d4af37] tracking-wider cursor-pointer hover:text-yellow-300 transition-colors"
                                      onClick={() =>
                                        isPreviewMode && startEditingCategory(category.id, category.name)
                                      }
                                    >
                                      {category.name}
                                    </h3>
                                    <div className="w-full h-px bg-yellow-600/50 mt-2"></div>
                                  </div>
                                )}

                                {/* Items */}
                                <Droppable droppableId={category.id} type="ITEM">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`space-y-6 min-h-[50px] ${
                                        snapshot.isDraggingOver ? "bg-yellow-600/10 rounded p-2" : ""
                                      }`}
                                    >
                                      {category.menu_items.map((item: MenuItem, itemIndex: number) => (
                                        <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`group/item relative ${
                                                snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""
                                              }`}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <div
                                                      {...provided.dragHandleProps}
                                                      className={`cursor-grab p-1 hover:bg-yellow-600/20 rounded bg-yellow-600/10 transition-all duration-300 ease-in-out ${
                                                        isPreviewMode
                                                          ? "opacity-100 translate-x-0 pointer-events-auto"
                                                          : "opacity-0 translate-x-4 pointer-events-none"
                                                      }`}
                                                    >
                                                      <GripVertical className="w-3 h-3 text-[#d4af37]/50" />
                                                    </div>
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
                                                        className="text-lg font-serif font-semibold text-yellow-200 bg-transparent border-b border-yellow-600/50 focus:border-[#d4af37] outline-none"
                                                        autoFocus
                                                      />
                                                    ) : (
                                                      <h4 className="text-lg font-serif font-semibold text-yellow-200 tracking-wide">
                                                        {item.name.toUpperCase()}
                                                      </h4>
                                                    )}
                                                  </div>
                                                  {editingItemId === item.id ? (
                                                    <textarea
                                                      value={item.description || ""}
                                                      onChange={(e) =>
                                                        saveItem(
                                                          category.id,
                                                          { ...item, description: e.target.value },
                                                          item.id,
                                                        )
                                                      }
                                                      onBlur={() => setEditingItemId(null)}
                                                      className="text-sm text-yellow-100/80 leading-relaxed bg-transparent border-b border-yellow-600/50 focus:border-[#d4af37] outline-none w-full resize-none"
                                                      rows={2}
                                                    />
                                                  ) : (
                                                    item.description && (
                                                      <p className="text-sm text-yellow-100/80 leading-relaxed font-light">
                                                        {item.description}
                                                      </p>
                                                    )
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 ml-6">
                                                  {editingItemId === item.id ? (
                                                    <input
                                                      type="number"
                                                      value={item.price || ''}
                                                      onChange={(e) =>
                                                        saveItem(
                                                          category.id,
                                                          { ...item, price: Number.parseFloat(e.target.value) },
                                                          item.id,
                                                        )
                                                      }
                                                      onBlur={() => setEditingItemId(null)}
                                                      className="text-xl font-serif font-bold text-[#d4af37] bg-transparent border-b border-yellow-600/50 focus:border-[#d4af37] outline-none w-16 text-right"
                                                    />
                                                  ) : (
                                                    <div className="text-xl font-serif font-bold text-[#d4af37]">
                                                      {item.price?.toFixed(0)}
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
                                                      className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                                    >
                                                      <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => deleteItem(category.id, item.id)}
                                                      className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-red-400 hover:bg-red-500/20 bg-yellow-600/10"
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
                                        <InlineItemForm
                                          onSave={(itemData) => saveItem(category.id, itemData)}
                                          onCancel={() => setAddingItemToCategoryId(null)}
                                          isSpecialCategory={true}
                                        />
                                      )}
                                      {category.menu_items.length === 0 && addingItemToCategoryId !== category.id && (
                                        <div
                                          className={`text-center py-6 transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                                        >
                                          <Button
                                            variant="ghost"
                                            onClick={() => addItem(category.id)}
                                            className="text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20"
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
                      {/* Add Category Button for Left Column */}
                      <div
                        className={`border-2 border-dashed border-yellow-600/30 rounded-lg p-8 text-center hover:border-yellow-600/50 transition-colors transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                      >
                        <Button
                          onClick={addCategory}
                          variant="outline"
                          className="border-yellow-600/50 text-[#d4af37] hover:bg-yellow-600/10 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Category
                        </Button>
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Right Column */}
              <div className="space-y-12">
                <Droppable droppableId="right-column" type="CATEGORY">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-12">
                      {(menu.categories || []).slice(Math.ceil((menu.categories || []).length / 2)).map((category: MenuCategory, index: number) => (
                        <Draggable
                          key={category.id}
                          draggableId={category.id}
                                                      index={index + Math.ceil((menu.categories || []).length / 2)}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`group relative ${snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""}`}
                            >
                              <div className="relative">
                                {/* Category Controls */}
                                <div
                                  className={`absolute top-0 right-0 flex gap-1 transition-all duration-300 ease-in-out ${
                                    isPreviewMode
                                      ? "opacity-100 translate-x-0 pointer-events-auto"
                                      : "opacity-0 translate-x-4 pointer-events-none"
                                  }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab p-1 hover:bg-yellow-600/20 rounded bg-yellow-600/10"
                                  >
                                    <GripVertical className="w-4 h-4 text-[#d4af37]/70" />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleSpecialCategory(category.id, category.isSpecial || false)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditingCategory(category.id, category.name)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteCategory(category.id)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-red-400 hover:bg-red-500/20 bg-yellow-600/10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addItem(category.id)}
                                    className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                  </Button>
                                </div>

                                {/* Category Header */}
                                {editingCategoryId === category.id ? (
                                  <div className="mb-4">
                                    <Input
                                      value={editingCategoryName}
                                      onChange={(e) => setEditingCategoryName(e.target.value)}
                                      onBlur={saveCategory}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveCategory()
                                        if (e.key === "Escape") cancelEditingCategory()
                                      }}
                                      className="text-2xl font-serif font-bold bg-yellow-600/20 border-yellow-600/50 text-[#d4af37] tracking-wider"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <div className="mb-4">
                                    <h3
                                      className="text-2xl font-serif font-bold text-[#d4af37] tracking-wider cursor-pointer hover:text-yellow-300 transition-colors"
                                      onClick={() =>
                                        isPreviewMode && startEditingCategory(category.id, category.name)
                                      }
                                    >
                                      {category.name}
                                    </h3>
                                    <div className="w-full h-px bg-yellow-600/50 mt-2"></div>
                                  </div>
                                )}

                                {/* Items */}
                                <Droppable droppableId={category.id} type="ITEM">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`space-y-6 min-h-[50px] ${
                                        snapshot.isDraggingOver ? "bg-yellow-600/10 rounded p-2" : ""
                                      }`}
                                    >
                                      {category.menu_items.map((item: MenuItem, itemIndex: number) => (
                                        <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`group/item relative ${
                                                snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""
                                              }`}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <div
                                                      {...provided.dragHandleProps}
                                                      className={`cursor-grab p-1 hover:bg-yellow-600/20 rounded bg-yellow-600/10 transition-all duration-300 ease-in-out ${
                                                        isPreviewMode
                                                          ? "opacity-100 translate-x-0 pointer-events-auto"
                                                          : "opacity-0 translate-x-4 pointer-events-none"
                                                      }`}
                                                    >
                                                      <GripVertical className="w-4 h-4 text-[#d4af37]/50" />
                                                    </div>
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
                                                        className="text-lg font-serif font-semibold text-yellow-200 bg-transparent border-b border-yellow-600/50 focus:border-[#d4af37] outline-none"
                                                        autoFocus
                                                      />
                                                    ) : (
                                                      <h4 className="text-lg font-serif font-semibold text-yellow-200 tracking-wide">
                                                        {item.name.toUpperCase()}
                                                      </h4>
                                                    )}
                                                  </div>
                                                  {editingItemId === item.id ? (
                                                    <textarea
                                                      value={item.description || ""}
                                                      onChange={(e) =>
                                                        saveItem(
                                                          category.id,
                                                          { ...item, description: e.target.value },
                                                          item.id,
                                                        )
                                                      }
                                                      onBlur={() => setEditingItemId(null)}
                                                      className="text-sm text-yellow-100/80 leading-relaxed bg-transparent border-b border-yellow-600/50 focus:border-[#d4af37] outline-none w-full resize-none"
                                                      rows={2}
                                                    />
                                                  ) : (
                                                    item.description && (
                                                      <p className="text-sm text-yellow-100/80 leading-relaxed font-light">
                                                        {item.description}
                                                      </p>
                                                    )
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 ml-6">
                                                  {editingItemId === item.id ? (
                                                    <input
                                                      type="number"
                                                      value={item.price || ''}
                                                      onChange={(e) =>
                                                        saveItem(
                                                          category.id,
                                                          { ...item, price: Number.parseFloat(e.target.value) },
                                                          item.id,
                                                        )
                                                      }
                                                      onBlur={() => setEditingItemId(null)}
                                                      className="text-xl font-serif font-bold text-[#d4af37] bg-transparent border-b border-yellow-600/50 focus:border-[#d4af37] outline-none w-16 text-right"
                                                    />
                                                  ) : (
                                                    <div className="text-xl font-serif font-bold text-[#d4af37]">
                                                      {item.price?.toFixed(0)}
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
                                                      className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20 bg-yellow-600/10"
                                                    >
                                                      <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => deleteItem(category.id, item.id)}
                                                      className="h-6 w-6 p-0 text-[#d4af37]/70 hover:text-red-400 hover:bg-red-500/20 bg-yellow-600/10"
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
                                        <InlineItemForm
                                          onSave={(itemData) => saveItem(category.id, itemData)}
                                          onCancel={() => setAddingItemToCategoryId(null)}
                                          isSpecialCategory={true}
                                        />
                                      )}
                                      {category.menu_items.length === 0 && addingItemToCategoryId !== category.id && (
                                        <div
                                          className={`text-center py-6 transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                                        >
                                          <Button
                                            variant="ghost"
                                            onClick={() => addItem(category.id)}
                                            className="text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-yellow-600/20"
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
                      {/* Add Category Button for Right Column */}
                      <div
                        className={`border-2 border-dashed border-yellow-600/30 rounded-lg p-8 text-center hover:border-yellow-600/50 transition-colors transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                      >
                        <Button
                          onClick={addCategory}
                          variant="outline"
                          className="border-yellow-600/50 text-[#d4af37] hover:bg-yellow-600/10 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Category
                        </Button>
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}

export default LuxuryMenuPreview
