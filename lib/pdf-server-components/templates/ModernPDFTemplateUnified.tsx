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

interface ModernPDFTemplateUnifiedProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function ModernPDFTemplateUnified({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ModernPDFTemplateUnifiedProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          {restaurant.logo_url && (
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#f3f4f6'
            }}>
              <img 
                src={restaurant.logo_url} 
                alt="Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px',
            letterSpacing: '0.1em',
            margin: 0
          }}>
            {restaurant.name || 'RESTAURANT'}
          </h1>
          <div style={{ 
            width: '60px', 
            height: '3px', 
            backgroundColor: '#3b82f6',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#6b7280',
            margin: 0
          }}>
            MENU
          </h2>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '32px',
                gap: '16px'
              }}>
                <div style={{
                  width: '4px',
                  height: '32px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '2px'
                }}></div>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#111827',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '32px' 
              }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#111827',
                        margin: 0,
                        flex: 1
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
                        color: '#6b7280', 
                        lineHeight: 1.6,
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
          marginTop: '64px', 
          padding: '32px',
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#6b7280', 
            fontWeight: '500',
            margin: '0 0 8px 0'
          }}>
            Thank you for choosing us
          </p>
          <p style={{ 
            color: '#111827', 
            fontWeight: '600',
            margin: 0
          }}>
            {restaurant.address || 'Visit us today'}
          </p>
        </div>
      </div>
    </div>
  )
}
