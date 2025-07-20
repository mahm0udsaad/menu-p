"use client"

import React from "react"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useMenuEditor, type MenuCategory, type RowStyleSettings, type SimplifiedFontSettings } from "@/contexts/menu-editor-context"
import PaintingStyleMenuSection from "./PaintingStyleMenuSection"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const PaintingStyleMenuContent: React.FC = () => {
  const { 
    restaurant, 
    categories, 
    handleAddCategory,
    appliedPageBackgroundSettings 
  } = useMenuEditor()

  const hasBgImage = !!appliedPageBackgroundSettings.backgroundImage

  const backgroundStyle: React.CSSProperties = {
    background: appliedPageBackgroundSettings.backgroundType === 'solid' 
      ? appliedPageBackgroundSettings.backgroundColor
      : appliedPageBackgroundSettings.backgroundType === 'gradient'
        ? `linear-gradient(${appliedPageBackgroundSettings.gradientDirection}, ${appliedPageBackgroundSettings.gradientFrom}, ${appliedPageBackgroundSettings.gradientTo})`
        : appliedPageBackgroundSettings.backgroundImage
          ? `url(${appliedPageBackgroundSettings.backgroundImage})`
          : 'transparent',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div 
      className={`font-oswald transition-all duration-300 ${hasBgImage ? 'py-12 px-4' : 'p-4 sm:p-16'}`}
      style={backgroundStyle}
    >
      <div 
        className={`
          transition-all duration-300
          ${hasBgImage 
            ? 'bg-[#f5f1e8] rounded-lg shadow-xl max-w-2xl mx-auto' 
            : ''
          }
        `}
      >
        <div className={`flex flex-col items-center ${hasBgImage ? 'p-8 sm:p-12' : 'bg-[#f5f1e8]'}`}>
          {restaurant?.logo_url ? (
            <img 
              src={restaurant.logo_url} 
              alt={restaurant.name} 
              className="w-full max-w-[400px] h-auto mb-12 object-contain self-center" 
            />
          ) : (
            <h1 className="text-4xl font-bold text-center my-8">{restaurant?.name}</h1>
          )}

          <div className="w-full max-w-[450px]">
            {categories.map((category: MenuCategory) => (
              <PaintingStyleMenuSection 
                key={category.id} 
                category={category}
              />
            ))}
          </div>
          
          <div className="mt-8">
              <Button onClick={handleAddCategory} variant="outline" className="border-gray-400 border-dashed">
                  <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaintingStylePreview() {
    return (
      <DndProvider backend={HTML5Backend}>
        <PaintingStyleMenuContent />
      </DndProvider>
    )
} 