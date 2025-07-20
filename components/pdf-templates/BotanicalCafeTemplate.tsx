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

interface BotanicalCafeTemplateProps {
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

export default function BotanicalCafeTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: BotanicalCafeTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="botanical-cafe-template min-h-[1123px] p-8 relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-200 to-transparent rounded-full opacity-30 -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-200 to-transparent rounded-full opacity-20 translate-y-48 -translate-x-48"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-black text-green-800 mb-4 tracking-wider" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {restaurant.name?.toUpperCase() || "BOTANICAL CAFE"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-green-600 to-transparent mx-auto mb-6"></div>
            <p className="text-2xl font-medium text-green-600 tracking-wide" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {isRTL ? 'مقهى نباتي أنيق' : 'ELEGANT BOTANICAL CAFE'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-green-200">
              <div className="mb-8">
                <h2 className="text-4xl font-black text-green-800 text-center tracking-wider border-b-2 border-green-300 pb-4" style={{
                  fontFamily: 'Georgia, serif'
                }}>
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-green-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-700 uppercase tracking-wide" style={{
                        fontFamily: 'Georgia, serif'
                      }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-green-600 mt-2 italic" style={{
                          fontFamily: 'Georgia, serif'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black text-green-600" style={{
                        fontFamily: 'Georgia, serif'
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-200">
            <p className="text-lg font-medium text-green-600" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-2xl font-black text-green-800 mt-2" style={{
              fontFamily: 'Georgia, serif'
            }}>
              8:00 AM - 8:00 PM
            </p>
            <p className="text-sm text-green-500 mt-4" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {isRTL ? 'مكونات طازجة وعضوية' : 'FRESH & ORGANIC INGREDIENTS'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 