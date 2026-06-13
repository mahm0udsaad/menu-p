"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Link2,
  Loader2,
  Palette,
  ScanSearch,
  Sparkles,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createImportJobFromUrl, inspectMenusSaImport, previewMenusSaExtraction } from "@/lib/actions/menu-import"
import type { MenusSaInspection } from "@/lib/ai/menus-sa-import"
import type { MenuExtraction, ExtractedMenuItem } from "@/lib/ai/menu-extraction-utils"

type CinematicStage = "idle" | "discovering" | "logo" | "theme" | "extracting" | "rendering" | "variants"

interface MenusSaCinematicImportProps {
  prefillUrl?: string | null
  /** Preview mode (onboarding): extraction only, no DB job — jobId comes back null. */
  preview?: boolean
  errorMessage: string | null
  onError: (message: string | null) => void
  onReady: (payload: {
    jobId: string | null
    extraction: MenuExtraction
    inspection: MenusSaInspection | null
    templateId: string
    logoUrl: string | null
    variantId: string
  }) => void
}

interface DesignVariant {
  id: string
  name: string
  subtitle: string
  accent: string
  paper: string
  ink: string
  mode: "hero" | "arches" | "ledger" | "dark" | "spine" | "mosaic" | "cover" | "broadsheet"
}

const STRINGS = {
  eyebrow: "استيراد menus-sa",
  title: "حوّل رابط قائمة الطلبات إلى PDF مصمّم",
  subtitle: "نقرأ الشعار، ألوان القائمة، الأقسام، الصور، والأسعار ثم نعرض ٨ اتجاهات تصميم من نفس البيانات.",
  placeholder: "https://your-store.menus-sa.com/ar",
  start: "استيراد البيانات",
  badUrl: "أدخل رابط menus-sa صالحاً يبدأ بـ http أو https",
  continue: "متابعة للمراجعة",
  renderDone: "تم تجهيز الاتجاهات الثمانية من بيانات قائمتك",
}

const STAGES: Array<{ id: Exclude<CinematicStage, "idle">; label: string; detail: string }> = [
  { id: "discovering", label: "قراءة الرابط", detail: "تأكيد المصدر وبناء جلسة آمنة" },
  { id: "logo", label: "استخراج الهوية", detail: "الشعار واسم المطعم" },
  { id: "theme", label: "التقاط الثيم", detail: "الألوان والأقسام الأولى" },
  { id: "extracting", label: "استخراج الأصناف", detail: "الأسماء والأسعار والصور" },
  { id: "rendering", label: "رسم الاتجاهات", detail: "٨ معاينات من نفس البيانات" },
]

const VARIANTS: DesignVariant[] = [
  { id: "hospitality", name: "الضيافة", subtitle: "قوس فاخر وصورة بطلة", accent: "#8E2A3C", paper: "#FBF5EC", ink: "#1D1914", mode: "hero" },
  { id: "arcades", name: "أروقة", subtitle: "ثلاث نوافذ وصور كبيرة", accent: "#5A6132", paper: "#FAF5EA", ink: "#1F2117", mode: "arches" },
  { id: "ledger", name: "السجل", subtitle: "تحرير كلاسيكي كثيف", accent: "#7F2836", paper: "#FCF7EF", ink: "#201915", mode: "ledger" },
  { id: "diwan", name: "الديوان", subtitle: "داكن ونحاسي للمقاهي", accent: "#C9744A", paper: "#1B1310", ink: "#F2E9DA", mode: "dark" },
  { id: "spine", name: "الهامش", subtitle: "شريط جانبي وهوية قوية", accent: "#A8701C", paper: "#FBF5EC", ink: "#201915", mode: "spine" },
  { id: "mosaic", name: "الفهرس", subtitle: "لوحات مرقّمة للصور", accent: "#1E5C53", paper: "#FAF4E8", ink: "#1B211F", mode: "mosaic" },
  { id: "cover", name: "الغلاف", subtitle: "صورة عريضة كبداية", accent: "#6E2233", paper: "#FBF5EC", ink: "#1D1914", mode: "cover" },
  { id: "broadsheet", name: "الصحيفة", subtitle: "شبكة عربية عملية", accent: "#2A5674", paper: "#FCF8F0", ink: "#171A1C", mode: "broadsheet" },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function stageIndex(stage: CinematicStage) {
  return STAGES.findIndex((item) => item.id === stage)
}

function isMenusSaInput(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === "menus-sa.com" || host.endsWith(".menus-sa.com")
  } catch {
    return false
  }
}

