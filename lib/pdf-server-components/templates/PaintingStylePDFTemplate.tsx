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

interface PaintingStylePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function PaintingStylePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: PaintingStylePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#f5f1e8', 
      minHeight: '100vh', 
      padding: '64px',
      fontFamily: 'Georgia, serif',
      backgroundImage: 'url(/assets/painting-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        backgroundColor: '#f5f1e8',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '48px'
      }}>
        {/* Restaurant Logo/Name */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          {restaurant.logo_url ? (
            <img 
              src={restaurant.logo_url} 
              alt={restaurant.name} 
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                marginBottom: '48px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#2d3748',
              margin: '32px 0',
              textAlign: 'center'
            }}>
              {restaurant.name}
            </h1>
          )}
        </div>

        {/* Menu Content */}
        <div style={{ maxWidth: '450px', margin: '0 auto' }}>
          {categories.map((category) => (
            <div key={category.id} style={{ marginBottom: '32px' }}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #8b4513',
                marginBottom: '16px',
                paddingBottom: '8px'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#8b4513',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {category.name}
                </h2>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #d2b48c',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        margin: 0,
                        flex: 1
                      }}>
                        {item.name}
                      </h3>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#8b4513',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#4a5568', 
                        lineHeight: 1.5,
                        margin: 0,
                        fontStyle: 'italic'
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
          textAlign: 'center',
          padding: '24px',
          borderTop: '2px solid #d2b48c'
        }}>
          <p style={{ 
            color: '#8b4513', 
            fontWeight: '500',
            fontSize: '16px',
            margin: 0
          }}>
            Handcrafted with love
          </p>
        </div>
      </div>
    </div>
  )
}
