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

interface VintagePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function VintagePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: VintagePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#f4f1ea', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Times New Roman, serif',
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
      `
    }}>
      <div style={{ 
        maxWidth: '1024px', 
        margin: '0 auto',
        backgroundColor: '#faf9f5',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '48px',
        border: '2px solid #8b7355'
      }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            border: '3px double #8b7355',
            padding: '32px',
            marginBottom: '32px'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#2d1810',
              marginBottom: '16px',
              fontFamily: 'Georgia, serif',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: 0
            }}>
              {restaurant.name || 'RESTAURANT'}
            </h1>
            <div style={{
              width: '100px',
              height: '2px',
              backgroundColor: '#8b7355',
              margin: '0 auto 16px'
            }}></div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '400', 
              color: '#5d4037',
              fontStyle: 'italic',
              margin: 0
            }}>
              Est. 1920
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #8b7355',
                marginBottom: '24px',
                paddingBottom: '12px',
                position: 'relative'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#2d1810',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: 'Georgia, serif'
                }}>
                  {category.name}
                </h3>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '60px',
                  height: '2px',
                  backgroundColor: '#d4af37'
                }}></div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '16px',
                    border: '1px solid #d4af37',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#2d1810',
                        margin: '0 0 8px 0',
                        fontFamily: 'Georgia, serif'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#5d4037', 
                          lineHeight: 1.5,
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: '#8b7355',
                      marginLeft: '24px',
                      fontFamily: 'Georgia, serif'
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
          borderTop: '2px solid #8b7355'
        }}>
          <p style={{ 
            color: '#5d4037', 
            fontWeight: '500',
            fontSize: '16px',
            margin: '0 0 8px 0',
            fontStyle: 'italic'
          }}>
            "Good food is the foundation of genuine happiness"
          </p>
          <p style={{ 
            color: '#8b7355', 
            fontWeight: '600',
            fontSize: '14px',
            margin: 0
          }}>
            {restaurant.address || 'Visit us for an unforgettable experience'}
          </p>
        </div>
      </div>
    </div>
  )
}
