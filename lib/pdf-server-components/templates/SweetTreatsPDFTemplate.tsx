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
      minHeight: '100vh',
      backgroundColor: '#fdf2f8'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '64px 0',
        color: '#ffffff',
        backgroundColor: '#FF7F7F'
      }}>
        <h1 style={{
          fontSize: '64px',
          fontWeight: '700',
          marginBottom: '16px',
          color: '#ec4899',
          fontFamily: '"Dancing Script", cursive',
          margin: 0
        }}>
          Sweet Treats
        </h1>
        <div style={{
          fontSize: '18px',
          letterSpacing: '0.3em',
          fontWeight: '300'
        }}>• M E N U •</div>
      </div>
      
      {/* Menu content */}
      <div style={{
        maxWidth: '512px',
        margin: '0 auto',
        padding: '64px 32px'
      }}>

        {categories.map((category) => (
          <div key={category.id} style={{ marginBottom: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '40px',
                fontWeight: '700',
                color: '#ec4899',
                marginBottom: '16px',
                margin: 0
              }}>
                {category.name}
              </h3>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxWidth: '448px',
              margin: '0 auto'
            }}>
              {category.menu_items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #fce7f3'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ec4899',
                      margin: 0
                    }}>
                      {item.name}
                    </h4>
                    {item.description && (
                      <p style={{
                        fontSize: '12px',
                        color: '#be185d',
                        margin: '4px 0 0 0',
                        lineHeight: 1.4
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#ec4899',
                    marginLeft: '16px'
                  }}>
                    {currency}{(item.price || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom decorative border */}
      <div style={{
        height: '64px',
        backgroundColor: '#FF7F7F',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
      }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          paddingBottom: '8px'
        }}>
          {/* Decorative bars */}
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              opacity: 0.8,
              width: '8px',
              height: `${Math.floor(Math.random() * 30) + 20}px`
            }} />
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        backgroundColor: '#fdf2f8',
        padding: '32px',
        textAlign: 'center'
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
  )
}
