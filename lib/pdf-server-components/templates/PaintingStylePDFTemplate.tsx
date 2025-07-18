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

interface PaintingStylePDFTemplateProps {
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
 * Painting Style Template PDF Component
 * Matches the PaintingStylePreview component exactly with cream background and golden styling
 */
export function PaintingStylePDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations = {}
}: PaintingStylePDFTemplateProps) {
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  const currencySymbol = restaurant?.currency || 'EGP'

  // Check if there's a custom background image
  const hasBgImage = !!customizations.pageBackgroundSettings?.backgroundImage

  // Get background style exactly like in the preview
  const getBackgroundStyle = () => {
    if (customizations.pageBackgroundSettings?.backgroundType === 'solid') {
      return {
        backgroundColor: customizations.pageBackgroundSettings.backgroundColor || '#f5f1e8'
      }
    } else if (customizations.pageBackgroundSettings?.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${customizations.pageBackgroundSettings.gradientDirection || 'to-b'}, ${customizations.pageBackgroundSettings.gradientFrom || '#f5f1e8'}, ${customizations.pageBackgroundSettings.gradientTo || '#e8dcc0'})`
      }
    } else if (customizations.pageBackgroundSettings?.backgroundImage) {
      return {
        backgroundImage: `url(${customizations.pageBackgroundSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    }
    // Default painting style background
    return {}
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

  const backgroundStyle = getBackgroundStyle()

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        ...backgroundStyle,
        fontFamily: 'Oswald, sans-serif',
        padding: hasBgImage ? '3rem 1rem' : '1rem'
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div 
        className={`
          transition-all duration-300
          ${hasBgImage 
            ? 'bg-[#f5f1e8] rounded-lg shadow-xl max-w-2xl mx-auto' 
            : 'bg-[#f5f1e8]'
          }
        `}
        style={{
          minHeight: hasBgImage ? 'auto' : '100vh'
        }}
      >
        <div className={`flex flex-col items-center ${hasBgImage ? 'p-8 sm:p-12' : 'p-8'}`}>
          {/* Header Section */}
          {restaurant?.logo_url ? (
            <img 
              src={restaurant.logo_url} 
              alt={restaurant.name} 
              className="w-full max-w-[400px] h-auto mb-12 object-contain self-center" 
              style={{ maxWidth: '400px', height: 'auto' }}
            />
          ) : (
            <h1 
              className="text-4xl font-bold text-center my-8"
              style={{ 
                color: '#c8a97e',
                fontFamily: 'Oswald, sans-serif'
              }}
            >
              {restaurant?.name}
            </h1>
          )}

          {/* Menu Categories */}
          <div className="w-full max-w-[450px]">
            {categories.map((category) => {
              const validItems = getValidItems(category.menu_items)
              
              if (validItems.length === 0) return null

              return (
                <div 
                  key={category.id} 
                  className="mb-12"
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  {/* Category Header */}
                  <div className="text-center mb-8 relative">
                    <h2 
                      className="text-3xl font-bold text-center pb-4 relative"
                      style={{ 
                        color: '#c8a97e',
                        fontFamily: 'Oswald, sans-serif'
                      }}
                    >
                      <span className="z-10 relative">{category.name}</span>
                      <span 
                        className="absolute bottom-0 left-1/2 w-24 h-0.5"
                        style={{ 
                          backgroundColor: '#c8a97e',
                          transform: 'translateX(-50%)'
                        }}
                      ></span>
                    </h2>
                    
                    {category.description && (
                      <p 
                        className="text-gray-600 text-sm mt-2 italic"
                        style={{
                          fontFamily: 'Oswald, sans-serif'
                        }}
                      >
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-4">
                    {validItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center bg-white p-4 rounded-lg shadow-sm"
                        style={{
                          pageBreakInside: 'avoid',
                          breakInside: 'avoid'
                        }}
                      >
                        {/* Item Content */}
                        <div className="flex-grow">
                          <h3
                            className="text-lg font-bold mb-1"
                            style={{
                              color: '#3a3a3a',
                              fontFamily: 'Oswald, sans-serif'
                            }}
                          >
                            {item.name}
                            {item.is_featured && (
                              <span className="ml-2 text-yellow-500">⭐</span>
                            )}
                          </h3>
                          
                          {item.description && (
                            <p
                              className="text-sm text-gray-600 mt-1"
                              style={{
                                fontFamily: 'Oswald, sans-serif',
                                lineHeight: '1.4'
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
                                  className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
                                  style={{
                                    fontFamily: 'Oswald, sans-serif'
                                  }}
                                >
                                  {info}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div
                          className="text-lg font-bold ml-4"
                          style={{
                            color: '#c8a97e',
                            fontFamily: 'Oswald, sans-serif'
                          }}
                        >
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 pt-8">
            <div 
              className="w-24 h-1 mx-auto mb-4"
              style={{ backgroundColor: '#c8a97e' }}
            ></div>
            <p 
              className="text-gray-600 italic"
              style={{
                fontFamily: 'Oswald, sans-serif'
              }}
            >
              {isRTL ? 'شكراً لاختياركم لنا' : 'Thank you for choosing us'}
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default PaintingStylePDFTemplate 