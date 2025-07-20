"use client"

import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useMenuEditor, type MenuItem } from '@/contexts/menu-editor-context';
import ModernCoffeeEditableMenuItem from './ModernCoffeeEditableMenuItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';

interface ModernCoffeeMenuSectionProps {
  category: any;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  fontSettings: any;
  rowStyleSettings: any;
  appliedRowStyles: any;
  currentLanguage: string;
}

const ModernCoffeeMenuSection: React.FC<ModernCoffeeMenuSectionProps> = ({
  category,
  index,
  moveItem,
  fontSettings,
  rowStyleSettings,
  appliedRowStyles,
  currentLanguage,
}) => {
  const {
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddItem,
    requestDeleteCategory,
  } = useMenuEditor();

  const [isEditingCategory, setIsEditingCategory] = React.useState(false);
  const [editingCategoryName, setEditingCategoryName] = React.useState(category.name);
  const [isAddingItem, setIsAddingItem] = React.useState(false);

  const isArabic = currentLanguage === 'ar';
  const activeFontSettings = isArabic ? fontSettings.arabic : fontSettings.english;
  const fontName = activeFontSettings.font.replace(/\s/g, '_');

  // Drag and drop for categories
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'CATEGORY',
    item: { index, id: category.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'CATEGORY',
    hover: (item: any, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const ref = useRef<HTMLDivElement>(null);
  drag(drop(ref));

  const handleCategoryEdit = () => {
    setIsEditingCategory(true);
  };

  const handleCategorySave = () => {
    handleUpdateCategory(category.id, { name: editingCategoryName });
    setIsEditingCategory(false);
  };

  const handleCategoryCancel = () => {
    setEditingCategoryName(category.name);
    setIsEditingCategory(false);
  };

  const handleCategoryDelete = () => {
    requestDeleteCategory(category.id);
  };

  const handleAddItemClick = () => {
    setIsAddingItem(true);
  };

  const handleAddItemSave = (itemData: any) => {
    handleAddItem(category.id, itemData);
    setIsAddingItem(false);
  };

  const handleAddItemCancel = () => {
    setIsAddingItem(false);
  };

  return (
    <div
      ref={dragPreview}
      className={`group relative ${isDragging ? 'opacity-50 rotate-1 scale-105' : ''}`}
    >
      <div
        ref={ref}
        className={`relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-200 ${
          isOver ? 'bg-orange-100/50' : ''
        }`}
      >
        {/* Category Controls */}
        <div className="absolute top-4 right-4 flex gap-1 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
          <div className="cursor-grab p-2 hover:bg-orange-100 rounded bg-orange-50">
            <GripVertical className="w-4 h-4 text-orange-600/70" />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCategoryEdit}
            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 bg-orange-50"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCategoryDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-orange-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddItemClick}
            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 bg-orange-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Header */}
        <div className="mb-6">
          {isEditingCategory ? (
            <div className="flex items-center gap-2">
              <Input
                value={editingCategoryName}
                onChange={(e) => setEditingCategoryName(e.target.value)}
                onBlur={handleCategorySave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCategorySave();
                  if (e.key === 'Escape') handleCategoryCancel();
                }}
                className="text-3xl font-black bg-white/80 border-orange-300 text-gray-900 tracking-wider"
                autoFocus
              />
            </div>
          ) : (
            <h3
              className="text-3xl font-black text-gray-900 tracking-wider cursor-pointer hover:text-orange-700 transition-colors"
              onClick={handleCategoryEdit}
              style={{
                fontFamily: fontName,
                fontWeight: activeFontSettings.weight,
              }}
            >
              {category.name.toUpperCase()}
            </h3>
          )}
        </div>

        {/* Items */}
        <div className="space-y-4 min-h-[50px]">
          {category.menu_items?.map((item: MenuItem, itemIndex: number) => (
            <ModernCoffeeEditableMenuItem
              key={item.id}
              item={item}
              index={itemIndex}
              categoryId={category.id}
              moveItem={(dragIndex: number, hoverIndex: number) => 
                moveItem(category.id, dragIndex, hoverIndex)
              }
              fontSettings={fontSettings}
              rowStyleSettings={rowStyleSettings}
              appliedRowStyles={appliedRowStyles}
              currentLanguage={currentLanguage}
            />
          ))}

          {/* Add Item Form */}
          {isAddingItem && (
            <div className="bg-amber-50/80 rounded-lg p-4 border border-amber-200">
              <div className="space-y-3">
                <Input
                  placeholder={isArabic ? 'اسم المنتج' : 'Item name'}
                  className="bg-white/80 border-orange-300"
                />
                <Input
                  placeholder={isArabic ? 'الوصف' : 'Description'}
                  className="bg-white/80 border-orange-300"
                />
                <Input
                  type="number"
                  placeholder={isArabic ? 'السعر' : 'Price'}
                  className="bg-white/80 border-orange-300 w-24"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddItemSave}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isArabic ? 'حفظ' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddItemCancel}
                    className="border-orange-300 text-orange-700"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {category.menu_items?.length === 0 && !isAddingItem && (
            <div className="text-center py-6">
              <Button
                variant="ghost"
                onClick={handleAddItemClick}
                className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isArabic ? 'إضافة أول منتج' : 'Add first item'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernCoffeeMenuSection; 