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

interface CocktailMenuPDFTemplateProps {
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

const CocktailGlassIllustration = () => (
  <svg width="60" height="90" viewBox="0 0 80 120" style={{ color: 'white' }}>
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 30 L60 30 L40 60 L40 90" />
      <ellipse cx="40" cy="95" rx="15" ry="3" />
      <path d="M25 35 L55 35 L40 55 Z" fill="currentColor" fillOpacity="0.2" />
    </g>
  </svg>
)

const CitrusSliceIllustration = () => (
  <svg width="60" height="60" viewBox="0 0 80 80" style={{ color: 'white' }}>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="40" cy="40" r="25" fill="currentColor" fillOpacity="0.1" />
      <circle cx="40" cy="40" r="25" />
      <line x1="40" y1="15" x2="40" y2="65" />
      <line x1="15" y1="40" x2="65" y2="40" />
    </g>
  </svg>
)

function Header({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  return (
    <div style={{ marginBottom: compact ? '24px' : '48px', flex: 'none' }}>
      <h1 style={{ 
        fontSize: compact ? '48px' : '72px', 
        fontWeight: '900', 
        color: '#111827', 
        letterSpacing: '-0.05em',
        margin: 0,
        lineHeight: 1
      }}>
        COCKTAIL
      </h1>
      <h2 style={{
        fontSize: compact ? '18px' : '24px',
        fontWeight: '600',
        color: '#6b7280',
        margin: '8px 0 0 0'
      }}>
        {restaurant.name || 'BAR & LOUNGE'}
      </h2>
    </div>
  )
}

function MenuRow({ item, currency }: { item: MenuItem; currency?: string }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 0, alignItems: 'center' }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: 50,
              height: 50,
              flex: 'none',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #111827',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '4px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            margin: 0
          }}>
            {item.name}
          </h3>
          {item.description && (
            <p style={{ 
              color: '#4b5563', 
              fontSize: '13px', 
              lineHeight: 1.4,
              margin: 0,
              ...clampStyle(1)
            }}>
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div style={{ marginLeft: '16px', flexShrink: 0 }}>
        <span style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#111827'
        }}>
          {formatPrice(item.price, currency)}
        </span>
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
    <div style={{ marginBottom: '40px', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#111827', 
          letterSpacing: '0.1em',
          margin: 0,
          textTransform: 'uppercase'
        }}>
          {category.name}
        </h2>
        {category.continued && (
          <span style={{ border: '2px solid #111827', color: '#111827', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 900 }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '500', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

function Sidebar() {
  return (
    <div style={{
      width: '160px',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '48px',
      padding: '32px',
      flex: 'none'
    }}>
      <CocktailGlassIllustration />
      <CitrusSliceIllustration />
      <CocktailGlassIllustration />
      <CitrusSliceIllustration />
    </div>
  )
}

export default function CocktailMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: CocktailMenuPDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 14, firstPageItems: 10, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #f3f4f6; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          display: 'flex',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}>
          <Sidebar />
          <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column' }}>
            <Header restaurant={restaurant} />
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#6b7280', fontSize: '24px' }}>
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
            display: 'flex',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <Sidebar />
            
            <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column' }}>
              <Header restaurant={restaurant} compact={!isFirst} />

              <div style={{ flex: 1, minHeight: 0 }}>
                {page.categories.map((category) => (
                  <CategoryBlock key={category.id} category={category} currency={currency} />
                ))}
              </div>

              <Footer pageNumber={index + 1} totalPages={totalPages} restaurant={restaurant} language={language} />
            </div>
          </div>
        )
      })}
    </>
  )
}