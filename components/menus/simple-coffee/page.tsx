import type { MenuCategory } from "@/types/menu"

// Sample data for simple coffee menu
const categories: MenuCategory[] = [
  {
    id: "espresso",
    name: "ESPRESSO",
    description: "",
    items: [
      {
        id: "1",
        name: "Americano",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "2",
        name: "Cappuccino",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "3",
        name: "Latte",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "4",
        name: "Double Espresso",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "5",
        name: "Machiato",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "6",
        name: "Mochaccino",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "7",
        name: "Long Black",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "8",
        name: "Flat White",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "non-coffee",
    name: "NON-COFFEE",
    description: "",
    items: [
      {
        id: "9",
        name: "Caramel",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "10",
        name: "Coffee Jelly",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "11",
        name: "Hazelnut Mocha",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "12",
        name: "Matcha Cream",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "13",
        name: "Strawberry Cream",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "14",
        name: "Vanilla Bean",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "15",
        name: "Milkshake",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "16",
        name: "Milk Tea",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "tea",
    name: "TEA",
    description: "",
    items: [
      {
        id: "17",
        name: "Hot Tea",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "18",
        name: "Ice Tea",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "19",
        name: "Lemon Tea",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "20",
        name: "Green Tea",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "21",
        name: "Jasmine Tea",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "desserts",
    name: "DESSERTS",
    description: "",
    items: [
      {
        id: "22",
        name: "Strawberry Waffle",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "23",
        name: "Cinnamon Roll",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "24",
        name: "Lemon Pie",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "25",
        name: "Croissant",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "26",
        name: "Chocolate Waffle",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export default function SimpleCoffeeMenuPage() {
  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-amber-900 mb-2">Coffee Shop</h1>
          <h2 className="text-6xl font-bold text-amber-900 mb-4">MENU</h2>
          <div className="flex justify-center">
            <svg width="100" height="20" viewBox="0 0 100 20" className="text-amber-900">
              <path d="M0 10 Q25 0 50 10 T100 10" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {categories.slice(0, 4).map((category) => (
            <div
              key={category.id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-amber-200 h-full"
            >
              <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">{category.name.toUpperCase()}</h3>

              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-amber-900 font-medium">{item.name}</span>
                    <span className="text-amber-900 font-bold">{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-amber-900 text-white text-center py-4 rounded-2xl">
          <p className="text-xl font-bold">OPEN DAILY 10 AM - 10 PM</p>
        </div>
      </div>
    </div>
  )
}
