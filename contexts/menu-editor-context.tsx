"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { quickAddItem, quickDeleteItem, reorderMenuItems } from "@/lib/actions/editor/quick-menu-actions"
import { quickUpdateCategory, quickDeleteCategory, quickAddCategory } from "@/lib/actions/editor/quick-category-actions"
import { 
  getMenuCustomizations, 
  savePageBackgroundSettings, 
  saveFontSettings, 
  saveRowStyles,
  saveAllCustomizations 
} from "@/lib/actions/menu-customizations"

// Types
export interface MenuItem {
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

export interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
  background_image_url?: string | null
}

export interface Restaurant {
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

export interface SimplifiedFontSettings {
  arabic: { font: string; weight: string }
  english: { font: string; weight: string }
}

export interface RowStyleSettings {
  backgroundColor: string
  backgroundImage: string | null
  backgroundType: 'solid' | 'image'
  itemColor: string
  descriptionColor: string
  priceColor: string
  textShadow: boolean
}

export interface PageBackgroundSettings {
  backgroundColor: string
  backgroundImage: string | null
  backgroundType: 'solid' | 'image' | 'gradient'
  gradientFrom: string
  gradientTo: string
  gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
}

export interface MenuStyles {
  backgroundColor: string
  backgroundType: 'solid' | 'gradient'
  gradientFrom: string
  gradientTo: string
  gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
}

// Color palettes
export const colorPalettes = [
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

// Context interface
interface MenuEditorContextType {
  // State
  restaurant: Restaurant
  categories: MenuCategory[]
  currentPalette: any
  fontSettings: SimplifiedFontSettings
  appliedFontSettings: SimplifiedFontSettings
  menuStyles: MenuStyles
  appliedMenuStyles: MenuStyles
  rowStyleSettings: RowStyleSettings
  appliedRowStyles: RowStyleSettings
  pageBackgroundSettings: PageBackgroundSettings
  appliedPageBackgroundSettings: PageBackgroundSettings
  selectedPalette: string
  isUpdatingPalette: boolean
  isUploadingLogo: boolean
  isLoadingDummy: boolean
  
  // Modal states
  showColorModal: boolean
  showDesignModal: boolean
  showRowStylingModal: boolean
  showPageBackgroundModal: boolean
  notification: {
    show: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    description: string
  }
  confirmAction: {
    show: boolean
    title: string
    description: string
    action: () => void
    type?: "danger" | "warning" | "success" | "info"
  }

  // Actions
  setCategories: React.Dispatch<React.SetStateAction<MenuCategory[]>>
  setCurrentPalette: React.Dispatch<React.SetStateAction<any>>
  setFontSettings: React.Dispatch<React.SetStateAction<SimplifiedFontSettings>>
  setMenuStyles: React.Dispatch<React.SetStateAction<MenuStyles>>
  setRowStyleSettings: React.Dispatch<React.SetStateAction<RowStyleSettings>>
  setPageBackgroundSettings: React.Dispatch<React.SetStateAction<PageBackgroundSettings>>
  setSelectedPalette: React.Dispatch<React.SetStateAction<string>>
  setShowColorModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowDesignModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowRowStylingModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowPageBackgroundModal: React.Dispatch<React.SetStateAction<boolean>>
  
  // Functions
  handleAddItem: (categoryId: string) => Promise<void>
  handleUpdateItem: (updatedItem: MenuItem) => void
  handleDeleteItem: (itemId: string) => Promise<void>
  handleUpdateCategory: (categoryId: string, field: string, value: string | null) => Promise<void>
  handleDeleteCategory: (categoryId: string) => Promise<void>
  handleAddCategory: () => Promise<void>
  moveItem: (categoryId: string, dragIndex: number, hoverIndex: number) => void
  handleDropItem: (categoryId: string) => Promise<void>
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleUpdateColorPalette: (paletteId: string) => Promise<void>
  handleLoadDummyData: () => Promise<void>
  handleSaveDesignChanges: () => void
  handleSaveRowStyles: (newSettings: RowStyleSettings) => void
  handleSavePageBackground: (newSettings: PageBackgroundSettings) => void
  handleBgImageUpload: (file: File, categoryId: string) => Promise<void>
  handlePageBgImageUpload: (file: File) => Promise<string>
  
  // Utility functions
  showNotification: (type: "success" | "error" | "warning" | "info", title: string, description: string) => void
  showConfirmation: (title: string, description: string, action: () => void, type?: "danger" | "warning" | "success" | "info") => void
  onRefresh: () => void
}

const MenuEditorContext = createContext<MenuEditorContextType | undefined>(undefined)

export const useMenuEditor = () => {
  const context = useContext(MenuEditorContext)
  if (context === undefined) {
    throw new Error('useMenuEditor must be used within a MenuEditorProvider')
  }
  return context
}

interface MenuEditorProviderProps {
  children: React.ReactNode
  restaurant: Restaurant
  initialCategories: MenuCategory[]
  onRefresh: () => void
}

export const MenuEditorProvider: React.FC<MenuEditorProviderProps> = ({
  children,
  restaurant,
  initialCategories,
  onRefresh
}) => {
  // State
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories)
  const [currentPalette, setCurrentPalette] = useState(() => 
    restaurant.color_palette || colorPalettes.find(p => p.id === "emerald")!
  )
  const [selectedPalette, setSelectedPalette] = useState(restaurant.color_palette?.id || "emerald")
  const [isUpdatingPalette, setIsUpdatingPalette] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isLoadingDummy, setIsLoadingDummy] = useState(false)

