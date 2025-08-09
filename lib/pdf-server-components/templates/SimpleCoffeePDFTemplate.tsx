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

interface SimpleCoffeePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function SimpleCoffeePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: SimpleCoffeePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{
      backgroundColor: '#fffbeb',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '16px',
      color: '#2d3748'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '300',
            color: '#92400e',
            marginBottom: '8px'
          }}>
            {restaurant.name || 'Coffee Shop'}
          </h1>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#92400e',
            marginBottom: '16px'
          }}>
            MENU
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <svg width="100" height="20" viewBox="0 0 100 20">
              <path d="M0 10 Q25 0 50 10 T100 10" stroke="#92400e" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

        {/* Menu Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {categories.slice(0, 4).map((category) => (
            <div key={category.id} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '24px',
              padding: '24px',
              border: '2px solid #fde68a',
              height: '100%'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#92400e',
                marginBottom: '24px',
                textAlign: 'center',
                textTransform: 'uppercase'
              }}>
                {category.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#92400e',
                      fontWeight: '500'
                    }}>
                      {item.name}
                    </span>
                    <div style={{ marginLeft: '24px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1f2937'
                      }}>
                        {currency}{item.price || 0}
                      </span>
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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '32px'
          }}>
            {categories.slice(4).map((category) => (
              <div key={category.id} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '24px',
                padding: '24px',
                border: '2px solid #fde68a',
                height: '100%'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#92400e',
                  marginBottom: '24px',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {category.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {category.menu_items.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        color: '#92400e',
                        fontWeight: '500'
                      }}>
                        {item.name}
                      </span>
                      <div style={{ marginLeft: '24px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#1f2937'
                        }}>
                          {currency}{item.price || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div style={{
          backgroundColor: '#92400e',
          color: '#ffffff',
          textAlign: 'center',
          padding: '16px',
          borderRadius: '16px'
        }}>
          <p style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: 0
          }}>
            OPEN DAILY 10 AM - 10 PM
          </p>
        </div>
      </div>
    </div>
  )
}
