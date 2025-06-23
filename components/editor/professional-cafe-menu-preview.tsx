"use client"

import { useState, useCallback, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Upload, FileText, Palette, Image as ImageIcon } from "lucide-react"
import { quickAddItem, quickDeleteItem, reorderMenuItems } from "@/lib/actions/editor/quick-menu-actions"
import { quickUpdateCategory, quickDeleteCategory, quickAddCategory } from "@/lib/actions/editor/quick-category-actions"
import InlineEditable from "../inline-editable"
import EditableMenuItem from "./editable-menu-item"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import NotificationModal from "@/components/ui/notification-modal"
import ConfirmationModal from "@/components/ui/confirmation-modal"
import ImageUploadModal from "@/components/ui/image-upload-modal"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
  display_order?: number
  category_id?: string
  created_at?: string
  updated_at?: string
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
  background_image_url?: string | null
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  color_palette?: {
    id: string
    name: string
    primary: string
    secondary: string
    accent: string
  } | null
}

interface ProfessionalCafeMenuPreviewProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  onRefresh: () => void
}

// Color palette options - same as onboarding
const colorPalettes = [
  {
    id: "emerald",
    name: "زمردي كلاسيكي",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    preview: ["#10b981", "#059669", "#34d399", "#a7f3d0"]
  },
  {
    id: "amber",
    name: "عنبري دافئ",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    preview: ["#f59e0b", "#d97706", "#fbbf24", "#fde68a"]
  },
  {
    id: "rose",
    name: "وردي أنيق",
    primary: "#e11d48",
    secondary: "#be185d",
    accent: "#f43f5e",
    preview: ["#e11d48", "#be185d", "#f43f5e", "#fda4af"]
  },
  {
    id: "blue",
    name: "أزرق احترافي",
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa",
    preview: ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd"]
  },
  {
    id: "purple",
    name: "بنفسجي ملكي",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    accent: "#a78bfa",
    preview: ["#8b5cf6", "#7c3aed", "#a78bfa", "#c4b5fd"]
  },
  {
    id: "teal",
    name: "تيل عصري",
    primary: "#14b8a6",
    secondary: "#0d9488",
    accent: "#2dd4bf",
    preview: ["#14b8a6", "#0d9488", "#2dd4bf", "#7dd3fc"]
  }
]

