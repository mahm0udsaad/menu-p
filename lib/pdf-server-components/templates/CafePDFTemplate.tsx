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

interface CafePDFTemplateProps {
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

function Header({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: compact ? '32px' : '64px', flex: 'none' }}>
      <h1 style={{ 
        fontSize: compact ? '64px' : '96px', 
        fontWeight: '700', 
        letterSpacing: '0.1em',
        color: '#000000',
        marginBottom: '16px',
        margin: 0
      }}>
        MENU
      </h1>
      {restaurant.name && (
        <h2 style={{
          fontSize: compact ? '18px' : '24px',
          fontWeight: '600',
          color: '#6b7280',
          margin: '16px 0 0 0'
        }}>
          {restaurant.name}
        </h2>
      )}
      <div style={{ 
        width: '100%', 
        height: '1px', 
        backgroundColor: '#000000',
        marginTop: compact ? '12px' : '16px'
      }}></div>
    </div>
  )
}

function MenuRow({ item, currency }: { item: MenuItem; currency?: string }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '8px' }}>
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          style={{
            width: 48,
            height: 48,
            flex: 'none',
            objectFit: 'cover',
            borderRadius: 4,
            border: '1px solid #d1d5db',
            background: '#fff',
          }}
        />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '4px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            margin: 0,
            lineHeight: 1.2
          }}>
            {item.name}
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700',
            marginLeft: '16px',
            whiteSpace: 'nowrap'
          }}>
            {formatPrice(item.price, currency)}
          </div>
        </div>
        {item.description && (
          <p style={{ 
            fontSize: '14px', 
            color: '#374151', 
            lineHeight: 1.4,
            margin: 0,
            ...clampStyle(2)
          }}>
            {item.description}
          </p>
        )}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          margin: 0
        }}>
          {category.name}.
        </h2>
        {category.continued && (
          <span style={{ border: '1px solid #6b7280', color: '#6b7280', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>
            تتمة
          </span>
        )}
      </div>
      <div style={{ 
        width: '100%', 
        height: '1px', 
        backgroundColor: '#000000',
        marginBottom: '24px'
      }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {category.items.map((item) => (
          <MenuRow key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </div>
  )
}

function Footer({ pageNumber, totalPages, restaurant }: { pageNumber: number; totalPages: number; restaurant: Restaurant }) {
  return (
    <div style={{
      marginTop: 'auto',
      borderTop: '1px solid #000000',
      paddingTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#6b7280',
      fontSize: '12px',
      flex: 'none',
      fontFamily: 'Georgia, serif'
    }}>
      <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
      <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
    </div>
  )
}

export default function CafePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: CafePDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 16, firstPageItems: 12, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #f5f1eb; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          backgroundColor: '#f5f1eb', 
          color: '#000000',
          padding: '48px',
          fontFamily: 'Georgia, serif',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#6b7280', fontSize: '18px' }}>
            لا توجد أصناف متاحة حالياً
          </div>
          <Footer pageNumber={1} totalPages={1} restaurant={restaurant} />
        </div>
      ) : pages.map((page, index) => {
        const isFirst = index === 0

        return (
          <div key={index} className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            backgroundColor: '#f5f1eb', 
            color: '#000000',
            padding: '48px',
            fontFamily: 'Georgia, serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <Header restaurant={restaurant} compact={!isFirst} />

            {(() => {
              const { left, right } = splitColumns(page.categories)
              return (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '64px',
                  alignItems: 'start',
                  minHeight: 0,
                  flex: 1
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

            <Footer pageNumber={index + 1} totalPages={totalPages} restaurant={restaurant} />
          </div>
        )
      })}
    </>
  )
}