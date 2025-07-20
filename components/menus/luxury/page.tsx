import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Luxury Dark Menu",
  description: "Premium black design with gold accents",
}

const menuData = {
  restaurant: {
    name: "Le Noir",
    description: "Culinary Excellence",
  },
  categories: [
    {
      id: "caviar",
      name: "Caviar & Oysters",
      description: "",
      items: [
        {
          id: "1",
          name: "Ossetra Caviar Service",
          description: "30g of premium Ossetra caviar with traditional accompaniments and mother-of-pearl spoon",
          price: 180,
        },
        {
          id: "2",
          name: "Kumamoto Oysters",
          description: "Half dozen fresh Kumamoto oysters with champagne mignonette and cocktail sauce",
          price: 36,
        },
        {
          id: "3",
          name: "Lobster Cocktail",
          description: "Chilled Maine lobster tail with avocado, citrus, and caviar pearls",
          price: 48,
        },
      ],
      isSpecial: false,
    },
    {
      id: "signatures",
      name: "Signature Dishes",
      description: "",
      items: [
        {
          id: "4",
          name: "Wagyu Beef Tenderloin",
          description: "A5 Japanese Wagyu with black truffle, foie gras, and aged port reduction",
          price: 125,
        },
        {
          id: "5",
          name: "Whole Roasted Turbot",
          description: "Wild turbot for two with champagne beurre blanc and seasonal vegetables",
          price: 95,
        },
        {
          id: "6",
          name: "Duck à l'Orange",
          description: "Roasted Muscovy duck breast with Grand Marnier glaze and confit leg croquette",
          price: 68,
        },
        {
          id: "7",
          name: "Lobster Thermidor",
          description: "Whole Maine lobster with cognac cream sauce, gruyère, and herb crust",
          price: 78,
        },
      ],
      isSpecial: false,
    },
    {
      id: "desserts",
      name: "Desserts",
      description: "",
      items: [
        {
          id: "8",
          name: "Gold Leaf Chocolate Tart",
          description: "Valrhona chocolate tart with 24k gold leaf, raspberry coulis, and vanilla bean gelato",
          price: 28,
        },
        {
          id: "9",
          name: "Champagne Sabayon",
          description: "Dom Pérignon sabayon with fresh berries and almond tuile",
          price: 24,
        },
        {
          id: "10",
          name: "Soufflé Grand Marnier",
          description: "Classic French soufflé with Grand Marnier and crème anglaise",
          price: 26,
        },
      ],
      isSpecial: false,
    },
  ],
}

export default function LuxuryMenuPage() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
      <div className="relative p-8">
        {/* Decorative Border */}
        <div className="absolute inset-4 border-2 border-yellow-600/30 rounded-lg pointer-events-none">
          {/* Corner Decorations */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-l-2 border-t-2 border-yellow-600 rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-r-2 border-t-2 border-yellow-600 rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-2 border-b-2 border-yellow-600 rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-2 border-b-2 border-yellow-600 rounded-br-lg"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Menu Header */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <h1 className="text-6xl font-serif text-yellow-400 mb-2 tracking-wider">
                <span className="font-script text-7xl">Think</span>
              </h1>
              <h2 className="text-5xl font-serif text-yellow-400 tracking-[0.3em] font-light">UNLIMITED</h2>
            </div>
            <div className="text-yellow-200/80 text-lg tracking-[0.2em] font-light mb-6">A TASTE OF COMFORT</div>
            {/* Decorative Divider */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-px bg-yellow-600"></div>
              <div className="mx-4 text-yellow-600 text-2xl">❦</div>
              <div className="w-24 h-px bg-yellow-600"></div>
            </div>
          </div>

          {/* Menu Content - Two Column Layout */}
          <div className="grid grid-cols-2 gap-16">
            {/* Left Column */}
            <div className="space-y-12">
              {menuData.categories.slice(0, Math.ceil(menuData.categories.length / 2)).map((category) => (
                <div key={category.id} className="space-y-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-serif font-bold text-yellow-400 tracking-wider">{category.name}</h3>
                    <div className="w-full h-px bg-yellow-600/50 mt-2"></div>
                  </div>

                  <div className="space-y-6">
                    {category.items.map((item) => (
                      <div key={item.id} className="group/item">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-serif font-semibold text-yellow-200 tracking-wide">
                                {item.name.toUpperCase()}
                              </h4>
                            </div>
                            {item.description && (
                              <p className="text-sm text-yellow-100/80 leading-relaxed font-light">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <div className="text-xl font-serif font-bold text-yellow-400">{item.price.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              {menuData.categories.slice(Math.ceil(menuData.categories.length / 2)).map((category) => (
                <div key={category.id} className="space-y-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-serif font-bold text-yellow-400 tracking-wider">{category.name}</h3>
                    <div className="w-full h-px bg-yellow-600/50 mt-2"></div>
                  </div>

                  <div className="space-y-6">
                    {category.items.map((item) => (
                      <div key={item.id} className="group/item">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-serif font-semibold text-yellow-200 tracking-wide">
                                {item.name.toUpperCase()}
                              </h4>
                            </div>
                            {item.description && (
                              <p className="text-sm text-yellow-100/80 leading-relaxed font-light">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <div className="text-xl font-serif font-bold text-yellow-400">{item.price.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
