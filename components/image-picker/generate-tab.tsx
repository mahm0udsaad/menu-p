"use client"

/** "توليد بالذكاء الاصطناعي" tab: live preview, style hint, regenerate. */

import { useState } from "react"
import { AlertCircle, Check, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateAndSaveAsset, type ImageAssetRecord } from "@/lib/actions/image-assets"

const STRINGS = {
  forItem: (name: string) => `سيتم توليد صورة احترافية للطبق «${name}»`,
  styleLabel: "لمسة إضافية (اختياري)",
  stylePlaceholder: "مثال: خلفية خشبية، إضاءة دافئة، طبق فخاري...",
  generate: "توليد الصورة",
  regenerate: "إعادة التوليد",
  useImage: "استخدام هذه الصورة",
  generating: "جاري توليد الصورة... قد يستغرق ذلك حتى ٣٠ ثانية",
  savedToGallery: "كل صورة مولّدة تُحفظ في معرضك لإعادة استخدامها لاحقاً",
  noName: "أدخل اسم الطبق أولاً ثم جرّب التوليد",
} as const

export interface GenerateTabProps {
  itemName: string
  itemNameEn?: string | null
  description?: string | null
  selecting: boolean
  onUse: (asset: ImageAssetRecord) => void
}

export default function GenerateTab({ itemName, itemNameEn, description, selecting, onUse }: GenerateTabProps) {
  const [style, setStyle] = useState("")
  const [generating, setGenerating] = useState(false)
  const [asset, setAsset] = useState<ImageAssetRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = itemName.trim().length > 0 && !generating

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGenerating(true)
    setError(null)
    try {
      const result = await generateAndSaveAsset({
        itemName,
        itemNameEn: itemNameEn ?? null,
        description: description ?? null,
        kind: "menu_item",
        style: style.trim() || null,
        aspect: "square",
      })
      if (result.success && result.asset) {
        setAsset(result.asset)
      } else {
        setError(result.error ?? "فشل توليد الصورة، حاول مرة أخرى")
      }
    } catch {
      setError("فشل توليد الصورة، حاول مرة أخرى")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{itemName.trim() ? STRINGS.forItem(itemName) : STRINGS.noName}</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{STRINGS.styleLabel}</label>
        <Input
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder={STRINGS.stylePlaceholder}
          disabled={generating}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {generating ? (
        <div className="aspect-square max-w-sm mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center gap-3 animate-pulse">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
          <p className="text-sm text-rose-700 px-6 text-center">{STRINGS.generating}</p>
        </div>
      ) : asset ? (
        <div className="max-w-sm mx-auto space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.public_url}
            alt={itemName}
            className="aspect-square w-full rounded-2xl object-cover border border-gray-200 shadow-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => onUse(asset)}
              disabled={selecting}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {selecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {STRINGS.useImage}
            </Button>
            <Button type="button" variant="outline" onClick={handleGenerate} disabled={!canGenerate} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {STRINGS.regenerate}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="bg-rose-600 hover:bg-rose-700 text-white gap-2 px-8"
          >
            <Sparkles className="h-4 w-4" />
            {STRINGS.generate}
          </Button>
          <p className="text-xs text-gray-400">{STRINGS.savedToGallery}</p>
        </div>
      )}
    </div>
  )
}
