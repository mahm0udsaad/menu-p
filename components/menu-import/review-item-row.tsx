"use client"

/** One editable extracted-item row in the review screen. */

import { AlertTriangle, Check, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STRINGS = {
  namePlaceholder: "اسم الصنف",
  descriptionPlaceholder: "الوصف (اختياري)",
  pricePlaceholder: "السعر",
  needsReview: "يحتاج مراجعة",
  reviewed: "تم",
  deleteItem: "حذف الصنف",
  flagLabels: {
    low_confidence: "ثقة منخفضة",
    price_mismatch: "سعر غير مؤكد",
    price_range: "سعر متعدد",
    missing_price: "بدون سعر",
    unparseable_price: "سعر غير مقروء",
    added_in_verification: "أُضيف عند التحقق",
    not_verified: "لم يتم التحقق",
  } as Record<string, string>,
} as const

export interface EditableImportItem {
  name: string
  description: string
  price: number | null
  image_url?: string | null
  confidence: number
  flags: string[]
  reviewed: boolean
}

export interface ReviewItemRowProps {
  item: EditableImportItem
  currency: string
  onChange: (patch: Partial<EditableImportItem>) => void
  onDelete: () => void
}

export default function ReviewItemRow({ item, currency, onChange, onDelete }: ReviewItemRowProps) {
  const needsReview = item.flags.includes("low_confidence") && !item.reviewed
  const visibleFlags = item.flags.filter((f) => f !== "low_confidence" && STRINGS.flagLabels[f])

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 transition-colors ${
        needsReview ? "border-amber-300 bg-amber-50" : item.reviewed ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-2">
        {item.image_url && (
          <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 flex-shrink-0">
            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Input
            value={item.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={STRINGS.namePlaceholder}
            className="bg-white font-medium"
            aria-label={STRINGS.namePlaceholder}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-32">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={item.price ?? ""}
              onChange={(e) => onChange({ price: e.target.value === "" ? null : Number(e.target.value) })}
              placeholder={STRINGS.pricePlaceholder}
              className="bg-white pl-12"
              aria-label={STRINGS.pricePlaceholder}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{currency}</span>
          </div>
          <Button
            type="button"
            variant={item.reviewed ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ reviewed: !item.reviewed })}
            className={`gap-1 ${item.reviewed ? "bg-green-600 hover:bg-green-700 text-white" : "text-gray-600"}`}
            title={STRINGS.reviewed}
          >
            <Check className="h-4 w-4" />
            {STRINGS.reviewed}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 h-9 w-9"
            title={STRINGS.deleteItem}
            aria-label={STRINGS.deleteItem}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Input
        value={item.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder={STRINGS.descriptionPlaceholder}
        className="bg-white text-sm text-gray-600"
        aria-label={STRINGS.descriptionPlaceholder}
      />

      {(needsReview || visibleFlags.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {needsReview && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1 hover:bg-amber-100">
              <AlertTriangle className="h-3 w-3" />
              {STRINGS.needsReview}
            </Badge>
          )}
          {visibleFlags.map((flag) => (
            <Badge key={flag} variant="outline" className="text-xs text-gray-500 border-gray-300">
              {STRINGS.flagLabels[flag]}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