const MenuSectionPreview = ({
  title,
  sectionData,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  moveItem,
  onUpdateCategory,
  onDeleteCategory,
  onRefresh,
  colorPalette,
}: {
  title: string
  sectionData: MenuCategory
  onAddItem: (categoryId: string) => void
  onUpdateItem: (updatedItem: MenuItem) => void
  onDeleteItem: (itemId: string) => void
  moveItem: (categoryId: string, dragIndex: number, hoverIndex: number) => void
  onUpdateCategory: (categoryId: string, field: string, value: string | null) => void
  onDeleteCategory: (categoryId: string) => void
  onRefresh: () => void
  colorPalette: { primary: string; secondary: string; accent: string }
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    description: string
  }>({
    show: false,
    type: "info",
    title: "",
    description: ""
  })

  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    setNotification({ show: true, type, title, description })
  }

  const handleBgImageUpload = async (file: File) => {
    setIsUploadingBg(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `templates/category-backgrounds/${sectionData.id}-bg-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName)

      // Update category background image
      await onUpdateCategory(sectionData.id, 'background_image_url', publicUrl)
      showNotification("success", "تم رفع الصورة بنجاح", "تم تحديث صورة خلفية القسم")
    } catch (error) {
      console.error('Background upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      showNotification("error", "فشل في رفع الصورة", errorMessage)
    } finally {
      setIsUploadingBg(false)
    }
  }

  const handleDeleteCategory = () => {
    setShowDeleteConfirm(false)
    onDeleteCategory(sectionData.id)
  }

  return (
    <>
      <div className="mb-12 group/category-section" data-category-id={sectionData.id}>
        {/* Category Header with Background Image */}
        <div 
          className="relative h-32 mb-8 rounded-xl overflow-hidden group/category-header"
          style={{ 
            backgroundImage: sectionData.background_image_url 
              ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${sectionData.background_image_url})`
              : `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.secondary})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center">
          <InlineEditable
            value={title}
            onSave={(value) => onUpdateCategory(sectionData.id, "name", value)}
              className="text-4xl font-serif text-white mb-2 category-name-editable"
            inputClassName="text-center"
          />
          <div className="w-16 h-px mx-auto" style={{ backgroundColor: colorPalette.accent }}></div>
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
              const nameElement = document.querySelector(`[data-category-id="${sectionData.id}"] .category-name-editable`);
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
      {sectionData.menu_items.map((item, index) => (
        <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
          <EditableMenuItem
            item={item}
            index={index}
            categoryId={sectionData.id}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            moveItem={(dragIndex, hoverIndex) => moveItem(sectionData.id, dragIndex, hoverIndex)}
            customRender={(editableItemProps: {
              item: MenuItem;
              onUpdate: (updatedItem: MenuItem) => void;
              onDelete: (itemId: string) => void;
            }) => (
              <div className="flex justify-between items-start mb-2">
                <InlineEditable
                  value={editableItemProps.item.name}
                  onSave={(value) => editableItemProps.onUpdate({ ...editableItemProps.item, name: value })}
                  className="font-serif text-lg text-gray-800 flex-1 pr-4"
                                      placeholder="اسم الطبق"
                />
                <div className="flex items-center">
                  <div className="flex-1 border-b border-dotted border-gray-400 mx-2 min-w-8"></div>
                  <InlineEditable
                    value={editableItemProps.item.price?.toFixed(2) || ""}
                    onSave={(value) =>
                      editableItemProps.onUpdate({ ...editableItemProps.item, price: Number.parseFloat(value) || null })
                    }
                    className="font-serif text-lg price-color"
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
            onSave={(value) => onUpdateItem({ ...item, description: value || null })}
            className="text-sm text-gray-600 italic leading-relaxed"
            placeholder="إضافة وصف..."
            multiline
          />
        </div>
      ))}
          
          {/* Add Item Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={() => onAddItem(sectionData.id)}
          variant="outline"
          size="sm"
          className="hover:text-white"
          style={{ 
            borderColor: colorPalette.primary, 
            color: colorPalette.primary,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colorPalette.primary
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = colorPalette.primary
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة عنصر إلى {sectionData.name}
        </Button>
      </div>
    </div>
  </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUpload={handleBgImageUpload}
        title="تحديث صورة خلفية القسم"
        description="اختر صورة لتكون خلفية لرأس القسم"
        currentImageUrl={sectionData.background_image_url}
        isUploading={isUploadingBg}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCategory}
        title="حذف القسم"
        description={`هل أنت متأكد من حذف قسم "${sectionData.name}" وجميع عناصره؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف القسم"
        type="danger"
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        title={notification.title}
        description={notification.description}
        type={notification.type}
      />
    </>
)
}

