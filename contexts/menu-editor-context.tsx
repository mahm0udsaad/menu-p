"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
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
  isTemporary?: boolean
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
  address?: string
  phone?: string
  website?: string
  template_name?: string
  page_background_url?: string | null
}

export type TemplateId = 'classic' | 'painting';

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
  selectedTemplate: TemplateId | null
  
  // Modal states
  showColorModal: boolean
  showDesignModal: boolean
  showRowStylingModal: boolean
  showPageBackgroundModal: boolean
  showTemplateSwitcherModal: boolean
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
  setRowStyleSettings: React.Dispatch<React.SetStateAction<RowStyleSettings>>
  setPageBackgroundSettings: React.Dispatch<React.SetStateAction<PageBackgroundSettings>>
  setSelectedPalette: React.Dispatch<React.SetStateAction<string>>
  setShowColorModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowDesignModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowRowStylingModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowPageBackgroundModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowTemplateSwitcherModal: React.Dispatch<React.SetStateAction<boolean>>
  setIsEditingFooter: React.Dispatch<React.SetStateAction<boolean>>
  
  // Functions
  handleAddItem: (categoryId: string) => void
  handleUpdateItem: (updatedItem: MenuItem) => void
  handleDeleteItem: (itemId: string) => Promise<void>
  handleSaveNewItem: (item: MenuItem) => Promise<void>
  handleUpdateCategory: (categoryId: string, field: string, value: string | null) => Promise<void>
  handleDeleteCategory: (categoryId: string) => Promise<void>
  handleAddCategory: () => void
  handleSaveNewCategory: (category: MenuCategory) => Promise<void>
  moveItem: (categoryId: string, dragIndex: number, hoverIndex: number) => void
  handleDropItem: (categoryId: string) => Promise<void>
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleUpdateColorPalette: (paletteId: string) => Promise<void>
  handleLoadDummyData: () => Promise<void>
  handleSaveDesignChanges: () => void
  handleSaveRowStyles: (newSettings: RowStyleSettings) => void
  handleSavePageBackground: (newSettings: PageBackgroundSettings) => void
  handleUpdateRestaurantDetails: (details: Partial<Restaurant>) => Promise<void>
  handleTemplateChange: (templateId: TemplateId) => Promise<void>
  handleBgImageUpload: (file: File, categoryId: string) => Promise<void>
  handlePageBgImageUpload: (file: File) => Promise<string>
  
  // Utility functions
  showNotification: (type: "success" | "error" | "warning" | "info", title: string, description: string) => void
  showConfirmation: (title: string, description: string, action: () => void, type?: "danger" | "warning" | "success" | "info") => void
  hideConfirmation: () => void
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
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(restaurant.template_name as TemplateId || 'classic')
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
  const [showTemplateSwitcherModal, setShowTemplateSwitcherModal] = useState(false)

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

  const hideConfirmation = useCallback(() => {
    setConfirmAction({
      show: false,
      title: '',
      description: '',
      action: () => {},
    })
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
          if (customizations.template_name) {
            setSelectedTemplate(customizations.template_name as TemplateId)
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

  const handleSaveNewItem = async (item: MenuItem) => {
    // Make sure category_id is present
    if (!item.category_id) {
      showNotification("error", "Cannot save item", "Category ID is missing.")
      // Clean up the temporary item
      setCategories(prev =>
        prev.map(cat => ({
          ...cat,
          menu_items: cat.menu_items.filter(i => i.id !== item.id),
        }))
      )
      return
    }

    const result = await quickAddItem(item.category_id, restaurant.id, {
      name: item.name,
      description: item.description,
      price: item.price
    })

    if (result.success && result.item) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === item.category_id
            ? {
                ...cat,
                menu_items: cat.menu_items.map(i =>
                  i.id === item.id ? { ...result.item, isTemporary: false } : i
                ),
              }
            : cat
        )
      )
      showNotification("success", "Item Added", `${result.item.name} has been added.`)
    } else {
      showNotification("error", "Failed to add item", result.error || "An unknown error occurred")
      // Clean up the temporary item on failure
      setCategories(prev =>
        prev.map(cat => ({
          ...cat,
          menu_items: cat.menu_items.filter(i => i.id !== item.id),
        }))
      )
    }
  }

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

    showConfirmation(
      "Delete Item?",
      "Are you sure you want to delete this item? This action cannot be undone.",
      async () => {
        const result = await quickDeleteItem(itemId)
        if (result.success) {
          setCategories(prev => prev.map(cat => ({ ...cat, menu_items: cat.menu_items.filter(item => item.id !== itemId) })))
          showNotification("success", "Item Deleted", "The item has been deleted successfully.")
        } else {
          showNotification("error", "Failed to delete item", result.error || "An unknown error occurred")
        }
      },
      "danger"
    )
  }, [showNotification, showConfirmation])

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
    if (categoryId.startsWith('temp-cat-')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      return
    }

    showConfirmation(
      "Delete Category?",
      "Are you sure you want to delete this category? This action cannot be undone.",
      async () => {
        const result = await quickDeleteCategory(categoryId)
        if (result.success) {
          setCategories(prev => prev.filter(cat => cat.id !== categoryId))
          showNotification("success", "Category Deleted", "The category has been deleted.")
          onRefresh()
        } else {
          showNotification("error", "Failed to delete category", result.error || "An unknown error occurred")
        }
      },
      "danger"
    )
  }, [showNotification, onRefresh, showConfirmation])

  const handleAddCategory = useCallback(() => {
    const newCategory: MenuCategory = {
      id: `temp-cat-${Date.now()}`,
      name: 'New Category',
      description: null,
      menu_items: [],
      isTemporary: true,
    }
    setCategories(prev => [...prev, newCategory])
  }, [])

  const handleSaveNewCategory = useCallback(async (category: MenuCategory) => {
    const result = await quickAddCategory(restaurant.id, category.name)
    if (result.success && result.category) {
      setCategories(prev =>
        prev.map(c =>
          c.id === category.id
            ? { ...c, ...result.category, isTemporary: false, menu_items: c.menu_items }
            : c
        )
      )
      showNotification("success", "Category Added", "You can now add items to it.")
    } else {
      showNotification("error", "Failed to add category", result.error || "An unknown error occurred")
      setCategories(prev => prev.filter(c => c.id !== category.id))
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

  const handleTemplateChange = async (templateId: TemplateId) => {
    try {
      await updateRestaurantDetails(restaurant.id, { template_name: templateId });
      setSelectedTemplate(templateId);
      toast({
        title: "Template Updated",
        description: "Your menu template has been successfully updated.",
      });
      setShowTemplateSwitcherModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update the template. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const value = useMemo(() => ({
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
    selectedTemplate,
    showColorModal,
    showDesignModal,
    showRowStylingModal,
    showPageBackgroundModal,
    showTemplateSwitcherModal,
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
    setShowTemplateSwitcherModal,
    setIsEditingFooter,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleSaveNewItem,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddCategory,
    handleSaveNewCategory,
    moveItem,
    handleDropItem,
    handleLogoUpload,
    handleUpdateColorPalette,
    handleLoadDummyData,
    handleSaveDesignChanges,
    handleSaveRowStyles,
    handleSavePageBackground,
    handleUpdateRestaurantDetails,
    handleTemplateChange,
    handleBgImageUpload,
    handlePageBgImageUpload,
    showNotification,
    showConfirmation,
    hideConfirmation,
    onRefresh,
  }), [
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
    selectedTemplate,
    showColorModal,
    showDesignModal,
    showRowStylingModal,
    showPageBackgroundModal,
    showTemplateSwitcherModal,
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
    setShowTemplateSwitcherModal,
    setIsEditingFooter,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleSaveNewItem,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddCategory,
    handleSaveNewCategory,
    moveItem,
    handleDropItem,
    handleLogoUpload,
    handleUpdateColorPalette,
    handleLoadDummyData,
    handleSaveDesignChanges,
    handleSaveRowStyles,
    handleSavePageBackground,
    handleUpdateRestaurantDetails,
    handleTemplateChange,
    handleBgImageUpload,
    handlePageBgImageUpload,
    showNotification,
    showConfirmation,
    hideConfirmation,
    onRefresh,
  ])

  return (
    <MenuEditorContext.Provider value={value}>
      {children}
    </MenuEditorContext.Provider>
  )
} 