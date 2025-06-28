"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, ArrowRight, Eye, EyeOff, Check, Crown, Sparkles, Users, Heart } from "lucide-react"
import Link from "next/link"
import { signUp, signInWithGoogle } from "@/lib/actions"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white shadow-2xl hover:shadow-rose-500/30 transition-all duration-500 hover:scale-105 border border-rose-400/50 py-6 text-lg font-bold rounded-2xl disabled:opacity-50"
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
      className="w-full border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 backdrop-blur-xl transition-all duration-500 hover:scale-105 py-6 text-lg font-bold rounded-2xl hover:shadow-rose-500/20 disabled:opacity-50"
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
    <div className="w-full max-w-md">
      <div className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-rose-500/25 transition-all duration-700 hover:scale-[1.02] rounded-3xl overflow-hidden border border-rose-200/50 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur-lg opacity-75"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
              <QrCode className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-6 w-6 text-rose-600" />
            <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-rose-800 to-gray-900 bg-clip-text text-transparent">
              إنشاء حساب جديد
            </h1>
            <Heart className="h-6 w-6 text-rose-600 animate-pulse" />
          </div>
          
          <p className="text-gray-600 font-semibold">انضم إلى Menu-P وابدأ في إنشاء قائمة طعامك الرقمية</p>
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
              <Check className="h-5 w-5 mr-2" />
              <p className="font-bold">تم إنشاء الحساب بنجاح!</p>
            </div>
            <p className="text-green-600 text-center font-semibold">{state.success}</p>
          </div>
        )}

        {/* Google Sign Up - Primary Option */}
        <div className="mb-6 relative">
          <GoogleSignUpButton />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-rose-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/90 text-gray-600 font-semibold">أو</span>
          </div>
        </div>

        {/* Email Form */}
        <form action={formAction} className="space-y-6 relative">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-900 text-sm font-bold">
              البريد الإلكتروني *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@domain.com"
              required
              className="w-full rounded-2xl border border-rose-200 bg-rose-50/50 px-4 py-6 text-gray-900 transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 hover:bg-rose-50 font-semibold text-lg"
              dir="ltr"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-900 text-sm font-bold">
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
                className="w-full rounded-2xl border border-rose-200 bg-rose-50/50 px-4 py-6 text-gray-900 transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 hover:bg-rose-50 font-semibold text-lg pl-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-700 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-gray-500 text-xs font-semibold">يجب أن تحتوي على 6 أحرف على الأقل</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-gray-900 text-sm font-bold">
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
                className="w-full rounded-2xl border border-rose-200 bg-rose-50/50 px-4 py-6 text-gray-900 transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 hover:bg-rose-50 font-semibold text-lg pl-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <SubmitButton />
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 relative">
          <p className="text-gray-600 font-semibold">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-rose-600 hover:text-rose-800 font-bold transition-colors hover:scale-105 inline-block">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
