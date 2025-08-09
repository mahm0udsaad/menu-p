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

interface ModernPDFTemplateUnifiedProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function ModernPDFTemplateUnified({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ModernPDFTemplateUnifiedProps) {
  const currency = restaurant.currency || '$'
  const isArabic = language === 'ar'
  
  return (
    <div style={{ 
      minHeight: '1123px',
      padding: '64px',
      position: 'relative',
      background: 'linear-gradient(135deg, #fef7ed 0%, #fef3c7 50%, #fed7aa 100%)',
      fontFamily: 'Arial, sans-serif',
      direction: isArabic ? 'rtl' : 'ltr'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '256px',
        height: '256px',
        background: 'linear-gradient(225deg, #fb923c 0%, transparent 70%)',
        borderRadius: '50%',
        opacity: '0.3',
        transform: 'translate(128px, -128px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '384px',
        height: '384px',
        background: 'linear-gradient(45deg, #f59e0b 0%, transparent 70%)',
        borderRadius: '50%',
        opacity: '0.2',
        transform: 'translate(-192px, 192px)'
      }}></div>

      <div style={{ 
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        maxWidth: '1024px',
        margin: '0 auto'
      }}>
        
        {/* Coffee Bean Decorations */}
        <div style={{
          position: 'absolute',
          left: '32px',
          top: '128px',
          width: '128px',
          height: '128px',
          opacity: '0.2'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#92400e',
            borderRadius: '50%',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: '8px',
              backgroundColor: '#78350f',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '4px',
              height: '64px',
              backgroundColor: '#d97706',
              transform: 'translate(-50%, -50%) rotate(12deg)'
            }}></div>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          left: '64px',
          bottom: '128px',
          width: '96px',
          height: '96px',
          opacity: '0.15'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#92400e',
            borderRadius: '50%',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: '8px',
              backgroundColor: '#78350f',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '4px',
              height: '48px',
              backgroundColor: '#d97706',
              transform: 'translate(-50%, -50%) rotate(45deg)'
            }}></div>
          </div>
        </div>

        {/* Menu Header */}
        <div style={{ 
          textAlign: isArabic ? 'right' : 'left', 
          marginBottom: '96px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '64px' }}>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#111827',
              marginBottom: '16px',
              letterSpacing: '0.1em',
              margin: '0 0 16px 0'
            }}>
              {restaurant?.name?.toUpperCase() || 'BORCELLE'}
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#374151', 
              fontWeight: '500',
              letterSpacing: '0.1em',
              margin: 0
            }}>
              COFFEESHOP
            </p>
          </div>
          <div style={{ 
            textAlign: isArabic ? 'left' : 'right'
          }}>
            <h2 style={{ 
              fontSize: '128px', 
              fontWeight: '900', 
              color: '#111827',
              letterSpacing: '0',
              margin: 0,
              lineHeight: '0.9'
            }}>
              {isArabic ? 'قائمة الطعام' : 'MENU'}
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '96px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              position: 'relative',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '32px',
              padding: '64px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.2)'
            }}>
              {/* Category Header */}
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ 
                  fontSize: '36px', 
                  fontWeight: '900', 
                  color: '#111827',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                minHeight: '50px'
              }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '24px 32px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '16px',
                    border: '1px solid rgba(251, 146, 60, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#111827',
                        margin: '0 0 8px 0'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '16px', 
                          color: '#6b7280', 
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: isArabic ? '0' : '32px',
                      marginRight: isArabic ? '32px' : '0'
                    }}>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#ea580c',
                        background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '128px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: '48px',
            border: '1px solid rgba(251, 146, 60, 0.2)'
          }}>
            <p style={{ 
              color: '#374151', 
              fontWeight: '500',
              margin: '0 0 16px 0',
              fontSize: '16px'
            }}>
              {isArabic ? 'متاح من' : 'Available at'}
            </p>
            <p style={{ 
              color: '#111827', 
              fontWeight: '700',
              margin: 0,
              fontSize: '24px'
            }}>
              9:00 am - 10:00 pm
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}