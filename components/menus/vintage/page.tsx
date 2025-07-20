import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vintage Artisan Coffee Menu",
  description: "Hand-drawn coffee illustrations with vintage charm",
}

const menuData = {
  restaurant: {
    name: "The Grind House",
    description: "Est. 1952 • Artisan Coffee & Handcrafted Treats",
  },
  categories: [
    {
      id: "classics",
      name: "Coffee House Classics",
      description: "",
      items: [
        {
          id: "1",
          name: "House Blend",
          description: "Our signature medium roast with notes of chocolate and caramel",
          price: 3.5,
        },
        {
          id: "2",
          name: "French Press",
          description: "Full-bodied coffee steeped to perfection, served in vintage press",
          price: 4.0,
        },
        {
          id: "3",
          name: "Pour Over",
          description: "Single origin beans, hand-poured with precision and care",
          price: 4.5,
        },
        {
          id: "4",
          name: "Turkish Coffee",
          description: "Traditional preparation with cardamom, served with Turkish delight",
          price: 5.0,
        },
        {
          id: "5",
          name: "Espresso",
          description: "Rich, bold shot of our signature blend",
          price: 3.0,
        },
        {
          id: "6",
          name: "Americano",
          description: "Espresso with hot water for a smooth, clean taste",
          price: 3.5,
        },
      ],
      isSpecial: false,
    },
    {
      id: "milk-drinks",
      name: "Milk & Cream Beverages",
      description: "",
      items: [
        {
          id: "7",
          name: "Café au Lait",
          description: "Equal parts coffee and steamed milk, French countryside style",
          price: 4.0,
        },
        {
          id: "8",
          name: "Vienna Coffee",
          description: "Rich coffee topped with whipped cream and cocoa powder",
          price: 4.5,
        },
        {
          id: "9",
          name: "Cortado",
          description: "Spanish-style coffee with warm milk in a glass cup",
          price: 4.0,
        },
        {
          id: "10",
          name: "Café Bombón",
          description: "Espresso with sweetened condensed milk, layered beautifully",
          price: 4.5,
        },
        {
          id: "11",
          name: "Cappuccino",
          description: "Equal parts espresso, steamed milk, and foam",
          price: 4.0,
        },
        {
          id: "12",
          name: "Latte",
          description: "Espresso with steamed milk and light foam",
          price: 4.5,
        },
      ],
      isSpecial: false,
    },
    {
      id: "treats",
      name: "Handcrafted Treats",
      description: "",
      items: [
        {
          id: "13",
          name: "Grandmother's Biscotti",
          description: "Twice-baked almond cookies, perfect for dipping",
          price: 2.5,
        },
        {
          id: "14",
          name: "Apple Strudel",
          description: "Flaky pastry with spiced apples and powdered sugar",
          price: 4.0,
        },
        {
          id: "15",
          name: "Honey Cake",
          description: "Traditional recipe with local wildflower honey",
          price: 3.5,
        },
        {
          id: "16",
          name: "Cinnamon Roll",
          description: "Warm, gooey roll with cream cheese frosting",
          price: 4.0,
        },
        {
          id: "17",
          name: "Croissant",
          description: "Buttery, flaky French pastry baked fresh daily",
          price: 3.0,
        },
        {
          id: "18",
          name: "Scone",
          description: "Traditional British scone with jam and clotted cream",
          price: 3.5,
        },
      ],
      isSpecial: false,
    },
  ],
}

