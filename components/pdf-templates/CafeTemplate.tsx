"use client"

import { useTemplateData } from './TemplateDataProvider'
import TemplateBase from './TemplateBase'

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
  background_image_url: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  }
  currency?: string
}

export default function CafeTemplate() {
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

  const restaurant = data.restaurant as Restaurant
  const categories = data.categories as MenuCategory[]
  const language = data.language || 'ar'
  const customizations = data.customizations || {}
  
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
  const currencySymbol = restaurant.currency || '$'
  
  // Color palette with fallback
  const colorPalette = restaurant.color_palette || {
    primary: "#10b981",
    secondary: "#059669", 
    accent: "#34d399"
  }

  // Apply background settings
  const pageBackgroundStyle = customizations.pageBackgroundSettings ? 
    getPageBackgroundStyle(customizations.pageBackgroundSettings) : {}

  // Apply font settings
  const fontClass = isRTL ? 'font-arabic' : 'font-english'

  return (
    <TemplateBase className={`${fontClass}`}>
      <div 
        className="min-h-full"
        style={{
          ...pageBackgroundStyle,
          color: customizations.pageBackgroundSettings?.textColor || '#333'
        }}
      >
        {/* Background Image Layer */}
        {customizations.pageBackgroundSettings?.backgroundType === 'image' && 
         customizations.pageBackgroundSettings.backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url(${customizations.pageBackgroundSettings.backgroundImage})`
            }}
          />
        )}

        {/* Content Layer */}
        <div className="relative z-10">
          {/* Header */}
          <header className="text-center mb-8">
            {restaurant.logo_url && (
              <div className="mb-6">
                <img 
                  src={restaurant.logo_url} 
                  alt={`${restaurant.name} Logo`}
                  className="mx-auto h-20 w-auto object-contain"
                />
              </div>
            )}
            
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ color: colorPalette.primary }}
            >
              {restaurant.name}
            </h1>
            
            <div 
              className="w-24 h-1 mx-auto rounded"
              style={{ backgroundColor: colorPalette.accent }}
            />
          </header>

          {/* Menu Categories */}
          <div className="space-y-8">
            {categories.map((category) => (
              <MenuCategorySection
                key={category.id}
                category={category}
                colorPalette={colorPalette}
                currencySymbol={currencySymbol}
                isRTL={isRTL}
                rowStyles={customizations.rowStyles}
              />
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center">
            <div 
              className="w-full h-px mb-4"
              style={{ backgroundColor: colorPalette.secondary }}
            />
            <p className="text-sm text-gray-600">
              {isRTL ? 'شكراً لاختياركم لنا' : 'Thank you for choosing us'}
            </p>
          </footer>
        </div>
      </div>
    </TemplateBase>
  )
}

function MenuCategorySection({ 
  category, 
  colorPalette, 
  currencySymbol, 
  isRTL,
  rowStyles 
}: {
  category: MenuCategory
  colorPalette: any
  currencySymbol: string
  isRTL: boolean
  rowStyles?: any
}) {
  const availableItems = category.menu_items.filter(item => 
    item.is_available && item.price !== null && item.price > 0
  )

  if (availableItems.length === 0) return null

  return (
    <section className="mb-8">
      {/* Category Header */}
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: colorPalette.primary }}
        >
          {category.name}
        </h2>
        
        {category.description && (
          <p className="text-gray-600 text-sm mb-3">
            {category.description}
          </p>
        )}
        
        <div 
          className="w-16 h-0.5 rounded"
          style={{ backgroundColor: colorPalette.accent }}
        />
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        {availableItems.map((item) => (
          <MenuItemRow
            key={item.id}
            item={item}
            currencySymbol={currencySymbol}
            isRTL={isRTL}
            rowStyles={rowStyles}
          />
        ))}
      </div>
    </section>
  )
}

function MenuItemRow({ 
  item, 
  currencySymbol, 
  isRTL,
  rowStyles 
}: {
  item: MenuItem
  currencySymbol: string
  isRTL: boolean
  rowStyles?: any
}) {
  const rowStyle = rowStyles ? getRowStyle(rowStyles) : {}

  return (
    <div 
      className="flex justify-between items-start py-3 px-4 rounded-lg"
      style={rowStyle}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 
            className="font-semibold text-lg"
            style={{ color: rowStyles?.itemColor || '#333' }}
          >
            {item.name}
          </h3>
          
          {item.is_featured && (
            <span 
              className="px-2 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: '#f59e0b' }}
            >
              {isRTL ? 'مميز' : 'Featured'}
            </span>
          )}
        </div>
        
        {item.description && (
          <p 
            className="text-sm mb-2"
            style={{ color: rowStyles?.descriptionColor || '#666' }}
          >
            {item.description}
          </p>
        )}
        
        {item.dietary_info && item.dietary_info.length > 0 && (
          <div className="flex gap-2">
            {item.dietary_info.map((info, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
              >
                {info}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className={`${isRTL ? 'mr-4' : 'ml-4'} flex-shrink-0`}>
        <span 
          className="font-bold text-lg"
          style={{ color: rowStyles?.priceColor || '#333' }}
        >
          {formatPrice(item.price!, currencySymbol, isRTL)}
        </span>
      </div>
    </div>
  )
}

function getPageBackgroundStyle(settings: any) {
  if (!settings) return {}
  
  switch (settings.backgroundType) {
    case 'solid':
      return { backgroundColor: settings.backgroundColor || '#ffffff' }
    case 'gradient':
      return {
        background: `linear-gradient(${settings.gradientDirection || 'to-b'}, ${settings.gradientFrom || '#ffffff'}, ${settings.gradientTo || '#f3f4f6'})`
      }
    case 'image':
      return settings.backgroundImage ? {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}
    default:
      return {}
  }
}

function getRowStyle(rowStyles: any) {
  if (!rowStyles) return {}
  
  const style: any = {}
  
  if (rowStyles.backgroundType === 'solid' && rowStyles.backgroundColor) {
    style.backgroundColor = rowStyles.backgroundColor
  }
  
  if (rowStyles.backgroundType === 'image' && rowStyles.backgroundImage) {
    style.backgroundImage = `url(${rowStyles.backgroundImage})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  }
  
  if (rowStyles.textShadow) {
    style.textShadow = '1px 1px 2px rgba(0,0,0,0.3)'
  }
  
  return style
}

function formatPrice(price: number, currency: string, isRTL: boolean): string {
  const formattedPrice = price.toFixed(2)
  
  if (isRTL) {
    return `${formattedPrice} ${currency}`
  } else {
    return `${currency}${formattedPrice}`
  }
} 