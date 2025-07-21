"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Plus, Edit, Trash2, GripVertical, FileText, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InlineItemForm } from "./inline-item-form"
import type { Menu, MenuCategory, MenuItem } from "@/types/menu"
import { useMenuEditor } from "@/contexts/menu-editor-context"

interface ChalkboardCoffeePreviewProps {
  menu: Menu
  onUpdateMenu: (menu: Menu) => void
}

export function ChalkboardCoffeePreview({ menu, onUpdateMenu }: ChalkboardCoffeePreviewProps) {
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
      name: "New Category",
      description: "",
      items: [],
      isSpecial: false,
    }
    onUpdateMenu({
      ...menu,
      categories: [...menu.categories, newCategory],
    })

    setTimeout(() => {
      startEditingCategory(newCategoryId, "New Category")
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

  // Chalk-style SVG components
  const ChalkCoffeeBean = ({ className = "" }) => (
    <svg width="40" height="30" viewBox="0 0 40 30" className={`text-white ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <ellipse cx="20" cy="15" rx="15" ry="12" />
        <ellipse cx="20" cy="15" rx="10" ry="8" />
        <path d="M15 10c2-1 4-1 6 0" />
      </g>
    </svg>
  )

  const ChalkCoffeeCup = ({ className = "" }) => (
    <svg width="60" height="50" viewBox="0 0 60 50" className={`text-white ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <ellipse cx="25" cy="40" rx="20" ry="6" />
        <path d="M5 40 Q10 20 15 15 Q20 10 25 10 Q30 10 35 15 Q40 20 45 40" />
        <ellipse cx="25" cy="15" rx="15" ry="4" />
        <path d="M45 25 Q55 25 55 35 Q55 40 45 40" />
        <path d="M15 20 Q20 25 25 30 Q30 25 35 20" strokeWidth="1" />
      </g>
    </svg>
  )

  const ChalkArrow = ({ className = "" }) => (
    <svg width="80" height="20" viewBox="0 0 80 20" className={`text-white ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 10 Q20 8 40 10 Q60 12 70 10" />
        <path d="M65 6 L70 10 L65 14" />
      </g>
    </svg>
  )

  const ChalkLeaf = ({ className = "" }) => (
    <svg width="50" height="80" viewBox="0 0 50 80" className={`text-white ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M25 5 Q35 20 40 40 Q35 60 25 75 Q15 60 10 40 Q15 20 25 5" />
        <path d="M25 15 Q30 25 35 35 Q30 45 25 55 Q20 45 15 35 Q20 25 25 15" />
        <path d="M25 5 L25 75" strokeWidth="1" />
      </g>
    </svg>
  )

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(64, 64, 64, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(96, 96, 96, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(48, 48, 48, 0.4) 0%, transparent 50%),
          linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #0f0f0f 100%)
        `,
      }}
    >
      {/* Chalk texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, white 0.5px, transparent 0.5px),
            radial-gradient(circle at 50% 50%, white 0.8px, transparent 0.8px)
          `,
          backgroundSize: "100px 100px, 150px 150px, 80px 80px",
        }}
      />

      {/* Header with controls */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/20 p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Chalkboard Menu Editor</h1>
              <p className="text-white/80">{menu.restaurant?.name || "Restaurant Name"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isPreviewMode && (
              <Button
                onClick={addCategory}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
            <Button onClick={generatePDF} className="bg-white text-black hover:bg-gray-200 transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-8 relative">
          <div className="max-w-6xl mx-auto relative">
            {/* Decorative chalk elements */}
            <div className="absolute -left-16 top-20 opacity-40 rotate-12">
              <ChalkCoffeeBean />
            </div>
            <div className="absolute -right-20 top-32 opacity-30 -rotate-12">
              <ChalkCoffeeCup />
            </div>
            <div className="absolute -left-12 bottom-40 opacity-35 rotate-45">
              <ChalkLeaf />
            </div>
            <div className="absolute -right-16 bottom-60 opacity-40 -rotate-30">
              <ChalkCoffeeBean />
            </div>

            {/* Menu Header */}
            <div className="text-center mb-12 relative z-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <ChalkCoffeeCup className="opacity-60" />
                <h1 className="text-4xl font-bold text-white tracking-wide" style={{ fontFamily: "cursive" }}>
                  {menu.restaurant.name?.toUpperCase() || "FAUCET COFFEE"}
                </h1>
              </div>
              <div className="relative">
                <h2
                  className="text-7xl font-bold text-white mb-4"
                  style={{ fontFamily: "cursive", transform: "rotate(-2deg)" }}
                >
                  Menu
                </h2>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <svg width="200" height="10" viewBox="0 0 200 10" className="text-white">
                    <path
                      d="M10 5 Q50 2 100 5 Q150 8 190 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Menu Content - Two Column Layout */}
            <div className="grid grid-cols-2 gap-16 relative z-10">
              {/* Left Column */}
              <div className="space-y-12">
                <Droppable droppableId="left-column" type="CATEGORY">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-12">
                      {menu.categories.slice(0, Math.ceil(menu.categories.length / 2)).map((category, index) => (
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
                                    className="cursor-grab p-2 hover:bg-white/20 rounded-lg bg-white/10 border border-white/20 transition-colors"
                                  >
                                    <GripVertical className="w-4 h-4 text-white" />
                                  </div>
                                  {editingCategoryId !== category.id && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditingCategory(category.id, category.name)}
                                      className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 bg-white/10 border border-white/20 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteCategory(category.id)}
                                    className="h-8 w-8 p-0 text-red-300 hover:text-red-200 hover:bg-red-500/20 bg-white/10 border border-white/20 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  {addingItemToCategoryId !== category.id && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addItem(category.id)}
                                      className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 bg-white/10 border border-white/20 transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>

                                {/* Category Header */}
                                <div className="mb-6">
                                  <div className="flex items-center gap-4 mb-2">
                                    {editingCategoryId === category.id ? (
                                      <Input
                                        value={editingCategoryName}
                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                        onBlur={saveCategory}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveCategory()
                                          if (e.key === "Escape") cancelEditingCategory()
                                        }}
                                        className="text-3xl font-bold bg-white/20 border-white/30 text-white"
                                        style={{ fontFamily: "cursive" }}
                                        autoFocus
                                      />
                                    ) : (
                                      <h3
                                        className="text-3xl font-bold text-white cursor-pointer hover:text-white/80 transition-colors"
                                        style={{ fontFamily: "cursive" }}
                                        onClick={() => startEditingCategory(category.id, category.name)}
                                      >
                                        {category.name}
                                      </h3>
                                    )}
                                    <ChalkArrow className="opacity-60" />
                                  </div>
                                  <div className="w-full h-px bg-white/40"></div>
                                </div>

                                {/* Items */}
                                <Droppable droppableId={category.id} type="ITEM">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`space-y-3 min-h-[50px] ${
                                        snapshot.isDraggingOver ? "bg-white/10 rounded-xl p-4" : ""
                                      }`}
                                    >
                                      {category.items.map((item, itemIndex) => (
                                        <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`group/item relative ${
                                                snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""
                                              }`}
                                            >
                                              <div className="flex justify-between items-center py-2">
                                                <div className="flex items-center gap-3 flex-1">
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="cursor-grab p-1 hover:bg-white/20 rounded bg-white/10 transition-colors"
                                                  >
                                                    <GripVertical className="w-4 h-4 text-white/70" />
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
                                                      className="text-lg text-white bg-transparent border-b border-white/50 focus:border-white outline-none"
                                                      style={{ fontFamily: "cursive" }}
                                                      autoFocus
                                                    />
                                                  ) : (
                                                    <h4
                                                      className="text-lg text-white"
                                                      style={{ fontFamily: "cursive" }}
                                                    >
                                                      {item.name}
                                                    </h4>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  {editingItemId === item.id ? (
                                                    <input
                                                      type="number"
                                                      value={item.price}
                                                      onChange={(e) =>
                                                        saveItem(
                                                          category.id,
                                                          { ...item, price: Number.parseFloat(e.target.value) },
                                                          item.id,
                                                        )
                                                      }
                                                      onBlur={() => setEditingItemId(null)}
                                                      className="text-lg font-bold text-white bg-transparent border-b border-white/50 focus:border-white outline-none w-20 text-right"
                                                      style={{ fontFamily: "cursive" }}
                                                    />
                                                  ) : (
                                                    <div
                                                      className="text-lg font-bold text-white"
                                                      style={{ fontFamily: "cursive" }}
                                                    >
                                                      ${item.price.toFixed(0)}
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
                                                      className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 transition-colors"
                                                    >
                                                      <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => deleteItem(category.id, item.id)}
                                                      className="h-6 w-6 p-0 text-red-300 hover:text-red-200 hover:bg-red-500/20 bg-white/10 transition-colors"
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
                                        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                                          <InlineItemForm
                                            onSave={(itemData) => saveItem(category.id, itemData)}
                                            onCancel={() => setAddingItemToCategoryId(null)}
                                            isSpecialCategory={false}
                                          />
                                        </div>
                                      )}
                                      {category.items.length === 0 &&
                                        addingItemToCategoryId !== category.id &&
                                        isPreviewMode && (
                                          <div className="text-center py-6">
                                            <Button
                                              variant="ghost"
                                              onClick={() => addItem(category.id)}
                                              className="text-white/70 hover:text-white hover:bg-white/20 transition-colors"
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
                      {menu.categories.slice(Math.ceil(menu.categories.length / 2)).map((category, index) => (
                        <Draggable
                          key={category.id}
                          draggableId={category.id}
                          index={index + Math.ceil(menu.categories.length / 2)}
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
                                  className={`absolute -top-2 -right-2 flex gap-1 z-20 transition-all duration-300 ease-in-out ${
                                    isPreviewMode
                                      ? "opacity-100 translate-x-0 pointer-events-auto"
                                      : "opacity-0 translate-x-4 pointer-events-none"
                                  }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab p-2 hover:bg-white/20 rounded-lg bg-white/10 border border-white/20 transition-colors"
                                  >
                                    <GripVertical className="w-4 h-4 text-white" />
                                  </div>
                                  {editingCategoryId !== category.id && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditingCategory(category.id, category.name)}
                                      className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 bg-white/10 border border-white/20 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteCategory(category.id)}
                                    className="h-8 w-8 p-0 text-red-300 hover:text-red-200 hover:bg-red-500/20 bg-white/10 border border-white/20 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  {addingItemToCategoryId !== category.id && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addItem(category.id)}
                                      className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 bg-white/10 border border-white/20 transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>

                                {/* Category Header */}
                                <div className="mb-6">
                                  <div className="flex items-center gap-4 mb-2">
                                    {editingCategoryId === category.id ? (
                                      <Input
                                        value={editingCategoryName}
                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                        onBlur={saveCategory}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveCategory()
                                          if (e.key === "Escape") cancelEditingCategory()
                                        }}
                                        className="text-3xl font-bold bg-white/20 border-white/30 text-white"
                                        style={{ fontFamily: "cursive" }}
                                        autoFocus
                                      />
                                    ) : (
                                      <h3
                                        className="text-3xl font-bold text-white cursor-pointer hover:text-white/80 transition-colors"
                                        style={{ fontFamily: "cursive" }}
                                        onClick={() => startEditingCategory(category.id, category.name)}
                                      >
                                        {category.name}
                                      </h3>
                                    )}
                                    <ChalkArrow className="opacity-60" />
                                  </div>
                                  <div className="w-full h-px bg-white/40"></div>
                                </div>

                                {/* Items */}
                                <Droppable droppableId={category.id} type="ITEM">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`space-y-3 min-h-[50px] ${
                                        snapshot.isDraggingOver ? "bg-white/10 rounded-xl p-4" : ""
                                      }`}
                                    >
                                      {category.items.map((item, itemIndex) => (
                                        <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`group/item relative ${
                                                snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""
                                              }`}
                                            >
                                              <div className="flex justify-between items-center py-2">
                                                <div className="flex items-center gap-3 flex-1">
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="cursor-grab p-1 hover:bg-white/20 rounded bg-white/10 transition-colors"
                                                  >
                                                    <GripVertical className="w-4 h-4 text-white/70" />
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
                                                      className="text-lg text-white bg-transparent border-b border-white/50 focus:border-white outline-none"
                                                      style={{ fontFamily: "cursive" }}
                                                      autoFocus
                                                    />
                                                  ) : (
                                                    <h4
                                                      className="text-lg text-white"
                                                      style={{ fontFamily: "cursive" }}
                                                    >
                                                      {item.name}
                                                    </h4>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  {editingItemId === item.id ? (
                                                    <input
                                                      type="number"
                                                      value={item.price}
                                                      onChange={(e) =>
                                                        saveItem(
                                                          category.id,
                                                          { ...item, price: Number.parseFloat(e.target.value) },
                                                          item.id,
                                                        )
                                                      }
                                                      onBlur={() => setEditingItemId(null)}
                                                      className="text-lg font-bold text-white bg-transparent border-b border-white/50 focus:border-white outline-none w-20 text-right"
                                                      style={{ fontFamily: "cursive" }}
                                                    />
                                                  ) : (
                                                    <div
                                                      className="text-lg font-bold text-white"
                                                      style={{ fontFamily: "cursive" }}
                                                    >
                                                      ${item.price.toFixed(0)}
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
                                                      className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 transition-colors"
                                                    >
                                                      <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => deleteItem(category.id, item.id)}
                                                      className="h-6 w-6 p-0 text-red-300 hover:text-red-200 hover:bg-red-500/20 bg-white/10 transition-colors"
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
                                        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                                          <InlineItemForm
                                            onSave={(itemData) => saveItem(category.id, itemData)}
                                            onCancel={() => setAddingItemToCategoryId(null)}
                                            isSpecialCategory={false}
                                          />
                                        </div>
                                      )}
                                      {category.items.length === 0 &&
                                        addingItemToCategoryId !== category.id &&
                                        isPreviewMode && (
                                          <div className="text-center py-6">
                                            <Button
                                              variant="ghost"
                                              onClick={() => addItem(category.id)}
                                              className="text-white/70 hover:text-white hover:bg-white/20 transition-colors"
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
                      {isPreviewMode && (
                        <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors bg-white/5">
                          <Button
                            onClick={addCategory}
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10 bg-transparent transition-colors"
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

            {/* Decorative elements in center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
              <ChalkCoffeeCup className="w-32 h-32" />
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}
