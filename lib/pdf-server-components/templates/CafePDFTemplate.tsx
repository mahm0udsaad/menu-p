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
  background_image_url?: string | null
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
  address?: string | null
  phone?: string | null
  website?: string | null
  color_palette?: {
    primary: string
    secondary: string
    accent: string
  } | null
  currency?: string
}

interface CafePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: {
    fontSettings?: any
    pageBackgroundSettings?: any
    rowStyles?: any
  }
}

const CafePDFTemplate: React.FC<CafePDFTemplateProps> = ({
  restaurant,
  categories,
  language = 'ar',
  customizations
}) => {
  const isEmpty = categories.length === 0
  const currency = restaurant.currency || 'ر.س'
  
  // Get page background style
  const getPageBackgroundStyle = () => {
    const { backgroundType, backgroundColor, backgroundImage, gradientFrom, gradientTo, gradientDirection } = 
      customizations?.pageBackgroundSettings || {}
    
    if (backgroundType === 'solid') {
      return { backgroundColor: backgroundColor || '#ffffff' }
    } else if (backgroundType === 'gradient') {
      return { background: `linear-gradient(${gradientDirection || 'to bottom'}, ${gradientFrom || '#ffffff'}, ${gradientTo || '#f3f4f6'})` }
    } else if (backgroundType === 'image' && backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }
    return { backgroundColor: '#ffffff' }
  }

  // Menu Header Component
  const MenuHeader = () => (
    <div className="bg-white p-8 flex flex-col">
      <div className="flex flex-col items-center text-center mb-8">
        {/* Logo Section */}
        <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-50 mb-4">
          {restaurant.logo_url ? (
            <img 
              src={restaurant.logo_url} 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="h-8 w-8">📷</div>
            </div>
          )}
        </div>
        
        {/* Restaurant Info */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
          <p className="text-lg text-gray-600">{restaurant.category}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex items-center justify-center">
        {isEmpty && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 w-full max-w-2xl">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ابدأ في إنشاء قائمتك
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                لا توجد أقسام في قائمتك بعد
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Menu Item Component
  const MenuItemComponent: React.FC<{ item: MenuItem }> = ({ item }) => {
    const rowStyles = customizations?.rowStyles || {}
    
    return (
      <div className="border-b border-gray-200 py-4 last:border-b-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {/* Item Image */}
              {item.image_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Item Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 
                    className="font-semibold text-gray-900"
                    style={{
                      color: rowStyles.itemNameColor || '#111827',
                      fontSize: rowStyles.itemNameSize ? `${rowStyles.itemNameSize}px` : '16px',
                      fontWeight: rowStyles.itemNameWeight || '600'
                    }}
                  >
                    {item.name}
                  </h4>
                  {item.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      مميز
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <p 
                    className="text-gray-600 text-sm mb-2"
                    style={{
                      color: rowStyles.descriptionColor || '#6b7280',
                      fontSize: rowStyles.descriptionSize ? `${rowStyles.descriptionSize}px` : '14px'
                    }}
                  >
                    {item.description}
                  </p>
                )}
                
                {item.dietary_info && item.dietary_info.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.dietary_info.map((info, index) => (
                      <span 
                        key={index}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {info}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Price */}
          {item.price && (
            <div className="text-left ml-4">
              <span 
                className="font-bold text-lg"
                style={{
                  color: rowStyles.priceColor || restaurant.color_palette?.primary || '#065f46',
                  fontSize: rowStyles.priceSize ? `${rowStyles.priceSize}px` : '18px',
                  fontWeight: rowStyles.priceWeight || '700'
                }}
              >
                {item.price.toFixed(2)} {currency}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Menu Section Component
  const MenuSectionComponent: React.FC<{ category: MenuCategory }> = ({ category }) => {
    const sectionStyle = category.background_image_url ? {
      backgroundImage: `url(${category.background_image_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    } : {}

    return (
      <div 
        className="mb-8 p-6 bg-white rounded-lg shadow-sm"
        style={sectionStyle}
      >
        {/* Category Header */}
        <div className="mb-6">
          <h3 
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{
              color: restaurant.color_palette?.primary || '#065f46'
            }}
          >
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-0">
          {category.menu_items
            .filter(item => item.is_available)
            .map(item => (
              <MenuItemComponent key={item.id} item={item} />
            ))}
        </div>
      </div>
    )
  }

  // Menu Footer Component
  const MenuFooter = () => {
    const footerContent = {
      address: restaurant.address || '123 Foodie Lane, Flavor Town',
      phone: restaurant.phone || '+1 (234) 567-890',
      website: restaurant.website || 'www.your-restaurant.com'
    }

    return (
      <footer className="mt-12 p-6 bg-gray-50 text-center text-gray-600 text-sm">
        <div className="space-y-2">
          <p className="font-medium">{footerContent.address}</p>
          <p>{footerContent.phone}</p>
          <p>{footerContent.website}</p>
        </div>
      </footer>
    )
  }

  return (
    <div className="min-h-screen print:min-h-0" style={getPageBackgroundStyle()}>
      <div className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0">
        <MenuHeader />
        <div className="p-6 space-y-8">
          {isEmpty ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <div className="mx-auto h-24 w-24 flex items-center justify-center">
                  📄
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أقسام في القائمة</h3>
              <p className="text-gray-500 mb-6">ابدأ بإضافة أقسام وعناصر لقائمتك</p>
            </div>
          ) : (
            categories.map((category: MenuCategory) => (
              <MenuSectionComponent
                key={category.id}
                category={category}
              />
            ))
          )}
        </div>
        <MenuFooter />
      </div>
    </div>
  )
}

export default CafePDFTemplate 