function getStats(extraction: MenuExtraction | null) {
  const items = extraction?.categories.flatMap((category) => category.items) ?? []
  return {
    categories: extraction?.categories.length ?? 0,
    items: items.length,
    photos: items.filter((item) => item.image_url).length,
    images: items.filter((item) => item.image_url).slice(0, 6),
  }
}

function formatPrice(item: ExtractedMenuItem) {
  if (item.price === null || item.price === undefined) return ""
  return `${item.price.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.currency || "SAR"}`
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return
    const totalDuration = 1000
    const incrementTime = (totalDuration / end) * 1.5
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start === end) clearInterval(timer)
    }, incrementTime)
    return () => clearInterval(timer)
  }, [value])

  return <span>{count}</span>
}

function Timeline({ stage }: { stage: CinematicStage }) {
  const current = stageIndex(stage)
  const isComplete = stage === "variants"

  return (
    <div className="space-y-2.5">
      {STAGES.map((item, index) => {
        const done = current > index || isComplete
        const active = current === index && !isComplete
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 transition-all duration-300 ${active ? "opacity-100" : done ? "opacity-100" : "opacity-35"}`}
          >
            <div
              className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done
                  ? "bg-red-500 border-red-500 text-white"
                  : active
                  ? "bg-white border-red-400 text-red-400"
                  : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-[9px] font-bold">{index + 1}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs font-bold block leading-tight ${active ? "text-gray-900" : done ? "text-gray-600" : "text-gray-400"}`}>
                {item.label}
              </span>
              {active && <span className="text-[10px] text-gray-400 leading-tight">{item.detail}</span>}
            </div>
            {done && <Check className="h-3 w-3 text-green-500 flex-shrink-0" />}
          </div>
        )
      })}
    </div>
  )
}

