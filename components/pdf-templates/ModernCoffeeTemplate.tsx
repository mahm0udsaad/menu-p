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

interface ModernCoffeeTemplateProps {
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

export default function ModernCoffeeTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: ModernCoffeeTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="modern-coffee-template min-h-[1123px] p-8 relative bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-400 to-transparent rounded-full opacity-30 -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-400 to-transparent rounded-full opacity-20 translate-y-48 -translate-x-48"></div>

      {/* Coffee Bean Decorations */}
      <div className="absolute left-8 top-32 w-32 h-32 opacity-20">
        <div className="w-full h-full bg-amber-800 rounded-full relative">
          <div className="absolute inset-2 bg-amber-900 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-amber-600 transform -translate-x-1/2 -translate-y-1/2 rotate-12"></div>
        </div>
      </div>
      <div className="absolute left-16 bottom-32 w-24 h-24 opacity-15">
        <div className="w-full h-full bg-amber-800 rounded-full relative">
          <div className="absolute inset-2 bg-amber-900 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-amber-600 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
      </div>

      {/* Modern Coffee Container */}
      <div className="relative w-full min-h-full max-w-4xl mx-auto">
        {/* Modern Coffee Header */}
        <header className="modern-coffee-header text-left mb-12 relative">
          <div className="mb-8">
            <h1 className="modern-coffee-title text-4xl font-bold text-gray-900 mb-2 tracking-wide">
              {restaurant.name?.toUpperCase() || "BORCELLE"}
            </h1>
            <p className="modern-coffee-subtitle text-lg text-gray-700 font-medium tracking-wider">
              COFFEESHOP
            </p>
          </div>
          <div className="text-right">
            <h2 className="modern-coffee-menu-text text-8xl font-black text-gray-900 tracking-tight">
              {isRTL ? 'قائمة الطعام' : 'MENU'}
            </h2>
          </div>
        </header>

        {/* Modern Coffee Categories */}
        <div className="modern-coffee-categories space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="modern-coffee-category relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-200">
              <div className="mb-6">
                <h3 className="modern-coffee-category-title text-3xl font-black text-gray-900 tracking-wider">
                  {category.name.toUpperCase()}
                </h3>
              </div>

              <div className="modern-coffee-items space-y-4">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="modern-coffee-item group/item">
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3 flex-1">
                        <h4 className="modern-coffee-item-name text-lg font-semibold text-gray-900 uppercase tracking-wide">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="modern-coffee-item-description text-sm text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="modern-coffee-item-price text-xl font-bold text-gray-900">
                          {currency}{item.price?.toFixed(0) || '0'}
                        </div>
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
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
            <p className="text-gray-700 font-medium">
              {isRTL ? 'متاح من' : 'Available at'}
            </p>
            <p className="text-gray-900 font-bold text-lg">
              9:00 am - 10:00 pm
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 