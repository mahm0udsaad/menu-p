"use client"

import React, { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import { pdf } from "@react-pdf/renderer"
import { toDataURL } from "qrcode"
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ImageIcon,
  Link2,
  Loader2,
  QrCode,
  SlidersHorizontal,
  Type,
} from "lucide-react"
import { toast } from "sonner"

import { generateAndSaveQrCardPdf } from "@/lib/actions/qr-card-actions"
import {
  qrCardTemplates,
  type QrCardTemplateId,
} from "@/components/qr-card-templates"
import {
  QrTemplateExampleCard,
  qrTemplatePreviewPresets,
} from "@/components/qr-card-template-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
}

export interface QrPublishedMenu {
  id: string
  menu_name: string
  created_at: string
  language_code?: string | null
}

interface QrCardGeneratorProps {
  restaurant: Restaurant
  publishedMenus: QrPublishedMenu[]
  initialMenuId?: string
  menuPublicUrl?: string
}

type LogoPosition = "none" | "top" | "middle" | "both"

const logoOptions: Array<{ value: LogoPosition; label: string }> = [
  { value: "top", label: "أعلى البطاقة" },
  { value: "middle", label: "داخل الكود" },
  { value: "both", label: "كلاهما" },
  { value: "none", label: "بدون شعار" },
]

function menuUrl(menuId: string, fallback?: string) {
  if (!menuId) return fallback ?? ""
  const configuredBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  const base = configuredBase || (typeof window !== "undefined" ? window.location.origin : "")
  if (!base) return fallback ?? `/menus/${menuId}`
  return new URL(`/menus/${menuId}`, base).toString()
}

async function generateQrCodeDataUrl(url: string) {
  if (!url) throw new Error("Missing menu URL")
  return toDataURL(url, {
    width: 1000,
    margin: 3,
    errorCorrectionLevel: "H",
    color: { dark: "#111111", light: "#FFFFFF" },
  })
}

