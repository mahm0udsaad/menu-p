import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useMenuEditor } from '@/contexts/menu-editor-context';
import ModernEditableMenuItem from './ModernEditableMenuItem';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import InlineEditable from '../../../inline-editable';

interface ModernMenuSectionProps {
  category: any;
  isLeft: boolean;
  fontSettings: any;
  rowStyleSettings: any;
  appliedRowStyles: any;
  currentLanguage: string;
}

const ModernMenuSection: React.FC<ModernMenuSectionProps> = ({
  category,
  isLeft,
  fontSettings,
  rowStyleSettings,
  appliedRowStyles,
  currentLanguage,
}) => {
  const {
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddItem,
    showConfirmation,
    reorderCategories,
    addMenuItem,
    requestDeleteCategory,
    updateCategory,
    isPreviewMode,
  } = useMenuEditor();

  const isArabic = currentLanguage === 'ar';
  const activeFontSettings = isArabic ? fontSettings.arabic : fontSettings.english;
  const fontName = activeFontSettings.font.replace(/\s/g, '_');

  // Drag and drop for category reordering
  const [{ isDragging }, drag] = useDrag({
    type: 'category',
    item: { id: category.id, type: 'category' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isPreviewMode,
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'category',
    drop: (item: { id: string; type: string }) => {
      if (item.id !== category.id) {
        reorderCategories(item.id, category.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleAddItemClick = () => {
    addMenuItem(category.id, {
      name: isArabic ? 'صنف جديد' : 'New Item',
      description: isArabic ? 'وصف الصنف' : 'Item description',
      price: 0,
      is_available: true,
      is_featured: false,
      dietary_info: [],
    });
  };

  const handleDeleteCategoryClick = () => {
    requestDeleteCategory(category.id);
  };

  const handleUpdateCategoryField = (field: string, value: any) => {
    updateCategory(category.id, { [field]: value });
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`modern-category-section ${isLeft ? 'category-left' : 'category-right'} ${
        isDragging ? 'opacity-50' : ''
      } ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 relative overflow-hidden">
        {/* Category top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
        
        {/* Drag handle - hidden in preview mode */}
        {!isPreviewMode && (
          <div className="absolute top-4 left-4 cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        {/* Category header */}
        <div className="mb-8 border-b-2 border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <InlineEditable
                value={category.name}
                onSave={(value) => handleUpdateCategoryField('name', value)}
                className="text-3xl font-bold text-gray-800 mb-2"
                style={{
                  fontFamily: fontName,
                  fontWeight: activeFontSettings.weight,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              />
              
              {category.description && (
                <InlineEditable
                  value={category.description}
                  onSave={(value) => handleUpdateCategoryField('description', value)}
                  className="text-gray-600 italic opacity-80"
                  style={{
                    fontFamily: fontName,
                  }}
                />
              )}
            </div>
            
            {!isPreviewMode && (
              <Button
                onClick={handleDeleteCategoryClick}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-5">
          {category.menu_items.map((item: any, index: number) => (
            <ModernEditableMenuItem
              key={item.id}
              item={item}
              index={index}
              categoryId={category.id}
              moveItem={(dragIndex: number, hoverIndex: number) => {
                // Handle item reordering logic here
                console.log('Moving item', dragIndex, 'to', hoverIndex);
              }}
              fontSettings={fontSettings}
              rowStyleSettings={rowStyleSettings}
              appliedRowStyles={appliedRowStyles}
              currentLanguage={currentLanguage}
            />
          ))}
        </div>

        {/* Add item button - hidden in preview mode */}
        {!isPreviewMode && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Button
              onClick={handleAddItemClick}
              variant="outline"
              size="sm"
              className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isArabic ? 'إضافة صنف جديد' : 'Add New Item'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernMenuSection;