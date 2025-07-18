"use client"

import React, { useState, useEffect } from 'react'
import { useMenuEditor, type MenuCategory, type RowStyleSettings } from '@/contexts/menu-editor-context'
import VintageEditableMenuItem from './VintageEditableMenuItem'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { resolveFontFamily } from '@/lib/font-config'

interface VintageMenuSectionProps {
  category: MenuCategory
  currencySymbol: string
  appliedRowStyles: RowStyleSettings
}

const VintageMenuSection: React.FC<VintageMenuSectionProps> = ({ category, currencySymbol, appliedRowStyles }) => {
  const { 
    handleAddItem, 
    moveItem, 
    handleUpdateCategory, 
    handleDeleteCategory,
    handleSaveNewCategory,
    appliedFontSettings,
    currentPalette,
    currentLanguage,
    isPreviewMode,
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

  const isArabic = currentLanguage === 'ar';

  const titleStyle = {
    fontFamily: resolveFontFamily(appliedFontSettings.english.font),
    color: currentPalette.accent,
    borderBottomColor: currentPalette.accent,
  };

  return (
    <div className="w-full p-4 rounded-lg relative group" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className={`relative mb-4 flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
        {isEditing ? (
          <div className="flex items-center gap-2 flex-grow">
            <Input 
              value={editedName} 
              onChange={(e) => setEditedName(e.target.value)}
              className="text-lg font-bold uppercase p-0 border-0 border-b-2"
              style={{...titleStyle, textAlign: isArabic ? 'right' : 'left'}}
              autoFocus
            />
            <Button onClick={onSave} variant="ghost" size="icon"><Save className="w-5 h-5 text-green-600" /></Button>
            <Button onClick={onCancel} variant="ghost" size="icon"><X className="w-5 h-5 text-red-600" /></Button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold uppercase pb-2 border-b-2 flex-grow" style={{...titleStyle, textAlign: isArabic ? 'right' : 'left'}}>
                {category.name}
            </h3>
            {!isPreviewMode && (
              <div className={`flex items-center ${isArabic ? 'mr-2' : 'ml-2'}`}>
                  <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                  <Button onClick={() => handleDeleteCategory(category.id)} variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        {category.menu_items.map((item, itemIndex) => (
          <VintageEditableMenuItem
            key={item.id}
            item={item}
            index={itemIndex}
            categoryId={category.id}
            moveItem={(dragIndex, hoverIndex) => moveItem(category.id, dragIndex, hoverIndex)}
            currencySymbol={currencySymbol}
            appliedRowStyles={appliedRowStyles}
          />
        ))}
      </div>
      
      {!isPreviewMode && (
        <div className="mt-4 text-center">
              <Button 
                  onClick={() => handleAddItem(category.id)} 
                  variant="ghost" 
                  className="text-gray-500 hover:text-gray-800"
              >
              <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
        </div>
      )}
    </div>
  )
}

export default VintageMenuSection 