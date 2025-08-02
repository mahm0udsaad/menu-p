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

interface BorcelleCoffeePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function BorcelleCoffeePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: BorcelleCoffeePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{
      background: 'linear-gradient(to bottom right, #fffbeb, #fff7ed)',
      minHeight: '100vh',
      padding: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#78350f'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#78350f',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            margin: 0
          }}>
            {restaurant.name || 'BORCELLE'}
          </h1>
          <div style={{
            width: '80px',
            height: '2px',
            backgroundColor: '#d97706',
            margin: '0 auto 16px'
          }}></div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '400',
            color: '#d97706',
            margin: 0,
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Premium Coffee & Pastries
          </h2>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '1px solid #d97706',
                marginBottom: '24px',
                paddingBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#78350f',
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
                    backgroundColor: '#fff7ed',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #fed7aa'
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
                        color: '#78350f',
                        margin: 0,
                        flex: 1
                      }}>
                        {item.name}
                      </h4>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#b45309',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{
                        fontSize: '14px',
                        color: '#92400e',
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
          marginTop: '64px',
          textAlign: 'center',
          padding: '32px',
          borderTop: '1px solid #d97706'
        }}>
          <p style={{
            color: '#d97706',
            fontWeight: '500',
            fontSize: '16px',
            margin: '0 0 8px 0'
          }}>
            Crafted with passion, served with excellence
          </p>
          <p style={{
            color: '#78350f',
            fontWeight: '400',
            fontSize: '14px',
            margin: 0
          }}>
            {restaurant.address || 'Experience the art of coffee'}
          </p>
        </div>
      </div>
    </div>
  )
}
