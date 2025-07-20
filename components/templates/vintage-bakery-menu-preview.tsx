"use client"

import React from 'react'
import { useMenuEditor } from '@/contexts/menu-editor-context'

export function VintageBakeryMenuPreview() {
  const { categories, restaurant, appliedFontSettings, appliedPageBackgroundSettings, appliedRowStyles } = useMenuEditor()

  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-yellow-100 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-amber-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-yellow-600 text-white p-8 text-center relative">
          <div className="absolute inset-0 bg-amber-800/30"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: appliedFontSettings.english.font }}>
              {restaurant.name}
            </h1>
            <p className="text-amber-100 text-xl" style={{ fontFamily: appliedFontSettings.english.font }}>
              🥖 Artisan Bakery & Sweet Delights 🥖
            </p>
            <div className="mt-4 text-amber-200 text-sm">
              Handcrafted • Traditional • Delicious
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-8">
          {categories.map((category) => (
            <div key={category.id} className="mb-16">
              <h2 className="text-4xl font-bold text-amber-800 mb-8 text-center border-b-4 border-amber-300 pb-4" 
                  style={{ fontFamily: appliedFontSettings.english.font }}>
                🍞 {category.name}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {category.menu_items.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200 hover:shadow-lg transition-all duration-300 hover:border-amber-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-amber-800 mb-2" 
                            style={{ fontFamily: appliedFontSettings.english.font }}>
                          🥐 {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-amber-700 text-base leading-relaxed" 
                             style={{ fontFamily: appliedFontSettings.english.font }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="text-3xl font-bold text-amber-700 ml-4" 
                            style={{ fontFamily: appliedFontSettings.english.font }}>
                        {item.price ? `${item.price} ${restaurant.currency || 'SAR'}` : 'Market Price'}
                      </span>
                    </div>
                    {item.dietary_info && item.dietary_info.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {item.dietary_info.map((info, index) => (
                          <span key={index} className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                            {info}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-amber-700 text-white p-8 text-center">
          <p className="text-amber-100 text-lg" style={{ fontFamily: appliedFontSettings.english.font }}>
            🥖 Thank you for choosing {restaurant.name} 🥖
          </p>
          <p className="text-amber-200 text-sm mt-2">
            Fresh Baked Daily • Traditional Recipes • Made with Love
          </p>
        </div>
      </div>
    </div>
  )
} 