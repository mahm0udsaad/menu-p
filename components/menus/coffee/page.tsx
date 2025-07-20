import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Modern Coffee Shop Menu",
  description: "Warm orange tones with coffee elements",
}

const menuData = {
  restaurant: {
    name: "Borcelle",
    description: "Coffeeshop",
  },
  categories: [
    {
      id: "espresso",
      name: "Espresso Drinks",
      description: "",
      items: [
        {
          id: "1",
          name: "Espresso",
          description: "Rich, bold shot of our signature blend",
          price: 4,
        },
        {
          id: "2",
          name: "Americano",
          description: "Espresso with hot water for a smooth, clean taste",
          price: 4,
        },
        {
          id: "3",
          name: "Cappuccino",
          description: "Equal parts espresso, steamed milk, and foam",
          price: 4,
        },
        {
          id: "4",
          name: "Latte",
          description: "Espresso with steamed milk and light foam",
          price: 4,
        },
        {
          id: "5",
          name: "Mocha",
          description: "Espresso with chocolate syrup, steamed milk, and whipped cream",
          price: 4,
        },
        {
          id: "6",
          name: "Macchiato",
          description: "Espresso 'marked' with a dollop of foamed milk",
          price: 4,
        },
      ],
      isSpecial: false,
    },
    {
      id: "specialty",
      name: "Non-Coffee Drinks",
      description: "",
      items: [
        {
          id: "7",
          name: "Hot Chocolate",
          description: "Rich chocolate drink with whipped cream",
          price: 4,
        },
        {
          id: "8",
          name: "Chai Latte",
          description: "Spiced tea blend with steamed milk",
          price: 4,
        },
        {
          id: "9",
          name: "Matcha Latte",
          description: "Premium matcha powder with steamed milk",
          price: 4,
        },
        {
          id: "10",
          name: "Golden Milk",
          description: "Turmeric latte with coconut milk and spices",
          price: 4,
        },
      ],
      isSpecial: false,
    },
    {
      id: "tea",
      name: "Tea Selection",
      description: "",
      items: [
        {
          id: "11",
          name: "Earl Grey",
          description: "Classic black tea with bergamot",
          price: 4,
        },
        {
          id: "12",
          name: "Green Tea",
          description: "Delicate Japanese sencha",
          price: 4,
        },
        {
          id: "13",
          name: "Chamomile",
          description: "Soothing herbal tea",
          price: 4,
        },
        {
          id: "14",
          name: "Peppermint",
          description: "Refreshing mint tea",
          price: 4,
        },
      ],
      isSpecial: false,
    },
    {
      id: "treats",
      name: "Sweet Treats",
      description: "",
      items: [
        {
          id: "15",
          name: "Croissant",
          description: "Buttery, flaky French pastry",
          price: 4,
        },
        {
          id: "16",
          name: "Muffin",
          description: "Fresh baked daily",
          price: 4,
        },
        {
          id: "17",
          name: "Cookie",
          description: "Chocolate chip or oatmeal raisin",
          price: 4,
        },
        {
          id: "18",
          name: "Cake Slice",
          description: "Ask about today's selection",
          price: 4,
        },
      ],
      isSpecial: false,
    },
  ],
}

export default function CoffeeMenuPage() {
  return (
    <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 min-h-screen relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-400 to-transparent rounded-full opacity-30 -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-400 to-transparent rounded-full opacity-20 translate-y-48 -translate-x-48"></div>

      <div className="p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Coffee Bean Decorations */}
          <div className="absolute left-8 top-32 w-32 h-32 opacity-20">
            <div className="w-full h-full bg-amber-800 rounded-full relative">
              <div className="absolute inset-2 bg-amber-900 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-amber-600 transform -translate-x-1/2 -translate-y-1/2 rotate-12"></div>
            </div>
          </div>
          <div className="absolute left-16 bottom-32 w-24 h-24 opacity-15">
            <div className="w-full h-full bg-amber-800 rounded-full relative">
              <div className="absolute inset-2 bg-amber-900 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-amber-600 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
            </div>
          </div>

          {/* Menu Header */}
          <div className="text-left mb-12 relative">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-wide">
                {menuData.restaurant.name?.toUpperCase() || "BORCELLE"}
              </h1>
              <p className="text-lg text-gray-700 font-medium tracking-wider">COFFEESHOP</p>
            </div>
            <div className="text-right">
              <h2 className="text-8xl font-black text-gray-900 tracking-tight">MENU</h2>
            </div>
          </div>

          {/* Menu Content */}
          <div className="space-y-12">
            {menuData.categories.map((category) => (
              <div
                key={category.id}
                className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-200"
              >
                <div className="mb-6">
                  <h3 className="text-3xl font-black text-gray-900 tracking-wider">{category.name.toUpperCase()}</h3>
                </div>

                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="group/item">
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3 flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">{item.name}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-xl font-bold text-gray-900">${item.price.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <p className="text-gray-700 font-medium">Available at</p>
              <p className="text-gray-900 font-bold text-lg">9:00 am - 10:00 pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
