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
  
  const backgroundStyle = {
    background: TEMPLATE_DESIGN_TOKENS.botanical.colors.background,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: TEMPLATE_DESIGN_TOKENS.botanical.fonts.family,
    fontSize: '16px',
    color: TEMPLATE_DESIGN_TOKENS.botanical.colors.text,
  }
  
  return (
    <div style={{ ...backgroundStyle, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Illustrations */}
      <div style={{ position: 'absolute', top: '80px', left: '40px' }}>
        <FeatherIllustration />
      </div>
      <div style={{ position: 'absolute', bottom: '80px', right: '40px' }}>
        <LeafIllustration />
      </div>
      <div style={{ position: 'absolute', top: '50%', left: '25%', transform: 'translateY(-50%)' }}>
        <LeafIllustration />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1024px', margin: '0 auto', padding: '32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            backgroundColor: TEMPLATE_DESIGN_TOKENS.botanical.colors.accent,
            borderRadius: '50%',
            marginBottom: '24px'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" style={{ color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary }}>
              <path
                fill="currentColor"
                d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
              />
            </svg>
          </div>
          <h1 style={{
            fontWeight: 'bold',
            marginBottom: '24px',
            fontSize: TEMPLATE_DESIGN_TOKENS.botanical.fonts.sizes.title,
            color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: '0 0 24px 0'
          }}>
            {restaurant.name || 'BOTANICAL CAFE'}
          </h1>
          <div style={{
            width: '100px',
            height: '3px',
            backgroundColor: TEMPLATE_DESIGN_TOKENS.botanical.colors.secondary,
            margin: '0 auto 16px',
            borderRadius: '2px'
          }}></div>
          <p style={{
            fontSize: '20px',
            maxWidth: '400px',
            margin: '0 auto',
            color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary
          }}>
            Fresh & Natural
          </p>
        </div>

        {/* Menu Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.botanical.spacing.section }}>
          {categories.map((category) => (
            <div key={category.id} style={{ position: 'relative' }}>
              {/* Category Header */}
              <div style={{
                borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.botanical.colors.accent}`,
                marginBottom: TEMPLATE_DESIGN_TOKENS.botanical.spacing.item,
                paddingBottom: '16px',
                position: 'relative'
              }}>
                <h3 style={{
                  fontSize: TEMPLATE_DESIGN_TOKENS.botanical.fonts.sizes.category,
                  fontWeight: '600',
                  color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: 0
                }}>
                  {category.name}
                </h3>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '60px',
                  height: '2px',
                  backgroundColor: TEMPLATE_DESIGN_TOKENS.botanical.colors.secondary
                }}></div>
              </div>

              {/* Menu Items */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: TEMPLATE_DESIGN_TOKENS.botanical.spacing.card,
                boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1)',
                border: `2px solid ${TEMPLATE_DESIGN_TOKENS.botanical.colors.accent}`
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TEMPLATE_DESIGN_TOKENS.botanical.spacing.item }}>
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
                        backgroundColor: TEMPLATE_DESIGN_TOKENS.botanical.colors.secondary
                      }}></div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <h4 style={{
                          fontSize: TEMPLATE_DESIGN_TOKENS.botanical.fonts.sizes.item,
                          fontWeight: '600',
                          color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary,
                          margin: 0,
                          flex: 1
                        }}>
                          {item.name}
                        </h4>
                        <div style={{
                          fontSize: TEMPLATE_DESIGN_TOKENS.botanical.fonts.sizes.price,
                          fontWeight: '700',
                          color: TEMPLATE_DESIGN_TOKENS.botanical.colors.secondary,
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
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: TEMPLATE_DESIGN_TOKENS.botanical.spacing.section }}>
          <p style={{
            color: '#16a34a',
            fontSize: '18px',
            fontStyle: 'italic',
            margin: 0
          }}>
            "Where nature meets nourishment"
          </p>
        </div>
      </div>
    </div>
  )
}