  // Font and style settings
  const [fontSettings, setFontSettings] = useState<SimplifiedFontSettings>({
    arabic: { font: 'cairo', weight: '400' },
    english: { font: 'open-sans', weight: '400' }
  })
  const [appliedFontSettings, setAppliedFontSettings] = useState<SimplifiedFontSettings>({
    arabic: { font: 'cairo', weight: '400' },
    english: { font: 'open-sans', weight: '400' }
  })
  const [menuStyles, setMenuStyles] = useState<MenuStyles>({
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f8fafc',
    gradientDirection: 'to-b'
  })
  const [appliedMenuStyles, setAppliedMenuStyles] = useState<MenuStyles>({
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f8fafc',
    gradientDirection: 'to-b'
  })
  const [rowStyleSettings, setRowStyleSettings] = useState<RowStyleSettings>({
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundType: 'solid',
    itemColor: '#000000',
    descriptionColor: '#6b7280',
    priceColor: '#dc2626',
    textShadow: false
  })
  const [appliedRowStyles, setAppliedRowStyles] = useState<RowStyleSettings>({
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundType: 'solid',
    itemColor: '#000000',
    descriptionColor: '#6b7280',
    priceColor: '#dc2626',
    textShadow: false
  })
  const [pageBackgroundSettings, setPageBackgroundSettings] = useState<PageBackgroundSettings>({
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f8fafc',
    gradientDirection: 'to-b'
  })
  const [appliedPageBackgroundSettings, setAppliedPageBackgroundSettings] = useState<PageBackgroundSettings>({
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f8fafc',
    gradientDirection: 'to-b'
  })

  // Modal states
  const [showColorModal, setShowColorModal] = useState(false)
  const [showDesignModal, setShowDesignModal] = useState(false)
  const [showRowStylingModal, setShowRowStylingModal] = useState(false)
  const [showPageBackgroundModal, setShowPageBackgroundModal] = useState(false)
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

  // Utility functions
  const showNotification = useCallback((type: "success" | "error" | "warning" | "info", title: string, description: string) => {
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
  }, [toast])

  const showConfirmation = useCallback((title: string, description: string, action: () => void, type: "danger" | "warning" | "success" | "info" = "warning") => {
    setConfirmAction({ show: true, title, description, action, type })
  }, [])

  // Effects
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  useEffect(() => {
    if (restaurant.color_palette) {
      setCurrentPalette(restaurant.color_palette)
      setSelectedPalette(restaurant.color_palette.id)
    }
  }, [restaurant.color_palette])

