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
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: '#2d3748',
            marginBottom: '16px',
            margin: 0
          }}>
            {restaurant.name || 'COFFEE SHOP'}
          </h1>
          <div style={{
            width: '60px',
            height: '2px',
            backgroundColor: '#8b4513',
            margin: '0 auto 16px'
          }}></div>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '400', 
            color: '#718096',
            margin: 0
          }}>
            Menu
          </h2>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '20px',
                paddingBottom: '12px'
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: '#2d3748',
                  margin: 0
                }}>
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        margin: '0 0 4px 0'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#718096', 
                          lineHeight: 1.4,
                          margin: 0
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#8b4513',
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

        {/* Footer */}
        <div style={{ 
          marginTop: '48px', 
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ 
            color: '#718096', 
            fontWeight: '500',
            fontSize: '14px',
            margin: 0
          }}>
            Fresh coffee, every day
          </p>
        </div>
      </div>
    </div>
  )
}
