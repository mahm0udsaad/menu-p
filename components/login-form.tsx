"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, ArrowRight, Eye, EyeOff, Crown, Sparkles } from "lucide-react"
import Link from "next/link"
import { signIn, signInWithGoogle } from "@/lib/actions"
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

function GoogleSignInButton() {
  const [isPending, setIsPending] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsPending(true)
    try {
      signInWithGoogle()
    } catch (error) {
      console.error('Google sign-in error:', error)
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isPending}
      className="w-full border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 backdrop-blur-xl transition-all duration-500 hover:scale-105 py-6 text-lg font-bold rounded-2xl hover:shadow-red-500/20 disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري تسجيل الدخول...
        </>
      ) : (
        <>
          <svg className="ml-2 h-5 w-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          تسجيل الدخول بـ Google
        </>
      )}
    </Button>
  )
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useActionState(signIn, { error: "" })

  return (
    <div className="w-full max-w-md">
      <div className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-[1.02] rounded-3xl overflow-hidden border border-red-200/50 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur-lg opacity-75"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
              <QrCode className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-red-600" />
            <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-red-800 to-gray-900 bg-clip-text text-transparent">
              تسجيل الدخول
            </h1>
            <Sparkles className="h-6 w-6 text-red-600 animate-pulse" />
          </div>
          
          <p className="text-gray-600 font-semibold">مرحباً بك مرة أخرى في Menu-P</p>
        </div>

        {/* Error Message */}
        {state?.error && (
          <div className="bg-red-100 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-800 text-center font-semibold">{state.error}</p>
          </div>
        )}

        {/* Google Sign In - Primary Option */}
        <div className="mb-6 relative">
          <GoogleSignInButton />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-red-200"></div>
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
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-900 text-sm font-bold">
              كلمة المرور
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="أدخل كلمة المرور"
                required
                className="w-full rounded-2xl border border-red-200 bg-red-50/50 px-4 py-6 text-gray-900 transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 hover:bg-red-50 font-semibold text-lg pl-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <SubmitButton />
        </form>

        {/* Forgot Password Link */}
        <div className="text-center mt-6 relative">
          <Link href="/auth/forgot-password" className="text-red-600 hover:text-red-800 font-bold transition-colors hover:scale-105 inline-block">
            نسيت كلمة المرور؟
          </Link>
        </div>

        {/* Sign Up Link */}
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
