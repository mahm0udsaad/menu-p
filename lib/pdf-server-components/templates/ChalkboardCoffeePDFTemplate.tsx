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
    <div className="pdf-page" style={{
      background: `
        radial-gradient(circle at 20% 30%, rgba(64,64,64,0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(96,96,96,0.2) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(48,48,48,0.4) 0%, transparent 50%),
        linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #0f0f0f 100%)
      `,
      minHeight: '100vh',
      padding: '32px',
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
        backgroundSize: '100px 100px, 150px 150px, 80px 80px',
        pointerEvents: 'none'
      }}></div>

      <div style={{ maxWidth: '1536px', margin: '0 auto', position: 'relative' }}>
        {/* Decorative chalk elements */}
        <ChalkCoffeeBean style={{ left: '-64px', top: '80px', opacity: 0.4, transform: 'rotate(12deg)' }} />
        <ChalkCoffeeCup style={{ right: '-80px', top: '128px', opacity: 0.3, transform: 'rotate(-12deg)' }} />
        <ChalkLeaf style={{ left: '-48px', bottom: '160px', opacity: 0.35, transform: 'rotate(45deg)' }} />
        <ChalkCoffeeBean style={{ right: '-64px', bottom: '240px', opacity: 0.4, transform: 'rotate(-30deg)' }} />

        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <ChalkCoffeeCup style={{ position: 'static', opacity: 0.6 }} />
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#ffffff',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontFamily: 'cursive'
            }}>
              {restaurant.name || 'FAUCET COFFEE'}
            </h1>
          </div>
          <div style={{ position: 'relative' }}>
            <h2 style={{ 
              fontSize: '84px', 
              fontWeight: '700', 
              color: '#ffffff',
              margin: '0 0 16px 0',
              fontFamily: 'cursive',
              transform: 'rotate(-2deg)'
            }}>
              Menu
            </h2>
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}>
              <svg width="200" height="10" viewBox="0 0 200 10" style={{ color: '#ffffff' }}>
                <path
                  d="M10 5 Q50 2 100 5 Q150 8 190 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Menu Content - Two Column Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '64px', 
          position: 'relative', 
          zIndex: 10 
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {categories.slice(0, Math.ceil(categories.length / 2)).map((category) => (
              <div key={category.id} style={{ position: 'relative' }}>
                {/* Category Header */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{ 
                      fontSize: '28px', 
                      fontWeight: '700', 
                      color: '#ffffff',
                      margin: 0,
                      fontFamily: 'cursive'
                    }}>
                      {category.name}
                    </h3>
                    <ChalkArrow style={{ position: 'static', opacity: 0.6 }} />
                  </div>
                  <div style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)'
                  }}></div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {category.menu_items.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          fontSize: '18px', 
                          color: '#ffffff',
                          margin: 0,
                          fontFamily: 'cursive'
                        }}>
                          {item.name}
                        </h4>
                        {item.description && (
                          <p style={{ 
                            fontSize: '14px', 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            margin: '4px 0 0 0',
                            fontFamily: 'cursive'
                          }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#ffffff',
                        marginLeft: '12px',
                        fontFamily: 'cursive'
                      }}>
                        {currency}{Math.round(item.price || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {categories.slice(Math.ceil(categories.length / 2)).map((category) => (
              <div key={category.id} style={{ position: 'relative' }}>
                {/* Category Header */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{ 
                      fontSize: '28px', 
                      fontWeight: '700', 
                      color: '#ffffff',
                      margin: 0,
                      fontFamily: 'cursive'
                    }}>
                      {category.name}
                    </h3>
                    <ChalkArrow style={{ position: 'static', opacity: 0.6 }} />
                  </div>
                  <div style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)'
                  }}></div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {category.menu_items.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          fontSize: '18px', 
                          color: '#ffffff',
                          margin: 0,
                          fontFamily: 'cursive'
                        }}>
                          {item.name}
                        </h4>
                        {item.description && (
                          <p style={{ 
                            fontSize: '14px', 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            margin: '4px 0 0 0',
                            fontFamily: 'cursive'
                          }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#ffffff',
                        marginLeft: '12px',
                        fontFamily: 'cursive'
                      }}>
                        {currency}{Math.round(item.price || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative element in center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.2,
          zIndex: 1
        }}>
          <ChalkCoffeeCup style={{ position: 'static', width: '128px', height: '128px' }} />
        </div>
      </div>
    </div>
  )
}