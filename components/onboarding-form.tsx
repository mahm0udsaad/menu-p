"use client"

import type React from "react"
import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Upload,
  Loader2,
  Coffee,
  UtensilsCrossed,
  Building2,
  QrCode,
  ArrowLeft,
  ArrowRight,
  Check,
  Link2,
  Sparkles,
  PenLine,
  Palette,
  CreditCard,
  FileImage,
} from "lucide-react"
import { onboardRestaurant } from "@/lib/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import MenusSaCinematicImport from "@/components/menu-import/menus-sa-cinematic-import"
import type { MenuExtraction } from "@/lib/ai/menu-extraction-utils"

const colorPalettes = [
  { id: "rose", name: "وردي أنيق", preview: ["#e11d48", "#be185d", "#f43f5e", "#fda4af"] },
  { id: "red", name: "أحمر ملكي", preview: ["#dc2626", "#b91c1c", "#ef4444", "#fca5a5"] },
  { id: "amber", name: "عنبري دافئ", preview: ["#f59e0b", "#d97706", "#fbbf24", "#fde68a"] },
  { id: "emerald", name: "زمردي كلاسيكي", preview: ["#10b981", "#059669", "#34d399", "#a7f3d0"] },
  { id: "blue", name: "أزرق احترافي", preview: ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd"] },
  { id: "purple", name: "بنفسجي ملكي", preview: ["#8b5cf6", "#7c3aed", "#a78bfa", "#c4b5fd"] },
  { id: "teal", name: "تيل عصري", preview: ["#14b8a6", "#0d9488", "#2dd4bf", "#7dd3fc"] },
]

const currencies = [
  { code: "EGP", name: "جنيه مصري", symbol: "ج.م" },
  { code: "SAR", name: "ريال سعودي", symbol: "ر.س" },
  { code: "AED", name: "درهم إماراتي", symbol: "د.إ" },
  { code: "USD", name: "دولار أمريكي", symbol: "$" },
  { code: "EUR", name: "يورو", symbol: "€" },
  { code: "QAR", name: "ريال قطري", symbol: "ر.ق" },
  { code: "KWD", name: "دينار كويتي", symbol: "د.ك" },
  { code: "BHD", name: "دينار بحريني", symbol: "د.ب" },
  { code: "OMR", name: "ريال عماني", symbol: "ر.ع" },
  { code: "JOD", name: "دينار أردني", symbol: "د.أ" },
  { code: "LBP", name: "ليرة لبنانية", symbol: "ل.ل" },
]

const categories = [
  { id: "restaurant", name: "مطعم", description: "تجربة طعام كاملة", icon: UtensilsCrossed },
  { id: "cafe", name: "مقهى", description: "قهوة ومعجنات", icon: Coffee },
  { id: "bakery", name: "مخبز", description: "خبز ومعجنات طازجة", icon: Building2 },
]

const steps = [
  { id: 0, title: "مصدر القائمة" },
  { id: 1, title: "معلومات المطعم" },
  { id: 2, title: "المظهر والعملة" },
  { id: 3, title: "الشعار والإنهاء" },
]

function closestPalette(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  let best = colorPalettes[0].id
  let bestDist = Infinity
  for (const p of colorPalettes) {
    const pr = parseInt(p.preview[0].slice(1, 3), 16)
    const pg = parseInt(p.preview[0].slice(3, 5), 16)
    const pb = parseInt(p.preview[0].slice(5, 7), 16)
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if (dist < bestDist) {
      bestDist = dist
      best = p.id
    }
  }
  return best
}

function guessCurrencyFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.endsWith(".sa") || host.includes("menus-sa")) return "SAR"
  } catch {}
  return "SAR"
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
    >
      {pending ? (
        <>
          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
          جاري الإعداد...
        </>
      ) : (
        <>
          <Check className="ml-2 h-5 w-5" />
          إنشاء القائمة
        </>
      )}
    </Button>
  )
}

