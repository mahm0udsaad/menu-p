"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Upload, FileText, Palette, Image as ImageIcon, Type, RefreshCw, Download, TestTube } from "lucide-react"
import { quickAddItem, quickDeleteItem, reorderMenuItems } from "@/lib/actions/editor/quick-menu-actions"
import { quickUpdateCategory, quickDeleteCategory, quickAddCategory } from "@/lib/actions/editor/quick-category-actions"
import InlineEditable from "../inline-editable"
import EditableMenuItem from "./editable-menu-item"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import NotificationModal from "@/components/ui/notification-modal"
import ConfirmationModal from "@/components/ui/confirmation-modal"
import ImageUploadModal from "@/components/ui/image-upload-modal"
import SimplifiedFontSettings, { type SimplifiedFontSettings as SimplifiedFontSettingsType } from "../simplified-font-settings"
import { useToast } from "@/hooks/use-toast"

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

// Enhanced color palette options with background colors
const colorPalettes = [
  {
    id: "emerald",
    name: "زمردي كلاسيكي",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    background: "#f0fdf4",
    preview: ["#10b981", "#059669", "#34d399", "#a7f3d0"]
  },
  {
    id: "amber",
    name: "عنبري دافئ",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    background: "#fffbeb",
    preview: ["#f59e0b", "#d97706", "#fbbf24", "#fde68a"]
  },
  {
    id: "rose",
    name: "وردي أنيق",
    primary: "#e11d48",
    secondary: "#be185d",
    accent: "#f43f5e",
    background: "#fff1f2",
    preview: ["#e11d48", "#be185d", "#f43f5e", "#fda4af"]
  },
  {
    id: "blue",
    name: "أزرق احترافي",
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa",
    background: "#eff6ff",
    preview: ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd"]
  },
  {
    id: "purple",
    name: "بنفسجي ملكي",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    accent: "#a78bfa",
    background: "#f5f3ff",
    preview: ["#8b5cf6", "#7c3aed", "#a78bfa", "#c4b5fd"]
  },
  {
    id: "teal",
    name: "تيل عصري",
    primary: "#14b8a6",
    secondary: "#0d9488",
    accent: "#2dd4bf",
    background: "#f0fdfa",
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
  fontSettings,
  menuStyles,
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
  colorPalette: { primary: string; secondary: string; accent: string; background?: string }
  fontSettings: SimplifiedFontSettingsType
  menuStyles: any
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const { toast } = useToast()
  
  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    if (type === "success") {
      toast({
        title,
        description,
        variant: "default",
      })
    } else if (type === "error") {
      toast({
        title,
        description,
        variant: "destructive",
      })
    } else {
      toast({
        title,
        description,
        variant: "default",
      })
    }
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

      onUpdateCategory(sectionData.id, 'background_image_url', publicUrl)
      setShowImageUpload(false)
      showNotification("success", "تم تحديث الصورة", "تم تحديث صورة خلفية القسم بنجاح")
    } catch (error) {
      console.error('Error uploading background image:', error)
      showNotification("error", "فشل في تحديث الصورة", error instanceof Error ? error.message : "حدث خطأ أثناء رفع الصورة")
    } finally {
      setIsUploadingBg(false)
    }
  }

  const handleDeleteCategory = () => {
    onDeleteCategory(sectionData.id)
    setShowDeleteConfirm(false)
  }

  // Apply font settings to text
  const getTextStyle = (isArabic: boolean) => {
    const fontData = isArabic ? fontSettings.arabic : fontSettings.english
    const fontOptions = [
      { id: 'cairo', family: 'Cairo, sans-serif' },
      { id: 'noto-kufi-arabic', family: 'Noto Kufi Arabic, sans-serif' },
      { id: 'open-sans', family: 'Open Sans, sans-serif' },
      { id: 'roboto', family: 'Roboto, sans-serif' }
    ]
    
    const selectedFont = fontOptions.find(f => f.id === fontData.font) || fontOptions[0]
    
    return {
      fontFamily: selectedFont.family,
      fontWeight: fontData.weight,
      direction: isArabic ? 'rtl' : 'ltr'
    }
  }

  return (
    <div className="mb-12 relative">
      {/* Category Header */}
      <div 
        className="relative h-32 rounded-xl mb-8 overflow-hidden shadow-lg"
        style={{ 
          backgroundColor: colorPalette.primary,
          backgroundImage: sectionData.background_image_url ? `url(${sectionData.background_image_url})` : 'none'
        }}
      >
        {sectionData.background_image_url && (
          <div className="absolute inset-0 bg-black/50"></div>
        )}
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
          <InlineEditable
            value={sectionData.name}
            onSave={(value) => onUpdateCategory(sectionData.id, 'name', value)}
            className="text-2xl font-bold text-center mb-2 text-white bg-transparent"
            style={getTextStyle(true)}
            placeholder="اسم القسم"
          />
          
          <InlineEditable
            value={sectionData.description || ""}
            onSave={(value) => onUpdateCategory(sectionData.id, 'description', value || null)}
            className="text-sm text-center text-white/90 bg-transparent"
            style={getTextStyle(true)}
            placeholder="وصف القسم..."
          />
        </div>

        {/* Category Controls */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowImageUpload(true)}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-white/80 hover:text-white hover:bg-red-500/50 p-1 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        {sectionData.menu_items.map((item, index) => (
          <div 
            key={item.id} 
            className="flex justify-between items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <EditableMenuItem
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              index={index}
              moveItem={(dragIndex, hoverIndex) => moveItem(sectionData.id, dragIndex, hoverIndex)}
              customRender={(editableItemProps: {
                item: MenuItem;
                onUpdate: (updatedItem: MenuItem) => void;
                onDelete: (itemId: string) => void;
              }) => (
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <InlineEditable
                        value={item.name}
                        onSave={(value) => onUpdateItem({ ...item, name: value })}
                        className="font-semibold text-lg text-gray-800"
                        style={getTextStyle(true)}
                        placeholder="اسم العنصر"
                      />
                      {item.description && (
                        <InlineEditable
                          value={item.description || ""}
                          onSave={(value) => onUpdateItem({ ...item, description: value || null })}
                          className="text-sm text-gray-600 italic leading-relaxed mt-1"
                          style={getTextStyle(true)}
                          placeholder="إضافة وصف..."
                          multiline
                        />
                      )}
                    </div>
                    
                    {item.price && (
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{ 
                          backgroundColor: `${colorPalette.primary}20`,
                          color: colorPalette.primary
                        }}
                      >
                        {item.price} ر.س
                      </div>
                    )}
                  </div>
                </div>
              )}
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
        description={`هل أنت متأكد من حذف قسم "${sectionData.name}" وجميع عناصره؟`}
        confirmText="حذف القسم"
        type="danger"
      />
    </div>
  )
}

export default function ImprovedProfessionalCafeMenuPreview({
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
  const [showDesignModal, setShowDesignModal] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState(restaurant.color_palette?.id || "emerald")
  const [isUpdatingPalette, setIsUpdatingPalette] = useState(false)
  
  // Simplified font settings
  const [fontSettings, setFontSettings] = useState<SimplifiedFontSettingsType>({
    arabic: { font: 'cairo', weight: '400' },
    english: { font: 'open-sans', weight: '400' }
  })
  
  // Enhanced menu styles with better background options
  const [menuStyles, setMenuStyles] = useState({
    backgroundColor: '#ffffff',
    backgroundType: 'solid' as 'solid' | 'gradient',
    gradientFrom: '#ffffff',
    gradientTo: '#f8fafc',
    gradientDirection: 'to-b' as 'to-b' | 'to-br' | 'to-r' | 'to-tr'
  })

  // Local state for current palette to enable real-time updates
  const [currentPalette, setCurrentPalette] = useState(() => {
    const found = colorPalettes.find(p => p.id === (restaurant.color_palette?.id || "emerald"))
    return found || colorPalettes[0]
  })
  
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

  const { toast } = useToast()
  
  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    if (type === "success") {
      toast({
        title,
        description,
        variant: "default",
      })
    } else if (type === "error") {
      toast({
        title,
        description,
        variant: "destructive",
      })
    } else {
      toast({
        title,
        description,
        variant: "default",
      })
    }
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
      const found = colorPalettes.find(p => p.id === restaurant.color_palette!.id)
      if (found) {
        setCurrentPalette(found)
        setSelectedPalette(restaurant.color_palette.id)
      }
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

  const handleUpdateColorPalette = async (paletteId: string) => {
    setIsUpdatingPalette(true)
    try {
      const palette = colorPalettes.find(p => p.id === paletteId)
      if (!palette) throw new Error('Invalid palette')

      // Update local state immediately for real-time preview
      setCurrentPalette(palette)

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
        const originalPalette = colorPalettes.find(p => p.id === restaurant.color_palette?.id) || colorPalettes[0]
        setCurrentPalette(originalPalette)
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
    setIsLoadingDummy(true)
    try {
      // Simulate loading dummy data
      setTimeout(() => {
        setIsLoadingDummy(false)
        showNotification("success", "تم تحميل البيانات", "تم تحميل بيانات تجريبية للقائمة")
      }, 2000)
    } catch (error) {
      setIsLoadingDummy(false)
      showNotification("error", "فشل في تحميل البيانات", "حدث خطأ أثناء تحميل البيانات التجريبية")
    }
  }

  // Apply styles to the main menu container
  const getMenuContainerStyle = () => {
    const baseStyle = {
      transition: 'all 0.3s ease',
    }

    if (menuStyles.backgroundType === 'solid') {
      return {
        ...baseStyle,
        backgroundColor: menuStyles.backgroundColor
      }
    } else {
      return {
        ...baseStyle,
        background: `linear-gradient(${menuStyles.gradientDirection}, ${menuStyles.gradientFrom}, ${menuStyles.gradientTo})`
      }
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {restaurant.logo_url ? (
                  <Image
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                  <p className="text-sm text-gray-600">معاينة القائمة</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Enhanced Color Palette Modal */}
                <Dialog open={showColorModal} onOpenChange={setShowColorModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      اختر لوحة الألوان
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-right">اختر لوحة الألوان</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 mt-4">
                      {/* Color Theme Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {colorPalettes.map((palette) => (
                          <div key={palette.id} className="relative">
                            <input
                              type="radio"
                              name="colorPalette"
                              value={palette.id}
                              id={`modal-${palette.id}`}
                              checked={selectedPalette === palette.id}
                              onChange={() => {
                                setSelectedPalette(palette.id)
                                // Real-time preview update
                                setCurrentPalette(palette)
                              }}
                              className="sr-only"
                            />
                            <Label
                              htmlFor={`modal-${palette.id}`}
                              className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex-1 block ${
                                selectedPalette === palette.id
                                  ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
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
                                
                                {/* Background Color Preview */}
                                <div className="space-y-2">
                                  <span className="text-xs text-gray-600">خلفية القائمة:</span>
                                  <div 
                                    className="h-8 rounded-md border border-gray-200 flex items-center justify-center text-xs"
                                    style={{ backgroundColor: palette.background }}
                                  >
                                    معاينة الخلفية
                                  </div>
                                </div>
                                
                                {/* Sample Menu Item Preview */}
                                <div className="text-xs space-y-1">
                                  <div 
                                    className="font-semibold"
                                    style={{ color: palette.primary }}
                                  >
                                    عنصر القائمة
                                  </div>
                                  <div className="text-gray-600">وصف المنتج هنا</div>
                                  <div 
                                    className="inline-block px-2 py-1 rounded text-white text-xs"
                                    style={{ backgroundColor: palette.primary }}
                                  >
                                    25 ر.س
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      {/* Custom Background Color Selection */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">تخصيص لون الخلفية</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>نوع الخلفية</Label>
                            <select 
                              value={menuStyles.backgroundType}
                              onChange={(e) => setMenuStyles(prev => ({
                                ...prev, 
                                backgroundType: e.target.value as 'solid' | 'gradient'
                              }))}
                              className="w-full p-2 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none"
                            >
                              <option value="solid">لون واحد</option>
                              <option value="gradient">تدرج لوني</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>لون الخلفية</Label>
                            <input
                              type="color"
                              value={menuStyles.backgroundColor}
                              onChange={(e) => setMenuStyles(prev => ({
                                ...prev,
                                backgroundColor: e.target.value
                              }))}
                              className="w-full h-10 rounded-md border border-gray-300 cursor-pointer"
                            />
                          </div>
                        </div>
                        
                        {/* Background Preview */}
                        <div className="mt-3">
                          <Label className="text-sm">معاينة الخلفية:</Label>
                          <div 
                            className="w-full h-16 rounded-lg border border-gray-300 mt-1 flex items-center justify-center text-sm text-gray-600"
                            style={getMenuContainerStyle()}
                          >
                            معاينة خلفية القائمة
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowColorModal(false)
                          // Revert palette if not applied
                          const originalPalette = colorPalettes.find(p => p.id === restaurant.color_palette?.id) || colorPalettes[0]
                          setCurrentPalette(originalPalette)
                          setSelectedPalette(restaurant.color_palette?.id || "emerald")
                        }}
                        disabled={isUpdatingPalette}
                      >
                        إلغاء
                      </Button>
                      <Button
                        onClick={() => handleUpdateColorPalette(selectedPalette)}
                        disabled={isUpdatingPalette}
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

                {/* Font and Background Settings Modal */}
                <Dialog open={showDesignModal} onOpenChange={setShowDesignModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      إعدادات الخط والخلفية
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-right flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        إعدادات الخط والخلفية
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Simplified Font Settings - Preview Section Only */}
                      <SimplifiedFontSettings
                        settings={fontSettings}
                        onSettingsChange={setFontSettings}
                        className="bg-transparent border-0 shadow-none p-0"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setShowDesignModal(false)}
                      >
                        إغلاق
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDesignModal(false)
                          showNotification("success", "تم تطبيق التغييرات", "تم حفظ إعدادات الخط والخلفية بنجاح")
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        تطبيق التغييرات
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  {isLoadingDummy ? "جاري التحميل..." : "إضافة بيانات تجريبية"}
                </Button>
              </div>
            </div>
          </div>

          {/* Menu Content with Applied Styles */}
          <div 
            className="shadow-xl rounded-lg mx-4 mb-4" 
            style={{
              ...getMenuContainerStyle(),
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
            }}
          >
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
                        fontSettings={fontSettings}
                        menuStyles={menuStyles}
                      />
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
        </div>

        {/* Modals */}
        <NotificationModal
          isOpen={notification.show}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          title={notification.title}
          description={notification.description}
          type={notification.type}
        />

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
      </div>
    </DndProvider>
  )
} 