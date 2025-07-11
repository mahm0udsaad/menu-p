"use client"

import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { GripVertical } from 'lucide-react'
import { useMenuEditor, type MenuItem } from '@/contexts/menu-editor-context'
import { resolveFontFamily } from '@/lib/font-config'

const ItemTypes = {
  MENU_ITEM: 'menu_item',
}

interface PaintingStyleEditableMenuItemProps {
  item: MenuItem
  index: number
  categoryId: string
  moveItem: (dragIndex: number, hoverIndex: number) => void
}

const PaintingStyleEditableMenuItem: React.FC<PaintingStyleEditableMenuItemProps> = ({ item, categoryId, index, moveItem }) => {
  const { handleUpdateItem, appliedRowStyles, appliedFontSettings } = useMenuEditor()
  const ref = useRef<HTMLDivElement>(null)

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

  const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text)
  const nameIsRTL = isRTL(item.name)
  const descriptionIsRTL = item.description ? isRTL(item.description) : nameIsRTL

  const nameFontFamily = resolveFontFamily(nameIsRTL ? appliedFontSettings.arabic.font : appliedFontSettings.english.font)
  const descriptionFontFamily = resolveFontFamily(descriptionIsRTL ? appliedFontSettings.arabic.font : appliedFontSettings.english.font)
  const priceFontFamily = resolveFontFamily(appliedFontSettings.english.font)

  const nameFontWeight = nameIsRTL ? appliedFontSettings.arabic.weight : appliedFontSettings.english.weight
  const descriptionFontWeight = descriptionIsRTL ? appliedFontSettings.arabic.weight : '400'
  const priceFontWeight = appliedFontSettings.english.weight

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center bg-white p-4 rounded-lg shadow-sm"
    >
      <div className="cursor-move pr-4">
        <GripVertical className="text-gray-400" />
      </div>
      <div className="flex-grow">
        <h3
          className="text-lg font-bold text-[#3a3a3a]"
          style={{
            fontFamily: nameFontFamily,
            fontWeight: nameFontWeight,
          }}
        >
          {item.name}
        </h3>
        {item.description && (
          <p
            className="text-sm text-gray-600 mt-1"
            style={{
              fontFamily: descriptionFontFamily,
              fontWeight: descriptionFontWeight,
            }}
          >
            {item.description}
          </p>
        )}
      </div>
      <div
        className="text-lg font-bold text-[#c8a97e] ml-4"
        style={{
          fontFamily: priceFontFamily,
          fontWeight: priceFontWeight,
        }}
      >
        {item.price}
      </div>
    </div>
  )
}

export default PaintingStyleEditableMenuItem 