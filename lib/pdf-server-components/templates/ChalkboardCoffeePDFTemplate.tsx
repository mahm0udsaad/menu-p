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

interface ChalkboardCoffeePDFTemplateProps {
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

const ChalkCoffeeBean = ({ style = {} }) => (
  <svg width="40" height="30" viewBox="0 0 40 30" style={{ position: 'absolute', ...style }}>
    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="20" cy="15" rx="15" ry="12" />
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
    </g>
  </svg>
)

const ChalkArrow = ({ style = {} }) => (
  <svg width="60" height="20" viewBox="0 0 80 20" style={{ ...style }}>
    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M5 10 Q20 8 40 10 Q60 12 70 10" />
      <path d="M65 6 L70 10 L65 14" />
    </g>
  </svg>
)

function Header({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: compact ? '32px' : '48px', position: 'relative', zIndex: 10, flex: 'none' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: compact ? '12px' : '24px'
      }}>
        {!compact && <ChalkCoffeeCup style={{ position: 'static', opacity: 0.6 }} />}
        <h1 style={{ 
          fontSize: compact ? '24px' : '36px', 
          fontWeight: '700', 
          color: '#ffffff',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          fontFamily: 'cursive'
        }}>
          {restaurant.name || 'BORCELLE'}
        </h1>
      </div>
      <div style={{ position: 'relative' }}>
        <h2 style={{ 
          fontSize: compact ? '48px' : '72px', 
          fontWeight: '700', 
          color: '#ffffff',
          margin: 0,
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
          <svg width="200" height="10" viewBox="0 0 200 10">
            <path d="M10 5 Q50 2 100 5 Q150 8 190 5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function MenuRow({ item, currency }: { item: MenuItem; currency?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
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
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            fontSize: '17px', 
            color: '#ffffff',
            margin: 0,
            fontFamily: 'cursive'
          }}>
            {item.name}
          </h4>
          {item.description && (
            <p style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.7)', 
              margin: '2px 0 0 0',
              fontFamily: 'cursive',
              ...clampStyle(1)
            }}>
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div style={{ 
        fontSize: '17px', 
        fontWeight: '700', 
        color: '#ffffff',
        marginLeft: '12px',
        fontFamily: 'cursive',
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
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '4px'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#ffffff',
            margin: 0,
            fontFamily: 'cursive'
          }}>
            {category.name}
          </h3>
          {category.continued && (
            <span style={{ border: '1px solid white', color: 'white', borderRadius: 999, padding: '1px 6px', fontSize: 8, fontWeight: 700 }}>
              تتمة
            </span>
          )}
          <ChalkArrow style={{ opacity: 0.6 }} />
        </div>
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.4)'
        }}></div>
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
    <div style={{ marginTop: 'auto', textAlign: 'center', padding: '16px 0', flex: 'none', zIndex: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'cursive' }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

function DecorativeBackground() {
  return (
    <>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
          radial-gradient(circle at 75% 75%, white 0.5px, transparent 0.5px)
        `,
        backgroundSize: '100px 100px, 150px 150px',
        pointerEvents: 'none'
      }}></div>
      <ChalkCoffeeBean style={{ left: '20px', top: '80px', opacity: 0.3, transform: 'rotate(12deg)' }} />
      <ChalkCoffeeBean style={{ right: '20px', bottom: '120px', opacity: 0.3, transform: 'rotate(-30deg)' }} />
    </>
  )
}

export default function ChalkboardCoffeePDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations,
  pdfMode = false
}: ChalkboardCoffeePDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 18, firstPageItems: 12, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #1a1a1a; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'cursive',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <DecorativeBackground />
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '24px', zIndex: 10 }}>
            لا توجد أصناف متاحة حالياً
          </div>
          <Footer pageNumber={1} totalPages={1} restaurant={restaurant} language={language} />
        </div>
      ) : pages.map((page, index) => {
        const isFirst = index === 0

        return (
          <div key={index} className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'cursive',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
            position: 'relative'
          }}>
            <DecorativeBackground />
            
            <Header restaurant={restaurant} compact={!isFirst} />

            <div style={{ flex: 1, minHeight: 0, zIndex: 10 }}>
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
                        <CategoryBlock key={`${category.id}-a`} category={category} currency={currency} />
                      ))}
                    </div>
                    <div>
                      {right.map((category) => (
                        <CategoryBlock key={`${category.id}-b`} category={category} currency={currency} />
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            <Footer pageNumber={index + 1} totalPages={totalPages} restaurant={restaurant} language={language} />
          </div>
        )
      })}
    </>
  )
}
