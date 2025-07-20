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

interface CocktailMenuTemplateProps {
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

export default function CocktailMenuTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: CocktailMenuTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="cocktail-menu-template min-h-[1123px] p-8 relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-black text-white mb-4 tracking-wider">
              {restaurant.name?.toUpperCase() || "COCKTAIL BAR"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-F59E0B to-transparent mx-auto mb-6"></div>
            <p className="text-2xl font-medium text-blue-200 tracking-wide">
              {isRTL ? 'بار كوكتيل عصري' : 'MODERN COCKTAIL BAR'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="mb-8">
                <h2 className="text-4xl font-black text-white text-center tracking-wider border-b-2 border-F59E0B pb-4">
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-white/10 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-blue-200 mt-2 italic">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black text-F59E0B">
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
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <p className="text-lg font-medium text-white">
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-2xl font-black text-F59E0B mt-2">
              6:00 PM - 2:00 AM
            </p>
            <p className="text-sm text-blue-200 mt-4">
              {isRTL ? 'مشروبات كحولية للبالغين فقط' : 'ADULTS ONLY - ALCOHOLIC BEVERAGES'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 