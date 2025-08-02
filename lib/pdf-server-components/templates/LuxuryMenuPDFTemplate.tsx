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

interface LuxuryMenuPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function LuxuryMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: LuxuryMenuPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#0f0f0f', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      backgroundImage: `
        linear-gradient(45deg, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
        linear-gradient(-45deg, rgba(212, 175, 55, 0.05) 0%, transparent 50%)
      `
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{
            border: '3px solid #d4af37',
            padding: '48px',
            marginBottom: '32px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'linear-gradient(45deg, #d4af37, #f4e4bc, #d4af37)',
              zIndex: -1
            }}></div>
            <h1 style={{ 
              fontSize: '56px', 
              fontWeight: '300', 
              color: '#ffffff',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              margin: 0
            }}>
              {restaurant.name || 'LUXURY'}
            </h1>
            <div style={{
              width: '120px',
              height: '1px',
              backgroundColor: '#d4af37',
              margin: '0 auto 24px'
            }}></div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '400', 
              color: '#d4af37',
              margin: 0,
              letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}>
              Fine Dining Experience
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #d4af37',
                marginBottom: '32px',
                paddingBottom: '20px',
                position: 'relative'
              }}>
                <h3 style={{ 
                  fontSize: '32px', 
                  fontWeight: '300', 
                  color: '#d4af37',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em'
                }}>
                  {category.name}
                </h3>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '80px',
                  height: '2px',
                  backgroundColor: '#ffffff'
                }}></div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '32px',
                    border: '1px solid #333333',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: '#d4af37'
                    }}></div>
                    <div style={{ flex: 1, paddingLeft: '20px' }}>
                      <h4 style={{ 
                        fontSize: '22px', 
                        fontWeight: '400', 
                        color: '#ffffff',
                        margin: '0 0 12px 0',
                        letterSpacing: '0.1em'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '16px', 
                          color: '#cccccc', 
                          lineHeight: 1.6,
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '28px', 
                      fontWeight: '300', 
                      color: '#d4af37',
                      marginLeft: '40px',
                      letterSpacing: '0.1em'
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
          marginTop: '80px', 
          textAlign: 'center',
          padding: '48px',
          borderTop: '2px solid #d4af37'
        }}>
          <p style={{ 
            color: '#d4af37', 
            fontWeight: '300',
            fontSize: '18px',
            margin: '0 0 16px 0',
            letterSpacing: '0.1em'
          }}>
            "Excellence is never an accident"
          </p>
          <p style={{ 
            color: '#cccccc', 
            fontWeight: '400',
            fontSize: '16px',
            margin: 0
          }}>
            {restaurant.address || 'Where luxury meets culinary artistry'}
          </p>
        </div>
      </div>
    </div>
  )
}
