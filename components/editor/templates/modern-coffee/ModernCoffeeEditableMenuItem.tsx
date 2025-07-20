"use client"

import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useMenuEditor, type MenuItem } from '@/contexts/menu-editor-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, GripVertical } from 'lucide-react';

interface ModernCoffeeEditableMenuItemProps {
  item: MenuItem;
  index: number;
  categoryId: string;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  fontSettings: any;
  rowStyleSettings: any;
  appliedRowStyles: any;
  currentLanguage: string;
}

const ModernCoffeeEditableMenuItem: React.FC<ModernCoffeeEditableMenuItemProps> = ({
  item,
  index,
  categoryId,
  moveItem,
  fontSettings,
  rowStyleSettings,
  appliedRowStyles,
  currentLanguage,
}) => {
  const {
    handleUpdateItem,
    handleDeleteItem,
    requestDeleteItem,
  } = useMenuEditor();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editingName, setEditingName] = useState(item.name);
  const [editingPrice, setEditingPrice] = useState(item.price?.toString() || '');

  const isArabic = currentLanguage === 'ar';
  const activeFontSettings = isArabic ? fontSettings.arabic : fontSettings.english;
  const fontName = activeFontSettings.font.replace(/\s/g, '_');

  // Drag and drop for items
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'ITEM',
    item: { index, id: item.id, categoryId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'ITEM',
    hover: (draggedItem: any, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      const dragCategoryId = draggedItem.categoryId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragCategoryId === categoryId) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      draggedItem.index = hoverIndex;
      draggedItem.categoryId = categoryId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const ref = useRef<HTMLDivElement>(null);
  drag(drop(ref));

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    handleUpdateItem(categoryId, item.id, { name: editingName });
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditingName(item.name);
    setIsEditingName(false);
  };

  const handlePriceEdit = () => {
    setIsEditingPrice(true);
  };

  const handlePriceSave = () => {
    const price = parseFloat(editingPrice);
    if (!isNaN(price)) {
      handleUpdateItem(categoryId, item.id, { price });
    }
    setIsEditingPrice(false);
  };

  const handlePriceCancel = () => {
    setEditingPrice(item.price?.toString() || '');
    setIsEditingPrice(false);
  };

  const handleItemDelete = () => {
    requestDeleteItem(categoryId, item.id);
  };

  return (
    <div
      ref={dragPreview}
      className={`group/item relative ${isDragging ? 'opacity-50 rotate-1 scale-105' : ''}`}
    >
      <div
        ref={ref}
        className={`flex justify-between items-center py-2 ${
          isOver ? 'bg-orange-100/50 rounded-xl p-2' : ''
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="cursor-grab p-1 hover:bg-orange-100 rounded bg-orange-50 transition-all duration-300 ease-in-out opacity-0 group-hover/item:opacity-100">
            <GripVertical className="w-4 h-4 text-orange-600/70" />
          </div>
          
          {isEditingName ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') handleNameCancel();
              }}
              className="text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-orange-300 focus:border-orange-500 outline-none uppercase tracking-wide"
              autoFocus
            />
          ) : (
            <h4 
              className="text-lg font-semibold text-gray-900 uppercase tracking-wide cursor-pointer hover:text-orange-700 transition-colors"
              onClick={handleNameEdit}
              style={{
                fontFamily: fontName,
                fontWeight: activeFontSettings.weight,
              }}
            >
              {item.name}
            </h4>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {isEditingPrice ? (
            <Input
              type="number"
              value={editingPrice}
              onChange={(e) => setEditingPrice(e.target.value)}
              onBlur={handlePriceSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePriceSave();
                if (e.key === 'Escape') handlePriceCancel();
              }}
              className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-orange-300 focus:border-orange-500 outline-none w-20 text-right"
              autoFocus
            />
          ) : (
            <div 
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-orange-700 transition-colors"
              onClick={handlePriceEdit}
              style={{
                fontFamily: fontName,
                fontWeight: activeFontSettings.weight,
              }}
            >
              ${item.price?.toFixed(0) || '0'}
            </div>
          )}
          
          <div className="flex gap-1 transition-all duration-300 ease-in-out opacity-0 group-hover/item:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNameEdit}
              className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 bg-orange-50"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleItemDelete}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-orange-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCoffeeEditableMenuItem; 