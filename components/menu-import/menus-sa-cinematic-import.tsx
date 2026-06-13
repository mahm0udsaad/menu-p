"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Layers3,
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
  noLogo: "لم يتم العثور على شعار واضح",
  items: (n: number) => `${n} صنف`,
  categories: (n: number) => `${n} قسم`,
  photos: (n: number) => `${n} صورة`,
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
  const progressPercent = isComplete ? 100 : Math.max(0, (current / (STAGES.length - 1)) * 100)

  return (
    <div className="relative pt-6 pb-2">
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 rounded-full hidden sm:block" />
      
      <div 
        className="absolute top-1/2 right-0 h-1 bg-gradient-to-l from-red-500 to-red-400 -translate-y-1/2 rounded-full hidden sm:block transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(239,68,68,0.5)]"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
        {STAGES.map((item, index) => {
          const done = current > index || isComplete
          const active = current === index
          return (
            <div
              key={item.id}
              className={`flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 transition-all duration-500 ${active ? 'scale-105' : done ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done 
                  ? "bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                  : active 
                    ? "bg-[#171411] border-red-400 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                    : "bg-[#171411] border-white/10 text-white/40"
              }`}>
                {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <div className="sm:mt-2">
                <span className={`block text-sm font-bold ${active ? 'text-white' : done ? 'text-white/90' : 'text-white/50'}`}>{item.label}</span>
                <p className="text-xs text-white/40 sm:hidden md:block mt-0.5">{item.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BrandPanel({ inspection, stage }: { inspection: MenusSaInspection | null; stage: CinematicStage }) {
  const theme = inspection?.theme
  const showLogo = inspection?.logoUrl && (stageIndex(stage) >= stageIndex("logo") || stage === "variants")
  const showTheme = theme && (stageIndex(stage) >= stageIndex("theme") || stage === "variants")

  return (
    <div className="relative overflow-hidden border border-white/10 bg-white/5 rounded-[var(--radius-lg)] p-6 min-h-[260px] backdrop-blur-sm group">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-red-300/70 uppercase tracking-widest" dir="ltr">BRAND IDENTITY</p>
          <h2 className="text-xl font-bold text-white mt-2 h-8 flex items-center">
            {inspection?.restaurantName ? (
              <span className="animate-[fade-in_0.5s_ease-out]">{inspection.restaurantName}</span>
            ) : (
              <span className="text-white/30 animate-pulse">جاري الاستكشاف...</span>
            )}
          </h2>
        </div>
        
        <div className={`h-16 w-16 rounded-[var(--radius-md)] border border-white/10 bg-white/5 grid place-items-center overflow-hidden transition-all duration-700 ${showLogo ? 'shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/10' : ''}`}>
          {showLogo ? (
            <img src={inspection.logoUrl!} alt="" className="h-full w-full object-contain p-2 animate-[scale-in_0.5s_backcubic]" />
          ) : (
            <Store className={`h-6 w-6 ${stage !== 'idle' ? 'text-red-400/50 animate-pulse' : 'text-white/20'}`} />
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 relative z-10">
        {["primary", "secondary", "accent"].map((key, i) => {
          const value = theme?.[key as keyof typeof theme]
          const isVisible = showTheme && value
          return (
            <div key={key} className="rounded-[var(--radius-md)] border border-white/5 bg-black/20 p-3 overflow-hidden relative">
              <div 
                className="absolute inset-0 transition-transform duration-700 ease-in-out origin-right"
                style={{
                  background: isVisible ? value : 'transparent',
                  transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                  transitionDelay: `${i * 150}ms`
                }}
              />
              <div className="relative z-10 mix-blend-difference">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/70 font-bold mb-1">{key}</p>
                <p className="text-xs text-white/90 font-mono" dir="ltr">{isVisible ? value : "---"}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-white/60 relative z-10">
        {showTheme ? (
          <CheckCircle2 className="h-4 w-4 text-red-400" />
        ) : stage !== "idle" && stage !== "variants" ? (
          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
        ) : (
          <div className="h-4 w-4" />
        )}
        <span>{showTheme ? "تم التقاط الشعار والهوية البصرية" : stage !== "idle" ? "جاري استخراج الهوية..." : "بانتظار الرابط"}</span>
      </div>
    </div>
  )
}

function DataPanel({ inspection, extraction, stage }: { inspection: MenusSaInspection | null; extraction: MenuExtraction | null, stage: CinematicStage }) {
  const stats = getStats(extraction)
  const isExtracting = stage === "extracting" || stage === "rendering" || stage === "variants"
  const isDone = stage === "rendering" || stage === "variants"
  const totalItems = stats.items || 0
  const totalCategories = stats.categories || inspection?.categories.length || 0
  
  const categoryNames = extraction?.categories.map((c) => c.name) ?? inspection?.categories.map((c) => c.name) ?? []

  return (
    <div className="relative overflow-hidden border border-white/10 bg-white/5 rounded-[var(--radius-lg)] p-6 min-h-[260px] backdrop-blur-sm group">
      <div className="absolute inset-0 bg-gradient-to-bl from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10 flex items-center gap-2 mb-6">
        <ScanSearch className={`h-5 w-5 ${isExtracting && !isDone ? 'text-red-400 animate-pulse' : isDone ? 'text-red-400' : 'text-white/40'}`} />
        <div>
          <p className="text-xs font-medium text-red-300/70 uppercase tracking-widest" dir="ltr">MENU DATA</p>
          <h2 className="text-lg font-bold text-white mt-1">البيانات المستخرجة</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        {[
          { label: "الأقسام", value: totalCategories, delay: 0 },
          { label: "الأصناف", value: totalItems, delay: 100 },
          { label: "الصور", value: stats.photos || 0, delay: 200 }
        ].map((stat, i) => (
          <div key={stat.label} className="rounded-[var(--radius-md)] bg-black/20 border border-white/5 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
             {isDone && <div className="absolute inset-0 bg-red-500/10 animate-[fade-in_1s_ease-out]" style={{ animationDelay: `${stat.delay}ms`, animationFillMode: 'both' }} />}
            <span className={`text-3xl font-bold font-mono ${isDone ? 'text-white' : 'text-white/20'}`}>
              {isDone ? <AnimatedCounter value={stat.value} /> : "0"}
            </span>
            <span className="text-xs text-white/50 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 relative z-10 max-h-20 overflow-hidden relative">
        {categoryNames.length > 0 ? (
          <>
            {categoryNames.map((name, i) => (
              <span 
                key={i} 
                className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/80 animate-[fade-in-up_0.3s_ease-out]"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                {name}
              </span>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1b1714] to-transparent pointer-events-none" />
          </>
        ) : (
          <span className="text-sm text-white/30 italic">تنتظر قراءة الأقسام...</span>
        )}
      </div>
    </div>
  )
}

function VariantPreview({
  variant,
  extraction,
  selected,
  onSelect,
  index,
}: {
  variant: DesignVariant
  extraction: MenuExtraction
  selected: boolean
  onSelect: () => void
  index: number
}) {
  const firstCategory = extraction.categories[0]
  const secondCategory = extraction.categories[1]
  const items = extraction.categories.flatMap((category) => category.items)
  const hero = items.find((item) => item.image_url)
  const images = items.filter((item) => item.image_url).slice(0, 3)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group text-right rounded-[var(--radius-lg)] p-1 transition-all duration-500 animate-[fade-in-up_0.6s_ease-out] ${
        selected 
          ? "bg-gradient-to-b from-red-500 to-red-600 shadow-[0_10px_30px_rgba(239,68,68,0.3)] scale-[1.02] -translate-y-2" 
          : "bg-white/5 hover:bg-white/10 hover:shadow-xl hover:-translate-y-1"
      }`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <div className={`h-full w-full rounded-[calc(var(--radius-lg)-4px)] p-3 ${selected ? 'bg-[#171411]' : 'bg-transparent'}`}>
        <div 
          className="aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] shadow-inner transition-transform duration-500 group-hover:scale-[1.01]" 
          style={{ background: variant.paper, color: variant.ink }}
        >
          <div className="h-full p-3 flex flex-col" dir="rtl">
            <div className="text-center mb-3">
              <p className="text-[6px] font-bold tracking-[0.3em] uppercase opacity-70 mb-1" style={{ color: variant.accent }} dir="ltr">MENU</p>
              <h3 className="text-xs font-black leading-tight tracking-tight">{extraction.categories[0]?.name ? "قائمة الطعام" : variant.name}</h3>
              <div className="mx-auto mt-1.5 h-[1.5px] w-8 rounded-full" style={{ background: variant.accent }} />
            </div>

            <div className="flex-1 overflow-hidden">
              {variant.mode === "hero" || variant.mode === "cover" ? (
                <div className={`${variant.mode === "hero" ? "rounded-t-full" : "rounded-lg"} h-24 mb-3 overflow-hidden border-[1.5px] shadow-sm`} style={{ borderColor: variant.accent }}>
                  {hero?.image_url ? <img src={hero.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full bg-black/5 place-items-center"><ImageIcon className="h-4 w-4 opacity-20" /></div>}
                </div>
              ) : null}

              {variant.mode === "arches" || variant.mode === "mosaic" ? (
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {images.map((item, i) => (
                    <div key={i} className={`overflow-hidden shadow-sm ${variant.mode === "arches" ? "rounded-t-full" : "rounded-sm"} ${i === 1 ? "h-16" : "h-12 mt-4"}`}>
                      <img src={item.image_url || ""} alt="" className="h-full w-full object-cover bg-black/5" />
                    </div>
                  ))}
                </div>
              ) : null}

              {variant.mode === "spine" ? (
                <div className="flex gap-2.5 h-full">
                  <div className="w-4 rounded-full flex-shrink-0" style={{ background: variant.accent }} />
                  <MiniMenuList category={firstCategory} accent={variant.accent} compact />
                </div>
              ) : variant.mode === "dark" ? (
                <div className="flex flex-col h-full gap-2">
                  <div className="grid grid-cols-2 gap-1 h-12">
                    {images.slice(0, 2).map((item, i) => <img key={i} src={item.image_url || ""} alt="" className="h-full w-full object-cover rounded-sm bg-white/10" />)}
                  </div>
                  <MiniMenuList category={firstCategory} accent={variant.accent} compact />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 h-full">
                  <MiniMenuList category={firstCategory} accent={variant.accent} compact />
                  <MiniMenuList category={secondCategory || firstCategory} accent={variant.accent} compact />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-start justify-between gap-2 px-1">
          <div>
            <p className={`font-bold text-sm ${selected ? "text-white" : "text-white/90"}`}>{variant.name}</p>
            <p className={`mt-0.5 text-[10px] leading-relaxed ${selected ? "text-white/70" : "text-white/50"}`}>{variant.subtitle}</p>
          </div>
          <div className={`mt-1 flex-shrink-0 grid h-5 w-5 place-items-center rounded-full border transition-all ${selected ? "bg-red-500 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "border-white/20 text-transparent"}`}>
            <Check className="h-3 w-3" />
          </div>
        </div>
      </div>
    </button>
  )
}

function MiniMenuList({ category, accent, compact = false }: { category?: MenuExtraction["categories"][number]; accent: string; compact?: boolean }) {
  if (!category) return null
  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <h4 className={`${compact ? "text-[8px]" : "text-[10px]"} font-black mb-1.5 uppercase tracking-wide opacity-90`} style={{ color: accent }}>{category.name}</h4>
      <div className="space-y-1.5 overflow-hidden">
        {category.items.slice(0, compact ? 4 : 6).map((item, i) => (
          <div key={i} className="flex items-baseline gap-1">
            <span className="truncate text-[7px] font-bold opacity-90">{item.name}</span>
            <span className="flex-1 border-b border-dotted border-current opacity-20" />
            <span className="text-[6px] font-mono font-bold" style={{ color: accent }}>{formatPrice(item)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MenusSaCinematicImport({ prefillUrl, preview = false, errorMessage, onError, onReady }: MenusSaCinematicImportProps) {
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

  // Coming from onboarding the URL is already known — auto-start the import so
  // the user doesn't have to paste/confirm a second time (fires once).
  useEffect(() => {
    if (prefillUrl && !autoStartedRef.current && stage === "idle") {
      autoStartedRef.current = true
      void start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillUrl])

  // Prevent background scrolling when full screen
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
    
    // 1. Trigger Fullscreen layout transition
    setIsFullscreen(true)
    
    // 2. Wait for dramatic expansion animation (matches CSS duration-1000)
    await sleep(800)
    
    setStage("discovering")
    
    await sleep(600)

    const inspectionResult = await inspectMenusSaImport({ url: trimmed })
    if (!inspectionResult.success || !inspectionResult.inspection) {
      setStage("idle")
      setIsFullscreen(false)
      onError(inspectionResult.error || "تعذر قراءة الرابط")
      return
    }

    setInspection(inspectionResult.inspection)
    setStage("logo")
    await sleep(800)
    setStage("theme")
    await sleep(800)
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
    await sleep(1200)
    setStage("variants")
  }

  const selected = VARIANTS.find((variant) => variant.id === selectedVariant) || VARIANTS[0]

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
      {/* 
        Dramatic Dark Backdrop for Fullscreen Mode 
        Fades in securely behind the modal, locking out interaction with the background.
      */}
      <div 
        className={`fixed inset-0 bg-[#020202] z-[100] transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFullscreen ? "opacity-100 pointer-events-auto backdrop-blur-sm" : "opacity-0 pointer-events-none"
        }`} 
      />

      {/* 
        Placeholder Block 
        Prevents layout collapse on the underlying page when the component becomes fixed.
      */}
      {isFullscreen && <div className="w-full h-[600px] animate-pulse rounded-[var(--radius-lg)] bg-gray-100/5 hidden md:block" />}

      {/* Main Orchestrator Wrapper */}
      <div 
        className={`
          ${isFullscreen 
            ? "fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto" 
            : "relative"}
        `}
      >
        <div 
          className={`
            relative bg-[#0A0A0A] text-white font-sans border border-white/5 mx-auto w-full overflow-hidden
            transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${isFullscreen 
              ? "max-w-[1500px] min-h-[90vh] rounded-[2rem] p-6 sm:p-10 lg:p-14 shadow-[0_0_120px_rgba(239,68,68,0.15)] ring-1 ring-white/10 flex flex-col justify-center" 
              : "rounded-[var(--radius-lg)] p-4 sm:p-6 lg:p-8 shadow-2xl"}
          `}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes scale-in { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
          `}} />
          
          {/* Animated Background Ambience */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
          <div className={`absolute transition-all duration-1000 ease-in-out pointer-events-none ${isFullscreen ? "-top-[10%] -right-[5%] w-[60%] h-[60%] bg-red-600/30 blur-[150px]" : "-top-[20%] -right-[10%] w-[50%] h-[50%] bg-red-600/20 blur-[120px] rounded-full"}`} />
          <div className={`absolute transition-all duration-1000 ease-in-out pointer-events-none ${isFullscreen ? "-bottom-[10%] -left-[5%] w-[60%] h-[60%] bg-red-600/20 blur-[150px]" : "-bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full"}`} />

          <div className={`relative z-10 grid gap-8 lg:gap-12 transition-all duration-1000 ${isFullscreen ? "lg:grid-cols-[1fr_1.3fr] items-center" : "lg:grid-cols-[0.85fr_1.15fr]"}`}>
            
            {/* Left/Top Section: Controls & Typography */}
            <section className="flex flex-col gap-10">
              <div className={`transition-all duration-1000 delay-300 ${isFullscreen ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100"}`}>
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-medium text-red-300 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {STRINGS.eyebrow}
                </div>
                <h1 className={`font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 transition-all duration-1000 ${isFullscreen ? "text-5xl sm:text-6xl max-w-2xl" : "text-4xl sm:text-5xl max-w-lg"}`}>
                  {STRINGS.title}
                </h1>
                <p className={`mt-5 text-base leading-relaxed text-white/50 transition-all duration-1000 ${isFullscreen ? "max-w-xl text-lg" : "max-w-md"}`}>
                  {STRINGS.subtitle}
                </p>
              </div>

              {/* Input Area */}
              <div className={`space-y-4 transition-all duration-700 ${isFullscreen ? "opacity-50 pointer-events-none scale-95 origin-right" : ""}`}>
                <div className="relative group/input" dir="ltr">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-500 rounded-xl blur opacity-20 group-focus-within/input:opacity-50 transition-opacity duration-500" />
                  <div className="relative flex flex-col sm:flex-row gap-2 bg-[#171411] border border-white/10 rounded-xl p-1.5 shadow-inner">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                      <input
                        type="url"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && !busy && start()}
                        placeholder={STRINGS.placeholder}
                        disabled={busy}
                        className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={start} 
                      disabled={busy || !url.trim()} 
                      className="h-12 px-6 bg-white text-black hover:bg-white/90 rounded-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all sm:w-auto w-full"
                    >
                      {busy ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Sparkles className="ml-2 h-4 w-4" />}
                      {STRINGS.start}
                    </Button>
                  </div>
                </div>
                {errorMessage ? <p className="text-sm text-red-400 font-medium px-2">{errorMessage}</p> : null}
              </div>

              <div className="mt-auto hidden lg:block">
                <Timeline stage={stage} />
              </div>
            </section>

            {/* Right/Bottom Section: Live Data & Visuals */}
            <section className="flex flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <BrandPanel inspection={inspection} stage={stage} />
                <DataPanel inspection={inspection} extraction={extraction} stage={stage} />
              </div>
              
              <div className="lg:hidden">
                <Timeline stage={stage} />
              </div>

              <div className={`rounded-[var(--radius-lg)] border border-white/10 bg-[#171411]/80 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden transition-all duration-1000 ${isFullscreen ? "p-8" : ""}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
                
                <div className="flex items-end justify-between gap-4 mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Layers3 className="h-5 w-5 text-white/70" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-white">اتجاهات التصميم</h2>
                      <p className="text-xs text-white/50 mt-1">{extraction ? STRINGS.renderDone : "ستُرسم المعاينات بمجرد اكتمال استخراج البيانات"}</p>
                    </div>
                  </div>
                </div>

                {extraction && stage === "variants" ? (
                  <div className="relative z-10">
                    {/* One-at-a-time slider: full preview in the middle, icon-only arrows around it */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6" dir="rtl">
                      <button
                        type="button"
                        aria-label="التصميم السابق"
                        onClick={() => {
                          const index = VARIANTS.findIndex((v) => v.id === selectedVariant)
                          setSelectedVariant(VARIANTS[(index - 1 + VARIANTS.length) % VARIANTS.length].id)
                        }}
                        className="h-11 w-11 shrink-0 grid place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all active:scale-90"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      <div
                        key={selected.id}
                        className={`w-full ${isFullscreen ? "max-w-md" : "max-w-sm"} animate-[scale-in_0.45s_cubic-bezier(0.22,1,0.36,1)]`}
                      >
                        <VariantPreview
                          variant={selected}
                          extraction={extraction}
                          selected
                          onSelect={() => {}}
                          index={0}
                        />
                      </div>

                      <button
                        type="button"
                        aria-label="التصميم التالي"
                        onClick={() => {
                          const index = VARIANTS.findIndex((v) => v.id === selectedVariant)
                          setSelectedVariant(VARIANTS[(index + 1) % VARIANTS.length].id)
                        }}
                        className="h-11 w-11 shrink-0 grid place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all active:scale-90"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Position dots */}
                    <div className="mt-5 flex items-center justify-center gap-2" dir="rtl">
                      {VARIANTS.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          aria-label={variant.name}
                          onClick={() => setSelectedVariant(variant.id)}
                          className={`rounded-full transition-all duration-300 ${
                            variant.id === selectedVariant
                              ? "h-2 w-6 bg-red-500"
                              : "h-2 w-2 bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 opacity-30">
                    <div className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-white/5" />
                    <div className={`w-full ${isFullscreen ? "max-w-md" : "max-w-sm"} aspect-[3/4] rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 flex flex-col`}>
                      <div className="h-full rounded-md border border-white/5 bg-black/20 animate-pulse" />
                      <div className="mt-4 h-4 w-1/2 bg-white/10 rounded animate-pulse" />
                      <div className="mt-2 h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-white/5" />
                  </div>
                )}

                {stage === "variants" && extraction ? (
                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10 animate-[fade-in_1s_ease-out]">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <Palette className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">الاتجاه المختار</p>
                        <p className="font-bold text-white">{selected.name}</p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      onClick={continueToReview} 
                      className="h-12 px-8 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:scale-105 active:scale-95"
                    >
                      {STRINGS.continue}
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}