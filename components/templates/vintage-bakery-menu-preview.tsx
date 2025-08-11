"use client"

import React from 'react'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import EditableMenuItem from '@/components/editor/editable-menu-item'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus } from 'lucide-react'

export function VintageBakeryMenuPreview() {
  const { categories, restaurant, appliedFontSettings, appliedPageBackgroundSettings, appliedRowStyles, handleAddCategory, handleUpdateCategory, handleDeleteCategory, handleAddItem, moveItem, isPreviewMode } = useMenuEditor()

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-yellow-100 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-amber-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-yellow-600 text-white p-8 text-center relative">
          <div className="absolute inset-0 bg-amber-800/30"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: appliedFontSettings.english.font }}>
              {restaurant.name}
            </h1>
            <p className="text-amber-100 text-xl" style={{ fontFamily: appliedFontSettings.english.font }}>
              🥖 Artisan Bakery & Sweet Delights 🥖
            </p>
            <div className="mt-4 text-amber-200 text-sm">
              Handcrafted • Traditional • Delicious
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-8">
          {categories.map((category) => (
            <div key={category.id} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold text-amber-800 text-center flex-1 border-b-4 border-amber-300 pb-4" 
                    style={{ fontFamily: appliedFontSettings.english.font }}>
                  🥖 {category.name}
                </h2>
                {!isPreviewMode && (
                  <div className="ml-3 flex items-center gap-1">
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
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {category.menu_items.map((item, idx) => (
                  <div key={item.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-2 border-2 border-amber-200 hover:shadow-lg transition-all duration-300 hover:border-amber-300">
                    <EditableMenuItem
                      item={item}
                      index={idx}
                      categoryId={category.id}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                      moveItem={(dragIndex, hoverIndex) => moveItem(category.id, dragIndex, hoverIndex)}
                    />
                  </div>
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
          {!isPreviewMode && (
            <div className="text-center">
              <Button onClick={handleAddCategory} className="bg-amber-700 hover:bg-amber-800 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-700 text-white p-8 text-center">
          <p className="text-amber-100 text-lg" style={{ fontFamily: appliedFontSettings.english.font }}>
            🥖 Thank you for choosing {restaurant.name} 🥖
          </p>
          <p className="text-amber-200 text-sm mt-2">
            Fresh Baked Daily • Traditional Recipes • Made with Love
          </p>
        </div>
      </div>
    </div>
    </DndProvider>
  )
} 