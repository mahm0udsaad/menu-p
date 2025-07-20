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

interface InteractiveMenuTemplateProps {
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

export default function InteractiveMenuTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: InteractiveMenuTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="interactive-menu-template min-h-[1123px] p-8 relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-black text-blue-900 mb-4 tracking-wider">
              {restaurant.name?.toUpperCase() || "INTERACTIVE MENU"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-10B981 to-transparent mx-auto mb-6"></div>
            <p className="text-2xl font-medium text-blue-700 tracking-wide">
              {isRTL ? 'قائمة تفاعلية' : 'INTERACTIVE MENU'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-blue-200">
              <div className="mb-8">
                <h2 className="text-4xl font-black text-blue-900 text-center tracking-wider border-b-2 border-blue-300 pb-4">
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-blue-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-800 uppercase tracking-wide">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-blue-600 mt-2 italic">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black text-10B981">
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
        <div className="mt-20 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-200">
            <p className="text-lg font-medium text-blue-700">
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-2xl font-black text-blue-900 mt-2">
              8:00 AM - 10:00 PM
            </p>
            <p className="text-sm text-blue-500 mt-4">
              {isRTL ? 'تجربة تفاعلية فريدة' : 'UNIQUE INTERACTIVE EXPERIENCE'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 