import React from 'react'
import {
  type PageCategory,
  type MenuPage,
  type MenuItem,
  type MenuCategory,
  paginateCategories,
  splitColumns,
  A4_PAGE_WIDTH as PAGE_WIDTH,
  A4_PAGE_HEIGHT as PAGE_HEIGHT
} from '../pagination-utils'

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

interface MenaHospitalityPDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: string
  customizations?: any
  pdfMode?: boolean
}

const PAPER = '#fbf5ec'
const INK = '#1d1914'
const MUTED = '#786f63'
const RULE = '#d8c8ac'
const ACCENT = '#8e2a3c'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

const toArabicDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)])

const clampStyle = (lines: number): React.CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
})

function formatCurrency(currency?: string) {
  if (!currency || currency === 'SAR') return 'ر.س'
  if (currency === 'EGP') return 'ج.م'
  if (currency === 'AED') return 'د.إ'
  return currency
}

function formatPrice(price: number | null, currency?: string) {
  if (price === null || price === undefined) return ''
  return `${toArabicDigits(Number(price).toLocaleString('en-US', { maximumFractionDigits: 2 }))} ${formatCurrency(currency)}`
}

function getAvailableCategories(categories: MenuCategory[]) {
  return categories
    .map((category) => ({
      ...category,
      menu_items: (category.menu_items || []).filter((item) => item.is_available !== false),
    }))
    .filter((category) => category.menu_items.length > 0)
}

function getHeroItem(categories: MenuCategory[]) {
  const featured = categories
    .flatMap((category) => category.menu_items)
    .find((item) => item.is_featured && item.image_url)

  if (featured) return featured

  return categories
    .flatMap((category) => category.menu_items)
    .find((item) => item.image_url)
}

function Ornament() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 7 }}>
      <span style={{ width: 38, height: 1, background: RULE }} />
      <span style={{ width: 5, height: 5, background: ACCENT, transform: 'rotate(45deg)' }} />
      <span style={{ width: 38, height: 1, background: RULE }} />
    </div>
  )
}

