import React from 'react'

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
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  } | null
  currency?: string
}

interface ModernPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: {
    fontSettings?: {
      arabic: {
        font: string
        weight: string | number
      }
      english: {
        font: string
        weight: string | number
      }
    }
    pageBackgroundSettings?: any
    rowStyles?: any
  }
}

/**
 * Modern Template PDF Component
 * Matches the ModernPreview component exactly for consistent rendering
 */
export function ModernPDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations = {}
}: ModernPDFTemplateProps) {
  const isArabic = language === 'ar'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  const currencySymbol = restaurant?.currency || '$'

  // Get font settings exactly like ModernPreview
  const activeFontSettings = isArabic 
    ? customizations.fontSettings?.arabic || { font: 'Arial', weight: 'normal' }
    : customizations.fontSettings?.english || { font: 'Arial', weight: 'normal' }
  
  const fontName = activeFontSettings.font.replace(/\s/g, '_')

  // Get background style matching the preview component (always use menu-bg.jpeg)
  const getPageBackgroundStyle = () => {
    return {
      backgroundImage: `url('/assets/menu-bg.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }

  // Format price exactly like in the preview
  const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined) return ''
    try {
      const numPrice = Number(price)
      if (isNaN(numPrice)) return '0'
      return isRTL ? `${currencySymbol} ${numPrice.toFixed(2)}` : `${numPrice.toFixed(2)} ${currencySymbol}`
    } catch {
      return `${price} ${currencySymbol}`
    }
  }

  // Filter valid items exactly like in the preview
  const getValidItems = (items: MenuItem[]) => {
    return items.filter(item => 
      item && 
      item.name && 
      item.is_available && 
      item.price !== null && 
      item.price !== undefined &&
      !isNaN(Number(item.price))
    )
  }

  const backgroundStyle = getPageBackgroundStyle()

  return (
    <div
      id="modern-preview"
      className="min-h-[1123px] p-8 relative"
      style={backgroundStyle}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Modern Container with semi-transparent overlay - exactly like ModernPreview */}
      <div className="relative w-full min-h-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg max-w-2xl mx-auto">
        
        {/* Simple Header - exactly like ModernPreview */}
        <header className="text-center p-8 border-b-2 border-gray-200">
          {restaurant?.logo_url ? (
            <div className="inline-block mb-4">
              <img
                src={restaurant.logo_url}
                alt="Logo"
                className="w-16 h-16 mx-auto object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="inline-block mb-4">
              <img
                src="/assets/menu-header.png"
                alt="Logo"
                className="w-16 h-16 mx-auto rounded-full"
              />
            </div>
          )}
          
          <h1 
            className="text-6xl font-bold mb-2 text-gray-800 tracking-wider"
            style={{
              fontFamily: fontName,
              fontWeight: activeFontSettings.weight,
            }}
          >
            {isArabic ? 'قائمة الطعام' : 'MENU'}
          </h1>
        </header>

        {/* Categories - exactly like ModernPreview */}
        <div className="p-8 space-y-10">
          {categories.map((category, index) => {
            const validItems = getValidItems(category.menu_items)
            
            if (validItems.length === 0) return null

            return (
              <div key={category.id} className="space-y-4">
                {/* Category Title - exactly like ModernPreview */}
                <h2 
                  className="text-xl font-semibold text-gray-800 tracking-widest uppercase text-center border-b border-gray-300 pb-2"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  {category.name}
                </h2>
                
                {/* Menu Items - exactly like ModernPreview */}
                <div className="space-y-3">
                  {validItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex justify-between items-start p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 hover:bg-white/80 hover:border-gray-300/80 transition-all duration-200 shadow-sm hover:shadow-md"
                      style={{
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 
                                className="font-semibold text-gray-900 text-base leading-tight"
                                style={{
                                  fontFamily: fontName,
                                  fontWeight: activeFontSettings.weight,
                                }}
                              >
                                {item.name}
                              </h3>
                              {item.is_featured && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                                  ⭐
                                </span>
                              )}
                            </div>
                            
                            {item.description && (
                              <p 
                                className="text-gray-600 text-sm leading-relaxed mb-2"
                                style={{
                                  fontFamily: fontName,
                                }}
                              >
                                {item.description}
                              </p>
                            )}
                            
                            {/* Dietary Info */}
                            {item.dietary_info && item.dietary_info.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.dietary_info.map((info, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      fontFamily: fontName,
                                    }}
                                  >
                                    {info}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right flex-shrink-0 ml-4">
                            <span 
                              className="text-lg font-bold text-gray-900 whitespace-nowrap"
                              style={{
                                fontFamily: fontName,
                                fontWeight: activeFontSettings.weight,
                              }}
                            >
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ModernPDFTemplate