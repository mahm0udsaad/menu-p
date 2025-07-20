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

interface LuxuryMenuTemplateProps {
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

export default function LuxuryMenuTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: LuxuryMenuTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="luxury-menu-template min-h-[1123px] p-8 relative bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-FFD700 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-FFD700 to-transparent"></div>
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-FFD700 to-transparent"></div>
      <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-FFD700 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-20">
          <div className="mb-12">
            <h1 className="text-7xl font-black text-FFD700 mb-6 tracking-widest drop-shadow-2xl" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {restaurant.name?.toUpperCase() || "LUXURY DINING"}
            </h1>
            <div className="w-48 h-1 bg-gradient-to-r from-transparent via-FFD700 to-transparent mx-auto mb-8"></div>
            <p className="text-2xl font-medium text-white tracking-wide" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {isRTL ? 'تجربة طعام فاخرة' : 'PREMIUM DINING EXPERIENCE'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-10 shadow-2xl border border-FFD700/30">
              <div className="mb-10">
                <h2 className="text-4xl font-black text-FFD700 text-center tracking-wider border-b-2 border-FFD700/50 pb-6" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-8">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-6 border-b border-gray-700 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white uppercase tracking-wide" style={{
                        fontFamily: 'Playfair Display, serif'
                      }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-300 mt-3 italic" style={{
                          fontFamily: 'Playfair Display, serif'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-3xl font-black text-FFD700" style={{
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
        <div className="mt-24 text-center">
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-10 border border-FFD700/30">
            <p className="text-lg font-medium text-white" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-3xl font-black text-FFD700 mt-2" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              6:00 PM - 11:00 PM
            </p>
            <p className="text-sm text-gray-400 mt-4" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              {isRTL ? 'حجز مسبق مطلوب' : 'ADVANCE RESERVATION REQUIRED'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 