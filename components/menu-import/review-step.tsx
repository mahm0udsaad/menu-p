"use client"

/** Review step: editable extraction grouped by collapsible categories. */

import { useMemo, useState } from "react"
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ListChecks, RotateCcw, Trash2, UploadCloud } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import type { MenuExtraction } from "@/lib/ai/menu-extraction-utils"
import ReviewItemRow, { type EditableImportItem } from "./review-item-row"

const STRINGS = {
  summaryItems: (n: number) => `${n} صنف`,
  summaryCategories: (n: number) => `${n} قسم`,
  summaryNeedReview: (n: number) => `${n} يحتاج مراجعة`,
  allGood: "كل الأصناف جاهزة للاستيراد",
  reviewHint: "راجع الأصناف المظللة باللون الأصفر — قد تكون الأسماء أو الأسعار غير دقيقة",
  importCta: "استيراد إلى القائمة",
  importing: "جاري الاستيراد...",
  restart: "رفع ملف آخر",
  deleteCategory: "حذف القسم",
  categoryNamePlaceholder: "اسم القسم",
  itemsCount: (n: number) => `${n} صنف`,
  emptyError: "لا توجد أصناف للاستيراد — أعد رفع الملف",
} as const

interface EditableCategory {
  name: string
  description: string
  confidence: number
  items: EditableImportItem[]
}

function toEditable(extraction: MenuExtraction): EditableCategory[] {
  return extraction.categories.map((cat) => ({
    name: cat.name,
    description: cat.description ?? "",
    confidence: cat.confidence,
    items: cat.items.map((item) => ({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      image_url: item.image_url ?? null,
      confidence: item.confidence,
      flags: item.flags,
      reviewed: false,
    })),
  }))
}

export interface ReviewStepProps {
  extraction: MenuExtraction
  currency: string
  applying: boolean
  errorMessage: string | null
  onApply: (edited: MenuExtraction) => void
  onRestart: () => void
}

export default function ReviewStep({ extraction, currency, applying, errorMessage, onApply, onRestart }: ReviewStepProps) {
  const [categories, setCategories] = useState<EditableCategory[]>(() => toEditable(extraction))
  const [openMap, setOpenMap] = useState<Record<number, boolean>>(() => ({ 0: true }))
  const [localError, setLocalError] = useState<string | null>(null)

  const stats = useMemo(() => {
    const items = categories.flatMap((c) => c.items)
    return {
      items: items.length,
      categories: categories.length,
      needReview: items.filter((i) => i.flags.includes("low_confidence") && !i.reviewed).length,
    }
  }, [categories])

  const patchItem = (ci: number, ii: number, patch: Partial<EditableImportItem>) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i !== ci ? cat : { ...cat, items: cat.items.map((item, j) => (j !== ii ? item : { ...item, ...patch })) }
      )
    )
  }

  const deleteItem = (ci: number, ii: number) => {
    setCategories((prev) => prev.map((cat, i) => (i !== ci ? cat : { ...cat, items: cat.items.filter((_, j) => j !== ii) })))
  }

  const deleteCategory = (ci: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== ci))
  }

  const patchCategoryName = (ci: number, name: string) => {
    setCategories((prev) => prev.map((cat, i) => (i !== ci ? cat : { ...cat, name })))
  }

  const handleApply = () => {
    setLocalError(null)
    const cleaned: MenuExtraction = {
      detected_language: extraction.detected_language,
      currency_guess: extraction.currency_guess,
      categories: categories
        .map((cat) => ({
          name: cat.name.trim(),
          description: cat.description.trim() || null,
          confidence: cat.confidence,
          items: cat.items
            .filter((item) => item.name.trim().length > 0)
            .map((item) => ({
              name: item.name.trim(),
              description: item.description.trim() || null,
              price: item.price !== null && Number.isFinite(item.price) && item.price >= 0 ? item.price : null,
              image_url: item.image_url ?? null,
              confidence: item.reviewed ? 1 : item.confidence,
              flags: item.flags,
            })),
        }))
        .filter((cat) => cat.name.length > 0 && cat.items.length > 0),
    }
    if (cleaned.categories.length === 0) {
      setLocalError(STRINGS.emptyError)
      return
    }
    onApply(cleaned)
  }

  const error = errorMessage ?? localError

  return (
    <div className="space-y-5">
      {/* Summary header */}
      <Card className="border-gray-200">
        <CardContent className="py-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ListChecks className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-gray-700">{STRINGS.summaryCategories(stats.categories)}</Badge>
              <Badge variant="outline" className="text-gray-700">{STRINGS.summaryItems(stats.items)}</Badge>
              {stats.needReview > 0 ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1 hover:bg-amber-100">
                  <AlertTriangle className="h-3 w-3" />
                  {STRINGS.summaryNeedReview(stats.needReview)}
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 border-green-300 gap-1 hover:bg-green-100">
                  <CheckCircle2 className="h-3 w-3" />
                  {STRINGS.allGood}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRestart} className="gap-2 text-gray-600">
            <RotateCcw className="h-4 w-4" />
            {STRINGS.restart}
          </Button>
        </CardContent>
      </Card>

      {stats.needReview > 0 && <p className="text-sm text-amber-700">{STRINGS.reviewHint}</p>}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((cat, ci) => {
          const needReview = cat.items.filter((i) => i.flags.includes("low_confidence") && !i.reviewed).length
          const open = openMap[ci] ?? false
          return (
            <Collapsible key={ci} open={open} onOpenChange={(v) => setOpenMap((m) => ({ ...m, [ci]: v }))}>
              <Card className="border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-white">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-800"
                      aria-label={cat.name}
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  </CollapsibleTrigger>
                  <Input
                    value={cat.name}
                    onChange={(e) => patchCategoryName(ci, e.target.value)}
                    placeholder={STRINGS.categoryNamePlaceholder}
                    className="font-bold text-gray-900 border-transparent hover:border-gray-200 focus:border-gray-300 max-w-xs"
                  />
                  <Badge variant="outline" className="text-gray-500 flex-shrink-0">{STRINGS.itemsCount(cat.items.length)}</Badge>
                  {needReview > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex-shrink-0 hover:bg-amber-100">
                      ⚠ {needReview}
                    </Badge>
                  )}
                  <div className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCategory(ci)}
                    className="text-gray-400 hover:text-red-600 h-8 w-8 flex-shrink-0"
                    title={STRINGS.deleteCategory}
                    aria-label={STRINGS.deleteCategory}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 space-y-2 bg-gray-50/60">
                    {cat.items.map((item, ii) => (
                      <ReviewItemRow
                        key={ii}
                        item={item}
                        currency={currency}
                        onChange={(patch) => patchItem(ci, ii, patch)}
                        onDelete={() => deleteItem(ci, ii)}
                      />
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {/* CTA */}
      <div className="sticky bottom-4">
        <Button
          onClick={handleApply}
          disabled={applying || stats.items === 0}
          className="w-full h-12 text-base bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg"
        >
          <UploadCloud className="h-5 w-5" />
          {applying ? STRINGS.importing : STRINGS.importCta}
        </Button>
      </div>
    </div>
  )
}
