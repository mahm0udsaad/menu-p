import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useMenuEditor } from '@/contexts/menu-editor-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, GripVertical, Star, StarOff, Edit3 } from 'lucide-react';
import InlineEditable from '../../../inline-editable';

interface ModernEditableMenuItemProps {
  item: any;
  index: number;
  categoryId: string;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  fontSettings: any;
  rowStyleSettings: any;
  appliedRowStyles: any;
  currentLanguage: string;
}

const ItemTypes = {
  MENU_ITEM: 'menu_item',
};

const ModernEditableMenuItem: React.FC<ModernEditableMenuItemProps> = ({
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
    showConfirmation,
    restaurant,
    isPreviewMode,
  } = useMenuEditor();

  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const isArabic = currentLanguage === 'ar';
  const activeFontSettings = isArabic ? fontSettings.arabic : fontSettings.english;
  const fontName = activeFontSettings.font.replace(/\s/g, '_');
  const currencySymbol = restaurant?.currency || '$';

  const updateItemField = (field: string, value: any) => {
    const updatedItem = { ...item, [field]: value };
    handleUpdateItem(updatedItem);
  };

  const deleteItemConfirm = () => {
    showConfirmation(
      `Delete '${item.name}'?`,
      "Are you sure you want to delete this item? This action cannot be undone.",
      () => handleDeleteItem(item.id),
      'danger'
    );
  };

  const formatPrice = (price: number) => {
    if (isArabic) {
      return `${price} ${currencySymbol === 'USD' ? 'دولار' : currencySymbol === 'EUR' ? 'يورو' : 'ج.م'}`;
    }
    return `${currencySymbol}${price}`;
  };

  // Drag and drop
  const [{ handlerId }, drop] = useDrop<{ id: string; index: number }, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.MENU_ITEM,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover(draggedItem: { id: string; index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MENU_ITEM,
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isPreviewMode,
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="group flex justify-between items-start hover:bg-gray-50/50 p-2 rounded-lg transition-all duration-200"
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      {/* Action buttons at the start - hidden in preview mode */}
      {!isPreviewMode && (
        <div className="flex items-center gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 cursor-move"
          >
            <GripVertical className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${isEditing ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
            onClick={deleteItemConfirm}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Item content - matches the current clean design */}
      <div className="flex-1 flex justify-between items-start">
        <div className="flex-1">
          {/* Item name */}
          <div className="mb-1" style={{
            fontFamily: fontName,
            fontWeight: activeFontSettings.weight,
          }}>
            {isEditing ? (
              <InlineEditable
                value={item.name}
                onSave={(value: string) => {
                  updateItemField('name', value);
                }}
                className="text-lg font-medium text-gray-800"
              />
            ) : (
              <h3 
                className="text-lg font-medium text-gray-800"
                style={{
                  fontFamily: fontName,
                  fontWeight: activeFontSettings.weight,
                }}
              >
                {item.name}
              </h3>
            )}
          </div>

          {/* Item description */}
          {(item.description || isEditing) && (
            <div className="mb-1" style={{
              fontFamily: fontName,
              fontWeight: 'normal',
            }}>
              {isEditing ? (
                <InlineEditable
                  value={item.description || ''}
                  onSave={(value: string) => {
                    updateItemField('description', value);
                  }}
                  placeholder="Add description..."
                  className="text-sm text-gray-600 leading-relaxed"
                />
              ) : (
                <p 
                  className="text-sm text-gray-600 leading-relaxed"
                  style={{
                    fontFamily: fontName,
                    fontWeight: 'normal',
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>
          )}

          {/* Dietary info badges - only show if editing or if they exist */}
         

          {/* Featured/Available status - only show if editing */}
          {isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                onClick={() => updateItemField('is_featured', !item.is_featured)}
                variant="ghost"
                size="sm"
                className={`text-xs ${
                  item.is_featured
                    ? 'text-amber-600 hover:text-amber-700'
                    : 'text-gray-500 hover:text-amber-600'
                }`}
              >
                {item.is_featured ? (
                  <><Star className="w-3 h-3 fill-current mr-1" /> Featured</>
                ) : (
                  <><StarOff className="w-3 h-3 mr-1" /> Feature</>
                )}
              </Button>

              <Button
                onClick={() => updateItemField('is_available', !item.is_available)}
                variant="ghost"
                size="sm"
                className={`text-xs ${
                  item.is_available
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-red-600 hover:text-red-700'
                }`}
              >
                {item.is_available ? (
                  <span>{isArabic ? 'متاح' : 'Available'}</span>
                ) : (
                  <span>{isArabic ? 'غير متاح' : 'Unavailable'}</span>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Price - matches the current clean design */}
        <div className="ml-4 text-right" style={{
          fontFamily: fontName,
          fontWeight: activeFontSettings.weight,
        }}>
          {isEditing ? (
            <InlineEditable
              value={item.price?.toString() || '0'}
              onSave={(value: string) => {
                updateItemField('price', parseFloat(value) || 0);
              }}
              type="number"
              className="text-lg font-semibold text-gray-800 text-right"
            />
          ) : (
            <span 
              className="text-lg font-semibold text-gray-800"
              style={{
                fontFamily: fontName,
                fontWeight: activeFontSettings.weight,
              }}
            >
              {item.price ? `${item.price}` : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernEditableMenuItem; 