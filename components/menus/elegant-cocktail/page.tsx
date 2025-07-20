import type { MenuCategory } from "@/types/menu"

// Sample data for elegant cocktail menu
const categories: MenuCategory[] = [
  {
    id: "cocktails",
    name: "COCKTAILS",
    description: "",
    items: [
      {
        id: "mojito",
        name: "CLASSIC MOJITO",
        description: "Rum infused with fresh lime, mint and sugar.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "martini",
        name: "ROYAL MARTINI",
        description: "Freshly brewed espresso mixed with rum and lime.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "raspberry-mojito",
        name: "RASPBERRY MOJITO",
        description: "Rum stirred with raspberry, fresh mint, lime and sugar.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "daiquiri",
        name: "DAIQUIRI",
        description: "Rum, lemon juice and sugar mixed with apple.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "margarita",
        name: "RETRO MARGARITA",
        description: "Tequila, lime juice, rum with pinch of salt.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "fruit-mojito",
        name: "DRY FRUIT MOJITO",
        description: "Vodka mixed with sugar and dry fruits",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "whiskey",
    name: "WHISKEY",
    description: "",
    items: [
      {
        id: "manhattan",
        name: "MANHATTAN",
        description: "White rum mixed with whiskey and sugar.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "whiskey-sour",
        name: "WHISKEY SOUR",
        description: "Fresh lemon juice infused premium whiskey and lime.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "bourbon-flip",
        name: "BOURBON FLIP",
        description: "Premium whiskey, lime mixed with sugar syrup.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "old-fashioned",
        name: "OLD FASHIONED",
        description: "Brown sugar, lime and sugar mixed with whiskey.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "paper-plane",
        name: "PAPER PLANE",
        description: "Premium whiskey mixed with lime and sugar.",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "gin-fizz",
        name: "GIN FIZZ",
        description: "Premium gin mixed with sugar syrup",
        price: 5.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

// Elegant SVG illustrations matching the reference image
const GinBottleIllustration = () => (
  <svg viewBox="0 0 120 200" className="w-16 h-24">
    {/* Bottle body */}
    <rect x="35" y="60" width="50" height="120" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Bottle neck */}
    <rect x="45" y="30" width="30" height="30" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Cap */}
    <rect x="42" y="20" width="36" height="15" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Label */}
    <rect x="40" y="80" width="40" height="60" fill="none" stroke="#2D1810" strokeWidth="1" />
    <text x="60" y="110" textAnchor="middle" fontSize="8" fill="#2D1810" fontFamily="serif">
      Gin
    </text>
    {/* Crosshatch shading */}
    <g stroke="#2D1810" strokeWidth="0.5" opacity="0.3">
      <line x1="35" y1="70" x2="85" y2="120" />
      <line x1="35" y1="80" x2="85" y2="130" />
      <line x1="35" y1="90" x2="85" y2="140" />
      <line x1="35" y1="100" x2="85" y2="150" />
      <line x1="35" y1="110" x2="85" y2="160" />
      <line x1="35" y1="120" x2="85" y2="170" />
    </g>
    {/* Glass */}
    <rect x="5" y="140" width="25" height="35" fill="none" stroke="#2D1810" strokeWidth="2" />
    <line x1="5" y1="160" x2="30" y2="160" stroke="#2D1810" strokeWidth="1" />
  </svg>
)

const WineBottleIllustration = () => (
  <svg viewBox="0 0 120 200" className="w-16 h-24">
    {/* Wine bottle */}
    <path
      d="M45 180 L45 80 Q45 70 50 65 L50 30 L70 30 L70 65 Q75 70 75 80 L75 180 Z"
      fill="none"
      stroke="#2D1810"
      strokeWidth="2"
    />
    {/* Cork */}
    <rect x="48" y="20" width="24" height="15" fill="none" stroke="#2D1810" strokeWidth="2" />
    {/* Wine glass */}
    <path
      d="M85 140 Q85 130 95 130 Q105 130 105 140 L105 160 Q105 170 95 170 Q85 170 85 160 Z"
      fill="none"
      stroke="#2D1810"
      strokeWidth="2"
    />
    <line x1="95" y1="170" x2="95" y2="180" stroke="#2D1810" strokeWidth="2" />
    <line x1="85" y1="180" x2="105" y2="180" stroke="#2D1810" strokeWidth="2" />
    {/* Grapes */}
    <g fill="none" stroke="#2D1810" strokeWidth="1">
      <circle cx="110" cy="100" r="4" />
      <circle cx="118" cy="105" r="4" />
      <circle cx="102" cy="108" r="4" />
      <circle cx="110" cy="115" r="4" />
      <circle cx="118" cy="120" r="4" />
    </g>
    {/* Crosshatch on bottle */}
    <g stroke="#2D1810" strokeWidth="0.5" opacity="0.3">
      <line x1="45" y1="90" x2="75" y2="120" />
      <line x1="45" y1="100" x2="75" y2="130" />
      <line x1="45" y1="110" x2="75" y2="140" />
      <line x1="45" y1="120" x2="75" y2="150" />
      <line x1="45" y1="130" x2="75" y2="160" />
    </g>
  </svg>
)

const ArtDecoDecoration = () => (
  <svg viewBox="0 0 300 40" className="w-full h-8">
    <g fill="#2D1810" stroke="#2D1810">
      {/* Central diamond */}
      <polygon points="150,10 160,20 150,30 140,20" fill="#2D1810" />
      <polygon points="148,12 152,16 148,20 144,16" fill="#F5E6D3" />
      {/* Side elements */}
      <circle cx="120" cy="20" r="3" fill="none" strokeWidth="1" />
      <circle cx="180" cy="20" r="3" fill="none" strokeWidth="1" />
      <circle cx="100" cy="20" r="2" fill="#2D1810" />
      <circle cx="200" cy="20" r="2" fill="#2D1810" />
      {/* Decorative lines */}
      <line x1="50" y1="15" x2="85" y2="15" strokeWidth="2" />
      <line x1="115" y1="15" x2="150" y2="15" strokeWidth="2" />
      {/* Small diamonds */}
      <polygon points="70,13 72,15 70,17 68,15" fill="#2D1810" />
      <polygon points="130,13 132,15 130,17 128,15" fill="#2D1810" />
    </g>
  </svg>
)

export default function ElegantCocktailMenuPage() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23654321'/%3E%3Cpath d='M0 0L100 100M100 0L0 100' stroke='%238B4513' strokeWidth='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23wood)'/%3E%3C/svg%3E")`,
        backgroundColor: "#3D2914",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-orange-900/30"></div>

      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Menu paper overlay */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-2xl border-8 border-amber-900/20 p-12">
            {/* Header with illustrations */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex-shrink-0">
                <GinBottleIllustration />
              </div>

              <div className="flex-1 text-center px-8">
                <div className="mb-6">
                  <ArtDecoDecoration />
                </div>
                <h1 className="text-6xl font-bold text-amber-900 tracking-wider mb-4">MENU</h1>
                <div className="mb-6">
                  <ArtDecoDecoration />
                </div>
              </div>

              <div className="flex-shrink-0">
                <WineBottleIllustration />
              </div>
            </div>

            {/* Menu content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {categories.slice(0, 2).map((category) => (
                <div key={category.id} className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-amber-900 uppercase tracking-[0.2em] mb-4">
                      {category.name}
                    </h2>
                    <div className="mt-4">
                      <ArtDecoDecoration />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <div key={item.id} className="mb-8">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-amber-900 uppercase tracking-wide mb-2">
                              {item.name}
                            </h3>
                            <p className="text-sm text-amber-800 leading-relaxed max-w-md">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-8">
                            <span className="text-xl font-bold text-amber-900">${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom decoration */}
            <div className="mt-16 pt-8">
              <div className="flex justify-center">
                <svg viewBox="0 0 200 40" className="w-64 h-8">
                  <g fill="#2D1810" stroke="#2D1810">
                    <polygon points="100,5 110,15 100,25 90,15" fill="#2D1810" />
                    <polygon points="98,7 102,11 98,15 94,11" fill="#F5E6D3" />
                    <line x1="50" y1="15" x2="85" y2="15" strokeWidth="2" />
                    <line x1="115" y1="15" x2="150" y2="15" strokeWidth="2" />
                    <polygon points="70,13 72,15 70,17 68,15" fill="#2D1810" />
                    <polygon points="130,13 132,15 130,17 128,15" fill="#2D1810" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
