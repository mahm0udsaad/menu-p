"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, ArrowRight, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signIn } from "@/lib/actions"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-lg font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري تسجيل الدخول...
        </>
      ) : (
        <>
          تسجيل الدخول
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  )
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useActionState(signIn, { error: "" })

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
          <QrCode className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">تسجيل الدخول</h1>
        <p className="text-slate-400">مرحباً بك مرة أخرى في Menu-P</p>
      </div>

      {/* Error Message */}
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-center text-sm">{state.error}</p>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-white text-sm font-medium">
            البريد الإلكتروني
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="example@domain.com"
            required
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 py-6 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
            dir="ltr"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-white text-sm font-medium">
            كلمة المرور
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="أدخل كلمة المرور"
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 py-6 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 pl-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <SubmitButton />
      </form>

      {/* Forgot Password Link */}
      <div className="text-center mt-4">
        <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
          نسيت كلمة المرور؟
        </Link>
      </div>

      {/* Sign Up Link */}
      <div className="text-center mt-6">
        <p className="text-slate-400">
          ليس لديك حساب؟{" "}
          <Link href="/auth/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  )
}