function Header({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  return (
    <header style={{ textAlign: 'center', flex: 'none' }}>
      <div style={{ fontSize: compact ? 8 : 10, letterSpacing: '0.42em', fontWeight: 700, color: ACCENT, direction: 'ltr' }}>
        {(restaurant.name || 'MENU').replace(/[^\x00-\x7F]/g, '').trim() || 'MENU'}
      </div>
      <div style={{
        fontFamily: "'Amiri', 'Times New Roman', serif",
        fontSize: compact ? 34 : 54,
        lineHeight: 1.22,
        fontWeight: 700,
        marginTop: compact ? 0 : 2,
      }}>
        {restaurant.name}
      </div>
      <div style={{ fontSize: compact ? 10 : 13, color: MUTED, marginTop: compact ? -2 : -4 }}>
        {restaurant.category || 'قائمة الطعام'}
      </div>
      {(restaurant.address || restaurant.website) ? (
        <div style={{ fontSize: 8.5, letterSpacing: '0.14em', color: '#8a8178', direction: 'ltr', marginTop: 6 }}>
          {restaurant.address || restaurant.website}
        </div>
      ) : null}
      {!compact ? <Ornament /> : null}
    </header>
  )
}

function Price({ item, currency }: { item: MenuItem; currency?: string }) {
  return (
    <span style={{ color: ACCENT, fontWeight: 800, whiteSpace: 'nowrap', fontSize: 11.5 }}>
      {formatPrice(item.price, currency)}
    </span>
  )
}

function MenuRow({ item, currency, compact = false }: { item: MenuItem; currency?: string; compact?: boolean }) {
  const thumb = compact ? 40 : 50
  return (
    <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: compact ? '6px 0' : '8px 0', borderBottom: `1px solid ${RULE}` }}>
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          style={{
            width: thumb,
            height: thumb,
            flex: 'none',
            objectFit: 'cover',
            borderRadius: 8,
            border: `1px solid ${RULE}`,
            background: '#fff',
          }}
        />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: compact ? 12.5 : 14.5, lineHeight: 1.35, fontWeight: 800 }}>{item.name}</h3>
          <span style={{ flex: 1, borderBottom: `1.5px dotted ${RULE}`, transform: 'translateY(-3px)', minWidth: 18 }} />
          <Price item={item} currency={currency} />
        </div>
        {item.description ? (
          <p style={{
            margin: '2px 0 0',
            color: MUTED,
            fontSize: compact ? 9.5 : 10.8,
            lineHeight: 1.55,
            ...clampStyle(compact ? 1 : 2),
          }}>
            {item.description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function CategoryBlock({
  category,
  currency,
  compact = false,
}: {
  category: PageCategory
  currency?: string
  compact?: boolean
}) {
  return (
    <section style={{ breakInside: 'avoid', marginBottom: compact ? 16 : 20 }}>
      <div style={{ textAlign: 'center', marginBottom: compact ? 3 : 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <h2 style={{
            margin: 0,
            fontFamily: "'Amiri', 'Times New Roman', serif",
            fontSize: compact ? 20 : 24,
            lineHeight: 1.2,
            fontWeight: 700,
          }}>
            {category.name}
          </h2>
          {category.continued ? (
            <span style={{ border: `1px solid ${ACCENT}`, color: ACCENT, borderRadius: 999, padding: '1px 7px', fontSize: 8, fontWeight: 700 }}>
              تتمة
            </span>
          ) : null}
        </div>
        <Ornament />
      </div>
      {category.items.map((item) => (
        <MenuRow key={item.id} item={item} currency={currency} compact={compact} />
      ))}
    </section>
  )
}

function Footer({ pageNumber, totalPages, restaurant }: { pageNumber: number; totalPages: number; restaurant: Restaurant }) {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: `1px solid ${RULE}`,
      paddingTop: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: MUTED,
      fontSize: 9,
      flex: 'none',
    }}>
      <span style={{ direction: 'ltr', letterSpacing: '0.06em' }}>{restaurant.website || 'menu-p.com'}</span>
      <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
    </footer>
  )
}

export default function MenaHospitalityPDFTemplate({
  restaurant,
  categories,
  language = 'ar',
}: MenaHospitalityPDFTemplateProps) {
  const cleanCategories = getAvailableCategories(categories)
  const hero = getHeroItem(cleanCategories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 28, firstPageItems: 14, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap');
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: ${PAPER}; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          background: PAPER,
          color: INK,
          padding: '48px 58px 32px',
          fontFamily: "'Cairo', 'Tahoma', sans-serif",
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Header restaurant={restaurant} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: MUTED, fontSize: 18 }}>
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
            background: PAPER,
            color: INK,
            padding: isFirst ? '42px 56px 28px' : '40px 56px 28px',
            fontFamily: "'Cairo', 'Tahoma', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <Header restaurant={restaurant} compact={!isFirst} />

            {isFirst && hero?.image_url ? (
              <figure style={{ margin: '18px 0 0', flex: 'none' }}>
                <div style={{ border: `1px solid ${ACCENT}`, borderRadius: '180px 180px 6px 6px', padding: 7 }}>
                  <div style={{ height: 252, overflow: 'hidden', borderRadius: '174px 174px 3px 3px', background: '#fff' }}>
                    <img src={hero.image_url} alt={hero.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                </div>
                <figcaption style={{ display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'baseline', marginTop: 8, fontSize: 12 }}>
                  <span style={{ fontWeight: 800 }}>{hero.name}</span>
                  <span style={{ width: 4, height: 4, background: ACCENT, transform: 'rotate(45deg)' }} />
                  <Price item={hero} currency={restaurant.currency || undefined} />
                </figcaption>
              </figure>
            ) : null}

            {(() => {
              const { left, right } = splitColumns(page.categories)
              return (
                <main style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: isFirst ? 46 : 42,
                  alignItems: 'start',
                  marginTop: isFirst ? 18 : 24,
                  minHeight: 0,
                }}>
                  <div>
                    {left.map((category) => (
                      <CategoryBlock key={`${category.id}-${category.items[0]?.id || 'empty'}-a`} category={category} currency={restaurant.currency || undefined} compact={!isFirst} />
                    ))}
                  </div>
                  <div>
                    {right.map((category) => (
                      <CategoryBlock key={`${category.id}-${category.items[0]?.id || 'empty'}-b`} category={category} currency={restaurant.currency || undefined} compact={!isFirst} />
                    ))}
                  </div>
                </main>
              )
            })()}

            <Footer pageNumber={index + 1} totalPages={totalPages} restaurant={restaurant} />
          </div>
        )
      })}
    </>
  )
}
