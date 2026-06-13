import React from "react"
import { TEMPLATE_DESIGN_TOKENS } from "@/lib/template-design-tokens"
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
  description?: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name?: string
  address?: string | null
  currency?: string
  website?: string | null
}

interface BorcelleCoffeePDFTemplateProps {
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

function getHeroItem(categories: MenuCategory[]) {
  return categories
    .flatMap((category) => category.menu_items)
    .find((item) => item.image_url)
}

function Header({ restaurant, language, compact = false, heroImageUrl }: { restaurant: Restaurant; language: string; compact?: boolean; heroImageUrl?: string | null }) {
  const C = TEMPLATE_DESIGN_TOKENS.borcelle.colors
  const F = TEMPLATE_DESIGN_TOKENS.borcelle.fonts
  const isRTL = language === "ar"

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: compact ? 24 : 48,
        flex: 'none'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: compact ? 12 : 24 }}>
          <div
            style={{
              width: compact ? 32 : 48,
              height: compact ? 32 : 48,
              borderRadius: "50%",
              border: `2px solid ${C.primary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: isRTL ? 16 : 0,
              marginRight: isRTL ? 0 : 16,
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: compact ? 14 : 18, color: C.primary }}>
              {(restaurant.name || "B")[0]}
            </span>
          </div>
          <h1
            style={{
              fontWeight: "bold",
              color: C.primary,
              fontSize: compact ? 24 : F.sizes.title,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {restaurant.name || "BORCELLE"}
          </h1>
        </div>

        {!compact && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 80, height: 2, backgroundColor: C.secondary, margin: isRTL ? "0 0 16px auto" : "0 auto 16px 0" }} />
            <h2
              style={{
                fontSize: 18,
                color: C.secondary,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: "normal",
                margin: 0,
              }}
            >
              Premium Coffee & Pastries
            </h2>
          </div>
        )}
      </div>

      {!compact && heroImageUrl && (
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            overflow: "hidden",
            border: `4px solid ${C.accent}`,
            marginLeft: isRTL ? 0 : 32,
            marginRight: isRTL ? 32 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            flex: 'none'
          }}
        >
          <img
            src={heroImageUrl}
            alt="Hero"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  )
}

function MenuRow({ item, currency }: { item: MenuItem; currency?: string }) {
  const C = TEMPLATE_DESIGN_TOKENS.borcelle.colors
  const F = TEMPLATE_DESIGN_TOKENS.borcelle.fonts

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: '12px', alignItems: 'flex-start' }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: 40,
              height: 40,
              flex: 'none',
              objectFit: 'cover',
              borderRadius: '8px',
              border: `1px solid ${C.primary}33`,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <h4
              style={{
                fontSize: F.sizes.item,
                fontWeight: 600,
                color: C.primary,
                margin: 0,
                flex: 1,
              }}
            >
              {item.name}
            </h4>
            <div style={{
              fontSize: F.sizes.price,
              fontWeight: 700,
              color: C.primary,
              marginLeft: 16,
              whiteSpace: "nowrap",
            }}>{formatPrice(item.price, currency)}</div>
          </div>
          {item.description ? (
            <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.4, margin: 0, ...clampStyle(1) }}>
              {item.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function CategoryBlock({
  category,
  currency,
  index
}: {
  category: PageCategory
  currency?: string
  index: number
}) {
  const C = TEMPLATE_DESIGN_TOKENS.borcelle.colors
  const F = TEMPLATE_DESIGN_TOKENS.borcelle.fonts
  
  const icon = (i: number) => {
    const iconCss: React.CSSProperties = { width: 24, height: 24, fill: C.secondary, marginRight: 8 }
    switch (i % 3) {
      case 0:
        return (
          <svg viewBox="0 0 24 24" style={iconCss}>
            <path d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V10H4V8H16V3H20Z" />
          </svg>
        )
      case 1:
        return (
          <svg viewBox="0 0 24 24" style={iconCss}>
            <path d="M17,19H7V17H17V19M16,14H8V12L10.5,9.5L9.08,8.08L12,5.16L14.92,8.08L13.5,9.5L16,12V14M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z" />
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" style={iconCss}>
            <path d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z" />
          </svg>
        )
    }
  }

  return (
    <div style={{ marginBottom: 32, breakInside: 'avoid' }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        {icon(index)}
        <h3
          style={{
            fontSize: F.sizes.category,
            fontWeight: 600,
            color: C.primary,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          {category.name}
        </h3>
        {category.continued && (
          <span style={{ border: `1px solid ${C.primary}`, color: C.primary, borderRadius: 999, padding: '1px 6px', fontSize: 8, fontWeight: 700, marginLeft: 8 }}>
            تتمة
          </span>
        )}
        <div style={{ flex: 1, marginLeft: 16, borderBottom: `1px solid ${C.secondary}` }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {category.items.map((item) => (
          <MenuRow key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </div>
  )
}

function Footer({ pageNumber, totalPages, restaurant, language }: { pageNumber: number; totalPages: number; restaurant: Restaurant; language: string }) {
  const C = TEMPLATE_DESIGN_TOKENS.borcelle.colors
  return (
    <div style={{ marginTop: 'auto', textAlign: "center", padding: "16px 0", borderTop: `1px solid ${C.secondary}`, flex: 'none', zIndex: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: C.secondary }}>
        <span style={{ direction: 'ltr' }}>{restaurant.website || 'menu-p.com'}</span>
        <span>{`صفحة ${toArabicDigits(pageNumber)} من ${toArabicDigits(totalPages)}`}</span>
      </div>
    </div>
  )
}

export default function BorcelleCoffeePDFTemplate({
  restaurant,
  categories,
  language = "ar",
  customizations,
  pdfMode = false
}: BorcelleCoffeePDFTemplateProps) {
  const C = TEMPLATE_DESIGN_TOKENS.borcelle.colors
  const F = TEMPLATE_DESIGN_TOKENS.borcelle.fonts
  const cleanCategories = getAvailableCategories(categories)
  const hero = getHeroItem(cleanCategories)
  const pages = paginateCategories(cleanCategories, { itemsPerPage: 16, firstPageItems: 8, headingCost: 2 })
  const totalPages = Math.max(pages.length, 1)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: ${C.background}; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      ` }} />

      {pages.length === 0 ? (
        <div className="pdf-page" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          background: C.background,
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: F.family,
          overflow: 'hidden',
        }}>
          <Header restaurant={restaurant} language={language} />
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: C.secondary, fontSize: '24px' }}>
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
            background: C.background,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: F.family,
            overflow: 'hidden',
            pageBreakAfter: index === pages.length - 1 ? 'auto' : 'always',
            breakAfter: index === pages.length - 1 ? 'auto' : 'page',
          }}>
            <Header restaurant={restaurant} language={language} compact={!isFirst} heroImageUrl={isFirst ? (hero?.image_url || null) : null} />

            <div style={{ flex: 1, minHeight: 0 }}>
              {(() => {
                const { left, right } = splitColumns(page.categories)
                return (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '32px',
                    alignItems: 'start',
                    minHeight: 0
                  }}>
                    <div>
                      {left.map((category, catIdx) => (
                        <CategoryBlock key={`${category.id}-a`} category={category} currency={restaurant.currency} index={catIdx} />
                      ))}
                    </div>
                    <div>
                      {right.map((category, catIdx) => (
                        <CategoryBlock key={`${category.id}-b`} category={category} currency={restaurant.currency} index={catIdx + left.length} />
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
