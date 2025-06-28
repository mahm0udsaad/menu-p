"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, ArrowRight, Building2 } from "lucide-react"
import Image from "next/image"

interface LanguageVersion {
  id: string
  language_code: string
  menu_name: string
  version_name: string
}

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
  category: string
}

interface LanguageSelectionClientProps {
  restaurant: Restaurant
  languageVersions: LanguageVersion[]
  originalMenuId: string
}

export default function LanguageSelectionClient({
  restaurant,
  languageVersions,
  originalMenuId
}: LanguageSelectionClientProps) {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")

  const getLanguageInfo = (langCode: string) => {
    const languageMap: { [key: string]: { flag: string; name: string; nativeName: string } } = {
      'ar': { flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
      'en': { flag: '🇺🇸', name: 'English', nativeName: 'English' },
      'fr': { flag: '🇫🇷', name: 'French', nativeName: 'Français' },
      'es': { flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' }
    }
    return languageMap[langCode] || { flag: '🌐', name: langCode, nativeName: langCode }
  }

  const handleLanguageSelect = (languageCode: string, menuId: string) => {
    router.push(`/menus/${menuId}?lang=${languageCode}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Restaurant Header */}
          <Card className="mb-8 border-red-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center space-y-4">
                {restaurant.logo_url ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-200">
                    <Image
                      src={restaurant.logo_url}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-red-600" />
                  </div>
                )}
                
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                    {restaurant.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Language Selection */}
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Globe className="h-6 w-6 text-red-600" />
                <CardTitle className="text-xl font-bold text-gray-900">
                  اختر لغة القائمة
                </CardTitle>
              </div>
              <p className="text-gray-600">
                هذه القائمة متوفرة بعدة لغات. اختر اللغة المفضلة لديك:
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {languageVersions.map((version) => {
                const langInfo = getLanguageInfo(version.language_code)
                const isSelected = selectedLanguage === version.language_code
                
                return (
                  <Button
                    key={version.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      w-full p-6 h-auto justify-between transition-all duration-200
                      ${isSelected 
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                        : 'border-red-200 hover:border-red-300 hover:bg-red-50'
                      }
                    `}
                    onClick={() => handleLanguageSelect(version.language_code, version.id)}
                    onMouseEnter={() => setSelectedLanguage(version.language_code)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{langInfo.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold text-lg">
                          {langInfo.nativeName}
                        </p>
                        <p className={`text-sm ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
                          {version.version_name || langInfo.name}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              يمكنك تغيير اللغة في أي وقت أثناء تصفح القائمة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 