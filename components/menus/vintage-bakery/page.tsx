import type { MenuCategory } from "@/types/menu"

// Sample data for vintage bakery
const categories: MenuCategory[] = [
  {
    id: "cakes",
    name: "Artisan Cakes",
    description: "Handcrafted with the finest ingredients",
    items: [
      {
        id: "chocolate-cake",
        name: "Classic Chocolate Cake",
        description: "Rich, moist chocolate cake with dark chocolate ganache",
        price: 24.99,
        currency: "$",
        isAvailable: true,
        isFeatured: true,
        dietaryInfo: [],
      },
      {
        id: "vanilla-cake",
        name: "Vanilla Bean Cake",
        description: "Light vanilla sponge with vanilla buttercream",
        price: 22.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "red-velvet",
        name: "Red Velvet Cake",
        description: "Traditional red velvet with cream cheese frosting",
        price: 26.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "lemon-cake",
        name: "Lemon Drizzle Cake",
        description: "Zesty lemon cake with lemon glaze",
        price: 23.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "pastries",
    name: "Fresh Pastries",
    description: "Baked daily with traditional techniques",
    items: [
      {
        id: "croissant",
        name: "Butter Croissant",
        description: "Flaky, buttery pastry made with French butter",
        price: 3.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "pain-au-chocolat",
        name: "Pain au Chocolat",
        description: "Croissant dough filled with dark chocolate",
        price: 4.25,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "danish",
        name: "Fruit Danish",
        description: "Sweet pastry topped with seasonal fruit",
        price: 4.75,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "eclair",
        name: "Chocolate Éclair",
        description: "Choux pastry filled with cream, topped with chocolate",
        price: 5.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "ice-cream",
    name: "Artisan Ice Cream",
    description: "Made fresh daily with natural ingredients",
    items: [
      {
        id: "vanilla-ice-cream",
        name: "Madagascar Vanilla",
        description: "Premium vanilla bean ice cream",
        price: 6.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "chocolate-ice-cream",
        name: "Belgian Chocolate",
        description: "Rich chocolate ice cream with cocoa nibs",
        price: 7.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "strawberry-ice-cream",
        name: "Fresh Strawberry",
        description: "Made with local strawberries",
        price: 7.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "pistachio-ice-cream",
        name: "Sicilian Pistachio",
        description: "Authentic pistachio ice cream",
        price: 8.99,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export default function VintageBakeryMenuPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Vintage Paper Background */}
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden shadow-2xl">
        {/* Decorative torn paper edges */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent"></div>

        {/* Main Content */}
        <div className="relative z-10 p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-sm tracking-[0.3em] text-amber-800 mb-2 font-light">VINTAGE BAKERY</div>
            <h1 className="text-6xl font-bold text-amber-900 mb-4 tracking-wide">OUR MENU</h1>
            {/* Decorative diamond */}
            <div className="flex justify-center">
              <div className="w-3 h-3 bg-amber-800 rotate-45"></div>
            </div>
          </div>

          {/* Menu Categories */}
          <div className="space-y-16">
            {categories.map((category, categoryIndex) => (
              <div key={category.id} className="relative">
                {/* Category Header */}
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-amber-900 tracking-wider mb-2">
                    {category.name.toUpperCase()}
                  </h2>
                  {category.description && <p className="text-amber-700 italic text-lg">{category.description}</p>}
                </div>

                {/* Category Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Items List */}
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-amber-900 mb-1">{item.name}</h3>
                          {item.description && (
                            <p className="text-amber-700 text-sm leading-relaxed">{item.description}</p>
                          )}
                        </div>
                        <div className="ml-4 text-xl font-bold text-amber-900">
                          {item.currency}
                          {item.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hand-drawn Illustrations */}
                  <div className="flex justify-center items-center">
                    {categoryIndex === 0 && (
                      // Cake illustration
                      <svg width="200" height="150" viewBox="0 0 200 150" className="text-amber-800">
                        {/* Cake slice */}
                        <path d="M50 120 L150 120 L140 80 L60 80 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                        {/* Cake layers */}
                        <line x1="50" y1="120" x2="150" y2="120" stroke="currentColor" strokeWidth="2" />
                        <line x1="55" y1="110" x2="145" y2="110" stroke="currentColor" strokeWidth="1" />
                        <line x1="60" y1="100" x2="140" y2="100" stroke="currentColor" strokeWidth="1" />
                        <line x1="65" y1="90" x2="135" y2="90" stroke="currentColor" strokeWidth="1" />
                        {/* Cross-hatching details */}
                        <g stroke="currentColor" strokeWidth="0.5" opacity="0.6">
                          <line x1="60" y1="85" x2="70" y2="95" />
                          <line x1="70" y1="85" x2="80" y2="95" />
                          <line x1="80" y1="85" x2="90" y2="95" />
                          <line x1="90" y1="85" x2="100" y2="95" />
                          <line x1="100" y1="85" x2="110" y2="95" />
                          <line x1="110" y1="85" x2="120" y2="95" />
                          <line x1="120" y1="85" x2="130" y2="95" />
                        </g>
                        {/* Plate */}
                        <ellipse cx="100" cy="125" rx="60" ry="8" fill="none" stroke="currentColor" strokeWidth="2" />
                        {/* Decorative dots around plate */}
                        <circle cx="70" cy="135" r="1" fill="currentColor" />
                        <circle cx="80" cy="138" r="1" fill="currentColor" />
                        <circle cx="120" cy="138" r="1" fill="currentColor" />
                        <circle cx="130" cy="135" r="1" fill="currentColor" />
                      </svg>
                    )}

                    {categoryIndex === 1 && (
                      // Donuts illustration
                      <svg width="200" height="150" viewBox="0 0 200 150" className="text-amber-800">
                        {/* Plate */}
                        <ellipse cx="100" cy="120" rx="80" ry="15" fill="none" stroke="currentColor" strokeWidth="2" />
                        {/* Donut 1 */}
                        <circle cx="80" cy="90" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="80" cy="90" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                        {/* Donut 2 */}
                        <circle cx="120" cy="85" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="120" cy="85" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                        {/* Cross-hatching on donuts */}
                        <g stroke="currentColor" strokeWidth="0.5" opacity="0.6">
                          <line x1="65" y1="80" x2="75" y2="90" />
                          <line x1="70" y1="75" x2="80" y2="85" />
                          <line x1="85" y1="75" x2="95" y2="85" />
                          <line x1="90" y1="80" x2="100" y2="90" />
                          <line x1="105" y1="75" x2="115" y2="85" />
                          <line x1="110" y1="70" x2="120" y2="80" />
                          <line x1="125" y1="70" x2="135" y2="80" />
                        </g>
                      </svg>
                    )}

                    {categoryIndex === 2 && (
                      // Ice cream illustration
                      <svg width="200" height="150" viewBox="0 0 200 150" className="text-amber-800">
                        {/* Ice cream cone 1 */}
                        <path d="M70 120 L80 60 L90 120 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                        {/* Waffle pattern */}
                        <g stroke="currentColor" strokeWidth="0.5">
                          <line x1="72" y1="110" x2="88" y2="110" />
                          <line x1="74" y1="100" x2="86" y2="100" />
                          <line x1="76" y1="90" x2="84" y2="90" />
                          <line x1="78" y1="80" x2="82" y2="80" />
                          <line x1="75" y1="120" x2="75" y2="70" />
                          <line x1="80" y1="120" x2="80" y2="60" />
                          <line x1="85" y1="120" x2="85" y2="70" />
                        </g>
                        {/* Ice cream scoops */}
                        <circle cx="80" cy="55" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="80" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="2" />

                        {/* Ice cream cone 2 */}
                        <path d="M120 120 L130 65 L140 120 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                        {/* Waffle pattern */}
                        <g stroke="currentColor" strokeWidth="0.5">
                          <line x1="122" y1="110" x2="138" y2="110" />
                          <line x1="124" y1="100" x2="136" y2="100" />
                          <line x1="126" y1="90" x2="134" y2="90" />
                          <line x1="128" y1="80" x2="132" y2="80" />
                          <line x1="125" y1="120" x2="125" y2="75" />
                          <line x1="130" y1="120" x2="130" y2="65" />
                          <line x1="135" y1="120" x2="135" y2="75" />
                        </g>
                        {/* Ice cream scoops */}
                        <circle cx="130" cy="60" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="130" cy="47" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="130" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-amber-300">
            <p className="text-amber-700 italic text-lg">"Handcrafted with love, served with pride"</p>
            <p className="text-amber-600 text-sm mt-2">123 Vintage Street, Old Town, VT 12345</p>
            <p className="text-amber-600 text-sm">(555) 123-CAKE</p>
          </div>
        </div>
      </div>
    </div>
  )
}
