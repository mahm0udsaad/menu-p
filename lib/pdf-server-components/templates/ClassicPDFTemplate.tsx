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

interface ClassicPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function ClassicPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ClassicPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#f5f1eb', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Georgia, serif'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Title */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ 
            fontSize: '96px', 
            fontWeight: '700', 
            letterSpacing: '0.1em',
            color: '#000000',
            marginBottom: '16px',
            margin: 0
          }}>
            MENU
          </h1>
          {restaurant.name && (
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '16px 0 0 0'
            }}>
              {restaurant.name}
            </h2>
          )}
          <div style={{ 
            width: '100%', 
            height: '1px', 
            backgroundColor: '#000000',
            marginTop: '16px'
          }}></div>
        </div>

        {/* Menu Content - Two Column Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '64px' 
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {categories.slice(0, Math.ceil(categories.length / 2)).map((category) => (
              <div key={category.id}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  {category.name}.
                </h2>
                <div style={{ 
                  width: '100%', 
                  height: '1px', 
                  backgroundColor: '#000000',
                  marginBottom: '24px'
                }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {category.menu_items.map((item) => (
                    <div key={item.id}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{ 
                          fontSize: '18px', 
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {item.name}
                        </h3>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: '700',
                          marginLeft: '16px'
                        }}>
                          {currency}{item.price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      {item.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#374151', 
                          lineHeight: 1.6,
                          paddingRight: '32px',
                          margin: '4px 0 0 0'
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

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {categories.slice(Math.ceil(categories.length / 2)).map((category) => (
              <div key={category.id}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  {category.name}.
                </h2>
                <div style={{ 
                  width: '100%', 
                  height: '1px', 
                  backgroundColor: '#000000',
                  marginBottom: '24px'
                }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {category.menu_items.map((item) => (
                    <div key={item.id}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{ 
                          fontSize: '18px', 
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {item.name}
                        </h3>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: '700',
                          marginLeft: '16px'
                        }}>
                          {currency}{item.price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      {item.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#374151', 
                          lineHeight: 1.6,
                          paddingRight: '32px',
                          margin: '4px 0 0 0'
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
        </div>
      </div>
    </div>
  )
}
