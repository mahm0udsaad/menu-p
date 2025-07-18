"use client"

import React, { useState, useEffect } from 'react'
import { useMenuEditor, type MenuCategory } from '@/contexts/menu-editor-context'
import PaintingStyleEditableMenuItem from './PaintingStyleEditableMenuItem'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface PaintingStyleMenuSectionProps {
  category: MenuCategory
}

const PaintingStyleMenuSection: React.FC<PaintingStyleMenuSectionProps> = ({ category }) => {
  const { 
    handleAddItem, 
    moveItem, 
    handleUpdateCategory, 
    handleDeleteCategory,
    handleSaveNewCategory,
    isPreviewMode
  } = useMenuEditor()

  const [isEditing, setIsEditing] = useState(category.isTemporary || false)
  const [editedName, setEditedName] = useState(category.name)

  useEffect(() => {
    if (category.isTemporary) {
      setIsEditing(true)
    }
  }, [category.isTemporary])

  const onSave = () => {
    if (category.isTemporary) {
      handleSaveNewCategory({ ...category, name: editedName })
    } else {
      handleUpdateCategory(category.id, 'name', editedName)
    }
    setIsEditing(false)
  }

  const onCancel = () => {
    if (category.isTemporary) {
      handleDeleteCategory(category.id)
    } else {
      setEditedName(category.name)
      setIsEditing(false)
    }
  }

  return (
    <div className="mb-12 group">
      <div className="text-center mb-8 relative">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <Input 
              value={editedName} 
              onChange={(e) => setEditedName(e.target.value)}
              className="text-3xl font-bold text-center text-[#c8a97e] bg-transparent"
            />
            <Button onClick={onSave} variant="ghost" size="icon"><Save className="w-5 h-5 text-green-600" /></Button>
            <Button onClick={onCancel} variant="ghost" size="icon"><X className="w-5 h-5 text-red-600" /></Button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-[#c8a97e] pb-4">
              <span className="z-10 relative">{category.name}</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-[#c8a97e]"></span>
            </h2>
            {!isPreviewMode && (
              <div className="absolute top-0 right-0">
                <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                <Button onClick={() => handleDeleteCategory(category.id)} variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-600" /></Button>
              </div>
            )}
          </>
        )}
      </div>

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
      {!isPreviewMode && (
        <div className="mt-6 text-center">
          <Button onClick={() => handleAddItem(category.id)} variant="ghost" className="text-gray-500 hover:text-[#c8a97e]">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      )}
    </div>
  )
}

export default PaintingStyleMenuSection 