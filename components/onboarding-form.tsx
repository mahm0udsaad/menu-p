"use client"

import type React from "react"
import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Loader2, Coffee, UtensilsCrossed, Building2, QrCode, ArrowRight, Palette, MapPin, Phone, Crown, Sparkles, DollarSign } from "lucide-react"
import { onboardRestaurant } from "@/lib/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Color palette options with enhanced premium red/rose theme
const colorPalettes = [
  {
    id: "rose",
    name: "وردي أنيق مميز",
    primary: "#e11d48",
    secondary: "#be185d",
    accent: "#f43f5e",
    preview: ["#e11d48", "#be185d", "#f43f5e", "#fda4af"]
  },
  {
    id: "red",
    name: "أحمر ملكي",
    primary: "#dc2626",
    secondary: "#b91c1c",
    accent: "#ef4444",
    preview: ["#dc2626", "#b91c1c", "#ef4444", "#fca5a5"]
  },
  {
    id: "amber",
    name: "عنبري دافئ",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    preview: ["#f59e0b", "#d97706", "#fbbf24", "#fde68a"]
  },
  {
    id: "emerald",
    name: "زمردي كلاسيكي",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    preview: ["#10b981", "#059669", "#34d399", "#a7f3d0"]
  },
  {
    id: "blue",
    name: "أزرق احترافي",
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa",
    preview: ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd"]
  },
  {
    id: "purple",
    name: "بنفسجي ملكي",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    accent: "#a78bfa",
    preview: ["#8b5cf6", "#7c3aed", "#a78bfa", "#c4b5fd"]
  },
  {
    id: "teal",
    name: "تيل عصري",
    primary: "#14b8a6",
    secondary: "#0d9488",
    accent: "#2dd4bf",
    preview: ["#14b8a6", "#0d9488", "#2dd4bf", "#7dd3fc"]
  }
]

// Currency options for Middle East region
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
  { code: "LBP", name: "ليرة لبنانية", symbol: "ل.ل" }
]

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white font-bold py-6 text-lg rounded-xl transition-all duration-300 shadow-2xl hover:shadow-red-500/30 disabled:opacity-50 border border-red-400/50 group"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري الإعداد...
        </>
      ) : (
        <>
          <ArrowRight className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          بدء إنشاء القائمة
          <Sparkles className="ml-2 h-5 w-5 group-hover:animate-pulse" />
        </>
      )}
    </Button>
  )
}

