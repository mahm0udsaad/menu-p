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

interface ElegantCocktailTemplateProps {
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

export default function ElegantCocktailTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: ElegantCocktailTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="elegant-cocktail-template min-h-[1123px] p-8 relative" style={{
      background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #DAA520 100%)',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    }}>
      {/* Wood texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h100v100H0z" fill="%238B4513"/%3E%3Cpath d="M0 0h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 4h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 8h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 12h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 16h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 20h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 24h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 28h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 32h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 36h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 40h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 44h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 48h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 52h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 56h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 60h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 64h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 68h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 72h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 76h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 80h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 84h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 88h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 92h100v2H0z" fill="%23A0522D"/%3E%3Cpath d="M0 96h100v2H0z" fill="%23A0522D"/%3E%3C/svg%3E")'
      }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-5xl font-black text-white mb-4 tracking-widest drop-shadow-lg">
              {restaurant.name?.toUpperCase() || "ELEGANT COCKTAILS"}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-DAA520 to-transparent mx-auto mb-6"></div>
            <p className="text-xl font-medium text-DAA520 tracking-wide">
              {isRTL ? 'قائمة الكوكتيلات الأنيقة' : 'PREMIUM COCKTAIL MENU'}
            </p>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white text-center tracking-wider border-b-2 border-DAA520 pb-4">
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
                        <p className="text-sm text-DAA520 mt-2 italic">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black text-DAA520">
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
            <p className="text-2xl font-black text-DAA520">
              6:00 PM - 2:00 AM
            </p>
            <p className="text-sm text-white/70 mt-2">
              {isRTL ? 'مشروبات كحولية للبالغين فقط' : 'ADULTS ONLY - ALCOHOLIC BEVERAGES'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 