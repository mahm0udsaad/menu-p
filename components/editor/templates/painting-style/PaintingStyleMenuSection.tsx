"use client"

import React from 'react'
import { useMenuEditor, type MenuCategory } from '@/contexts/menu-editor-context'
import PaintingStyleEditableMenuItem from './PaintingStyleEditableMenuItem'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PaintingStyleMenuSectionProps {
  category: MenuCategory
}

const PaintingStyleMenuSection: React.FC<PaintingStyleMenuSectionProps> = ({ category }) => {
  const { handleAddItem, moveItem } = useMenuEditor()

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-center text-[#c8a97e] mb-8 relative pb-4">
        <span className="z-10 relative">{category.name}</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-[#c8a97e]"></span>
      </h2>
      <div className="space-y-4">
        {category.menu_items.map((item, index) => (
          <PaintingStyleEditableMenuItem
            key={item.id}
            item={item}
            index={index}
            categoryId={category.id}
            moveItem={(dragIndex, hoverIndex) => moveItem(category.id, dragIndex, hoverIndex)}
          />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button onClick={() => handleAddItem(category.id)} variant="ghost" className="text-gray-500 hover:text-[#c8a97e]">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>
    </div>
  )
}

export default PaintingStyleMenuSection 