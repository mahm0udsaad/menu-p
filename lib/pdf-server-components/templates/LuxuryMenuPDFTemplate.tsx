import React from 'react'
import { TEMPLATE_DESIGN_TOKENS } from '@/lib/template-design-tokens'
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

interface LuxuryMenuPDFTemplateProps {
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
        border: `3px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
        padding: compact ? '24px 32px' : '48px',
        marginBottom: compact ? '16px' : '32px',
        position: 'relative'
      }}>
        <h1 style={{
          fontWeight: '300',
          marginBottom: '24px',
          fontSize: compact ? '28px' : TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.title,
          color: TEMPLATE_DESIGN_TOKENS.luxury.colors.text,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          margin: compact ? '0 0 12px 0' : '0 0 24px 0',
        }}>
          {restaurant.name || 'LUXURY'}
        </h1>
        <div style={{
          width: '120px',
          height: '1px',
          backgroundColor: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
          margin: '0 auto 24px'
        }}></div>
        {!compact && (
          <h2 style={{
            fontWeight: 'normal',
            fontSize: '20px',
            color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
            margin: 0,
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}>
            {restaurant.category || 'Fine Dining Experience'}
          </h2>
        )}
      </div>
    </div>
  )
}

function DecorativeBorder() {
  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      bottom: '16px',
      border: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}33`,
      borderRadius: '8px',
      pointerEvents: 'none',
      zIndex: 5
    }}>
      <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '32px', height: '32px', borderLeft: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderTop: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderTopLeftRadius: '8px' }}></div>
      <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '32px', height: '32px', borderRight: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderTop: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderTopRightRadius: '8px' }}></div>
      <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '32px', height: '32px', borderLeft: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderBottomLeftRadius: '8px' }}></div>
      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '32px', height: '32px', borderRight: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, borderBottomRightRadius: '8px' }}></div>
    </div>
  )
}

function MenuRow({ item, currency }: { item: MenuItem; currency?: string }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          style={{
            width: 48,
            height: 48,
            flex: 'none',
            objectFit: 'cover',
            borderRadius: '4px',
            border: `1px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}66`,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 style={{
            fontWeight: 'normal',
            fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.item,
            color: TEMPLATE_DESIGN_TOKENS.luxury.colors.text,
            letterSpacing: '0.1em',
            margin: '0 0 4px 0',
          }}>
            {item.name}
          </h4>
          <div style={{
            fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.price,
            fontWeight: 'bold',
            color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
            marginLeft: '16px',
            whiteSpace: 'nowrap'
          }}>
            {formatPrice(item.price, currency)}
          </div>
        </div>
        {item.description && (
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.4,
            fontWeight: '300',
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
    <div style={{ position: 'relative', marginBottom: '32px', breakInside: 'avoid' }}>
      <div style={{
        borderBottom: `2px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`,
        marginBottom: '20px',
        paddingBottom: '12px',
        position: 'relative',
        display: 'flex',
        alignItems: 'baseline',
        gap: '12px'
      }}>
        <h3 style={{
          fontWeight: '300',
          fontSize: TEMPLATE_DESIGN_TOKENS.luxury.fonts.sizes.category,
          color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          margin: 0
        }}>
          {category.name}
        </h3>
        {category.continued && (
          <span style={{ border: `1px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}`, color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary, borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>
            تتمة
          </span>
        )}
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          width: '80px',
          height: '2px',
          backgroundColor: TEMPLATE_DESIGN_TOKENS.luxury.colors.text
        }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
      borderTop: `1px solid ${TEMPLATE_DESIGN_TOKENS.luxury.colors.primary}66`,
      paddingTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary,
      fontSize: '12px',
      flex: 'none',
      zIndex: 10
    }}>
      <span style={{ direction: 'ltr', letterSpacing: '0.1em' }}>{restaurant.website || 'menu-p.com'}</span>
      <span style={{ letterSpacing: '0.1em' }}>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
    </div>
  )
}

export default function LuxuryMenuPDFTemplate({ 
  restaurant, 
  categories, 
  language = 'ar',
  customizations,
  pdfMode = false
}: LuxuryMenuPDFTemplateProps) {
  const currency = restaurant.currency || undefined
  const cleanCategories = getAvailableCategories(categories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 18, firstPageItems: 12, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  const backgroundStyle = {
    backgroundColor: TEMPLATE_DESIGN_TOKENS.luxury.colors.background,
    fontFamily: TEMPLATE_DESIGN_TOKENS.luxury.fonts.family,
    color: TEMPLATE_DESIGN_TOKENS.luxury.colors.text,
    backgroundImage: TEMPLATE_DESIGN_TOKENS.luxury.colors.backgroundGradient
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          ...backgroundStyle,
          padding: '48px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <DecorativeBorder />
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: TEMPLATE_DESIGN_TOKENS.luxury.colors.primary, fontSize: '24px', position: 'relative', zIndex: 10 }}>
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
            ...backgroundStyle,
            padding: '48px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <DecorativeBorder />

            <div style={{ maxWidth: '100%', margin: '0 auto', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Header restaurant={restaurant} compact={!isFirst} />

              {(() => {
                const { left, right } = splitColumns(page.categories)
                return (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '48px',
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
          </div>
        )
      })}
    </>
  )
}