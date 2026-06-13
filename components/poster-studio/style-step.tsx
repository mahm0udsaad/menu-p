"use client"

/**
 * Step 3: template (filtered by mode) + size (square/story) + optional art
 * style hint → generate. The AI paints only the background; texts are
 * composited server-side so Arabic never gets garbled.
 */

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { POSTER_TEMPLATES } from "@/lib/posters/templates"
import type { PosterMode, PosterSize, PosterTemplateId } from "@/lib/posters/poster-utils"

const STRINGS = {
  templateHeading: "اختر التصميم",
  sizeHeading: "المقاس",
  square: "مربع ١٠٨٠×١٠٨٠ (منشور)",
  story: "طولي ١٠٨٠×١٩٢٠ (ستوري)",
  styleLabel: "لمسة فنية للخلفية (اختياري)",
  stylePlaceholder: "مثال: ألوان دافئة، طابع شرقي، خلفية ليلية…",
  generate: "إنشاء البوستر",
  generating: "جارٍ توليد الخلفية وتجهيز البوستر… قد يستغرق دقيقة",
} as const

export interface StyleStepProps {
  mode: PosterMode
  generating: boolean
  onGenerate: (template: PosterTemplateId, size: PosterSize, style: string) => void
}

export default function StyleStep({ mode, generating, onGenerate }: StyleStepProps) {
  const templates = POSTER_TEMPLATES.filter((t) => t.mode === mode)
  const [template, setTemplate] = useState<PosterTemplateId>(templates[0]?.id ?? "offer-single")
  const [size, setSize] = useState<PosterSize>("square")
  const [style, setStyle] = useState("")

  return (
    <div>
      <h2 className="mb-3 text-xl font-bold text-gray-900">{STRINGS.templateHeading}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={generating}
            onClick={() => setTemplate(t.id)}
            className={`rounded-xl border-2 p-4 text-right transition ${
              template === t.id ? "border-rose-600 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-300"
            }`}
          >
            <h3 className="font-bold text-gray-900">{t.label}</h3>
            <p className="mt-0.5 text-sm text-gray-500">{t.description}</p>
          </button>
        ))}
      </div>

      <h2 className="mb-3 mt-6 text-xl font-bold text-gray-900">{STRINGS.sizeHeading}</h2>
      <div className="flex flex-wrap gap-3">
        {(
          [
            { id: "square" as PosterSize, label: STRINGS.square, ratio: "aspect-square w-10" },
            { id: "story" as PosterSize, label: STRINGS.story, ratio: "aspect-[9/16] w-7" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={generating}
            onClick={() => setSize(option.id)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
              size === option.id ? "border-rose-600 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-300"
            }`}
          >
            <span className={`${option.ratio} rounded border-2 border-rose-400 bg-rose-100`} />
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">{STRINGS.styleLabel}</label>
        <Input
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder={STRINGS.stylePlaceholder}
          maxLength={200}
          disabled={generating}
        />
      </div>

      <Button
        onClick={() => onGenerate(template, size, style)}
        disabled={generating}
        className="mt-6 w-full gap-2 bg-rose-600 py-6 text-base text-white hover:bg-rose-700"
      >
        {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        {generating ? STRINGS.generating : STRINGS.generate}
      </Button>
    </div>
  )
}
