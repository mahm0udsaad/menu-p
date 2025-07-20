import type { MenuCategory } from "@/types/menu"

// Sample data for sweet treats menu
const categories: MenuCategory[] = [
  {
    id: "cupcakes",
    name: "Rainbow Cupcakes",
    description: "",
    items: [
      {
        id: "1",
        name: "Cherry Topped",
        description: "",
        price: 3.8,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "2",
        name: "Orange Zest",
        description: "",
        price: 3.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "3",
        name: "Lemon Lime",
        description: "",
        price: 3.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "4",
        name: "Green Apple",
        description: "",
        price: 3.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "5",
        name: "Blueberry Twist",
        description: "",
        price: 4.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "6",
        name: "Lavender Fumes",
        description: "",
        price: 3.8,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "7",
        name: "Pink Lava",
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
    id: "macarons",
    name: "Macarons",
    description: "",
    items: [
      {
        id: "8",
        name: "Regular Macaron",
        description: "",
        price: 2.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "9",
        name: "Little Tower (30pcs)",
        description: "",
        price: 125.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "10",
        name: "Regular Tower (60pcs)",
        description: "",
        price: 240.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "11",
        name: "Boom Tower (75pcs)",
        description: "",
        price: 300.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "12",
        name: "Surprise Macaron",
        description: "",
        price: 3.25,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
  {
    id: "drinks",
    name: "Drinks & Beverages",
    description: "",
    items: [
      {
        id: "13",
        name: "Tea",
        description: "",
        price: 1.5,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
      {
        id: "14",
        name: "Coffee",
        description: "",
        price: 2.0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      },
    ],
  },
]

export default function SweetTreatsMenuPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="text-center py-16 text-white" style={{ backgroundColor: "#FF7F7F" }}>
        <h1
          className="text-6xl font-bold mb-4"
          style={{
            fontFamily: "Dancing Script, cursive",
            color: "#E6F3F0",
          }}
        >
          Sweet Treats
        </h1>
        <div className="text-lg tracking-[0.3em] font-light">• M E N U •</div>
      </div>

      {/* Menu content */}
      <div className="max-w-2xl mx-auto py-16 px-8">
        {categories.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="text-center mb-8">
              <h2
                className="text-4xl font-bold text-coral-500 mb-4"
                style={{
                  fontFamily: "Dancing Script, cursive",
                  color: "#FF7F7F",
                }}
              >
                {category.name}
              </h2>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              {category.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <span className="text-gray-700 font-medium">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom decorative border */}
      <div className="h-16" style={{ backgroundColor: "#FF7F7F" }}>
        <div className="flex justify-center items-end h-full">
          <div className="flex space-x-1 pb-2">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="bg-white opacity-80"
                style={{
                  width: "8px",
                  height: `${Math.random() * 30 + 20}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
