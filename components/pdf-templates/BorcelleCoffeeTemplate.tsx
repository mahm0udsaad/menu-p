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

interface BorcelleCoffeeTemplateProps {
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

export default function BorcelleCoffeeTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: BorcelleCoffeeTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="borcelle-coffee-template min-h-[1123px] p-8 relative bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            {restaurant.logo_url && (
              <div className="mb-6">
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.name} 
                  className="w-24 h-24 mx-auto object-contain rounded-full shadow-lg"
                />
              </div>
            )}
            <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-wider" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {restaurant.name?.toUpperCase() || "BORCELLE"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-DAA520 to-transparent mx-auto mb-6"></div>
            <p className="text-2xl font-medium text-gray-700 tracking-wide" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {isRTL ? 'مقهى بورسيل' : 'COFFEE SHOP'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 text-center tracking-wider border-b-2 border-gray-300 pb-4" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide" style={{
                        fontFamily: 'Playfair Display, serif'
                      }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 italic" style={{
                          fontFamily: 'Playfair Display, serif'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black text-DAA520" style={{
                        fontFamily: 'Playfair Display, serif'
                      }}>
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
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <p className="text-lg font-medium text-gray-700" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-2" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              7:00 AM - 10:00 PM
            </p>
            <p className="text-sm text-gray-500 mt-4" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {isRTL ? 'قهوة عالية الجودة' : 'PREMIUM COFFEE QUALITY'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 