export default function OnboardingForm() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("restaurant")
  const [selectedPalette, setSelectedPalette] = useState("rose")
  const [selectedCurrency, setSelectedCurrency] = useState("EGP")
  const [logoName, setLogoName] = useState<string | null>(null)
  const [state, formAction] = useActionState(onboardRestaurant, { error: "" })

  // URL import state — the cinematic component does the actual work (preview
  // mode, no DB writes); we only validate the URL and collect its results.
  const [menusSaUrl, setMenusSaUrl] = useState("")
  const [externalLogoUrl, setExternalLogoUrl] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importedFromUrl, setImportedFromUrl] = useState(false)
  const [showCinematic, setShowCinematic] = useState(false)
  const [cinematicError, setCinematicError] = useState<string | null>(null)
  const [importJson, setImportJson] = useState<string | null>(null)
  const [templateId, setTemplateId] = useState<string>("mena-hospitality")
  const [variantId, setVariantId] = useState<string>("hospitality")

  const canContinue = step === 1 ? name.trim().length > 0 : true

  const handleUrlImport = () => {
    const trimmed = menusSaUrl.trim()
    setParseError(null)

    if (!/^https?:\/\//i.test(trimmed)) {
      setParseError("أدخل رابط صالح يبدأ بـ http أو https")
      return
    }

    try {
      const host = new URL(trimmed).hostname.toLowerCase()
      if (host !== "menus-sa.com" && !host.endsWith(".menus-sa.com")) {
        setParseError("أدخل رابط من menus-sa.com")
        return
      }
    } catch {
      setParseError("رابط غير صالح")
      return
    }

    setCinematicError(null)
    setShowCinematic(true)
  }

  const handleCinematicReady = (payload: {
    jobId: string | null
    extraction: MenuExtraction
    inspection: { restaurantName: string; logoUrl: string | null; theme: { primary: string } } | null
    templateId: string
    logoUrl: string | null
    variantId: string
  }) => {
    // Sanitize down to exactly what onboardRestaurant's schema expects —
    // extraction objects carry extra fields (confidence, flags, odd image
    // URLs) that must not be able to fail server-side validation.
    const toPrice = (p: unknown): number | null => {
      const n = typeof p === "number" ? p : typeof p === "string" ? Number(p) : NaN
      return Number.isFinite(n) && n >= 0 ? n : null
    }
    const clean = {
      categories: payload.extraction.categories
        .map((cat) => ({
          name: (cat.name || "").slice(0, 300),
          description: cat.description ? String(cat.description).slice(0, 2000) : null,
          items: cat.items
            .filter((item) => item.name && item.name.trim().length > 0)
            .map((item) => ({
              name: item.name.slice(0, 300),
              description: item.description ? String(item.description).slice(0, 2000) : null,
              price: toPrice(item.price),
              image_url: item.image_url ? String(item.image_url).slice(0, 2000) : null,
              currency: item.currency ? String(item.currency).slice(0, 10) : null,
            })),
        }))
        .filter((cat) => cat.name.trim().length > 0 && cat.items.length > 0),
    }
    setImportJson(clean.categories.length > 0 ? JSON.stringify(clean) : null)
    setTemplateId(payload.templateId)
    setVariantId(payload.variantId)
    if (payload.inspection?.restaurantName) setName(payload.inspection.restaurantName)
    if (payload.logoUrl) setExternalLogoUrl(payload.logoUrl)
    if (payload.inspection?.theme?.primary) {
      setSelectedPalette(closestPalette(payload.inspection.theme.primary))
    }
    setSelectedCurrency(guessCurrencyFromUrl(menusSaUrl))
    setImportedFromUrl(true)
    setShowCinematic(false)
    setStep(1)
  }

  const visibleSteps = importedFromUrl ? steps : steps.filter((s) => s.id > 0)
  const currentStepProgress = importedFromUrl ? step : step - 1
  const totalSteps = importedFromUrl ? 4 : 3
  const progressPercent = Math.max(0, (currentStepProgress / (totalSteps - 1)) * 100)

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 md:p-8 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
        }
        .step-container {
          animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <div className={`w-full ${showCinematic ? 'max-w-[1500px]' : step === 0 ? 'max-w-4xl' : 'max-w-2xl'} transition-all duration-500 ease-in-out`}>
        
        {/* Header - Only outside the card on > step 0 */}
        {step > 0 && (
          <div className="text-center mb-8 step-container">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
              <QrCode className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إعداد القائمة</h1>
            <p className="text-gray-500 mt-2 text-sm">
              خطوات بسيطة وتكون قائمتك جاهزة
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {step > 0 && (
          <div className="mb-8 step-container" dir="rtl">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 right-0 h-full bg-red-600 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 px-1">
              {visibleSteps.map((s, i) => {
                const isActive = step === s.id
                const isPast = step > s.id
                return (
                  <div key={s.id} className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'text-red-600' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.title}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cinematic takeover: paste URL → watch extraction → pick design → land on prefilled step 1 */}
        {showCinematic && (
          <div className="step-container space-y-4">
            <button
              type="button"
              onClick={() => setShowCinematic(false)}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              dir="rtl"
            >
              <ArrowRight className="h-4 w-4" />
              الرجوع لاختيار المصدر
            </button>
            <MenusSaCinematicImport
              preview
              prefillUrl={menusSaUrl.trim()}
              errorMessage={cinematicError}
              onError={setCinematicError}
              onReady={handleCinematicReady}
            />
          </div>
        )}

        <div className={showCinematic ? "hidden" : "bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative"}>

          {state?.error && (
            <div className="bg-red-50/50 border-b border-red-100 p-4">
              <p className="text-red-600 text-center text-sm font-medium">{state.error}</p>
            </div>
          )}

          {/* Step 0: Source choice - Split Layout */}
          {step === 0 && (
            <div className="grid md:grid-cols-2 min-h-[500px]" dir="rtl">
              {/* Right Side: Action */}
              <div className="p-8 md:p-12 flex flex-col justify-center bg-white order-2 md:order-1">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm border border-red-100 mb-6">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">مرحباً بك في Menu-P</h1>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    المنصة الأولى لتحويل قوائم الطعام إلى تجربة رقمية تفاعلية. ابدأ باستيراد قائمتك الحالية أو أنشئ واحدة جديدة كلياً.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Magic Import */}
                  <div className="group relative bg-white border border-gray-200 rounded-2xl p-1 transition-all hover:border-violet-300 hover:shadow-md focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 p-2 shadow-sm">
                          <Image src="/partners/menus-sa-logo.png" alt="menus-sa" width={48} height={48} className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 text-lg">استيراد من menus-sa</h2>
                          <p className="text-sm text-gray-500 mt-0.5">أدخل رابط القائمة الخاص بك لنقل البيانات تلقائياً.</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <div className="relative group/input">
                          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within/input:text-violet-500 transition-colors z-10" />
                          <input
                            type="url"
                            dir="ltr"
                            value={menusSaUrl}
                            onChange={(e) => setMenusSaUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                            placeholder="https://your-store.menus-sa.com/ar"
                            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-left"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleUrlImport}
                          disabled={!menusSaUrl.trim()}
                          className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white text-base font-bold rounded-xl shadow-sm transition-all"
                        >
                          <Sparkles className="h-5 w-5 ml-2" />
                          استيراد البيانات
                        </Button>
                      </div>
                      {parseError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-right" dir="rtl">
                          <p className="text-sm text-red-600 font-medium">{parseError}</p>
                        </div>
                      )}
                    </div>
                    
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-4 text-gray-400">أو</span>
                    </div>
                  </div>

                  {/* Manual Option */}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-all text-right group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                        <PenLine className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 text-sm">البدء من الصفر</h2>
                        <p className="text-xs text-gray-500">إدخال البيانات يدوياً خطوة بخطوة</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                      <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Left Side: Visual / Value Prop */}
              <div className="hidden md:flex bg-gray-50 order-1 md:order-2 relative overflow-hidden flex-col items-center justify-center p-12 text-center border-r border-gray-100">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400/20 rounded-full blur-3xl" />
                
                <div className="relative z-10 w-full max-w-sm">
                  {/* Floating Elements Animation */}
                  <div className="relative h-64 mb-8">
                    <div className="absolute top-0 right-10 w-32 h-40 bg-white rounded-xl shadow-lg border border-gray-100 rotate-12 transform hover:rotate-6 transition-transform duration-500 p-3 flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-100" />
                      <div className="h-2 w-16 bg-gray-100 rounded" />
                      <div className="h-2 w-20 bg-gray-100 rounded" />
                      <div className="mt-auto h-8 w-full bg-gray-50 rounded-lg" />
                    </div>
                    <div className="absolute top-10 left-4 w-40 h-48 bg-white rounded-xl shadow-xl border border-gray-100 -rotate-6 transform hover:rotate-0 transition-transform duration-500 p-4 z-10">
                      <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
                      <div className="space-y-3">
                        <div className="flex gap-2 items-center"><div className="w-6 h-6 bg-gray-100 rounded" /><div className="flex-1"><div className="h-2 w-full bg-gray-100 rounded mb-1"/><div className="h-1.5 w-1/2 bg-gray-100 rounded"/></div></div>
                        <div className="flex gap-2 items-center"><div className="w-6 h-6 bg-gray-100 rounded" /><div className="flex-1"><div className="h-2 w-full bg-gray-100 rounded mb-1"/><div className="h-1.5 w-1/2 bg-gray-100 rounded"/></div></div>
                        <div className="flex gap-2 items-center"><div className="w-6 h-6 bg-gray-100 rounded" /><div className="flex-1"><div className="h-2 w-full bg-gray-100 rounded mb-1"/><div className="h-1.5 w-1/2 bg-gray-100 rounded"/></div></div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">قوائم طعام تنبض بالحياة</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    صمم قائمة طعام احترافية تعكس هوية مطعمك في دقائق. احصل على رمز QR وتصميمات PDF جاهزة للطباعة.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form action={formAction} className={step > 0 ? "p-6 md:p-8" : "hidden"}>
            {/* Hidden fields for URL import data — onboardRestaurant persists the
                extraction (categories/items/job) right after creating the restaurant */}
            {externalLogoUrl && <input type="hidden" name="logo_url" value={externalLogoUrl} />}
            {importedFromUrl && menusSaUrl && <input type="hidden" name="menus_sa_url" value={menusSaUrl.trim()} />}
            {importJson && <input type="hidden" name="import_payload" value={importJson} />}
            {importJson && <input type="hidden" name="template_id" value={templateId} />}
            {importJson && <input type="hidden" name="variant_id" value={variantId} />}

            {/* Step 1: Restaurant info */}
            <div className={`step-container space-y-8 ${step === 1 ? 'block' : 'hidden'}`} dir="rtl">
              
              {importedFromUrl && externalLogoUrl && (
                <div className="flex items-center gap-4 p-4 bg-violet-50/50 border border-violet-100 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl border border-violet-100 bg-white p-1 shadow-sm flex-shrink-0">
                    <img src={externalLogoUrl} alt="" className="h-full w-full object-contain rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-violet-600" />
                      <p className="text-sm font-bold text-violet-900">سحب سحري ناجح</p>
                    </div>
                    <p className="text-xs text-violet-600/80">تم تعبئة البيانات مسبقاً. يمكنك المراجعة والتعديل.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="name" className="text-gray-900 font-semibold text-sm">
                  اسم المطعم <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="مثال: مطعم البيك"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white text-base px-4 transition-colors"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-gray-900 font-semibold text-sm">نوع النشاط <span className="text-red-500">*</span></Label>
                <RadioGroup
                  name="category"
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                      <Label
                        htmlFor={cat.id}
                        className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${
                          selectedCategory === cat.id
                            ? "border-red-600 bg-red-50/30 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg shrink-0 ${selectedCategory === cat.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          <cat.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className={`block font-bold text-sm mb-1 ${selectedCategory === cat.id ? 'text-gray-900' : 'text-gray-700'}`}>{cat.name}</span>
                          <span className="text-xs text-gray-500 block leading-tight">{cat.description}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-gray-900 font-semibold text-sm">
                    العنوان <span className="text-gray-400 font-normal text-xs">(اختياري)</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="المدينة، الشارع"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-gray-900 font-semibold text-sm">
                    رقم الهاتف <span className="text-gray-400 font-normal text-xs">(اختياري)</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+966 5X XXX XXXX"
                    dir="ltr"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white text-left"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Appearance & currency */}
            <div className={`step-container space-y-8 ${step === 2 ? 'block' : 'hidden'}`} dir="rtl">
              <div className="space-y-3">
                <Label className="text-gray-900 font-semibold text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-500" /> الألوان الأساسية
                </Label>
                <RadioGroup
                  name="color_palette"
                  value={selectedPalette}
                  onValueChange={setSelectedPalette}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {colorPalettes.map((palette) => (
                    <div key={palette.id}>
                      <RadioGroupItem value={palette.id} id={palette.id} className="sr-only" />
                      <Label
                        htmlFor={palette.id}
                        className={`flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border-2 transition-all ${
                          selectedPalette === palette.id
                            ? "border-red-600 bg-red-50/30 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex -space-x-1 space-x-reverse">
                          {palette.preview.slice(0, 3).map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color, zIndex: 3 - index }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{palette.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label className="text-gray-900 font-semibold text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" /> عملة القائمة
                </Label>
                <Select name="currency" value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-full h-14 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-base">
                    <SelectValue placeholder="اختر العملة" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-medium">{currency.name}</span>
                          <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded mr-2" dir="ltr">{currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 3: Logo & finish */}
            <div className={`step-container space-y-8 ${step === 3 ? 'block' : 'hidden'}`} dir="rtl">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-gray-900 font-semibold text-sm flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-gray-500" /> شعار المطعم
                  </Label>
                  
                  {!externalLogoUrl ? (
                    <div className="relative border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-8 text-center hover:border-red-400 hover:bg-red-50/30 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      </div>
                      {logoName ? (
                        <p className="text-gray-900 font-bold text-sm bg-white inline-block px-3 py-1 rounded-full border border-gray-100 shadow-sm">{logoName}</p>
                      ) : (
                        <div>
                          <p className="text-gray-700 text-sm font-medium mb-1">
                            <span className="text-red-600">تصفح الملفات</span> أو اسحب الشعار هنا
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG, SVG حتى 5MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={() => setExternalLogoUrl(null)}
                          className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50"
                        >
                          تغيير الشعار
                        </button>
                      </div>
                      <div className="aspect-square max-h-48 w-full border border-gray-200 bg-white rounded-2xl p-4 flex items-center justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-0">
                          <Check className="w-3 h-3" /> مستورد
                        </div>
                        <img src={externalLogoUrl} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Card */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 blur-2xl" />
                  
                  <div className="relative z-10">
                    <p className="text-white/50 text-xs font-medium mb-4 uppercase tracking-widest" dir="ltr">PREVIEW</p>
                    <h3 className="text-2xl font-bold mb-1">{name || "اسم المطعم"}</h3>
                    <p className="text-white/60 text-sm">{categories.find((c) => c.id === selectedCategory)?.name}</p>
                  </div>

                  <div className="relative z-10 mt-8 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-white/50 text-xs">المظهر</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{colorPalettes.find((p) => p.id === selectedPalette)?.name}</span>
                        <div className="flex -space-x-1 space-x-reverse">
                          {colorPalettes.find((p) => p.id === selectedPalette)?.preview.slice(0, 2).map((color, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-gray-900" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-white/50 text-xs">العملة</span>
                      <span className="text-sm font-medium bg-white/10 px-2 py-0.5 rounded">{currencies.find((c) => c.code === selectedCurrency)?.symbol}</span>
                    </div>
                    {importedFromUrl && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-white/50 text-xs">المصدر</span>
                        <span className="text-xs font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> menus-sa
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            {step > 0 && (
              <div className="flex gap-3 pt-8 mt-8 border-t border-gray-100" dir="rtl">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                    className="py-6 px-4 sm:px-6 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                    <span className="hidden sm:inline">الخطوة السابقة</span>
                    <span className="sm:hidden">السابق</span>
                  </Button>
                )}
                {step === 1 && importedFromUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(0)}
                    className="py-6 px-4 sm:px-6 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                    الرجوع
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => setStep(step + 1)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-6 text-base rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    التالي
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                ) : (
                  <SubmitButton />
                )}
              </div>
            )}
          </form>
        </div>

        {step > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6 step-container flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> يمكنك تخصيص كل شيء لاحقاً من لوحة التحكم
          </p>
        )}
      </div>
    </div>
  )
}