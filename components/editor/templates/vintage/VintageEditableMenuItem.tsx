"use client"

import React, { useRef, useState, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { GripVertical, Edit, Save, X, Trash2 } from 'lucide-react'
import { useMenuEditor, type MenuItem, type RowStyleSettings } from '@/contexts/menu-editor-context'
import { resolveFontFamily } from '@/lib/font-config'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const ItemTypes = {
  MENU_ITEM: 'menu_item',
}

interface VintageEditableMenuItemProps {
  item: MenuItem
  index: number
  categoryId: string
  moveItem: (dragIndex: number, hoverIndex: number) => void
  currencySymbol: string
  appliedRowStyles: RowStyleSettings
}

const VintageEditableMenuItem: React.FC<VintageEditableMenuItemProps> = ({ item, categoryId, index, moveItem, currencySymbol, appliedRowStyles }) => {
  const { 
    handleUpdateItem,
    appliedFontSettings, 
    handleSaveNewItem, 
    handleDeleteItem,
    showConfirmation,
    currentPalette,
    currentLanguage,
    isPreviewMode,
  } = useMenuEditor()

  const ref = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(item.isTemporary || false)
  const [editedItem, setEditedItem] = useState(item)

  useEffect(() => {
    if (item.isTemporary) {
      setIsEditing(true)
    }
  }, [item.isTemporary])
  
  const onSave = () => {
    if (item.isTemporary) {
      handleSaveNewItem({ ...editedItem, category_id: categoryId })
    } else {
      handleUpdateItem(editedItem)
    }
    setIsEditing(false)
  }

  const onCancel = () => {
    if (item.isTemporary) {
      handleDeleteItem(item.id)
    } else {
      setEditedItem(item)
      setIsEditing(false)
    }
  }

  const onDeleteConfirm = () => {
    showConfirmation(
        `Delete '${item.name}'?`,
        "Are you sure you want to delete this item? This action cannot be undone.",
        () => handleDeleteItem(item.id),
        'danger'
    )
  }

  const [{ handlerId }, drop] = useDrop<{ id: string; index: number }, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.MENU_ITEM,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover(draggedItem: { id: string; index: number }, monitor) {
      if (!ref.current) return
      const dragIndex = draggedItem.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return
      
      moveItem(dragIndex, hoverIndex)
      draggedItem.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MENU_ITEM,
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  const isArabic = currentLanguage === 'ar';
  const activeFontSettings = isArabic ? appliedFontSettings.arabic : appliedFontSettings.english;

  const itemContainerStyle: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
  };

  if (appliedRowStyles) {
    if (appliedRowStyles.backgroundType === 'solid') {
      itemContainerStyle.backgroundColor = appliedRowStyles.backgroundColor;
    }
    if (appliedRowStyles.borderBottom.enabled) {
      itemContainerStyle.borderStyle = 'solid';
      itemContainerStyle.borderWidth = `${appliedRowStyles.borderBottom.width}px`;
      itemContainerStyle.borderColor = appliedRowStyles.borderBottom.color;
      itemContainerStyle.borderRadius = `${appliedRowStyles.borderRadius}px`;
      itemContainerStyle.padding = '1rem';
    }
  }

  // Style objects for dynamic fonts
  const nameStyle = {
    fontFamily: resolveFontFamily(activeFontSettings.font),
    fontWeight: activeFontSettings.weight || 'bold',
    color: appliedRowStyles?.itemColor || currentPalette.primary,
    textAlign: (isArabic ? 'right' : 'left') as 'right' | 'left',
  };

  const descriptionStyle = {
    fontFamily: resolveFontFamily(activeFontSettings.font),
    fontWeight: 400,
    color: appliedRowStyles?.descriptionColor || currentPalette.secondary,
    textAlign: (isArabic ? 'right' : 'left') as 'right' | 'left',
  };

  const priceStyle = {
    fontFamily: resolveFontFamily(activeFontSettings.font),
    fontWeight: activeFontSettings.weight || 'bold',
    color: appliedRowStyles?.priceColor || currentPalette.primary,
  };

  if (isEditing) {
    return (
      <div ref={ref} className="p-3 my-2 border border-blue-400 rounded-md bg-white shadow-lg" style={itemContainerStyle} dir={isArabic ? 'rtl' : 'ltr'}>
        <Input
          value={editedItem.name}
          onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Item Name"
          className="text-base font-bold border-0 p-0"
          style={nameStyle}
        />
        <Textarea
          value={editedItem.description || ''}
          onChange={(e) => setEditedItem(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Item description"
          className="text-sm mt-1 border-0 p-0 h-auto"
          style={descriptionStyle}
        />
        <div className={`flex justify-between items-center mt-2`}>
          <div className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
            <span className={isArabic ? 'ml-1' : 'mr-1'} style={priceStyle}>{currencySymbol}</span>
            <Input
              value={editedItem.price ?? ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="Price"
              type="number"
              className="text-base font-bold w-20 border-0 p-0"
              style={priceStyle}
            />
          </div>
          <div className="flex items-center">
            <Button onClick={onSave} size="sm" variant="ghost"><Save className="h-4 w-4 text-green-600" /></Button>
            <Button onClick={onCancel} size="sm" variant="ghost"><X className="h-4 w-4 text-red-600" /></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={itemContainerStyle}
      className={`py-2 flex items-center justify-between w-full`}
    >
        {!isPreviewMode && (
          <div className={`cursor-move ${isArabic ? 'pl-2' : 'pr-2'}`}>
              <GripVertical className="text-gray-400 h-4 w-4" />
          </div>
        )}
      <div className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
        <div>
            <h4 className="text-base font-bold" style={nameStyle}>{item.name}</h4>
            {item.description && <p className="text-sm mt-1" style={descriptionStyle}>{item.description}</p>}
        </div>
      </div>

      <div className="flex items-center flex-shrink-0">
        <p className="text-base font-bold" style={priceStyle}>{currencySymbol}{item.price}</p>
        {!isPreviewMode && (
          <div className={`flex items-center ${isArabic ? 'mr-2' : 'ml-2'}`}>
            <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
            <Button onClick={onDeleteConfirm} variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VintageEditableMenuItem 