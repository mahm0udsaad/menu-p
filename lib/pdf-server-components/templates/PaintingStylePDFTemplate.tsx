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

interface PaintingStylePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function PaintingStylePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: PaintingStylePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  const isArabic = language === 'ar'
  
  // Check if we have custom background settings
  const appliedPageBackgroundSettings = customizations?.appliedPageBackgroundSettings || {
    backgroundType: 'image',
    backgroundImage: '/assets/painting-bg.png',
    backgroundColor: '#f5f1e8'
  }
  
  const hasBgImage = !!appliedPageBackgroundSettings.backgroundImage
  
  const getBackgroundStyle = () => {
    if (appliedPageBackgroundSettings.backgroundType === 'solid') {
      return { backgroundColor: appliedPageBackgroundSettings.backgroundColor }
    } else if (appliedPageBackgroundSettings.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${appliedPageBackgroundSettings.gradientDirection || '135deg'}, ${appliedPageBackgroundSettings.gradientFrom || '#f5f1e8'}, ${appliedPageBackgroundSettings.gradientTo || '#e8d5c4'})`
      }
    } else if (appliedPageBackgroundSettings.backgroundImage) {
      return {
        backgroundImage: `url(${appliedPageBackgroundSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    }
    return { backgroundColor: '#f5f1e8' }
  }
  
  return (
    <div style={{ 
      minHeight: '100vh',
      fontFamily: 'Oswald, Arial, sans-serif',
      padding: hasBgImage ? '48px 16px' : '16px 64px',
      direction: isArabic ? 'rtl' : 'ltr',
      transition: 'all 0.3s ease',
      ...getBackgroundStyle()
    }}>
      <div style={{ 
        maxWidth: '512px', 
        margin: '0 auto',
        backgroundColor: hasBgImage ? '#f5f1e8' : 'transparent',
        borderRadius: hasBgImage ? '12px' : '0',
        boxShadow: hasBgImage ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
        padding: hasBgImage ? '48px' : '0',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Restaurant Logo/Header */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          marginBottom: '48px'
        }}>
          {restaurant.logo_url ? (
            <img 
              src={restaurant.logo_url} 
              alt={restaurant.name} 
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                marginBottom: '48px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              textAlign: 'center',
              margin: '32px 0',
              color: '#2d3748'
            }}>
              {restaurant.name}
            </h1>
          )}
        </div>

        {/* Menu Categories */}
        <div style={{ width: '100%' }}>
          {categories.map((category) => (
            <div key={category.id} style={{ marginBottom: '48px' }}>
              
              {/* Category Header with Painting Style */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '32px',
                position: 'relative'
              }}>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  textAlign: 'center',
                  color: '#c8a97e',
                  paddingBottom: '16px',
                  margin: 0,
                  position: 'relative',
                  zIndex: 10
                }}>
                  {category.name}
                </h2>
                {/* Decorative underline */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '96px',
                  height: '2px',
                  backgroundColor: '#c8a97e'
                }}></div>
              </div>

              {/* Menu Items */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px' 
              }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #d2b48c',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s ease'
                  }}>
                    
                    {/* Item Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: item.description ? '12px' : '0'
                    }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        margin: 0,
                        flex: 1,
                        lineHeight: '1.4'
                      }}>
                        {item.name}
                      </h3>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#c8a97e',
                        marginLeft: isArabic ? '0' : '16px',
                        marginRight: isArabic ? '16px' : '0',
                        whiteSpace: 'nowrap'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    
                    {/* Item Description */}
                    {item.description && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#4a5568', 
                        lineHeight: '1.5',
                        margin: 0,
                        fontStyle: 'italic'
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '48px', 
          textAlign: 'center',
          padding: '24px 0',
          borderTop: '2px solid #d2b48c'
        }}>
          <p style={{ 
            color: '#c8a97e', 
            fontWeight: '500',
            fontSize: '16px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            {isArabic ? 'صُنع بحب' : 'Handcrafted with love'}
          </p>
          {restaurant.address && (
            <p style={{ 
              color: '#4a5568', 
              fontSize: '14px',
              margin: '8px 0 0 0'
            }}>
              {restaurant.address}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}