"use client"

/**
 * AI menu import wizard: upload → AI processing → review → success.
 * Arabic-first, RTL.
 */

import { useCallback, useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { createImportJob, createImportJobFromUrl, applyImport } from "@/lib/actions/menu-import"
import type { MenuExtraction } from "@/lib/ai/menu-extraction-utils"
import UploadStep, { type ProcessingPhase } from "./upload-step"
import ReviewStep from "./review-step"
import SuccessStep from "./success-step"
import MenusSaCinematicImport from "./menus-sa-cinematic-import"

const STRINGS = {
  title: "استيراد قائمة قديمة",
  subtitle: "ارفع قائمتك القديمة (PDF أو صورة) أو الصق رابطها، وسيستخرج الذكاء الاصطناعي كل الأقسام والأصناف والأسعار",
  menusSaSubtitle: "الصق رابط قائمة الطلبات menus-sa وسنستورد الأقسام والأصناف والأسعار والصور مباشرةً بدون تكلفة ذكاء اصطناعي",
  back: "العودة للوحة التحكم",
  uploadFailed: "فشل رفع الملف، حاول مرة أخرى",
  notConfigured: "الخدمة غير مهيأة حالياً",
  applyFailed: "فشل الاستيراد، حاول مرة أخرى",
  tryAgain: "المحاولة من جديد",
} as const

type Step = "upload" | "review" | "success"

export interface MenuImportClientProps {
  restaurantId: string
  restaurantName: string
  currency: string
  preferredSource?: "menus-sa" | null
  prefillUrl?: string | null
}

export default function MenuImportClient({ restaurantId, restaurantName, currency, preferredSource = null, prefillUrl = null }: MenuImportClientProps) {
  const [step, setStep] = useState<Step>("upload")
  const [phase, setPhase] = useState<ProcessingPhase>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [extraction, setExtraction] = useState<MenuExtraction | null>(null)
  const [applying, setApplying] = useState(false)
  const [importedCounts, setImportedCounts] = useState({ categories: 0, items: 0 })
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [detectedLogoUrl, setDetectedLogoUrl] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setErrorMessage(null)
      if (!isSupabaseConfigured) {
        setErrorMessage(STRINGS.notConfigured)
        return
      }
      setPhase("uploading")
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
        const path = `imports/${restaurantId}/${Date.now()}.${ext}`
        const client = createClientComponentClient()
        const { data: uploadData, error: uploadError } = await client.storage
          .from("menu-images")
          .upload(path, file, { cacheControl: "3600", upsert: false })
        if (uploadError || !uploadData) {
          console.error("Upload error:", uploadError)
          setPhase("idle")
          setErrorMessage(STRINGS.uploadFailed)
          return
        }
        const {
          data: { publicUrl },
        } = client.storage.from("menu-images").getPublicUrl(uploadData.path)

        setPhase("extracting")
        // Verification happens inside the same action; switch the label midway
        const verifyTimer = setTimeout(() => setPhase("verifying"), 20_000)
        const result = await createImportJob({
          fileUrl: publicUrl,
          mimeType: file.type,
          sourceType: file.type === "application/pdf" ? "pdf" : "image",
        })
        clearTimeout(verifyTimer)

        if (!result.success || !result.extraction) {
          setPhase("idle")
          setErrorMessage(result.error ?? STRINGS.applyFailed)
          return
        }
        setJobId(result.jobId ?? null)
        setExtraction(result.extraction)
        setPhase("idle")
        setStep("review")
      } catch (err) {
        console.error("Import flow error:", err)
        setPhase("idle")
        setErrorMessage(STRINGS.uploadFailed)
      }
    },
    [restaurantId]
  )

  const handleUrl = useCallback(
    async (url: string) => {
      setErrorMessage(null)
      // No file upload step — the server resolves/renders the URL. Jump
      // straight to the AI phases (label flips to "verifying" midway).
      setPhase("extracting")
      const verifyTimer = setTimeout(() => setPhase("verifying"), 20_000)
      try {
        const result = await createImportJobFromUrl({ url })
        clearTimeout(verifyTimer)
        if (!result.success || !result.extraction) {
          setPhase("idle")
          setErrorMessage(result.error ?? STRINGS.applyFailed)
          return
        }
        setJobId(result.jobId ?? null)
        setExtraction(result.extraction)
        setPhase("idle")
        setStep("review")
      } catch (err) {
        clearTimeout(verifyTimer)
        console.error("URL import flow error:", err)
        setPhase("idle")
        setErrorMessage(STRINGS.applyFailed)
      }
    },
    []
  )

  const handleApply = useCallback(
    async (edited: MenuExtraction) => {
      if (!jobId) return
      setApplying(true)
      setErrorMessage(null)
      const result = await applyImport(jobId, edited, {
        templateId: selectedTemplateId ?? undefined,
        logoUrl: detectedLogoUrl,
      })
      setApplying(false)
      if (!result.success) {
        setErrorMessage(result.error ?? STRINGS.applyFailed)
        return
      }
      setImportedCounts({ categories: result.categoriesCreated ?? 0, items: result.itemsCreated ?? 0 })
      setStep("success")
    },
    [jobId, selectedTemplateId, detectedLogoUrl]
  )

  const reset = useCallback(() => {
    setStep("upload")
    setPhase("idle")
    setErrorMessage(null)
    setJobId(null)
    setExtraction(null)
    setSelectedTemplateId(null)
    setDetectedLogoUrl(null)
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{STRINGS.title}</h1>
              <p className="text-xs text-gray-500 truncate">{restaurantName}</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 text-gray-700">
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">{STRINGS.back}</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {step === "upload" && preferredSource === "menus-sa" && (
          <MenusSaCinematicImport
            prefillUrl={prefillUrl}
            errorMessage={errorMessage}
            onError={setErrorMessage}
            onReady={({ jobId, extraction, templateId, logoUrl }) => {
              setJobId(jobId)
              setExtraction(extraction)
              setSelectedTemplateId(templateId)
              setDetectedLogoUrl(logoUrl)
              setErrorMessage(null)
              setStep("review")
            }}
          />
        )}
        {step === "upload" && preferredSource !== "menus-sa" && (
          <UploadStep
            subtitle={preferredSource === "menus-sa" ? STRINGS.menusSaSubtitle : STRINGS.subtitle}
            phase={phase}
            errorMessage={errorMessage}
            preferredSource={preferredSource}
            onFileSelected={handleFile}
            onUrlSubmitted={handleUrl}
          />
        )}
        {step === "review" && extraction && (
          <ReviewStep
            extraction={extraction}
            currency={currency}
            applying={applying}
            errorMessage={errorMessage}
            onApply={handleApply}
            onRestart={reset}
          />
        )}
        {step === "success" && (
          <SuccessStep
            categoriesCreated={importedCounts.categories}
            itemsCreated={importedCounts.items}
            onImportAnother={reset}
          />
        )}
      </main>
    </div>
  )
}
