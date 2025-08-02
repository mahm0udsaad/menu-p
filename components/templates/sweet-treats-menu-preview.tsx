"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit3, Trash2, X, Check } from "lucide-react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import type { MenuCategory, MenuItem } from "@/contexts/menu-editor-context"
import { motion } from "framer-motion"

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  className?: string
  multiline?: boolean
  placeholder?: string
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder = "",
}) => {
  const { isPreviewMode } = useMenuEditor()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onChange(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (isPreviewMode) {
    return <span className={className}>{value}</span>
  }

  if (isEditing) {
    return (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[60px]"
            placeholder={placeholder}
          />
        ) : (
          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={placeholder} />
        )}
        <Button size="sm" onClick={handleSave}>
          <Check className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`${className} cursor-pointer hover:bg-pink-50 p-1 rounded group`}
      onClick={() => setIsEditing(true)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
      {!isPreviewMode && <Edit3 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 inline" />}
    </motion.div>
  )
}

interface MenuItemComponentProps {
  item: MenuItem
  categoryId: string
  onUpdate: (updates: Partial<MenuItem>) => void
  onDelete: () => void
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({ item, categoryId, onUpdate, onDelete }) => {
  const { isPreviewMode } = useMenuEditor()

  return (
    <motion.div
      className="flex justify-between items-center py-2 group border-b border-pink-200"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex-1">
        <EditableText
          value={item.name}
          onChange={(name) => onUpdate({ name })}
          className="text-pink-600 font-medium"
          placeholder="Item name"
        />
      </div>
      <div className="flex items-center gap-2">
        <EditableText
          value={`$${(item.price || 0).toFixed(2)}`}
          onChange={(priceStr) => {
            const price = Number.parseFloat(priceStr.replace("$", "")) || 0
            onUpdate({ price })
          }}
          className="text-pink-600 font-medium"
          placeholder="$0.00"
        />
        {!isPreviewMode && (
          <motion.div
            className="opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

interface MenuCategoryComponentProps {
  category: MenuCategory
  onUpdate: (updates: Partial<MenuCategory>) => void
  onDelete: () => void
  onAddItem: () => void
}

const MenuCategoryComponent: React.FC<MenuCategoryComponentProps> = ({ category, onUpdate, onDelete, onAddItem }) => {
  const { isPreviewMode } = useMenuEditor()

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <EditableText
          value={category.name}
          onChange={(name) => onUpdate({ name })}
          className="text-4xl font-bold text-pink-600 mb-4"
          placeholder="Category Name"
        />
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        {category.menu_items.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            categoryId={category.id}
            onUpdate={(updates) => onUpdate({ id: category.id, menu_items: category.menu_items.map(i => i.id === item.id ? { ...i, ...updates } : i) })}
            onDelete={() => onUpdate({ id: category.id, menu_items: category.menu_items.filter(i => i.id !== item.id) })}
          />
        ))}
      </div>

      {!isPreviewMode && (
        <motion.div
          className="flex justify-center gap-2 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="sm"
            onClick={onAddItem}
            style={{ backgroundColor: "#FF7F7F" }}
            className="hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            style={{ borderColor: "#FF7F7F", color: "#FF7F7F" }}
            className="hover:bg-pink-50 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Category
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export function SweetTreatsMenuPreview() {
  const { 
    categories, 
    isPreviewMode, 
    handleAddCategory, 
    handleAddItem, 
    handleUpdateCategory, 
    handleDeleteCategory 
  } = useMenuEditor()

  const addNewCategory = () => {
    handleAddCategory()
  }

  const addNewItem = (categoryId: string) => {
    handleAddItem(categoryId)
  }

  // Use categories from context
  const displayCategories = categories.length > 0 ? categories : []

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <div className="text-center py-16 text-white" style={{ backgroundColor: "#FF7F7F" }}>
        <h1
          className="text-6xl font-bold mb-4 text-pink-600"
          style={{ fontFamily: "Dancing Script, cursive" }}
        >
          Sweet Treats
        </h1>
        <div className="text-lg tracking-[0.3em] font-light">• M E N U •</div>
      </div>

      {/* Menu content */}
      <div className="max-w-2xl mx-auto py-16 px-8">
        {displayCategories.map((category) => (
          <MenuCategoryComponent
            key={category.id}
            category={category}
            onUpdate={(updates) => handleUpdateCategory(category.id, 'name', updates.name || null)}
            onDelete={() => handleDeleteCategory(category.id)}
            onAddItem={() => addNewItem(category.id)}
          />
        ))}

        {/* Add Category Button */}
        {!isPreviewMode && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={addNewCategory}
              style={{ backgroundColor: "#FF7F7F" }}
              className="hover:opacity-90 text-white text-lg px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Category
            </Button>
          </motion.div>
        )}
      </div>

      {/* Bottom decorative border */}
      <div className="h-16" style={{ backgroundColor: "#FF7F7F" }}>
        <div className="flex justify-center items-end h-full">
          <div className="flex space-x-1 pb-2">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="bg-white opacity-80"
                style={{
                  width: "8px",
                  height: `${Math.random() * 30 + 20}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
