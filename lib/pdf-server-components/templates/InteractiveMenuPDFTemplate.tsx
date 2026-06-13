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

interface InteractiveMenuPDFTemplateProps {
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
        fontSize: compact ? '64px' : '128px', 
        fontWeight: '800', 
        color: '#000000',
        marginBottom: '16px',
        letterSpacing: '0.2em',
        margin: 0
      }}>
        MENU
      </h1>
      {restaurant.name && (
        <h2 style={{ fontSize: compact ? '18px' : '24px', fontWeight: '600', color: '#666', margin: '8px 0 0' }}>
          {restaurant.name}
        </h2>
      )}
      <div style={{
        width: '100%',
        height: '1px',
        backgroundColor: '#000000',
        marginTop: compact ? '16px' : '24px'
      }}></div>
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
      borderBottom: '1px solid #f3f4f6'
    }}>
      <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: 0, alignItems: 'center' }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: 40,
              height: 40,
              flex: 'none',
              objectFit: 'cover',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#000000',
            margin: 0
          }}>
            {item.name}
          </h3>
          {item.description && (
            <p style={{ 
              fontSize: '12px', 
              color: '#666666', 
              lineHeight: '1.4',
              margin: '2px 0 0 0',
              ...clampStyle(1)
            }}>
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        color: '#000000',
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
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: '#000000',
            margin: 0
          }}>
            {category.name}.
          </h2>
          {category.continued && (
            <span style={{ border: '1px solid #000', color: '#000', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 800 }}>
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
    </div>
  )
}

function Footer({ pageNumber, totalPages, restaurant, language }: { pageNumber: number; totalPages: number; restaurant: Restaurant; language: string }) {
  return (
    <div style={{ marginTop: 'auto', textAlign: 'center', padding: '16px 0', flex: 'none', zIndex: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666', borderTop: '1px solid #000', paddingTop: '16px' }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

export default function InteractiveMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: InteractiveMenuPDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 16, firstPageItems: 10, headingCost: 2 })
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
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}>
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#666', fontSize: '24px' }}>
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
            backgroundColor: '#f5f1eb',
            padding: '48px',
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
