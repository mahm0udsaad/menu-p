"use client"

import React, { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input" // Added Input for color pickers
import { Switch } from "@/components/ui/switch" // Added Switch for toggle
import { Loader2, Download, LinkIcon, Check } from "lucide-react"
import { generateAndSaveQrCardPdf } from "@/lib/actions/qr-card-actions" // New server action
import { useActionState } from "react"
// Add new imports for Select components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pdf } from "@react-pdf/renderer"
import { qrCardTemplates, QrCardTemplateId } from "@/components/qr-card-templates"
import { QrTemplateExampleCard, qrTemplatePreviewPresets } from "@/components/qr-card-template-preview"
import { fontOptions, resolveFontFamily } from "@/lib/font-config"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
}

interface PublishedMenu {
  id: string
  menu_name: string
  created_at: string
}

interface QrCardGeneratorProps {
  restaurant: Restaurant
  menuPublicUrl: string // The URL the QR code will point to - kept for backward compatibility
}

// Function to generate QR code using web API (same as server-side)
async function generateQrCodeDataUrl(url: string, size: number = 200): Promise<string> {
  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=png&ecc=H`
    
    const response = await fetch(qrApiUrl)
    if (!response.ok) {
      throw new Error(`QR API request failed: ${response.status}`)
    }
    
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export default function QrCardGenerator({ restaurant, menuPublicUrl }: QrCardGeneratorProps) {
  const [customText, setCustomText] = useState("امسح الكود لعرض قائمتنا الرقمية!")
  // Replace the existing useState for cardBgColor and textColor
  const [cardBgColor, setCardBgColor] = useState("#FFFFFF") // Default white
  const [textColor, setTextColor] = useState("#000000") // Default black
  // Add new state for logo position
  const [logoPosition, setLogoPosition] = useState("top") // Default to 'top'
  const [qrCodeSize, setQrCodeSize] = useState(200) // Default QR code size in pixels
  const [showBorder, setShowBorder] = useState(false) // Default no border
  const [borderColor, setBorderColor] = useState("#000000") // Default black border
  const [cardName, setCardName] = useState("QR Card")
  const [selectedTemplate, setSelectedTemplate] = useState<QrCardTemplateId>('classic')
  const [selectedFont, setSelectedFont] = useState<string>('cairo')
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useActionState(generateAndSaveQrCardPdf, null)
  // Add menu selection state
  const [publishedMenus, setPublishedMenus] = useState<PublishedMenu[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<string>("")
  const [selectedMenuUrl, setSelectedMenuUrl] = useState<string>(menuPublicUrl)
  const [loadingMenus, setLoadingMenus] = useState(false)
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Define predefined color options
  const colorOptions = [
    { name: "أبيض", value: "#FFFFFF" },
    { name: "أسود", value: "#000000" },
    { name: "رمادي فاتح", value: "#F3F4F6" },
    { name: "رمادي داكن", value: "#374151" },
    { name: "زمردي", value: "#10B981" },
    { name: "أحمر", value: "#EF4444" },
    { name: "أزرق", value: "#3B82F6" },
  ]

  // Define logo position options
  const logoPositionOptions = [
    { name: "لا يوجد", value: "none" },
    { name: "أعلى البطاقة", value: "top" },
    { name: "منتصف كود QR", value: "middle" },
    { name: "كلاهما (أعلى ومنتصف)", value: "both" },
  ]

  const applyTemplatePreset = (templateId: QrCardTemplateId) => {
    const preset = qrTemplatePreviewPresets[templateId]
    setSelectedTemplate(templateId)
    setCardBgColor(preset.bg)
    setTextColor(preset.text)
    setBorderColor(preset.border)
    setShowBorder(preset.borderOn)
    setLogoPosition(preset.logo)
  }

  // Fetch published menus when component mounts
  useEffect(() => {
    fetchPublishedMenus()
  }, [restaurant.id])

  const fetchPublishedMenus = async () => {
    try {
      setLoadingMenus(true)
      
      const { data: menus, error } = await supabase
        .from("published_menus")
        .select("id, menu_name, created_at")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setPublishedMenus(menus || [])
      
      // Auto-select the first menu if available
      if (menus && menus.length > 0 && !selectedMenuId) {
        setSelectedMenuId(menus[0].id)
        setSelectedMenuUrl(`${window.location.origin}/menus/${menus[0].id}`)
      }
    } catch (error) {
      console.error("Error fetching published menus:", error)
      toast.error("فشل في تحميل القوائم المنشورة")
    } finally {
      setLoadingMenus(false)
    }
  }

  // Generate QR code preview whenever relevant settings change
  useEffect(() => {
    const updatePreview = async () => {
      try {
        const dataUrl = await generateQrCodeDataUrl(selectedMenuUrl || menuPublicUrl, qrCodeSize)
        setPreviewQrDataUrl(dataUrl)
      } catch (err) {
        setPreviewQrDataUrl(null)
      }
    }

    updatePreview()
  }, [selectedMenuUrl, menuPublicUrl, qrCodeSize, cardBgColor, textColor, logoPosition, showBorder, borderColor, selectedTemplate, selectedFont, customText])

  const handleMenuSelection = (menuId: string) => {
    setSelectedMenuId(menuId)
    const selectedMenu = publishedMenus.find(menu => menu.id === menuId)
    if (selectedMenu) {
      setSelectedMenuUrl(`${window.location.origin}/menus/${menuId}`)
      setCardName(`QR Card - ${selectedMenu.menu_name}`)
    }
  }

  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMenuId) {
      toast.error("يرجى اختيار قائمة أولاً")
      return
    }

    startTransition(async () => {
      try {
        // Use the selected menu URL instead of the default one
        const qrUrl = selectedMenuUrl || menuPublicUrl
        
        // Generate QR code data URL
        const qrCodeDataUrl = await generateQrCodeDataUrl(qrUrl, qrCodeSize)

        // Prepare restaurant data for PDF
        const restaurantData = {
          id: restaurant.id,
          name: restaurant.name,
          logo_url: restaurant.logo_url || undefined,
          color_palette: {
            primary: "#10b981",
            secondary: "#059669",
            accent: "#34d399"
          }
        }

        // Prepare QR card options
        const options = {
          customText,
          cardBgColor,
          textColor,
          qrCodeSize,
          showBorder,
          borderColor,
          logoPosition: logoPosition as 'none' | 'top' | 'middle' | 'both',
          fontFamily: selectedFont,
          templateId: selectedTemplate
        }

        // Generate PDF using React PDF (client-side)
        const pdfBlob = await pdf(
          React.createElement(
            qrCardTemplates.find(t => t.id === selectedTemplate)?.Component || qrCardTemplates[0].Component,
            {
              restaurant: restaurantData,
              qrCodeUrl: qrUrl,
              qrCodeDataUrl,
              options
            }
          )
        ).toBlob()

        // Create FormData to send to server action
        const formData = new FormData()
        formData.append("pdfFile", pdfBlob, `${cardName}.pdf`)
        formData.append("restaurantId", restaurant.id)
        formData.append("cardName", cardName)
        formData.append("qrCodeUrl", qrUrl)
        formData.append("customText", customText)
        formData.append("menuId", selectedMenuId) // Add menu ID for linking
        formData.append("cardOptions", JSON.stringify({
          cardBgColor,
          textColor,
          qrCodeSize,
          showBorder,
          borderColor,
          logoPosition,
          fontFamily: selectedFont,
          templateId: selectedTemplate,
          restaurantName: restaurant.name,
          restaurantLogoUrl: restaurant.logo_url
        }))

        // Call server action inside transition
        await formAction(formData)
      } catch (error: any) {
        console.error("PDF generation error:", error)
        // Handle error - you might want to show an error state
      }
    })
  }

  return (
    <Card className="overflow-hidden rounded-[18px] border-[#e8ded2] bg-white shadow-sm">
      <CardHeader className="border-b border-[#eee4d8] bg-[#fbf8f4] px-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-[#2f2923] sm:text-xl">إنشاء بطاقة QR قابلة للطباعة</CardTitle>
            <CardDescription className="mt-1 text-sm text-[#827466] sm:text-base">
              اختر قالباً ثم عدّل النص، الشعار، والألوان قبل حفظ ملف PDF.
            </CardDescription>
          </div>
          <div className="hidden rounded-full border border-[#ddc9a6] bg-white px-3 py-1 text-xs font-semibold text-[#7a4a2b] sm:block">
            A6 Print
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:px-6">
        <form onSubmit={handleGeneratePdf} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <div className="rounded-[16px] border border-[#e8ded2] bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#463d35]">
                <LinkIcon className="h-4 w-4 text-[#b03a2e]" />
                الربط والمحتوى
              </div>
          {/* Menu Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="menuSelect" className="text-sm font-semibold text-[#6f6257]">
              اختر القائمة المراد ربطها بكود QR
            </Label>
            {loadingMenus ? (
              <div className="flex items-center gap-2 rounded-[11px] border border-[#e2d3c1] bg-[#fbf8f4] p-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#b03a2e]" />
                <span className="text-sm text-[#6f6257]">جاري تحميل القوائم...</span>
              </div>
            ) : publishedMenus.length > 0 ? (
              <Select value={selectedMenuId} onValueChange={handleMenuSelection}>
                <SelectTrigger className="w-full rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20">
                  <SelectValue placeholder="اختر قائمة" />
                </SelectTrigger>
                <SelectContent>
                  {publishedMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-[#b03a2e]" />
                        <span className="text-sm">{menu.menu_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-[11px] border border-[#e2d3c1] bg-[#fff8eb] p-3 text-sm text-[#8a5a12]">
                لا توجد قوائم منشورة. يرجى نشر قائمة أولاً لإنشاء كود QR.
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 sm:space-y-3">
            <Label htmlFor="cardName" className="text-sm font-semibold text-[#6f6257]">
              اسم البطاقة
            </Label>
            <Input
              id="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="اسم البطاقة (مثل: بطاقة QR - مطعم الورد)"
              className="rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] placeholder:text-[#b5a797] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20"
            />
          </div>
          <div className="mt-4 space-y-2 sm:space-y-3">
            <Label htmlFor="customText" className="text-sm font-semibold text-[#6f6257]">
              نص مخصص للبطاقة
            </Label>
          <Textarea
            id="customText"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="اكتب نصًا هنا ليظهر على بطاقة QR الخاصة بك..."
            className="min-h-[80px] rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] placeholder:text-[#b5a797] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20"
          />
          </div>
        </div>

            <div className="rounded-[16px] border border-[#e8ded2] bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#463d35]">
                <Check className="h-4 w-4 text-[#b03a2e]" />
                القوالب الجاهزة
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {qrCardTemplates.map((t) => {
                  const selected = selectedTemplate === t.id
                  return (
                    <QrTemplateExampleCard
                      key={t.id}
                      templateId={t.id}
                      name={t.name}
                      restaurantName={restaurant.name}
                      selected={selected}
                      compact
                      onClick={() => applyTemplatePreset(t.id)}
                    />
                  )
                })}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#e8ded2] bg-white p-4">
              <div className="mb-3 text-sm font-bold text-[#463d35]">التخصيص</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#6f6257]">الخط</Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger className="w-full rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map(f => (
                  <SelectItem key={f.id} value={f.id} style={{ fontFamily: resolveFontFamily(f.id) }}>
                    {f.arabicName || f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Design Controls */}
            <div className="space-y-2">
              <Label htmlFor="cardBgColor" className="text-sm font-semibold text-[#6f6257]">
                لون خلفية البطاقة
              </Label>
              <Select value={cardBgColor} onValueChange={setCardBgColor}>
                <SelectTrigger className="w-full rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20">
                  <SelectValue placeholder="اختر لون الخلفية" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-[#d9cbb9]"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <span className="text-sm">{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor" className="text-sm font-semibold text-[#6f6257]">
                لون النص
              </Label>
              <Select value={textColor} onValueChange={setTextColor}>
                <SelectTrigger className="w-full rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20">
                  <SelectValue placeholder="اختر لون النص" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-[#d9cbb9]"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <span className="text-sm">{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoPosition" className="text-sm font-semibold text-[#6f6257]">
                موضع الشعار
              </Label>
              <Select value={logoPosition} onValueChange={setLogoPosition}>
                <SelectTrigger className="w-full rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20">
                  <SelectValue placeholder="اختر موضع الشعار" />
                </SelectTrigger>
                <SelectContent>
                  {logoPositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="text-sm">{option.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrCodeSize" className="text-sm font-semibold text-[#6f6257]">
                حجم كود QR ({qrCodeSize}px)
              </Label>
              <Input
                id="qrCodeSize"
                type="range"
                min="150"
                max="300"
                step="10"
                value={qrCodeSize}
                onChange={(e) => setQrCodeSize(parseInt(e.target.value))}
                className="rounded-[11px] border-[#d9cbb9] bg-white"
              />
            </div>

            {/* Border Controls */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showBorder" className="text-sm font-semibold text-[#6f6257]">
                  إضافة حدود للبطاقة
                </Label>
                <Switch
                  id="showBorder"
                  checked={showBorder}
                  onCheckedChange={setShowBorder}
                />
              </div>
              {showBorder && (
                <div className="mt-2">
                  <Label htmlFor="borderColor" className="text-sm font-semibold text-[#6f6257]">
                    لون الحدود
                  </Label>
                  <Select value={borderColor} onValueChange={setBorderColor}>
                    <SelectTrigger className="mt-1 w-full rounded-[11px] border-[#d9cbb9] bg-white text-[#2f2923] focus:border-[#b03a2e] focus:ring-[#b03a2e]/20">
                      <SelectValue placeholder="اختر لون الحدود" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-[#d9cbb9]"
                              style={{ backgroundColor: color.value }}
                            ></div>
                            <span className="text-sm">{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            )}
            </div>
          </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[18px] border border-[#e8ded2] bg-[#fbf8f4] p-4 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-[#2f2923]">معاينة حيّة</h3>
            <div
              className="mx-auto flex aspect-[3/4] w-full max-w-[260px] flex-col items-center justify-center overflow-hidden rounded-[18px] p-6 shadow-sm"
              style={{
                backgroundColor: cardBgColor,
                color: textColor,
                border: showBorder ? `2px solid ${borderColor}` : "1px solid rgba(0,0,0,.08)",
              }}
            >
              {(logoPosition === "top" || logoPosition === "both") && (
                restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant.name} className="mb-3 h-14 w-14 rounded-[14px] object-contain" />
                ) : (
                  <div className="mb-3 grid h-14 w-14 place-items-center rounded-[14px] bg-white/85 text-lg font-bold shadow-sm">{restaurant.name.slice(0, 1)}</div>
                )
              )}
              <div className="mb-3 text-center">
                <div className="text-lg font-extrabold">{restaurant.name}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] opacity-60">MENU-P</div>
              </div>
              <div className="relative rounded-[18px] bg-white p-4 shadow-sm">
              {previewQrDataUrl ? (
                <img src={previewQrDataUrl} alt="QR preview" className="h-36 w-36 object-contain" />
              ) : (
                <div className="grid h-36 w-36 place-items-center text-[#827466]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
                {(logoPosition === "middle" || logoPosition === "both") && restaurant.logo_url && (
                  <div className="absolute inset-0 grid place-items-center">
                    <img src={restaurant.logo_url} alt={restaurant.name} className="h-10 w-10 rounded-[10px] bg-white object-contain p-1 shadow-sm" />
                  </div>
                )}
              </div>
              <p className="mt-4 text-center text-sm font-semibold leading-6">{customText}</p>
            </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
          <Button
            type="submit"
            disabled={isPending}
              className="h-12 flex-1 rounded-[11px] bg-[#b03a2e] text-sm font-semibold text-white shadow-sm hover:bg-[#962f26] sm:text-base"
          >
            {isPending ? (
              <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin ml-2" />
                  جاري الإنشاء...
              </>
            ) : (
              <>
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  إنشاء وحفظ البطاقة
              </>
            )}
          </Button>

          {/* Success/Error Messages */}
          {state?.pdfUrl && (
            <div className="space-y-3 rounded-[14px] border border-[#bfe0cd] bg-[#eef9f2] p-3 text-[#2f8f5b] sm:p-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <p className="text-sm sm:text-base">تم إنشاء بطاقة QR بنجاح!</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-[#2f8f5b] text-white hover:bg-[#26784c]"
                  asChild
                >
                  <a href={state.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 ml-1" />
                    تحميل البطاقة
                  </a>
                </Button>
                                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1 border-[#9ccfb1] text-[#2f8f5b] hover:bg-white"
                   onClick={() => {
                     // Reset form and refetch data
                     setCardName("QR Card")
                     setCustomText("امسح الكود لعرض قائمتنا الرقمية!")
                     window.location.href = "/dashboard?tab=qr-cards"
                   }}
                 >
                   عرض البطاقات
                 </Button>
              </div>
            </div>
          )}

          {state?.error && (
            <div className="rounded-[14px] border border-[#e4c7c2] bg-[#fff3f1] p-3 text-sm text-[#b03a2e] sm:p-4">
              {state.error}
            </div>
          )}
          </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
