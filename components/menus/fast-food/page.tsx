import type { MenuCategory } from "@/types/menu"

// Sample data for fast food menu
const categories: MenuCategory[] = [
  {
    id: "pizza",
    name: "PIZZA MENU",
    description: "",
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `pizza-${i + 1}`,
      name: `Pizza Menu ${String(i + 1).padStart(2, "0")}`,
      description: "",
      price: [15, 20, 35, 40, 55, 60, 75, 80][i],
      currency: "$",
      isAvailable: true,
      isFeatured: false,
      dietaryInfo: [],
    })),
  },
  {
    id: "burger",
    name: "BURGER MENU",
    description: "",
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `burger-${i + 1}`,
      name: `Burger Menu ${String(i + 1).padStart(2, "0")}`,
      description: "",
      price: [15, 20, 35, 40, 55, 60, 75, 80][i],
      currency: "$",
      isAvailable: true,
      isFeatured: false,
      dietaryInfo: [],
    })),
  },
  {
    id: "snack",
    name: "SNACK MENU",
    description: "",
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `snack-${i + 1}`,
      name: `Snack Menu ${String(i + 1).padStart(2, "0")}`,
      description: "",
      price: [15, 20, 35, 40, 55, 60, 75, 80][i],
      currency: "$",
      isAvailable: true,
      isFeatured: false,
      dietaryInfo: [],
    })),
  },
  {
    id: "drink",
    name: "DRINK MENU",
    description: "",
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `drink-${i + 1}`,
      name: `Drink Menu ${String(i + 1).padStart(2, "0")}`,
      description: "",
      price: [15, 20, 35, 40, 55, 60, 75, 80][i],
      currency: "$",
      isAvailable: true,
      isFeatured: false,
      dietaryInfo: [],
    })),
  },
]

// Hand-drawn SVG illustrations matching the reference image
const PizzaIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32">
    {/* Pizza base */}
    <circle cx="100" cy="100" r="80" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Crust texture */}
    <circle cx="100" cy="100" r="75" fill="none" stroke="#C41E3A" strokeWidth="1" strokeDasharray="3,2" />
    {/* Pepperoni */}
    <circle cx="80" cy="80" r="8" fill="#C41E3A" />
    <circle cx="120" cy="70" r="8" fill="#C41E3A" />
    <circle cx="90" cy="110" r="8" fill="#C41E3A" />
    <circle cx="130" cy="120" r="8" fill="#C41E3A" />
    <circle cx="70" cy="130" r="8" fill="#C41E3A" />
    {/* Cheese texture - dots */}
    <circle cx="85" cy="95" r="2" fill="#C41E3A" />
    <circle cx="115" cy="85" r="2" fill="#C41E3A" />
    <circle cx="105" cy="105" r="2" fill="#C41E3A" />
    <circle cx="95" cy="125" r="2" fill="#C41E3A" />
    <circle cx="125" cy="95" r="2" fill="#C41E3A" />
    {/* Crosshatch pattern */}
    <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
      <line x1="60" y1="60" x2="140" y2="140" />
      <line x1="70" y1="60" x2="150" y2="140" />
      <line x1="50" y1="70" x2="130" y2="150" />
      <line x1="140" y1="60" x2="60" y2="140" />
      <line x1="130" y1="60" x2="50" y2="140" />
      <line x1="150" y1="70" x2="70" y2="150" />
    </g>
  </svg>
)

const BurgerIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32">
    {/* Top bun */}
    <ellipse cx="100" cy="70" rx="70" ry="25" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Sesame seeds */}
    <ellipse cx="80" cy="65" rx="3" ry="2" fill="#C41E3A" />
    <ellipse cx="100" cy="62" rx="3" ry="2" fill="#C41E3A" />
    <ellipse cx="120" cy="68" rx="3" ry="2" fill="#C41E3A" />
    {/* Lettuce */}
    <path d="M40 95 Q100 85 160 95 Q150 105 100 100 Q50 105 40 95" fill="#90EE90" stroke="#C41E3A" strokeWidth="2" />
    {/* Meat patty */}
    <ellipse cx="100" cy="110" rx="65" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
    {/* Cheese */}
    <path
      d="M45 125 Q100 115 155 125 Q145 135 100 130 Q55 135 45 125"
      fill="#FFD700"
      stroke="#C41E3A"
      strokeWidth="2"
    />
    {/* Bottom bun */}
    <ellipse cx="100" cy="145" rx="70" ry="20" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Crosshatch shading */}
    <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
      <line x1="50" y1="50" x2="150" y2="150" />
      <line x1="60" y1="50" x2="160" y2="150" />
      <line x1="40" y1="60" x2="140" y2="160" />
    </g>
  </svg>
)

const FriesIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-24 h-32">
    {/* Container */}
    <path d="M60 120 L60 180 L140 180 L140 120 L130 100 L70 100 Z" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Fries */}
    <rect x="75" y="80" width="8" height="40" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="90" y="70" width="8" height="50" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="105" y="75" width="8" height="45" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    <rect x="120" y="85" width="8" height="35" fill="#FFD700" stroke="#C41E3A" strokeWidth="2" />
    {/* Container logo */}
    <circle cx="100" cy="150" r="15" fill="none" stroke="#C41E3A" strokeWidth="2" />
    <circle cx="100" cy="150" r="8" fill="#C41E3A" />
  </svg>
)

const HotDogIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-24">
    {/* Bun */}
    <ellipse cx="100" cy="100" rx="80" ry="30" fill="#F5E6D3" stroke="#C41E3A" strokeWidth="3" />
    {/* Sausage */}
    <ellipse cx="100" cy="100" rx="70" ry="15" fill="#8B4513" stroke="#C41E3A" strokeWidth="2" />
    {/* Mustard */}
    <path d="M40 95 Q60 90 80 95 Q100 90 120 95 Q140 90 160 95" stroke="#FFD700" strokeWidth="4" fill="none" />
    {/* Ketchup */}
    <path d="M45 105 Q65 100 85 105 Q105 100 125 105 Q145 100 155 105" stroke="#C41E3A" strokeWidth="3" fill="none" />
    {/* Crosshatch texture */}
    <g stroke="#C41E3A" strokeWidth="1" opacity="0.3">
      <line x1="30" y1="80" x2="170" y2="120" />
      <line x1="30" y1="90" x2="170" y2="130" />
      <line x1="30" y1="110" x2="170" y2="90" />
      <line x1="30" y1="120" x2="170" y2="100" />
    </g>
  </svg>
)

export default function FastFoodMenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with illustrations */}
        <div className="relative bg-gradient-to-r from-red-50 to-amber-50 border-4 border-red-600 rounded-lg p-8 mb-8">
          {/* Top illustrations */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-shrink-0">
              <PizzaIllustration />
            </div>
            <div className="flex-1 text-center">
              <div className="text-sm text-red-600 font-medium tracking-[0.3em] mb-2">B O R C E L L E</div>
              <h1 className="text-8xl font-black text-red-600 tracking-wider">MENU</h1>
            </div>
            <div className="flex-shrink-0">
              <BurgerIllustration />
            </div>
          </div>

          {/* Decorative line */}
          <div className="border-t-4 border-red-600 border-dashed mb-8"></div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.slice(0, 4).map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-red-600 uppercase tracking-wider mb-4">{category.name}</h3>
                </div>

                <div className="space-y-1">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      <span className="font-medium text-amber-900">{item.name}</span>
                      <span className="font-bold text-red-600 text-lg">${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom illustrations */}
          <div className="flex justify-between items-end mt-8 pt-8 border-t-4 border-red-600">
            <div className="flex-shrink-0">
              <FriesIllustration />
            </div>
            <div className="flex-1"></div>
            <div className="flex-shrink-0">
              <HotDogIllustration />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
