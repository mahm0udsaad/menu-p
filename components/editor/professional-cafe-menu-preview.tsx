"use client"

import { useState, useCallback, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit, Upload, FileText } from "lucide-react"
import { quickAddItem, quickDeleteItem, reorderMenuItems } from "@/lib/actions/editor/quick-menu-actions"
import { quickUpdateCategory, quickDeleteCategory, quickAddCategory } from "@/lib/actions/editor/quick-category-actions"
import InlineEditable from "../inline-editable"
import EditableMenuItem from "./editable-menu-item"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"

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
}

interface ProfessionalCafeMenuPreviewProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  onRefresh: () => void
}

// Hardcoded section images for the live preview (since category images are not in DB)
const previewSectionImages = {
  appetizers: "/placeholder.svg?height=300&width=400",
  mains: "/placeholder.svg?height=300&width=400",
  beverages: "/placeholder.svg?height=300&width=400",
  desserts: "/placeholder.svg?height=300&width=400",
}

const getPreviewSectionImage = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase()
  if (lowerCaseName.includes("appetizer") || lowerCaseName.includes("starter")) return previewSectionImages.appetizers
  if (lowerCaseName.includes("main")) return previewSectionImages.mains
  if (lowerCaseName.includes("beverage") || lowerCaseName.includes("coffee") || lowerCaseName.includes("drink"))
    return previewSectionImages.beverages
  if (lowerCaseName.includes("dessert")) return previewSectionImages.desserts
  return previewSectionImages.mains // Default fallback
}

