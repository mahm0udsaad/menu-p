"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, ArrowRight, Mail, Shield, Key, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { forgotPassword } from "@/lib/actions"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:scale-105 border border-red-400/50 py-6 text-lg font-bold rounded-2xl disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري الإرسال...
        </>
      ) : (
        <>
          إرسال رابط الاستعادة
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  )
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, { error: null, success: null })

  return (
    <div className="w-full max-w-md">
      <div className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-[1.02] rounded-3xl overflow-hidden border border-red-200/50 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur-lg opacity-75"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
              <Key className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-red-800 to-gray-900 bg-clip-text text-transparent">
              استعادة كلمة المرور
            </h1>
            <Mail className="h-6 w-6 text-red-600 animate-pulse" />
          </div>
          
          <p className="text-gray-600 font-semibold leading-relaxed">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
          </p>
        </div>

        {/* Messages */}
        {state?.error && (
          <div className="bg-red-100 border border-red-200 rounded-2xl p-4 mb-6 relative">
            <p className="text-red-800 text-center font-semibold">{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="bg-green-100 border border-green-200 rounded-2xl p-4 mb-6 relative">
            <div className="flex items-center justify-center text-green-700 mb-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="font-bold">تم الإرسال بنجاح!</p>
            </div>
            <p className="text-green-600 text-center font-semibold leading-relaxed">{state.success}</p>
          </div>
        )}

        {/* Email Form */}
        <form action={formAction} className="space-y-6 relative">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-900 text-sm font-bold flex items-center gap-2">
              <Mail className="h-4 w-4 text-red-600" />
              البريد الإلكتروني
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@domain.com"
              required
              className="w-full rounded-2xl border border-red-200 bg-red-50/50 px-4 py-6 text-gray-900 transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 hover:bg-red-50 font-semibold text-lg"
              dir="ltr"
            />
            <p className="text-gray-500 text-xs font-semibold flex items-center gap-1">
              <Shield className="h-3 w-3" />
              سيتم إرسال رابط آمن صالح لـ 24 ساعة
            </p>
          </div>

          <SubmitButton />
        </form>

        {/* Back to Login Link */}
        <div className="text-center mt-6 relative">
          <Link 
            href="/auth/login" 
            className="text-red-600 hover:text-red-800 font-bold transition-colors hover:scale-105 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لتسجيل الدخول
          </Link>
        </div>

        {/* Don't have account Link */}
        <div className="text-center mt-6 relative">
          <p className="text-gray-600 font-semibold">
            ليس لديك حساب؟{" "}
            <Link href="/auth/sign-up" className="text-red-600 hover:text-red-800 font-bold transition-colors hover:scale-105 inline-block">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 