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
    <div className=" bg-white p-8 flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Logo Section */}
        <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-50 mb-4">
          {restaurant.logo_url ? (
            <img 
              src={restaurant.logo_url} 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Upload className="h-8 w-8" />
            </div>
          )}
        </div>
        
        {/* Restaurant Info */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
          <p className="text-lg text-gray-600">{restaurant.category}</p>
        </div>

        {/* Logo Upload Button */}
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
  )
}