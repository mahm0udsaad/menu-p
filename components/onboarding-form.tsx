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
import { Upload, Loader2, Coffee, UtensilsCrossed, Building2, QrCode, ArrowRight, Palette, MapPin, Phone } from "lucide-react"
import { onboardRestaurant } from "@/lib/actions"

// Color palette options
const colorPalettes = [
  {
    id: "emerald",
    name: "زمردي كلاسيكي",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    preview: ["#10b981", "#059669", "#34d399", "#a7f3d0"]
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
    id: "rose",
    name: "وردي أنيق",
    primary: "#e11d48",
    secondary: "#be185d",
    accent: "#f43f5e",
    preview: ["#e11d48", "#be185d", "#f43f5e", "#fda4af"]
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

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-6 text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري الإعداد...
        </>
      ) : (
        <>
          <ArrowRight className="mr-2 h-5 w-5" />
          بدء إنشاء القائمة
        </>
      )}
    </Button>
  )
}

export default function OnboardingForm() {
  const [selectedCategory, setSelectedCategory] = useState("restaurant")
  const [selectedPalette, setSelectedPalette] = useState("emerald")
  const [state, formAction] = useActionState(onboardRestaurant, { error: "" })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            مرحباً بك في Menu-P
          </CardTitle>
          <p className="text-slate-400 text-lg">
            لنبدأ بإعداد مطعمك وإنشاء قائمة طعامك الرقمية
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-center">{state.error}</p>
            </div>
          )}
          
          <form action={formAction} className="space-y-8">
            {/* Restaurant Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-white text-lg font-medium">
                اسم المطعم *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="أدخل اسم مطعمك"
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-lg py-6 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="address" className="text-white text-lg font-medium">
                  <MapPin className="inline h-5 w-5 ml-2" />
                  العنوان
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="عنوان المطعم"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-lg py-6 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-white text-lg font-medium">
                  <Phone className="inline h-5 w-5 ml-2" />
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+966 5X XXX XXXX"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-lg py-6 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <Label className="text-white text-lg font-medium">نوع النشاط التجاري *</Label>
              <RadioGroup
                name="category"
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="cafe" id="cafe" className="border-slate-600 text-emerald-400" />
                  <Label
                    htmlFor="cafe"
                    className="flex items-center space-x-3 space-x-reverse cursor-pointer p-4 rounded-xl border border-slate-600 hover:border-emerald-400 transition-all duration-300 flex-1 bg-slate-700/30 hover:bg-slate-700/50"
                  >
                    <Coffee className="h-6 w-6 text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">مقهى</div>
                      <div className="text-sm text-slate-400">قهوة، معجنات، ووجبات خفيفة</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="restaurant" id="restaurant" className="border-slate-600 text-emerald-400" />
                  <Label
                    htmlFor="restaurant"
                    className="flex items-center space-x-3 space-x-reverse cursor-pointer p-4 rounded-xl border border-slate-600 hover:border-emerald-400 transition-all duration-300 flex-1 bg-slate-700/30 hover:bg-slate-700/50"
                  >
                    <UtensilsCrossed className="h-6 w-6 text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">مطعم</div>
                      <div className="text-sm text-slate-400">تجربة طعام كاملة</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="both" id="both" className="border-slate-600 text-emerald-400" />
                  <Label
                    htmlFor="both"
                    className="flex items-center space-x-3 space-x-reverse cursor-pointer p-4 rounded-xl border border-slate-600 hover:border-emerald-400 transition-all duration-300 flex-1 bg-slate-700/30 hover:bg-slate-700/50"
                  >
                    <Building2 className="h-6 w-6 text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">كلاهما</div>
                      <div className="text-sm text-slate-400">مقهى ومطعم</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Color Palette Selection */}
            <div className="space-y-4">
              <Label className="text-white text-lg font-medium">
                <Palette className="inline h-5 w-5 ml-2" />
                اختر لوحة الألوان لقائمتك
              </Label>
              <p className="text-slate-400 text-sm">ستظهر هذه الألوان في قائمة طعامك وملف PDF</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colorPalettes.map((palette) => (
                  <div key={palette.id} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      name="colorPalette"
                      value={JSON.stringify(palette)}
                      id={palette.id}
                      checked={selectedPalette === palette.id}
                      onChange={() => setSelectedPalette(palette.id)}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={palette.id}
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex-1 ${
                        selectedPalette === palette.id
                          ? 'border-emerald-400 bg-slate-700/50'
                          : 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">{palette.name}</span>
                        <div className="flex space-x-1 space-x-reverse">
                          {palette.preview.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        مناسبة للمطاعم العصرية والتقليدية
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
