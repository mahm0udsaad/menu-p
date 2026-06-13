"use client"

/**
 * Step 2 (offer): pick 1-4 menu items, set old/new price or a quick
 * discount %, optional headline. Discount badge previewed live.
 */

import { useCallback, useState } from "react"
import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { discountBadgeText, discountPercent } from "@/lib/posters/poster-utils"
import type { PosterMenuCategory, PosterMenuItem } from "@/app/dashboard/posters/page"

const MAX_PRODUCTS = 4

const STRINGS = {
  heading: "اختر أصناف العرض",
  hint: `حتى ${MAX_PRODUCTS} أصناف — صنف واحد يظهر بحجم كبير، وأكثر من صنف في شبكة`,
  empty: "لا توجد أصناف في قائمتك بعد — أضف أصنافاً من محرر القائمة أولاً",
  headline: "عنوان العرض (اختياري)",
  headlinePlaceholder: "مثال: عروض نهاية الأسبوع",
  oldPrice: "السعر قبل",
  newPrice: "السعر بعد",
  discount: "خصم %",
  maxReached: `الحد الأقصى ${MAX_PRODUCTS} أصناف`,
} as const

export interface OfferDraftItem {
  id: string
  name: string
  imageUrl: string | null
  oldPrice: string
  newPrice: string
}

export interface OfferStepProps {
  categories: PosterMenuCategory[]
  currency: string
  items: OfferDraftItem[]
  onItemsChange: (items: OfferDraftItem[]) => void
  headline: string
  onHeadlineChange: (value: string) => void
}

export default function OfferStep({
  categories,
  items,
  onItemsChange,
  headline,
  onHeadlineChange,
}: OfferStepProps) {
  const [maxWarning, setMaxWarning] = useState(false)

  const toggleItem = useCallback(
    (menuItem: PosterMenuItem) => {
      const existing = items.find((i) => i.id === menuItem.id)
      if (existing) {
        onItemsChange(items.filter((i) => i.id !== menuItem.id))
        setMaxWarning(false)
        return
      }
      if (items.length >= MAX_PRODUCTS) {
        setMaxWarning(true)
        return
      }
      const base = menuItem.price != null && menuItem.price > 0 ? String(menuItem.price) : ""
      onItemsChange([
        ...items,
        { id: menuItem.id, name: menuItem.name, imageUrl: menuItem.image_url, oldPrice: base, newPrice: base },
      ])
      setMaxWarning(false)
    },
    [items, onItemsChange]
  )

  const updateItem = useCallback(
    (id: string, patch: Partial<OfferDraftItem>) => {
      onItemsChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    },
    [items, onItemsChange]
  )

  const applyDiscount = useCallback(
    (item: OfferDraftItem, pctText: string) => {
      const pct = Number(pctText)
      const oldPrice = Number(item.oldPrice)
      if (!Number.isFinite(pct) || pct <= 0 || pct >= 100 || !(oldPrice > 0)) return
      const newPrice = Math.round(oldPrice * (1 - pct / 100) * 100) / 100
      updateItem(item.id, { newPrice: String(newPrice) })
    },
    [updateItem]
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">{STRINGS.heading}</h2>
      <p className="mb-4 mt-1 text-sm text-gray-500">{STRINGS.hint}</p>

      {categories.length === 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{STRINGS.empty}</p>
      )}

      <div className="max-h-72 space-y-4 overflow-y-auto pl-1">
        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="mb-2 text-sm font-semibold text-rose-700">{category.name}</h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((menuItem) => {
                const selected = items.some((i) => i.id === menuItem.id)
                return (
                  <button
                    key={menuItem.id}
                    type="button"
                    onClick={() => toggleItem(menuItem)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                      selected
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-rose-300"
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                    {menuItem.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {maxWarning && <p className="mt-2 text-sm text-amber-700">{STRINGS.maxReached}</p>}

      {items.length > 0 && (
        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const badge = discountBadgeText(Number(item.oldPrice) || null, Number(item.newPrice))
            const pct = discountPercent(Number(item.oldPrice) || null, Number(item.newPrice))
            return (
              <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-rose-50/60 p-3">
                <span className="min-w-28 flex-1 font-semibold text-gray-900">{item.name}</span>
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  {STRINGS.oldPrice}
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={item.oldPrice}
                    onChange={(e) => updateItem(item.id, { oldPrice: e.target.value })}
                    className="h-8 w-24 bg-white"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  {STRINGS.newPrice}
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={item.newPrice}
                    onChange={(e) => updateItem(item.id, { newPrice: e.target.value })}
                    className="h-8 w-24 bg-white"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  {STRINGS.discount}
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    inputMode="numeric"
                    value={pct ?? ""}
                    onChange={(e) => applyDiscount(item, e.target.value)}
                    className="h-8 w-20 bg-white"
                  />
                </label>
                {badge && <Badge className="bg-rose-600 text-white hover:bg-rose-600">{badge}</Badge>}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">{STRINGS.headline}</label>
        <Input
          value={headline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          placeholder={STRINGS.headlinePlaceholder}
          maxLength={60}
        />
      </div>
    </div>
  )
}
