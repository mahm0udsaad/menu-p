"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit3, Trash2, X, Check } from "lucide-react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import type { MenuCategory, MenuItem } from "@/contexts/menu-editor-context"

// Elegant SVG illustrations matching the reference image
const GinBottleIllustration = () => (
  <svg viewBox="0 0 120 200" className="w-16 h-24">
    {/* Bottle body */}
    <rect x="35" y="60" width="50" height="120" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Bottle neck */}
    <rect x="45" y="30" width="30" height="30" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Cap */}
    <rect x="42" y="20" width="36" height="15" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Label */}
    <rect x="40" y="80" width="40" height="60" fill="none" stroke="#2D1810" strokeWidth="1" />
    <text x="60" y="110" textAnchor="middle" fontSize="8" fill="#2D1810" fontFamily="serif">
      Gin
    </text>
    {/* Crosshatch shading */}
    <g stroke="#2D1810" strokeWidth="0.5" opacity="0.3">
      <line x1="35" y1="70" x2="85" y2="120" />
      <line x1="35" y1="80" x2="85" y2="130" />
      <line x1="35" y1="90" x2="85" y2="140" />
      <line x1="35" y1="100" x2="85" y2="150" />
      <line x1="35" y1="110" x2="85" y2="160" />
      <line x1="35" y1="120" x2="85" y2="170" />
    </g>
    {/* Glass */}
    <rect x="5" y="140" width="25" height="35" fill="none" stroke="#2D1810" strokeWidth="2" />
    <line x1="5" y1="160" x2="30" y2="160" stroke="#2D1810" strokeWidth="1" />
  </svg>
)

const WineBottleIllustration = () => (
  <svg viewBox="0 0 120 200" className="w-16 h-24">
    {/* Wine bottle */}
    <path
      d="M45 180 L45 80 Q45 70 50 65 L50 30 L70 30 L70 65 Q75 70 75 80 L75 180 Z"
      fill="none"
      stroke="#2D1810"
      strokeWidth="2"
    />
    {/* Cork */}
    <rect x="48" y="20" width="24" height="15" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Wine glass */}
    <path
      d="M85 140 Q85 130 95 130 Q105 130 105 140 L105 160 Q105 170 95 170 Q85 170 85 160 Z"
      fill="none"
      stroke="#2D1810"
      strokeWidth="2"
    />
    <line x1="95" y1="170" x2="95" y2="180" stroke="#2D1810" strokeWidth="2" />
    <line x1="85" y1="180" x2="105" y2="180" stroke="#2D1810" strokeWidth="2" />
    {/* Grapes */}
    <g fill="none" stroke="#2D1810" strokeWidth="1">
      <circle cx="110" cy="100" r="4" />
      <circle cx="118" cy="105" r="4" />
      <circle cx="102" cy="108" r="4" />
      <circle cx="110" cy="115" r="4" />
      <circle cx="118" cy="120" r="4" />
    </g>
    {/* Crosshatch on bottle */}
    <g stroke="#2D1810" strokeWidth="0.5" opacity="0.3">
      <line x1="45" y1="90" x2="75" y2="120" />
      <line x1="45" y1="100" x2="75" y2="130" />
      <line x1="45" y1="110" x2="75" y2="140" />
      <line x1="45" y1="120" x2="75" y2="150" />
      <line x1="45" y1="130" x2="75" y2="160" />
    </g>
  </svg>
)

const ArtDecoDecoration = () => (
  <svg viewBox="0 0 300 40" className="w-full h-8">
    <g fill="#2D1810" stroke="#2D1810">
      {/* Central diamond */}
      <polygon points="150,10 160,20 150,30 140,20" fill="#2D1810" />
      <polygon points="148,12 152,16 148,20 144,16" fill="#F5E6D3" />
      {/* Side elements */}
      <circle cx="120" cy="20" r="3" fill="none" strokeWidth="1" />
      <circle cx="180" cy="20" r="3" fill="none" strokeWidth="1" />
      <circle cx="100" cy="20" r="2" fill="#2D1810" />
      <circle cx="200" cy="20" r="2" fill="#2D1810" />
      {/* Decorative lines */}
      <line x1="50" y1="15" x2="85" y2="15" strokeWidth="2" />
      <line x1="115" y1="15" x2="150" y2="15" strokeWidth="2" />
      {/* Small diamonds */}
      <polygon points="70,13 72,15 70,17 68,15" fill="#2D1810" />
      <polygon points="130,13 132,15 130,17 128,15" fill="#2D1810" />
    </g>
  </svg>
)

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
      <div className="flex items-center gap-2 transition-all duration-200">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[60px] transition-all duration-200"
            placeholder={placeholder}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="transition-all duration-200"
          />
        )}
        <Button size="sm" onClick={handleSave} className="transition-all duration-200">
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="transition-all duration-200 bg-transparent"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`${className} cursor-pointer hover:bg-amber-50 p-1 rounded group transition-all duration-200`}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
      <Edit3 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 inline transition-all duration-200" />
    </div>
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
    <div className="flex justify-between items-center py-2 group">
      <div className="flex-1">
        <EditableText
          value={item.name}
          onChange={(name) => onUpdate({ name })}
          className="font-medium text-gray-900"
          placeholder="Item name"
        />
        {item.description && (
          <EditableText
            value={item.description}
            onChange={(description) => onUpdate({ description })}
            className="text-sm text-gray-600 mt-1"
            multiline
            placeholder="Item description"
          />
        )}
      </div>
      <div className="flex items-center gap-3">
        <EditableText
          value={item.price?.toString() || "0"}
          onChange={(price) => onUpdate({ price: Number.parseFloat(price) || 0 })}
          className="font-bold text-gray-900 text-right w-16"
          placeholder="$0.00"
        />
        {isPreviewMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
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
    <div className="space-y-6 transition-all duration-200">
      <div className="text-center">
        <EditableText
          value={category.name}
          onChange={(name) => onUpdate({ name })}
          className="text-3xl font-bold text-amber-900 uppercase tracking-[0.2em] transition-all duration-200"
          placeholder="CATEGORY NAME"
        />
        <div className="mt-4">
          <ArtDecoDecoration />
        </div>
      </div>

      <div className="space-y-1">
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
        <div className="flex justify-center gap-2 pt-4 transition-all duration-200">
          <Button
            size="sm"
            onClick={onAddItem}
            className="bg-amber-800 hover:bg-amber-900 text-white transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-amber-800 border-amber-800 hover:bg-amber-50 bg-transparent transition-all duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Category
          </Button>
        </div>
      )}
    </div>
  )
}

