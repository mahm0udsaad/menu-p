"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit, ImageIcon } from "lucide-react"
import { useMenuEditor, type MenuCategory } from "@/contexts/menu-editor-context"
import InlineEditable from "../inline-editable"
import EditableMenuItem from "./editable-menu-item"
import ImageUploadModal from "@/components/ui/image-upload-modal"
import ConfirmationModal from "@/components/ui/confirmation-modal"

interface MenuSectionProps {
  category: MenuCategory
}

export const MenuSection: React.FC<MenuSectionProps> = ({ category }) => {
  const {
    currentPalette,
    appliedRowStyles,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleUpdateCategory,
    handleDeleteCategory,
    handleBgImageUpload,
    moveItem,
    handleDropItem
  } = useMenuEditor()

  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleBgImageUploadWrapper = async (file: File) => {
    setIsUploadingBg(true)
    try {
      await handleBgImageUpload(file, category.id)
    } finally {
      setIsUploadingBg(false)
    }
  }

  const handleDeleteCategoryWrapper = () => {
    setShowDeleteConfirm(false)
    handleDeleteCategory(category.id)
  }

  return (
    <>
      <div className="mb-12 group/category-section" data-category-id={category.id}>
        {/* Category Header with Background Image */}
        <div 
          className="relative h-32 mb-8 rounded-xl overflow-hidden group/category-header"
          style={{ 
            backgroundImage: category.background_image_url 
              ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${category.background_image_url})`
              : `linear-gradient(135deg, ${currentPalette.primary}, ${currentPalette.secondary})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center">
              <InlineEditable
                value={category.name}
                onSave={(value) => handleUpdateCategory(category.id, "name", value)}
                className="text-4xl font-serif text-white mb-2 category-name-editable"
                inputClassName="text-center"
              />
              <div className="w-16 h-px mx-auto" style={{ backgroundColor: currentPalette.accent }}></div>
            </div>
          </div>
          
          {/* Edit Controls */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/category-section:opacity-100 transition-opacity z-20">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/20 shadow-lg"
              title="تحديث صورة الخلفية"
              onClick={() => setShowImageUpload(true)}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/20 shadow-lg"
              title="تعديل القسم"
              onClick={() => {
                const nameElement = document.querySelector(`[data-category-id="${category.id}"] .category-name-editable`);
                if (nameElement) {
                  (nameElement as HTMLElement).click();
                }
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
              variant="ghost"
              className="text-white hover:text-red-300 hover:bg-red-500/20 shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Menu Items - Single Column Layout */}
        <div className="space-y-6">
          {category.menu_items.map((item, index) => (
            <div 
              key={item.id} 
              className="border-b border-gray-200 pb-4 last:border-b-0 p-4 rounded-lg transition-all duration-300"
              style={{
                background: appliedRowStyles.backgroundType === 'solid' 
                  ? appliedRowStyles.backgroundColor
                  : appliedRowStyles.backgroundImage?.includes('|')
                    ? (() => {
                        const [pattern, size] = appliedRowStyles.backgroundImage.split('|')
                        return pattern
                      })()
                    : appliedRowStyles.backgroundImage 
                      ? `url(${appliedRowStyles.backgroundImage}) center/cover`
                      : appliedRowStyles.backgroundColor,
                backgroundSize: appliedRowStyles.backgroundImage?.includes('|')
                  ? appliedRowStyles.backgroundImage.split('|')[1]
                  : appliedRowStyles.backgroundType === 'image' && appliedRowStyles.backgroundImage 
                    ? 'cover'
                    : 'auto'
              }}
            >
              <EditableMenuItem
                item={item}
                index={index}
                categoryId={category.id}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                moveItem={(dragIndex, hoverIndex) => moveItem(category.id, dragIndex, hoverIndex)}
                customRender={(editableItemProps: {
                  item: typeof item;
                  onUpdate: (updatedItem: typeof item) => void;
                  onDelete: (itemId: string) => void;
                }) => (
                  <div className="flex justify-between items-start mb-2">
                    <InlineEditable
                      value={editableItemProps.item.name}
                      onSave={(value) => editableItemProps.onUpdate({ ...editableItemProps.item, name: value })}
                      className="font-serif text-lg flex-1 pr-4"
                      placeholder="اسم الطبق"
                    />
                    <div className="flex items-center">
                      <div className="flex-1 border-b border-dotted border-gray-400 mx-2 min-w-8"></div>
                      <InlineEditable
                        value={editableItemProps.item.price?.toFixed(2) || ""}
                        onSave={(value) =>
                          editableItemProps.onUpdate({ ...editableItemProps.item, price: Number.parseFloat(value) || null })
                        }
                        className="font-serif text-lg"
                        placeholder="0.00"
                        type="number"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1 ml-2 transition-opacity">
                      <Button
                        onClick={() => editableItemProps.onDelete(editableItemProps.item.id)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              />
              <InlineEditable
                value={item.description || ""}
                onSave={(value) => handleUpdateItem({ ...item, description: value || null })}
                className="text-sm text-gray-600 italic leading-relaxed"
                placeholder="إضافة وصف..."
                multiline
              />
            </div>
          ))}
          
          {/* Add Item Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={() => handleAddItem(category.id)}
              variant="outline"
              size="sm"
              className="hover:text-white"
              style={{ 
                borderColor: currentPalette.primary, 
                color: currentPalette.primary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = currentPalette.primary
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = currentPalette.primary
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة عنصر إلى {category.name}
            </Button>
          </div>
        </div>

        {/* Drop handler */}
        <div onDrop={() => handleDropItem(category.id)} />
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUpload={handleBgImageUploadWrapper}
        title="تحديث صورة خلفية القسم"
        description="اختر صورة لتكون خلفية لرأس القسم"
        currentImageUrl={category.background_image_url}
        isUploading={isUploadingBg}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCategoryWrapper}
        title="حذف القسم"
        description={`هل أنت متأكد من حذف قسم "${category.name}" وجميع عناصره؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف القسم"
        type="danger"
      />
    </>
  )
} 