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
      background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5)',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header with decorative elements */}
        <div style={{
          background: 'linear-gradient(to right, #fef3c7, #fde68a)',
          border: '4px solid #C41E3A',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
          position: 'relative'
        }}>
          {/* Header content */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              fontSize: '14px',
              color: '#C41E3A',
              fontWeight: '500',
              letterSpacing: '0.3em',
              marginBottom: '8px'
            }}>B O R C E L L E</div>
            <h1 style={{
              fontSize: '64px',
              fontWeight: '900',
              color: '#C41E3A',
              letterSpacing: '0.1em',
              margin: 0,
              textTransform: 'uppercase'
            }}>MENU</h1>
          </div>
          
          {/* Decorative line */}
          <div style={{
            borderTop: '4px dashed #C41E3A',
            marginBottom: '32px'
          }}></div>

          {/* Menu grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            {categories.slice(0, 4).map((category) => (
              <div key={category.id} style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  color: '#C41E3A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '16px'
                }}>
                  {category.name}
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  {category.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#92400e',
                      margin: 0
                    }}>
                      {category.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {category.menu_items.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px dotted #C41E3A'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#92400e',
                          margin: 0
                        }}>
                          {item.name}
                        </h4>
                        {item.description && (
                          <p style={{
                            fontSize: '12px',
                            color: '#92400e',
                            margin: '4px 0 0 0',
                            lineHeight: 1.4
                          }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '900',
                        color: '#C41E3A',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional categories */}
          {categories.length > 4 && (
            <div style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px'
            }}>
              {categories.slice(4).map((category) => (
                <div key={category.id} style={{ textAlign: 'center' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '900',
                    color: '#C41E3A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '16px'
                  }}>
                    {category.name}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {category.menu_items.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px dotted #C41E3A'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#92400e',
                            margin: 0
                          }}>
                            {item.name}
                          </h4>
                          {item.description && (
                            <p style={{
                              fontSize: '12px',
                              color: '#92400e',
                              margin: '4px 0 0 0'
                            }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '900',
                          color: '#C41E3A',
                          marginLeft: '16px'
                        }}>
                          {currency}{item.price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Bottom decorative border */}
          <div style={{
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: '4px solid #C41E3A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}></div>
            <div style={{ flex: 1 }}></div>
          </div>
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
