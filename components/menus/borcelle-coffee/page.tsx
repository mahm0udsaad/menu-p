import type { MenuCategory } from "@/types/menu"

// Sample data for Borcelle coffee menu
const categories: MenuCategory[] = [
  {
    id: "coffee",
    name: "COFFEE",
    description: "",
    items: [
      {
        id: "1",
        name: "Espresso",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "2",
        name: "Double Espresso",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "3",
        name: "Latte",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "4",
        name: "Americano",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "5",
        name: "Macchiato",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "6",
        name: "Flat White",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "7",
        name: "Cappuccino",
        description: "",
        price: 5,
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
        id: "8",
        name: "Lemon Tea",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "9",
        name: "Mango Tea",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "10",
        name: "Jasmine",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "11",
        name: "Green Tea",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "12",
        name: "Mint Tea",
        description: "",
        price: 5,
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
        id: "13",
        name: "Hot Chocolate",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "14",
        name: "Milkshake",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "15",
        name: "Smoothie",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "16",
        name: "Lemonade",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "17",
        name: "Vanilla Milkshake",
        description: "",
        price: 5,
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
        id: "18",
        name: "Strawberry Waffle",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "19",
        name: "Cinnamon Roll",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "20",
        name: "Lemon Pie",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "21",
        name: "Croissant",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "22",
        name: "Chocolate Waffle",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "23",
        name: "Brownies",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "24",
        name: "Cheesecake",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "25",
        name: "Chocolate Muffin",
        description: "",
        price: 5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export default function BorcelleCoffeeMenuPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div className="flex-1">
            {/* Logo */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-amber-900 flex items-center justify-center mr-4">
                <span className="text-amber-900 font-bold text-lg">B</span>
              </div>
              <h1 className="text-3xl font-bold text-amber-900 tracking-wider">BORCELLE</h1>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-4xl font-script text-amber-900 mb-2" style={{ fontFamily: "cursive" }}>
                Coffee Shop
              </h2>
              <h3 className="text-6xl font-bold text-amber-900 tracking-tight">MENU</h3>
            </div>
          </div>

          {/* Coffee Image */}
          <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-amber-200 ml-8">
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
                  {index === 0 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V10H4V8H16V3H20Z"
                      />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M17,19H7V17H17V19M16,14H8V12L10.5,9.5L9.08,8.08L12,5.16L14.92,8.08L13.5,9.5L16,12V14M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z"
                      />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M17,19H7V17H17V19M16,14H8V12L10.5,9.5L9.08,8.08L12,5.16L14.92,8.08L13.5,9.5L16,12V14M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z"
                      />
                    </svg>
                  )}
                  {index === 3 && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-amber-900">
                      <path
                        fill="currentColor"
                        d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-amber-900 tracking-wide">{category.name.toUpperCase()}</h3>
                <div className="flex-1 ml-4 border-b border-amber-900"></div>
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {category.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-amber-900 font-medium text-lg">{item.name}</span>
                    <span className="text-amber-900 font-bold text-lg">${item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