function BrandPanel({ inspection, stage }: { inspection: MenusSaInspection | null; stage: CinematicStage }) {
  const theme = inspection?.theme
  const showLogo = inspection?.logoUrl && (stageIndex(stage) >= stageIndex("logo") || stage === "variants")
  const showTheme = theme && (stageIndex(stage) >= stageIndex("theme") || stage === "variants")

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3" dir="ltr">BRAND IDENTITY</p>
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-gray-900 leading-tight">
          {inspection?.restaurantName ? (
            <span className="animate-[fade-in_0.4s_ease-out]">{inspection.restaurantName}</span>
          ) : (
            <span className="text-gray-300 animate-pulse text-sm">جاري الاستكشاف...</span>
          )}
        </h2>
        <div
          className={`h-12 w-12 rounded-xl border bg-gray-50 grid place-items-center overflow-hidden flex-shrink-0 transition-all duration-500 ${
            showLogo ? "border-gray-200 shadow-sm" : "border-gray-100"
          }`}
        >
          {showLogo ? (
            <img src={inspection.logoUrl!} alt="" className="h-full w-full object-contain p-1.5 animate-[scale-in_0.4s_ease-out]" />
          ) : (
            <Store className={`h-5 w-5 ${stage !== "idle" ? "text-red-300 animate-pulse" : "text-gray-300"}`} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["primary", "secondary", "accent"] as const).map((key, i) => {
          const value = theme?.[key as keyof typeof theme]
          const isVisible = showTheme && value
          return (
            <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
              <div
                className="h-6 w-full rounded-lg mb-2 transition-all duration-700 ease-in-out"
                style={{ background: isVisible ? value : "#E5E7EB", transitionDelay: `${i * 150}ms` }}
              />
              <p className="text-[9px] uppercase tracking-wide text-gray-400 font-bold mb-0.5">{key}</p>
              <p className="text-[9px] text-gray-600 font-mono truncate" dir="ltr">{isVisible ? value : "---"}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-3.5 flex items-center gap-2 text-xs text-gray-500">
        {showTheme ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
        ) : stage !== "idle" && stage !== "variants" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400 flex-shrink-0" />
        ) : (
          <div className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        <span className="leading-tight">
          {showTheme ? "تم التقاط الشعار والهوية البصرية" : stage !== "idle" ? "جاري استخراج الهوية..." : "بانتظار الرابط"}
        </span>
      </div>
    </div>
  )
}

function DataPanel({
  inspection,
  extraction,
  stage,
}: {
  inspection: MenusSaInspection | null
  extraction: MenuExtraction | null
  stage: CinematicStage
}) {
  const stats = getStats(extraction)
  const isExtracting = stage === "extracting" || stage === "rendering" || stage === "variants"
  const isDone = stage === "rendering" || stage === "variants"
  const totalItems = stats.items || 0
  const totalCategories = stats.categories || inspection?.categories.length || 0
  const categoryNames = extraction?.categories.map((c) => c.name) ?? inspection?.categories.map((c) => c.name) ?? []

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest" dir="ltr">MENU DATA</p>
        <ScanSearch className={`h-3.5 w-3.5 ml-auto ${isExtracting && !isDone ? "text-red-400 animate-pulse" : isDone ? "text-red-400" : "text-gray-300"}`} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "الأقسام", value: totalCategories, delay: 0 },
          { label: "الأصناف", value: totalItems, delay: 100 },
          { label: "الصور", value: stats.photos || 0, delay: 200 },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-3 text-center border transition-all duration-500 ${
              isDone ? "bg-red-50/70 border-red-100" : "bg-gray-50 border-gray-100"
            }`}
          >
            <span className={`text-xl font-bold font-mono block ${isDone ? "text-gray-900" : "text-gray-300"}`}>
              {isDone ? <AnimatedCounter value={stat.value} /> : "0"}
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="relative max-h-14 overflow-hidden">
        {categoryNames.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {categoryNames.map((name, i) => (
                <span
                  key={i}
                  className="bg-gray-50 border border-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-[10px] animate-[fade-in-up_0.3s_ease-out]"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </>
        ) : (
          <span className="text-xs text-gray-300 italic">تنتظر قراءة الأقسام...</span>
        )}
      </div>
    </div>
  )
}

function MiniMenuList({
  category,
  accent,
  compact = false,
}: {
  category?: MenuExtraction["categories"][number]
  accent: string
  compact?: boolean
}) {
  if (!category) return null
  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <h4 className={`${compact ? "text-[8px]" : "text-[10px]"} font-black mb-1.5 uppercase tracking-wide opacity-90`} style={{ color: accent }}>
        {category.name}
      </h4>
      <div className="space-y-1.5 overflow-hidden">
        {category.items.slice(0, compact ? 4 : 6).map((item, i) => (
          <div key={i} className="flex items-baseline gap-1">
            <span className="truncate text-[7px] font-bold opacity-90">{item.name}</span>
            <span className="flex-1 border-b border-dotted border-current opacity-20" />
            <span className="text-[6px] font-mono font-bold" style={{ color: accent }}>
              {formatPrice(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VariantPreview({
  variant,
  extraction,
  restaurantName,
  brandAccent,
  brandPrimary,
  selected,
  onSelect,
  index,
}: {
  variant: DesignVariant
  extraction: MenuExtraction
  restaurantName?: string | null
  /** Extracted brand accent color — overrides the variant's fixed accent */
  brandAccent?: string | null
  /** Extracted brand primary color — used as a subtle secondary override */
  brandPrimary?: string | null
  selected: boolean
  onSelect: () => void
  index: number
}) {
  // Use the restaurant's real brand color for accents; fall back to the variant's own color
  const accent = brandAccent || variant.accent

  const firstCategory = extraction.categories[0]
  const secondCategory = extraction.categories[1]
  const items = extraction.categories.flatMap((category) => category.items)
  const hero = items.find((item) => item.image_url)
  const images = items.filter((item) => item.image_url).slice(0, 3)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group text-right w-full rounded-2xl p-1 transition-all duration-500 animate-[fade-in-up_0.6s_ease-out] ${
        selected
          ? "shadow-[0_12px_40px_rgba(0,0,0,0.18)] scale-[1.01]"
          : "bg-gray-100 hover:bg-gray-200 hover:shadow-lg hover:-translate-y-0.5"
      }`}
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: "both",
        ...(selected ? { background: `linear-gradient(to bottom, ${accent}, ${brandPrimary || accent})` } : {}),
      }}
    >
      <div className={`h-full w-full rounded-[calc(0.75rem-4px)] p-3 ${selected ? "bg-white" : "bg-transparent"}`}>
        <div
          className="aspect-[3/4] overflow-hidden rounded-xl shadow-inner transition-transform duration-500 group-hover:scale-[1.005]"
          style={{ background: variant.paper, color: variant.ink }}
        >
          <div className="h-full p-3 flex flex-col" dir="rtl">
            <div className="text-center mb-3">
              <p className="text-[6px] font-bold tracking-[0.3em] uppercase opacity-70 mb-1" style={{ color: accent }} dir="ltr">
                MENU
              </p>
              <h3 className="text-xs font-black leading-tight tracking-tight">
                {restaurantName || "قائمة الطعام"}
              </h3>
              <div className="mx-auto mt-1.5 h-[1.5px] w-8 rounded-full" style={{ background: accent }} />
            </div>

            <div className="flex-1 overflow-hidden">
              {variant.mode === "hero" || variant.mode === "cover" ? (
                <div
                  className={`${variant.mode === "hero" ? "rounded-t-full" : "rounded-lg"} h-24 mb-3 overflow-hidden border-[1.5px] shadow-sm`}
                  style={{ borderColor: accent }}
                >
                  {hero?.image_url ? (
                    <img src={hero.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full bg-black/5 place-items-center">
                      <ImageIcon className="h-4 w-4 opacity-20" />
                    </div>
                  )}
                </div>
              ) : null}

              {variant.mode === "arches" || variant.mode === "mosaic" ? (
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {images.map((item, i) => (
                    <div
                      key={i}
                      className={`overflow-hidden shadow-sm ${variant.mode === "arches" ? "rounded-t-full" : "rounded-sm"} ${i === 1 ? "h-16" : "h-12 mt-4"}`}
                    >
                      <img src={item.image_url || ""} alt="" className="h-full w-full object-cover bg-black/5" />
                    </div>
                  ))}
                </div>
              ) : null}

              {variant.mode === "spine" ? (
                <div className="flex gap-2.5 h-full">
                  <div className="w-4 rounded-full flex-shrink-0" style={{ background: accent }} />
                  <MiniMenuList category={firstCategory} accent={accent} compact />
                </div>
              ) : variant.mode === "dark" ? (
                <div className="flex flex-col h-full gap-2">
                  <div className="grid grid-cols-2 gap-1 h-12">
                    {images.slice(0, 2).map((item, i) => (
                      <img key={i} src={item.image_url || ""} alt="" className="h-full w-full object-cover rounded-sm bg-white/10" />
                    ))}
                  </div>
                  <MiniMenuList category={firstCategory} accent={accent} compact />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 h-full">
                  <MiniMenuList category={firstCategory} accent={accent} compact />
                  <MiniMenuList category={secondCategory || firstCategory} accent={accent} compact />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-2 px-1">
          <div>
            <p className={`font-bold text-sm ${selected ? "text-gray-900" : "text-gray-700"}`}>{variant.name}</p>
            <p className={`mt-0.5 text-[10px] leading-relaxed ${selected ? "text-gray-500" : "text-gray-400"}`}>{variant.subtitle}</p>
          </div>
          <div
            className={`mt-1 flex-shrink-0 grid h-5 w-5 place-items-center rounded-full border-2 transition-all ${
              selected ? "text-white shadow-sm" : "border-gray-200 text-transparent"
            }`}
            style={selected ? { background: accent, borderColor: accent } : {}}
          >
            <Check className="h-3 w-3" />
          </div>
        </div>
      </div>
    </button>
  )
}

/* ─── Preview Slider (shared between left column on desktop and mobile section) ─── */
function PreviewSlider({
  extraction,
  stage,
  selectedVariant,
  selected,
  restaurantName,
  brandAccent,
  brandPrimary,
  onPrev,
  onNext,
  onDotSelect,
}: {
  extraction: MenuExtraction | null
  stage: CinematicStage
  selectedVariant: string
  selected: DesignVariant
  restaurantName?: string | null
  brandAccent?: string | null
  brandPrimary?: string | null
  onPrev: () => void
  onNext: () => void
  onDotSelect: (id: string) => void
}) {
  const activeDotColor = brandAccent || "#ef4444"

  if (extraction && stage === "variants") {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-center gap-4 xl:gap-6 w-full" dir="rtl">
          <button
            type="button"
            aria-label="التصميم السابق"
            onClick={onPrev}
            className="h-12 w-12 shrink-0 grid place-items-center rounded-full border-2 border-white bg-white/90 text-gray-700 hover:bg-white shadow-md transition-all active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div key={selected.id} className="flex-1 max-w-[300px] xl:max-w-[360px] animate-[scale-in_0.4s_cubic-bezier(0.22,1,0.36,1)]">
            <VariantPreview
              variant={selected}
              extraction={extraction}
              restaurantName={restaurantName}
              brandAccent={brandAccent}
              brandPrimary={brandPrimary}
              selected
              onSelect={() => {}}
              index={0}
            />
          </div>

          <button
            type="button"
            aria-label="التصميم التالي"
            onClick={onNext}
            className="h-12 w-12 shrink-0 grid place-items-center rounded-full border-2 border-white bg-white/90 text-gray-700 hover:bg-white shadow-md transition-all active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 text-center">
          <p className="font-bold text-gray-800 text-base">{selected.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{selected.subtitle}</p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-label={v.name}
              onClick={() => onDotSelect(v.id)}
              className="rounded-full transition-all duration-300"
              style={
                v.id === selectedVariant
                  ? { height: "8px", width: "24px", background: activeDotColor }
                  : { height: "8px", width: "8px", background: "#D1D5DB" }
              }
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center gap-4 xl:gap-6 w-full">
        <div className="h-12 w-12 shrink-0 rounded-full border-2 border-white/60 bg-white/40" />
        <div className="flex-1 max-w-[300px] xl:max-w-[360px] aspect-[3/4] rounded-2xl bg-white/50 border-2 border-white/60 flex flex-col items-center justify-center gap-3">
          {stage !== "idle" ? (
            <>
              <Loader2 className="h-7 w-7 text-gray-400 animate-spin" />
              <p className="text-xs text-gray-400">جاري الاستخراج...</p>
            </>
          ) : (
            <p className="text-xs text-gray-400">ستظهر المعاينات هنا</p>
          )}
        </div>
        <div className="h-12 w-12 shrink-0 rounded-full border-2 border-white/60 bg-white/40" />
      </div>
      <div className="mt-5 text-center">
        <div className="h-4 w-28 bg-white/50 rounded-lg animate-pulse mx-auto" />
        <div className="h-3 w-20 bg-white/40 rounded-lg animate-pulse mx-auto mt-2" />
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function MenusSaCinematicImport({
  prefillUrl,
  preview = false,
  errorMessage,
  onError,
  onReady,
}: MenusSaCinematicImportProps) {
  const [url, setUrl] = useState(prefillUrl || "")
  const [stage, setStage] = useState<CinematicStage>("idle")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [inspection, setInspection] = useState<MenusSaInspection | null>(null)
  const [extraction, setExtraction] = useState<MenuExtraction | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0].id)

  const busy = stage !== "idle" && stage !== "variants"
  const stats = useMemo(() => getStats(extraction), [extraction])
  const autoStartedRef = useRef(false)

  useEffect(() => {
    if (prefillUrl && !autoStartedRef.current && stage === "idle") {
      autoStartedRef.current = true
      void start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillUrl])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFullscreen])

  const start = async () => {
    const trimmed = url.trim()
    onError(null)
    if (!/^https?:\/\//i.test(trimmed) || !isMenusSaInput(trimmed)) {
      onError(STRINGS.badUrl)
      return
    }

    setInspection(null)
    setExtraction(null)
    setJobId(null)
    setIsFullscreen(true)
    await sleep(600)
    setStage("discovering")
    await sleep(500)

    const inspectionResult = await inspectMenusSaImport({ url: trimmed })
    if (!inspectionResult.success || !inspectionResult.inspection) {
      setStage("idle")
      setIsFullscreen(false)
      onError(inspectionResult.error || "تعذر قراءة الرابط")
      return
    }

    setInspection(inspectionResult.inspection)
    setStage("logo")
    await sleep(700)
    setStage("theme")
    await sleep(700)
    setStage("extracting")

    const importResult = preview
      ? await previewMenusSaExtraction({ url: trimmed })
      : await createImportJobFromUrl({ url: trimmed })
    if (!importResult.success || !importResult.extraction || (!preview && !importResult.jobId)) {
      setStage("idle")
      setIsFullscreen(false)
      onError(importResult.error || "تعذر استخراج الأصناف")
      return
    }

    setJobId(importResult.jobId ?? null)
    setExtraction(importResult.extraction)
    setStage("rendering")
    await sleep(1000)
    setStage("variants")
  }

  const selected = VARIANTS.find((v) => v.id === selectedVariant) || VARIANTS[0]

  const handlePrev = () => {
    const index = VARIANTS.findIndex((v) => v.id === selectedVariant)
    setSelectedVariant(VARIANTS[(index - 1 + VARIANTS.length) % VARIANTS.length].id)
  }
  const handleNext = () => {
    const index = VARIANTS.findIndex((v) => v.id === selectedVariant)
    setSelectedVariant(VARIANTS[(index + 1) % VARIANTS.length].id)
  }

  const continueToReview = () => {
    if (!extraction || (!preview && !jobId)) return
    onReady({
      jobId,
      extraction,
      inspection,
      templateId: "mena-hospitality",
      logoUrl: inspection?.logoUrl ?? null,
      variantId: selected.id,
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { 0% { opacity: 0; transform: scale(0.93); } 100% { opacity: 1; transform: scale(1); } }
      `}} />

      {/* Light backdrop */}
      <div
        className={`fixed inset-0 bg-[#FDFDFD]/95 backdrop-blur-sm z-[100] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFullscreen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Layout placeholder to prevent collapse */}
      {isFullscreen && <div className="w-full h-[480px] hidden md:block rounded-2xl bg-gray-100/50 animate-pulse" />}

      {/* Main wrapper */}
      <div
        className={`${
          isFullscreen
            ? "fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
            : "relative"
        }`}
      >
        <div
          className={`
            relative bg-white mx-auto w-full border border-gray-100
            transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${isFullscreen
              ? "max-w-[1400px] min-h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
              : "rounded-2xl p-6 sm:p-8 shadow-md"}
          `}
        >
          {/* ── IDLE / NON-FULLSCREEN STATE ── */}
          {!isFullscreen && (
            <div className="flex flex-col gap-7">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <img src="/partners/menus-sa-logo.png" alt="menus-sa" className="h-8 w-8 object-contain flex-shrink-0" />
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <Sparkles className="h-3 w-3" />
                    {STRINGS.eyebrow}
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight max-w-lg">
                  {STRINGS.title}
                </h1>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-md">{STRINGS.subtitle}</p>
              </div>

              {/* URL input */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5" dir="ltr">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !busy && start()}
                      placeholder={STRINGS.placeholder}
                      disabled={busy}
                      className="h-11 w-full bg-transparent pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={start}
                    disabled={busy || !url.trim()}
                    className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold sm:w-auto w-full"
                  >
                    {busy ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Sparkles className="ml-2 h-4 w-4" />}
                    {STRINGS.start}
                  </Button>
                </div>
                {errorMessage && <p className="text-sm text-red-500 font-medium px-1">{errorMessage}</p>}
              </div>

              {/* Steps preview */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {STAGES.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="h-5 w-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-gray-400">{i + 1}</span>
                    </div>
                    <span className="truncate">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FULLSCREEN STATE: LEFT — Large Preview ── */}
          {isFullscreen && (
            <div className="hidden lg:flex flex-col items-center justify-center bg-[#F4EFE6] flex-[11] p-8 xl:p-12 relative overflow-hidden">
              {/* Warm gradient overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(255,255,255,0.5),transparent)] pointer-events-none" />

              {/* menus-sa watermark top-left */}
              <div className="absolute top-5 left-5 flex items-center gap-2 opacity-50">
                <img src="/partners/menus-sa-logo.png" alt="menus-sa" className="h-5 w-5 object-contain" />
                <span className="text-xs font-semibold text-gray-500" dir="ltr">menus-sa</span>
              </div>

              {/* Counter badge top-right */}
              {stage === "variants" && (
                <div className="absolute top-5 right-5 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 border border-white/60 shadow-sm animate-[fade-in_0.6s_ease-out]">
                  <span className="text-red-500 font-bold">{VARIANTS.findIndex((v) => v.id === selectedVariant) + 1}</span>
                  <span className="text-gray-400"> / {VARIANTS.length}</span>
                </div>
              )}

              {/* Preview slider */}
              <div className="relative z-10 w-full flex flex-col items-center">
                <PreviewSlider
                  extraction={extraction}
                  stage={stage}
                  selectedVariant={selectedVariant}
                  selected={selected}
                  restaurantName={inspection?.restaurantName}
                  brandAccent={inspection?.theme?.accent ?? inspection?.theme?.primary ?? null}
                  brandPrimary={inspection?.theme?.primary ?? null}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  onDotSelect={setSelectedVariant}
                />
              </div>
            </div>
          )}

          {/* ── FULLSCREEN STATE: RIGHT — Data + Controls ── */}
          {isFullscreen && (
            <div className="flex-[9] flex flex-col bg-white border-r border-gray-100 overflow-y-auto" dir="rtl">
              <div className="flex flex-col gap-5 p-6 xl:p-8 min-h-full">

                {/* Logo + badge */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <img src="/partners/menus-sa-logo.png" alt="menus-sa" className="h-8 w-8 object-contain flex-shrink-0" />
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <Sparkles className="h-3 w-3" />
                    {STRINGS.eyebrow}
                  </div>
                </div>

                {/* Title */}
                <div className="flex-shrink-0">
                  <h1 className="text-xl xl:text-2xl font-black text-gray-900 leading-tight tracking-tight">
                    {STRINGS.title}
                  </h1>
                  <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{STRINGS.subtitle}</p>
                </div>

                {/* URL input — dimmed during processing */}
                <div className={`flex-shrink-0 transition-all duration-500 ${busy ? "opacity-40 pointer-events-none" : ""}`}>
                  <div className="flex flex-col sm:flex-row gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5" dir="ltr">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !busy && start()}
                        placeholder={STRINGS.placeholder}
                        disabled={busy}
                        className="h-10 w-full bg-transparent pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={start}
                      disabled={busy || !url.trim()}
                      className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold sm:w-auto w-full text-sm"
                    >
                      {busy ? <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="ml-1.5 h-3.5 w-3.5" />}
                      {STRINGS.start}
                    </Button>
                  </div>
                  {errorMessage && <p className="text-xs text-red-500 font-medium px-1 mt-1.5">{errorMessage}</p>}
                </div>

                {/* Brand identity */}
                <BrandPanel inspection={inspection} stage={stage} />

                {/* Menu data */}
                <DataPanel inspection={inspection} extraction={extraction} stage={stage} />

                {/* Progress steps */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex-shrink-0">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3" dir="ltr">PROGRESS</p>
                  <Timeline stage={stage} />
                </div>

                {/* Mobile preview (shown only on < lg) */}
                <div className="lg:hidden bg-[#F4EFE6] rounded-2xl p-5 flex-shrink-0">
                  <p className="text-xs font-bold text-gray-500 mb-4 text-center">معاينة التصميم</p>
                  <PreviewSlider
                    extraction={extraction}
                    stage={stage}
                    selectedVariant={selectedVariant}
                    selected={selected}
                    restaurantName={inspection?.restaurantName}
                    brandAccent={inspection?.theme?.accent ?? inspection?.theme?.primary ?? null}
                    brandPrimary={inspection?.theme?.primary ?? null}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onDotSelect={setSelectedVariant}
                  />
                </div>

                {/* CTA */}
                {stage === "variants" && extraction && (
                  <div className="mt-auto pt-5 border-t border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-shrink-0 animate-[fade-in_0.8s_ease-out]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                        <Palette className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">الاتجاه المختار</p>
                        <p className="font-bold text-gray-900 text-sm">{selected.name}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={continueToReview}
                      className="h-11 px-7 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {STRINGS.continue}
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
