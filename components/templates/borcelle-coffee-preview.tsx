"use client"

import { memo } from "react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import { TEMPLATE_DESIGN_TOKENS } from "@/lib/template-design-tokens"

const BorcelleCoffeePreview = memo(() => {
  const { categories } = useMenuEditor()

  const C = TEMPLATE_DESIGN_TOKENS.borcelle.colors
  const F = TEMPLATE_DESIGN_TOKENS.borcelle.fonts
  const S = TEMPLATE_DESIGN_TOKENS.borcelle.spacing

  const backgroundStyle: React.CSSProperties = {
    background: C.background,
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: F.family,
    fontSize: "16px",
    color: C.text,
  }

  const dividerStyle: React.CSSProperties = {
    borderBottom: `1px solid ${C.secondary}`,
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    padding: 20,
    border: `1px solid ${C.accent}`,
    background: "transparent", // keep it universal; no hardcoded light bg
  }

  const priceStyle: React.CSSProperties = {
    fontSize: F.sizes.price,
    fontWeight: 700,
    color: C.primary,
    marginLeft: 16,
  }

  const iconStyle = (fill?: string): React.CSSProperties => ({
    width: 32,
    height: 32,
    fill: fill ?? C.secondary,
    color: fill ?? C.secondary,
    display: "block",
  })

  return (
    <div className="min-h-screen p-8" style={backgroundStyle}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div className="flex-1">
            {/* Logo */}
            <div className="flex items-center mb-6">
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center mr-4"
                style={{ borderColor: C.primary }}
              >
                <span className="font-bold text-lg" style={{ color: C.primary }}>
                  B
                </span>
              </div>
              <h1
                className="font-bold tracking-wider"
                style={{
                  color: C.primary,
                  fontSize: F.sizes.title,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                BORCELLE
              </h1>
            </div>

            {/* Title */}
            <div className="mb-8">
              <div style={{ width: 80, height: 2, backgroundColor: C.secondary, margin: "0 auto 16px" }} />
              <h2
                className="font-normal"
                style={{
                  fontSize: 20,
                  color: C.secondary,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Premium Coffee & Pastries
              </h2>
            </div>
          </div>

          {/* Hero Image */}
          <div
            className="w-64 h-64 rounded-full overflow-hidden ml-8 flex items-center justify-center"
            style={{ border: `4px solid ${C.accent}` }}
          >
            <img src="/coffee-menu-2.png" alt="Coffee and pastries" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-12">
          {categories.map((category, index) => (
            <div key={category.id} className="relative">
              {/* Category Header with Icon */}
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 mr-4">
                  {/* simple index-based icon set, colored by secondary */}
                  {index % 3 === 0 && (
                    <svg viewBox="0 0 24 24" style={iconStyle()}>
                      <path d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V10H4V8H16V3H20Z" />
                    </svg>
                  )}
                  {index % 3 === 1 && (
                    <svg viewBox="0 0 24 24" style={iconStyle()}>
                      <path d="M17,19H7V17H17V19M16,14H8V12L10.5,9.5L9.08,8.08L12,5.16L14.92,8.08L13.5,9.5L16,12V14M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z" />
                    </svg>
                  )}
                  {index % 3 === 2 && (
                    <svg viewBox="0 0 24 24" style={iconStyle()}>
                      <path d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z" />
                    </svg>
                  )}
                </div>
                <h3
                  className="font-semibold tracking-wide"
                  style={{
                    fontSize: F.sizes.category,
                    color: C.primary,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {category.name}
                </h3>
                <div className="flex-1 ml-4" style={dividerStyle} />
              </div>

              {/* Menu Items */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.item }}>
                {category.menu_items.map((item) => (
                  <div key={item.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <h4
                        className="font-semibold"
                        style={{ fontSize: F.sizes.item, color: C.primary, margin: 0, flex: 1 }}
                      >
                        {item.name}
                      </h4>
                      <div className="font-bold" style={priceStyle}>
                        ${item.price?.toFixed(2) || "0.00"}
                      </div>
                    </div>

                    {item.description && (
                      <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.5, margin: 0 }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

BorcelleCoffeePreview.displayName = "BorcelleCoffeePreview"
export { BorcelleCoffeePreview }
