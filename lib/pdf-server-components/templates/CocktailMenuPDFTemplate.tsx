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

interface CocktailMenuPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

// SVG Illustrations for cocktail theme (server-side compatible)
const CocktailGlassIllustration = () => (
  <svg width="80" height="120" viewBox="0 0 80 120" style={{ color: 'white' }}>
    <g fill="none" stroke="currentColor" strokeWidth="2">
      {/* Martini glass */}
      <path d="M20 30 L60 30 L40 60 L40 90" />
      <ellipse cx="40" cy="95" rx="15" ry="3" />

      {/* Liquid */}
      <path d="M25 35 L55 35 L40 55 Z" fill="currentColor" fillOpacity="0.2" />

      {/* Garnish */}
      <circle cx="35" cy="40" r="2" fill="currentColor" />
      <circle cx="45" cy="42" r="1.5" fill="currentColor" />

      {/* Bubbles */}
      <circle cx="38" cy="45" r="1" fill="currentColor" fillOpacity="0.3" />
      <circle cx="42" cy="48" r="0.8" fill="currentColor" fillOpacity="0.3" />
      <circle cx="40" cy="52" r="0.6" fill="currentColor" fillOpacity="0.3" />
    </g>
  </svg>
)

const CitrusSliceIllustration = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" style={{ color: 'white' }}>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Orange slice */}
      <circle cx="40" cy="40" r="25" fill="currentColor" fillOpacity="0.1" />
      <circle cx="40" cy="40" r="25" />

      {/* Segments */}
      <line x1="40" y1="15" x2="40" y2="65" />
      <line x1="15" y1="40" x2="65" y2="40" />
      <line x1="22" y1="22" x2="58" y2="58" />
      <line x1="58" y1="22" x2="22" y2="58" />

      {/* Center */}
      <circle cx="40" cy="40" r="3" fill="currentColor" fillOpacity="0.3" />

      {/* Texture details */}
      <g strokeWidth="0.8" opacity="0.6">
        <path d="M30 25 Q35 30 40 25" />
        <path d="M50 25 Q45 30 40 25" />
        <path d="M55 35 Q50 40 55 45" />
        <path d="M25 35 Q30 40 25 45" />
      </g>
    </g>
  </svg>
)

const CocktailShakerIllustration = () => (
  <svg width="60" height="120" viewBox="0 0 60 120" style={{ color: 'white' }}>
    <g fill="none" stroke="currentColor" strokeWidth="2">
      {/* Shaker body */}
      <rect x="15" y="30" width="30" height="60" rx="5" fill="currentColor" fillOpacity="0.1" />
      <rect x="15" y="30" width="30" height="60" rx="5" />

      {/* Shaker top */}
      <rect x="18" y="20" width="24" height="15" rx="3" fill="currentColor" fillOpacity="0.1" />
      <rect x="18" y="20" width="24" height="15" rx="3" />

      {/* Cap */}
      <rect x="20" y="15" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.2" />
      <rect x="20" y="15" width="20" height="8" rx="2" />

      {/* Details */}
      <line x1="15" y1="45" x2="45" y2="45" strokeWidth="1" />
      <line x1="15" y1="60" x2="45" y2="60" strokeWidth="1" />
      <line x1="15" y1="75" x2="45" y2="75" strokeWidth="1" />

      {/* Handle */}
      <path d="M45 50 Q55 50 55 60 Q55 70 45 70" strokeWidth="1.5" />
    </g>
  </svg>
)

export default function CocktailMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: CocktailMenuPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div className="pdf-page" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Black Sidebar with Illustrations */}
      <div style={{
        width: '320px',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
        padding: '32px'
      }}>
        <CocktailGlassIllustration />
        <CitrusSliceIllustration />
        <CocktailShakerIllustration />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '48px' }}>
        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <h1 style={{ 
            fontSize: '84px', 
            fontWeight: '900', 
            color: '#111827', 
            letterSpacing: '-0.05em',
            marginBottom: '16px',
            margin: 0
          }}>
            COCKTAIL
          </h1>
          {restaurant.name && (
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '16px 0 0 0'
            }}>
              {restaurant.name}
            </h2>
          )}
        </div>

        {/* Menu Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{ position: 'relative' }}>
              {/* Category Header */}
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#111827', 
                letterSpacing: '0.1em',
                marginBottom: '32px',
                margin: 0,
                textTransform: 'uppercase'
              }}>
                {category.name}
              </h2>

              {/* Menu Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#111827', 
                        marginBottom: '4px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: 0
                      }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p style={{ 
                          color: '#374151', 
                          fontSize: '18px', 
                          lineHeight: 1.6,
                          margin: '4px 0 0 0'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ marginLeft: '32px', flexShrink: 0 }}>
                      <span style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#111827'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '80px' }}>
          <p style={{ 
            fontSize: '20px', 
            color: '#1f2937', 
            fontWeight: '300',
            margin: 0
          }}>
            You'd rather drink than worry!
          </p>
        </div>
      </div>
    </div>
  )
}
