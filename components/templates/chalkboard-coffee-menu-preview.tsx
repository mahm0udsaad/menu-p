"use client"

import { useMenuEditor } from '@/contexts/menu-editor-context'

// Chalk-style SVG components
const ChalkCoffeeBean = ({ className = "" }) => (
  <svg width="40" height="30" viewBox="0 0 40 30" className={`text-white ${className}`}>
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="20" cy="15" rx="15" ry="12" />
      <ellipse cx="20" cy="15" rx="10" ry="8" />
      <path d="M15 10c2-1 4-1 6 0" />
    </g>
  </svg>
)

const ChalkCoffeeCup = ({ className = "" }) => (
  <svg width="60" height="50" viewBox="0 0 60 50" className={`text-white ${className}`}>
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="25" cy="40" rx="20" ry="6" />
      <path d="M5 40 Q10 20 15 15 Q20 10 25 10 Q30 10 35 15 Q40 20 45 40" />
      <ellipse cx="25" cy="15" rx="15" ry="4" />
      <path d="M45 25 Q55 25 55 35 Q55 40 45 40" />
      <path d="M15 20 Q20 25 25 30 Q30 25 35 20" strokeWidth="1" />
    </g>
  </svg>
)

const ChalkArrow = ({ className = "" }) => (
  <svg width="80" height="20" viewBox="0 0 80 20" className={`text-white ${className}`}>
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 10 Q20 8 40 10 Q60 12 70 10" />
      <path d="M65 6 L70 10 L65 14" />
    </g>
  </svg>
)

const ChalkLeaf = ({ className = "" }) => (
  <svg width="50" height="80" viewBox="0 0 50 80" className={`text-white ${className}`}>
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M25 5 Q35 20 40 40 Q35 60 25 75 Q15 60 10 40 Q15 20 25 5" />
      <path d="M25 15 Q30 25 35 35 Q30 45 25 55 Q20 45 15 35 Q20 25 25 15" />
      <path d="M25 5 L25 75" strokeWidth="1" />
    </g>
  </svg>
)

export function ChalkboardCoffeeMenuPreview() {
  const { categories } = useMenuEditor()

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(64, 64, 64, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(96, 96, 96, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(48, 48, 48, 0.4) 0%, transparent 50%),
          linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #0f0f0f 100%)
        `,
      }}
    >
      {/* Chalk texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, white 0.5px, transparent 0.5px),
            radial-gradient(circle at 50% 50%, white 0.8px, transparent 0.8px)
          `,
          backgroundSize: "100px 100px, 150px 150px, 80px 80px",
        }}
      />

      <div className="p-8 relative">
        <div className="max-w-6xl mx-auto relative">
          {/* Decorative chalk elements */}
          <div className="absolute -left-16 top-20 opacity-40 rotate-12">
            <ChalkCoffeeBean />
          </div>
          <div className="absolute -right-20 top-32 opacity-30 -rotate-12">
            <ChalkCoffeeCup />
          </div>
          <div className="absolute -left-12 bottom-40 opacity-35 rotate-45">
            <ChalkLeaf />
          </div>
          <div className="absolute -right-16 bottom-60 opacity-40 -rotate-30">
            <ChalkCoffeeBean />
          </div>
          
          {/* Menu Header */}
          <div className="text-center mb-12 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <ChalkCoffeeCup className="opacity-60" />
              <h1 className="text-4xl font-bold text-white tracking-wide" style={{ fontFamily: "cursive" }}>
                FAUCET COFFEE
              </h1>
            </div>
            <div className="relative">
              <h2
                className="text-7xl font-bold text-white mb-4"
                style={{ fontFamily: "cursive", transform: "rotate(-2deg)" }}
              >
                Menu
              </h2>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <svg width="200" height="10" viewBox="0 0 200 10" className="text-white">
                  <path
                    d="M10 5 Q50 2 100 5 Q150 8 190 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Menu Content - Two Column Layout */}
          <div className="grid grid-cols-2 gap-16 relative z-10">
            {/* Left Column */}
            <div className="space-y-12">
              {categories.slice(0, Math.ceil(categories.length / 2)).map((category) => (
                <div key={category.id} className="relative">
                  {/* Category Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-3xl font-bold text-white" style={{ fontFamily: "cursive" }}>
                        {category.name}
                      </h3>
                      <ChalkArrow className="opacity-60" />
                    </div>
                    <div className="w-full h-px bg-white/40"></div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {category.menu_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3 flex-1">
                          <h4 className="text-lg text-white" style={{ fontFamily: "cursive" }}>
                            {item.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-white" style={{ fontFamily: "cursive" }}>
                            ${item.price?.toFixed(0) || '0'}
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
              {categories.slice(Math.ceil(categories.length / 2)).map((category) => (
                <div key={category.id} className="relative">
                  {/* Category Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-3xl font-bold text-white" style={{ fontFamily: "cursive" }}>
                        {category.name}
                      </h3>
                      <ChalkArrow className="opacity-60" />
                    </div>
                    <div className="w-full h-px bg-white/40"></div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {category.menu_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3 flex-1">
                          <h4 className="text-lg text-white" style={{ fontFamily: "cursive" }}>
                            {item.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-white" style={{ fontFamily: "cursive" }}>
                            ${item.price?.toFixed(0) || '0'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative elements in center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
            <ChalkCoffeeCup className="w-32 h-32" />
          </div>
        </div>
      </div>
    </div>
  )
} 