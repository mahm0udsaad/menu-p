"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { formatPrice } from "@/lib/posters/poster-utils"
import PickerOverlay from "./picker-overlay"

export interface BannerMenuItem {
  id: string
  name: string
  price: number | null
  image_url: string | null
}
export interface BannerMenuCategory {
  id: string
  name: string
  items: BannerMenuItem[]
}

interface Props {
  categories: BannerMenuCategory[]
  currency: string
  onPick: (item: BannerMenuItem) => void
  onClose: () => void
}

export default function ProductPicker({ categories, currency, onPick, onClose }: Props) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories
      .map((c) => ({ ...c, items: c.items.filter((i) => i.name.toLowerCase().includes(q)) }))
      .filter((c) => c.items.length > 0)
  }, [categories, query])

  return (
    <PickerOverlay title="اختر منتجاً" onClose={onClose}>
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="w-full rounded-xl border border-gray-200 py-2 pr-9 pl-3 text-sm focus:border-indigo-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 && <p className="py-8 text-center text-sm text-gray-400">لا توجد منتجات مطابقة</p>}

      <div className="space-y-5">
        {filtered.map((category) => (
          <div key={category.id}>
            <h4 className="mb-2 text-xs font-bold text-gray-400">{category.name}</h4>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPick(item)}
                  className="group flex items-center gap-2 rounded-xl border border-gray-200 p-2 text-right transition hover:border-indigo-400 hover:bg-indigo-50"
                >
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                      <span className="text-lg">🍽️</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                    {item.price != null && <p className="text-xs text-gray-500">{formatPrice(item.price, currency)}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PickerOverlay>
  )
}
