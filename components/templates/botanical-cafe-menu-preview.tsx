"use client"

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import EditableMenuItem from '@/components/editor/editable-menu-item'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus } from 'lucide-react'

// Botanical illustrations
const FeatherIllustration = () => (
  <svg width="120" height="300" viewBox="0 0 120 300" className="text-green-600/20 absolute">
    <g fill="currentColor">
      <path d="M60 10 Q50 50 45 100 Q40 150 35 200 Q30 250 25 290 L35 290 Q40 250 45 200 Q50 150 55 100 Q60 50 70 10 Z" />
      <path d="M60 20 Q70 30 80 40 Q75 45 65 35 Q60 30 60 20" />
      <path d="M60 40 Q75 50 85 60 Q80 65 70 55 Q60 50 60 40" />
      <path d="M60 60 Q80 70 90 80 Q85 85 75 75 Q60 70 60 60" />
      <path d="M60 80 Q85 90 95 100 Q90 105 80 95 Q60 90 60 80" />
    </g>
  </svg>
)

const LeafIllustration = () => (
  <svg width="100" height="150" viewBox="0 0 100 150" className="text-green-500/30 absolute">
    <g fill="currentColor">
      <path d="M50 10 Q30 30 20 60 Q15 90 25 120 Q35 140 50 145 Q65 140 75 120 Q85 90 80 60 Q70 30 50 10 Z" />
      <path d="M50 20 L50 130" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M50 40 Q40 45 35 55" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M50 60 Q60 65 65 75" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M50 80 Q40 85 35 95" stroke="currentColor" strokeWidth="0.5" fill="none" />
    </g>
  </svg>
)

export function BotanicalCafeMenuPreview() {
  const { 
    categories,
    appliedPageBackgroundSettings,
    appliedFontSettings,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddItem,
    handleAddCategory,
    moveItem,
    isPreviewMode
  } = useMenuEditor()

  const bgStyle: React.CSSProperties = (() => {
    const s = appliedPageBackgroundSettings
    if (s.backgroundType === 'solid') return { backgroundColor: s.backgroundColor }
    if (s.backgroundType === 'gradient') return { background: `linear-gradient(${s.gradientDirection}, ${s.gradientFrom}, ${s.gradientTo})` }
    if (s.backgroundType === 'image' && s.backgroundImage) return { backgroundImage: `url(${s.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    return {}
  })()

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="min-h-screen relative overflow-hidden" style={bgStyle}>
      {/* Background Illustrations */}
      <div className="absolute top-20 left-10">
        <FeatherIllustration />
      </div>
      <div className="absolute bottom-20 right-10">
        <LeafIllustration />
      </div>
      <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
        <LeafIllustration />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" className="text-green-600">
              <path
                fill="currentColor"
                d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-light text-green-800 mb-2">Botanical</h1>
          <h2 className="text-6xl font-bold text-green-900 mb-4">CAFE</h2>
          <p className="text-xl text-green-700 max-w-md mx-auto">Fresh, organic, and naturally inspired</p>
        </div>

        {/* Menu Categories */}
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category.id} className="relative">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <h3 className="text-3xl font-bold text-green-900 mb-2" style={{ fontFamily: appliedFontSettings.english.font }}>{category.name}</h3>
                  <div className="w-24 h-0.5 bg-green-600 mx-auto"></div>
                </div>
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
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-200">
                <div className="space-y-4">
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
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => handleAddItem(category.id)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!isPreviewMode && (
            <div className="text-center">
              <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-green-700 text-lg italic">"Where nature meets nourishment"</p>
        </div>
      </div>
    </div>
    </DndProvider>
  )
} 