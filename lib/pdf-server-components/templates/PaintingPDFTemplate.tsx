import React from 'react'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
  currency?: string
}

interface PaintingPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: {
    pageBackgroundSettings?: any
  }
}

function getBackgroundStyle(settings: any): React.CSSProperties {
  if (!settings) return { background: '#f5f1e8' }
  if (settings.backgroundType === 'solid') {
    return { background: settings.backgroundColor || '#f5f1e8' }
  }
  if (settings.backgroundType === 'gradient') {
    return {
      background: `linear-gradient(${settings.gradientDirection}, ${settings.gradientFrom}, ${settings.gradientTo})`
    }
  }
  if (settings.backgroundImage) {
    return {
      backgroundImage: `url(${settings.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  }
  return { background: '#f5f1e8' }
}

export function PaintingPDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations = {}
}: PaintingPDFTemplateProps) {
  const bgStyle = getBackgroundStyle(customizations.pageBackgroundSettings)
  const hasBgImage = Boolean(customizations.pageBackgroundSettings?.backgroundImage)
  const currency = restaurant.currency || ''

  return (
    <div className={`font-oswald ${hasBgImage ? 'py-12 px-4' : 'p-4 sm:p-16'}`} style={bgStyle}>
      <div className={`${hasBgImage ? 'bg-[#f5f1e8] rounded-lg shadow-xl max-w-2xl mx-auto' : ''}`}>
        <div className={`flex flex-col items-center ${hasBgImage ? 'p-8 sm:p-12' : 'bg-[#f5f1e8]'}`}>
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-full max-w-[400px] h-auto mb-12 object-contain self-center"
            />
          ) : (
            <h1 className="text-4xl font-bold text-center my-8">{restaurant.name}</h1>
          )}

          <div className="w-full max-w-[450px]">
            {categories.map(category => (
              <div key={category.id} className="mb-12">
                <div className="text-center mb-8 relative">
                  <h2 className="text-3xl font-bold text-center text-[#c8a97e] pb-4">
                    <span className="z-10 relative">{category.name}</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-[#c8a97e]"></span>
                  </h2>
                </div>
                <div className="space-y-4">
                  {category.menu_items.map(item => (
                    <div key={item.id} className="flex justify-between border-b border-[#c8a97e]/30 pb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-[#3c3b3a]">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-[#6b6a68]">{item.description}</p>
                        )}
                      </div>
                      {item.price !== null && (
                        <span className="text-xl text-[#c8a97e] font-semibold">
                          {item.price} {currency}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaintingPDFTemplate
