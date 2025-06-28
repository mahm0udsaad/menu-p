import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ForgotPasswordForm from "@/components/forgot-password-form"
import { QrCode, Sparkles, Flame, Crown, Shield, Key, Clock, Mail, CheckCircle, Zap, Lock, RefreshCw } from "lucide-react"

export default async function ForgotPasswordPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-rose-900">
        <h1 className="text-2xl font-bold mb-4 text-white">اربط Supabase للبدء</h1>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 text-gray-900 overflow-hidden" dir="rtl">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-gradient-to-r from-red-200/25 to-rose-200/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-rose-200/15 to-pink-200/15 rounded-full blur-3xl animate-pulse delay-1200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-red-100/15 to-rose-100/15 rounded-full blur-3xl animate-pulse delay-300"></div>

        {/* Floating Particles */}
        <div className="absolute top-28 right-24 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-400 shadow-lg shadow-red-500/50"></div>
        <div className="absolute top-52 left-40 w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-900 shadow-lg shadow-rose-500/50"></div>
        <div className="absolute bottom-36 right-1/4 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-200 shadow-lg shadow-pink-500/50"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Brand Showcase Column */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-12 right-24 w-36 h-36 bg-white/10 rounded-full blur-3xl animate-pulse delay-600"></div>
            <div className="absolute bottom-24 left-24 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse delay-900"></div>
            <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-88 h-88 bg-white/5 rounded-full blur-3xl animate-pulse delay-400"></div>
          </div>

          {/* Floating Brand Icons */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-20 w-18 h-18 bg-white/10 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-1100">
              <Lock className="h-9 w-9 text-white" />
            </div>
            <div className="absolute top-36 left-20 w-16 h-16 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-500">
              <Key className="h-8 w-8 text-white" />
            </div>
            <div className="absolute bottom-28 right-20 w-18 h-18 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-700">
              <RefreshCw className="h-9 w-9 text-white" />
            </div>
            <div className="absolute bottom-20 left-16 w-14 h-14 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-1000">
              <Mail className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative flex flex-col justify-center items-center w-full px-8 lg:px-16 text-center">
            {/* Animated Logo */}
            <div className="mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <QrCode className="h-16 w-16 text-red-600 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Brand Text */}
            <div className="space-y-6 mb-12">
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-yellow-300" />
                  <span className="text-6xl font-black text-white">Menu-p</span>
                  <Key className="h-8 w-8 text-yellow-300 animate-pulse" />
                </div>
                <div className="text-red-200 font-bold tracking-wider flex items-center justify-center gap-2">
                  <Flame className="h-5 w-5" />
                  SECURE RECOVERY
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                استعادة آمنة لكلمة المرور
              </h1>
              
              <p className="text-xl text-red-100 leading-relaxed max-w-2xl">
                نحن هنا لمساعدتك في استعادة الوصول لحسابك بأمان تام وسرعة فائقة
              </p>
            </div>

            {/* Feature Highlights - Password recovery focused */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-2xl">
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">رسالة فورية</p>
                  <p className="text-sm text-red-200">في أقل من دقيقة</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">حماية مطلقة</p>
                  <p className="text-sm text-red-200">تشفير عسكري المستوى</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">صالح 24 ساعة</p>
                  <p className="text-sm text-red-200">رابط آمن محدود الوقت</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">استعادة سريعة</p>
                  <p className="text-sm text-red-200">3 خطوات بسيطة فقط</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
} 