export default function ProfessionalCafeMenuPreview({
  restaurant,
  categories: initialCategories,
  onRefresh,
}: ProfessionalCafeMenuPreviewProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPagination, setShowPagination] = useState(false)
  const [isLoadingDummy, setIsLoadingDummy] = useState(false)
  const [showColorModal, setShowColorModal] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState(restaurant.color_palette?.id || "emerald")
  const [isUpdatingPalette, setIsUpdatingPalette] = useState(false)

  // Local state for current palette to enable real-time updates
  const [currentPalette, setCurrentPalette] = useState(() => 
    restaurant.color_palette || colorPalettes.find(p => p.id === "emerald")!
  )
  
  // Modal states
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    description: string
  }>({
    show: false,
    type: "info",
    title: "",
    description: ""
  })
  
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean
    title: string
    description: string
    action: () => void
    type?: "danger" | "warning" | "success" | "info"
  }>({
    show: false,
    title: "",
    description: "",
    action: () => {},
    type: "warning"
  })

  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    setNotification({ show: true, type, title, description })
  }

  const showConfirmation = (title: string, description: string, action: () => void, type: "danger" | "warning" | "success" | "info" = "warning") => {
    setConfirmAction({ show: true, title, description, action, type })
  }

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  // Update local palette when restaurant data changes
  useEffect(() => {
    if (restaurant.color_palette) {
      setCurrentPalette(restaurant.color_palette)
      setSelectedPalette(restaurant.color_palette.id)
    }
  }, [restaurant.color_palette])

  const handleAddItem = async (categoryId: string) => {
    const result = await quickAddItem(categoryId, restaurant.id)
    if (result.success && result.item) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, menu_items: [...cat.menu_items, result.item as MenuItem] } : cat,
        ),
      )
      showNotification("success", "تم إضافة العنصر", "تم إضافة عنصر جديد للقائمة بنجاح")
    } else {
      showNotification("error", "فشل في إضافة العنصر", result.error || "حدث خطأ غير متوقع")
    }
  }

  const handleUpdateItem = (updatedItem: MenuItem) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        menu_items: cat.menu_items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      })),
    )
  }

  const handleDeleteItem = async (itemId: string) => {
    showConfirmation(
      "حذف العنصر",
      "هل أنت متأكد من حذف هذا العنصر من القائمة؟",
      async () => {
    const result = await quickDeleteItem(itemId)
    if (result.success) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          menu_items: cat.menu_items.filter((item) => item.id !== itemId),
        })),
      )
          showNotification("success", "تم حذف العنصر", "تم حذف العنصر من القائمة بنجاح")
    } else {
          showNotification("error", "فشل في حذف العنصر", result.error || "حدث خطأ غير متوقع")
    }
      },
      "danger"
    )
  }

  const handleUpdateCategory = async (categoryId: string, field: string, value: string | null) => {
    const result = await quickUpdateCategory(categoryId, field, value)
    if (result.success) {
      setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, [field]: value } : cat)))
    } else {
      showNotification("error", "فشل في تحديث القسم", result.error || "حدث خطأ غير متوقع")
      onRefresh() // Revert on error
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const result = await quickDeleteCategory(categoryId)
    if (result.success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      showNotification("success", "تم حذف القسم", "تم حذف القسم وجميع عناصره بنجاح")
    } else {
      showNotification("error", "فشل في حذف القسم", result.error || "حدث خطأ غير متوقع")
    }
  }

  const handleAddCategory = async () => {
    const result = await quickAddCategory(restaurant.id, "قسم جديد")
    if (result.success && result.category) {
      setCategories((prev) => [...prev, { ...result.category, menu_items: [] }])
      showNotification("success", "تم إضافة القسم", "تم إضافة قسم جديد للقائمة بنجاح")
    } else {
      showNotification("error", "فشل في إضافة القسم", result.error || "حدث خطأ غير متوقع")
    }
  }

  const moveItem = useCallback(
    (categoryId: string, dragIndex: number, hoverIndex: number) => {
      setCategories((prevCategories) => {
        const newCategories = [...prevCategories]
        const categoryIndex = newCategories.findIndex((cat) => cat.id === categoryId)
        if (categoryIndex === -1) return prevCategories

        const category = newCategories[categoryIndex]
        const newItems = [...category.menu_items]
        const [draggedItem] = newItems.splice(dragIndex, 1)
        newItems.splice(hoverIndex, 0, draggedItem)

        newCategories[categoryIndex] = { ...category, menu_items: newItems }
        return newCategories
      })
    },
    [setCategories],
  )

  const handleDropItem = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const itemIds = category.menu_items.map((item) => item.id)
    await reorderMenuItems(categoryId, itemIds)
    onRefresh() // Refresh from DB to ensure order is persisted
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${restaurant.id}-logo-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName)

      // Update restaurant logo
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ logo_url: publicUrl })
        .eq('id', restaurant.id)

      if (updateError) throw updateError

      onRefresh() // Refresh to get updated restaurant data
      showNotification("success", "تم تحديث الشعار", "تم رفع شعار المطعم بنجاح")
    } catch (error) {
      console.error('Logo upload error:', error)
      showNotification("error", "فشل في رفع الشعار", "حدث خطأ أثناء رفع الشعار. حاول مرة أخرى.")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleUpdateColorPalette = async (paletteId: string) => {
    setIsUpdatingPalette(true)
    try {
      const palette = colorPalettes.find(p => p.id === paletteId)
      if (!palette) throw new Error('Invalid palette')

      // Update local state immediately for real-time preview
      setCurrentPalette({
        id: palette.id,
        name: palette.name,
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent
      })

      const { error } = await supabase
        .from('restaurants')
        .update({ 
          color_palette: {
            id: palette.id,
            name: palette.name,
            primary: palette.primary,
            secondary: palette.secondary,
            accent: palette.accent
          }
        })
        .eq('id', restaurant.id)

      if (error) {
        // Revert local state on error
        setCurrentPalette(restaurant.color_palette || colorPalettes.find(p => p.id === "emerald")!)
        throw error
      }

      setSelectedPalette(paletteId)
      setShowColorModal(false)
      showNotification("success", "تم تحديث الألوان", "تم تحديث لوحة الألوان بنجاح")
    } catch (error) {
      console.error('Error updating color palette:', error)
      showNotification("error", "فشل في تحديث الألوان", "حدث خطأ أثناء تحديث لوحة الألوان")
    } finally {
      setIsUpdatingPalette(false)
    }
  }

  const handleLoadDummyData = async () => {
    showConfirmation(
      "تحميل بيانات تجريبية",
      "هل تريد تحميل بيانات تجريبية؟ سيتم إضافة أقسام وعناصر جديدة للقائمة.",
      async () => {
    setIsLoadingDummy(true)
    try {
      // Get current user for RLS compliance
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      // Import dummy data
      const dummyMenu = await import('../../data/dummy-menu.js')
      const dummyData = dummyMenu.default || dummyMenu
      
      // Create categories with items in database
      for (const category of dummyData.categories) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('menu_categories')
          .insert({
            restaurant_id: restaurant.id,
            name: category.name,
            description: category.description,
            is_active: true,
            sort_order: categories.length + dummyData.categories.indexOf(category)
          })
          .select()
          .single()

        if (categoryError) {
          console.error('Error creating category:', categoryError)
          continue
        }

        // Add items to the category
        for (const item of category.menu_items) {
          const { error: itemError } = await supabase
            .from('menu_items')
            .insert({
                  restaurant_id: restaurant.id,
              category_id: newCategory.id,
              name: item.name,
              description: item.description,
              price: item.price,
                  is_available: item.is_available !== false,
              is_featured: item.is_featured || false,
              dietary_info: item.dietary_info || [],
              display_order: category.menu_items.indexOf(item),
                  image_url: null
            })

          if (itemError) {
            console.error('Error creating item:', itemError)
          }
        }
      }

      // Refresh the menu
      onRefresh()
          showNotification("success", "تم تحميل البيانات", "تم تحميل البيانات التجريبية بنجاح")
    } catch (error: any) {
      console.error('Error loading dummy data:', error)
          showNotification("error", "فشل في تحميل البيانات", `فشل في تحميل البيانات التجريبية: ${error.message}`)
    } finally {
      setIsLoadingDummy(false)
    }
      },
      "info"
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Dynamic CSS for color palette */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .price-color {
              color: ${currentPalette.secondary} !important;
            }
          `
        }} />
        
        <div className="max-w-4xl mx-auto p-4 sm:p-8"> {/* Changed from max-w-6xl to max-w-4xl for single column */}
          {/* Header */}
          <div className="text-center mb-6 sm:mb-12 border-b-2 pb-4 sm:pb-8 flex flex-col items-center justify-center" style={{ borderColor: currentPalette.primary }}>
            <div className="mb-2 sm:mb-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-4 rounded-full flex items-center justify-center shadow-lg overflow-hidden relative group" style={{ backgroundColor: currentPalette.primary }}>
                {restaurant.logo_url ? (
                  <Image
                    src={restaurant.logo_url || "/placeholder.svg"}
                    alt={`${restaurant.name} logo`}
                    width={64}
                    height={64}
                    className="object-cover sm:w-[96px] sm:h-[96px]"
                  />
                ) : (
                  <span className="text-white text-lg sm:text-2xl font-serif">
                    {restaurant.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploadingLogo}
                    />
                  </label>
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif mb-2 sm:mb-4" style={{ color: currentPalette.primary }}>
              {restaurant.name}
            </h1>
            
            <div className="w-16 sm:w-24 h-px mx-auto mb-3 sm:mb-6" style={{ backgroundColor: currentPalette.accent }}></div>
              
            <div className="flex items-center gap-2">
              <Dialog open={showColorModal} onOpenChange={setShowColorModal}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    <Palette className="h-3 w-3 ml-1" />
                    <span className="hidden sm:inline">تغيير الألوان</span>
                    <span className="sm:hidden">ألوان</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-right">اختر لوحة الألوان</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {colorPalettes.map((palette) => (
                      <div key={palette.id} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="radio"
                          name="colorPalette"
                          value={palette.id}
                          id={`modal-${palette.id}`}
                          checked={selectedPalette === palette.id}
                          onChange={() => setSelectedPalette(palette.id)}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`modal-${palette.id}`}
                          className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex-1 ${
                            selectedPalette === palette.id
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">{palette.name}</span>
                            <div className="flex space-x-1 space-x-reverse">
                              {palette.preview.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowColorModal(false)}
                      disabled={isUpdatingPalette}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={() => handleUpdateColorPalette(selectedPalette)}
                      disabled={isUpdatingPalette || selectedPalette === restaurant.color_palette?.id}
                      style={{ backgroundColor: colorPalettes.find(p => p.id === selectedPalette)?.primary }}
                      className="text-white"
                    >
                      {isUpdatingPalette ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {isUpdatingPalette ? "جاري التحديث..." : "تطبيق الألوان"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={handleLoadDummyData}
                disabled={isLoadingDummy}
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {isLoadingDummy ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                {isLoadingDummy ? "جاري التحميل..." : "إضافة بيانات تجريبية"}
              </Button>
            </div>
          </div>

          {/* Menu Content */}
          <div className="bg-white shadow-xl rounded-lg" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <div className="p-12">
              {categories.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <div className="text-8xl mb-6">🍽️</div>
                  <h3 className="text-2xl font-semibold mb-4 text-slate-600">قائمتك في انتظارك</h3>
                  <p className="text-lg mb-6">ابدأ في بناء قائمة طعامك اللذيذة</p>
                  <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={handleAddCategory}
                    className="text-white px-6 py-3"
                    style={{ backgroundColor: currentPalette.primary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = currentPalette.secondary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = currentPalette.primary
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                      إضافة أول قسم
                  </Button>
                    <div className="text-sm text-slate-500">أو</div>
                    <Button
                      onClick={handleLoadDummyData}
                      disabled={isLoadingDummy}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3"
                    >
                      {isLoadingDummy ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      ) : (
                        <FileText className="h-5 w-5 mr-2" />
                      )}
                      {isLoadingDummy ? "جاري التحميل..." : "تحميل بيانات تجريبية"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {categories.map((category, index) => (
                      <div key={category.id}>
                        <div onDrop={() => handleDropItem(category.id)}>
                      <MenuSectionPreview
                        title={category.name}
                        sectionData={category}
                        onAddItem={handleAddItem}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                        moveItem={moveItem}
                        onUpdateCategory={handleUpdateCategory}
                        onDeleteCategory={handleDeleteCategory}
                          onRefresh={onRefresh}
                        colorPalette={currentPalette}
                      />
                    </div>
                      </div>
                  ))}
                  
                  {/* Add Category Button */}
                  <div className="text-center py-8 border-t-2 border-gray-200">
                    <Button
                      onClick={handleAddCategory}
                      variant="outline"
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
                      إضافة قسم جديد
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Information - Made Editable */}
          <div className="mt-8 text-center space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
                <div>
                  <InlineEditable
                    value="ساعات العمل"
                    onSave={(value) => console.log("Hours title update:", value)}
                    className="font-serif text-gray-800 mb-2 block text-center"
                    placeholder="عنوان الساعات"
                  />
                  <InlineEditable
                    value="الاثنين - الخميس: 7:00 ص - 9:00 م"
                    onSave={(value) => console.log("Hours 1 update:", value)}
                    className="block text-center"
                    placeholder="ساعات العمل"
                  />
                  <InlineEditable
                    value="الجمعة - السبت: 7:00 ص - 10:00 م"
                    onSave={(value) => console.log("Hours 2 update:", value)}
                    className="block text-center"
                    placeholder="ساعات نهاية الأسبوع"
                  />
                  <InlineEditable
                    value="الأحد: 8:00 ص - 8:00 م"
                    onSave={(value) => console.log("Hours 3 update:", value)}
                    className="block text-center"
                    placeholder="ساعات الأحد"
                  />
                </div>
                <div>
                  <InlineEditable
                    value="العنوان"
                    onSave={(value) => console.log("Address title update:", value)}
                    className="font-serif text-gray-800 mb-2 block text-center"
                    placeholder="عنوان القسم"
                  />
                  <InlineEditable
                    value="123 شارع الطعام"
                    onSave={(value) => console.log("Address update:", value)}
                    className="block text-center"
                    placeholder="العنوان"
                  />
                  <InlineEditable
                    value="المدينة، المنطقة 12345"
                    onSave={(value) => console.log("City update:", value)}
                    className="block text-center"
                    placeholder="المدينة والرمز البريدي"
                  />
                </div>
                <div>
                  <InlineEditable
                    value="التواصل"
                    onSave={(value) => console.log("Contact title update:", value)}
                    className="font-serif text-gray-800 mb-2 block text-center"
                    placeholder="عنوان التواصل"
                  />
                  <InlineEditable
                    value="(555) 123-4567"
                    onSave={(value) => console.log("Phone update:", value)}
                    className="block text-center"
                    placeholder="رقم الهاتف"
                  />
                  <InlineEditable
                    value="info@restaurant.com"
                    onSave={(value) => console.log("Email update:", value)}
                    className="block text-center"
                    placeholder="البريد الإلكتروني"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <ConfirmationModal
        isOpen={confirmAction.show}
        onClose={() => setConfirmAction(prev => ({ ...prev, show: false }))}
        onConfirm={() => {
          confirmAction.action()
          setConfirmAction(prev => ({ ...prev, show: false }))
        }}
        title={confirmAction.title}
        description={confirmAction.description}
        type={confirmAction.type}
      />

      <NotificationModal
        isOpen={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        title={notification.title}
        description={notification.description}
        type={notification.type}
      />
    </DndProvider>
  )
}
