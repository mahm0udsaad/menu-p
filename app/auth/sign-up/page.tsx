import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/signup-form"
import { QrCode, Sparkles, Flame, Crown, Trophy, Star, CheckCircle, Zap, Shield, ChefHat, Coffee, Utensils, Users, Heart, Rocket } from "lucide-react"

export default async function SignUpPage() {
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

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 text-gray-900 overflow-hidden" dir="rtl">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/20 to-rose-200/20 rounded-full blur-3xl animate-pulse delay-1500"></div>
        <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-100/20 to-red-100/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Floating Particles */}
        <div className="absolute top-32 left-20 w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-600 shadow-lg shadow-pink-500/50"></div>
        <div className="absolute top-60 right-32 w-2 h-2 bg-red-500 rounded-full animate-bounce delay-1200 shadow-lg shadow-red-500/50"></div>
        <div className="absolute bottom-40 left-1/3 w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce delay-300 shadow-lg shadow-rose-500/50"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Brand Showcase Column */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-rose-600 via-pink-600 to-red-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-16 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-300"></div>
            <div className="absolute bottom-16 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1200"></div>
            <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          {/* Floating Brand Icons */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-24 left-16 w-20 h-20 bg-white/10 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-1000">
              <Users className="h-10 w-10 text-white" />
            </div>
            <div className="absolute top-40 right-16 w-16 h-16 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-600">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div className="absolute bottom-28 left-16 w-18 h-18 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-1200">
              <Rocket className="h-9 w-9 text-white" />
            </div>
            <div className="absolute bottom-16 right-12 w-14 h-14 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 animate-bounce delay-800">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative flex flex-col justify-center items-center w-full px-8 lg:px-16 text-center">
            {/* Animated Logo */}
            <div className="mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <QrCode className="h-16 w-16 text-rose-600 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Brand Text */}
            <div className="space-y-6 mb-12">
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Crown className="h-8 w-8 text-yellow-300" />
                  <span className="text-6xl font-black text-white">Menu-p</span>
                  <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                </div>
                <div className="text-rose-200 font-bold tracking-wider flex items-center justify-center gap-2">
                  <Flame className="h-5 w-5" />
                  PREMIUM EDITION
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                انضم إلى ثورة المطاعم الرقمية
              </h1>
              
              <p className="text-xl text-rose-100 leading-relaxed max-w-2xl">
                أنشئ حسابك اليوم واكتشف أقوى منصة لإدارة قوائم المطاعم بتقنيات مستقبلية
              </p>
            </div>

            {/* Feature Highlights - Different from login */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-2xl">
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">مجتمع حصري</p>
                  <p className="text-sm text-rose-200">+50,000 مطعم ومقهى</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">إطلاق سريع</p>
                  <p className="text-sm text-rose-200">جاهز في 5 دقائق</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">تجربة مجانية</p>
                  <p className="text-sm text-rose-200">30 يوم بلا قيود</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">صُنع بحب</p>
                  <p className="text-sm text-rose-200">للمطاعم العربية</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
