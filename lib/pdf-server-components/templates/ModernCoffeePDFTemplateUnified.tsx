import React from 'react'
import { TEMPLATE_DESIGN_TOKENS } from '@/lib/template-design-tokens'

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

interface ModernCoffeePDFTemplateUnifiedProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

// Coffee-themed SVG illustrations
const CoffeeBeans = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" style={{ color: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary }}>
    <g fill="currentColor" opacity="0.2">
      <ellipse cx="16" cy="16" rx="12" ry="8" />
      <ellipse cx="16" cy="16" rx="8" ry="4" />
      <line x1="8" y1="12" x2="24" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </g>
  </svg>
)

const CoffeePlant = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary }}>
    <g fill="currentColor" opacity="0.15">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4 L12 20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </g>
  </svg>
)

export default function ModernCoffeePDFTemplateUnified({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ModernCoffeePDFTemplateUnifiedProps) {
  const currency = restaurant.currency || '$'
  
  return (
    <div className="pdf-page" style={{ 
      backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.background, 
      minHeight: '100vh', 
      position: 'relative',
      overflow: 'hidden',
      fontFamily: TEMPLATE_DESIGN_TOKENS.modern.fonts.family
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '256px',
        height: '256px',
        background: 'linear-gradient(to bottom left, #f97316, transparent)',
        borderRadius: '50%',
        opacity: 0.3,
        transform: 'translate(128px, -128px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '384px',
        height: '384px',
        background: 'linear-gradient(to top right, #f59e0b, transparent)',
        borderRadius: '50%',
        opacity: 0.2,
        transform: 'translate(-192px, 192px)'
      }}></div>

      <div style={{ position: 'relative', padding: '32px', zIndex: 10 }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          {/* Coffee Bean Decorations */}
          <div style={{
            position: 'absolute',
            left: '32px',
            top: '128px',
            width: '128px',
            height: '128px',
            opacity: 0.2
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary,
              borderRadius: '50%',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: '8px',
                backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
                borderRadius: '50%'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '4px',
                height: '64px',
                backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary,
                transform: 'translate(-50%, -50%) rotate(12deg)'
              }}></div>
            </div>
          </div>
          
          <div style={{
            position: 'absolute',
            left: '64px',
            bottom: '128px',
            width: '96px',
            height: '96px',
            opacity: 0.15
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary,
              borderRadius: '50%',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: '8px',
                backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
                borderRadius: '50%'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '4px',
                height: '48px',
                backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary,
                transform: 'translate(-50%, -50%) rotate(45deg)'
              }}></div>
            </div>
          </div>

          {/* Menu Header */}
          <div style={{ textAlign: 'left', marginBottom: '48px', position: 'relative' }}>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
                marginBottom: '8px',
                letterSpacing: '0.1em',
                margin: '0 0 8px 0',
                trackingWide: true
              }}>
                {(restaurant.name || 'BORCELLE').toUpperCase()}
              </h1>
              <p style={{ 
                fontSize: '18px', 
                color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary, 
                fontWeight: '500',
                letterSpacing: '0.2em',
                margin: 0
              }}>COFFEESHOP</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ 
                fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.title, 
                fontWeight: '900', 
                color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
                letterSpacing: '-0.05em',
                margin: 0,
                trackingTighter: true
              }}>
                MENU
              </h2>
            </div>
          </div>

          {/* Menu Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.modern.spacing.section }}>
            {categories.map((category) => (
              <div key={category.id} style={{ position: 'relative' }}>
                <div style={{
                  position: 'relative',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: TEMPLATE_DESIGN_TOKENS.modern.spacing.card,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: `1px solid ${TEMPLATE_DESIGN_TOKENS.modern.colors.accent}`
                }}>
                  {/* Category Header */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ 
                      fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.category, 
                      fontWeight: '900', 
                      color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
                      letterSpacing: '0.2em',
                      margin: 0,
                      textTransform: 'uppercase',
                      trackingWider: true
                    }}>
                      {category.name}
                    </h3>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.modern.spacing.item }}>
                    {category.menu_items.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <h4 style={{ 
                            fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.item, 
                            fontWeight: '600', 
                            color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: 0,
                            trackingWide: true
                          }}>
                            {item.name}
                          </h4>
                        </div>
                        <div style={{ 
                          fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.price, 
                          fontWeight: '700', 
                          color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary
                        }}>
                          {currency}{item.price?.toFixed(0) || '0'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '64px', textAlign: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${TEMPLATE_DESIGN_TOKENS.modern.colors.accent}`
            }}>
              <p style={{ 
                color: '#374151', 
                fontWeight: '500',
                margin: '0 0 8px 0'
              }}>
                Available at
              </p>
              <p style={{ 
                color: '#111827', 
                fontWeight: '700', 
                fontSize: '18px',
                margin: 0
              }}>
                9:00 am - 10:00 pm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
