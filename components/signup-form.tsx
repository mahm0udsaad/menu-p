"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, ArrowRight, Eye, EyeOff, Check } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { supabase } from "@/lib/supabase/client"
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
          جاري إنشاء الحساب...
        </>
      ) : (
        <>
          إنشاء الحساب
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [state, formAction] = useActionState(signUp, { error: null, success: null })

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
          <QrCode className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
        <p className="text-slate-400">انضم إلى Menu-P وابدأ في إنشاء قائمة طعامك الرقمية</p>
      </div>

      {/* Messages */}
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-center text-sm">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center text-emerald-400 mb-2">
            <Check className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">تم إنشاء الحساب بنجاح!</p>
          </div>
          <p className="text-emerald-300 text-center text-sm">{state.success}</p>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-white text-sm font-medium">
            البريد الإلكتروني *
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
            كلمة المرور *
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="أدخل كلمة مرور قوية"
              required
              minLength={6}
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
          <p className="text-slate-400 text-xs">يجب أن تحتوي على 6 أحرف على الأقل</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-white text-sm font-medium">
            تأكيد كلمة المرور *
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="أعد إدخال كلمة المرور"
              required
              minLength={6}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 py-6 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 pl-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <SubmitButton />
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-800 px-2 text-slate-400">أو</span>
        </div>
      </div>

      {/* Google Sign-in Button */}
      <Button
        onClick={async () => {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            console.error('Google sign-in error:', error)
          }
        }}
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 py-6 text-lg font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-lg"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        التسجيل باستخدام Google
      </Button>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-slate-400">
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