export default function OnboardingForm() {
  const [selectedCategory, setSelectedCategory] = useState("restaurant")
  const [selectedPalette, setSelectedPalette] = useState("rose")
  const [selectedCurrency, setSelectedCurrency] = useState("EGP")
  const [state, formAction] = useActionState(onboardRestaurant, { error: "" })

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-100/30 to-rose-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-300 shadow-lg shadow-red-500/50"></div>
        <div className="absolute top-40 left-32 w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-700 shadow-lg shadow-rose-500/50"></div>
        <div className="absolute bottom-32 right-1/3 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-pink-500/50"></div>
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-red-600 rounded-full animate-bounce delay-500 shadow-lg shadow-red-600/50"></div>
      </div>

      <Card className="relative z-10 w-full max-w-4xl bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 border-0 shadow-2xl hover:shadow-red-500/20 transition-all duration-500">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <QrCode className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-red-600" />
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
              مرحباً بك في Menu-P
            </span>
            <Sparkles className="w-8 h-8 text-red-600" />
          </CardTitle>
          <p className="text-gray-600 text-lg font-medium">
            لنبدأ بإعداد مطعمك وإنشاء قائمة طعامك الرقمية المميزة
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-600 text-center font-medium">{state.error}</p>
            </div>
          )}
          
          <form action={formAction} className="space-y-8">
            {/* Restaurant Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-gray-800 text-lg font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                اسم المطعم *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="أدخل اسم مطعمك"
                required
                className="bg-white/70 border-red-200 text-gray-800 placeholder:text-gray-500 text-lg py-6 rounded-xl focus:border-red-500 focus:ring-red-500/20 transition-all duration-300 shadow-lg backdrop-blur-sm hover:shadow-red-500/10"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="address" className="text-gray-800 text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  العنوان
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="عنوان المطعم"
                  className="bg-white/70 border-red-200 text-gray-800 placeholder:text-gray-500 text-lg py-6 rounded-xl focus:border-red-500 focus:ring-red-500/20 transition-all duration-300 shadow-lg backdrop-blur-sm hover:shadow-red-500/10"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-gray-800 text-lg font-bold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+966 5X XXX XXXX"
                  className="bg-white/70 border-red-200 text-gray-800 placeholder:text-gray-500 text-lg py-6 rounded-xl focus:border-red-500 focus:ring-red-500/20 transition-all duration-300 shadow-lg backdrop-blur-sm hover:shadow-red-500/10"
                />
              </div>
            </div>

            {/* Currency Selection */}
            <div className="space-y-4">
              <Label className="text-gray-800 text-lg font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                اختر العملة
              </Label>
              <Select
                name="currency"
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <Label className="text-gray-800 text-lg font-bold flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-red-600" />
                نوع النشاط التجاري *
              </Label>
              <RadioGroup
                name="category"
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="cafe" id="cafe" className="border-red-300 text-red-600" />
                  <Label
                    htmlFor="cafe"
                    className="flex items-center space-x-3 space-x-reverse cursor-pointer p-4 rounded-xl border border-red-200 hover:border-red-400 transition-all duration-300 flex-1 bg-white/70 hover:bg-red-50/70 backdrop-blur-sm shadow-lg hover:shadow-red-500/20"
                  >
                    <Coffee className="h-6 w-6 text-red-600" />
                    <div>
                      <div className="text-gray-800 font-bold">مقهى</div>
                      <div className="text-sm text-gray-600">قهوة، معجنات، ووجبات خفيفة</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="restaurant" id="restaurant" className="border-red-300 text-red-600" />
                  <Label
                    htmlFor="restaurant"
                    className="flex items-center space-x-3 space-x-reverse cursor-pointer p-4 rounded-xl border border-red-200 hover:border-red-400 transition-all duration-300 flex-1 bg-white/70 hover:bg-red-50/70 backdrop-blur-sm shadow-lg hover:shadow-red-500/20"
                  >
                    <UtensilsCrossed className="h-6 w-6 text-red-600" />
                    <div>
                      <div className="text-gray-800 font-bold">مطعم</div>
                      <div className="text-sm text-gray-600">تجربة طعام كاملة</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="bakery" id="bakery" className="border-red-300 text-red-600" />
                  <Label
                    htmlFor="bakery"
                    className="flex items-center space-x-3 space-x-reverse cursor-pointer p-4 rounded-xl border border-red-200 hover:border-red-400 transition-all duration-300 flex-1 bg-white/70 hover:bg-red-50/70 backdrop-blur-sm shadow-lg hover:shadow-red-500/20"
                  >
                    <Building2 className="h-6 w-6 text-red-600" />
                    <div>
                      <div className="text-gray-800 font-bold">مخبز</div>
                      <div className="text-sm text-gray-600">خبز ومعجنات طازجة</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Color Palette Selection */}
            <div className="space-y-4">
              <Label className="text-gray-800 text-lg font-bold flex items-center gap-2">
                <Palette className="w-5 h-5 text-red-600" />
                اختر لوحة الألوان لقائمتك
              </Label>
              <RadioGroup
                name="color_palette"
                value={selectedPalette}
                onValueChange={setSelectedPalette}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {colorPalettes.map((palette) => (
                  <div key={palette.id} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={palette.id} id={palette.id} className="border-red-300 text-red-600" />
                    <Label
                      htmlFor={palette.id}
                      className="cursor-pointer p-3 rounded-xl border border-red-200 hover:border-red-400 transition-all duration-300 flex-1 bg-white/70 hover:bg-red-50/70 backdrop-blur-sm shadow-lg hover:shadow-red-500/20"
                    >
                      <div className="gap-2">
                        <div className="text-sm font-bold text-gray-800">{palette.name}</div>
                        <div className="flex space-x-1 space-x-reverse">
                          {palette.preview.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Enhanced Logo Upload Section */}
            <div className="space-y-4">
              <Label className="text-gray-800 text-lg font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-red-600" />
                شعار المطعم (اختياري)
              </Label>
              <div className="border-2 border-dashed border-red-300 rounded-xl p-8 text-center bg-red-50/50 hover:bg-red-50/70 transition-all duration-300 backdrop-blur-sm">
                <Upload className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <p className="text-gray-700 font-medium">
                  <span className="font-bold text-red-600">انقر لتحميل</span> أو اسحب ملف الشعار هنا
                </p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, SVG حتى 10MB</p>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
