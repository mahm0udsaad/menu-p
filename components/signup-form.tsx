"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, ArrowRight, Eye, EyeOff, Check } from "lucide-react"
import Link from "next/link"
import { signUp, signInWithGoogle } from "@/lib/actions"
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

function GoogleSignUpButton() {
  const [isPending, setIsPending] = useState(false)

  const handleGoogleSignUp = async () => {
    setIsPending(true)
    try {
      signInWithGoogle()
    } catch (error) {
      console.error('Google sign-up error:', error)
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleGoogleSignUp}
      disabled={isPending}
      className="w-full bg-white hover:bg-gray-50 text-gray-900 py-6 text-lg font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-lg border border-gray-200 disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري إنشاء الحساب...
        </>
      ) : (
        <>
          <svg className="ml-2 h-5 w-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          إنشاء حساب بـ Google
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

      {/* Google Sign Up - Primary Option */}
      <div className="mb-6">
        <GoogleSignUpButton />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-slate-800/50 text-slate-400">أو</span>
        </div>
      </div>

      {/* Email Form */}
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
