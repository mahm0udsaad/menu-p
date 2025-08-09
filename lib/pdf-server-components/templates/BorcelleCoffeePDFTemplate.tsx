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

interface BorcelleCoffeePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

export default function BorcelleCoffeePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: BorcelleCoffeePDFTemplateProps) {
  const currency = restaurant.currency || '$'
  
  const backgroundStyle = {
    background: TEMPLATE_DESIGN_TOKENS.borcelle.colors.background,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: TEMPLATE_DESIGN_TOKENS.borcelle.fonts.family,
    fontSize: '16px',
    color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.text,
  }

  // Category icons - similar to preview component
  const getCategoryIcon = (index: number) => {
    const iconProps = {
      width: '32px',
      height: '32px',
      fill: TEMPLATE_DESIGN_TOKENS.borcelle.colors.secondary
    }
    
    switch (index) {
      case 0:
        return (
          <svg viewBox="0 0 24 24" style={iconProps}>
            <path d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V10H4V8H16V3H20Z" />
          </svg>
        )
      case 1:
        return (
          <svg viewBox="0 0 24 24" style={iconProps}>
            <path d="M17,19H7V17H17V19M16,14H8V12L10.5,9.5L9.08,8.08L12,5.16L14.92,8.08L13.5,9.5L16,12V14M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z" />
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" style={iconProps}>
            <path d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z" />
          </svg>
        )
    }
  }
  
  return (
    <div style={{ ...backgroundStyle, minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div style={{ flex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `2px solid ${TEMPLATE_DESIGN_TOKENS.borcelle.colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '18px',
                  color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.primary
                }}>B</span>
              </div>
              <h1 style={{
                fontWeight: 'bold',
                color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.primary,
                fontSize: TEMPLATE_DESIGN_TOKENS.borcelle.fonts.sizes.title,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                margin: 0
              }}>
                {restaurant.name || 'BORCELLE'}
              </h1>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '2px',
                backgroundColor: TEMPLATE_DESIGN_TOKENS.borcelle.colors.secondary,
                margin: '0 auto 16px'
              }}></div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'normal',
                color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.secondary,
                margin: 0,
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                Premium Coffee & Pastries
              </h2>
            </div>
          </div>

          {/* Coffee Image placeholder */}
          <div style={{
            width: '256px',
            height: '256px',
            borderRadius: '50%',
            border: `4px solid ${TEMPLATE_DESIGN_TOKENS.borcelle.colors.accent}`,
            marginLeft: '32px',
            backgroundColor: TEMPLATE_DESIGN_TOKENS.borcelle.colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b45309',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Coffee & Pastries Image
          </div>
        </div>

        {/* Menu Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: TEMPLATE_DESIGN_TOKENS.borcelle.spacing.section }}>
          {categories.map((category, index) => (
            <div key={category.id}>
              {/* Category Header with Icon */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', marginRight: '16px' }}>
                  {getCategoryIcon(index)}
                </div>
                <h3 style={{
                  fontSize: TEMPLATE_DESIGN_TOKENS.borcelle.fonts.sizes.category,
                  fontWeight: '600',
                  color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: 0
                }}>
                  {category.name}
                </h3>
                <div style={{ 
                  flex: 1, 
                  marginLeft: '16px', 
                  borderBottom: `1px solid ${TEMPLATE_DESIGN_TOKENS.borcelle.colors.secondary}` 
                }}></div>
              </div>

              {/* Menu Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TEMPLATE_DESIGN_TOKENS.borcelle.spacing.item }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: '#fff7ed',
                    borderRadius: '12px',
                    padding: '20px',
                    border: `1px solid ${TEMPLATE_DESIGN_TOKENS.borcelle.colors.accent}`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{
                        fontSize: TEMPLATE_DESIGN_TOKENS.borcelle.fonts.sizes.item,
                        fontWeight: '600',
                        color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.primary,
                        margin: 0,
                        flex: 1
                      }}>
                        {item.name}
                      </h4>
                      <div style={{
                        fontSize: TEMPLATE_DESIGN_TOKENS.borcelle.fonts.sizes.price,
                        fontWeight: '700',
                        color: '#b45309',
                        marginLeft: '16px'
                      }}>
                        {currency}{item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    {item.description && (
                      <p style={{
                        fontSize: '14px',
                        color: '#92400e',
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
          marginTop: TEMPLATE_DESIGN_TOKENS.borcelle.spacing.section,
          textAlign: 'center',
          padding: TEMPLATE_DESIGN_TOKENS.borcelle.spacing.card,
          borderTop: `1px solid ${TEMPLATE_DESIGN_TOKENS.borcelle.colors.secondary}`
        }}>
          <p style={{
            color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.secondary,
            fontWeight: '500',
            fontSize: '16px',
            margin: '0 0 8px 0'
          }}>
            Crafted with passion, served with excellence
          </p>
          <p style={{
            color: TEMPLATE_DESIGN_TOKENS.borcelle.colors.primary,
            fontWeight: '400',
            fontSize: '14px',
            margin: 0
          }}>
            {restaurant.address || 'Experience the art of coffee'}
          </p>
        </div>
      </div>
    </div>
  )
}
