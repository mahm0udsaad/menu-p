"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, ArrowRight, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-lg font-medium rounded-xl h-[60px] transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
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
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)
  const [showPassword, setShowPassword] = useState(false)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
            <QrCode className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">أهلاً بعودتك</h1>
        <p className="text-lg text-slate-300">سجل دخولك للوصول إلى لوحة التحكم</p>
      </div>

      {/* Form */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-center">
              {state.error}
            </div>
          )}

          <div className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-6 text-lg focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white rounded-xl py-6 text-lg focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <SubmitButton />

          {/* Forgot Password */}
          <div className="text-center">
            <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
              نسيت كلمة المرور؟
            </Link>
          </div>
        </form>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
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
