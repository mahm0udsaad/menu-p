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

interface ChalkboardCoffeePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function ChalkboardCoffeePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ChalkboardCoffeePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#2d3748', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
      `
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            border: '3px solid #ffffff',
            padding: '40px',
            marginBottom: '32px',
            borderRadius: '8px'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#ffffff',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              {restaurant.name || 'COFFEE SHOP'}
            </h1>
            <div style={{
              width: '100px',
              height: '2px',
              backgroundColor: '#ffffff',
              margin: '0 auto 16px'
            }}></div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '400', 
              color: '#e2e8f0',
              margin: 0,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Today's Specials
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #ffffff',
                marginBottom: '24px',
                paddingBottom: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#ffffff',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                }}>
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '20px',
                    border: '2px solid #ffffff',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%'
                    }}></div>
                    <div style={{ flex: 1, paddingLeft: '24px' }}>
                      <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '16px', 
                          color: '#e2e8f0', 
                          lineHeight: 1.5,
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: '#ffffff',
                      marginLeft: '24px',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                    }}>
                      {currency}{item.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '64px', 
          textAlign: 'center',
          padding: '32px',
          borderTop: '2px solid #ffffff'
        }}>
          <p style={{ 
            color: '#e2e8f0', 
            fontWeight: '500',
            fontSize: '18px',
            margin: '0 0 8px 0',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            "Fresh coffee, every morning"
          </p>
          <p style={{ 
            color: '#ffffff', 
            fontWeight: '600',
            fontSize: '16px',
            margin: 0,
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            {restaurant.address || 'Visit us today!'}
          </p>
        </div>
      </div>
    </div>
  )
}