export function ElegantCocktailMenuPreview() {
  const { 
    isPreviewMode, 
    categories, 
    handleAddCategory, 
    handleUpdateCategory, 
    handleDeleteCategory, 
    handleAddItem 
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
    <div
      className="min-h-screen relative transition-all duration-200"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23654321'/%3E%3Cpath d='M0 0L100 100M100 0L0 100' stroke='%238B4513' strokeWidth='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23wood)'/%3E%3C/svg%3E")`,
        backgroundColor: "#3D2914",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-orange-900/30 transition-all duration-200"></div>

      <div className="relative z-10 p-8 transition-all duration-200">
        <div className="max-w-4xl mx-auto transition-all duration-200">
          {/* Menu paper overlay */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-2xl border-8 border-amber-900/20 p-12 transition-all duration-200">
            {/* Header with illustrations */}
            <div className="flex justify-between items-center mb-12 transition-all duration-200">
              <div className="flex-shrink-0 transition-all duration-200">
                <GinBottleIllustration />
              </div>

              <div className="flex-1 text-center px-8 transition-all duration-200">
                <div className="mb-6 transition-all duration-200">
                  <ArtDecoDecoration />
                </div>
                <h1 className="text-6xl font-bold text-amber-900 tracking-wider mb-4 transition-all duration-200">
                  MENU
                </h1>
                <div className="mb-6 transition-all duration-200">
                  <ArtDecoDecoration />
                </div>
              </div>

              <div className="flex-shrink-0 transition-all duration-200">
                <WineBottleIllustration />
              </div>
            </div>

            {/* Menu content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 transition-all duration-200">
              {displayCategories.slice(0, 2).map((category) => (
                <div key={category.id} className="transition-all duration-200">
                  <MenuCategoryComponent
                    category={category}
                    onUpdate={(updates) => handleUpdateCategory(category.id, 'name', updates.name || null)}
                    onDelete={() => handleDeleteCategory(category.id)}
                    onAddItem={() => addNewItem(category.id)}
                  />
                </div>
              ))}
            </div>

            {/* Additional categories */}
            {displayCategories.length > 2 && (
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16 transition-all duration-200">
                {displayCategories.slice(2).map((category) => (
                  <div key={category.id} className="transition-all duration-200">
                    <MenuCategoryComponent
                      category={category}
                      onUpdate={(updates) => handleUpdateCategory(category.id, 'name', updates.name || null)}
                      onDelete={() => handleDeleteCategory(category.id)}
                      onAddItem={() => addNewItem(category.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Bottom decoration */}
            <div className="mt-16 pt-8 transition-all duration-200">
              <div className="flex justify-center transition-all duration-200">
                <svg viewBox="0 0 200 40" className="w-64 h-8 transition-all duration-200">
                  <g fill="#2D1810" stroke="#2D1810" className="transition-all duration-200">
                    <polygon
                      points="100,5 110,15 100,25 90,15"
                      fill="#2D1810"
                      className="transition-all duration-200"
                    />
                    <polygon points="98,7 102,11 98,15 94,11" fill="#F5E6D3" className="transition-all duration-200" />
                    <line x1="50" y1="15" x2="85" y2="15" strokeWidth="2" className="transition-all duration-200" />
                    <line x1="115" y1="15" x2="150" y2="15" strokeWidth="2" className="transition-all duration-200" />
                    <polygon points="70,13 72,15 70,17 68,15" fill="#2D1810" className="transition-all duration-200" />
                    <polygon
                      points="130,13 132,15 130,17 128,15"
                      fill="#2D1810"
                      className="transition-all duration-200"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Add Category Button */}
          {!isPreviewMode && (
            <div className="text-center mt-8 transition-all duration-200">
              <Button
                onClick={addNewCategory}
                className="bg-amber-800 hover:bg-amber-900 text-white text-lg px-8 py-3 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Category
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
