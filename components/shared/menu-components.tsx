import React from 'react'

// Shared interfaces
export interface SharedMenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

export interface SharedMenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: SharedMenuItem[]
}

export interface SharedRestaurant {
  id: string
  name: string
  category: string
  logo_url: string | null | undefined
  address?: string | null | undefined
  phone?: string | null | undefined
  website?: string | null | undefined
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  } | null | undefined
  currency?: string | undefined
}

export interface SharedFontSettings {
  arabic: {
    font: string
    weight: string | number
  }
  english: {
    font: string
    weight: string | number
  }
}

export interface SharedComponentProps {
  isPdfGeneration?: boolean
  isPreview?: boolean
}

/**
 * Shared Menu Header Component
 * Consistent header rendering for both preview and PDF
 */
export const SharedMenuHeader: React.FC<{
  restaurant: SharedRestaurant
  language?: string
  fontSettings: SharedFontSettings
  isPdfGeneration?: boolean
}> = ({ restaurant, language = 'ar', fontSettings, isPdfGeneration = false }) => {
  const isArabic = language === 'ar'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  
  const activeFontSettings = isArabic 
    ? fontSettings.arabic || { font: 'Arial', weight: 'normal' }
    : fontSettings.english || { font: 'Arial', weight: 'normal' }
  
  const fontName = activeFontSettings.font.replace(/\s/g, '_')

  return (
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
  )
}

/**
 * Shared Menu Item Component
 * Consistent menu item rendering for both preview and PDF
 */
