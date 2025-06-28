"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, Calendar, CheckCircle, X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
  category_id: string
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface PreviousMenu {
  id: string
  menu_name: string
  created_at: string
  categories: MenuCategory[]
  total_items: number
}

interface MenuImportModalProps {
  isOpen: boolean
  onClose: () => void
  restaurantId: string
  onImportComplete: (importedCategories: MenuCategory[]) => void
}

export default function MenuImportModal({ 
  isOpen, 
  onClose, 
  restaurantId, 
  onImportComplete 
}: MenuImportModalProps) {
  const [previousMenus, setPreviousMenus] = useState<PreviousMenu[]>([])
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (isOpen) {
      fetchPreviousMenus()
    }
  }, [isOpen, restaurantId])

  const fetchPreviousMenus = async () => {
    try {
      setLoading(true)
      
      // Get published menus for this restaurant
      const { data: menus, error: menusError } = await supabase
        .from("published_menus")
        .select("id, menu_name, created_at")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })

      if (menusError) throw menusError

      if (!menus || menus.length === 0) {
        setPreviousMenus([])
        return
      }

      // Get categories and items for each menu
      const menusWithData = await Promise.all(
        menus.map(async (menu) => {
          const { data: categories, error: categoriesError } = await supabase
            .from("menu_categories")
            .select(`
              id,
              name,
              description,
              menu_items (
                id,
                name,
                description,
                price,
                image_url,
                is_available,
                is_featured,
                dietary_info,
                category_id
              )
            `)
            .eq("restaurant_id", restaurantId)
            .eq("is_active", true)

          if (categoriesError) {
            console.error("Error fetching categories:", categoriesError)
            return {
              ...menu,
              categories: [],
              total_items: 0
            }
          }

          const validCategories = categories?.filter(cat => 
            cat.menu_items && cat.menu_items.length > 0
          ) || []

          const totalItems = validCategories.reduce((sum, cat) => 
            sum + (cat.menu_items?.length || 0), 0
          )

          return {
            ...menu,
            categories: validCategories,
            total_items: totalItems
          }
        })
      )

      setPreviousMenus(menusWithData.filter(menu => menu.total_items > 0))
    } catch (error) {
      console.error("Error fetching previous menus:", error)
      toast.error("فشل في تحميل القوائم السابقة")
    } finally {
      setLoading(false)
    }
  }

  const handleMenuSelect = (menuId: string, checked: boolean) => {
    const newSelectedMenus = new Set(selectedMenus)
    const newSelectedCategories = new Set(selectedCategories)

    if (checked) {
      newSelectedMenus.add(menuId)
      // Add all categories from this menu
      const menu = previousMenus.find(m => m.id === menuId)
      menu?.categories.forEach(cat => newSelectedCategories.add(cat.id))
    } else {
      newSelectedMenus.delete(menuId)
      // Remove all categories from this menu
      const menu = previousMenus.find(m => m.id === menuId)
      menu?.categories.forEach(cat => newSelectedCategories.delete(cat.id))
    }

    setSelectedMenus(newSelectedMenus)
    setSelectedCategories(newSelectedCategories)
  }

  const handleCategorySelect = (categoryId: string, menuId: string, checked: boolean) => {
    const newSelectedCategories = new Set(selectedCategories)
    const newSelectedMenus = new Set(selectedMenus)

    if (checked) {
      newSelectedCategories.add(categoryId)
    } else {
      newSelectedCategories.delete(categoryId)
      // If no categories from this menu are selected, unselect the menu
      const menu = previousMenus.find(m => m.id === menuId)
      const hasSelectedCategories = menu?.categories.some(cat => 
        cat.id === categoryId ? false : newSelectedCategories.has(cat.id)
      )
      if (!hasSelectedCategories) {
        newSelectedMenus.delete(menuId)
      }
    }

    setSelectedCategories(newSelectedCategories)
    setSelectedMenus(newSelectedMenus)
  }

  const handleImport = async () => {
    if (selectedCategories.size === 0) {
      toast.error("يرجى اختيار فئة واحدة على الأقل للاستيراد")
      return
    }

    try {
      setImporting(true)

      // Collect all selected categories with their items
      const categoriesToImport: MenuCategory[] = []
      
      previousMenus.forEach(menu => {
        if (selectedMenus.has(menu.id)) {
          menu.categories.forEach(category => {
            if (selectedCategories.has(category.id)) {
              categoriesToImport.push(category)
            }
          })
        }
      })

      onImportComplete(categoriesToImport)
      toast.success(`تم استيراد ${categoriesToImport.length} فئة بنجاح`)
      onClose()
    } catch (error) {
      console.error("Error importing menu items:", error)
      toast.error("فشل في استيراد العناصر")
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-400" />
            استيراد منتجات من قائمة سابقة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            </div>
          ) : previousMenus.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">لا توجد قوائم سابقة</h3>
              <p className="text-slate-400">ابدأ بإنشاء قائمتك الأولى من الصفر</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-slate-300">
                  اختر القوائم والفئات التي تريد استيراد منتجاتها
                </p>
                <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                  {selectedCategories.size} فئة محددة
                </Badge>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {previousMenus.map((menu) => (
                    <Card key={menu.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Menu Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <Checkbox
                                id={`menu-${menu.id}`}
                                checked={selectedMenus.has(menu.id)}
                                onCheckedChange={(checked) => 
                                  handleMenuSelect(menu.id, checked as boolean)
                                }
                              />
                              <div>
                                <h3 className="font-semibold text-white">{menu.menu_name}</h3>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(menu.created_at).toLocaleDateString("ar-SA")}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {menu.total_items} منتج
                            </Badge>
                          </div>

                          {/* Categories */}
                          {selectedMenus.has(menu.id) && (
                            <div className="ml-6 space-y-2">
                              {menu.categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                                  <div className="flex items-center space-x-3 space-x-reverse">
                                    <Checkbox
                                      id={`category-${category.id}`}
                                      checked={selectedCategories.has(category.id)}
                                      onCheckedChange={(checked) => 
                                        handleCategorySelect(category.id, menu.id, checked as boolean)
                                      }
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-white">{category.name}</p>
                                      {category.description && (
                                        <p className="text-xs text-slate-400">{category.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="bg-slate-600 text-slate-200">
                                    {category.menu_items?.length || 0} منتج
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  onClick={handleImport}
                  disabled={selectedCategories.size === 0 || importing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      استيراد الفئات المحددة
                    </>
                  )}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  إلغاء
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 