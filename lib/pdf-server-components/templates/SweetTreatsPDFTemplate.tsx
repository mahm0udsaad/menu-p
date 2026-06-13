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

interface SweetTreatsPDFTemplateProps {
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
    <div style={{
      textAlign: 'center',
      padding: compact ? '24px 0' : '48px 0',
      color: '#ec4899',
      backgroundColor: '#FF7F7F22',
      flex: 'none',
      marginBottom: '32px'
    }}>
      <h1 style={{
        fontSize: compact ? '40px' : '64px',
        fontWeight: '700',
        marginBottom: '8px',
        color: '#ec4899',
        fontFamily: 'serif',
        margin: 0
      }}>
        {restaurant.name || 'Sweet Treats'}
      </h1>
      <div style={{
        fontSize: '16px',
        letterSpacing: '0.3em',
        fontWeight: '300'
      }}>• M E N U •</div>
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
      borderBottom: '1px solid #fce7f3'
    }}>
      <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 0 }}>
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
              border: '2px solid #ec4899',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#ec4899',
            margin: 0
          }}>
            {item.name}
          </h4>
          {item.description && (
            <p style={{
              fontSize: '12px',
              color: '#be185d',
              margin: '2px 0 0 0',
              lineHeight: 1.4,
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
        color: '#ec4899',
        marginLeft: '16px'
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
    <div style={{ marginBottom: '40px', breakInside: 'avoid' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <h3 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#ec4899',
            margin: 0
          }}>
            {category.name}
          </h3>
          {category.continued && (
            <span style={{ border: '1px solid #ec4899', color: '#ec4899', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
              تتمة
            </span>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '448px',
        margin: '0 auto'
      }}>
        {category.items.map((item) => (
          <MenuRow key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </div>
  )
}

function Footer({ pageNumber, totalPages, restaurant, language }: { pageNumber: number; totalPages: number; restaurant: Restaurant; language: string }) {
  return (
    <div style={{ marginTop: 'auto', textAlign: 'center', flex: 'none', zIndex: 10 }}>
      <div style={{
        backgroundColor: '#FF7F7F22',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#be185d',
        fontWeight: '600'
      }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

export default function SweetTreatsPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: SweetTreatsPDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 10, firstPageItems: 6, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fdf2f8; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          overflow: 'hidden',
        }}>
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#be185d', fontSize: '24px' }}>
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
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'serif',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <Header restaurant={restaurant} compact={!isFirst} />

            <div style={{ flex: 1, minHeight: 0, padding: '0 48px' }}>
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
