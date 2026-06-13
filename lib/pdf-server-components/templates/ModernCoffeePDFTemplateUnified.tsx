import React from 'react'
import { TEMPLATE_DESIGN_TOKENS } from '@/lib/template-design-tokens'
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

interface ModernCoffeePDFTemplateUnifiedProps {
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
    <div style={{ textAlign: isArabic ? 'right' : 'left', marginBottom: compact ? '24px' : '48px', position: 'relative', flex: 'none' }}>
      <div style={{ marginBottom: compact ? '16px' : '32px' }}>
        <h1 style={{ 
          fontSize: compact ? '24px' : '36px', 
          fontWeight: '700', 
          color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
          marginBottom: '8px',
          letterSpacing: '0.1em',
          margin: '0 0 8px 0',
        }}>
          {(restaurant.name || 'BORCELLE').toUpperCase()}
        </h1>
        <p style={{ 
          fontSize: compact ? '14px' : '18px', 
          color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary, 
          fontWeight: '500',
          letterSpacing: '0.2em',
          margin: 0
        }}>{restaurant.category || 'COFFEESHOP'}</p>
      </div>
      {!compact && (
        <div style={{ textAlign: isArabic ? 'right' : 'left' }}>
          <h2 style={{ 
            fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.title, 
            fontWeight: '900', 
            color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
            letterSpacing: '-0.05em',
            margin: 0,
            lineHeight: 1
          }}>
            {isArabic ? 'القائمة' : 'MENU'}
          </h2>
        </div>
      )}
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
      borderBottom: '1px solid rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: 48,
              height: 48,
              flex: 'none',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.item, 
            fontWeight: '600', 
            color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}>
            {item.name}
          </h4>
          {item.description && (
            <p style={{
              fontSize: '12px',
              color: '#666',
              margin: '2px 0 0',
              ...clampStyle(1)
            }}>{item.description}</p>
          )}
        </div>
      </div>
      <div style={{ 
        fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.price, 
        fontWeight: '700', 
        color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
        marginLeft: '16px',
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
    <div style={{ position: 'relative', marginBottom: '32px', breakInside: 'avoid' }}>
      <div style={{
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${TEMPLATE_DESIGN_TOKENS.modern.colors.accent}`
      }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ 
            fontSize: TEMPLATE_DESIGN_TOKENS.modern.fonts.sizes.category, 
            fontWeight: '900', 
            color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary,
            letterSpacing: '0.2em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            {category.name}
          </h3>
          {category.continued && (
            <span style={{ border: `1px solid ${TEMPLATE_DESIGN_TOKENS.modern.colors.primary}`, color: TEMPLATE_DESIGN_TOKENS.modern.colors.primary, borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 900 }}>
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
  const isArabic = language === 'ar'
  return (
    <div style={{ marginTop: 'auto', textAlign: 'center', flex: 'none', zIndex: 10 }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        padding: '16px 24px',
        border: `1px solid ${TEMPLATE_DESIGN_TOKENS.modern.colors.accent}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#374151'
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
      <div style={{ position: 'absolute', top: 0, right: 0, width: '256px', height: '256px', background: 'linear-gradient(to bottom left, #f97316, transparent)', borderRadius: '50%', opacity: 0.3, transform: 'translate(128px, -128px)' }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '384px', height: '384px', background: 'linear-gradient(to top right, #f59e0b, transparent)', borderRadius: '50%', opacity: 0.2, transform: 'translate(-192px, 192px)' }}></div>
      <div style={{ position: 'absolute', left: '32px', top: '128px', width: '128px', height: '128px', opacity: 0.2 }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary, borderRadius: '50%', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '8px', backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.primary, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '4px', height: '64px', backgroundColor: TEMPLATE_DESIGN_TOKENS.modern.colors.secondary, transform: 'translate(-50%, -50%) rotate(12deg)' }}></div>
        </div>
      </div>
    </>
  )
}

export default function ModernCoffeePDFTemplateUnified({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: ModernCoffeePDFTemplateUnifiedProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 8, firstPageItems: 6, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: ${TEMPLATE_DESIGN_TOKENS.modern.colors.background}; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          padding: '48px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: TEMPLATE_DESIGN_TOKENS.modern.fonts.family,
          overflow: 'hidden',
        }}>
          <DecorativeBackground />
          <Header restaurant={restaurant} language={language} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#666', fontSize: '24px', position: 'relative', zIndex: 10 }}>
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
            padding: '48px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: TEMPLATE_DESIGN_TOKENS.modern.fonts.family,
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <DecorativeBackground />
            
            <Header restaurant={restaurant} language={language} compact={!isFirst} />

            <div style={{ flex: 1, position: 'relative', zIndex: 10, minHeight: 0 }}>
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