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
      background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5)',
      minHeight: '100vh',
      padding: '48px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            background: 'linear-gradient(to right, #d97706, #ea580c)',
            padding: '32px',
            borderRadius: '12px'
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '8px',
              margin: 0
            }}>
              {restaurant.name || 'COFFEE SHOP'}
            </h1>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '400',
              color: '#fef3c7',
              margin: 0
            }}>
              Fresh Coffee & Delicious Treats
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #fcd34d',
                marginBottom: '20px',
                paddingBottom: '12px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#78350f',
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
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#78350f',
                        margin: '0 0 4px 0'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{
                          fontSize: '14px',
                          color: '#92400e',
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
                      color: '#b45309',
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
          backgroundColor: '#92400e',
          borderRadius: '8px'
        }}>
          <p style={{
            color: '#ffffff',
            fontWeight: '500',
            fontSize: '14px',
            margin: 0
          }}>
            Thank you for choosing {restaurant.name}
          </p>
        </div>
      </div>
    </div>
  )
}
