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

interface ChalkboardCoffeeTemplateProps {
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

export default function ChalkboardCoffeeTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: ChalkboardCoffeeTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="chalkboard-coffee-template min-h-[1123px] p-8 relative bg-gray-900">
      {/* Chalkboard texture */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h100v100H0z" fill="%232F2F2F"/%3E%3Cpath d="M0 0h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 4h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 8h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 12h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 16h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 20h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 24h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 28h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 32h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 36h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 40h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 44h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 48h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 52h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 56h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 60h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 64h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 68h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 72h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 76h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 80h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 84h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 88h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 92h100v2H0z" fill="%234A4A4A"/%3E%3Cpath d="M0 96h100v2H0z" fill="%234A4A4A"/%3E%3C/svg%3E")'
      }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-black text-white mb-4 tracking-wider" style={{
              fontFamily: 'Chalkboard, cursive'
            }}>
              {restaurant.name?.toUpperCase() || "CHALKBOARD COFFEE"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
            <p className="text-2xl font-medium text-gray-300 tracking-wide" style={{
              fontFamily: 'Chalkboard, cursive'
            }}>
              {isRTL ? 'مقهى السبورة' : 'CHALKBOARD COFFEE'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-600">
              <div className="mb-8">
                <h2 className="text-4xl font-black text-white text-center tracking-wider border-b-2 border-gray-500 pb-4" style={{
                  fontFamily: 'Chalkboard, cursive'
                }}>
                  {category.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                {category.menu_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-600 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white uppercase tracking-wide" style={{
                        fontFamily: 'Chalkboard, cursive'
                      }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-300 mt-2 italic" style={{
                          fontFamily: 'Chalkboard, cursive'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black text-white" style={{
                        fontFamily: 'Chalkboard, cursive'
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
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-600">
            <p className="text-lg font-medium text-white" style={{
              fontFamily: 'Chalkboard, cursive'
            }}>
              {isRTL ? 'متاح من' : 'AVAILABLE AT'}
            </p>
            <p className="text-2xl font-black text-white mt-2" style={{
              fontFamily: 'Chalkboard, cursive'
            }}>
              7:00 AM - 9:00 PM
            </p>
            <p className="text-sm text-gray-400 mt-4" style={{
              fontFamily: 'Chalkboard, cursive'
            }}>
              {isRTL ? 'قهوة يومية' : 'DAILY COFFEE'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 