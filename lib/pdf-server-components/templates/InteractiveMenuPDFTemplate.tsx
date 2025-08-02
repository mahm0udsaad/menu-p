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

interface InteractiveMenuPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function InteractiveMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: InteractiveMenuPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#0f172a', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundImage: `
        linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        linear-gradient(45deg, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
      `
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '20px',
            padding: '40px',
            marginBottom: '32px',
            border: '2px solid #3b82f6',
            backdropFilter: 'blur(10px)'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              color: '#ffffff',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: 0,
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {restaurant.name || 'INTERACTIVE'}
            </h1>
            <div style={{
              width: '120px',
              height: '3px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              margin: '0 auto 16px',
              borderRadius: '2px'
            }}></div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '500', 
              color: '#93c5fd',
              margin: 0,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Digital Menu Experience
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #3b82f6',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
              }}></div>
              
              {/* Category Header */}
              <div style={{
                borderBottom: '1px solid #3b82f6',
                marginBottom: '24px',
                paddingBottom: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#3b82f6',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #3b82f6',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)'
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
                        color: '#ffffff',
                        margin: 0,
                        flex: 1,
                        paddingLeft: '12px'
                      }}>
                        {item.name}
                      </h4>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#3b82f6',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#93c5fd', 
                        lineHeight: 1.5,
                        margin: 0,
                        paddingLeft: '12px'
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
          marginTop: '64px', 
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #3b82f6',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ 
              color: '#3b82f6', 
              fontWeight: '600',
              fontSize: '18px',
              margin: '0 0 8px 0'
            }}>
              🚀 Interactive • Dynamic • Modern
            </p>
            <p style={{ 
              color: '#93c5fd', 
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}>
              {restaurant.address || 'Experience the future of dining'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
