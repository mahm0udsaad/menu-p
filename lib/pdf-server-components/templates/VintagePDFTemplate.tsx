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

interface VintagePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: {
    pageBackgroundSettings?: any
    fontSettings?: any
    rowStyles?: any
  }
}

function getPageBackgroundStyle(settings: any) {
  if (!settings) {
    return { backgroundColor: '#fdfaf3' }
  }
  switch (settings.backgroundType) {
    case 'gradient':
      return {
        background: `linear-gradient(to bottom right, ${settings.gradientFrom}, ${settings.gradientTo})`
      }
    case 'image':
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    case 'solid':
    default:
      return { backgroundColor: settings.backgroundColor || '#fdfaf3' }
  }
}

function VintageSection({ category, currency }: { category: MenuCategory; currency: string }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold uppercase pb-2 border-b-2 border-[#c8a97e]" style={{ color: '#c8a97e' }}>
        {category.name}
      </h3>
      <div className="space-y-2 mt-2">
        {category.menu_items.map(item => (
          <div key={item.id} className="flex justify-between">
            <div>
              <p className="font-medium">{item.name}</p>
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
            </div>
            {item.price !== null && (
              <span className="ml-4 font-semibold">{item.price} {currency}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function VintagePDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations = {}
}: VintagePDFTemplateProps) {
  const pageStyle = getPageBackgroundStyle(customizations.pageBackgroundSettings)
  const middleIndex = Math.ceil(categories.length / 2)
  const left = categories.slice(0, middleIndex)
  const right = categories.slice(middleIndex)
  const isArabic = language === 'ar'
  const fontSettings = customizations.fontSettings || {
    arabic: { font: 'Cairo', weight: 'normal' },
    english: { font: 'Amiri', weight: 'normal' }
  }
  const activeFont = isArabic ? fontSettings.arabic : fontSettings.english
  const currency = restaurant.currency || '$'

  return (
    <div
      id="vintage-preview"
      className="p-8 bg-[#fdfaf3] font-serif text-[#3a2d25] min-h-[1123px]"
      style={{
        ...pageStyle,
        fontFamily: activeFont.font.replace(/\s/g, '_'),
        fontWeight: activeFont.weight,
        color: customizations.rowStyles?.itemColor || '#3a2d25'
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <header className="text-center mb-12">
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
        ) : (
          <img
            src="/assets/menu-header.png"
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4"
          />
        )}
        <h1
          className="text-5xl uppercase"
          style={{ fontFamily: isArabic ? 'Cairo' : 'Amiri', color: '#3a2d25' }}
        >
          {restaurant.name || 'Your Restaurant'}
        </h1>
      </header>
      <div className={`flex justify-between ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="w-[48%]">
          {left.map(category => (
            <VintageSection key={category.id} category={category} currency={currency} />
          ))}
        </div>
        <div className="w-[48%]">
          {right.map(category => (
            <VintageSection key={category.id} category={category} currency={currency} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default VintagePDFTemplate
