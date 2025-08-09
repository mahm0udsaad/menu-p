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
      background: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23654321'/%3E%3Cpath d='M0 0L100 100M100 0L0 100' stroke='%238B4513' strokeWidth='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23wood)'/%3E%3C/svg%3E"), linear-gradient(to bottom right, rgba(157, 139, 20, 0.2), rgba(217, 119, 6, 0.3))`,
      backgroundColor: '#3D2914',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'Georgia, serif'
    }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Menu paper overlay */}
          <div style={{
            background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5)',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '8px solid rgba(146, 64, 14, 0.2)',
            padding: '48px'
          }}>
            {/* Header with Art Deco decoration */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '48px'
            }}>
              <div style={{ width: '64px' }}></div>
              
              <div style={{ textAlign: 'center', flex: 1 }}>
                {/* Art Deco decoration */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <svg width="200" height="32" viewBox="0 0 200 32">
                    <g fill="#2D1810" stroke="#2D1810">
                      <polygon points="100,4 108,12 100,20 92,12" fill="#2D1810" />
                      <polygon points="98,6 102,10 98,14 94,10" fill="#F5E6D3" />
                      <line x1="50" y1="12" x2="85" y2="12" strokeWidth="2" />
                      <line x1="115" y1="12" x2="150" y2="12" strokeWidth="2" />
                      <circle cx="70" cy="12" r="2" fill="#2D1810" />
                      <circle cx="130" cy="12" r="2" fill="#2D1810" />
                    </g>
                  </svg>
                </div>
                
                <h1 style={{
                  fontSize: '64px',
                  fontWeight: '700',
                  color: '#92400e',
                  letterSpacing: '0.1em',
                  marginBottom: '16px',
                  margin: 0
                }}>
                  MENU
                </h1>
                
                {/* Bottom Art Deco decoration */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '24px'
                }}>
                  <svg width="200" height="32" viewBox="0 0 200 32">
                    <g fill="#2D1810" stroke="#2D1810">
                      <polygon points="100,4 108,12 100,20 92,12" fill="#2D1810" />
                      <polygon points="98,6 102,10 98,14 94,10" fill="#F5E6D3" />
                      <line x1="50" y1="12" x2="85" y2="12" strokeWidth="2" />
                      <line x1="115" y1="12" x2="150" y2="12" strokeWidth="2" />
                      <polygon points="70,10 72,12 70,14 68,12" fill="#2D1810" />
                      <polygon points="130,10 132,12 130,14 128,12" fill="#2D1810" />
                    </g>
                  </svg>
                </div>
              </div>
              
              <div style={{ width: '64px' }}></div>
            </div>

            {/* Menu content */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '64px'
            }}>
              {categories.slice(0, 2).map((category) => (
                <div key={category.id}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#92400e',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      marginBottom: '16px'
                    }}>
                      {category.name}
                    </h3>
                    
                    {/* Category Art Deco decoration */}
                    <svg width="240" height="32" viewBox="0 0 240 32">
                      <g fill="#2D1810" stroke="#2D1810">
                        <polygon points="120,8 126,14 120,20 114,14" fill="#2D1810" />
                        <polygon points="118,10 122,14 118,18 114,14" fill="#F5E6D3" />
                        <line x1="60" y1="14" x2="110" y2="14" strokeWidth="2" />
                        <line x1="130" y1="14" x2="180" y2="14" strokeWidth="2" />
                        <polygon points="90,12 92,14 90,16 88,14" fill="#2D1810" />
                        <polygon points="150,12 152,14 150,16 148,14" fill="#2D1810" />
                      </g>
                    </svg>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {category.menu_items.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px dotted #2D1810'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#1c1917',
                            margin: 0
                          }}>
                            {item.name}
                          </h4>
                          {item.description && (
                            <p style={{
                              fontSize: '12px',
                              color: '#57534e',
                              margin: '4px 0 0 0',
                              lineHeight: 1.4
                            }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1c1917',
                          marginLeft: '16px'
                        }}>
                          {item.price || '0'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional categories */}
            {categories.length > 2 && (
              <div style={{
                marginTop: '64px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '64px'
              }}>
                {categories.slice(2).map((category) => (
                  <div key={category.id}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <h3 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#92400e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '16px'
                      }}>
                        {category.name}
                      </h3>
                      
                      {/* Category Art Deco decoration */}
                      <svg width="240" height="32" viewBox="0 0 240 32">
                        <g fill="#2D1810" stroke="#2D1810">
                          <polygon points="120,8 126,14 120,20 114,14" fill="#2D1810" />
                          <polygon points="118,10 122,14 118,18 114,14" fill="#F5E6D3" />
                          <line x1="60" y1="14" x2="110" y2="14" strokeWidth="2" />
                          <line x1="130" y1="14" x2="180" y2="14" strokeWidth="2" />
                          <polygon points="90,12 92,14 90,16 88,14" fill="#2D1810" />
                          <polygon points="150,12 152,14 150,16 148,14" fill="#2D1810" />
                        </g>
                      </svg>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {category.menu_items.map((item) => (
                        <div key={item.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px dotted #2D1810'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '500',
                              color: '#1c1917',
                              margin: 0
                            }}>
                              {item.name}
                            </h4>
                            {item.description && (
                              <p style={{
                                fontSize: '12px',
                                color: '#57534e',
                                margin: '4px 0 0 0',
                                lineHeight: 1.4
                              }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1c1917',
                            marginLeft: '16px'
                          }}>
                            {item.price || '0'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bottom decoration */}
            <div style={{
              marginTop: '64px',
              paddingTop: '32px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <svg width="160" height="32" viewBox="0 0 160 32">
                <g fill="#2D1810" stroke="#2D1810">
                  <polygon points="80,4 88,12 80,20 72,12" fill="#2D1810" />
                  <polygon points="78,6 82,10 78,14 74,10" fill="#F5E6D3" />
                  <line x1="40" y1="12" x2="68" y2="12" strokeWidth="2" />
                  <line x1="92" y1="12" x2="120" y2="12" strokeWidth="2" />
                  <polygon points="56,10 58,12 56,14 54,12" fill="#2D1810" />
                  <polygon points="104,10 106,12 104,14 102,12" fill="#2D1810" />
                </g>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          marginTop: '48px', 
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '8px solid rgba(146, 64, 14, 0.2)'
          }}>
            <p style={{ 
              color: '#92400e', 
              fontWeight: '600',
              fontSize: '18px',
              margin: '0 0 8px 0',
              letterSpacing: '0.1em'
            }}>
              "Crafting moments, one cocktail at a time"
            </p>
            <p style={{ 
              color: '#57534e', 
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}>
              {restaurant.address || 'Experience the art of mixology'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
