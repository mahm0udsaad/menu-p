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

interface VintageCoffeeTemplateProps {
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

export default function VintageCoffeeTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: VintageCoffeeTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="vintage-coffee-template min-h-[1123px] p-8 relative bg-gradient-to-br from-amber-50 via-orange-50 to-brown-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-black text-brown-800 mb-4 tracking-wider" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {restaurant.name?.toUpperCase() || "VINTAGE COFFEE"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-brown-600 to-transparent mx-auto mb-6"></div>
            <p className="text-2xl font-medium text-brown-600 tracking-wide" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {isRTL ? 'قهوة كلاسيكية' : 'CLASSIC VINTAGE COFFEE'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-brown-200">
              <div className="mb-8">
                <h2 className="text-4xl font-black text-brown-800 text-center tracking-wider border-b-2 border-brown-300 pb-4" style={{
                  fontFamily: 'Georgia, serif'
                }}>
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-brown-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-brown-700 uppercase tracking-wide" style={{
                        fontFamily: 'Georgia, serif'
                      }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-brown-600 mt-2 italic" style={{
                          fontFamily: 'Georgia, serif'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black text-brown-600" style={{
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-brown-200">
            <p className="text-lg font-medium text-brown-600" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-2xl font-black text-brown-800 mt-2" style={{
              fontFamily: 'Georgia, serif'
            }}>
              7:00 AM - 9:00 PM
            </p>
            <p className="text-sm text-brown-500 mt-4" style={{
              fontFamily: 'Georgia, serif'
            }}>
              {isRTL ? 'قهوة عالية الجودة' : 'PREMIUM COFFEE QUALITY'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 