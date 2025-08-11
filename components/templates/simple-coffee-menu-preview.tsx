"use client"

import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import EditableMenuItem from '@/components/editor/editable-menu-item'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus } from 'lucide-react'

export function SimpleCoffeeMenuPreview() {
  const { 
    categories, 
    restaurant, 
    appliedFontSettings, 
    appliedPageBackgroundSettings, 
    appliedRowStyles,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddItem,
    moveItem,
    isPreviewMode
  } = useMenuEditor()

  const pageBgStyle: React.CSSProperties = (() => {
    const s = appliedPageBackgroundSettings
    if (s.backgroundType === 'solid') return { backgroundColor: s.backgroundColor }
    if (s.backgroundType === 'gradient') return { background: `linear-gradient(${s.gradientDirection}, ${s.gradientFrom}, ${s.gradientTo})` }
    if (s.backgroundType === 'image' && s.backgroundImage) return { backgroundImage: `url(${s.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    return { background: 'linear-gradient(to bottom right, #FFFBEB, #FFEDD5)' }
  })()

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full p-6 overflow-auto" style={pageBgStyle}>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: appliedFontSettings.english.font }}>
              {restaurant.name}
            </h1>
            <p className="text-amber-100 text-lg" style={{ fontFamily: appliedFontSettings.english.font }}>
              Fresh Coffee & Delicious Treats
            </p>
          </div>

          {/* Menu Content */}
          <div className="p-8">
            {categories.map((category) => (
              <div key={category.id} className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-amber-800 text-center flex-1 border-b-2 border-amber-200 pb-2" 
                      style={{ fontFamily: appliedFontSettings.english.font }}>
                    {category.name}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.menu_items.map((item, index) => (
                    <div key={item.id} className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                      <EditableMenuItem
                        item={item}
                        index={index}
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
                <Button onClick={handleAddCategory} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-amber-800 text-white p-6 text-center">
            <p className="text-amber-100" style={{ fontFamily: appliedFontSettings.english.font }}>
              Thank you for choosing {restaurant.name}
            </p>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}