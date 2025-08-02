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

interface ChalkboardCoffeePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

// Chalk-style SVG components mirrored from the preview
const ChalkCoffeeBean = ({ style = {} }) => (
  <svg width="40" height="30" viewBox="0 0 40 30" style={{ position: 'absolute', ...style }}>
    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="20" cy="15" rx="15" ry="12" />
      <ellipse cx="20" cy="15" rx="10" ry="8" />
      <path d="M15 10c2-1 4-1 6 0" />
    </g>
  </svg>
)

const ChalkCoffeeCup = ({ style = {} }) => (
  <svg width="60" height="50" viewBox="0 0 60 50" style={{ position: 'absolute', ...style }}>
    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="25" cy="40" rx="20" ry="6" />
      <path d="M5 40 Q10 20 15 15 Q20 10 25 10 Q30 10 35 15 Q40 20 45 40" />
      <ellipse cx="25" cy="15" rx="15" ry="4" />
      <path d="M45 25 Q55 25 55 35 Q55 40 45 40" />
      <path d="M15 20 Q20 25 25 30 Q30 25 35 20" strokeWidth="1" />
    </g>
  </svg>
)

const ChalkArrow = ({ style = {} }) => (
  <svg width="80" height="20" viewBox="0 0 80 20" style={{ position: 'absolute', ...style }}>
    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M5 10 Q20 8 40 10 Q60 12 70 10" />
      <path d="M65 6 L70 10 L65 14" />
    </g>
  </svg>
)

const ChalkLeaf = ({ style = {} }) => (
  <svg width="50" height="80" viewBox="0 0 50 80" style={{ position: 'absolute', ...style }}>
    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M25 5 Q35 20 40 40 Q35 60 25 75 Q15 60 10 40 Q15 20 25 5" />
      <path d="M25 15 Q30 25 35 35 Q30 45 25 55 Q20 45 15 35 Q20 25 25 15" />
      <path d="M25 5 L25 75" strokeWidth="1" />
    </g>
  </svg>
)

export default function ChalkboardCoffeePDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations,
  pdfMode = false
}: ChalkboardCoffeePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{
      background: `
        radial-gradient(circle at 20% 30%, rgba(64,64,64,0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(96,96,96,0.2) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(48,48,48,0.4) 0%, transparent 50%),
        linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #0f0f0f 100%)
      `,
      minHeight: '100vh',
      padding: '48px',
      fontFamily: 'cursive',
      color: '#ffffff',
      position: 'relative'
    }}>
      {/* Chalk texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.2,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
          radial-gradient(circle at 75% 75%, white 0.5px, transparent 0.5px),
          radial-gradient(circle at 50% 50%, white 0.8px, transparent 0.8px)
        `,
        backgroundSize: '100px 100px, 150px 150px, 80px 80px'
      }}></div>

      {/* Decorative chalk elements */}
      <ChalkCoffeeBean style={{ left: '-40px', top: '160px', opacity: 0.4, transform: 'rotate(12deg)' }} />
      <ChalkCoffeeCup style={{ right: '-60px', top: '200px', opacity: 0.3, transform: 'rotate(-12deg)' }} />
      <ChalkLeaf style={{ left: '-30px', bottom: '200px', opacity: 0.35, transform: 'rotate(45deg)' }} />
      <ChalkCoffeeBean style={{ right: '-40px', bottom: '240px', opacity: 0.4, transform: 'rotate(-30deg)' }} />

      <div style={{ maxWidth: '1024px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            border: '3px solid #ffffff',
            padding: '40px',
            marginBottom: '32px',
            borderRadius: '8px'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#ffffff',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              {restaurant.name || 'COFFEE SHOP'}
            </h1>
            <div style={{
              width: '100px',
              height: '2px',
              backgroundColor: '#ffffff',
              margin: '0 auto 16px'
            }}></div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '400', 
              color: '#e2e8f0',
              margin: 0,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Today's Specials
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #ffffff',
                marginBottom: '24px',
                paddingBottom: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#ffffff',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                }}>
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '20px',
                    border: '2px solid #ffffff',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%'
                    }}></div>
                    <div style={{ flex: 1, paddingLeft: '24px' }}>
                      <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                      }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ 
                          fontSize: '16px', 
                          color: '#e2e8f0', 
                          lineHeight: 1.5,
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: '#ffffff',
                      marginLeft: '24px',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
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
          borderTop: '2px solid #ffffff'
        }}>
          <p style={{ 
            color: '#e2e8f0', 
            fontWeight: '500',
            fontSize: '18px',
            margin: '0 0 8px 0',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            "Fresh coffee, every morning"
          </p>
          <p style={{ 
            color: '#ffffff', 
            fontWeight: '600',
            fontSize: '16px',
            margin: 0,
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            {restaurant.address || 'Visit us today!'}
          </p>
        </div>
      </div>
    </div>
  )
}
