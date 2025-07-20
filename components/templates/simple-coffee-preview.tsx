"use client"

import { memo } from "react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, GripVertical } from "lucide-react"

const SimpleCoffeePreview = memo(() => {
  const { isPreviewMode, categories } = useMenuEditor()

  const backgroundStyle = {
    backgroundColor: "#f8f9fa",
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "Inter",
    fontSize: "16px",
    color: "#2d3748",
  }

  return (
    <div className="min-h-screen bg-amber-50 p-8" style={backgroundStyle}>
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
          {categories.slice(0, 4).map((category, index) => (
            <div key={category.id} className="relative group">
              {/* Category Edit Controls */}
              {isPreviewMode && (
                <div
                  className="absolute -left-12 top-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                  style={{
                    opacity: isPreviewMode ? 1 : 0,
                    transform: isPreviewMode ? "translateX(0)" : "translateX(-10px)",
                    pointerEvents: isPreviewMode ? "auto" : "none",
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-amber-200 h-full">
                <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">{category.name.toUpperCase()}</h3>

                <div className="space-y-4">
                  {category.menu_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group/item relative">
                      {/* Item Edit Controls */}
                      {isPreviewMode && (
                        <div
                          className="absolute -left-10 top-0 flex flex-col gap-1 transition-all duration-300 ease-in-out"
                          style={{
                            opacity: isPreviewMode ? 1 : 0,
                            transform: isPreviewMode ? "translateX(0)" : "translateX(-10px)",
                            pointerEvents: isPreviewMode ? "auto" : "none",
                          }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                          >
                            <GripVertical className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      <span className="text-amber-900 font-medium">{item.name}</span>
                      <div className="ml-6 flex-shrink-0">
                        <span className="text-xl font-bold text-gray-900">
                          ${item.price || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
})

SimpleCoffeePreview.displayName = "SimpleCoffeePreview"

export { SimpleCoffeePreview }
