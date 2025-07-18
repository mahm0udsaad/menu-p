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

interface VintagePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: {
    fontSettings?: any
    pageBackgroundSettings?: any
    rowStyles?: any
  }
}

/**
 * Vintage Template PDF Component
 * Matches the VintagePreview component exactly with vintage styling and two-column layout
 */
export function VintagePDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations = {}
}: VintagePDFTemplateProps) {
  const isArabic = language === 'ar'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  const currencySymbol = restaurant?.currency || '$'

  // Get page background style matching the preview
  const getPageBackgroundStyle = () => {
    if (!customizations.pageBackgroundSettings) {
      return { backgroundColor: '#fdfaf3' }
    }
    
    switch (customizations.pageBackgroundSettings.backgroundType) {
      case 'gradient':
        return {
          background: `linear-gradient(to bottom right, ${customizations.pageBackgroundSettings.gradientFrom}, ${customizations.pageBackgroundSettings.gradientTo})`,
        }
      case 'image':
        return {
          backgroundImage: `url(${customizations.pageBackgroundSettings.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      case 'solid':
      default:
        return { backgroundColor: customizations.pageBackgroundSettings.backgroundColor || '#fdfaf3' }
    }
  }

  // Format price exactly like in the preview with vintage style dots
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

  // Split categories into two columns like in the preview
  const middleIndex = Math.ceil(categories.length / 2)
  const leftColumnCategories = categories.slice(0, middleIndex)
  const rightColumnCategories = categories.slice(middleIndex)

  const headerFontName = isArabic ? 'Cairo' : 'Amiri'
  const textColor = customizations.rowStyles?.itemColor || '#3a2d25'
  const accentColor = restaurant.color_palette?.accent || '#d4af37'

  const backgroundStyle = getPageBackgroundStyle()

  return (
    <div
      className="p-8 font-serif text-[#3a2d25] min-h-screen"
      style={{
        ...backgroundStyle,
        fontFamily: 'serif',
        color: textColor,
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header Section */}
      <header className="text-center mb-12">
        {restaurant?.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
            style={{ width: '80px', height: '80px' }}
          />
        ) : (
          <img
            src="/assets/menu-header.png"
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4"
            style={{ width: '80px', height: '80px' }}
          />
        )}
        <h1
          className="text-5xl uppercase"
          style={{
            fontFamily: headerFontName,
            color: '#3a2d25',
            fontSize: '3rem',
            fontWeight: 'bold'
          }}
        >
          {restaurant?.name || 'Your Restaurant'}
        </h1>
      </header>

      {/* Two Column Layout */}
      <div 
        className={`flex justify-between gap-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
        style={{ width: '100%' }}
      >
        {/* Left Column */}
        <div className="w-[48%]">
          {leftColumnCategories.map((category) => {
            const validItems = getValidItems(category.menu_items)
            
            if (validItems.length === 0) return null

            return (
              <div 
                key={category.id} 
                className="w-full p-4 rounded-lg mb-6"
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Category Title */}
                <h3 
                  className="text-lg font-bold uppercase pb-2 border-b-2 mb-4"
                  style={{
                    fontFamily: 'serif',
                    color: accentColor,
                    borderBottomColor: accentColor,
                    textAlign: isRTL ? 'right' : 'left'
                  }}
                >
                  {category.name}
                </h3>

                {/* Menu Items */}
                <div className="space-y-2">
                  {validItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                      style={{
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      <div className="flex-grow pr-4">
                        <div className="flex items-baseline">
                          <span
                            className="font-semibold"
                            style={{
                              fontFamily: 'serif',
                              color: textColor,
                              fontSize: '14px'
                            }}
                          >
                            {item.name}
                            {item.is_featured && (
                              <span className="ml-1 text-yellow-500">⭐</span>
                            )}
                          </span>
                          
                          {/* Vintage dots leading to price */}
                          <span 
                            className="flex-grow mx-2"
                            style={{
                              borderBottom: `1px dotted ${textColor}`,
                              height: '1px',
                              position: 'relative',
                              top: '-2px'
                            }}
                          ></span>
                          
                          <span
                            className="font-bold"
                            style={{
                              fontFamily: 'serif',
                              color: textColor,
                              fontSize: '14px'
                            }}
                          >
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p
                            className="text-xs text-gray-600 mt-1 italic"
                            style={{
                              fontFamily: 'serif',
                              lineHeight: '1.3',
                              color: '#6b7280'
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                        
                        {/* Dietary Info */}
                        {item.dietary_info && item.dietary_info.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.dietary_info.map((info, idx) => (
                              <span
                                key={idx}
                                className="text-xs italic"
                                style={{
                                  fontFamily: 'serif',
                                  color: '#8b7355',
                                  fontSize: '10px'
                                }}
                              >
                                {info}{idx < item.dietary_info.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column */}
        <div className="w-[48%]">
          {rightColumnCategories.map((category) => {
            const validItems = getValidItems(category.menu_items)
            
            if (validItems.length === 0) return null

            return (
              <div 
                key={category.id} 
                className="w-full p-4 rounded-lg mb-6"
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Category Title */}
                <h3 
                  className="text-lg font-bold uppercase pb-2 border-b-2 mb-4"
                  style={{
                    fontFamily: 'serif',
                    color: accentColor,
                    borderBottomColor: accentColor,
                    textAlign: isRTL ? 'right' : 'left'
                  }}
                >
                  {category.name}
                </h3>

                {/* Menu Items */}
                <div className="space-y-2">
                  {validItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                      style={{
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      <div className="flex-grow pr-4">
                        <div className="flex items-baseline">
                          <span
                            className="font-semibold"
                            style={{
                              fontFamily: 'serif',
                              color: textColor,
                              fontSize: '14px'
                            }}
                          >
                            {item.name}
                            {item.is_featured && (
                              <span className="ml-1 text-yellow-500">⭐</span>
                            )}
                          </span>
                          
                          {/* Vintage dots leading to price */}
                          <span 
                            className="flex-grow mx-2"
                            style={{
                              borderBottom: `1px dotted ${textColor}`,
                              height: '1px',
                              position: 'relative',
                              top: '-2px'
                            }}
                          ></span>
                          
                          <span
                            className="font-bold"
                            style={{
                              fontFamily: 'serif',
                              color: textColor,
                              fontSize: '14px'
                            }}
                          >
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p
                            className="text-xs text-gray-600 mt-1 italic"
                            style={{
                              fontFamily: 'serif',
                              lineHeight: '1.3',
                              color: '#6b7280'
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                        
                        {/* Dietary Info */}
                        {item.dietary_info && item.dietary_info.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.dietary_info.map((info, idx) => (
                              <span
                                key={idx}
                                className="text-xs italic"
                                style={{
                                  fontFamily: 'serif',
                                  color: '#8b7355',
                                  fontSize: '10px'
                                }}
                              >
                                {info}{idx < item.dietary_info.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 pt-8 border-t border-gray-300">
        <div 
          className="w-24 h-1 mx-auto mb-4"
          style={{ backgroundColor: accentColor }}
        ></div>
        <p 
          className="text-gray-600 italic"
          style={{
            fontFamily: 'serif',
            fontSize: '12px'
          }}
        >
          {isRTL ? 'شكراً لاختياركم لنا' : 'Thank you for choosing us'}
        </p>
      </footer>
    </div>
  )
}

export default VintagePDFTemplate 