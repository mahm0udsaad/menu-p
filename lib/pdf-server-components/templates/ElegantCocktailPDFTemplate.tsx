import React from 'react'
import {
  type PageCategory,
  type MenuPage,
  paginateCategories,
  splitColumns,
  A4_PAGE_WIDTH as PAGE_WIDTH,
  A4_PAGE_HEIGHT as PAGE_HEIGHT,
  toArabicDigits,
  formatPrice
} from '../pagination-utils'

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

function clampStyle(lines: number): React.CSSProperties {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }
}

function getAvailableCategories(categories: MenuCategory[]) {
  return categories
    .map((category) => ({
      ...category,
      menu_items: (category.menu_items || []).filter((item) => item.is_available !== false),
    }))
    .filter((category) => category.menu_items.length > 0)
}

const GinBottleIllustration = () => (
  <svg width="48" height="72" viewBox="0 0 120 200">
    <rect x="35" y="60" width="50" height="120" fill="none" stroke="#2D1810" strokeWidth="2" />
    <rect x="45" y="30" width="30" height="30" fill="none" stroke="#2D1810" strokeWidth="2" />
    <rect x="42" y="20" width="36" height="15" fill="none" stroke="#2D1810" strokeWidth="2" />
    <text x="60" y="110" textAnchor="middle" fontSize="12" fill="#2D1810" fontFamily="serif">Gin</text>
  </svg>
)

const WineBottleIllustration = () => (
  <svg width="48" height="72" viewBox="0 0 120 200">
    <path d="M45 180 L45 80 Q45 70 50 65 L50 30 L70 30 L70 65 Q75 70 75 80 L75 180 Z" fill="none" stroke="#2D1810" strokeWidth="2" />
    <rect x="48" y="20" width="24" height="15" fill="none" stroke="#2D1810" strokeWidth="2" />
  </svg>
)

function Header({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: compact ? '24px' : '48px',
      flex: 'none'
    }}>
      {!compact && <GinBottleIllustration />}
      
      <div style={{ textAlign: 'center', flex: 1 }}>
        {!compact && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="150" height="24" viewBox="0 0 200 32">
              <polygon points="100,4 108,12 100,20 92,12" fill="#2D1810" />
              <line x1="50" y1="12" x2="85" y2="12" stroke="#2D1810" strokeWidth="2" />
              <line x1="115" y1="12" x2="150" y2="12" stroke="#2D1810" strokeWidth="2" />
            </svg>
          </div>
        )}
        
        <h1 style={{
          fontSize: compact ? '32px' : '48px',
          fontWeight: '700',
          color: '#92400e',
          letterSpacing: '0.1em',
          margin: 0
        }}>
          {compact ? restaurant.name?.toUpperCase() : 'MENU'}
        </h1>

        {!compact && (
           <h2 style={{ fontSize: '18px', color: '#92400e', margin: '8px 0 0', fontWeight: '500' }}>
             {restaurant.name}
           </h2>
        )}
        
        {!compact && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <svg width="150" height="24" viewBox="0 0 200 32">
              <polygon points="100,4 108,12 100,20 92,12" fill="#2D1810" />
              <line x1="50" y1="12" x2="85" y2="12" stroke="#2D1810" strokeWidth="2" />
              <line x1="115" y1="12" x2="150" y2="12" stroke="#2D1810" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>
      
      {!compact && <WineBottleIllustration />}
    </div>
  )
}

function MenuRow({ item, currency }: { item: MenuItem; currency?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px dotted #2D1810'
    }}>
      <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: 0 }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: 40,
              height: 40,
              flex: 'none',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #92400e',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#1c1917',
            margin: 0
          }}>
            {item.name}
          </h4>
          {item.description && (
            <p style={{
              fontSize: '11px',
              color: '#57534e',
              margin: '2px 0 0 0',
              lineHeight: 1.3,
              ...clampStyle(1)
            }}>
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div style={{
        fontSize: '15px',
        fontWeight: '700',
        color: '#1c1917',
        marginLeft: '12px',
        whiteSpace: 'nowrap'
      }}>
        {formatPrice(item.price, currency)}
      </div>
    </div>
  )
}

function CategoryBlock({
  category,
  currency,
}: {
  category: PageCategory
  currency?: string
}) {
  return (
    <div style={{ marginBottom: '32px', breakInside: 'avoid' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#92400e',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            margin: 0
          }}>
            {category.name}
          </h3>
          {category.continued && (
            <span style={{ border: '1px solid #92400e', color: '#92400e', borderRadius: 999, padding: '1px 6px', fontSize: 8, fontWeight: 700 }}>
              تتمة
            </span>
          )}
        </div>
        <svg width="180" height="24" viewBox="0 0 240 32" style={{ marginTop: '4px' }}>
          <polygon points="120,8 126,14 120,20 114,14" fill="#2D1810" />
          <line x1="60" y1="14" x2="110" y2="14" stroke="#2D1810" strokeWidth="2" />
          <line x1="130" y1="14" x2="180" y2="14" stroke="#2D1810" strokeWidth="2" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {category.items.map((item) => (
          <MenuRow key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </div>
  )
}

function Footer({ pageNumber, totalPages, restaurant, language }: { pageNumber: number; totalPages: number; restaurant: Restaurant; language: string }) {
  return (
    <div style={{ marginTop: 'auto', flex: 'none', zIndex: 10 }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        padding: '12px 24px',
        border: '2px solid rgba(146, 64, 14, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#92400e',
        fontWeight: '600'
      }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

export default function ElegantCocktailPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ElegantCocktailPDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 16, firstPageItems: 10, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  const pageBackground = `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%233D2914'/%3E%3Cpath d='M0 0L100 100M100 0L0 100' stroke='%238B4513' strokeWidth='0.5' opacity='0.3'/%3E%3C/svg%3E")`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #3D2914; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          background: pageBackground,
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Georgia, serif',
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5)',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '8px solid rgba(146, 64, 14, 0.2)',
            padding: '48px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Header restaurant={restaurant} />
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#92400e', fontSize: '24px' }}>
              لا توجد أصناف متاحة حالياً
            </div>
            <Footer pageNumber={1} totalPages={1} restaurant={restaurant} language={language} />
          </div>
        </div>
      ) : pages.map((page, index) => {
        const isFirst = index === 0

        return (
          <div key={index} className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            background: pageBackground,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Georgia, serif',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <div style={{
              background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5)',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '8px solid rgba(146, 64, 14, 0.2)',
              padding: '48px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Header restaurant={restaurant} compact={!isFirst} />

              <div style={{ flex: 1, minHeight: 0 }}>
                {(() => {
                  const { left, right } = splitColumns(page.categories)
                  return (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '48px',
                      alignItems: 'start',
                      minHeight: 0
                    }}>
                      <div>
                        {left.map((category) => (
                          <CategoryBlock key={`${category.id}-${category.items[0]?.id || 'empty'}-a`} category={category} currency={currency} />
                        ))}
                      </div>
                      <div>
                        {right.map((category) => (
                          <CategoryBlock key={`${category.id}-${category.items[0]?.id || 'empty'}-b`} category={category} currency={currency} />
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

              <Footer pageNumber={index + 1} totalPages={totalPages} restaurant={restaurant} language={language} />
            </div>
          </div>
        )
      })}
    </>
  )
}