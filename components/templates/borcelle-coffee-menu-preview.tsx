"use client"

import { useMenuEditor } from '@/contexts/menu-editor-context'
import EditableMenuItem from '@/components/editor/editable-menu-item'
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus } from 'lucide-react'

export function BorcelleCoffeeMenuPreview() {
  const { 
    categories,
    appliedFontSettings,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddItem,
    handleAddCategory,
    moveItem,
    isPreviewMode
  } = useMenuEditor()

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div className="flex-1">
            {/* Logo */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-amber-900 flex items-center justify-center mr-4">
                <span className="text-amber-900 font-bold text-lg">B</span>
              </div>
              <h1 className="text-3xl font-bold text-amber-900 tracking-wider">BORCELLE</h1>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-4xl font-script text-amber-900 mb-2" style={{ fontFamily: "cursive" }}>
                Coffee Shop
              </h2>
              <h3 className="text-6xl font-bold text-amber-900 tracking-tight">MENU</h3>
            </div>
          </div>

          {/* Coffee Image */}
          <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-amber-200 ml-8">
            <img src="/coffee-menu-2.png" alt="Coffee and pastries" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-12">
          {categories.map((category, index) => (
            <div key={category.id} className="relative">
              {/* Category Header with Icon */}
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 mr-4">
                  {index === 0 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V10H4V8H16V3H20Z"
                      />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M17,19H7V17H17V19M16,14H8V12L10.5,9.5L9.08,8.08L12,5.16L14.92,8.08L13.5,9.5L16,12V14M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z"
                      />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M17,19H7V17H17V19M16,14H8V12L10.5,9.5L9.08,8.08L12,5.16L14.92,8.08L13.5,9.5L16,12V14M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z"
                      />
                    </svg>
                  )}
                  {index === 3 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-amber-900 tracking-wide">{category.name.toUpperCase()}</h3>
                {!isPreviewMode && (
                  <div className="ml-2 flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {
                      const newName = prompt('Category name', category.name) || category.name
                      handleUpdateCategory(category.id, 'name', newName)
                    }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex-1 ml-4 border-b border-amber-900"></div>
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {category.menu_items.map((item, idx) => (
                  <EditableMenuItem
                    key={item.id}
                    item={item}
                    index={idx}
                    categoryId={category.id}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    moveItem={(dragIndex, hoverIndex) => moveItem(category.id, dragIndex, hoverIndex)}
                  />
                ))}
              </div>
              {!isPreviewMode && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => handleAddItem(category.id)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!isPreviewMode && (
          <div className="text-center mt-8">
            <Button onClick={handleAddCategory} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
        )}

        
      </div>
    </div>
    </DndProvider>
  )
} 