const MenuSectionPreview = ({
  title,
  sectionData,
  columns = 1,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  moveItem,
  onUpdateCategory,
  onDeleteCategory,
}: {
  title: string
  sectionData: MenuCategory
  columns?: 1 | 2
  onAddItem: (categoryId: string) => void
  onUpdateItem: (updatedItem: MenuItem) => void
  onDeleteItem: (itemId: string) => void
  moveItem: (categoryId: string, dragIndex: number, hoverIndex: number) => void
  onUpdateCategory: (categoryId: string, field: string, value: string | null) => void
  onDeleteCategory: (categoryId: string) => void
}) => {
  const [isUploadingBg, setIsUploadingBg] = useState(false)

  const handleBgImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingBg(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${sectionData.id}-bg-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName)

      // Update category background image
      onUpdateCategory(sectionData.id, 'background_image_url', publicUrl)
    } catch (error) {
      console.error('Background upload error:', error)
      alert('فشل في رفع صورة الخلفية. حاول مرة أخرى.')
    } finally {
      setIsUploadingBg(false)
    }
  }

  return (
    <div className="mb-16 group/category-section" data-category-id={sectionData.id}>
    {/* Section Header with Background Image */}
      <div className="relative mb-8 h-32 rounded-lg overflow-hidden group/header">
      <div
          className="absolute inset-0 bg-cover bg-center transition-all"
          style={{ 
            backgroundImage: sectionData.background_image_url 
              ? `url(${sectionData.background_image_url})` 
              : `url(${getPreviewSectionImage(title)})` 
          }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover/header:opacity-100 transition-opacity flex items-center justify-center z-10">
          <label htmlFor={`bg-upload-${sectionData.id}`} className="cursor-pointer">
            <div className="flex flex-col items-center text-white">
              <Upload className="h-8 w-8 mb-2" />
              <span className="text-sm">تغيير صورة الخلفية</span>
            </div>
            <input
              id={`bg-upload-${sectionData.id}`}
              type="file"
              accept="image/*"
              onChange={handleBgImageUpload}
              className="hidden"
              disabled={isUploadingBg}
            />
          </label>
        </div>

        {/* Loading Overlay */}
        {isUploadingBg && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <span className="text-sm">جاري رفع الصورة...</span>
            </div>
          </div>
        )}

      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center">
          <InlineEditable
            value={title}
            onSave={(value) => onUpdateCategory(sectionData.id, "name", value)}
              className="text-4xl font-serif text-white mb-2 category-name-editable"
            inputClassName="text-center"
          />
          <div className="w-16 h-px bg-amber-400 mx-auto"></div>
        </div>
      </div>
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/category-section:opacity-100 transition-opacity z-20">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/20 shadow-lg"
            title="تعديل القسم"
            onClick={() => {
              // Trigger edit mode for category name
              const nameElement = document.querySelector(`[data-category-id="${sectionData.id}"] .category-name-editable`);
              if (nameElement) {
                (nameElement as HTMLElement).click();
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        <Button
          onClick={() => onDeleteCategory(sectionData.id)}
          size="sm"
          variant="ghost"
          className="text-white hover:text-red-300 hover:bg-red-500/20 shadow-lg"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>

    {/* Menu Items */}
    <div className={`grid gap-6 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
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
                    className="font-serif text-lg text-amber-700"
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
      <div className="mt-6 text-center">
        <Button
          onClick={() => onAddItem(sectionData.id)}
          variant="outline"
          size="sm"
          className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة عنصر إلى {sectionData.name}
        </Button>
      </div>
    </div>
  </div>
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

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  // Constants for page size calculations (A4 in points) - matching PDF logic
  const PAGE_CONSTANTS = {
    A4_HEIGHT: 842,
    A4_WIDTH: 595,
    MARGIN: 40,
    HEADER_HEIGHT: 150,
    FOOTER_HEIGHT: 80,
    CATEGORY_HEADER_HEIGHT: 75,
    ITEM_HEIGHT_SINGLE_COLUMN: 35,
    ITEM_HEIGHT_DOUBLE_COLUMN: 30,
    ITEM_WITH_DESCRIPTION_EXTRA: 15,
  }

  // Calculate available space for content on a page
  const getAvailablePageHeight = (hasHeader: boolean, hasFooter: boolean): number => {
    let availableHeight = PAGE_CONSTANTS.A4_HEIGHT - (PAGE_CONSTANTS.MARGIN * 2);
    
    if (hasHeader) {
      availableHeight -= PAGE_CONSTANTS.HEADER_HEIGHT;
    }
    
    if (hasFooter) {
      availableHeight -= PAGE_CONSTANTS.FOOTER_HEIGHT;
    }
    
    return availableHeight;
  }

  // Estimate the height needed for a category - matching PDF logic
  const estimateCategoryHeight = (category: MenuCategory, useDoubleColumn: boolean = true): number => {
    const validItems = category.menu_items.filter((item) => 
      item && 
      item.id && 
      item.name && 
      item.is_available &&
      item.price !== null &&
      typeof item.price === 'number'
    );

    if (validItems.length === 0) return PAGE_CONSTANTS.CATEGORY_HEADER_HEIGHT;

    const itemsPerRow = useDoubleColumn ? 2 : 1;
    const itemHeight = useDoubleColumn ? PAGE_CONSTANTS.ITEM_HEIGHT_DOUBLE_COLUMN : PAGE_CONSTANTS.ITEM_HEIGHT_SINGLE_COLUMN;
    const rowsNeeded = Math.ceil(validItems.length / itemsPerRow);
    
    // Add extra height for items with descriptions
    const itemsWithDescriptions = validItems.filter(item => item.description && item.description.trim().length > 0).length;
    const extraDescriptionHeight = Math.ceil(itemsWithDescriptions / itemsPerRow) * PAGE_CONSTANTS.ITEM_WITH_DESCRIPTION_EXTRA;
    
    return PAGE_CONSTANTS.CATEGORY_HEADER_HEIGHT + (rowsNeeded * itemHeight) + extraDescriptionHeight;
  }

  // Organize categories into pages based on content size - matching PDF logic exactly
  const organizeCategoriesIntoPages = (categories: MenuCategory[]) => {
    const pages: MenuCategory[][] = [];
    let currentPage: MenuCategory[] = [];
    let currentPageHeight = 0;
    
    const firstPageAvailableHeight = getAvailablePageHeight(true, false); // Has header, no footer
    const regularPageAvailableHeight = getAvailablePageHeight(false, false); // No header, no footer
    const lastPageAvailableHeight = getAvailablePageHeight(false, true); // No header, has footer
    
    categories.forEach((category, index) => {
      const categoryHeight = estimateCategoryHeight(category, false); // Use single column
      const isFirstPage = pages.length === 0 && currentPage.length === 0;
      const isLastCategory = index === categories.length - 1;
      
      // Determine available height for current page
      let availableHeight = regularPageAvailableHeight;
      if (isFirstPage) {
        availableHeight = firstPageAvailableHeight;
      }
      
      // If this would be the last page and we need to fit the footer, reduce available height
      const needsFooterSpace = isLastCategory || (currentPageHeight + categoryHeight > availableHeight);
      if (needsFooterSpace) {
        availableHeight = Math.min(availableHeight, lastPageAvailableHeight);
      }
      
      // Check if category fits on current page
      const wouldExceedPage = currentPageHeight + categoryHeight > availableHeight;
      const isPageEmpty = currentPage.length === 0;
      
      if (wouldExceedPage && !isPageEmpty) {
        // Start new page
        pages.push([...currentPage]);
        currentPage = [category];
        currentPageHeight = categoryHeight;
      } else {
        // Add to current page
        currentPage.push(category);
        currentPageHeight += categoryHeight;
      }
      
      // If this category alone exceeds page height, it will get wrapped automatically by react-pdf
      if (categoryHeight > availableHeight) {
        console.warn(`Category "${category.name}" may be too large for a single page and might get split`);
      }
    });
    
    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // Ensure we have at least one page
    return pages.length > 0 ? pages : [[]];
  }

  // Helper function to get page break information for visual indicators
  const getPageBreaks = (categories: MenuCategory[]): number[] => {
    const pages = organizeCategoriesIntoPages(categories);
    const pageBreaks: number[] = [];
    let categoryIndex = 0;
    
    pages.forEach((page, pageIndex) => {
      if (pageIndex === 0) {
        pageBreaks.push(0); // First category is always a page break
      } else {
        pageBreaks.push(categoryIndex); // Mark categories that start new pages
      }
      categoryIndex += page.length;
    });
    
    return pageBreaks;
  }

  const paginatedCategories = organizeCategoriesIntoPages(categories)
  const totalPages = paginatedCategories.length
  const currentPageCategories = paginatedCategories[currentPage - 1] || []
  const pageBreaks = getPageBreaks(categories) // Get page break indicators

  // Debug pagination logic
  useEffect(() => {
    if (categories.length > 0) {
      console.log(`Preview Pagination: ${totalPages} pages for ${categories.length} categories`)
      console.log('Page breaks at category indices:', pageBreaks)
      paginatedCategories.forEach((page, index) => {
        console.log(`Page ${index + 1}: ${page.length} categories - ${page.map(c => c.name).join(', ')}`)
      })
    }
  }, [categories, totalPages, pageBreaks, paginatedCategories])

  const handleAddItem = async (categoryId: string) => {
    const result = await quickAddItem(categoryId, restaurant.id)
    if (result.success && result.item) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, menu_items: [...cat.menu_items, result.item as MenuItem] } : cat,
        ),
      )
    } else {
      alert(result.error)
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
    if (!confirm("Delete this item?")) return
    const result = await quickDeleteItem(itemId)
    if (result.success) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          menu_items: cat.menu_items.filter((item) => item.id !== itemId),
        })),
      )
    } else {
      alert(result.error)
    }
  }

  const handleUpdateCategory = async (categoryId: string, field: string, value: string | null) => {
    const result = await quickUpdateCategory(categoryId, field, value)
    if (result.success) {
      setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, [field]: value } : cat)))
    } else {
      alert(result.error)
      onRefresh() // Revert on error
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Delete this entire category and all its items?")) return
    const result = await quickDeleteCategory(categoryId)
    if (result.success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    } else {
      alert(result.error)
    }
  }

  const handleAddCategory = async () => {
    const result = await quickAddCategory(restaurant.id, "New Category")
    if (result.success && result.category) {
      setCategories((prev) => [...prev, { ...result.category, menu_items: [] }])
    } else {
      alert(result.error)
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

      // Update restaurant logo in database
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ logo_url: publicUrl })
        .eq('id', restaurant.id)

      if (updateError) throw updateError

      // Update local state would require parent component refresh
      onRefresh()
    } catch (error) {
      console.error('Logo upload error:', error)
      alert('فشل في رفع الشعار. حاول مرة أخرى.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleLoadDummyData = async () => {
    if (!confirm("هل تريد تحميل بيانات تجريبية؟ سيتم إضافة أقسام وعناصر جديدة للقائمة.")) return
    
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
            display_order: categories.length + dummyData.categories.indexOf(category)
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
              category_id: newCategory.id,
              name: item.name,
              description: item.description,
              price: item.price,
              is_available: item.is_available !== false, // Default to true if not specified
              is_featured: item.is_featured || false,
              dietary_info: item.dietary_info || [],
              display_order: category.menu_items.indexOf(item),
              image_url: null // Add default null value
            })

          if (itemError) {
            console.error('Error creating item:', itemError)
          }
        }
      }

      // Refresh the menu
      onRefresh()
      alert('تم تحميل البيانات التجريبية بنجاح!')
    } catch (error: any) {
      console.error('Error loading dummy data:', error)
      alert(`فشل في تحميل البيانات التجريبية: ${error.message}`)
    } finally {
      setIsLoadingDummy(false)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="text-center mb-12 border-b-2 border-amber-600 pb-8 flex flex-col items-center justify-center">
            <div className="mb-4">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-600 flex items-center justify-center shadow-lg overflow-hidden relative group">
                {restaurant.logo_url ? (
                  <Image
                    src={restaurant.logo_url || "/placeholder.svg"}
                    alt={`${restaurant.name} logo`}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-serif">
                    {restaurant.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="h-6 w-6 text-white" />
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
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
            <InlineEditable
              value={restaurant.name}
              onSave={(value) => console.log("Restaurant name update not implemented yet:", value)}
              className="text-5xl font-serif text-gray-800 mb-3 text-center"
              inputClassName="text-center"
              placeholder="اسم المطعم"
            />
            <InlineEditable
              value="Fine Dining & Artisan Coffee"
              onSave={(value) => console.log("Subtitle update:", value)}
              className="text-gray-600 text-lg italic mb-2 text-center"
              inputClassName="text-center"
              placeholder="وصف المطعم"
            />
            <InlineEditable
              value="Est. 2018 | Farm to Table | Locally Sourced"
              onSave={(value) => console.log("Tagline update:", value)}
              className="text-sm text-gray-500 text-center"
              inputClassName="text-center"
              placeholder="شعار المطعم"
            />
          </div>

          {/* Pagination Toggle */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowPagination(!showPagination)}
                  variant="outline"
                  size="sm"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  {showPagination ? "عرض متواصل" : "عرض صفحات"}
                </Button>
                <span className="text-sm text-gray-600">
                  {showPagination ? `صفحة ${currentPage} من ${totalPages}` : `إجمالي ${categories.length} أقسام`}
                </span>
              </div>
              
              {showPagination && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    variant="outline"
                    size="sm"
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="sm"
                  >
                    التالي
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Menu Controls */}
          {categories.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Always show pagination toggle if there's content */}
                <Button
                  onClick={() => setShowPagination(!showPagination)}
                  variant="outline"
                  size="sm"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  {showPagination ? "عرض متواصل" : "عرض صفحات"}
                </Button>
                <span className="text-sm text-gray-600">
                  إجمالي {categories.length} أقسام
                  {showPagination && ` • صفحة ${currentPage} من ${totalPages}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
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
                
                {/* Pagination Toggle Button */}
                {totalPages > 1 && (
                  <Button
                    onClick={() => setShowPagination(!showPagination)}
                    variant={showPagination ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    {showPagination ? "📄 نمط PDF" : "📋 نمط متصل"}
                  </Button>
                )}
                
                {/* Show navigation only when pagination is enabled and there are multiple pages */}
                {showPagination && totalPages > 1 && (
                  <>
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      variant="outline"
                      size="sm"
                    >
                      السابق
                    </Button>
                    <span className="text-sm text-gray-600 px-3">
                      صفحة {currentPage} / {totalPages}
                    </span>
                    <span className="text-xs text-gray-400 px-2">
                      ({currentPageCategories.length} أقسام)
                    </span>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      variant="outline"
                      size="sm"
                    >
                      التالي
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Menu Content */}
          <div className="bg-white shadow-xl rounded-lg" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <div className="p-12">
              {categories.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <div className="text-8xl mb-6">🍽️</div>
                  <h3 className="text-2xl font-semibold mb-4 text-slate-600">Your menu awaits</h3>
                  <p className="text-lg mb-6">Start building your delicious menu</p>
                  <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={handleAddCategory}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add First Category
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
                  {/* Show categories with page break indicators */}
                  {(showPagination && totalPages > 1 ? currentPageCategories : categories).map((category, index) => {
                    // Calculate the original index for page break detection
                    const originalIndex = showPagination && totalPages > 1 
                      ? categories.findIndex(c => c.id === category.id) 
                      : index;
                    const isPageBreak = pageBreaks.includes(originalIndex);
                    
                    return (
                      <div key={category.id}>
                                                 {/* Page Break Indicator */}
                         {isPageBreak && originalIndex > 0 && !showPagination && (
                           <div className="my-8 relative">
                             <div className="absolute inset-0 flex items-center">
                               <div className="w-full border-t-2 border-dashed border-blue-400"></div>
                             </div>
                             <div className="relative flex justify-center text-sm">
                               <span className="bg-white px-4 py-2 text-blue-600 font-medium rounded-full border border-blue-200 shadow-sm">
                                 📄 صفحة جديدة في PDF - Page {pageBreaks.indexOf(originalIndex) + 1}
                               </span>
                             </div>
                           </div>
                         )}
                        
                        <div onDrop={() => handleDropItem(category.id)}>
                      <MenuSectionPreview
                        title={category.name}
                        sectionData={category}
                        columns={
                          category.name.toLowerCase().includes("appetizer") ||
                          category.name.toLowerCase().includes("starter") ||
                          category.name.toLowerCase().includes("beverage") ||
                          category.name.toLowerCase().includes("dessert")
                            ? 2
                            : 1
                        }
                        onAddItem={handleAddItem}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                        moveItem={moveItem}
                        onUpdateCategory={handleUpdateCategory}
                        onDeleteCategory={handleDeleteCategory}
                      />
                    </div>
                      </div>
                    );
                  })}
                  
                  {/* Add Category Button */}
                  {(!showPagination || currentPage === totalPages) && (
                  <div className="text-center py-8 border-t-2 border-gray-200">
                    <Button
                      onClick={handleAddCategory}
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Category
                    </Button>
                  </div>
                  )}
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
                    value="Hours"
                    onSave={(value) => console.log("Hours title update:", value)}
                    className="font-serif text-gray-800 mb-2 block text-center"
                    placeholder="عنوان الساعات"
                  />
                  <InlineEditable
                    value="Monday - Thursday: 7:00 AM - 9:00 PM"
                    onSave={(value) => console.log("Hours 1 update:", value)}
                    className="block text-center"
                    placeholder="ساعات العمل"
                  />
                  <InlineEditable
                    value="Friday - Saturday: 7:00 AM - 10:00 PM"
                    onSave={(value) => console.log("Hours 2 update:", value)}
                    className="block text-center"
                    placeholder="ساعات نهاية الأسبوع"
                  />
                  <InlineEditable
                    value="Sunday: 8:00 AM - 8:00 PM"
                    onSave={(value) => console.log("Hours 3 update:", value)}
                    className="block text-center"
                    placeholder="ساعات الأحد"
                  />
                </div>
                <div>
                  <InlineEditable
                    value="Location"
                    onSave={(value) => console.log("Location title update:", value)}
                    className="font-serif text-gray-800 mb-2 block text-center"
                    placeholder="عنوان الموقع"
                  />
                  <InlineEditable
                    value="425 Heritage Boulevard"
                    onSave={(value) => console.log("Address 1 update:", value)}
                    className="block text-center"
                    placeholder="العنوان الأول"
                  />
                  <InlineEditable
                    value="Downtown Arts District"
                    onSave={(value) => console.log("Address 2 update:", value)}
                    className="block text-center"
                    placeholder="المنطقة"
                  />
                  <InlineEditable
                    value="Reservations: (555) 234-5678"
                    onSave={(value) => console.log("Phone update:", value)}
                    className="block text-center"
                    placeholder="رقم الهاتف"
                  />
                </div>
                <div>
                  <InlineEditable
                    value="Notes"
                    onSave={(value) => console.log("Notes title update:", value)}
                    className="font-serif text-gray-800 mb-2 block text-center"
                    placeholder="عنوان الملاحظات"
                  />
                  <InlineEditable
                    value="Gluten-free options available"
                    onSave={(value) => console.log("Note 1 update:", value)}
                    className="block text-center"
                    placeholder="ملاحظة 1"
                  />
                  <InlineEditable
                    value="Locally sourced ingredients"
                    onSave={(value) => console.log("Note 2 update:", value)}
                    className="block text-center"
                    placeholder="ملاحظة 2"
                  />
                  <InlineEditable
                    value="18% gratuity added to parties of 6+"
                    onSave={(value) => console.log("Note 3 update:", value)}
                    className="block text-center"
                    placeholder="ملاحظة 3"
                  />
                </div>
              </div>
            </div>

            <InlineEditable
              value="Please inform your server of any allergies or dietary restrictions"
              onSave={(value) => console.log("Footer note update:", value)}
              className="text-xs text-gray-500 italic text-center"
              placeholder="ملاحظة الحساسية"
            />
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
