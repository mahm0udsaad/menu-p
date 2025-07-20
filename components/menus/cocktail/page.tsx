import type { MenuCategory } from "@/types/menu"

// Sample data matching the cocktail editor
const categories: MenuCategory[] = [
  {
    id: "cocktails",
    name: "Cocktails",
    description: "",
    items: [
      {
        id: "old-fashioned",
        name: "Old Fashioned",
        description: "Whiskey, bitters, sugar.",
        price: 16,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "daiquiri",
        name: "Daiquiri",
        description: "Rum, citrus juice and sugar.",
        price: 14,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "gimlet",
        name: "Gimlet",
        description: "combining gin and lime.",
        price: 16,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "manhattan",
        name: "Manhattan",
        description: "whiskey, sweet vermouth.",
        price: 15,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "espresso-martini",
        name: "Espresso Martini",
        description: "vodka and Coffee.",
        price: 16,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "mimosa",
        name: "Mimosa",
        description: "champagne and chilled orange juice.",
        price: 17,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

// SVG Illustrations for cocktail theme
const CocktailGlassIllustration = () => (
  <svg width="80" height="120" viewBox="0 0 80 120" className="text-white">
    <g fill="none" stroke="currentColor" strokeWidth="2">
      {/* Martini glass */}
      <path d="M20 30 L60 30 L40 60 L40 90" />
      <ellipse cx="40" cy="95" rx="15" ry="3" />

      {/* Liquid */}
      <path d="M25 35 L55 35 L40 55 Z" fill="currentColor" fillOpacity="0.2" />

      {/* Garnish */}
      <circle cx="35" cy="40" r="2" fill="currentColor" />
      <circle cx="45" cy="42" r="1.5" fill="currentColor" />

      {/* Bubbles */}
      <circle cx="38" cy="45" r="1" fill="currentColor" fillOpacity="0.3" />
      <circle cx="42" cy="48" r="0.8" fill="currentColor" fillOpacity="0.3" />
      <circle cx="40" cy="52" r="0.6" fill="currentColor" fillOpacity="0.3" />
    </g>
  </svg>
)

const CitrusSliceIllustration = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" className="text-white">
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Orange slice */}
      <circle cx="40" cy="40" r="25" fill="currentColor" fillOpacity="0.1" />
      <circle cx="40" cy="40" r="25" />

      {/* Segments */}
      <line x1="40" y1="15" x2="40" y2="65" />
      <line x1="15" y1="40" x2="65" y2="40" />
      <line x1="22" y1="22" x2="58" y2="58" />
      <line x1="58" y1="22" x2="22" y2="58" />

      {/* Center */}
      <circle cx="40" cy="40" r="3" fill="currentColor" fillOpacity="0.3" />

      {/* Texture details */}
      <g strokeWidth="0.8" opacity="0.6">
        <path d="M30 25 Q35 30 40 25" />
        <path d="M50 25 Q45 30 40 25" />
        <path d="M55 35 Q50 40 55 45" />
        <path d="M25 35 Q30 40 25 45" />
      </g>
    </g>
  </svg>
)

const CocktailShakerIllustration = () => (
  <svg width="60" height="120" viewBox="0 0 60 120" className="text-white">
    <g fill="none" stroke="currentColor" strokeWidth="2">
      {/* Shaker body */}
      <rect x="15" y="30" width="30" height="60" rx="5" fill="currentColor" fillOpacity="0.1" />
      <rect x="15" y="30" width="30" height="60" rx="5" />

      {/* Shaker top */}
      <rect x="18" y="20" width="24" height="15" rx="3" fill="currentColor" fillOpacity="0.1" />
      <rect x="18" y="20" width="24" height="15" rx="3" />

      {/* Cap */}
      <rect x="20" y="15" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.2" />
      <rect x="20" y="15" width="20" height="8" rx="2" />

      {/* Details */}
      <line x1="15" y1="45" x2="45" y2="45" strokeWidth="1" />
      <line x1="15" y1="60" x2="45" y2="60" strokeWidth="1" />
      <line x1="15" y1="75" x2="45" y2="75" strokeWidth="1" />

      {/* Handle */}
      <path d="M45 50 Q55 50 55 60 Q55 70 45 70" strokeWidth="1.5" />
    </g>
  </svg>
)

export default function CocktailMenuPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Black Sidebar with Illustrations */}
      <div className="w-80 bg-black flex flex-col items-center justify-center space-y-12 p-8">
        <CocktailGlassIllustration />
        <CitrusSliceIllustration />
        <CocktailShakerIllustration />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-7xl font-black text-gray-900 tracking-tight mb-4">COCKTAIL</h1>
        </div>

        {/* Menu Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} className="relative">
              {/* Category Header */}
              <h2 className="text-4xl font-bold text-gray-900 tracking-wide mb-8">{category.name.toUpperCase()}</h2>

              {/* Menu Items */}
              <div className="space-y-6">
                {category.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-wide">{item.name.toUpperCase()}</h3>
                      {item.description && <p className="text-gray-700 text-lg leading-relaxed">{item.description}</p>}
                    </div>
                    <div className="ml-8 flex-shrink-0">
                      <span className="text-3xl font-bold text-gray-900">
                        {item.currency} {item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20">
          <p className="text-2xl text-gray-800 font-light">You'd rather drink than worry!</p>
        </div>
      </div>
    </div>
  )
}
