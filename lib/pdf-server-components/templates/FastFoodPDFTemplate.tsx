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

interface FastFoodPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function FastFoodPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: FastFoodPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{
      backgroundColor: '#F5E6D3',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#C41E3A',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0
            }}>
              {restaurant.name || 'FAST FOOD'}
            </h1>
            <div style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#C41E3A',
              margin: '0 auto 16px'
            }}></div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#374151',
              margin: 0
            }}>
              MENU
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Category Header */}
              <div style={{
                borderBottom: '3px solid #C41E3A',
                marginBottom: '24px',
                paddingBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#C41E3A',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: '#F5E6D3',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #C41E3A',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: '#C41E3A'
                    }}></div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#C41E3A',
                        margin: 0,
                        flex: 1,
                        textTransform: 'uppercase'
                      }}>
                        {item.name}
                      </h4>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#C41E3A',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{
                        fontSize: '14px',
                        color: '#7c2d12',
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
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #C41E3A'
          }}>
            <p style={{
              color: '#C41E3A',
              fontWeight: '700',
              fontSize: '18px',
              margin: '0 0 8px 0',
              textTransform: 'uppercase'
            }}>
              Fast • Fresh • Delicious
            </p>
            <p style={{
              color: '#7c2d12',
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}>
              {restaurant.address || 'Visit us today!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
