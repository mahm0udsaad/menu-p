"use client"

import React from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMenuEditor } from '@/contexts/menu-editor-context'

interface MenuHeaderProps {
  isEmpty: boolean
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({ isEmpty }) => {
  const {
    restaurant,
    handleLogoUpload,
    isUploadingLogo,
  } = useMenuEditor()

  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-gray-50">
            {restaurant.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Upload className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
            <p className="text-sm text-gray-500">{restaurant.category}</p>
          </div>
        </div>

        {/* Logo Upload Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploadingLogo}
            />
            <Button 
              variant="outline" 
              disabled={isUploadingLogo}
              className="flex items-center gap-2"
            >
              {isUploadingLogo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {restaurant.logo_url ? 'تغيير الشعار' : 'رفع الشعار'}
            </Button>
          </div>
        </div>
      </div>

      {isEmpty && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ابدأ في إنشاء قائمتك
            </h3>
            <p className="text-gray-600 mb-4">
              لا توجد أقسام في قائمتك بعد. استخدم الأزرار الجانبية لتخصيص التصميم أو إضافة بيانات تجريبية للبدء.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 