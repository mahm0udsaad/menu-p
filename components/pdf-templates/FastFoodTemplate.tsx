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

interface FastFoodTemplateProps {
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

// Hand-drawn SVG illustrations
const PizzaIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32">
    <circle cx="100" cy="100" r="80" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    <circle cx="100" cy="100" r="75" fill="none" stroke="#C41E3A" strokeWidth="1" strokeDasharray="3,2" />
    <circle cx="80" cy="80" r="8" fill="#C41E3A" />
    <circle cx="120" cy="70" r="8" fill="#C41E3A" />
    <circle cx="90" cy="110" r="8" fill="#C41E3A" />
    <circle cx="130" cy="120" r="8" fill="#C41E3A" />
    <circle cx="70" cy="130" r="8" fill="#C41E3A" />
    <circle cx="85" cy="95" r="2" fill="#C41E3A" />
    <circle cx="115" cy="85" r="2" fill="#C41E3A" />
    <circle cx="105" cy="105" r="2" fill="#C41E3A" />
    <circle cx="95" cy="125" r="2" fill="#C41E3A" />
    <circle cx="125" cy="95" r="2" fill="#C41E3A" />
  </svg>
)

const BurgerIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32">
    <ellipse cx="100" cy="70" rx="70" ry="25" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    <ellipse cx="80" cy="65" rx="3" ry="2" fill="#C41E3A" />
    <ellipse cx="100" cy="62" rx="3" ry="2" fill="#C41E3A" />
    <ellipse cx="120" cy="68" rx="3" ry="2" fill="#C41E3A" />
    <path d="M40 95 Q100 85 160 95 Q150 105 100 100 Q50 105 40 95" fill="#90EE90" stroke="#C41E3A" strokeWidth="2" />
    <ellipse cx="100" cy="110" rx="65" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
    <path d="M45 125 Q100 115 155 125 Q145 135 100 130 Q55 135 45 125" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <ellipse cx="100" cy="145" rx="70" ry="20" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
  </svg>
)

const FriesIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-24 h-32">
    <path d="M60 120 L60 180 L140 180 L140 120 L130 100 L70 100 Z" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    <rect x="75" y="80" width="8" height="40" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="90" y="70" width="8" height="50" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="105" y="75" width="8" height="45" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="120" y="85" width="8" height="35" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <circle cx="100" cy="150" r="15" fill="none" stroke="#C41E3A" strokeWidth="2" />
    <circle cx="100" cy="150" r="8" fill="#C41E3A" />
  </svg>
)

const HotDogIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-24">
    <ellipse cx="100" cy="100" rx="80" ry="30" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    <ellipse cx="100" cy="100" rx="70" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
    <path d="M40 95 Q60 90 80 95 Q100 90 120 95 Q140 90 160 95" stroke="#FFD700" strokeWidth="4" fill="none" />
    <path d="M45 105 Q65 100 85 105 Q105 100 125 105 Q145 100 155 105" stroke="#C41E3A" strokeWidth="3" fill="none" />
  </svg>
)

export default function FastFoodTemplate({
  restaurant,
  categories,
  appliedFontSettings,
  appliedPageBackgroundSettings,
  appliedRowStyles,
  currentLanguage = 'ar'
}: FastFoodTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLanguage);
  const currency = restaurant.currency || '$';

  return (
    <div className="fast-food-template min-h-[1123px] p-8 relative bg-gradient-to-br from-red-50 to-amber-50">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="mb-8">
          <h1 className="text-6xl font-black text-red-800 mb-4 tracking-wider">
            {restaurant.name?.toUpperCase() || "FAST FOOD"}
          </h1>
          <div className="flex justify-center items-center gap-8 mb-6">
            <PizzaIllustration />
            <BurgerIllustration />
            <FriesIllustration />
            <HotDogIllustration />
          </div>
          <p className="text-2xl font-bold text-amber-900">
            {isRTL ? 'قائمة الطعام السريع' : 'FAST FOOD MENU'}
          </p>
        </div>
      </header>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-4 border-red-200">
            <div className="mb-6">
              <h2 className="text-4xl font-black text-red-800 text-center tracking-wider border-b-4 border-red-300 pb-4">
                {category.name.toUpperCase()}
              </h2>
            </div>

            <div className="space-y-4">
              {category.menu_items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b-2 border-amber-200 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900 uppercase tracking-wide">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-amber-700 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black text-red-800">
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
        <div className="bg-red-800 text-white rounded-xl p-6">
          <p className="text-lg font-bold">
            {isRTL ? 'متاح من' : 'AVAILABLE AT'}
          </p>
          <p className="text-2xl font-black">
            9:00 AM - 10:00 PM
          </p>
        </div>
      </div>
    </div>
  );
} 