export const SharedMenuItem: React.FC<{
  item: SharedMenuItem
  language?: string
  fontSettings: SharedFontSettings
  currency?: string
  isPdfGeneration?: boolean
  showImages?: boolean
}> = ({ item, language = 'ar', fontSettings, currency = 'ر.س', isPdfGeneration = false, showImages = true }) => {
  const isArabic = language === 'ar'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  
  const activeFontSettings = isArabic 
    ? fontSettings.arabic || { font: 'Arial', weight: 'normal' }
    : fontSettings.english || { font: 'Arial', weight: 'normal' }
  
  const fontName = activeFontSettings.font.replace(/\s/g, '_')

  // Format price consistently
  const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined) return ''
    try {
      const numPrice = Number(price)
      if (isNaN(numPrice)) return '0'
      return isRTL ? `${currency} ${numPrice.toFixed(2)}` : `${numPrice.toFixed(2)} ${currency}`
    } catch {
      return `${price} ${currency}`
    }
  }

  return (
    <div
      className="group flex justify-between items-start hover:bg-gray-50/50 p-2 rounded-lg transition-all duration-200"
      style={{
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      <div className="flex-1 flex justify-between items-start">
        <div className="flex-1">
          {/* Item name and featured badge */}
          <div className="mb-1">
            <h3 
              className="text-lg font-medium text-gray-800"
              style={{
                fontFamily: fontName,
                fontWeight: activeFontSettings.weight,
              }}
            >
              {item.name}
            </h3>
            {item.is_featured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 inline-block">
                ⭐
              </span>
            )}
          </div>
          
          {/* Item description */}
          {item.description && (
            <p 
              className="text-sm text-gray-600 mb-2"
              style={{
                fontFamily: fontName,
                fontWeight: activeFontSettings.weight,
              }}
            >
              {item.description}
            </p>
          )}
          
          {/* Dietary info */}
          {item.dietary_info && item.dietary_info.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.dietary_info.map((info, index) => (
                <span 
                  key={index}
                  className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: fontName,
                    fontWeight: activeFontSettings.weight,
                  }}
                >
                  {info}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Price */}
        {item.price && (
          <div 
            className="text-lg font-bold text-gray-800 ml-4"
            style={{
              fontFamily: fontName,
              fontWeight: activeFontSettings.weight,
            }}
          >
            {formatPrice(item.price)}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Shared Menu Category Component
 * Consistent category rendering for both preview and PDF
 */
export const SharedMenuCategory: React.FC<{
  category: SharedMenuCategory
  language?: string
  fontSettings: SharedFontSettings
  currency?: string
  isPdfGeneration?: boolean
  showImages?: boolean
}> = ({ category, language = 'ar', fontSettings, currency = 'ر.س', isPdfGeneration = false, showImages = true }) => {
  const isArabic = language === 'ar'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  
  const activeFontSettings = isArabic 
    ? fontSettings.arabic || { font: 'Arial', weight: 'normal' }
    : fontSettings.english || { font: 'Arial', weight: 'normal' }
  
  const fontName = activeFontSettings.font.replace(/\s/g, '_')

  // Filter valid items
  const getValidItems = (items: SharedMenuItem[]) => {
    return items.filter(item => 
      item && 
      item.name && 
      item.is_available && 
      item.price !== null && 
      item.price !== undefined &&
      !isNaN(Number(item.price))
    )
  }

  const validItems = getValidItems(category.menu_items)
  
  if (validItems.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Category Title */}
      <h2 
        className="text-xl font-semibold text-gray-800 tracking-widest uppercase text-center border-b border-gray-300 pb-2"
        style={{
          fontFamily: fontName,
          fontWeight: activeFontSettings.weight,
        }}
      >
        {category.name}
      </h2>
      
      {/* Category Description */}
      {category.description && (
        <p 
          className="text-sm text-gray-600 text-center mb-4"
          style={{
            fontFamily: fontName,
            fontWeight: activeFontSettings.weight,
          }}
        >
          {category.description}
        </p>
      )}
      
      {/* Menu Items */}
      <div className="space-y-3">
        {validItems.map((item) => (
          <SharedMenuItem
            key={item.id}
            item={item}
            language={language}
            fontSettings={fontSettings}
            currency={currency}
            isPdfGeneration={isPdfGeneration}
            showImages={showImages}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Shared Menu Footer Component
 * Consistent footer rendering for both preview and PDF
 */
export const SharedMenuFooter: React.FC<{
  restaurant: SharedRestaurant
  language?: string
  fontSettings: SharedFontSettings
  isPdfGeneration?: boolean
}> = ({ restaurant, language = 'ar', fontSettings, isPdfGeneration = false }) => {
  const isArabic = language === 'ar'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  
  const activeFontSettings = isArabic 
    ? fontSettings.arabic || { font: 'Arial', weight: 'normal' }
    : fontSettings.english || { font: 'Arial', weight: 'normal' }
  
  const fontName = activeFontSettings.font.replace(/\s/g, '_')

  return (
    <footer 
      className="mt-8 p-6 bg-gray-50 text-center text-gray-600"
      style={{
        fontFamily: fontName,
        fontWeight: activeFontSettings.weight,
      }}
    >
      <div className="space-y-2">
        {restaurant.address && (
          <p>{restaurant.address}</p>
        )}
        {restaurant.phone && (
          <p>{restaurant.phone}</p>
        )}
        {restaurant.website && (
          <p>{restaurant.website}</p>
        )}
      </div>
    </footer>
  )
}

/**
 * Shared Menu Container Component
 * Provides consistent container styling for both preview and PDF
 */
export const SharedMenuContainer: React.FC<{
  children: React.ReactNode
  backgroundStyle?: React.CSSProperties
  isPdfGeneration?: boolean
  className?: string
}> = ({ children, backgroundStyle, isPdfGeneration = false, className = '' }) => {
  const defaultBackgroundStyle = {
    backgroundImage: `url('/assets/menu-bg.jpeg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }

  return (
    <div
      className={`min-h-[1123px] p-8 relative ${className}`}
      style={backgroundStyle || defaultBackgroundStyle}
    >
      {/* Container with semi-transparent overlay */}
      <div className="relative w-full min-h-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  )
}

/**
 * Shared utility functions
 */
export const sharedUtils = {
  /**
   * Get font settings based on language
   */
  getFontSettings: (fontSettings: SharedFontSettings, language: string = 'ar') => {
    const isArabic = language === 'ar'
    return isArabic 
      ? fontSettings.arabic || { font: 'Arial', weight: 'normal' }
      : fontSettings.english || { font: 'Arial', weight: 'normal' }
  },

  /**
   * Get font name for CSS
   */
  getFontName: (fontSettings: SharedFontSettings, language: string = 'ar') => {
    const activeSettings = sharedUtils.getFontSettings(fontSettings, language)
    return activeSettings.font.replace(/\s/g, '_')
  },

  /**
   * Check if language is RTL
   */
  isRTL: (language: string) => {
    return ['ar', 'fa', 'ur', 'he'].includes(language)
  },

  /**
   * Format price consistently
   */
  formatPrice: (price: number | null, currency: string = 'ر.س', language: string = 'ar') => {
    if (price === null || price === undefined) return ''
    try {
      const numPrice = Number(price)
      if (isNaN(numPrice)) return '0'
      const isRTL = sharedUtils.isRTL(language)
      return isRTL ? `${currency} ${numPrice.toFixed(2)}` : `${numPrice.toFixed(2)} ${currency}`
    } catch {
      return `${price} ${currency}`
    }
  },

  /**
   * Filter valid menu items
   */
  getValidItems: (items: SharedMenuItem[]) => {
    return items.filter(item => 
      item && 
      item.name && 
      item.is_available && 
      item.price !== null && 
      item.price !== undefined &&
      !isNaN(Number(item.price))
    )
  }
} 