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

interface BotanicalCafePDFTemplateProps {
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
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: compact ? '48px' : '80px',
        height: compact ? '48px' : '80px',
        backgroundColor: TEMPLATE_DESIGN_TOKENS.botanical.colors.accent,
        borderRadius: '50%',
        marginBottom: compact ? '12px' : '24px'
      }}>
        <svg width={compact ? 24 : 40} height={compact ? 24 : 40} viewBox="0 0 24 24" style={{ color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary }}>
          <path fill="currentColor" d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      </div>
      <h1 style={{
        fontWeight: 'bold',
        marginBottom: '16px',
        fontSize: compact ? '24px' : TEMPLATE_DESIGN_TOKENS.botanical.fonts.sizes.title,
        color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        margin: 0
      }}>
        {restaurant.name || 'Botanical'}
      </h1>
      {!compact && (
        <>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary, marginBottom: '16px' }}>CAFE</div>
          <div style={{ width: '100px', height: '3px', backgroundColor: TEMPLATE_DESIGN_TOKENS.botanical.colors.secondary, margin: '0 auto 16px', borderRadius: '2px' }}></div>
          <p style={{ fontSize: '18px', maxWidth: '400px', margin: '0 auto', color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary }}>Fresh, organic, and naturally inspired</p>
        </>
      )}
    </div>
  )
}

function MenuRow({ item, currency, language }: { item: MenuItem; currency?: string; language: string }) {
  const isRTL = language === 'ar'
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f9ff' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: 56,
              height: 56,
              flex: 'none',
              objectFit: 'cover',
              borderRadius: '12px',
              border: `2px solid ${TEMPLATE_DESIGN_TOKENS.botanical.colors.accent}`,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4px'
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary,
              margin: 0,
              flex: 1,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              {item.name}
            </h4>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: TEMPLATE_DESIGN_TOKENS.botanical.colors.secondary,
              marginLeft: isRTL ? '0' : '16px',
              marginRight: isRTL ? '16px' : '0',
              whiteSpace: 'nowrap'
            }}>
              {formatPrice(item.price, currency)}
            </div>
          </div>
          {item.description && (
            <p style={{
              fontSize: '13px',
              color: '#15803d',
              lineHeight: 1.4,
              margin: 0,
              textAlign: isRTL ? 'right' : 'left',
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
  const isRTL = language === 'ar'
  return (
    <div style={{ marginBottom: '48px', breakInside: 'avoid' }}>
      <div style={{
        borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.botanical.colors.secondary}`,
        marginBottom: '24px',
        paddingBottom: '12px',
        position: 'relative',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <h3 style={{
          fontSize: TEMPLATE_DESIGN_TOKENS.botanical.fonts.sizes.category,
          fontWeight: '600',
          color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary,
          margin: 0
        }}>
          {category.name}
        </h3>
        {category.continued && (
          <span style={{ border: `1px solid ${TEMPLATE_DESIGN_TOKENS.botanical.colors.primary}`, color: TEMPLATE_DESIGN_TOKENS.botanical.colors.primary, borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>
            تتمة
          </span>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px 32px',
        boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1)',
        border: `1px solid ${TEMPLATE_DESIGN_TOKENS.botanical.colors.accent}`,
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {category.items.map((item) => (
          <MenuRow key={item.id} item={item} currency={currency} language={language} />
        ))}
      </div>
    </div>
  )
}

function Footer({ pageNumber, totalPages, restaurant, language }: { pageNumber: number; totalPages: number; restaurant: Restaurant; language: string }) {
  return (
    <div style={{ marginTop: 'auto', textAlign: 'center', padding: '16px 0', flex: 'none', zIndex: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

const FeatherIllustration = ({ style = {} }) => (
  <svg width="100" height="250" viewBox="0 0 120 300" style={{ position: 'absolute', color: '#16a34a22', ...style }}>
    <g fill="currentColor">
      <path d="M60 10 Q50 50 45 100 Q40 150 35 200 Q30 250 25 290 L35 290 Q40 250 45 200 Q50 150 55 100 Q60 50 70 10 Z" />
    </g>
  </svg>
)

export default function BotanicalCafePDFTemplate({
  restaurant,
  categories,
  language = 'ar',
  customizations,
  pdfMode = false
}: BotanicalCafePDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 8, firstPageItems: 4, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: ${TEMPLATE_DESIGN_TOKENS.botanical.colors.background}; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          background: TEMPLATE_DESIGN_TOKENS.botanical.colors.background,
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: TEMPLATE_DESIGN_TOKENS.botanical.fonts.family,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <FeatherIllustration style={{ top: '40px', left: '20px', transform: 'rotate(-15deg)' }} />
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#16a34a', fontSize: '24px', zIndex: 10 }}>
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
            background: TEMPLATE_DESIGN_TOKENS.botanical.colors.background,
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: TEMPLATE_DESIGN_TOKENS.botanical.fonts.family,
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
            position: 'relative'
          }}>
            <FeatherIllustration style={{ top: isFirst ? '200px' : '40px', left: '20px', transform: 'rotate(-15deg)' }} />
            <FeatherIllustration style={{ bottom: '40px', right: '20px', transform: 'rotate(165deg)' }} />

            <Header restaurant={restaurant} compact={!isFirst} />

            <div style={{ flex: 1, minHeight: 0, zIndex: 10 }}>
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
