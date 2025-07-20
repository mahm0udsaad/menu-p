"use client"

import React from 'react'
import { useMenuEditor } from '@/contexts/menu-editor-context'

export function SimpleCoffeeMenuPreview() {
  const { categories, restaurant, appliedFontSettings, appliedPageBackgroundSettings, appliedRowStyles } = useMenuEditor()

  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: appliedFontSettings.english.font }}>
            {restaurant.name}
          </h1>
          <p className="text-amber-100 text-lg" style={{ fontFamily: appliedFontSettings.english.font }}>
            Fresh Coffee & Delicious Treats
          </p>
        </div>

        {/* Menu Content */}
        <div className="p-8">
          {categories.map((category) => (
            <div key={category.id} className="mb-12">
              <h2 className="text-3xl font-bold text-amber-800 mb-6 text-center border-b-2 border-amber-200 pb-2" 
                  style={{ fontFamily: appliedFontSettings.english.font }}>
                {category.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.menu_items.map((item) => (
                  <div key={item.id} className="bg-amber-50 rounded-xl p-6 border border-amber-200 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-amber-900" 
                          style={{ fontFamily: appliedFontSettings.english.font }}>
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-amber-700" 
                            style={{ fontFamily: appliedFontSettings.english.font }}>
                        {item.price ? `${item.price} ${restaurant.currency || 'SAR'}` : 'Market Price'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-amber-700 text-sm leading-relaxed" 
                         style={{ fontFamily: appliedFontSettings.english.font }}>
                        {item.description}
                      </p>
                    )}
                    {item.dietary_info && item.dietary_info.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.dietary_info.map((info, index) => (
                          <span key={index} className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
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
        <div className="bg-amber-800 text-white p-6 text-center">
          <p className="text-amber-100" style={{ fontFamily: appliedFontSettings.english.font }}>
            Thank you for choosing {restaurant.name}
          </p>
        </div>
      </div>
    </div>
  )
} 