export default function QrCardGenerator({
  restaurant,
  publishedMenus,
  initialMenuId,
  menuPublicUrl,
}: QrCardGeneratorProps) {
  const firstMenuId = publishedMenus.some((menu) => menu.id === initialMenuId)
    ? initialMenuId!
    : publishedMenus[0]?.id ?? ""

  const [selectedMenuId, setSelectedMenuId] = useState(firstMenuId)
  const [customText, setCustomText] = useState("امسح الكود لتصفح قائمتنا واطلب بكل سهولة")
  const [cardName, setCardName] = useState(`بطاقة QR - ${restaurant.name}`)
  const [selectedTemplate, setSelectedTemplate] = useState<QrCardTemplateId>("classic")
  const [cardBgColor, setCardBgColor] = useState("#F7F0E4")
  const [textColor, setTextColor] = useState("#2C2118")
  const [borderColor, setBorderColor] = useState("#DDC9A6")
  const [showBorder, setShowBorder] = useState(true)
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top")
  const [qrCodeSize, setQrCodeSize] = useState(190)
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useActionState(generateAndSaveQrCardPdf, null)

  const selectedMenu = useMemo(
    () => publishedMenus.find((menu) => menu.id === selectedMenuId),
    [publishedMenus, selectedMenuId],
  )
  const selectedMenuUrl = menuUrl(selectedMenuId, menuPublicUrl)
  const previewSize = Math.max(118, Math.min(176, Math.round(qrCodeSize * 0.78)))

  useEffect(() => {
    let cancelled = false
    setPreviewError(false)

    generateQrCodeDataUrl(selectedMenuUrl)
      .then((dataUrl) => {
        if (!cancelled) setPreviewQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewQrDataUrl(null)
          setPreviewError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedMenuUrl])

  const applyTemplatePreset = (templateId: QrCardTemplateId) => {
    const preset = qrTemplatePreviewPresets[templateId]
    setSelectedTemplate(templateId)
    setCardBgColor(preset.bg)
    setTextColor(preset.text)
    setBorderColor(preset.border)
    setShowBorder(preset.borderOn)
    setLogoPosition(preset.logo)
  }

  const handleMenuSelection = (menuId: string) => {
    const menu = publishedMenus.find((item) => item.id === menuId)
    setSelectedMenuId(menuId)
    if (menu) setCardName(`بطاقة QR - ${menu.menu_name}`)
  }

  const copyMenuUrl = async () => {
    await navigator.clipboard.writeText(selectedMenuUrl)
    toast.success("تم نسخ رابط القائمة")
  }

  const handleGeneratePdf = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedMenuId || !selectedMenu || !previewQrDataUrl) {
      toast.error("اختر قائمة منشورة وانتظر حتى يجهز كود QR")
      return
    }

    startTransition(async () => {
      try {
        const template = qrCardTemplates.find((item) => item.id === selectedTemplate) ?? qrCardTemplates[0]
        const options = {
          customText: customText.trim(),
          cardBgColor,
          textColor,
          qrCodeSize,
          showBorder,
          borderColor,
          logoPosition,
          templateId: selectedTemplate,
        }

        const document = React.createElement(template.Component, {
            restaurant,
            qrCodeUrl: selectedMenuUrl,
            qrCodeDataUrl: previewQrDataUrl,
            options,
          })
        const pdfBlob = await pdf(
          document as React.ReactElement<React.ComponentProps<typeof import("@react-pdf/renderer").Document>>,
        ).toBlob()

        const formData = new FormData()
        formData.append("pdfFile", pdfBlob, `${cardName.trim() || "QR Card"}.pdf`)
        formData.append("restaurantId", restaurant.id)
        formData.append("cardName", cardName.trim() || "QR Card")
        formData.append("qrCodeUrl", selectedMenuUrl)
        formData.append("customText", customText.trim())
        formData.append("menuId", selectedMenuId)
        formData.append(
          "cardOptions",
          JSON.stringify({
            ...options,
            restaurantName: restaurant.name,
            restaurantLogoUrl: restaurant.logo_url,
          }),
        )

        await formAction(formData)
      } catch (error) {
        console.error("QR card generation failed:", error)
        toast.error("تعذر إنشاء ملف البطاقة. حاول مرة أخرى.")
      }
    })
  }

  if (publishedMenus.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[#eadfd7] bg-white px-6 py-14 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f8eeeb] text-[#a53b32]">
          <QrCode className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#241f1b]">انشر قائمة أولاً</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#746b64]">
          بطاقة QR يجب أن ترتبط بقائمة منشورة. ارجع إلى محرر القائمة وانشرها، ثم ستظهر هنا مباشرة.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleGeneratePdf} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]" dir="rtl">
      <div className="min-w-0 space-y-5">
        <section className="rounded-[var(--radius-lg)] border border-[#e8e2dc] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[#f8eeeb] text-[#a53b32]">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#241f1b]">1. اختر القائمة</h2>
              <p className="mt-1 text-sm text-[#746b64]">هذا هو الرابط الذي سيفتحه العميل عند المسح.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <Label htmlFor="menu-select" className="text-[#3b342f]">القائمة المنشورة</Label>
              <Select value={selectedMenuId} onValueChange={handleMenuSelection}>
                <SelectTrigger id="menu-select" className="h-11 rounded-[var(--radius-md)] border-[#d9d0c8]">
                  <SelectValue placeholder="اختر قائمة" />
                </SelectTrigger>
                <SelectContent>
                  {publishedMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.menu_name}
                      {menu.language_code ? ` · ${menu.language_code.toUpperCase()}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button type="button" variant="outline" className="h-11 rounded-[var(--radius-md)]" onClick={copyMenuUrl}>
                <Copy className="ml-2 h-4 w-4" />
                نسخ
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-[var(--radius-md)]" asChild>
                <a href={selectedMenuUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="ml-2 h-4 w-4" />
                  اختبار
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] bg-[#f7f6f4] px-3 py-2 text-xs text-[#746b64]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2d7b57]" />
            <span className="truncate" dir="ltr">{selectedMenuUrl}</span>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[#e8e2dc] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[#f8eeeb] text-[#a53b32]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#241f1b]">2. اختر التصميم</h2>
              <p className="mt-1 text-sm text-[#746b64]">قوالب واضحة للطباعة ومصممة لإبراز شعار المطعم.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {qrCardTemplates.map((template) => (
              <QrTemplateExampleCard
                key={template.id}
                templateId={template.id}
                name={template.name}
                restaurantName={restaurant.name}
                selected={selectedTemplate === template.id}
                compact
                onClick={() => applyTemplatePreset(template.id)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[#e8e2dc] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[#f8eeeb] text-[#a53b32]">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#241f1b]">3. خصّص البطاقة</h2>
              <p className="mt-1 text-sm text-[#746b64]">عدّل النص والألوان والحجم، وستتحدث المعاينة فوراً.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="card-name" className="text-[#3b342f]">اسم الملف</Label>
              <Input
                id="card-name"
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
                className="h-11 rounded-[var(--radius-md)] border-[#d9d0c8]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="custom-text" className="flex items-center justify-between text-[#3b342f]">
                <span className="flex items-center gap-2"><Type className="h-4 w-4" /> النص الظاهر للعميل</span>
                <span className="text-xs font-normal text-[#8a817a]">{customText.length}/90</span>
              </Label>
              <Textarea
                id="custom-text"
                maxLength={90}
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                className="min-h-[88px] resize-none rounded-[var(--radius-md)] border-[#d9d0c8]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[#3b342f]">موضع الشعار</Label>
              <div className="grid grid-cols-2 gap-2">
                {logoOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLogoPosition(option.value)}
                    className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      logoPosition === option.value
                        ? "border-[#a53b32] bg-[#f8eeeb] text-[#8e3028]"
                        : "border-[#ded7d0] bg-white text-[#625a54] hover:bg-[#f7f6f4]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[#3b342f]">حجم كود QR</Label>
                <span className="rounded-full bg-[#f2efec] px-2.5 py-1 text-xs font-bold text-[#5e554e]">
                  {qrCodeSize}px
                </span>
              </div>
              <Slider
                min={150}
                max={230}
                step={10}
                value={[qrCodeSize]}
                onValueChange={([value]) => setQrCodeSize(value)}
                aria-label="حجم كود QR"
              />
              <div className="flex justify-between text-xs text-[#8a817a]">
                <span>مدمج</span>
                <span>كبير للطباعة</span>
              </div>
            </div>

            <ColorControl label="لون الخلفية" value={cardBgColor} onChange={setCardBgColor} />
            <ColorControl label="لون النص" value={textColor} onChange={setTextColor} />

            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[#ded7d0] p-3 md:col-span-2">
              <div>
                <Label htmlFor="card-border" className="text-[#3b342f]">إطار البطاقة</Label>
                <p className="mt-1 text-xs text-[#8a817a]">إطار هادئ يساعد التصميم عند الطباعة على خلفية بيضاء.</p>
              </div>
              <div className="flex items-center gap-3">
                {showBorder ? (
                  <input
                    aria-label="لون إطار البطاقة"
                    type="color"
                    value={borderColor}
                    onChange={(event) => setBorderColor(event.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-[var(--radius-sm)] border border-[#d9d0c8] bg-white p-1"
                  />
                ) : null}
                <Switch id="card-border" checked={showBorder} onCheckedChange={setShowBorder} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-[var(--radius-lg)] border border-[#ded8d1] bg-[#f2efeb] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#241f1b]">معاينة الطباعة</h2>
              <p className="mt-1 text-xs text-[#746b64]">مقاس A6 · جاهز للطاولات والكاشير</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#5d554e]">LIVE</span>
          </div>

          <div
            className="relative mx-auto flex aspect-[0.707] w-full max-w-[330px] flex-col items-center justify-center overflow-hidden rounded-[var(--radius-lg)] px-8 py-9 text-center"
            style={{
              backgroundColor: cardBgColor,
              color: textColor,
              border: showBorder ? `2px solid ${borderColor}` : "1px solid rgba(0,0,0,.08)",
            }}
          >
            {selectedTemplate === "elegant" ? (
              <>
                <span className="absolute right-4 top-4 h-8 w-8 border-r border-t" style={{ borderColor }} />
                <span className="absolute bottom-4 left-4 h-8 w-8 border-b border-l" style={{ borderColor }} />
              </>
            ) : null}

            {(logoPosition === "top" || logoPosition === "both") ? (
              restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} logo`}
                  className="mb-4 h-16 w-16 object-contain"
                />
              ) : (
                <div
                  className="mb-4 grid h-16 w-16 place-items-center rounded-[var(--radius-md)] border text-2xl font-black"
                  style={{ borderColor }}
                >
                  {restaurant.name.trim().slice(0, 1)}
                </div>
              )
            ) : null}

            <div className="text-[10px] font-bold tracking-[0.28em] opacity-70">DIGITAL MENU</div>
            <div className="mt-2 max-w-full truncate text-xl font-black">{restaurant.name}</div>
            <div className="my-4 h-0.5 w-11" style={{ backgroundColor: borderColor }} />

            <div className="relative rounded-[var(--radius-lg)] bg-white p-3">
              {previewQrDataUrl ? (
                <img
                  src={previewQrDataUrl}
                  alt="معاينة كود QR"
                  width={previewSize}
                  height={previewSize}
                  style={{ width: previewSize, height: previewSize }}
                />
              ) : (
                <div className="grid h-36 w-36 place-items-center text-[#7d746d]">
                  {previewError ? <QrCode className="h-8 w-8" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
              )}
              {(logoPosition === "middle" || logoPosition === "both") && restaurant.logo_url ? (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="rounded-[var(--radius-sm)] bg-white p-1.5">
                    <img src={restaurant.logo_url} alt="" className="h-9 w-9 object-contain" />
                  </div>
                </div>
              ) : null}
            </div>

            <p className="mt-5 max-w-[250px] text-sm font-bold leading-6">{customText}</p>
            <div className="absolute bottom-4 text-[9px] font-bold tracking-[0.18em] opacity-50">POWERED BY MENU-P</div>
          </div>

          <Button
            type="submit"
            disabled={isPending || !previewQrDataUrl}
            className="mt-5 h-12 w-full rounded-[var(--radius-md)] bg-[#171513] text-white hover:bg-[#2b2825]"
          >
            {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
            {isPending ? "جاري تجهيز الملف..." : "حفظ وتحميل بطاقة PDF"}
          </Button>

          {state?.pdfUrl ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-[#b9dac8] bg-[#eef8f2] p-3 text-[#225f42]">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Check className="h-4 w-4" />
                البطاقة جاهزة للاستخدام
              </div>
              <Button size="sm" className="mt-3 w-full bg-[#286f4e] text-white hover:bg-[#225f42]" asChild>
                <a href={state.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="ml-2 h-4 w-4" />
                  فتح ملف PDF
                </a>
              </Button>
            </div>
          ) : null}

          {state?.error ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-[#e6c5bf] bg-[#fff3f1] p-3 text-sm text-[#973b32]">
              {state.error}
            </div>
          ) : null}
        </div>
      </aside>
    </form>
  )
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[#3b342f]">{label}</Label>
      <div className="flex h-11 items-center gap-3 rounded-[var(--radius-md)] border border-[#d9d0c8] bg-white px-3">
        <input
          aria-label={label}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-8 cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent p-0"
        />
        <span className="font-mono text-xs text-[#625a54]" dir="ltr">{value.toUpperCase()}</span>
      </div>
    </div>
  )
}
