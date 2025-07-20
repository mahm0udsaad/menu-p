import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Minimalist Classic Menu",
  description: "Clean and elegant design with serif typography",
}

const menuData = {
  restaurant: {
    name: "Bella Vista",
    description: "Fine Dining Experience",
  },
  categories: [
    {
      id: "appetizers",
      name: "Appetizers",
      description: "",
      items: [
        {
          id: "1",
          name: "Burrata with Heirloom Tomatoes",
          description: "Fresh burrata cheese with seasonal heirloom tomatoes, basil oil, and aged balsamic",
          price: 18,
        },
        {
          id: "2",
          name: "Pan-Seared Scallops",
          description: "Diver scallops with cauliflower purée, pancetta, and microgreens",
          price: 24,
        },
        {
          id: "3",
          name: "Tuna Tartare",
          description: "Yellowfin tuna with avocado, cucumber, sesame, and citrus vinaigrette",
          price: 22,
        },
        {
          id: "4",
          name: "Foie Gras Terrine",
          description: "House-made terrine with brioche toast and fig compote",
          price: 28,
        },
      ],
      isSpecial: false,
    },
    {
      id: "mains",
      name: "Main Courses",
      description: "",
      items: [
        {
          id: "5",
          name: "Dry-Aged Ribeye",
          description: "28-day aged ribeye with roasted bone marrow, seasonal vegetables, and red wine jus",
          price: 58,
        },
        {
          id: "6",
          name: "Atlantic Salmon",
          description: "Herb-crusted salmon with quinoa pilaf, roasted vegetables, and lemon butter sauce",
          price: 32,
        },
        {
          id: "7",
          name: "Duck Confit",
          description: "Slow-cooked duck leg with cherry gastrique, wild rice, and seasonal greens",
          price: 36,
        },
        {
          id: "8",
          name: "Lobster Risotto",
          description: "Creamy arborio rice with fresh lobster, peas, and truffle oil",
          price: 42,
        },
        {
          id: "9",
          name: "Lamb Rack",
          description: "Herb-crusted rack of lamb with ratatouille and rosemary jus",
          price: 48,
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
          id: "10",
          name: "Chocolate Soufflé",
          description: "Dark chocolate soufflé with vanilla bean ice cream and berry coulis",
          price: 14,
        },
        {
          id: "11",
          name: "Crème Brûlée",
          description: "Classic vanilla custard with caramelized sugar and fresh berries",
          price: 12,
        },
        {
          id: "12",
          name: "Tiramisu",
          description: "Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone",
          price: 13,
        },
        {
          id: "13",
          name: "Lemon Tart",
          description: "Tart lemon curd with meringue and shortbread crust",
          price: 11,
        },
      ],
      isSpecial: false,
    },
  ],
}

export default function MinimalistMenuPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-serif text-gray-900 mb-4 tracking-wide">{menuData.restaurant.name}</h1>
          <p className="text-xl text-gray-600 font-light italic tracking-wide">{menuData.restaurant.description}</p>
          <div className="w-32 h-px bg-gray-300 mx-auto mt-8"></div>
        </div>

        {/* Menu Categories */}
        <div className="space-y-20">
          {menuData.categories.map((category) => (
            <div key={category.id} className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-serif text-gray-900 tracking-wide">{category.name}</h2>
                <div className="w-24 h-px bg-gray-300 mx-auto mt-4"></div>
              </div>

              <div className="space-y-8">
                {category.items.map((item) => (
                  <div key={item.id} className="group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-2xl font-serif text-gray-900 mb-2 tracking-wide">{item.name}</h3>
                        <p className="text-gray-600 leading-relaxed max-w-2xl text-lg">{item.description}</p>
                      </div>
                      <div className="ml-8 flex-shrink-0">
                        <span className="text-2xl font-serif text-gray-900 tracking-wide">${item.price}</span>
                      </div>
                    </div>
                    <div className="w-full h-px bg-gray-200 mt-6"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-lg italic">
            Please inform your server of any allergies or dietary restrictions
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Executive Chef • Sommelier Available • Private Dining Upon Request
          </p>
        </div>
      </div>
    </div>
  )
}
