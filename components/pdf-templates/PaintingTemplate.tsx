"use client"

import { useTemplateData } from './TemplateDataProvider'
import TemplateBase from './TemplateBase'

export default function PaintingTemplate() {
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
    <TemplateBase className={`${fontClass} painting-theme`}>
      <div 
        className="min-h-full p-8 relative"
        style={{
          background: 'linear-gradient(45deg, #f3e8ff, #fef3c7, #ecfdf5)',
          backgroundSize: '300% 300%',
          animation: 'gradient 15s ease infinite'
        }}
      >
        {/* Artistic border */}
        <div className="absolute inset-4 border-8 border-purple-300 rounded-lg opacity-60"></div>
        <div className="absolute inset-6 border-4 border-yellow-300 rounded-lg opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Artistic Header */}
          <header className="text-center mb-12">
            {restaurant.logo_url && (
              <div className="mb-6">
                <img 
                  src={restaurant.logo_url} 
                  alt={`${restaurant.name} Logo`}
                  className="mx-auto h-20 w-auto object-contain drop-shadow-2xl"
                />
              </div>
            )}
            
            <h1 className="text-6xl font-bold text-purple-800 mb-4 drop-shadow-lg">
              {restaurant.name}
            </h1>
            <div className="w-40 h-2 bg-gradient-to-r from-purple-500 to-yellow-500 mx-auto rounded-full"></div>
          </header>

          {/* Menu Categories with artistic styling */}
          <div className="space-y-8">
            {categories.map((category: any, index: number) => (
              <section 
                key={category.id} 
                className={`p-6 rounded-2xl shadow-2xl ${
                  index % 2 === 0 
                    ? 'bg-white/80 border-l-8 border-purple-500' 
                    : 'bg-purple-50/80 border-r-8 border-yellow-500'
                }`}
              >
                <h2 className="text-4xl font-bold text-purple-800 mb-6 text-center">
                  {category.name}
                </h2>
                
                {category.description && (
                  <p className="text-purple-600 text-center mb-8 text-lg italic">
                    {category.description}
                  </p>
                )}
                
                <div className="grid gap-4">
                  {category.menu_items?.filter((item: any) => 
                    item.is_available && item.price !== null
                  ).map((item: any) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-start p-4 bg-white/60 rounded-xl border-2 border-purple-200 hover:bg-white/80 transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-purple-900 mb-2">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-purple-700 text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-6 font-bold text-xl text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                        {isRTL ? `${item.price} ${restaurant.currency || '$'}` : `${restaurant.currency || '$'}${item.price}`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Artistic Footer */}
          <footer className="mt-12 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-yellow-500 h-1 w-full mb-4 rounded-full"></div>
            <p className="text-purple-800 text-xl font-bold">
              {isRTL ? 'شكراً لاختياركم لنا' : 'Thank you for choosing us'}
            </p>
          </footer>
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `
        }} />
      </div>
    </TemplateBase>
  )
} 