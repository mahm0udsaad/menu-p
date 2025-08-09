import React from "react"
import { TEMPLATE_DESIGN_TOKENS } from "@/lib/template-design-tokens"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
}

interface MenuCategory {
  id: string
  name: string
  description?: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  name?: string
  address?: string | null
  currency?: string
}

interface BorcelleCoffeePDFTemplateProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  language?: "ar" | "en"
  heroImageUrl?: string | null
}

export default function BorcelleCoffeePDFTemplate({
  restaurant,
  categories,
  language = "ar",
  heroImageUrl = "/coffee-menu-2.png",
}: BorcelleCoffeePDFTemplateProps) {
  const C = TEMPLATE_DESIGN_TOKENS.borcelle.colors
  const F = TEMPLATE_DESIGN_TOKENS.borcelle.fonts
  const S = TEMPLATE_DESIGN_TOKENS.borcelle.spacing
  const currency = restaurant.currency || "$"
  const isRTL = language === "ar"

  const page: React.CSSProperties = {
    background: C.background,
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: F.family,
    fontSize: "16px",
    color: C.text,
    minHeight: "100vh",
    padding: "32px",
    direction: isRTL ? "rtl" : "ltr",
  }

  const divider: React.CSSProperties = { 
    borderBottom: `1px solid ${C.secondary}` 
  }
  
  const card: React.CSSProperties = {
    background: "transparent",
    padding: 0,
  }
  
  const price: React.CSSProperties = {
    fontSize: F.sizes.price,
    fontWeight: 700,
    color: C.primary,
    marginLeft: 16,
    whiteSpace: "nowrap",
  }
  
  const iconCss: React.CSSProperties = { 
    width: 32, 
    height: 32, 
    fill: C.secondary 
  }

  const icon = (i: number) => {
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
    <div style={page}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        {/* Header - matching preview layout exactly */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 48,
          }}
        >
          {/* Left side - Logo and Title block */}
          <div style={{ flex: 1 }}>
            {/* Logo row - matching preview exactly */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: `2px solid ${C.primary}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: 18, color: C.primary }}>B</span>
              </div>
              <h1
                style={{
                  fontWeight: "bold",
                  color: C.primary,
                  fontSize: F.sizes.title,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {restaurant.name || "BORCELLE"}
              </h1>
            </div>

            {/* Title section - matching preview */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ width: 80, height: 2, backgroundColor: C.secondary, margin: "0 auto 16px" }} />
              <h2
                style={{
                  fontSize: 20,
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
          </div>

          {/* Right side - Hero Image (circular) */}
          <div
            style={{
              width: 256,
              height: 256,
              borderRadius: "50%",
              overflow: "hidden",
              border: `4px solid ${C.accent}`,
              marginLeft: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
            }}
          >
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt="Coffee and pastries"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ color: C.secondary, fontSize: 14, textAlign: "center", padding: 8 }}>
                Coffee & Pastries Image
              </div>
            )}
          </div>
        </div>

        {/* Menu Sections - matching preview spacing */}
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {categories.map((category, index) => (
            <div key={category.id}>
              {/* Category Header with Icon - matching preview */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, marginRight: 16 }}>{icon(index)}</div>
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
                <div style={{ flex: 1, marginLeft: 16, ...divider }} />
              </div>

              {/* Items grid - matching preview exactly */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {category.menu_items.map((item) => (
                  <div key={item.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
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
                      <div style={price}>{currency}{(item.price ?? 0).toFixed(2)}</div>
                    </div>
                    {item.description ? (
                      <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.5, margin: 0 }}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, textAlign: "center", padding: 20, borderTop: `1px solid ${C.secondary}` }}>
          <p style={{ color: C.secondary, fontWeight: 500, fontSize: 16, margin: "0 0 8px 0" }}>
            Crafted with passion, served with excellence
          </p>
          <p style={{ color: C.primary, fontWeight: 400, fontSize: 14, margin: 0 }}>
            {restaurant.address || "Experience the art of coffee"}
          </p>
        </div>
      </div>
    </div>
  )
}