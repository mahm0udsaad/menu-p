"use client"

import React from 'react';

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  background_image_url?: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  currency?: string
  color_palette?: {
    id: string
    name: string
    primary: string
    secondary: string
    accent: string
  } | null
}

interface SimpleCoffeeTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  appliedFontSettings?: {
    arabic: { font: string; weight: string }
    english: { font: string; weight: string }
  }
  appliedPageBackgroundSettings?: {
    backgroundColor: string
    backgroundImage: string | null
    backgroundType: 'solid' | 'image' | 'gradient'
    gradientFrom: string
    gradientTo: string
    gradientDirection: 'to-b' | 'to-br' | 'to-r' | 'to-tr'
  }
  appliedRowStyles?: any
  currentLanguage?: string
}

export default function SimpleCoffeeTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: SimpleCoffeeTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="simple-coffee-template min-h-[1123px] p-8 relative bg-gradient-to-br from-amber-50 via-orange-50 to-brown-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-brown-800 mb-4 tracking-wide">
              {restaurant.name?.toUpperCase() || "SIMPLE COFFEE"}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brown-600 to-transparent mx-auto mb-6"></div>
            <p className="text-xl font-medium text-brown-600 tracking-wide">
              {isRTL ? 'قائمة قهوة بسيطة' : 'SIMPLE COFFEE MENU'}
            </p>
          </div>
        </header>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-brown-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brown-800 text-center tracking-wide border-b-2 border-brown-300 pb-3">
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-4">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-brown-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brown-700 uppercase tracking-wide">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-brown-600 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xl font-bold text-brown-800">
                        {currency}{item.price?.toFixed(0) || '0'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-brown-200">
            <p className="text-lg font-medium text-brown-600">
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-2xl font-bold text-brown-800">
              7:00 AM - 8:00 PM
            </p>
            <p className="text-sm text-brown-500 mt-2">
              {isRTL ? 'قهوة طازجة يومياً' : 'FRESH COFFEE DAILY'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 