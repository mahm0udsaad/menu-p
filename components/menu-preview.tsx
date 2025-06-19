"use client"
import { Badge } from "@/components/ui/badge"
import { Star, Leaf, Wheat } from "lucide-react"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  dietary_info: string[]
}

interface MenuCategory {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  category: string
  logo_url: string | null
}

interface MenuPreviewProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  template?: string
}

export default function MenuPreview({ restaurant, categories, template = "modern" }: MenuPreviewProps) {
  const getDietaryIcon = (dietary: string) => {
    switch (dietary.toLowerCase()) {
      case "vegetarian":
        return <Leaf className="h-3 w-3 text-green-500" />
      case "vegan":
        return <Leaf className="h-3 w-3 text-green-600" />
      case "gluten-free":
        return <Wheat className="h-3 w-3 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white text-black min-h-[800px] max-w-2xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="text-center py-8 px-6 border-b-2 border-slate-200">
        <div className="flex items-center justify-center gap-4 mb-4">
          {restaurant.logo_url && (
            <Image
              src={restaurant.logo_url || "/placeholder.svg?height=60&width=60"}
              alt={`${restaurant.name} logo`}
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{restaurant.name}</h1>
            <p className="text-slate-600 capitalize">{restaurant.category}</p>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="p-6 space-y-8">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Your menu will appear here</h3>
            <p>Start adding items to see the live preview</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Category Header */}
              <div className="border-b border-slate-300 pb-2">
                <h2 className="text-2xl font-bold text-slate-800">{category.name}</h2>
                {category.description && <p className="text-slate-600 text-sm mt-1">{category.description}</p>}
              </div>

              {/* Menu Items */}
              <div className="space-y-4">
                {category.menu_items.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-sm">No items in {category.name} yet</p>
                  </div>
                ) : (
                  category.menu_items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-4 p-4 rounded-lg border ${
                        !item.is_available
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : item.is_featured
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white border-slate-200"
                      }`}
                    >
                      {/* Item Image */}
                      {item.image_url && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <Image
                            src={item.image_url || "/placeholder.svg?height=80&width=80"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-800 text-lg">{item.name}</h3>
                              {item.is_featured && <Star className="h-4 w-4 text-amber-500 fill-current" />}
                              {!item.is_available && (
                                <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-600">
                                  Unavailable
                                </Badge>
                              )}
                            </div>

                            {item.description && (
                              <p className="text-slate-600 text-sm mb-2 leading-relaxed">{item.description}</p>
                            )}

                            {/* Dietary Info */}
                            {item.dietary_info && item.dietary_info.length > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                {item.dietary_info.map((dietary) => (
                                  <div key={dietary} className="flex items-center gap-1">
                                    {getDietaryIcon(dietary)}
                                    <span className="text-xs text-slate-500 capitalize">{dietary}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          {item.price && (
                            <div className="text-right flex-shrink-0">
                              <span className="text-xl font-bold text-slate-800">${item.price.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 px-6 border-t border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">Scan the QR code to view this menu • Generated by Menu-p.com</p>
      </div>
    </div>
  )
}
