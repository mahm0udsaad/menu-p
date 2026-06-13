"use client"

/**
 * Poster Studio wizard (Phase 4): mode (عرض/تهنئة) → content → style/size →
 * generate → gallery. Arabic-first, RTL, rose palette.
 */

import { useCallback, useState } from "react"
import Link from "next/link"
import { ArrowRight, ImagePlus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createPoster, type PosterRecord } from "@/lib/actions/posters"
import type { PosterMode, PosterPayload, PosterSize, PosterTemplateId } from "@/lib/posters/poster-utils"
import type { PosterMenuCategory } from "@/app/dashboard/posters/page"
import ModeStep from "./mode-step"
import OfferStep, { type OfferDraftItem } from "./offer-step"
import GreetingStep from "./greeting-step"
import StyleStep from "./style-step"
import PosterGallery from "./poster-gallery"

const STRINGS = {
  title: "استوديو البوسترات",
  subtitle: "بوسترات عروض وتهنئة احترافية لمطعمك في دقيقة — بدون مصمم",
  back: "العودة للوحة التحكم",
  newPoster: "بوستر جديد",
  cancel: "إلغاء",
  prev: "السابق",
  generateFailed: "فشل إنشاء البوستر، حاول مرة أخرى",
} as const

type WizardStep = "mode" | "content" | "style"

export interface PosterStudioClientProps {
  restaurantName: string
  currency: string
  categories: PosterMenuCategory[]
  initialPosters: PosterRecord[]
}

export default function PosterStudioClient({
  restaurantName,
  currency,
  categories,
  initialPosters,
}: PosterStudioClientProps) {
  const [posters, setPosters] = useState<PosterRecord[]>(initialPosters)
  const [wizardOpen, setWizardOpen] = useState(initialPosters.length === 0)
  const [step, setStep] = useState<WizardStep>("mode")
  const [mode, setMode] = useState<PosterMode>("offer")
  const [offerItems, setOfferItems] = useState<OfferDraftItem[]>([])
  const [headline, setHeadline] = useState("")
  const [occasion, setOccasion] = useState("")
  const [message, setMessage] = useState("")
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resetWizard = useCallback(() => {
    setStep("mode")
    setOfferItems([])
    setHeadline("")
    setOccasion("")
    setMessage("")
    setErrorMessage(null)
  }, [])

  const handleModePicked = useCallback((picked: PosterMode) => {
    setMode(picked)
    setStep("content")
    setErrorMessage(null)
  }, [])

  const handleGenerate = useCallback(
    async (template: PosterTemplateId, size: PosterSize, style: string) => {
      setErrorMessage(null)
      const payload: PosterPayload =
        mode === "offer"
          ? {
              mode: "offer",
              currency,
              headline: headline.trim() || null,
              products: offerItems.map((item) => ({
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                oldPrice: item.oldPrice.trim() ? Number(item.oldPrice) : null,
                newPrice: Number(item.newPrice),
              })),
            }
          : { mode: "greeting", occasion: occasion.trim(), message: message.trim() }

      setGenerating(true)
      try {
        const result = await createPoster({ template, size, payload, style: style.trim() || null })
        if (!result.success || !result.poster) {
          setErrorMessage(result.error ?? STRINGS.generateFailed)
          return
        }
        setPosters((prev) => [result.poster as PosterRecord, ...prev])
        setWizardOpen(false)
        resetWizard()
      } catch (err) {
        console.error("createPoster failed:", err)
        setErrorMessage(STRINGS.generateFailed)
      } finally {
        setGenerating(false)
      }
    },
    [mode, currency, headline, offerItems, occasion, message, resetWizard]
  )

  const contentReady =
    mode === "offer"
      ? offerItems.length > 0 && offerItems.every((i) => Number(i.newPrice) > 0)
      : occasion.trim().length > 0 && message.trim().length > 0

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-rose-700 hover:text-rose-900">
          <ArrowRight className="h-4 w-4" />
          {STRINGS.back}
        </Link>

        <header className="mt-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <Sparkles className="h-7 w-7 text-rose-600" />
              {STRINGS.title}
            </h1>
            <p className="mt-1 text-gray-500">{STRINGS.subtitle}</p>
          </div>
          {!wizardOpen && (
            <Button onClick={() => setWizardOpen(true)} className="gap-2 bg-rose-600 text-white hover:bg-rose-700">
              <ImagePlus className="h-4 w-4" />
              {STRINGS.newPoster}
            </Button>
          )}
        </header>

        {wizardOpen ? (
          <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            {step === "mode" && <ModeStep onPick={handleModePicked} />}

            {step === "content" && mode === "offer" && (
              <OfferStep
                categories={categories}
                currency={currency}
                items={offerItems}
                onItemsChange={setOfferItems}
                headline={headline}
                onHeadlineChange={setHeadline}
              />
            )}
            {step === "content" && mode === "greeting" && (
              <GreetingStep
                occasion={occasion}
                message={message}
                onOccasionChange={setOccasion}
                onMessageChange={setMessage}
              />
            )}

            {step === "style" && (
              <StyleStep mode={mode} generating={generating} onGenerate={handleGenerate} />
            )}

            {errorMessage && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <Button
                variant="ghost"
                disabled={generating}
                onClick={() => {
                  if (step === "mode") {
                    setWizardOpen(false)
                    resetWizard()
                  } else {
                    setStep(step === "style" ? "content" : "mode")
                  }
                }}
              >
                {step === "mode" ? STRINGS.cancel : STRINGS.prev}
              </Button>
              {step === "content" && (
                <Button
                  disabled={!contentReady}
                  onClick={() => setStep("style")}
                  className="bg-rose-600 text-white hover:bg-rose-700"
                >
                  التالي: التصميم
                </Button>
              )}
            </div>
          </section>
        ) : (
          <PosterGallery posters={posters} onPostersChange={setPosters} />
        )}
      </div>
    </div>
  )
}
