"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit, ImageIcon, Save, X } from "lucide-react"
import { useMenuEditor, type MenuCategory, type MenuItem as ContextMenuItem } from "@/contexts/menu-editor-context"
import ImageUploadModal from "@/components/ui/image-upload-modal"
import ConfirmationModal from "@/components/ui/confirmation-modal"

interface MenuSectionProps {
  category: MenuCategory
}

interface EditingItemState {
  id: string | null
  name: string
  description: string
  price: string
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
  const [editingItem, setEditingItem] = useState<EditingItemState>({
    id: null,
    name: '',
    description: '',
    price: ''
  })

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

  const startEditingItem = (item: ContextMenuItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price?.toFixed(2) || ''
    })
  }

  const cancelEditingItem = () => {
    setEditingItem({
      id: null,
      name: '',
      description: '',
      price: ''
    })
  }

  const saveEditingItem = () => {
    if (editingItem.id) {
      const item = category.menu_items.find(item => item.id === editingItem.id)
      if (item) {
        handleUpdateItem({
          ...item,
          name: editingItem.name,
          description: editingItem.description || null,
          price: editingItem.price ? parseFloat(editingItem.price) : null
        })
      }
      cancelEditingItem()
    }
  }

  const saveCategoryName = () => {
    handleUpdateCategory(category.id, "name", categoryName)
    setIsEditingCategory(false)
  }

  const cancelCategoryEdit = () => {
    setCategoryName(category.name)
    setIsEditingCategory(false)
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
              {editingItem.id === item.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-4">
                      <Input
                        value={editingItem.name}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="اسم الطبق"
                        className="font-serif text-lg"
                        style={{ 
                          color: appliedRowStyles.itemColor,
                        }}
                      />
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1 border-b border-dotted border-gray-400 mx-2 min-w-8"></div>
                      <Input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        className="font-serif text-lg w-24"
                        style={{ 
                          color: appliedRowStyles.priceColor,
                        }}
                      />
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        onClick={saveEditingItem}
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={cancelEditingItem}
                        size="sm"
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="إضافة وصف..."
                    className="text-sm italic leading-relaxed"
                    style={{ 
                      color: appliedRowStyles.descriptionColor,
                    }}
                    rows={2}
                  />
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div 
                      style={{ 
                        color: appliedRowStyles.itemColor,
                        textShadow: appliedRowStyles.textShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                      }}
                      className="flex-1 pr-4"
                    >
                      <h3 className="font-serif text-lg">{item.name}</h3>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1 border-b border-dotted border-gray-400 mx-2 min-w-8"></div>
                      <div 
                        style={{ 
                          color: appliedRowStyles.priceColor,
                          textShadow: appliedRowStyles.textShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                        }}
                      >
                        <span className="font-serif text-lg">{item.price?.toFixed(2) || ""}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        onClick={() => startEditingItem(item)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteItem(item.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              <div 
                style={{ 
                  color: appliedRowStyles.descriptionColor,
                  textShadow: appliedRowStyles.textShadow ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                    <p className="text-sm italic leading-relaxed">{item.description || "إضافة وصف..."}</p>
                  </div>
              </div>
              )}
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