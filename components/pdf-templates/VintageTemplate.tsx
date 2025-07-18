"use client"

import { useTemplateData } from './TemplateDataProvider'
import TemplateBase from './TemplateBase'

export default function VintageTemplate() {
  const { data } = useTemplateData()
  
  if (!data.restaurant || !data.categories) {
    return (
      <TemplateBase>
        <div className="text-center py-20">
          <h1 className="text-2xl text-gray-500">Loading menu data...</h1>
        </div>
      </TemplateBase>
    )
  }

  const restaurant = data.restaurant
  const categories = data.categories
  const language = data.language || 'ar'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  const fontClass = isRTL ? 'font-arabic' : 'font-english'

  return (
    <TemplateBase className={`${fontClass} vintage-theme`}>
      <div className="min-h-full bg-amber-50 p-8">
        {/* Vintage Header */}
        <header className="text-center mb-12 border-4 border-amber-800 p-6 bg-amber-100">
          {restaurant.logo_url && (
            <div className="mb-4">
              <img 
                src={restaurant.logo_url} 
                alt={`${restaurant.name} Logo`}
                className="mx-auto h-16 w-auto object-contain sepia"
              />
            </div>
          )}
          
          <h1 className="text-5xl font-bold text-amber-900 mb-2 font-serif">
            {restaurant.name}
          </h1>
          <div className="w-32 h-1 bg-amber-800 mx-auto"></div>
        </header>

        {/* Menu Categories */}
        <div className="space-y-10">
          {categories.map((category: any) => (
            <section key={category.id} className="bg-white p-6 border-2 border-amber-800 shadow-lg">
              <h2 className="text-3xl font-bold text-amber-900 mb-4 text-center font-serif border-b-2 border-amber-300 pb-2">
                {category.name}
              </h2>
              
              {category.description && (
                <p className="text-amber-700 text-center mb-6 italic">
                  {category.description}
                </p>
              )}
              
              <div className="space-y-4">
                {category.menu_items?.filter((item: any) => 
                  item.is_available && item.price !== null
                ).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start border-b border-amber-200 pb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-amber-900">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-amber-700 text-sm mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 font-bold text-amber-900">
                      {isRTL ? `${item.price} ${restaurant.currency || '$'}` : `${restaurant.currency || '$'}${item.price}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Vintage Footer */}
        <footer className="mt-12 text-center">
          <div className="border-t-2 border-amber-800 pt-4">
            <p className="text-amber-900 font-serif italic">
              {isRTL ? 'شكراً لاختياركم لنا' : 'Thank you for your patronage'}
            </p>
          </div>
        </footer>
      </div>
    </TemplateBase>
  )
} 