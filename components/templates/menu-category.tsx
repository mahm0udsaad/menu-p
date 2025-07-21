"use client"

import { useState } from "react"
import { Droppable, Draggable } from "react-beautiful-dnd"
import { GripVertical, Plus, Edit, Trash2, ChefHat, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MenuItem } from "./menu-item"
import type { MenuCategory as MenuCategoryType, MenuItem as MenuItemType } from "@/types/menu"

interface MenuCategoryProps {
  category: MenuCategoryType
  index: number
  onUpdateCategory: (id: string, updates: Partial<MenuCategoryType>) => void
  onDeleteCategory: (id: string) => void
  onAddItem: (categoryId: string) => void
  onEditItem: (item: MenuItemType) => void
  onDeleteItem: (categoryId: string, itemId: string) => void
}

export function MenuCategory({
  category,
  index,
  onUpdateCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: MenuCategoryProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editDescription, setEditDescription] = useState(category.description || "")

  const handleNameSave = () => {
    onUpdateCategory(category.id, { name: editName })
    setIsEditingName(false)
  }

  const handleDescriptionSave = () => {
    onUpdateCategory(category.id, { description: editDescription })
    setIsEditingDescription(false)
  }

  const handleDeleteConfirm = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${category.name}" category? This will also delete all ${category.items.length} items in this category.`,
      )
    ) {
      onDeleteCategory(category.id)
    }
  }

  const handleSpecialToggle = (checked: boolean) => {
    onUpdateCategory(category.id, { isSpecial: checked })
  }

  return (
    <Draggable draggableId={category.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`transition-all duration-300 ${snapshot.isDragging ? "scale-105 rotate-1 shadow-2xl" : ""}`}
        >
          <div
            className={`rounded-xl shadow-lg border overflow-hidden ${
              category.isSpecial ? "bg-black text-white border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            {/* Category Header */}
            <div className={`p-6 ${category.isSpecial ? "bg-black" : "bg-gradient-to-r from-gray-50 to-gray-100"}`}>
              <div className="flex items-start gap-4">
                <div
                  {...provided.dragHandleProps}
                  className={`mt-1 p-2 cursor-grab active:cursor-grabbing rounded-lg transition-colors ${
                    category.isSpecial
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  {/* Category Name */}
                  {isEditingName ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave()
                        if (e.key === "Escape") {
                          setEditName(category.name)
                          setIsEditingName(false)
                        }
                      }}
                      className={`text-xl font-bold ${
                        category.isSpecial ? "bg-white/20 border-white/30 text-white" : "bg-white border-gray-300"
                      }`}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      {category.isSpecial ? (
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <ChefHat className="w-6 h-6 text-gray-600" />
                      )}
                      <h3
                        className={`text-xl font-bold cursor-pointer transition-colors ${
                          category.isSpecial ? "text-white hover:text-white/90" : "text-gray-900 hover:text-gray-700"
                        }`}
                        onClick={() => setIsEditingName(true)}
                      >
                        {category.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingName(true)}
                        className={`h-6 w-6 p-0 ${
                          category.isSpecial
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Category Description */}
                  {isEditingDescription ? (
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      onBlur={handleDescriptionSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleDescriptionSave()
                        if (e.key === "Escape") {
                          setEditDescription(category.description || "")
                          setIsEditingDescription(false)
                        }
                      }}
                      placeholder="Add category description..."
                      className={`mt-2 ${
                        category.isSpecial
                          ? "bg-white/20 border-white/30 text-white placeholder-white/70"
                          : "bg-white border-gray-300"
                      }`}
                      autoFocus
                    />
                  ) : (
                    <p
                      className={`mt-2 cursor-pointer transition-colors ${
                        category.isSpecial ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setIsEditingDescription(true)}
                    >
                      {category.description || "Click to add description..."}
                    </p>
                  )}

                  {/* Special Category Toggle */}
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id={`special-${category.id}`}
                      checked={category.isSpecial || false}
                      onCheckedChange={handleSpecialToggle}
                      className={
                        category.isSpecial
                          ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                          : ""
                      }
                    />
                    <Label
                      htmlFor={`special-${category.id}`}
                      className={`text-sm ${category.isSpecial ? "text-white/80" : "text-gray-600"}`}
                    >
                      Special Category (Black Background)
                    </Label>
                  </div>

                  <div
                    className={`flex items-center gap-2 mt-3 text-sm ${
                      category.isSpecial ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    <span>{category.items.length} items</span>
                    <span>•</span>
                    <span>{category.items.filter((item) => item.isAvailable).length} available</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddItem(category.id)}
                    className={`${
                      category.isSpecial
                        ? "text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
                        : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteConfirm}
                    className={`${
                      category.isSpecial
                        ? "text-white/70 hover:text-white hover:bg-red-500/20"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className={`p-6 ${category.isSpecial ? "bg-gray-900" : "bg-white"}`}>
              <Droppable droppableId={category.id} type="ITEM">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[100px] transition-all duration-200 ${
                      snapshot.isDraggingOver ? "bg-blue-50 rounded-xl p-4 border-2 border-dashed border-blue-300" : ""
                    }`}
                  >
                    {category.items.map((item, itemIndex) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        index={itemIndex}
                        onEdit={onEditItem}
                        onDelete={(itemId) => onDeleteItem(category.id, itemId)}
                      />
                    ))}
                    {provided.placeholder}

                    {category.items.length === 0 && (
                      <div className={`text-center py-12 ${category.isSpecial ? "text-white/70" : "text-gray-500"}`}>
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                            category.isSpecial ? "bg-white/10" : "bg-gray-100"
                          }`}
                        >
                          <ChefHat className={`w-8 h-8 ${category.isSpecial ? "text-white/50" : "text-gray-400"}`} />
                        </div>
                        <p className="text-lg font-medium mb-2">No items yet</p>
                        <p className="text-sm mb-4">Start building your menu by adding your first item</p>
                        <Button
                          variant="outline"
                          onClick={() => onAddItem(category.id)}
                          className={`${
                            category.isSpecial
                              ? "bg-white text-black hover:bg-gray-100"
                              : "bg-black text-white hover:bg-gray-800"
                          }`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Item
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
