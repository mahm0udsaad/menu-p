"use client"

import { useState, useTransition } from "react"
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
import { QRCardPDF } from "@/components/pdf/qr-card-pdf"

interface Restaurant {
  id: string
  name: string
  logo_url: string | null
}

interface QrCardGeneratorProps {
  restaurant: Restaurant
  menuPublicUrl: string // The URL the QR code will point to
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
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useActionState(generateAndSaveQrCardPdf, null)

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

  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        // Generate QR code data URL
        const qrCodeDataUrl = await generateQrCodeDataUrl(menuPublicUrl, qrCodeSize)

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
          logoPosition: logoPosition as 'none' | 'top' | 'middle' | 'both'
        }

        // Generate PDF using React PDF (client-side)
        const pdfBlob = await pdf(
          QRCardPDF({
            restaurant: restaurantData,
            qrCodeUrl: menuPublicUrl,
            qrCodeDataUrl,
            options
          })
        ).toBlob()

        // Create FormData to send to server action
        const formData = new FormData()
        formData.append("pdfFile", pdfBlob, `${cardName}.pdf`)
        formData.append("restaurantId", restaurant.id)
        formData.append("cardName", cardName)
        formData.append("qrCodeUrl", menuPublicUrl)
        formData.append("customText", customText)
        formData.append("cardOptions", JSON.stringify({
          cardBgColor,
          textColor,
          qrCodeSize,
          showBorder,
          borderColor,
          logoPosition,
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
      <CardHeader>
        <CardTitle className="text-white">إنشاء بطاقة QR قابلة للطباعة</CardTitle>
        <CardDescription className="text-slate-300">صمم بطاقة QR مخصصة لطاولات مطعمك أو مقهاك.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleGeneratePdf} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="cardName" className="text-slate-300">
              اسم البطاقة
            </Label>
            <Input
              id="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="اسم البطاقة (مثل: بطاقة QR - مطعم الورد)"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="customText" className="text-slate-300">
              نص مخصص للبطاقة
            </Label>
            <Textarea
              id="customText"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="اكتب نصًا هنا ليظهر على بطاقة QR الخاصة بك..."
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 min-h-[80px]"
            />
          </div>
          {/* Design Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardBgColor" className="text-slate-300">
                لون خلفية البطاقة
              </Label>
              <Select value={cardBgColor} onValueChange={setCardBgColor}>
                <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20">
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
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor" className="text-slate-300">
                لون النص
              </Label>
              <Select value={textColor} onValueChange={setTextColor}>
                <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20">
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
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qrCodeSize" className="text-slate-300">
                حجم كود QR (بالبكسل)
              </Label>
              <Input
                id="qrCodeSize"
                type="number"
                value={qrCodeSize}
                onChange={(e) => setQrCodeSize(Number.parseInt(e.target.value) || 0)}
                min={100}
                max={500}
                step={10}
                className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoPosition" className="text-slate-300">
                موضع الشعار
              </Label>
              <Select value={logoPosition} onValueChange={setLogoPosition}>
                <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20">
                  <SelectValue placeholder="اختر موضع الشعار" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {logoPositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between space-x-2 p-2 rounded-xl bg-slate-700/30 border border-slate-600">
              <Label htmlFor="showBorder" className="text-slate-300 cursor-pointer">
                إظهار الحدود
              </Label>
              <Switch id="showBorder" checked={showBorder} onCheckedChange={setShowBorder} />
            </div>
            {showBorder && (
              <div className="space-y-2 col-span-full md:col-span-1">
                <Label htmlFor="borderColor" className="text-slate-300">
                  لون الحدود
                </Label>
                <Input
                  id="borderColor"
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="h-10 w-full bg-slate-700/50 border-slate-600 rounded-xl"
                />
              </div>
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-600"
            style={{ backgroundColor: cardBgColor }}
          >
            <h4 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
              معاينة بطاقة QR
            </h4>
            <div
              className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
              style={{ border: showBorder ? `2px solid ${borderColor}` : "none" }}
            >
              {(logoPosition === "top" || logoPosition === "both") && restaurant.logo_url && (
                <Image
                  src={restaurant.logo_url || "/placeholder.svg"}
                  alt={`${restaurant.name} logo`}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover mb-2"
                />
              )}
              <QRCodeCanvas
                value={menuPublicUrl}
                size={qrCodeSize > 0 ? qrCodeSize : 200}
                level="H"
                imageSettings={
                  (logoPosition === "middle" || logoPosition === "both") && restaurant.logo_url
                    ? {
                        src: restaurant.logo_url,
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }
                    : undefined
                }
              />
              <p className="text-center text-sm mt-2 font-medium" style={{ color: textColor }}>
                {restaurant.name}
              </p>
              <p className="text-center text-xs mt-1" style={{ color: textColor }}>
                {customText}
              </p>
            </div>
            <p className="text-slate-400 text-sm mt-4 text-center">
              <LinkIcon className="inline-block h-4 w-4 ml-1 text-emerald-400" />
              رابط القائمة:{" "}
              <a
                href={menuPublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline break-all"
              >
                {menuPublicUrl}
              </a>
            </p>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-lg font-medium rounded-xl h-[60px] transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                جاري إنشاء البطاقة...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-5 w-5" />
                إنشاء بطاقة QR قابلة للطباعة
              </>
            )}
          </Button>
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-center">
              {state.error}
            </div>
          )}
          {state?.pdfUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              <span>تم إنشاء البطاقة بنجاح!</span>
              <Button asChild variant="link" className="text-emerald-300 hover:text-emerald-200">
                <a href={state.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" /> تحميل PDF
                </a>
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
