"use client"

import type { Menu } from "@/types/menu"

interface MenuPreviewProps {
  menu: Menu
}

export function MenuPreview({ menu }: MenuPreviewProps) {
  return (
    <div className="bg-[#f5f1eb] min-h-[800px] p-12 font-serif">
      <div className="max-w-4xl mx-auto">
        {/* Menu Title */}
        <div className="text-center mb-16">
          <h1 className="text-8xl font-bold tracking-wider text-black mb-4">MENU</h1>
          <div className="w-full h-px bg-black"></div>
        </div>

        {/* Menu Content - Two Column Layout */}
        <div className="grid grid-cols-2 gap-16">
          {/* Left Column */}
          <div className="space-y-12">
            {menu.categories.slice(0, Math.ceil(menu.categories.length / 2)).map((category, index) => (
              <div key={category.id}>
                {category.isSpecial ? (
                  /* Special Category with Black Background */
                  <div className="bg-black text-white p-6 -mx-2">
                    <h2 className="text-2xl font-bold mb-6">{category.name}.</h2>
                    <div className="space-y-4">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-300 leading-relaxed pr-4">{item.description}</p>
                            )}
                          </div>
                          <div className="text-lg font-bold ml-4">{item.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Regular Category */
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{category.name}.</h2>
                    <div className="w-full h-px bg-black mb-6"></div>

                    <div className="space-y-6">
                      {category.items.map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <div className="text-lg font-bold ml-4">{item.price.toFixed(2)}</div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-700 leading-relaxed pr-8">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-12">
            {menu.categories.slice(Math.ceil(menu.categories.length / 2)).map((category, index) => (
              <div key={category.id}>
                {category.isSpecial ? (
                  /* Special Category with Black Background */
                  <div className="bg-black text-white p-6 -mx-2">
                    <h2 className="text-2xl font-bold mb-6">{category.name}.</h2>
                    <div className="space-y-4">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-300 leading-relaxed pr-4">{item.description}</p>
                            )}
                          </div>
                          <div className="text-lg font-bold ml-4">{item.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Regular Category */
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{category.name}.</h2>
                    <div className="w-full h-px bg-black mb-6"></div>

                    <div className="space-y-6">
                      {category.items.map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <div className="text-lg font-bold ml-4">{item.price.toFixed(2)}</div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-700 leading-relaxed pr-8">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-black">
          <div className="flex justify-between items-center text-sm">
            <div className="font-bold">{menu.restaurant?.name || "YOUR LOGO"}</div>
            <div className="text-center">
              {menu.restaurant.address && <div>{menu.restaurant.address}</div>}
              {menu.restaurant.phoneNumber && <div>{menu.restaurant.phoneNumber}</div>}
            </div>
            <div>{menu.restaurant.website && <div>{menu.restaurant.website}</div>}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
