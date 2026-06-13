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

interface PaintingStylePDFTemplateProps {
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
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      marginBottom: compact ? '24px' : '48px',
      flex: 'none'
    }}>
      {restaurant.logo_url && !compact ? (
        <img 
          src={restaurant.logo_url} 
          alt={restaurant.name} 
          style={{
            width: '100%',
            maxWidth: '300px',
            height: 'auto',
            marginBottom: '24px',
            objectFit: 'contain'
          }}
        />
      ) : (
        <h1 style={{ 
          fontSize: compact ? '24px' : '36px', 
          fontWeight: '700', 
          textAlign: 'center',
          margin: compact ? '0' : '16px 0',
          color: '#2d3748',
          fontFamily: 'serif'
        }}>
          {restaurant.name}
        </h1>
      )}
    </div>
  )
}

function MenuRow({ item, currency, language }: { item: MenuItem; currency?: string; language: string }) {
  const isArabic = language === 'ar'
  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #d2b48c',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
              border: '1px solid #d2b48c',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: item.description ? '4px' : '0'
          }}>
            <h3 style={{ 
              fontSize: '17px', 
              fontWeight: '600', 
              color: '#2d3748',
              margin: 0,
              flex: 1,
              lineHeight: '1.2'
            }}>
              {item.name}
            </h3>
            <div style={{ 
              fontSize: '17px', 
              fontWeight: '700', 
              color: '#c8a97e',
              marginLeft: isArabic ? '0' : '16px',
              marginRight: isArabic ? '16px' : '0',
              whiteSpace: 'nowrap'
            }}>
              {formatPrice(item.price, currency)}
            </div>
          </div>
          {item.description && (
            <p style={{ 
              fontSize: '12px', 
              color: '#4a5568', 
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
    </div>
  )
}

function CategoryBlock({
  category,
  currency,
  language
}: {
  category: PageCategory
  currency?: string
  language: string
}) {
  return (
    <div style={{ marginBottom: '40px', breakInside: 'avoid' }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '24px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <h2 style={{ 
            fontSize: '26px', 
            fontWeight: '700', 
            color: '#c8a97e',
            margin: 0,
          }}>
            {category.name}
          </h2>
          {category.continued && (
            <span style={{ border: '1px solid #c8a97e', color: '#c8a97e', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
              تتمة
            </span>
          )}
        </div>
        <div style={{
          width: '80px',
          height: '2px',
          backgroundColor: '#c8a97e',
          margin: '8px auto 0'
        }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {category.items.map((item) => (
          <MenuRow key={item.id} item={item} currency={currency} language={language} />
        ))}
      </div>
    </div>
  )
}

function Footer({ pageNumber, totalPages, restaurant, language }: { pageNumber: number; totalPages: number; restaurant: Restaurant; language: string }) {
  const isArabic = language === 'ar'
  return (
    <div style={{ marginTop: 'auto', textAlign: 'center', padding: '16px 0', borderTop: '2px solid #d2b48c', flex: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#c8a97e', fontWeight: '600' }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

export default function PaintingStylePDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: PaintingStylePDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 10, firstPageItems: 6, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  const backgroundStyle = {
    background: '#f5f1e8',
    backgroundImage: `url('/assets/painting-bg.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #f5f1e8; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          ...backgroundStyle,
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          overflow: 'hidden',
        }}>
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#c8a97e', fontSize: '24px' }}>
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
            ...backgroundStyle,
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'serif',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(245, 241, 232, 0.8)',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            }}>
              <Header restaurant={restaurant} compact={!isFirst} />

              <div style={{ flex: 1, minHeight: 0 }}>
                {page.categories.map((category) => (
                  <CategoryBlock key={category.id} category={category} currency={currency} language={language} />
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
