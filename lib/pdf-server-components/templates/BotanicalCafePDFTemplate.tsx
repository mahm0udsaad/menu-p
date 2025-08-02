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

interface BotanicalCafePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function BotanicalCafePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: BotanicalCafePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#f0f9ff', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Georgia, serif',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
      `
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.1)',
            border: '2px solid #dcfce7'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#166534',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0
            }}>
              {restaurant.name || 'BOTANICAL CAFE'}
            </h1>
            <div style={{
              width: '100px',
              height: '3px',
              backgroundColor: '#22c55e',
              margin: '0 auto 16px',
              borderRadius: '2px'
            }}></div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '500', 
              color: '#16a34a',
              margin: 0
            }}>
              Fresh & Natural
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1)',
              border: '2px solid #dcfce7'
            }}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #dcfce7',
                marginBottom: '24px',
                paddingBottom: '16px',
                position: 'relative'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '600', 
                  color: '#166534',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {category.name}
                </h3>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '60px',
                  height: '2px',
                  backgroundColor: '#22c55e'
                }}></div>
              </div>

              {/* Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #bbf7d0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: '#22c55e'
                    }}></div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#166534',
                        margin: 0,
                        flex: 1
                      }}>
                        {item.name}
                      </h4>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#22c55e',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#15803d', 
                        lineHeight: 1.5,
                        margin: 0
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
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1)',
            border: '2px solid #dcfce7'
          }}>
            <p style={{ 
              color: '#22c55e', 
              fontWeight: '600',
              fontSize: '18px',
              margin: '0 0 8px 0'
            }}>
              🌿 Fresh ingredients, natural flavors 🌿
            </p>
            <p style={{ 
              color: '#16a34a', 
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}>
              {restaurant.address || 'Where nature meets taste'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
