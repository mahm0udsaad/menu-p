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

interface VintageBakeryPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function VintageBakeryPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: VintageBakeryPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#fef7ed', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Georgia, serif',
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(217, 119, 6, 0.1) 0%, transparent 50%)
      `
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            border: '3px double #d97706',
            padding: '40px',
            marginBottom: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#92400e',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: 0
            }}>
              {restaurant.name || 'VINTAGE BAKERY'}
            </h1>
            <div style={{
              width: '100px',
              height: '2px',
              backgroundColor: '#d97706',
              margin: '0 auto 16px'
            }}></div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '400', 
              color: '#a16207',
              margin: 0,
              fontStyle: 'italic'
            }}>
              Est. 1950
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #fbbf24'
            }}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #fbbf24',
                marginBottom: '24px',
                paddingBottom: '16px',
                position: 'relative'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#92400e',
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
                  backgroundColor: '#d97706'
                }}></div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '20px',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    backgroundColor: '#fef7ed'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#92400e',
                        margin: '0 0 8px 0',
                        fontFamily: 'Georgia, serif'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#a16207', 
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
                      color: '#d97706',
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
          borderTop: '2px solid #fbbf24'
        }}>
          <p style={{ 
            color: '#92400e', 
            fontWeight: '500',
            fontSize: '18px',
            margin: '0 0 8px 0',
            fontStyle: 'italic'
          }}>
            "Baked with love since 1950"
          </p>
          <p style={{ 
            color: '#a16207', 
            fontWeight: '600',
            fontSize: '16px',
            margin: 0
          }}>
            {restaurant.address || 'Fresh bread daily'}
          </p>
        </div>
      </div>
    </div>
  )
}
