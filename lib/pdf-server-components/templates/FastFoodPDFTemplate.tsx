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

interface FastFoodPDFTemplateProps {
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

const PizzaIllustration = () => (
  <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      <circle cx="100" cy="100" r="80" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      <circle cx="80" cy="80" r="8" fill="#C41E3A" />
      <circle cx="120" cy="70" r="8" fill="#C41E3A" />
      <circle cx="90" cy="110" r="8" fill="#C41E3A" />
    </svg>
  </div>
)

const BurgerIllustration = () => (
  <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="100" cy="70" rx="70" ry="25" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      <path d="M40 95 Q100 85 160 95 Q150 105 100 100 Q50 105 40 95" fill="#90EE90" stroke="#C41E3A" strokeWidth="2" />
      <ellipse cx="100" cy="110" rx="65" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
      <ellipse cx="100" cy="145" rx="70" ry="20" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    </svg>
  </div>
)

const FriesIllustration = () => (
  <div style={{ width: '60px', height: '80px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      <path d="M60 120 L60 180 L140 180 L140 120 L130 100 L70 100 Z" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      <rect x="75" y="80" width="8" height="40" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
      <rect x="90" y="70" width="8" height="50" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    </svg>
  </div>
)

const HotDogIllustration = () => (
  <div style={{ width: '80px', height: '60px', flexShrink: 0 }}>
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="100" cy="100" rx="80" ry="30" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
      <ellipse cx="100" cy="100" rx="70" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
    </svg>
  </div>
)

function Header({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(to right, #fef2f2, #fffbeb)',
      border: '4px solid #C41E3A',
      borderRadius: '12px',
      padding: compact ? '16px 24px' : '24px 32px',
      marginBottom: '32px',
      flex: 'none'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
      }}>
        {!compact && <PizzaIllustration />}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            fontSize: compact ? '10px' : '14px',
            color: '#C41E3A',
            fontWeight: '500',
            letterSpacing: '0.3em',
            marginBottom: '8px'
          }}>{(restaurant.name || 'BORCELLE').toUpperCase()}</div>
          <h1 style={{
            fontSize: compact ? '48px' : '72px',
            fontWeight: '900',
            color: '#C41E3A',
            letterSpacing: '0.05em',
            margin: 0,
            textTransform: 'uppercase',
            lineHeight: 1
          }}>MENU</h1>
        </div>
        {!compact && <BurgerIllustration />}
      </div>
      {!compact && (
        <div style={{
          borderTop: '4px dashed #C41E3A',
          marginTop: '24px',
          marginBottom: '0'
        }}></div>
      )}
    </div>
  )
}

function MenuRow({ item, currency }: { item: MenuItem; currency?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '8px 0',
      gap: '12px'
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
              border: '1px solid #C41E3A',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#92400e',
            margin: 0,
            lineHeight: 1.2
          }}>
            {item.name}
          </h4>
          {item.description && (
            <p style={{
              fontSize: '11px',
              color: '#92400e',
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
        fontSize: '16px',
        fontWeight: '700',
        color: '#C41E3A',
        flexShrink: 0,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', breakInside: 'avoid' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#C41E3A',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0,
          }}>
            {category.name}
          </h3>
          {category.continued && (
            <span style={{ border: '1px solid #C41E3A', color: '#C41E3A', borderRadius: 999, padding: '1px 6px', fontSize: 8, fontWeight: 700 }}>
              تتمة
            </span>
          )}
        </div>
        <div style={{ borderTop: '2px solid #C41E3A', marginTop: '4px', marginBottom: '12px' }}></div>
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
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '12px 24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '2px solid #C41E3A',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#C41E3A',
        fontWeight: '700'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <FriesIllustration />
          <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        </div>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
        <HotDogIllustration />
      </div>
    </div>
  )
}

export default function FastFoodPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: FastFoodPDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 20, firstPageItems: 12, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: linear-gradient(to bottom right, #fffbeb, #ffedd5); }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}>
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#92400e', fontSize: '24px', fontWeight: 'bold' }}>
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
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <Header restaurant={restaurant} compact={!isFirst} />

            <div style={{ flex: 1, minHeight: 0 }}>
              {(() => {
                const { left, right } = splitColumns(page.categories)
                return (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '32px',
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
        )
      })}
    </>
  )
}
