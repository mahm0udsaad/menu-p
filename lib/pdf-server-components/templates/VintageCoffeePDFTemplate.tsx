import React from 'react'
import {
  type PageCategory,
  type MenuPage,
  paginateCategories,
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

interface VintageCoffeePDFTemplateProps {
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
      <div style={{
        border: '3px double #7b4a2f',
        padding: compact ? '24px 32px' : '40px',
        marginBottom: compact ? '16px' : '32px',
        backgroundColor: '#faf0e6',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: compact ? '32px' : '48px',
          fontWeight: '700',
          color: '#7b4a2f',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          margin: 0
        }}>
          {restaurant.name || 'VINTAGE COFFEE'}
        </h1>
        {!compact && (
          <>
            <div style={{ width: '100px', height: '2px', backgroundColor: '#b45309', margin: '0 auto 16px' }}></div>
            <h2 style={{ fontSize: '18px', fontWeight: '400', color: '#b45309', margin: 0, fontStyle: 'italic' }}>
              Est. 1960
            </h2>
          </>
        )}
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
      padding: '16px',
      border: '1px solid #d1b092',
      borderRadius: '8px',
      backgroundColor: '#fffaf0',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 0, alignItems: 'center' }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: 48,
              height: 48,
              flex: 'none',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid #7b4a2f',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '17px',
            fontWeight: '600',
            color: '#7b4a2f',
            margin: '0 0 4px 0',
            fontFamily: 'serif'
          }}>
            {item.name}
          </h4>
          {item.description && (
            <p style={{
              fontSize: '12px',
              color: '#b45309',
              lineHeight: 1.4,
              margin: 0,
              fontStyle: 'italic',
              ...clampStyle(1)
            }}>
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#b45309',
        marginLeft: '16px',
        fontFamily: 'serif',
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
    <div style={{
      backgroundColor: '#fffaf0',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      border: '2px solid #b45309',
      marginBottom: '32px',
      breakInside: 'avoid'
    }}>
      <div style={{
        borderBottom: '2px solid #b45309',
        marginBottom: '20px',
        paddingBottom: '12px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#7b4a2f',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontFamily: 'serif'
        }}>
          {category.name}
        </h3>
        {category.continued && (
          <span style={{ border: '1px solid #7b4a2f', color: '#7b4a2f', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>
            تتمة
          </span>
        )}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#7b4a2f', fontWeight: '600', padding: '16px 24px', borderTop: '2px solid #7b4a2f' }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

export default function VintageCoffeePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: VintageCoffeePDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 10, firstPageItems: 6, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #f5f5dc; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(to bottom right, #f5f5dc, #fef3c7)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          overflow: 'hidden',
        }}>
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#7b4a2f', fontSize: '24px' }}>
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
            background: 'linear-gradient(to bottom right, #f5f5dc, #fef3c7)',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'serif',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <Header restaurant={restaurant} compact={!isFirst} />

            <div style={{ flex: 1, minHeight: 0 }}>
              {page.categories.map((category) => (
                <CategoryBlock key={category.id} category={category} currency={currency} />
              ))}
            </div>

            <Footer pageNumber={index + 1} totalPages={totalPages} restaurant={restaurant} language={language} />
          </div>
        )
      })}
    </>
  )
}