  // Load saved customization settings from database
  useEffect(() => {
    const loadCustomizations = async () => {
      try {
        const result = await getMenuCustomizations(restaurant.id)
        if (result.success && result.data) {
          const customizations = result.data
          
          // Load font settings if available
          if (customizations.font_settings) {
            setFontSettings(customizations.font_settings)
            setAppliedFontSettings(customizations.font_settings)
          }
          
          // Load page background settings if available
          if (customizations.page_background_settings && Object.keys(customizations.page_background_settings).length > 0) {
            setPageBackgroundSettings(customizations.page_background_settings)
            setAppliedPageBackgroundSettings(customizations.page_background_settings)
          }
          
          // Load row styles if available
          if (customizations.row_styles) {
            setRowStyleSettings(customizations.row_styles)
            setAppliedRowStyles(customizations.row_styles)
          }
        }
      } catch (error) {
        console.error('Error loading customizations:', error)
        // Silently use defaults on error
      }
    }

    loadCustomizations()
  }, [restaurant.id])

  // Menu item functions
  const handleAddItem = useCallback(async (categoryId: string) => {
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
  }, [restaurant.id, showNotification])

  const handleUpdateItem = useCallback((updatedItem: MenuItem) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        menu_items: cat.menu_items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      })),
    )
  }, [])

  const handleDeleteItem = useCallback(async (itemId: string) => {
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
  }, [showConfirmation, showNotification])

  // Category functions
  const handleUpdateCategory = useCallback(async (categoryId: string, field: string, value: string | null) => {
    const result = await quickUpdateCategory(categoryId, field, value)
    if (result.success) {
      setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, [field]: value } : cat)))
    } else {
      showNotification("error", "فشل في تحديث القسم", result.error || "حدث خطأ غير متوقع")
      onRefresh() // Revert on error
    }
  }, [showNotification, onRefresh])

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    const result = await quickDeleteCategory(categoryId)
    if (result.success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      showNotification("success", "تم حذف القسم", "تم حذف القسم وجميع عناصره بنجاح")
    } else {
      showNotification("error", "فشل في حذف القسم", result.error || "حدث خطأ غير متوقع")
    }
  }, [showNotification])

  const handleAddCategory = useCallback(async () => {
    const result = await quickAddCategory(restaurant.id, "قسم جديد")
    if (result.success && result.category) {
      setCategories((prev) => [...prev, { ...result.category, menu_items: [] }])
      showNotification("success", "تم إضافة القسم", "تم إضافة قسم جديد للقائمة بنجاح")
    } else {
      showNotification("error", "فشل في إضافة القسم", result.error || "حدث خطأ غير متوقع")
    }
  }, [restaurant.id, showNotification])

  // Drag and drop functions
  const moveItem = useCallback((categoryId: string, dragIndex: number, hoverIndex: number) => {
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
  }, [])

  const handleDropItem = useCallback(async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const itemIds = category.menu_items.map((item) => item.id)
    await reorderMenuItems(categoryId, itemIds)
    onRefresh() // Refresh from DB to ensure order is persisted
  }, [categories, onRefresh])

  // File upload functions
  const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [restaurant.id, onRefresh, showNotification])

  const handleBgImageUpload = useCallback(async (file: File, categoryId: string) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `templates/category-backgrounds/${categoryId}-bg-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName)

      // Update category background image
      await handleUpdateCategory(categoryId, 'background_image_url', publicUrl)
      showNotification("success", "تم رفع الصورة بنجاح", "تم تحديث صورة خلفية القسم")
    } catch (error) {
      console.error('Background upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      showNotification("error", "فشل في رفع الصورة", errorMessage)
    }
  }, [handleUpdateCategory, showNotification])

  // Color palette functions
  const handleUpdateColorPalette = useCallback(async (paletteId: string) => {
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
  }, [restaurant.id, restaurant.color_palette, showNotification])

  // Dummy data function
  const handleLoadDummyData = useCallback(async () => {
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
          const dummyMenu = await import('@/data/dummy-menu.js')
          const dummyData = (dummyMenu as any).default || dummyMenu
          
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
  }, [restaurant.id, categories.length, onRefresh, showNotification, showConfirmation])

  // Design changes function
  const handleSaveDesignChanges = useCallback(async () => {
    try {
      // Save font settings to database
      await saveFontSettings(restaurant.id, fontSettings)
      
      // Apply changes to local state
      setAppliedFontSettings(fontSettings)
      setAppliedMenuStyles(menuStyles)
      setShowDesignModal(false)
      showNotification("success", "تم تطبيق التغييرات", "تم حفظ إعدادات الخط والخلفية بنجاح في قاعدة البيانات")
    } catch (error: any) {
      console.error('Error saving design changes:', error)
      showNotification("error", "فشل في حفظ التغييرات", "حدث خطأ أثناء حفظ الإعدادات في قاعدة البيانات")
    }
  }, [fontSettings, menuStyles, restaurant.id, showNotification])

  const handleSaveRowStyles = useCallback(async (newSettings: RowStyleSettings) => {
    try {
      // Save row styles to database
      await saveRowStyles(restaurant.id, newSettings)
      
      // Apply changes to local state
      setAppliedRowStyles(newSettings)
      showNotification("success", "تم تطبيق إعدادات العناصر", "تم حفظ إعدادات تخصيص عناصر القائمة بنجاح في قاعدة البيانات")
    } catch (error: any) {
      console.error('Error saving row styles:', error)
      showNotification("error", "فشل في حفظ إعدادات العناصر", "حدث خطأ أثناء حفظ إعدادات العناصر في قاعدة البيانات")
    }
  }, [restaurant.id, showNotification])

  const handleSavePageBackground = useCallback(async (newSettings: PageBackgroundSettings) => {
    try {
      // Save page background settings to database
      await savePageBackgroundSettings(restaurant.id, newSettings)
      
      // Apply changes to local state
      setAppliedPageBackgroundSettings(newSettings)
      showNotification("success", "تم تطبيق إعدادات الخلفية", "تم حفظ إعدادات الخلفية بنجاح في قاعدة البيانات")
    } catch (error: any) {
      console.error('Error saving page background:', error)
      showNotification("error", "فشل في حفظ إعدادات الخلفية", "حدث خطأ أثناء حفظ إعدادات الخلفية في قاعدة البيانات")
    }
  }, [restaurant.id, showNotification])

  const handlePageBgImageUpload = useCallback(async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `media/${Date.now()}-bg.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Background upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      showNotification("error", "فشل في رفع الصورة", errorMessage)
      throw error
    }
  }, [showNotification])

  const value: MenuEditorContextType = {
    // State
    restaurant,
    categories,
    currentPalette,
    fontSettings,
    appliedFontSettings,
    menuStyles,
    appliedMenuStyles,
    rowStyleSettings,
    appliedRowStyles,
    pageBackgroundSettings,
    appliedPageBackgroundSettings,
    selectedPalette,
    isUpdatingPalette,
    isUploadingLogo,
    isLoadingDummy,
    showColorModal,
    showDesignModal,
    showRowStylingModal,
    showPageBackgroundModal,
    notification,
    confirmAction,

    // Actions
    setCategories,
    setCurrentPalette,
    setFontSettings,
    setMenuStyles,
    setRowStyleSettings,
    setPageBackgroundSettings,
    setSelectedPalette,
    setShowColorModal,
    setShowDesignModal,
    setShowRowStylingModal,
    setShowPageBackgroundModal,

    // Functions
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddCategory,
    moveItem,
    handleDropItem,
    handleLogoUpload,
    handleUpdateColorPalette,
    handleLoadDummyData,
    handleSaveDesignChanges,
    handleSaveRowStyles,
    handleSavePageBackground,
    handleBgImageUpload,
    handlePageBgImageUpload,
    showNotification,
    showConfirmation,
    onRefresh
  }

  return (
    <MenuEditorContext.Provider value={value}>
      {children}
    </MenuEditorContext.Provider>
  )
} 