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

interface ModernPDFTemplateUnifiedProps {
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

function Header({ restaurant, language, compact = false }: { restaurant: Restaurant; language: string; compact?: boolean }) {
  const isArabic = language === 'ar'
  return (
    <div style={{ 
      textAlign: isArabic ? 'right' : 'left', 
      marginBottom: compact ? '40px' : '80px',
      position: 'relative',
      flex: 'none'
    }}>
      <div style={{ marginBottom: compact ? '24px' : '48px' }}>
        <h1 style={{ 
          fontSize: compact ? '24px' : '36px', 
          fontWeight: '700', 
          color: '#111827',
          marginBottom: '8px',
          letterSpacing: '0.1em',
          margin: '0 0 8px 0'
        }}>
          {restaurant?.name?.toUpperCase() || 'BORCELLE'}
        </h1>
        <p style={{ 
          fontSize: compact ? '14px' : '18px', 
          color: '#374151', 
          fontWeight: '500',
          letterSpacing: '0.1em',
          margin: 0
        }}>
          {restaurant.category || 'COFFEESHOP'}
        </p>
      </div>
      {!compact && (
        <div style={{ 
          textAlign: isArabic ? 'left' : 'right'
        }}>
          <h2 style={{ 
            fontSize: '96px', 
            fontWeight: '900', 
            color: '#111827',
            letterSpacing: '0',
            margin: 0,
            lineHeight: '0.9'
          }}>
            {isArabic ? 'قائمة الطعام' : 'MENU'}
          </h2>
        </div>
      )}
    </div>
  )
}

function MenuRow({ item, currency, language }: { item: MenuItem; currency?: string; language: string }) {
  const isArabic = language === 'ar'
  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      alignItems: 'center',
      padding: '20px 24px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(251, 146, 60, 0.1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          style={{
            width: 64,
            height: 64,
            flex: 'none',
            objectFit: 'cover',
            borderRadius: '12px',
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#111827',
          margin: '0 0 4px 0'
        }}>
          {item.name}
        </h4>
        {item.description && (
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            lineHeight: '1.4',
            margin: 0,
            ...clampStyle(2)
          }}>
            {item.description}
          </p>
        )}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: isArabic ? '0' : '24px',
        marginRight: isArabic ? '24px' : '0'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#ea580c',
          whiteSpace: 'nowrap'
        }}>
          {formatPrice(item.price, currency)}
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
    <div style={{
      position: 'relative',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(8px)',
      borderRadius: '32px',
      padding: '40px',
      boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(251, 146, 60, 0.2)',
      marginBottom: '48px',
      breakInside: 'avoid'
    }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ 
          fontSize: '28px', 
          fontWeight: '900', 
          color: '#111827',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {category.name}
        </h3>
        {category.continued && (
          <span style={{ border: '2px solid #ea580c', color: '#ea580c', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 900 }}>
            تتمة
          </span>
        )}
      </div>

      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
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
    <div style={{ 
      marginTop: 'auto',
      textAlign: 'center',
      flex: 'none'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: '24px',
        padding: '24px 48px',
        border: '1px solid rgba(251, 146, 60, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500'
      }}>
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
        top: '0',
        right: '0',
        width: '256px',
        height: '256px',
        background: 'linear-gradient(225deg, #fb923c 0%, transparent 70%)',
        borderRadius: '50%',
        opacity: '0.3',
        transform: 'translate(128px, -128px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '384px',
        height: '384px',
        background: 'linear-gradient(45deg, #f59e0b 0%, transparent 70%)',
        borderRadius: '50%',
        opacity: '0.2',
        transform: 'translate(-192px, 192px)'
      }}></div>
      <div style={{
        position: 'absolute',
        left: '32px',
        top: '128px',
        width: '128px',
        height: '128px',
        opacity: '0.2'
      }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#92400e', borderRadius: '50%', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '8px', backgroundColor: '#78350f', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '4px', height: '64px', backgroundColor: '#d97706', transform: 'translate(-50%, -50%) rotate(12deg)' }}></div>
        </div>
      </div>
    </>
  )
}

export default function ModernPDFTemplateUnified({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ModernPDFTemplateUnifiedProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  // Large padding and large blocks mean low budget.
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 6, firstPageItems: 4, headingCost: 1.5 })
  const totalPages = Math.max(pages.length, 1)
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: linear-gradient(135deg, #fef7ed 0%, #fef3c7 50%, #fed7aa 100%); }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          padding: '64px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}>
          <DecorativeBackground />
          <Header restaurant={restaurant} language={language} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#6b7280', fontSize: '24px', position: 'relative' }}>
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
            padding: '64px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <DecorativeBackground />
            
            <Header restaurant={restaurant} language={language} compact={!isFirst} />

            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
              {page.categories.map((category) => (
                <CategoryBlock key={category.id} category={category} currency={currency} language={language} />
              ))}
            </div>

            <Footer pageNumber={index + 1} totalPages={totalPages} restaurant={restaurant} language={language} />
          </div>
        )
      })}
    </>
  )
}
