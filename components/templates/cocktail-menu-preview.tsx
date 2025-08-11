"use client"

import { useMenuEditor } from '@/contexts/menu-editor-context'
import EditableMenuItem from '@/components/editor/editable-menu-item'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus } from 'lucide-react'

// SVG Illustrations for cocktail theme
const CocktailGlassIllustration = () => (
  <svg width="80" height="120" viewBox="0 0 80 120" className="text-white">
    <g fill="none" stroke="currentColor" strokeWidth="2">
      {/* Martini glass */}
      <path d="M20 30 L60 30 L40 60 L40 90" />
      <ellipse cx="40" cy="95" rx="15" ry="3" />

      {/* Liquid */}
      <path d="M25 35 L55 35 L40 55 Z" fill="currentColor" fillOpacity="0.2" />

      {/* Garnish */}
      <circle cx="35" cy="40" r="2" fill="currentColor" />
      <circle cx="45" cy="42" r="1.5" fill="currentColor" />

      {/* Bubbles */}
      <circle cx="38" cy="45" r="1" fill="currentColor" fillOpacity="0.3" />
      <circle cx="42" cy="48" r="0.8" fill="currentColor" fillOpacity="0.3" />
      <circle cx="40" cy="52" r="0.6" fill="currentColor" fillOpacity="0.3" />
    </g>
  </svg>
);

const CitrusSliceIllustration = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" className="text-white">
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Orange slice */}
      <circle cx="40" cy="40" r="25" fill="currentColor" fillOpacity="0.1" />
      <circle cx="40" cy="40" r="25" />

      {/* Segments */}
      <line x1="40" y1="15" x2="40" y2="65" />
      <line x1="15" y1="40" x2="65" y2="40" />
      <line x1="22" y1="22" x2="58" y2="58" />
      <line x1="58" y1="22" x2="22" y2="58" />

      {/* Center */}
      <circle cx="40" cy="40" r="3" fill="currentColor" fillOpacity="0.3" />

      {/* Texture details */}
      <g strokeWidth="0.8" opacity="0.6">
        <path d="M30 25 Q35 30 40 25" />
        <path d="M50 25 Q45 30 40 25" />
        <path d="M55 35 Q50 40 55 45" />
        <path d="M25 35 Q30 40 25 45" />
      </g>
    </g>
  </svg>
);

const CocktailShakerIllustration = () => (
  <svg width="60" height="120" viewBox="0 0 60 120" className="text-white">
    <g fill="none" stroke="currentColor" strokeWidth="2">
      {/* Shaker body */}
      <rect x="15" y="30" width="30" height="60" rx="5" fill="currentColor" fillOpacity="0.1" />
      <rect x="15" y="30" width="30" height="60" rx="5" />

      {/* Shaker top */}
      <rect x="18" y="20" width="24" height="15" rx="3" fill="currentColor" fillOpacity="0.1" />
      <rect x="18" y="20" width="24" height="15" rx="3" />

      {/* Cap */}
      <rect x="20" y="15" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.2" />
      <rect x="20" y="15" width="20" height="8" rx="2" />

      {/* Details */}
      <line x1="15" y1="45" x2="45" y2="45" strokeWidth="1" />
      <line x1="15" y1="60" x2="45" y2="60" strokeWidth="1" />
      <line x1="15" y1="75" x2="45" y2="75" strokeWidth="1" />

      {/* Handle */}
      <path d="M45 50 Q55 50 55 60 Q55 70 45 70" strokeWidth="1.5" />
    </g>
  </svg>
);

export function CocktailMenuPreview() {
  const { 
    categories,
    appliedFontSettings,
    appliedPageBackgroundSettings,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddItem,
    handleAddCategory,
    moveItem,
    isPreviewMode
  } = useMenuEditor()

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="min-h-screen bg-gray-100 flex">
      {/* Black Sidebar with Illustrations */}
      <div className="w-80 bg-black flex flex-col items-center justify-center space-y-12 p-8">
        <CocktailGlassIllustration />
        <CitrusSliceIllustration />
        <CocktailShakerIllustration />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-7xl font-black text-gray-900 tracking-tight mb-4">COCKTAIL</h1>
        </div>

        {/* Menu Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="relative">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-4xl font-bold text-gray-900 tracking-wide">{category.name.toUpperCase()}</h2>
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

              {/* Menu Items */}
              <div className="space-y-6">
                {category.menu_items.map((item, index) => (
                  <EditableMenuItem
                    key={item.id}
                    item={item}
                    index={index}
                    categoryId={category.id}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    moveItem={(dragIndex, hoverIndex) => moveItem(category.id, dragIndex, hoverIndex)}
                  />
                ))}
              </div>
              {!isPreviewMode && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => handleAddItem(category.id)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>
              )}
            </div>
          ))}
          {!isPreviewMode && (
            <div className="text-center mt-8">
              <Button onClick={handleAddCategory} className="bg-gray-900 text-white hover:bg-black">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-20">
          <p className="text-2xl text-gray-800 font-light">You'd rather drink than worry!</p>
        </div>
      </div>
    </div>
    </DndProvider>
  )
}

// Add default export for template registry compatibility
export default CocktailMenuPreview
