"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Languages, Globe, Users, ArrowRight, MapPin, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
}

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr'
  }
]

interface MenuVersion {
  id: string
  menu_name: string
  language: string
  created_at: string
  item_count: number
  restaurant_name: string
  restaurant_logo: string | null
  restaurant_category: string
}

interface QrMenuSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  menuId: string
  onLanguageSelect: (menuId: string, language: string) => void
}

export default function QrMenuSelectionModal({
  isOpen,
  onClose,
  menuId,
  onLanguageSelect
}: QrMenuSelectionModalProps) {
  const [menuVersions, setMenuVersions] = useState<MenuVersion[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchMenuVersions()
    }
  }, [isOpen, menuId])

  const fetchMenuVersions = async () => {
    setLoading(true)
    try {
      // First get the current menu to find restaurant info
      const { data: currentMenu } = await supabase
        .from("published_menus")
        .select('menu_name, restaurant_id')
        .eq("id", menuId)
        .single()

      if (!currentMenu) return

      // Get restaurant info separately
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select('id, name, logo_url, category')
        .eq("id", currentMenu.restaurant_id)
        .single()

      if (!restaurant) return

      // Get all language versions of this menu
      const { data: versions } = await supabase
        .from("published_menus")
        .select(`
          id,
          menu_name,
          language_code,
          created_at
        `)
        .eq("restaurant_id", currentMenu.restaurant_id)
        .eq("menu_name", currentMenu.menu_name)

      if (!versions) return

      // Get menu categories to count items for each version
      const versionIds = versions.map(v => v.id)
      const { data: categories } = await supabase
        .from("menu_categories")
        .select(`
          id,
          menu_items (id)
        `)
        .in("restaurant_id", [currentMenu.restaurant_id])

      const formattedVersions: MenuVersion[] = versions.map(version => {
        // Count items for this version (simplified - all versions share same categories for now)
        const itemCount = categories?.reduce((total, category) => 
          total + (category.menu_items?.length || 0), 0) || 0

        return {
        id: version.id,
        menu_name: version.menu_name,
          language: version.language_code || 'ar',
        created_at: version.created_at,
          item_count: itemCount,
          restaurant_name: restaurant.name,
          restaurant_logo: restaurant.logo_url,
          restaurant_category: restaurant.category
        }
      })

      setMenuVersions(formattedVersions)
      
      // Auto-select current menu if only one version exists
      if (formattedVersions.length === 1) {
        setSelectedLanguage(formattedVersions[0].language)
        setTimeout(() => {
          onLanguageSelect(formattedVersions[0].id, formattedVersions[0].language)
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error("Error fetching menu versions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageSelection = (menuId: string, language: string) => {
    setSelectedLanguage(language)
    onLanguageSelect(menuId, language)
    onClose()
  }

  const getLanguageInfo = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0]
  }

  const getCategoryText = (category: string) => {
    switch(category) {
      case 'both': return 'مطعم ومقهى / Restaurant & Café'
      case 'restaurant': return 'مطعم / Restaurant'
      case 'cafe': return 'مقهى / Café'
      default: return category
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg mx-auto bg-gradient-to-br from-red-50 via-white to-rose-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Languages className="h-5 w-5 text-red-600" />
            <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent font-bold">
            اختر اللغة / Choose Language
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : menuVersions.length === 1 ? (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Globe className="h-12 w-12 mx-auto text-red-500" />
              </div>
              <p className="text-sm text-gray-600">
                جاري تحميل القائمة... / Loading menu...
              </p>
            </div>
          ) : (
            <>
              {/* Restaurant Header */}
              <div className="text-center space-y-4 pb-4 border-b border-red-200">
                <div className="flex items-center justify-center gap-4">
                  {menuVersions[0]?.restaurant_logo ? (
                    <Image
                      src={menuVersions[0].restaurant_logo}
                      alt={`${menuVersions[0].restaurant_name} logo`}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover border-2 border-red-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-15 h-15 bg-gradient-to-br from-red-100 to-rose-100 rounded-lg flex items-center justify-center border-2 border-red-200">
                      <Globe className="h-8 w-8 text-red-600" />
                    </div>
                  )}
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900">
                  {menuVersions[0]?.restaurant_name}
                </h3>
                    <p className="text-sm text-gray-600">
                      {getCategoryText(menuVersions[0]?.restaurant_category || '')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>متوفرة بـ {menuVersions.length} لغات</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>محدّثة حديثاً</span>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 text-center">
                  اختر لغتك المفضلة / Choose your preferred language
                </h4>

              <div className="space-y-3">
                {menuVersions.map((version) => {
                  const languageInfo = getLanguageInfo(version.language)
                  return (
                    <Card 
                      key={version.id}
                        className="cursor-pointer hover:bg-red-50 transition-all duration-200 border-2 hover:border-red-300 hover:shadow-md"
                      onClick={() => handleLanguageSelection(version.id, version.language)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {languageInfo.flag}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {languageInfo.nativeName}
                                </div>
                                <div className="text-sm text-gray-600">
                                {languageInfo.name}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                              <Users className="h-3 w-3 mr-1" />
                                  {version.item_count} عنصر
                            </Badge>
                              </div>
                              <ArrowRight className="h-5 w-5 text-red-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                </div>
              </div>

              {/* Footer Message */}
              <div className="text-center bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-lg border border-red-200">
                <p className="text-xs text-gray-600">
                  انقر على اللغة المفضلة لعرض القائمة
                  <br />
                  <span className="text-red-600 font-medium">Click your preferred language to view the menu</span>
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 