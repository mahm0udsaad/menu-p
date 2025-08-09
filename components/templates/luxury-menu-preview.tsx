"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Plus, Edit, Trash2, GripVertical, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InlineItemForm } from "./inline-item-form"
import { TEMPLATE_DESIGN_TOKENS } from "@/lib/template-design-tokens"
import { useMenuEditor } from "@/contexts/menu-editor-context"

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

  const categories = menu.categories || []
  const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const C = TEMPLATE_DESIGN_TOKENS.luxury.colors
  const F = TEMPLATE_DESIGN_TOKENS.luxury.fonts
  const S = TEMPLATE_DESIGN_TOKENS.luxury.spacing

  // convenience rgba using the primary (#d4af37)
  const goldBg10 = "rgba(212,175,55,0.10)"
  const goldBg15 = "rgba(212,175,55,0.15)"
  const goldBg20 = "rgba(212,175,55,0.20)"
  const goldBorder30 = "rgba(212,175,55,0.30)"
  const goldText70 = "rgba(212,175,55,0.70)"
  const textMuted80 = "rgba(255,255,255,0.80)"

  const addCategory = () => {
    const newCategoryId = generateId()
    const newCategory: MenuCategory = {
      id: newCategoryId,
      name: "NEW CATEGORY",
      description: "",
      menu_items: [],
      isSpecial: false,
    }
    onUpdateMenu({ ...menu, categories: [...categories, newCategory] })
    setTimeout(() => startEditingCategory(newCategoryId, "NEW CATEGORY"), 100)
  }

  const updateCategory = (categoryId: string, updates: Partial<MenuCategory>) => {
    onUpdateMenu({
      ...menu,
      categories: categories.map((cat) => (cat.id === categoryId ? { ...cat, ...updates } : cat)),
    })
  }

  const deleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category and all its items?")) {
      onUpdateMenu({
        ...menu,
        categories: categories.filter((cat) => cat.id !== categoryId),
      })
    }
  }

  const addItem = (categoryId: string) => setAddingItemToCategoryId(categoryId)
  const editItem = (itemId: string) => setEditingItemId(itemId)

  const saveItem = (categoryId: string, itemData: Omit<MenuItem, "id">, itemId?: string) => {
    if (itemId) {
      onUpdateMenu({
        ...menu,
        categories: categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                menu_items: cat.menu_items.map((item) => (item.id === itemId ? { ...item, ...itemData } : item)),
              }
            : cat,
        ),
      })
      setEditingItemId(null)
    } else {
      const newItem: MenuItem = { ...itemData, id: generateId() }
      onUpdateMenu({
        ...menu,
        categories: menu.categories.map((cat) =>
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
        categories: menu.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, menu_items: cat.menu_items.filter((i) => i.id !== itemId) } : cat,
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
      onUpdateMenu({ ...menu, categories: newCategories })
    } else if (type === "ITEM") {
      const sourceCategoryId = source.droppableId
      const destinationCategoryId = destination.droppableId

      if (sourceCategoryId === destinationCategoryId) {
        const category = categories.find((c) => c.id === sourceCategoryId)
        if (!category) return
        const newItems = Array.from(category.menu_items)
        const [reorderedItem] = newItems.splice(source.index, 1)
        newItems.splice(destination.index, 0, reorderedItem)
        onUpdateMenu({
          ...menu,
          categories: categories.map((c) => (c.id === sourceCategoryId ? { ...c, menu_items: newItems } : c)),
        })
      } else {
        const sourceCategory = menu.categories.find((c) => c.id === sourceCategoryId)
        const destinationCategory = menu.categories.find((c) => c.id === destinationCategoryId)
        if (!sourceCategory || !destinationCategory) return

        const sourceItems = Array.from(sourceCategory.menu_items)
        const destinationItems = Array.from(destinationCategory.menu_items)
        const [movedItem] = sourceItems.splice(source.index, 1)
        destinationItems.splice(destination.index, 0, movedItem)

        onUpdateMenu({
          ...menu,
          categories: menu.categories.map((c) => {
            if (c.id === sourceCategoryId) return { ...c, menu_items: sourceItems }
            if (c.id === destinationCategoryId) return { ...c, menu_items: destinationItems }
            return c
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
    alert("🎉 Menu data logged to console! Check the browser console to see the complete menu structure ready for PDF generation.")
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: C.background,
        fontFamily: F.family,
        color: C.text,
        backgroundImage: C.backgroundGradient,
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="relative p-8">
          {/* Decorative Border */}
          <div
            className="absolute inset-4 rounded-lg pointer-events-none"
            style={{ border: `2px solid ${goldBorder30}` }}
          >
            {/* Corner Decorations */}
            <div className="absolute -top-1 -left-1 w-8 h-8 rounded-tl-lg" style={{ borderLeft: `2px solid ${C.primary}`, borderTop: `2px solid ${C.primary}` }} />
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-tr-lg" style={{ borderRight: `2px solid ${C.primary}`, borderTop: `2px solid ${C.primary}` }} />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-bl-lg" style={{ borderLeft: `2px solid ${C.primary}`, borderBottom: `2px solid ${C.primary}` }} />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-br-lg" style={{ borderRight: `2px solid ${C.primary}`, borderBottom: `2px solid ${C.primary}` }} />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Menu Header */}
            <div className="text-center mb-16">
              <div
                style={{
                  border: `3px solid ${C.primary}`,
                  padding: S.card,
                  marginBottom: "32px",
                  position: "relative",
                }}
              >
                <h1
                  className="font-light mb-6 tracking-wider"
                  style={{
                    fontSize: F.sizes.title,
                    color: C.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                  }}
                >
                  LUXURY
                </h1>
                <div
                  style={{
                    width: "120px",
                    height: "1px",
                    backgroundColor: C.primary,
                    margin: "0 auto 24px",
                  }}
                />
                <h2
                  className="font-normal"
                  style={{
                    fontSize: "20px",
                    color: C.primary,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Fine Dining Experience
                </h2>
              </div>
            </div>

            {/* Menu Content - Two Column Layout */}
            <div className="grid grid-cols-2 gap-16">
              {/* Left Column */}
              <div className="space-y-12">
                <Droppable droppableId="left-column" type="CATEGORY">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-12">
                      {(menu.categories || [])
                        .slice(0, Math.ceil((menu.categories || []).length / 2))
                        .map((category: MenuCategory, index: number) => (
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
                                      isPreviewMode ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-4 pointer-events-none"
                                    }`}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab p-1 rounded transition-colors"
                                      style={{ backgroundColor: goldBg10 }}
                                    >
                                      <GripVertical className="w-4 h-4" style={{ color: goldText70 }} />
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleSpecialCategory(category.id, category.isSpecial || false)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                    >
                                      <Sparkles className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditingCategory(category.id, category.name)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteCategory(category.id)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(217,122,122,0.2)" // subtle red on hover
                                      }}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addItem(category.id)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
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
                                        className="text-2xl font-serif font-bold"
                                        style={{
                                          backgroundColor: goldBg20,
                                          borderColor: goldBorder30,
                                          color: C.primary,
                                          letterSpacing: "0.05em",
                                        }}
                                        autoFocus
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        borderBottom: `2px solid ${C.primary}`,
                                        marginBottom: S.item,
                                        paddingBottom: "20px",
                                        position: "relative",
                                      }}
                                    >
                                      <h3
                                        className="font-light cursor-pointer transition-colors"
                                        onClick={() => isPreviewMode && startEditingCategory(category.id, category.name)}
                                        style={{
                                          fontSize: F.sizes.category,
                                          color: C.primary,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.2em",
                                        }}
                                      >
                                        {category.name}
                                      </h3>
                                      <div
                                        style={{
                                          position: "absolute",
                                          bottom: "-2px",
                                          left: 0,
                                          width: "80px",
                                          height: "2px",
                                          backgroundColor: C.text,
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Items */}
                                  <Droppable droppableId={category.id} type="ITEM">
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-6 min-h-[50px] rounded"
                                        style={{ backgroundColor: snapshot.isDraggingOver ? goldBg10 : "transparent" }}
                                      >
                                        {category.menu_items.map((item: MenuItem, itemIndex: number) => (
                                          <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`group/item relative ${snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""}`}
                                              >
                                                <div className="flex justify-between items-start">
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div
                                                        {...provided.dragHandleProps}
                                                        className="cursor-grab p-1 rounded transition-colors"
                                                        style={{ backgroundColor: goldBg10 }}
                                                      >
                                                        <GripVertical className="w-3 h-3" style={{ color: "rgba(212,175,55,0.5)" }} />
                                                      </div>

                                                      {editingItemId === item.id ? (
                                                        <input
                                                          type="text"
                                                          value={item.name}
                                                          onChange={(e) =>
                                                            saveItem(category.id, { ...item, name: e.target.value }, item.id)
                                                          }
                                                          onBlur={() => setEditingItemId(null)}
                                                          className="text-lg font-serif font-semibold bg-transparent outline-none border-b"
                                                          style={{ borderColor: goldBorder30, color: C.text }}
                                                          autoFocus
                                                        />
                                                      ) : (
                                                        <h4
                                                          className="font-normal tracking-wide"
                                                          style={{
                                                            fontSize: F.sizes.item,
                                                            color: C.text,
                                                            letterSpacing: "0.1em",
                                                          }}
                                                        >
                                                          {item.name}
                                                        </h4>
                                                      )}
                                                    </div>

                                                    {editingItemId === item.id ? (
                                                      <textarea
                                                        value={item.description || ""}
                                                        onChange={(e) =>
                                                          saveItem(category.id, { ...item, description: e.target.value }, item.id)
                                                        }
                                                        onBlur={() => setEditingItemId(null)}
                                                        className="text-sm leading-relaxed bg-transparent outline-none border-b w-full resize-none"
                                                        style={{ borderColor: goldBorder30, color: textMuted80 }}
                                                        rows={2}
                                                      />
                                                    ) : (
                                                      item.description && (
                                                        <p className="text-sm leading-relaxed font-light" style={{ color: textMuted80 }}>
                                                          {item.description}
                                                        </p>
                                                      )
                                                    )}
                                                  </div>

                                                  <div className="flex items-center gap-2 ml-6">
                                                    {editingItemId === item.id ? (
                                                      <input
                                                        type="number"
                                                        value={item.price || ""}
                                                        onChange={(e) =>
                                                          saveItem(
                                                            category.id,
                                                            { ...item, price: Number.parseFloat(e.target.value) },
                                                            item.id,
                                                          )
                                                        }
                                                        onBlur={() => setEditingItemId(null)}
                                                        className="text-xl font-serif font-bold bg-transparent outline-none border-b w-16 text-right"
                                                        style={{ borderColor: goldBorder30, color: C.primary }}
                                                      />
                                                    ) : (
                                                      <div className="text-xl font-serif font-bold" style={{ color: C.primary }}>
                                                        {item.price?.toFixed(0)}
                                                      </div>
                                                    )}

                                                    <div
                                                      className={`flex gap-1 transition-all duration-300 ease-in-out ${
                                                        isPreviewMode ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-4 pointer-events-none"
                                                      }`}
                                                    >
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => editItem(item.id)}
                                                        className="h-6 w-6 p-0"
                                                        style={{ color: goldText70, backgroundColor: goldBg10 }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                                      >
                                                        <Edit className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteItem(category.id, item.id)}
                                                        className="h-6 w-6 p-0"
                                                        style={{ color: goldText70, backgroundColor: goldBg10 }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(217,122,122,0.2)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
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
                                          <div className={`text-center py-6 transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                            <Button
                                              variant="ghost"
                                              onClick={() => addItem(category.id)}
                                              className="transition-colors"
                                              style={{ color: goldText70 }}
                                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg15)}
                                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                        style={{ borderColor: goldBorder30 }}
                      >
                        <Button
                          onClick={addCategory}
                          variant="outline"
                          className="bg-transparent"
                          style={{ borderColor: goldBorder30, color: C.primary }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
                      {(menu.categories || [])
                        .slice(Math.ceil((menu.categories || []).length / 2))
                        .map((category: MenuCategory, index: number) => (
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
                                      isPreviewMode ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-4 pointer-events-none"
                                    }`}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab p-1 rounded transition-colors"
                                      style={{ backgroundColor: goldBg10 }}
                                    >
                                      <GripVertical className="w-4 h-4" style={{ color: goldText70 }} />
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleSpecialCategory(category.id, category.isSpecial || false)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                    >
                                      <Sparkles className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditingCategory(category.id, category.name)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteCategory(category.id)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(217,122,122,0.2)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addItem(category.id)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: goldText70, backgroundColor: goldBg10 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
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
                                        className="text-2xl font-serif font-bold"
                                        style={{
                                          backgroundColor: goldBg20,
                                          borderColor: goldBorder30,
                                          color: C.primary,
                                          letterSpacing: "0.05em",
                                        }}
                                        autoFocus
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        borderBottom: `2px solid ${C.primary}`,
                                        marginBottom: S.item,
                                        paddingBottom: "20px",
                                        position: "relative",
                                      }}
                                    >
                                      <h3
                                        className="font-light cursor-pointer transition-colors"
                                        onClick={() => isPreviewMode && startEditingCategory(category.id, category.name)}
                                        style={{
                                          fontSize: F.sizes.category,
                                          color: C.primary,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.2em",
                                        }}
                                      >
                                        {category.name}
                                      </h3>
                                      <div
                                        style={{
                                          position: "absolute",
                                          bottom: "-2px",
                                          left: 0,
                                          width: "80px",
                                          height: "2px",
                                          backgroundColor: C.text,
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Items */}
                                  <Droppable droppableId={category.id} type="ITEM">
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-6 min-h-[50px] rounded"
                                        style={{ backgroundColor: snapshot.isDraggingOver ? goldBg10 : "transparent" }}
                                      >
                                        {category.menu_items.map((item: MenuItem, itemIndex: number) => (
                                          <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`group/item relative ${snapshot.isDragging ? "opacity-50 rotate-1 scale-105" : ""}`}
                                              >
                                                <div className="flex justify-between items-start">
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div
                                                        {...provided.dragHandleProps}
                                                        className="cursor-grab p-1 rounded transition-colors"
                                                        style={{ backgroundColor: goldBg10 }}
                                                      >
                                                        <GripVertical className="w-4 h-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                                                      </div>

                                                      {editingItemId === item.id ? (
                                                        <input
                                                          type="text"
                                                          value={item.name}
                                                          onChange={(e) =>
                                                            saveItem(category.id, { ...item, name: e.target.value }, item.id)
                                                          }
                                                          onBlur={() => setEditingItemId(null)}
                                                          className="text-lg font-serif font-semibold bg-transparent outline-none border-b"
                                                          style={{ borderColor: goldBorder30, color: C.text }}
                                                          autoFocus
                                                        />
                                                      ) : (
                                                        <h4
                                                          className="font-normal tracking-wide"
                                                          style={{
                                                            fontSize: F.sizes.item,
                                                            color: C.text,
                                                            letterSpacing: "0.1em",
                                                          }}
                                                        >
                                                          {item.name}
                                                        </h4>
                                                      )}
                                                    </div>

                                                    {editingItemId === item.id ? (
                                                      <textarea
                                                        value={item.description || ""}
                                                        onChange={(e) =>
                                                          saveItem(category.id, { ...item, description: e.target.value }, item.id)
                                                        }
                                                        onBlur={() => setEditingItemId(null)}
                                                        className="text-sm leading-relaxed bg-transparent outline-none border-b w-full resize-none"
                                                        style={{ borderColor: goldBorder30, color: textMuted80 }}
                                                        rows={2}
                                                      />
                                                    ) : (
                                                      item.description && (
                                                        <p className="text-sm leading-relaxed font-light" style={{ color: textMuted80 }}>
                                                          {item.description}
                                                        </p>
                                                      )
                                                    )}
                                                  </div>

                                                  <div className="flex items-center gap-2 ml-6">
                                                    {editingItemId === item.id ? (
                                                      <input
                                                        type="number"
                                                        value={item.price || ""}
                                                        onChange={(e) =>
                                                          saveItem(
                                                            category.id,
                                                            { ...item, price: Number.parseFloat(e.target.value) },
                                                            item.id,
                                                          )
                                                        }
                                                        onBlur={() => setEditingItemId(null)}
                                                        className="text-xl font-serif font-bold bg-transparent outline-none border-b w-16 text-right"
                                                        style={{ borderColor: goldBorder30, color: C.primary }}
                                                      />
                                                    ) : (
                                                      <div className="text-xl font-serif font-bold" style={{ color: C.primary }}>
                                                        {item.price?.toFixed(0)}
                                                      </div>
                                                    )}

                                                    <div
                                                      className={`flex gap-1 transition-all duration-300 ease-in-out ${
                                                        isPreviewMode ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-4 pointer-events-none"
                                                      }`}
                                                    >
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => editItem(item.id)}
                                                        className="h-6 w-6 p-0"
                                                        style={{ color: goldText70, backgroundColor: goldBg10 }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg20)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                                                      >
                                                        <Edit className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteItem(category.id, item.id)}
                                                        className="h-6 w-6 p-0"
                                                        style={{ color: goldText70, backgroundColor: goldBg10 }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(217,122,122,0.2)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
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
                                          <div className={`text-center py-6 transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                            <Button
                                              variant="ghost"
                                              onClick={() => addItem(category.id)}
                                              className="transition-colors"
                                              style={{ color: goldText70 }}
                                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg15)}
                                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors transition-opacity duration-300 ${isPreviewMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                        style={{ borderColor: goldBorder30 }}
                      >
                        <Button
                          onClick={addCategory}
                          variant="outline"
                          className="bg-transparent"
                          style={{ borderColor: goldBorder30, color: C.primary }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = goldBg10)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
