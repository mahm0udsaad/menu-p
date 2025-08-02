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

interface SweetTreatsPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function SweetTreatsPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: SweetTreatsPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#fdf2f8', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Arial, sans-serif',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(244, 114, 182, 0.1) 0%, transparent 50%)
      `
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 25px -5px rgba(236, 72, 153, 0.1)',
            border: '2px solid #fce7f3'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              color: '#ec4899',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0
            }}>
              {restaurant.name || 'SWEET TREATS'}
            </h1>
            <div style={{
              width: '100px',
              height: '3px',
              backgroundColor: '#ec4899',
              margin: '0 auto 16px',
              borderRadius: '2px'
            }}></div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#be185d',
              margin: 0
            }}>
              Dessert Menu
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.1)',
              border: '2px solid #fce7f3'
            }}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #fce7f3',
                marginBottom: '24px',
                paddingBottom: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#be185d',
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
                    backgroundColor: '#fdf2f8',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #fce7f3',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: '#ec4899'
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
                        color: '#be185d',
                        margin: 0,
                        flex: 1
                      }}>
                        {item.name}
                      </h4>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#ec4899',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#9d174d', 
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
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.1)',
            border: '2px solid #fce7f3'
          }}>
            <p style={{ 
              color: '#ec4899', 
              fontWeight: '600',
              fontSize: '18px',
              margin: '0 0 8px 0'
            }}>
              🍰 Sweet dreams are made of these 🍰
            </p>
            <p style={{ 
              color: '#be185d', 
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}>
              {restaurant.address || 'Indulge in sweetness today!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
