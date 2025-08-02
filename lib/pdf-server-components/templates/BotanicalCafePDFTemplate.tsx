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

interface BotanicalCafePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

// Botanical illustrations used in preview for decorative accents
const FeatherIllustration = () => (
  <svg width="120" height="300" viewBox="0 0 120 300" style={{ position: 'absolute', color: '#16a34a33' }}>
    <g fill="currentColor">
      <path d="M60 10 Q50 50 45 100 Q40 150 35 200 Q30 250 25 290 L35 290 Q40 250 45 200 Q50 150 55 100 Q60 50 70 10 Z" />
      <path d="M60 20 Q70 30 80 40 Q75 45 65 35 Q60 30 60 20" />
      <path d="M60 40 Q75 50 85 60 Q80 65 70 55 Q60 50 60 40" />
      <path d="M60 60 Q80 70 90 80 Q85 85 75 75 Q60 70 60 60" />
      <path d="M60 80 Q85 90 95 100 Q90 105 80 95 Q60 90 60 80" />
    </g>
  </svg>
)

const LeafIllustration = () => (
  <svg width="100" height="150" viewBox="0 0 100 150" style={{ position: 'absolute', color: '#16a34a4d' }}>
    <g fill="currentColor">
      <path d="M50 10 Q30 30 20 60 Q15 90 25 120 Q35 140 50 145 Q65 140 75 120 Q85 90 80 60 Q70 30 50 10 Z" />
      <path d="M50 20 L50 130" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M50 40 Q40 45 35 55" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M50 60 Q60 65 65 75" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M50 80 Q40 85 35 95" stroke="currentColor" strokeWidth="0.5" fill="none" />
    </g>
  </svg>
)

export default function BotanicalCafePDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations,
  pdfMode = false
}: BotanicalCafePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div style={{
      background: 'linear-gradient(to bottom right, #f0fdf4, #ecfdf5)',
      minHeight: '100vh',
      padding: '48px',
      fontFamily: 'Georgia, serif',
      position: 'relative'
    }}>
      {/* Background Illustrations */}
      <div style={{ top: '80px', left: '40px' }}>
        <FeatherIllustration />
      </div>
      <div style={{ bottom: '80px', right: '40px' }}>
        <LeafIllustration />
      </div>
      <div style={{ top: '50%', left: '25%', transform: 'translateY(-50%)' }}>
        <LeafIllustration />
      </div>
      <div style={{ maxWidth: '1024px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Menu Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.1)',
            border: '2px solid #dcfce7'
          }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#166534',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0
            }}>
              {restaurant.name || 'BOTANICAL CAFE'}
            </h1>
            <div style={{
              width: '100px',
              height: '3px',
              backgroundColor: '#22c55e',
              margin: '0 auto 16px',
              borderRadius: '2px'
            }}></div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '500', 
              color: '#16a34a',
              margin: 0
            }}>
              Fresh & Natural
            </h2>
          </div>
        </div>

        {/* Menu Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1)',
              border: '2px solid #dcfce7'
            }}>
              {/* Category Header */}
              <div style={{
                borderBottom: '2px solid #dcfce7',
                marginBottom: '24px',
                paddingBottom: '16px',
                position: 'relative'
              }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '600', 
                  color: '#166534',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {category.name}
                </h3>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '60px',
                  height: '2px',
                  backgroundColor: '#22c55e'
                }}></div>
              </div>

              {/* Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #bbf7d0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: '#22c55e'
                    }}></div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#166534',
                        margin: 0,
                        flex: 1
                      }}>
                        {item.name}
                      </h4>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#22c55e',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#15803d', 
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
          marginTop: '48px', 
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1)',
            border: '2px solid #dcfce7'
          }}>
            <p style={{ 
              color: '#22c55e', 
              fontWeight: '600',
              fontSize: '18px',
              margin: '0 0 8px 0'
            }}>
              🌿 Fresh ingredients, natural flavors 🌿
            </p>
            <p style={{ 
              color: '#16a34a', 
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}>
              {restaurant.address || 'Where nature meets taste'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
