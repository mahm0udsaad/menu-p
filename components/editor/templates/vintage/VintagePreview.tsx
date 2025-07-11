"use client"

import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import VintageMenuSection from "./VintageMenuSection"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const VintageMenuContent: React.FC = () => {
  const { 
    restaurant, 
    categories, 
    handleAddCategory,
    appliedPageBackgroundSettings 
  } = useMenuEditor()

  const backgroundStyle: React.CSSProperties = {
    background: appliedPageBackgroundSettings.backgroundType === 'solid' 
      ? appliedPageBackgroundSettings.backgroundColor
      : appliedPageBackgroundSettings.backgroundType === 'gradient'
        ? `linear-gradient(${appliedPageBackgroundSettings.gradientDirection}, ${appliedPageBackgroundSettings.gradientFrom}, ${appliedPageBackgroundSettings.gradientTo})`
        : appliedPageBackgroundSettings.backgroundImage
          ? `url(${appliedPageBackgroundSettings.backgroundImage})`
          : '#fdfaf3', // Fallback to vintage-style bg color
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '40px',
  };

  const currencySymbol = restaurant?.currency || '$';

  // Split categories into two columns
  const middleIndex = Math.ceil(categories.length / 2);
  const leftColumnCategories = categories.slice(0, middleIndex);
  const rightColumnCategories = categories.slice(middleIndex);

  return (
    <div style={backgroundStyle} className="min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
            {restaurant?.logo_url ? (
                <img 
                src={restaurant.logo_url} 
                alt={restaurant.name} 
                className="w-24 h-24 object-contain mx-auto mb-4" 
                />
            ) : (
                <div className="mb-4">
                    {/* Placeholder for the cloche icon from the PDF */}
                    <img src="/assets/menu-header.png" alt="Menu Icon" className="w-20 h-20 mx-auto" />
                </div>
            )}
            <h1 className="text-5xl font-serif" style={{ fontFamily: 'Oswald, serif' }}>
                {restaurant?.name || 'MENU'}
            </h1>
        </div>

        {/* Categories in two columns */}
        <div className="flex flex-row justify-center gap-x-8">
            <div className="w-full md:w-2/5">
                {leftColumnCategories.map((category) => (
                  <VintageMenuSection 
                    key={category.id} 
                    category={category}
                    currencySymbol={currencySymbol}
                  />
                ))}
            </div>
            <div className="w-full md:w-2/5">
                {rightColumnCategories.map((category) => (
                  <VintageMenuSection 
                    key={category.id} 
                    category={category}
                    currencySymbol={currencySymbol}
                  />
                ))}
            </div>
        </div>
        
        <div className="mt-8 text-center">
            <Button onClick={handleAddCategory} variant="outline" className="border-gray-400 border-dashed hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
        </div>
    </div>
  )
}

export default function VintagePreview() {
    return (
        <DndProvider backend={HTML5Backend}>
            <VintageMenuContent />
        </DndProvider>
    )
} 