export default function VintageMenuPage() {
  // Hand-drawn style SVG components
  const CoffeeBeans = () => (
    <svg width="80" height="60" viewBox="0 0 80 60" className="text-amber-800">
      <g fill="currentColor" stroke="currentColor" strokeWidth="1.5" fillRule="evenodd">
        <ellipse cx="25" cy="20" rx="12" ry="18" transform="rotate(-15 25 20)" />
        <ellipse cx="25" cy="20" rx="8" ry="14" transform="rotate(-15 25 20)" fill="none" />
        <path d="M20 12c2-1 4-1 6 0" strokeLinecap="round" />
        <ellipse cx="55" cy="35" rx="10" ry="15" transform="rotate(25 55 35)" />
        <ellipse cx="55" cy="35" rx="6" ry="11" transform="rotate(25 55 35)" fill="none" />
        <path d="M52 25c2-1 4-1 5 1" strokeLinecap="round" />
      </g>
    </svg>
  )

  const CoffeePlant = () => (
    <svg width="120" height="100" viewBox="0 0 120 100" className="text-amber-800">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M60 10 Q65 20 70 30 Q75 40 80 50 Q85 60 90 70" />
        <path d="M65 25 Q70 30 75 35 Q80 40 85 45" />
        <path d="M55 35 Q50 40 45 45 Q40 50 35 55" />
        <ellipse cx="75" cy="35" rx="3" ry="6" transform="rotate(30 75 35)" fill="currentColor" />
        <ellipse cx="80" cy="45" rx="3" ry="6" transform="rotate(45 80 45)" fill="currentColor" />
        <ellipse cx="45" cy="45" rx="3" ry="6" transform="rotate(-30 45 45)" fill="currentColor" />
        <ellipse cx="40" cy="55" rx="3" ry="6" transform="rotate(-45 40 55)" fill="currentColor" />
        <path d="M70 30 Q75 25 80 30 Q85 35 80 40 Q75 35 70 30" fill="currentColor" />
        <path d="M50 40 Q45 35 40 40 Q35 45 40 50 Q45 45 50 40" fill="currentColor" />
      </g>
    </svg>
  )

  const PourOver = () => (
    <svg width="100" height="120" viewBox="0 0 100 120" className="text-amber-800">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 30 Q25 25 35 25 Q65 25 75 25 Q85 25 90 30" />
        <path d="M20 30 L25 45 Q30 55 35 65 L40 80" />
        <path d="M90 30 L85 45 Q80 55 75 65 L70 80" />
        <path d="M40 80 Q50 85 60 85 Q70 85 70 80" />
        <ellipse cx="55" cy="90" rx="25" ry="15" />
        <path d="M30 90 Q35 95 40 100 Q50 105 60 105 Q70 105 80 100 Q85 95 90 90" />
        <path d="M45 35 Q50 40 55 45 Q60 50 65 55" strokeWidth="1" />
        <circle cx="50" cy="40" r="2" fill="currentColor" />
        <circle cx="60" cy="50" r="2" fill="currentColor" />
      </g>
    </svg>
  )

  const CoffeeJars = () => (
    <svg width="80" height="120" viewBox="0 0 80 120" className="text-amber-800">
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="15" y="30" width="50" height="70" rx="5" />
        <rect x="20" y="35" width="40" height="60" rx="3" fill="currentColor" fillOpacity="0.1" />
        <rect x="10" y="20" width="60" height="15" rx="7" />
        <rect x="12" y="22" width="56" height="11" rx="5" fill="currentColor" fillOpacity="0.1" />
        <path d="M25 45 L55 45 M25 55 L55 55 M25 65 L55 65 M25 75 L55 75" strokeWidth="1" />
        <circle cx="40" cy="15" r="3" fill="currentColor" />
      </g>
    </svg>
  )

  const LatteArt = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" className="text-amber-800">
      <g fill="currentColor" stroke="currentColor" strokeWidth="1.5">
        <circle cx="40" cy="40" r="35" fill="none" strokeWidth="2" />
        <circle cx="40" cy="40" r="30" fill="currentColor" fillOpacity="0.1" />
        <path d="M40 20 Q30 30 25 40 Q30 50 40 60 Q50 50 55 40 Q50 30 40 20" />
        <path d="M40 25 Q35 30 32 35 Q35 40 40 45 Q45 40 48 35 Q45 30 40 25" fill="none" />
      </g>
    </svg>
  )

  return (
    <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 min-h-screen relative">
      <div className="p-8 relative">
        <div className="max-w-2xl mx-auto relative">
          {/* Decorative Illustrations */}
          <div className="absolute -left-32 top-20 opacity-60">
            <CoffeeBeans />
          </div>
          <div className="absolute -right-32 top-32 opacity-60">
            <CoffeePlant />
          </div>
          <div className="absolute -left-28 top-80 opacity-60">
            <PourOver />
          </div>
          <div className="absolute -right-24 bottom-40 opacity-60">
            <CoffeeJars />
          </div>
          <div className="absolute -left-20 bottom-20 opacity-60">
            <LatteArt />
          </div>

          {/* Menu Content */}
          <div className="space-y-16 relative z-10">
            {menuData.categories.map((category) => (
              <div key={category.id} className="group relative">
                <div className="relative">
                  {/* Category Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-amber-900 tracking-[0.3em]">
                      {category.name.toUpperCase()}
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.id} className="group/item relative">
                        <div className="flex justify-between items-center py-3 border-b border-amber-200/50">
                          <div className="flex items-center gap-3 flex-1">
                            <h4 className="text-lg text-amber-900 font-medium">{item.name}</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-medium text-amber-900">$ {item.price.toFixed(1)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
