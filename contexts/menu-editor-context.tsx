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
import { updateRestaurantDetails } from '@/lib/actions/restaurant'
import { 
  saveMenuTranslation,
  getMenuTranslation,
  getAllMenuTranslations,
  type MenuTranslation
} from '@/lib/actions/menu-translation-storage'

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
  isTemporary?: boolean
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
  language?: string // Add optional language field
  color_palette?: {
    id: string
    name: string
    primary: string
    secondary: string
    accent: string
  } | null
  address?: string
  phone?: string
  website?: string
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
  borderTop: BorderSetting
  borderBottom: BorderSetting
  borderLeft: BorderSetting
  borderRight: BorderSetting
  borderRadius: number
}

export interface PageBackgroundSettings {
  backgroundColor: string
  backgroundImage: string | null
  backgroundType: 'solid' | 'image' | 'gradient'
  gradientFrom: string
  gradientTo: string
  gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
}

export interface BorderSetting {
  enabled: boolean
  color: string
  width: number
}

// Add language-related interfaces
export interface LanguageState {
  currentLanguage: string
  originalCategories: MenuCategory[]
  translations: Record<string, MenuCategory[]>
  availableLanguages: string[]
  isLoadingTranslation: boolean
}

// Color palettes
export const colorPalettes = [
  { id: "emerald", name: "زمردي كلاسيكي", primary: "#10b981", secondary: "#059669", accent: "#34d399", preview: ["#10b981", "#059669", "#34d399", "#a7f3d0"] },
  { id: "amber", name: "عنبري دافئ", primary: "#f59e0b", secondary: "#d97706", accent: "#fbbf24", preview: ["#f59e0b", "#d97706", "#fbbf24", "#fde68a"] },
  { id: "rose", name: "وردي أنيق", primary: "#e11d48", secondary: "#be185d", accent: "#f43f5e", preview: ["#e11d48", "#be185d", "#f43f5e", "#fda4af"] },
  { id: "blue", name: "أزرق احترافي", primary: "#3b82f6", secondary: "#2563eb", accent: "#60a5fa", preview: ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd"] },
  { id: "purple", name: "بنفسجي ملكي", primary: "#8b5cf6", secondary: "#7c3aed", accent: "#a78bfa", preview: ["#8b5cf6", "#7c3aed", "#a78bfa", "#c4b5fd"] },
  { id: "teal", name: "تيل عصري", primary: "#14b8a6", secondary: "#0d9488", accent: "#2dd4bf", preview: ["#14b8a6", "#0d9488", "#2dd4bf", "#7dd3fc"] }
]

// Context interface
interface MenuEditorContextType {
  // State
  restaurant: Restaurant
  categories: MenuCategory[]
  currentPalette: any
  fontSettings: SimplifiedFontSettings
  appliedFontSettings: SimplifiedFontSettings
  rowStyleSettings: RowStyleSettings
  appliedRowStyles: RowStyleSettings
  pageBackgroundSettings: PageBackgroundSettings
  appliedPageBackgroundSettings: PageBackgroundSettings
  selectedPalette: string
  isUpdatingPalette: boolean
  isUploadingLogo: boolean
  isLoadingDummy: boolean
  isEditingFooter: boolean
  
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

  // Language state
  currentLanguage: string
  originalCategories: MenuCategory[]
  translations: Record<string, MenuCategory[]>
  availableLanguages: string[]
  isLoadingTranslation: boolean
  
  // Actions
  setCategories: React.Dispatch<React.SetStateAction<MenuCategory[]>>
  setCurrentPalette: React.Dispatch<React.SetStateAction<any>>
  setFontSettings: React.Dispatch<React.SetStateAction<SimplifiedFontSettings>>
  setRowStyleSettings: React.Dispatch<React.SetStateAction<RowStyleSettings>>
  setPageBackgroundSettings: React.Dispatch<React.SetStateAction<PageBackgroundSettings>>
  setSelectedPalette: React.Dispatch<React.SetStateAction<string>>
  setShowColorModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowDesignModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowRowStylingModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowPageBackgroundModal: React.Dispatch<React.SetStateAction<boolean>>
  setIsEditingFooter: React.Dispatch<React.SetStateAction<boolean>>
  
  // Functions
  handleAddItem: (categoryId: string) => void
  handleUpdateItem: (updatedItem: MenuItem) => void
  handleDeleteItem: (itemId: string) => Promise<void>
  handleSaveNewItem: (item: MenuItem) => Promise<void>
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
  handleUpdateRestaurantDetails: (details: Partial<Restaurant>) => Promise<void>
  handleBgImageUpload: (file: File, categoryId: string) => Promise<void>
  handlePageBgImageUpload: (file: File) => Promise<string>
  
  // Utility functions
  showNotification: (type: "success" | "error" | "warning" | "info", title: string, description: string) => void
  showConfirmation: (title: string, description: string, action: () => void, type?: "danger" | "warning" | "success" | "info") => void
  onRefresh: () => void

  // Language functions
  switchLanguage: (languageCode: string) => Promise<void>
  saveTranslation: (languageCode: string, translatedCategories: MenuCategory[]) => Promise<void>
  loadAvailableTranslations: () => Promise<void>
  deleteTranslation: (languageCode: string) => Promise<void>
  getCurrentCategories: () => MenuCategory[]
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
  const [isEditingFooter, setIsEditingFooter] = useState(false)

  // Default settings
  const defaultFontSettings: SimplifiedFontSettings = {
    arabic: { font: 'cairo', weight: '400' },
    english: { font: 'open-sans', weight: '400' }
  }
  const defaultRowStyles: RowStyleSettings = {
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundType: 'solid',
    itemColor: '#000000',
    descriptionColor: '#6b7280',
    priceColor: '#dc2626',
    textShadow: false,
    borderTop: { enabled: false, color: '#e5e7eb', width: 1 },
    borderBottom: { enabled: false, color: '#e5e7eb', width: 1 },
    borderLeft: { enabled: false, color: '#e5e7eb', width: 1 },
    borderRight: { enabled: false, color: '#e5e7eb', width: 1 },
    borderRadius: 8,
  }
  const defaultPageBackground: PageBackgroundSettings = {
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundType: 'solid',
    gradientFrom: '#ffffff',
    gradientTo: '#f8fafc',
    gradientDirection: 'to-b'
  }

  // Live settings state (what's in the modals)
  const [fontSettings, setFontSettings] = useState<SimplifiedFontSettings>(defaultFontSettings)
  const [rowStyleSettings, setRowStyleSettings] = useState<RowStyleSettings>(defaultRowStyles)
  const [pageBackgroundSettings, setPageBackgroundSettings] = useState<PageBackgroundSettings>(defaultPageBackground)

  // Applied settings state (what's shown in the preview)
  const [appliedFontSettings, setAppliedFontSettings] = useState<SimplifiedFontSettings>(defaultFontSettings)
  const [appliedRowStyles, setAppliedRowStyles] = useState<RowStyleSettings>(defaultRowStyles)
  const [appliedPageBackgroundSettings, setAppliedPageBackgroundSettings] = useState<PageBackgroundSettings>(defaultPageBackground)
  
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

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState(restaurant.language || "ar")
  const [originalCategories, setOriginalCategories] = useState<MenuCategory[]>(initialCategories)
  const [translations, setTranslations] = useState<Record<string, MenuCategory[]>>({})
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false)

  const { toast } = useToast()

  // Utility functions
  const showNotification = useCallback((type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    if (type === "success") {
      toast({ title, description, variant: "default" })
    } else if (type === "error") {
      toast({ title, description, variant: "destructive" })
    } else {
      toast({ title, description, variant: "default" })
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
          const customizations = result.data as any
          
          if (customizations.font_settings) {
            setFontSettings(customizations.font_settings)
            setAppliedFontSettings(customizations.font_settings)
          }
          if (customizations.page_background_settings) {
            setPageBackgroundSettings(customizations.page_background_settings)
            setAppliedPageBackgroundSettings(customizations.page_background_settings)
          }
          if (customizations.row_styles) {
            // Gracefully handle old border format
            const incomingStyles = customizations.row_styles;
            if (typeof incomingStyles.border === 'boolean') {
              const allBorders: BorderSetting = { enabled: incomingStyles.border, color: incomingStyles.borderColor, width: 1 };
              setRowStyleSettings({
                ...defaultRowStyles,
                ...incomingStyles,
                borderTop: allBorders,
                borderBottom: allBorders,
                borderLeft: allBorders,
                borderRight: allBorders,
                borderRadius: incomingStyles.borderRadius,
              });
              setAppliedRowStyles({
                ...defaultRowStyles,
                ...incomingStyles,
                borderTop: allBorders,
                borderBottom: allBorders,
                borderLeft: allBorders,
                borderRight: allBorders,
                borderRadius: incomingStyles.borderRadius,
              });
            } else {
              setRowStyleSettings(incomingStyles)
              setAppliedRowStyles(incomingStyles)
            }
          }
        }
      } catch (error) {
        console.error('Error loading customizations:', error)
      }
    }
    loadCustomizations()
  }, [restaurant.id])

  // Menu item functions
  const handleAddItem = useCallback((categoryId: string) => {
    const tempId = `temp_${Date.now()}`
    const newItem: MenuItem = {
      id: tempId,
      name: '',
      description: null,
      price: null,
      image_url: null,
      is_available: true,
      is_featured: false,
      dietary_info: [],
      display_order: 0,
      category_id: categoryId,
      isTemporary: true
    }
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, menu_items: [...cat.menu_items, newItem] } : cat))
    showNotification("success", "تم إضافة العنصر", "اضغط حفظ لحفظ التغييرات.")
  }, [showNotification])

  const handleSaveNewItem = useCallback(async (item: MenuItem) => {
    if (!item.isTemporary) return
    if (!item.name.trim()) {
      showNotification("error", "خطأ", "يجب إدخال اسم العنصر")
      return
    }

    try {
      const result = await quickAddItem(item.category_id!, restaurant.id)
      if (result.success && result.item) {
        const finalItem: MenuItem = { ...result.item, ...item, isTemporary: false }
        setCategories(prev => prev.map(cat => ({
          ...cat,
          menu_items: cat.menu_items.map(i => i.id === item.id ? finalItem : i),
        })))
        showNotification("success", "تم الحفظ", "تم حفظ العنصر بنجاح")
      } else {
        showNotification("error", "فشل الحفظ", result.error || "حدث خطأ")
      }
    } catch (error) {
      showNotification("error", "فشل الحفظ", "حدث خطأ")
    }
  }, [restaurant.id, showNotification])

  const handleUpdateItem = useCallback((updatedItem: MenuItem) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      menu_items: cat.menu_items.map(item => item.id === updatedItem.id ? updatedItem : item),
    })))
  }, [])

  const handleDeleteItem = useCallback(async (itemId: string) => {
    if (itemId.startsWith('temp_')) {
      setCategories(prev => prev.map(cat => ({ ...cat, menu_items: cat.menu_items.filter(item => item.id !== itemId) })))
      showNotification("success", "تم الحذف", "تم حذف العنصر المؤقت")
      return
    }
    const result = await quickDeleteItem(itemId)
    if (result.success) {
      setCategories(prev => prev.map(cat => ({ ...cat, menu_items: cat.menu_items.filter(item => item.id !== itemId) })))
      showNotification("success", "تم الحذف", "تم حذف العنصر بنجاح")
    } else {
      showNotification("error", "فشل الحذف", result.error || "حدث خطأ")
    }
  }, [showNotification])

  // Category functions
  const handleUpdateCategory = useCallback(async (categoryId: string, field: string, value: string | null) => {
    const result = await quickUpdateCategory(categoryId, field, value)
    if (result.success) {
      setCategories(prev => prev.map(cat => (cat.id === categoryId ? { ...cat, [field]: value } : cat)))
    } else {
      showNotification("error", "فشل التحديث", result.error || "حدث خطأ")
      onRefresh()
    }
  }, [showNotification, onRefresh])

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    const result = await quickDeleteCategory(categoryId)
    if (result.success) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      showNotification("success", "تم الحذف", "تم حذف القسم بنجاح")
    } else {
      showNotification("error", "فشل الحذف", result.error || "حدث خطأ")
    }
  }, [showNotification])

  const handleAddCategory = useCallback(async () => {
    const result = await quickAddCategory(restaurant.id, "قسم جديد")
    if (result.success && result.category) {
      setCategories(prev => [...prev, { ...result.category, menu_items: [] }])
      showNotification("success", "تم الإضافة", "تم إضافة قسم جديد")
    } else {
      showNotification("error", "فشل الإضافة", result.error || "حدث خطأ")
    }
  }, [restaurant.id, showNotification])

  // Drag and drop functions
  const moveItem = useCallback((categoryId: string, dragIndex: number, hoverIndex: number) => {
    setCategories(prev => {
      const newCategories = [...prev]
      const catIndex = newCategories.findIndex(c => c.id === categoryId)
      if (catIndex === -1) return prev
      const newItems = [...newCategories[catIndex].menu_items]
      const [draggedItem] = newItems.splice(dragIndex, 1)
      newItems.splice(hoverIndex, 0, draggedItem)
      newCategories[catIndex] = { ...newCategories[catIndex], menu_items: newItems }
      return newCategories
    })
  }, [])

  const handleDropItem = useCallback(async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      await reorderMenuItems(categoryId, category.menu_items.map(item => item.id))
      onRefresh()
    }
  }, [categories, onRefresh])

  // File upload functions
  const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${restaurant.id}-logo-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('restaurant-logos').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('restaurant-logos').getPublicUrl(fileName)
      const { error: updateError } = await supabase.from('restaurants').update({ logo_url: publicUrl }).eq('id', restaurant.id)
      if (updateError) throw updateError
      onRefresh()
      showNotification("success", "تم التحديث", "تم تحديث الشعار بنجاح")
    } catch (error) {
      showNotification("error", "فشل الرفع", "حدث خطأ")
    } finally {
      setIsUploadingLogo(false)
    }
  }, [restaurant.id, onRefresh, showNotification])

  const handleBgImageUpload = useCallback(async (file: File, categoryId: string) => {
    if (!file) {
      showNotification("error", "خطأ", "الرجاء اختيار ملف")
      throw new Error("No file selected")
    }
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `templates/category-backgrounds/${categoryId}-bg-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('restaurant-logos').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('restaurant-logos').getPublicUrl(fileName)
      await handleUpdateCategory(categoryId, 'background_image_url', publicUrl)
      showNotification("success", "تم التحديث", "تم تحديث صورة خلفية القسم")
    } catch (error) {
      showNotification("error", "فشل الرفع", "حدث خطأ")
    }
  }, [handleUpdateCategory, showNotification])

  // Color palette functions
  const handleUpdateColorPalette = useCallback(async (paletteId: string) => {
    setIsUpdatingPalette(true)
    try {
      const palette = colorPalettes.find(p => p.id === paletteId)
      if (!palette) throw new Error('Invalid palette')
      setCurrentPalette(palette)
      const { error } = await supabase.from('restaurants').update({ color_palette: palette }).eq('id', restaurant.id)
      if (error) {
        setCurrentPalette(restaurant.color_palette || colorPalettes.find(p => p.id === "emerald")!)
        throw error
      }
      setSelectedPalette(paletteId)
      setShowColorModal(false)
      showNotification("success", "تم التحديث", "تم تحديث لوحة الألوان")
    } catch (error) {
      showNotification("error", "فشل التحديث", "حدث خطأ")
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
  const handleSaveDesignChanges = useCallback(() => {
    setAppliedFontSettings(fontSettings)
    saveFontSettings(restaurant.id, fontSettings)
    showNotification("success", "تم الحفظ", "تم حفظ إعدادات الخط بنجاح!")
  }, [fontSettings, restaurant.id, showNotification])

  const handleSaveRowStyles = useCallback((newSettings: RowStyleSettings) => {
    setRowStyleSettings(newSettings)
    setAppliedRowStyles(newSettings)
    saveRowStyles(restaurant.id, newSettings)
    showNotification("success", "تم الحفظ", "تم حفظ تصميم صفوف القائمة!")
  }, [restaurant.id, showNotification])

  const handleSavePageBackground = useCallback((newSettings: PageBackgroundSettings) => {
    setPageBackgroundSettings(newSettings)
    setAppliedPageBackgroundSettings(newSettings)
    savePageBackgroundSettings(restaurant.id, newSettings)
    showNotification("success", "تم الحفظ", "تم حفظ خلفية الصفحة بنجاح!")
  }, [restaurant.id, showNotification])

  const handleUpdateRestaurantDetails = useCallback(async (details: Partial<Restaurant>) => {
    const result = await updateRestaurantDetails(restaurant.id, {
      address: details.address,
      phone: details.phone,
      website: details.website,
    })

    if (result.success) {
      showNotification("success", "تم الحفظ", "تم تحديث تفاصيل التذييل بنجاح.")
      // Optionally, refresh data from server to ensure sync
      onRefresh() 
    } else {
      showNotification("error", "فشل الحفظ", "حدث خطأ أثناء تحديث تفاصيل التذييل.")
    }
  }, [restaurant.id, onRefresh, showNotification])

  const handlePageBgImageUpload = useCallback(async (file: File) => {
    if (!file) {
      showNotification("error", "خطأ", "الرجاء اختيار ملف")
      throw new Error("No file selected")
    }
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `media/${Date.now()}-bg.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('restaurant-logos').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('restaurant-logos').getPublicUrl(fileName)
      return publicUrl
    } catch (error) {
      showNotification("error", "فشل الرفع", "حدث خطأ")
      throw error
    }
  }, [showNotification])

  // Language functions
  const switchLanguage = useCallback(async (languageCode: string) => {
    setIsLoadingTranslation(true)
    try {
      const translation = await getMenuTranslation(restaurant.id, languageCode)
      if (translation.success && translation.data) {
        setTranslations(prev => ({ ...prev, [languageCode]: translation.data }))
        setCurrentLanguage(languageCode)
        showNotification("success", "تم تغيير اللغة", `تم تغيير اللغة إلى ${languageCode}`)
      } else {
        setCurrentLanguage(restaurant.language || "ar") // Revert to original if translation not found
        showNotification("error", "فشل تغيير اللغة", "لم يتم العثور على ترجمة لهذه اللغة.")
      }
    } catch (error) {
      console.error('Error switching language:', error)
      setCurrentLanguage(restaurant.language || "ar") // Revert to original on error
      showNotification("error", "فشل تغيير اللغة", "حدث خطأ أثناء تغيير اللغة.")
    } finally {
      setIsLoadingTranslation(false)
    }
  }, [restaurant.id, restaurant.language, showNotification])

  const saveTranslation = useCallback(async (languageCode: string, translatedCategories: MenuCategory[]) => {
    try {
      await saveMenuTranslation(restaurant.id, languageCode, 'ar', { categories: translatedCategories })
      setTranslations(prev => ({ ...prev, [languageCode]: translatedCategories }))
      showNotification("success", "تم حفظ الترجمة", `تم حفظ الترجمة بنجاح لللغة ${languageCode}`)
    } catch (error) {
      console.error('Error saving translation:', error)
      showNotification("error", "فشل حفظ الترجمة", "حدث خطأ أثناء حفظ الترجمة.")
    }
  }, [restaurant.id, showNotification])

  const loadAvailableTranslations = useCallback(async () => {
    setIsLoadingTranslation(true)
    try {
      const allTranslations = await getAllMenuTranslations(restaurant.id)
      if (allTranslations.success && allTranslations.data) {
        const sourceLanguage = allTranslations.data.find((t: MenuTranslation) => t.language_code === restaurant.language)?.language_code || "ar";
        const loadedTranslations = allTranslations.data.reduce((acc: Record<string, MenuCategory[]>, t: MenuTranslation) => ({ ...acc, [t.language_code]: (t.translated_data as any).categories }), {});
        const languages = [
          sourceLanguage,
          ...Object.keys(loadedTranslations)
        ];
        const uniqueLanguages = Array.from(new Set(languages));
        console.log('Updated available languages:', uniqueLanguages);
        setAvailableLanguages(uniqueLanguages);
      } else {
        setAvailableLanguages([]);
      }
    } catch (error) {
      console.error('Error loading available translations:', error)
      setAvailableLanguages([])
    } finally {
      setIsLoadingTranslation(false)
    }
  }, [restaurant.id, restaurant.language]);

  const deleteTranslation = useCallback(async (languageCode: string) => {
    if (confirmAction.show) {
      setConfirmAction({ ...confirmAction, show: false })
      return
    }
    showConfirmation(
      "حذف الترجمة",
      `هل أنت متأكد من حذف الترجمة المحفوظة لللغة ${languageCode}؟ هذا سيؤدي إلى إزالة كل الترجمات المتعلقة بهذه اللغة.`,
      async () => {
        try {
          await supabase.from('menu_translations').delete().eq('restaurant_id', restaurant.id).eq('language_code', languageCode)
          setTranslations(prev => {
            const newTranslations = { ...prev }
            delete newTranslations[languageCode]
            return newTranslations
          })
          setAvailableLanguages(prev => prev.filter(lang => lang !== languageCode))
          showNotification("success", "تم حذف الترجمة", `تم حذف الترجمة بنجاح لللغة ${languageCode}`)
        } catch (error) {
          console.error('Error deleting translation:', error)
          showNotification("error", "فشل حذف الترجمة", "حدث خطأ أثناء حذف الترجمة.")
        }
      },
      "danger"
    )
  }, [restaurant.id, currentLanguage, showConfirmation, confirmAction.show, showNotification])

  const getCurrentCategories = useCallback(() => {
    return translations[currentLanguage] || originalCategories;
  }, [translations, currentLanguage, originalCategories]);

  const value: MenuEditorContextType = {
    restaurant,
    categories,
    currentPalette,
    fontSettings,
    appliedFontSettings,
    rowStyleSettings,
    appliedRowStyles,
    pageBackgroundSettings,
    appliedPageBackgroundSettings,
    selectedPalette,
    isUpdatingPalette,
    isUploadingLogo,
    isLoadingDummy,
    isEditingFooter,
    showColorModal,
    showDesignModal,
    showRowStylingModal,
    showPageBackgroundModal,
    notification,
    confirmAction,
    setCategories,
    setCurrentPalette,
    setFontSettings,
    setRowStyleSettings,
    setPageBackgroundSettings,
    setSelectedPalette,
    setShowColorModal,
    setShowDesignModal,
    setShowRowStylingModal,
    setShowPageBackgroundModal,
    setIsEditingFooter,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleSaveNewItem,
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
    onRefresh,
    handleUpdateRestaurantDetails,
    // Language functions
    currentLanguage,
    originalCategories,
    translations,
    availableLanguages,
    isLoadingTranslation,
    switchLanguage,
    saveTranslation,
    loadAvailableTranslations,
    deleteTranslation,
    getCurrentCategories
  }

  return (
    <MenuEditorContext.Provider value={value}>
      {children}
    </MenuEditorContext.Provider>
  )
} 