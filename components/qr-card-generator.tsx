"use client"

import React, { useState, useTransition, useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input" // Added Input for color pickers
import { Switch } from "@/components/ui/switch" // Added Switch for toggle
import { Loader2, Download, Printer, LinkIcon, Check } from "lucide-react"
import { generateAndSaveQrCardPdf } from "@/lib/actions/qr-card-actions" // New server action
import { useActionState } from "react"
import Image from "next/image"
// Add new imports for Select components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pdf } from "@react-pdf/renderer"
import { qrCardTemplates, QrCardTemplateId } from "@/components/qr-card-templates"
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
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur rounded-xl">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-white text-lg sm:text-xl">إنشاء بطاقة QR قابلة للطباعة</CardTitle>
        <CardDescription className="text-slate-300 text-sm sm:text-base">صمم بطاقة QR مخصصة لطاولات مطعمك أو مقهاك.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <form onSubmit={handleGeneratePdf} className="space-y-4 sm:space-y-6">
          {/* Menu Selection */}
          <div className="space-y-2 sm:space-y-4">
            <Label htmlFor="menuSelect" className="text-slate-300 text-sm">
              اختر القائمة المراد ربطها بكود QR
            </Label>
            {loadingMenus ? (
              <div className="flex items-center gap-2 p-3 bg-slate-700/50 border border-slate-600 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span className="text-slate-300 text-sm">جاري تحميل القوائم...</span>
              </div>
            ) : publishedMenus.length > 0 ? (
              <Select value={selectedMenuId} onValueChange={handleMenuSelection}>
                <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm">
                  <SelectValue placeholder="اختر قائمة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {publishedMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">{menu.menu_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-amber-900/20 border border-amber-400/30 rounded-xl text-amber-400 text-sm">
                لا توجد قوائم منشورة. يرجى نشر قائمة أولاً لإنشاء كود QR.
              </div>
            )}
          </div>

          <div className="space-y-2 sm:space-y-4">
            <Label htmlFor="cardName" className="text-slate-300 text-sm">
              اسم البطاقة
            </Label>
            <Input
              id="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="اسم البطاقة (مثل: بطاقة QR - مطعم الورد)"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
            />
          </div>
          <div className="space-y-2 sm:space-y-4">
            <Label htmlFor="customText" className="text-slate-300 text-sm">
              نص مخصص للبطاقة
            </Label>
          <Textarea
            id="customText"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="اكتب نصًا هنا ليظهر على بطاقة QR الخاصة بك..."
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 min-h-[80px] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">القالب</Label>
            <Select value={selectedTemplate} onValueChange={(v: QrCardTemplateId) => setSelectedTemplate(v)}>
              <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {qrCardTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">الخط</Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {fontOptions.map(f => (
                  <SelectItem key={f.id} value={f.id} style={{ fontFamily: resolveFontFamily(f.id) }}>
                    {f.arabicName || f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
          {/* Design Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardBgColor" className="text-slate-300 text-sm">
                لون خلفية البطاقة
              </Label>
              <Select value={cardBgColor} onValueChange={setCardBgColor}>
                <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm">
                  <SelectValue placeholder="اختر لون الخلفية" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-600"
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
              <Label htmlFor="textColor" className="text-slate-300 text-sm">
                لون النص
              </Label>
              <Select value={textColor} onValueChange={setTextColor}>
                <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm">
                  <SelectValue placeholder="اختر لون النص" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-600"
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
              <Label htmlFor="logoPosition" className="text-slate-300 text-sm">
                موضع الشعار
              </Label>
              <Select value={logoPosition} onValueChange={setLogoPosition}>
                <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm">
                  <SelectValue placeholder="اختر موضع الشعار" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {logoPositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="text-sm">{option.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrCodeSize" className="text-slate-300 text-sm">
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
                className="bg-slate-700/50 border-slate-600 rounded-xl"
              />
            </div>

            {/* Border Controls */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showBorder" className="text-slate-300 text-sm">
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
                  <Label htmlFor="borderColor" className="text-slate-300 text-sm">
                    لون الحدود
                  </Label>
                  <Select value={borderColor} onValueChange={setBorderColor}>
                    <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm mt-1">
                      <SelectValue placeholder="اختر لون الحدود" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-slate-600"
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

          {/* Preview Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-semibold text-base sm:text-lg">معاينة البطاقة</h3>
            <div
              className="mx-auto w-full max-w-sm aspect-[3/4] rounded-xl shadow-lg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden"
              style={{
                backgroundColor: cardBgColor,
                border: showBorder ? `2px solid ${borderColor}` : 'none',
                fontFamily: resolveFontFamily(selectedFont)
              }}
            >
              {/* Logo at Top */}
              {(logoPosition === 'top' || logoPosition === 'both') && (
                <div className="mb-3 sm:mb-4">
                  {restaurant.logo_url ? (
                    <Image
                      src={restaurant.logo_url}
                      alt={restaurant.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover sm:w-[80px] sm:h-[80px]"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                      {restaurant.name.slice(0, 2)}
                    </div>
                  )}
                </div>
              )}

              {/* QR Code Container */}
              <div className="relative mb-3 sm:mb-4">
              <QRCodeCanvas
                value={selectedMenuUrl || menuPublicUrl}
                  size={Math.min(qrCodeSize * 0.6, 150)} 
                  className="sm:scale-110"
                />
                
                {/* Logo in Middle of QR Code */}
                {(logoPosition === 'middle' || logoPosition === 'both') && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full p-1 sm:p-2">
                      {restaurant.logo_url ? (
                        <Image
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover sm:w-[32px] sm:h-[32px]"
                        />
                      ) : (
                        <div className="w-[24px] h-[24px] sm:w-[32px] sm:h-[32px] bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          {restaurant.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Restaurant Name */}
              <h2
                className="font-bold text-center mb-2 text-base sm:text-lg leading-tight"
                style={{ color: textColor, fontFamily: resolveFontFamily(selectedFont) }}
              >
                {restaurant.name}
              </h2>

              {/* Custom Text */}
              <p
                className="text-center text-xs sm:text-sm leading-relaxed px-2"
                style={{ color: textColor, fontFamily: resolveFontFamily(selectedFont) }}
              >
                {customText}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <Button
            type="submit"
            disabled={isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
          </div>

          {/* Success/Error Messages */}
          {state?.pdfUrl && (
            <div className="space-y-3 p-3 sm:p-4 bg-emerald-900/20 border border-emerald-400/30 rounded-xl text-emerald-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <p className="text-sm sm:text-base">تم إنشاء بطاقة QR بنجاح!</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
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
                   className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 flex-1"
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
            <div className="p-3 sm:p-4 bg-red-900/20 border border-red-400/30 rounded-xl text-red-400 text-sm sm:text-base">
              {state.error}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
