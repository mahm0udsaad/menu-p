"use client"

import type React from "react"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Loader2, Coffee, UtensilsCrossed, Building2, QrCode, ArrowRight } from "lucide-react"
import { createRestaurant } from "@/lib/actions/restaurant"
import { useState, useRef } from "react"
import Image from "next/image"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-lg font-medium rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري إنشاء الملف الشخصي...
        </>
      ) : (
        <>
          إكمال الإعداد
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  )
}

export default function OnboardingForm() {
  const [state, formAction] = useActionState(createRestaurant, null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 animate-bounce delay-100">
          <Coffee className="h-8 w-8 text-emerald-400/10" />
        </div>
        <div className="absolute top-40 left-32 animate-pulse delay-300">
          <UtensilsCrossed className="h-12 w-12 text-emerald-300/10" />
        </div>
        <div className="absolute top-60 right-1/3 animate-bounce delay-500">
          <QrCode className="h-10 w-10 text-emerald-500/10" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-700">
          <Building2 className="h-14 w-14 text-emerald-400/10" />
        </div>
        <div className="absolute bottom-60 right-20 animate-bounce delay-1000">
          <Coffee className="h-8 w-8 text-emerald-300/10" />
        </div>
      </div>

      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700 backdrop-blur shadow-2xl rounded-2xl relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
              <QrCode className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">إعداد مطعمك</CardTitle>
          <p className="text-slate-300 text-lg">دعنا نجهز قائمتك الرقمية في خطوات بسيطة</p>
        </CardHeader>

        <CardContent className="space-y-8">
          <form action={formAction} className="space-y-8">
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-center">
                {state.error}
              </div>
            )}

            {/* Logo Upload */}
            <div className="space-y-4">
              <Label className="text-white text-lg font-medium">شعار المطعم</Label>
              <div className="flex flex-col items-center space-y-4">
                <div
                  onClick={handleImageClick}
                  className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-all duration-300 bg-slate-700/50 hover:bg-slate-700/70 group"
                >
                  {selectedImage ? (
                    <Image
                      src={selectedImage || "/placeholder.svg"}
                      alt="Restaurant logo preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
                      <p className="text-sm text-slate-400 group-hover:text-emerald-400 transition-colors">
                        اضغط للرفع
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-slate-400 text-center">اختياري: ارفع شعار مطعمك (أقصى حجم 5 ميجابايت)</p>
              </div>
            </div>

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
                      <div className="text-sm text-slate-400">قهوة، معجنات، وجبات خفيفة</div>
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

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
