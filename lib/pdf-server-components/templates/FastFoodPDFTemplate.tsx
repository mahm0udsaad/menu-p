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

interface FastFoodPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

// Hand-drawn SVG illustrations matching the reference image
const PizzaIllustration = () => (
  <div style={{ width: '128px', height: '128px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {/* Pizza base */}
      <circle cx="100" cy="100" r="80" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      {/* Crust texture */}
      <circle cx="100" cy="100" r="75" fill="none" stroke="#C41E3A" strokeWidth="1" strokeDasharray="3,2" />
      {/* Pepperoni */}
      <circle cx="80" cy="80" r="8" fill="#C41E3A" />
      <circle cx="120" cy="70" r="8" fill="#C41E3A" />
      <circle cx="90" cy="110" r="8" fill="#C41E3A" />
      <circle cx="130" cy="120" r="8" fill="#C41E3A" />
      <circle cx="70" cy="130" r="8" fill="#C41E3A" />
      {/* Cheese texture - dots */}
      <circle cx="85" cy="95" r="2" fill="#C41E3A" />
      <circle cx="115" cy="85" r="2" fill="#C41E3A" />
      <circle cx="105" cy="105" r="2" fill="#C41E3A" />
      <circle cx="95" cy="125" r="2" fill="#C41E3A" />
      <circle cx="125" cy="95" r="2" fill="#C41E3A" />
      {/* Crosshatch pattern */}
      <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
        <line x1="60" y1="60" x2="140" y2="140" />
        <line x1="70" y1="60" x2="150" y2="140" />
        <line x1="50" y1="70" x2="130" y2="150" />
        <line x1="140" y1="60" x2="60" y2="140" />
        <line x1="130" y1="60" x2="50" y2="140" />
        <line x1="150" y1="70" x2="70" y2="150" />
      </g>
    </svg>
  </div>
)

const BurgerIllustration = () => (
  <div style={{ width: '128px', height: '128px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {/* Top bun */}
      <ellipse cx="100" cy="70" rx="70" ry="25" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      {/* Sesame seeds */}
      <ellipse cx="80" cy="65" rx="3" ry="2" fill="#C41E3A" />
      <ellipse cx="100" cy="62" rx="3" ry="2" fill="#C41E3A" />
      <ellipse cx="120" cy="68" rx="3" ry="2" fill="#C41E3A" />
      {/* Lettuce */}
      <path d="M40 95 Q100 85 160 95 Q150 105 100 100 Q50 105 40 95" fill="#90EE90" stroke="#C41E3A" strokeWidth="2" />
      {/* Meat patty */}
      <ellipse cx="100" cy="110" rx="65" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
      {/* Cheese */}
      <path
        d="M45 125 Q100 115 155 125 Q145 135 100 130 Q55 135 45 125"
        fill="#FFD700"
        stroke="#C41E3A"
        strokeWidth="2"
      />
      {/* Bottom bun */}
      <ellipse cx="100" cy="145" rx="70" ry="20" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      {/* Crosshatch shading */}
      <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
        <line x1="50" y1="50" x2="150" y2="150" />
        <line x1="60" y1="50" x2="160" y2="150" />
        <line x1="40" y1="60" x2="140" y2="160" />
      </g>
    </svg>
  </div>
)

const FriesIllustration = () => (
  <div style={{ width: '96px', height: '128px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {/* Container */}
      <path d="M60 120 L60 180 L140 180 L140 120 L130 100 L70 100 Z" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      {/* Fries */}
      <rect x="75" y="80" width="8" height="40" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
      <rect x="90" y="70" width="8" height="50" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
      <rect x="105" y="75" width="8" height="45" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
      <rect x="120" y="85" width="8" height="35" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
      {/* Container logo */}
      <circle cx="100" cy="150" r="15" fill="none" stroke="#C41E3A" strokeWidth="2" />
      <circle cx="100" cy="150" r="8" fill="#C41E3A" />
    </svg>
  </div>
)

const HotDogIllustration = () => (
  <div style={{ width: '128px', height: '96px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {/* Bun */}
      <ellipse cx="100" cy="100" rx="80" ry="30" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      {/* Sausage */}
      <ellipse cx="100" cy="100" rx="70" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
      {/* Mustard */}
      <path d="M40 95 Q60 90 80 95 Q100 90 120 95 Q140 90 160 95" stroke="#FFD700" strokeWidth="4" fill="none" />
      {/* Ketchup */}
      <path d="M45 105 Q65 100 85 105 Q105 100 125 105 Q145 100 155 105" stroke="#C41E3A" strokeWidth="3" fill="none" />
      {/* Crosshatch texture */}
      <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
        <line x1="30" y1="80" x2="170" y2="120" />
        <line x1="30" y1="90" x2="170" y2="130" />
        <line x1="30" y1="110" x2="170" y2="90" />
        <line x1="30" y1="120" x2="170" y2="100" />
      </g>
    </svg>
  </div>
)

export default function FastFoodPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: FastFoodPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div className="pdf-page" style={{
      background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5)',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header with decorative elements */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(to right, #fef2f2, #fffbeb)',
          border: '4px solid #C41E3A',
          borderRadius: '12px',
          padding: '36px 32px',
          marginBottom: '32px'
        }}>
          {/* Top illustrations */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            columnGap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PizzaIllustration />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                fontSize: '14px',
                color: '#C41E3A',
                fontWeight: '500',
                letterSpacing: '0.3em',
                marginBottom: '8px'
              }}>B O R C E L L E</div>
              <h1 style={{
                fontSize: '112px',
                fontWeight: '900',
                color: '#C41E3A',
                letterSpacing: '0.05em',
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 1
              }}>MENU</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BurgerIllustration />
            </div>
          </div>
          
          {/* Decorative line */}
          <div style={{
            borderTop: '4px dashed #C41E3A',
            marginBottom: '32px'
          }}></div>

          {/* Menu grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            columnGap: '32px',
            rowGap: '8px'
          }}>
            {categories.slice(0, 4).map((category) => (
              <div key={category.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#C41E3A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: 0,
                    marginBottom: '12px'
                  }}>
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#92400e',
                        margin: '8px 0 0 0',
                        lineHeight: 1.4
                      }}>
                        {category.description}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {category.menu_items.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#92400e',
                          margin: 0,
                          lineHeight: 1.3
                        }}>
                          {item.name}
                        </h4>
                        {item.description && (
                          <p style={{
                            fontSize: '12px',
                            color: '#92400e',
                            margin: '2px 0 0 0',
                            lineHeight: 1.4
                          }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#C41E3A',
                        flexShrink: 0,
                        textAlign: 'left',
                        minWidth: '64px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
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
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px'
            }}>
              {categories.slice(4).map((category) => (
                <div key={category.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#C41E3A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '16px',
                      margin: 0
                    }}>
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#92400e',
                          margin: '8px 0 0 0',
                          lineHeight: 1.4
                        }}>
                          {category.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {category.menu_items.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '8px 0',
                        gap: '16px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#92400e',
                            margin: 0,
                            lineHeight: 1.3
                          }}>
                            {item.name}
                          </h4>
                          {item.description && (
                            <p style={{
                              fontSize: '12px',
                              color: '#92400e',
                              margin: '4px 0 0 0',
                              lineHeight: 1.4
                            }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#C41E3A',
                          flexShrink: 0
                        }}>
                          {currency}{item.price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Bottom illustrations */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: '4px solid #C41E3A'
          }}>
            <FriesIllustration />
            <div style={{ flex: 1 }}></div>
            <HotDogIllustration />
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '48px', 
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #C41E3A'
          }}>
            <p style={{
              color: '#C41E3A',
              fontWeight: '700',
              fontSize: '18px',
              margin: '0 0 8px 0',
              textTransform: 'uppercase'
            }}>
              Fast • Fresh • Delicious
            </p>
            <p style={{
              color: '#7c2d12',
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}>
              {restaurant.address || 'Visit us today!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}