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

interface LuxuryMenuPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function LuxuryMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: LuxuryMenuPDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  const backgroundStyle = {
    backgroundColor: TEMPLATE_DESIGN_TOKENS.luxury.colors.background,
    fontFamily: TEMPLATE_DESIGN_TOKENS.luxury.fonts.family,
    color: TEMPLATE_DESIGN_TOKENS.luxury.colors.text,
    backgroundImage: TEMPLATE_DESIGN_TOKENS.luxury.colors.backgroundGradient
  }
  
  return (
    <div className="pdf-page" style={{ ...backgroundStyle, minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'relative', padding: '32px' }}>
        {/* Decorative Border */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          border: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}33`,
          borderRadius: '8px',
          pointerEvents: 'none'
        }}>
          {/* Corner Decorations */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            width: '32px',
            height: '32px',
            borderLeft: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderTop: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderTopLeftRadius: '8px'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '32px',
            height: '32px',
            borderRight: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderTop: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderTopRightRadius: '8px'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            left: '-4px',
            width: '32px',
            height: '32px',
            borderLeft: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderBottomLeftRadius: '8px'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '32px',
            height: '32px',
            borderRight: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
            borderBottomRightRadius: '8px'
          }}></div>
        </div>

        <div style={{ maxWidth: '1536px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {/* Menu Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              border: `3px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
              padding: '48px',
              marginBottom: '32px',
              position: 'relative'
            }}>
              <h1 style={{
                fontWeight: '300',
                marginBottom: '24px',
                fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.title,
                color: TEMPLATE_DESIGN_TOKENS.luxury.colors.text,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                margin: '0 0 24px 0',
                trackingWider: true
              }}>
                {restaurant.name || 'LUXURY'}
              </h1>
              <div style={{
                width: '120px',
                height: '1px',
                backgroundColor: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
                margin: '0 auto 24px'
              }}></div>
              <h2 style={{
                fontWeight: 'normal',
                fontSize: '20px',
                color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
                margin: 0,
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>
                Fine Dining Experience
              </h2>
            </div>
          </div>

          {/* Menu Content - Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.luxury.spacing.section }}>
              {categories.slice(0, Math.ceil(categories.length / 2)).map((category) => (
                <div key={category.id} style={{ position: 'relative' }}>
                  {/* Category Header */}
                  <div style={{
                    borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
                    marginBottom: TEMPLATE_DESIGN_TOKENS.luxury.spacing.item,
                    paddingBottom: '20px',
                    position: 'relative'
                  }}>
                    <h3 style={{
                      fontWeight: '300',
                      fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.category,
                      color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      margin: 0
                    }}>
                      {category.name}
                    </h3>
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      width: '80px',
                      height: '2px',
                      backgroundColor: TEMPLATE_DESIGN_TOKENS.luxury.colors.text
                    }}></div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.luxury.spacing.item }}>
                    {category.menu_items.map((item) => (
                      <div key={item.id} style={{ position: 'relative' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <h4 style={{
                                fontWeight: 'normal',
                                fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.item,
                                color: TEMPLATE_DESIGN_TOKENS.luxury.colors.text,
                                letterSpacing: '0.1em',
                                margin: 0,
                                trackingWide: true
                              }}>
                                {item.name}
                              </h4>
                            </div>
                            {item.description && (
                              <p style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.8)',
                                lineHeight: 1.6,
                                fontWeight: '300',
                                margin: 0
                              }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginLeft: '24px'
                          }}>
                            <div style={{
                              fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.price,
                              fontWeight: 'bold',
                              color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary
                            }}>
                              {item.price?.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.luxury.spacing.section }}>
              {categories.slice(Math.ceil(categories.length / 2)).map((category) => (
                <div key={category.id} style={{ position: 'relative' }}>
                  {/* Category Header */}
                  <div style={{
                    borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
                    marginBottom: TEMPLATE_DESIGN_TOKENS.luxury.spacing.item,
                    paddingBottom: '20px',
                    position: 'relative'
                  }}>
                    <h3 style={{
                      fontWeight: '300',
                      fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.category,
                      color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      margin: 0
                    }}>
                      {category.name}
                    </h3>
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      width: '80px',
                      height: '2px',
                      backgroundColor: TEMPLATE_DESIGN_TOKENS.luxury.colors.text
                    }}></div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.luxury.spacing.item }}>
                    {category.menu_items.map((item) => (
                      <div key={item.id} style={{ position: 'relative' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <h4 style={{
                                fontWeight: 'normal',
                                fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.item,
                                color: TEMPLATE_DESIGN_TOKENS.luxury.colors.text,
                                letterSpacing: '0.1em',
                                margin: 0,
                                trackingWide: true
                              }}>
                                {item.name}
                              </h4>
                            </div>
                            {item.description && (
                              <p style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.8)',
                                lineHeight: 1.6,
                                fontWeight: '300',
                                margin: 0
                              }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginLeft: '24px'
                          }}>
                            <div style={{
                              fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.price,
                              fontWeight: 'bold',
                              color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary
                            }}>
                              {item.price?.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
