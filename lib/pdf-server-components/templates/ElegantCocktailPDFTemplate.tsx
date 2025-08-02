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

interface ElegantCocktailPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function ElegantCocktailPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ElegantCocktailPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh', 
      padding: '48px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            border: '2px solid #d4af37',
            padding: '48px',
            marginBottom: '32px'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '300', 
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '0.3em',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              {restaurant.name || 'COCKTAIL BAR'}
            </h1>
            <div style={{
              width: '120px',
              height: '1px',
              backgroundColor: '#d4af37',
              margin: '0 auto 16px'
            }}></div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '400', 
              color: '#d4af37',
              margin: 0,
              letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}>
              Signature Cocktails
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '1px solid #d4af37',
                marginBottom: '32px',
                paddingBottom: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '32px', 
                  fontWeight: '300', 
                  color: '#d4af37',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em'
                }}>
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '24px',
                    border: '1px solid #333333',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: '400', 
                        color: '#ffffff',
                        margin: '0 0 8px 0',
                        letterSpacing: '0.1em'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#cccccc', 
                          lineHeight: 1.6,
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: '300', 
                      color: '#d4af37',
                      marginLeft: '32px',
                      letterSpacing: '0.1em'
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
          marginTop: '64px', 
          textAlign: 'center',
          padding: '32px',
          borderTop: '1px solid #d4af37'
        }}>
          <p style={{ 
            color: '#d4af37', 
            fontWeight: '300',
            fontSize: '16px',
            margin: '0 0 8px 0',
            letterSpacing: '0.1em'
          }}>
            "Crafting moments, one cocktail at a time"
          </p>
          <p style={{ 
            color: '#cccccc', 
            fontWeight: '400',
            fontSize: '14px',
            margin: 0
          }}>
            {restaurant.address || 'Experience the art of mixology'}
          </p>
        </div>
      </div>
    </div>
  )
}
