"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QrCode, Calendar, CheckCircle, X, Menu, Languages, ArrowRight, Users } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

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
  }
]

interface MenuVersion {
  id: string
  menu_name: string
  language: string
  created_at: string
  item_count: number
  restaurant_name: string
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
  const [loading, setLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (isOpen && menuId) {
      fetchMenuVersions()
    }
  }, [isOpen, menuId])

  const fetchMenuVersions = async () => {
    try {
      setLoading(true)
      
      // First get the base menu info
      const { data: baseMenu, error: baseError } = await supabase
        .from("published_menus")
        .select(`
          id,
          menu_name,
          language,
          created_at,
          restaurants (
            name
          )
        `)
        .eq("id", menuId)
        .single()

      if (baseError) throw baseError

      // Then get all language versions for this restaurant with the same menu name
      const { data: versions, error: versionsError } = await supabase
        .from("published_menus")
        .select(`
          id,
          menu_name,
          language,
          created_at,
          restaurants!inner (
            name
          ),
          menu_categories (
            menu_items (
              id
            )
          )
        `)
        .eq("restaurants.id", baseMenu.restaurants?.id)
        .eq("menu_name", baseMenu.menu_name)
        .order("created_at", { ascending: false })

      if (versionsError) throw versionsError

      const formattedVersions: MenuVersion[] = versions.map(version => ({
        id: version.id,
        menu_name: version.menu_name,
        language: version.language || 'ar',
        created_at: version.created_at,
        item_count: version.menu_categories?.reduce((total, category) => 
          total + (category.menu_items?.length || 0), 0) || 0,
        restaurant_name: version.restaurants?.name || ''
      }))

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Languages className="h-5 w-5" />
            اختر اللغة / Choose Language
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : menuVersions.length === 1 ? (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Globe className="h-12 w-12 mx-auto text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                جاري تحميل القائمة... / Loading menu...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h3 className="font-medium">
                  {menuVersions[0]?.restaurant_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  القائمة متوفرة بلغات متعددة / Menu available in multiple languages
                </p>
              </div>

              <div className="space-y-3">
                {menuVersions.map((version) => {
                  const languageInfo = getLanguageInfo(version.language)
                  return (
                    <Card 
                      key={version.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleLanguageSelection(version.id, version.language)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{languageInfo.flag}</span>
                            <div>
                              <div className="font-medium">
                                {languageInfo.nativeName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {languageInfo.name}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {version.item_count} items
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  انقر على اللغة المفضلة لعرض القائمة
                  <br />
                  Click your preferred language to view the menu
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 