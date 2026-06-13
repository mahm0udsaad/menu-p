"use client"

/** Upload step: drag-drop PDF/JPG/PNG (max 10MB) + AI processing progress. */

import { useCallback, useRef, useState, type DragEvent } from "react"
import { AlertCircle, FileText, ImageIcon, Link2, Loader2, ScanSearch, ShieldCheck, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export type ProcessingPhase = "idle" | "uploading" | "extracting" | "verifying"

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"]

const STRINGS = {
  dropTitle: "اسحب ملف القائمة هنا أو اضغط للاختيار",
  dropHint: "PDF أو JPG أو PNG — بحد أقصى 10 ميجابايت",
  chooseFile: "اختيار ملف",
  badType: "نوع الملف غير مدعوم — ارفع PDF أو JPG أو PNG",
  tooLarge: "حجم الملف أكبر من 10 ميجابايت",
  uploading: "جاري رفع الملف...",
  extracting: "الذكاء الاصطناعي يقرأ قائمتك الآن... قد يستغرق ذلك حتى دقيقة",
  extractingMenusSa: "جاري قراءة قائمة menus-sa مباشرةً...",
  verifying: "جاري التحقق من الأسعار والأصناف للتأكد من الدقة...",
  verifyingMenusSa: "جاري تجهيز الأقسام والصور للمراجعة...",
  doNotClose: "لا تغلق الصفحة أثناء المعالجة",
  howItWorks: "كيف يعمل؟",
  step1: "ارفع صورة أو PDF لقائمتك القديمة",
  step2: "الذكاء الاصطناعي يستخرج الأقسام والأصناف والأسعار",
  step3: "راجع النتيجة وعدّل ما تريد ثم استورد بضغطة واحدة",
  tabFile: "رفع ملف",
  tabUrl: "من رابط",
  urlTitle: "الصق رابط قائمتك الرقمية",
  menusSaUrlTitle: "الصق رابط قائمة الطلبات",
  urlHint: "رابط مباشر لملف PDF أو صورة، أو صفحة قائمة مطعمك على الويب",
  menusSaUrlHint: "مثال: https://feel8.menus-sa.com/ar أو https://atbeirut.menus-sa.com/ar",
  urlPlaceholder: "https://example.com/menu",
  menusSaUrlPlaceholder: "https://your-store.menus-sa.com/ar",
  urlButton: "استخراج من الرابط",
  menusSaUrlButton: "استيراد من menus-sa",
  badUrl: "أدخل رابطاً صالحاً يبدأ بـ http أو https",
} as const

export interface UploadStepProps {
  subtitle: string
  phase: ProcessingPhase
  errorMessage: string | null
  preferredSource?: "menus-sa" | null
  onFileSelected: (file: File) => void
  onUrlSubmitted: (url: string) => void
}

export default function UploadStep({
  subtitle,
  phase,
  errorMessage,
  preferredSource = null,
  onFileSelected,
  onUrlSubmitted,
}: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [mode, setMode] = useState<"file" | "url">(() => (preferredSource === "menus-sa" ? "url" : "file"))
  const [url, setUrl] = useState("")

  const submitUrl = useCallback(() => {
    setLocalError(null)
    const trimmed = url.trim()
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setLocalError(STRINGS.badUrl)
      return
    }
    onUrlSubmitted(trimmed)
  }, [url, onUrlSubmitted])

  const validateAndSend = useCallback(
    (file: File | undefined) => {
      setLocalError(null)
      if (!file) return
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setLocalError(STRINGS.badType)
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        setLocalError(STRINGS.tooLarge)
        return
      }
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      validateAndSend(e.dataTransfer.files?.[0])
    },
    [validateAndSend]
  )

  const busy = phase !== "idle"
  const error = errorMessage ?? localError

  if (busy) {
    const label =
      phase === "uploading"
        ? STRINGS.uploading
        : phase === "extracting"
          ? preferredSource === "menus-sa"
            ? STRINGS.extractingMenusSa
            : STRINGS.extracting
          : preferredSource === "menus-sa"
            ? STRINGS.verifyingMenusSa
            : STRINGS.verifying
    const Icon = phase === "uploading" ? UploadCloud : phase === "extracting" ? ScanSearch : ShieldCheck
    return (
      <Card className="border-gray-200">
        <CardContent className="py-16 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <Icon className="h-8 w-8 text-red-600" />
            </div>
            <Loader2 className="h-6 w-6 text-red-500 animate-spin absolute -bottom-1 -left-1 bg-white rounded-full p-0.5" />
          </div>
          <p className="text-base font-medium text-gray-800 max-w-md">{label}</p>
          <p className="text-sm text-gray-500">{STRINGS.doNotClose}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>

      {/* File / URL toggle */}
      <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => {
            setMode("file")
            setLocalError(null)
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "file" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          {STRINGS.tabFile}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("url")
            setLocalError(null)
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Link2 className="h-4 w-4" />
          {STRINGS.tabUrl}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === "file" ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={STRINGS.dropTitle}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl px-6 py-14 flex flex-col items-center text-center gap-4 cursor-pointer transition-colors ${
            dragging ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-red-300 hover:bg-red-50/40"
          }`}
        >
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
            <UploadCloud className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{STRINGS.dropTitle}</p>
            <p className="text-sm text-gray-500 mt-1">{STRINGS.dropHint}</p>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <FileText className="h-5 w-5" />
            <ImageIcon className="h-5 w-5" />
          </div>
          <Button type="button" className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <UploadCloud className="h-4 w-4" />
            {STRINGS.chooseFile}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              validateAndSend(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl px-6 py-12 flex flex-col items-center text-center gap-5 bg-white">
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
            <Link2 className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {preferredSource === "menus-sa" ? STRINGS.menusSaUrlTitle : STRINGS.urlTitle}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {preferredSource === "menus-sa" ? STRINGS.menusSaUrlHint : STRINGS.urlHint}
            </p>
          </div>
          <div className="w-full max-w-lg flex flex-col sm:flex-row gap-2" dir="ltr">
            <input
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitUrl()}
              placeholder={preferredSource === "menus-sa" ? STRINGS.menusSaUrlPlaceholder : STRINGS.urlPlaceholder}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none"
            />
            <Button
              type="button"
              onClick={submitUrl}
              disabled={!url.trim()}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 disabled:opacity-50"
            >
              <ScanSearch className="h-4 w-4" />
              {preferredSource === "menus-sa" ? STRINGS.menusSaUrlButton : STRINGS.urlButton}
            </Button>
          </div>
        </div>
      )}

      <Card className="border-gray-200">
        <CardContent className="py-5">
          <h2 className="font-semibold text-gray-900 mb-3">{STRINGS.howItWorks}</h2>
          <ol className="space-y-2 text-sm text-gray-600">
            {[STRINGS.step1, STRINGS.step2, STRINGS.step3].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
