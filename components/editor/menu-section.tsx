"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit, ImageIcon, Save, X } from "lucide-react"
import { useMenuEditor, type MenuCategory, type MenuItem as ContextMenuItem } from "@/contexts/menu-editor-context"
import ImageUploadModal from "@/components/ui/image-upload-modal"
import ConfirmationModal from "@/components/ui/confirmation-modal"
import EditableMenuItem from './editable-menu-item'

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
    handleSaveNewItem,
    handleUpdateCategory,
    handleDeleteCategory,
    handleBgImageUpload,
    moveItem,
    handleDropItem,
    isPreviewMode
  } = useMenuEditor()

  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [categoryName, setCategoryName] = useState(category.name)

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

  const saveCategoryName = () => {
    handleUpdateCategory(category.id, "name", categoryName)
    setIsEditingCategory(false)
  }

  const cancelCategoryEdit = () => {
    setCategoryName(category.name)
    setIsEditingCategory(false)
  }

  const moveItemInCategory = (dragIndex: number, hoverIndex: number) => {
    moveItem(category.id, dragIndex, hoverIndex);
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
              {isEditingCategory ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="text-center text-4xl font-serif text-white bg-white/20 border-white/30 placeholder-white/70"
                    style={{ fontSize: '2.25rem' }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-green-300 hover:bg-green-500/20"
                    onClick={saveCategoryName}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-red-300 hover:bg-red-500/20"
                    onClick={cancelCategoryEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h3 className="text-4xl font-serif text-white mb-2">{category.name}</h3>
              )}
              <div className="w-16 h-px mx-auto" style={{ backgroundColor: currentPalette.accent }}></div>
            </div>
          </div>
          
          {/* Edit Controls - Always visible now */}
          {!isPreviewMode && (
            <div className="absolute top-2 right-2 flex gap-2 z-20">
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
                title="تعديل اسم القسم"
                onClick={() => setIsEditingCategory(true)}
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
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-4 sm:space-y-6">
          {category.menu_items.map((item, index) => (
            <EditableMenuItem
              key={item.id}
              item={item}
              index={index}
              categoryId={category.id}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              onSaveNewItem={handleSaveNewItem}
              moveItem={moveItemInCategory}
            />
          ))}
          
          {/* Add Item Button */}
          {!isPreviewMode && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => handleAddItem(category.id)}
                variant="outline"
                size="sm"
                className="hover:text-white transition-colors"
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
          )}
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