"use client"

import { memo } from "react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, GripVertical } from "lucide-react"

// Botanical illustrations
const FeatherIllustration = memo(() => (
  <svg width="120" height="300" viewBox="0 0 120 300" className="text-green-600/20 absolute">
    <g fill="currentColor">
      <path d="M60 10 Q50 50 45 100 Q40 150 35 200 Q30 250 25 290 L35 290 Q40 250 45 200 Q50 150 55 100 Q60 50 70 10 Z" />
      <path d="M60 20 Q70 30 80 40 Q75 45 65 35 Q60 30 60 20" />
      <path d="M60 40 Q75 50 85 60 Q80 65 70 55 Q60 50 60 40" />
      <path d="M60 60 Q80 70 90 80 Q85 85 75 75 Q60 70 60 60" />
      <path d="M60 80 Q85 90 95 100 Q90 105 80 95 Q60 90 60 80" />
    </g>
  </svg>
))

const LeafIllustration = memo(() => (
  <svg width="100" height="150" viewBox="0 0 100 150" className="text-green-500/30 absolute">
    <g fill="currentColor">
      <path d="M50 10 Q30 30 20 60 Q15 90 25 120 Q35 140 50 145 Q65 140 75 120 Q85 90 80 60 Q70 30 50 10 Z" />
      <path d="M50 20 L50 130" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M50 40 Q40 45 35 55" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M50 60 Q60 65 65 75" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M50 80 Q40 85 35 95" stroke="currentColor" strokeWidth="0.5" fill="none" />
    </g>
  </svg>
))

const BotanicalCafePreview = memo(() => {
  const { isPreviewMode, categories, pageBackgroundSettings, fontSettings } = useMenuEditor()

  const backgroundStyle = {
    backgroundColor: pageBackgroundSettings?.backgroundColor || "#f8fdf8",
    backgroundImage: pageBackgroundSettings?.backgroundImage ? `url(${pageBackgroundSettings.backgroundImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: fontSettings?.english?.font || "Inter",
    fontSize: `${16}px`,
    color: "#2d5016",
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={backgroundStyle}>
      {/* Background Illustrations */}
      <div className="absolute top-20 left-10">
        <FeatherIllustration />
      </div>
      <div className="absolute bottom-20 right-10">
        <LeafIllustration />
      </div>
      <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
        <LeafIllustration />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" className="text-green-600">
              <path
                fill="currentColor"
                d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-light text-green-800 mb-2">Botanical</h1>
          <h2 className="text-6xl font-bold text-green-900 mb-4">CAFE</h2>
          <p className="text-xl text-green-700 max-w-md mx-auto">Fresh, organic, and naturally inspired</p>
        </div>

        {/* Menu Categories */}
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category.id} className="relative group">
              {/* Category Edit Controls */}
              {!isPreviewMode && (
                <div
                  className="absolute -left-12 top-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                  style={{
                    opacity: !isPreviewMode ? 1 : 0,
                    transform: !isPreviewMode ? "translateX(0)" : "translateX(-10px)",
                    pointerEvents: !isPreviewMode ? "auto" : "none",
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

              {/* Category Header */}
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-green-900 mb-2">{category.name}</h3>
                <div className="w-24 h-0.5 bg-green-600 mx-auto"></div>
              </div>

              {/* Menu Items */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-green-200">
                <div className="space-y-6">
                  {category.menu_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start group/item relative">
                      {/* Item Edit Controls */}
                      {!isPreviewMode && (
                        <div
                          className="absolute -left-10 top-0 flex flex-col gap-1 transition-all duration-300 ease-in-out"
                          style={{
                            opacity: !isPreviewMode ? 1 : 0,
                            transform: !isPreviewMode ? "translateX(0)" : "translateX(-10px)",
                            pointerEvents: !isPreviewMode ? "auto" : "none",
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

                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-green-900 mb-1">{item.name}</h4>
                        {item.description && (
                          <p className="text-green-700 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <span className="text-2xl font-bold text-green-800">
                          ${item.price}
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
        <div className="text-center mt-16">
          <p className="text-green-700 text-lg italic">"Where nature meets nourishment"</p>
        </div>
      </div>
    </div>
  )
})

BotanicalCafePreview.displayName = "BotanicalCafePreview"

export { BotanicalCafePreview }
export default BotanicalCafePreview
