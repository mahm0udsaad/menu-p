"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit3, Trash2, X, Check } from "lucide-react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import type { MenuCategory, MenuItem } from "@/contexts/menu-editor-context"

// Hand-drawn SVG illustrations matching the reference image
const PizzaIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32">
    {/* Pizza base */}
    <circle cx="100" cy="100" r="80" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Crust texture */}
    <circle cx="100" cy="100" r="75" fill="none" stroke="#C41E3A" strokeWidth="1" strokeDasharray="3,2" />
    {/* Pepperoni */}
    <circle cx="80" cy="80" r="8" fill="#C41E3A" />
    <circle cx="120" cy="70" r="8" fill="#C41E3A" />
    <circle cx="90" cy="110" r="8" fill="#C41E3A" />
    <circle cx="130" cy="120" r="8" fill="#C41E3A" />
    <circle cx="70" cy="130" r="8" fill="#C41E3A" />
    {/* Cheese texture - dots */}
    <circle cx="85" cy="95" r="2" fill="#C41E3A" />
    <circle cx="115" cy="85" r="2" fill="#C41E3A" />
    <circle cx="105" cy="105" r="2" fill="#C41E3A" />
    <circle cx="95" cy="125" r="2" fill="#C41E3A" />
    <circle cx="125" cy="95" r="2" fill="#C41E3A" />
    {/* Crosshatch pattern */}
    <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
      <line x1="60" y1="60" x2="140" y2="140" />
      <line x1="70" y1="60" x2="150" y2="140" />
      <line x1="50" y1="70" x2="130" y2="150" />
      <line x1="140" y1="60" x2="60" y2="140" />
      <line x1="130" y1="60" x2="50" y2="140" />
      <line x1="150" y1="70" x2="70" y2="150" />
    </g>
  </svg>
)

const BurgerIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32">
    {/* Top bun */}
    <ellipse cx="100" cy="70" rx="70" ry="25" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Sesame seeds */}
    <ellipse cx="80" cy="65" rx="3" ry="2" fill="#C41E3A" />
    <ellipse cx="100" cy="62" rx="3" ry="2" fill="#C41E3A" />
    <ellipse cx="120" cy="68" rx="3" ry="2" fill="#C41E3A" />
    {/* Lettuce */}
    <path d="M40 95 Q100 85 160 95 Q150 105 100 100 Q50 105 40 95" fill="#90EE90" stroke="#C41E3A" strokeWidth="2" />
    {/* Meat patty */}
    <ellipse cx="100" cy="110" rx="65" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
    {/* Cheese */}
    <path
      d="M45 125 Q100 115 155 125 Q145 135 100 130 Q55 135 45 125"
      fill="#FFD700"
      stroke="#C41E3A"
      strokeWidth="2"
    />
    {/* Bottom bun */}
    <ellipse cx="100" cy="145" rx="70" ry="20" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Crosshatch shading */}
    <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
      <line x1="50" y1="50" x2="150" y2="150" />
      <line x1="60" y1="50" x2="160" y2="150" />
      <line x1="40" y1="60" x2="140" y2="160" />
    </g>
  </svg>
)

const FriesIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-24 h-32">
    {/* Container */}
    <path d="M60 120 L60 180 L140 180 L140 120 L130 100 L70 100 Z" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Fries */}
    <rect x="75" y="80" width="8" height="40" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="90" y="70" width="8" height="50" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="105" y="75" width="8" height="45" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="120" y="85" width="8" height="35" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    {/* Container logo */}
    <circle cx="100" cy="150" r="15" fill="none" stroke="#C41E3A" strokeWidth="2" />
    <circle cx="100" cy="150" r="8" fill="#C41E3A" />
  </svg>
)

const HotDogIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-24">
    {/* Bun */}
    <ellipse cx="100" cy="100" rx="80" ry="30" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Sausage */}
    <ellipse cx="100" cy="100" rx="70" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
    {/* Mustard */}
    <path d="M40 95 Q60 90 80 95 Q100 90 120 95 Q140 90 160 95" stroke="#FFD700" strokeWidth="4" fill="none" />
    {/* Ketchup */}
    <path d="M45 105 Q65 100 85 105 Q105 100 125 105 Q145 100 155 105" stroke="#C41E3A" strokeWidth="3" fill="none" />
    {/* Crosshatch texture */}
    <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
      <line x1="30" y1="80" x2="170" y2="120" />
      <line x1="30" y1="90" x2="170" y2="130" />
      <line x1="30" y1="110" x2="170" y2="90" />
      <line x1="30" y1="120" x2="170" y2="100" />
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
      <div className="flex items-center gap-2">
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
      </div>
    )
  }

  return (
    <div className={`${className} cursor-pointer hover:bg-red-50 p-1 rounded group`} onClick={() => setIsEditing(true)}>
      {value || <span className="text-gray-400">{placeholder}</span>}
      <Edit3 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 inline transition-opacity duration-300" />
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
          className="font-medium text-amber-900"
          placeholder="Item name"
        />
        {item.description && (
          <EditableText
            value={item.description}
            onChange={(description) => onUpdate({ description })}
            className="text-sm text-amber-700 mt-1"
            multiline
            placeholder="Item description"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <EditableText
          value={`$${item.price}`}
          onChange={(priceStr) => {
            const price = Number.parseFloat(priceStr.replace("$", "")) || 0
            onUpdate({ price })
          }}
          className="font-bold text-red-600 text-lg"
          placeholder="$0.00"
        />
        {isPreviewMode && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-300 ease-in-out"
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
    <div className="space-y-4">
      <div className="text-center">
        <EditableText
          value={category.name}
          onChange={(name) => onUpdate({ name })}
          className="text-2xl font-bold text-red-600 uppercase tracking-wider"
          placeholder="Category Name"
        />
        {category.description && (
          <EditableText
            value={category.description}
            onChange={(description) => onUpdate({ description })}
            className="text-sm text-amber-700 mt-2"
            multiline
            placeholder="Category description"
          />
        )}
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

      {isPreviewMode && (
        <div className="flex justify-center gap-2 transition-opacity duration-300">
          <Button size="sm" onClick={onAddItem} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Category
          </Button>
        </div>
      )}
    </div>
  )
}

export function FastFoodMenuPreview() {
  const { isPreviewMode, categories } = useMenuEditor()

  const addNewCategory = () => {
    const newCategory: MenuCategory = {
      id: `category-${Date.now()}`,
      name: "New Category",
      description: "",
      menu_items: [],
    }
    // actions.addCategory(newCategory) // This line was removed from the original file
  }

  const addNewItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: "New Item",
      description: "",
      price: 0,
      image_url: null,
      is_available: true,
      is_featured: false,
      dietary_info: [],
    }
    // actions.addItem(categoryId, newItem) // This line was removed from the original file
  }

  // Use categories from context
  const displayCategories = categories.length > 0 ? categories : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with illustrations */}
        <div className="relative bg-gradient-to-r from-red-50 to-amber-50 border-4 border-red-600 rounded-lg p-8 mb-8">
          {/* Top illustrations */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-shrink-0">
              <PizzaIllustration />
            </div>
            <div className="flex-1 text-center">
              <div className="text-sm text-red-600 font-medium tracking-[0.3em] mb-2">B O R C E L L E</div>
              <h1 className="text-8xl font-black text-red-600 tracking-wider">MENU</h1>
            </div>
            <div className="flex-shrink-0">
              <BurgerIllustration />
            </div>
          </div>

          {/* Decorative line */}
          <div className="border-t-4 border-red-600 border-dashed mb-8"></div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayCategories.slice(0, 4).map((category, index) => (
              <div key={category.id} className="space-y-4">
                <MenuCategoryComponent
                  category={category}
                  onUpdate={(updates) => {
                    // This function was removed from the original file
                  }}
                  onDelete={() => {
                    // This function was removed from the original file
                  }}
                  onAddItem={() => addNewItem(category.id)}
                />
              </div>
            ))}
          </div>

          {/* Additional categories */}
          {displayCategories.length > 4 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCategories.slice(4).map((category) => (
                <div key={category.id} className="space-y-4">
                  <MenuCategoryComponent
                    category={category}
                    onUpdate={(updates) => {
                      // This function was removed from the original file
                    }}
                    onDelete={() => {
                      // This function was removed from the original file
                    }}
                    onAddItem={() => addNewItem(category.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bottom illustrations */}
          <div className="flex justify-between items-end mt-8 pt-8 border-t-4 border-red-600">
            <div className="flex-shrink-0">
              <FriesIllustration />
            </div>
            <div className="flex-1"></div>
            <div className="flex-shrink-0">
              <HotDogIllustration />
            </div>
          </div>
        </div>

        {/* Add Category Button */}
        {isPreviewMode && (
          <div className="text-center transition-opacity duration-300">
            <Button onClick={addNewCategory} className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3">
              <Plus className="w-5 h-5 mr-2" />
              Add New Category
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
