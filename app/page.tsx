import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  QrCode,
  FileText,
  Smartphone,
  Globe,
  Star,
  CheckCircle,
  ArrowLeft,
  Shield,
  Zap,
  Play,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  Crown,
  Rocket,
  Target,
  BarChart3,
  Clock,
  Languages,
  Menu as MenuIcon,
  Heart,
  Flame,
  Bolt,
  Gem,
  Trophy,
  ChefHat,
  Utensils,
  Coffee
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

const AnimatedLogo = dynamic(() => import('@/components/ui/animated-logo'))

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function LandingPage({ searchParams }: PageProps) {
  console.log('🏠 [HOME] Landing page loading with searchParams:', searchParams)
  
  // Check if this is an auth callback - if so, redirect to callback handler immediately
  const code = searchParams?.code as string
  if (code) {
    console.log('🏠 [HOME] Auth code detected, redirecting to callback handler')
    const callbackUrl = `/auth/callback?code=${encodeURIComponent(code)}&next=/`
    redirect(callbackUrl)
  }
  
  // Get cookies (no await needed in App Router)
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  let restaurantData = null

  // Only fetch restaurant data if user exists to prevent UUID errors
  if (user?.id) {
    try {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (restaurantError) {
        console.error('Error fetching restaurant data:', restaurantError)
      } else {
        restaurantData = restaurant
      }
    } catch (error) {
      console.error('Error in restaurant fetch:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 text-gray-900 overflow-hidden" dir="rtl">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-100/30 to-rose-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Enhanced Floating Particles */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-300 shadow-lg shadow-red-500/50"></div>
        <div className="absolute top-40 left-32 w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-700 shadow-lg shadow-rose-500/50"></div>
        <div className="absolute bottom-32 right-1/3 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-pink-500/50"></div>
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-red-600 rounded-full animate-bounce delay-500 shadow-lg shadow-red-600/50"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-gradient-to-r from-red-400 to-rose-400 rounded-full animate-pulse delay-200 shadow-xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-pulse delay-800 shadow-xl"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-50 px-4 lg:px-6 h-24 flex items-center border-b border-red-200/50 bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 sticky top-0 shadow-lg shadow-red-500/10">
        <Link className="flex items-center justify-between sm:justify-center group" href="#">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-red-600 to-rose-600 p-3 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <QrCode className="h-7 w-7 text-white animate-pulse" />
            </div>
          </div>
         <AnimatedLogo />
        </Link>

        <nav className="mr-auto lg:flex md:flex gap-8 hidden">
          <Link
            className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 relative group"
            href="#features"
          >
            المميزات
            <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-red-500 to-rose-500 group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link
            className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 relative group"
            href="#pricing"
          >
            الأسعار
            <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-red-500 to-rose-500 group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link
            className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 relative group"
            href="#contact"
          >
            اتصل بنا
            <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-red-500 to-rose-500 group-hover:w-full transition-all duration-300"></div>
          </Link>
        </nav>

        <Button asChild className="mx-8 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:scale-110 border border-red-400/50 text-lg px-6 py-3 text-white">
          <Link href={user ? "/dashboard" : "/auth/sign-up"}>
            {user ? "لوحة التحكم" : "ابدأ الآن"}
          </Link>
        </Button>
      </header>

      <main className="flex-1 relative z-10">
        {/* Enhanced Hero Section */}
        <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center text-center space-y-12 max-w-5xl mx-auto relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 hover:from-red-200 hover:to-rose-200 border border-red-200 px-6 py-3 text-base font-bold backdrop-blur-xl shadow-lg">
                  <Crown className="ml-2 h-5 w-5 text-red-600" />
                  المنصة الرقمية الأولى للمطاعم في المنطقة
                </Badge>
                <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 backdrop-blur-xl shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-bold">+500 مطعم نشط</span>
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                    مستقبل قوائم
                  </span>
                  <span className="bg-gradient-to-r from-red-600 via-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent block animate-pulse">
                    المطاعم الرقمية
                  </span>
                  <span className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 bg-clip-text text-transparent block">
                    هنا الآن
                  </span>
                </h1>

                <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-700 leading-relaxed font-light">
                  منصة ثورية لإنشاء أكواد QR وقوائم PDF مصممة خصيصاً للمطاعم والمقاهي العربية المتطورة.
                  <span className="text-red-600 font-semibold"> اربح الوقت وحول أعمالك في 60 ثانية.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                <div className="flex-1">
                  <Button
                    size="lg"
                    asChild
                    className="group bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 shadow-2xl hover:shadow-red-500/50 transition-all duration-500 text-xl px-12 py-6 border border-red-400/50 text-white w-full"
                  >
                    <Link href="/auth/sign-up">
                      <Rocket className="ml-3 h-6 w-6 group-hover:animate-bounce" />
                      اطلق قائمتك الرقمية
                      <ArrowLeft className="mr-3 h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    size="lg"
                    className="group border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 backdrop-blur-xl transition-all duration-500 text-xl px-12 py-6 w-full shadow-lg hover:shadow-red-500/20"
                  >
                    <Play className="ml-3 h-6 w-6 group-hover:scale-125 transition-transform" />
                    شاهد العرض التوضيحي
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 w-full max-w-3xl">
                <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-700 bg-white/50 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">بدون تكلفة إعداد</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-700 bg-white/50 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">عربي + إنجليزي</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-700 bg-white/50 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bolt className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">إعداد في 60 ثانية</span>
                </div>
              </div>
            </div>

            {/* Enhanced Floating Space Icons */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-r from-red-400 to-rose-400 rounded-3xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-red-300/30 animate-bounce delay-800">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
              <div className="absolute top-32 left-16 w-20 h-20 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-rose-300/30 animate-bounce delay-800">
                <Utensils className="h-10 w-10 text-white" />
              </div>
              <div className="absolute bottom-32 right-16 w-22 h-22 bg-gradient-to-r from-red-400 to-rose-400 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-red-300/30 animate-bounce delay-800">
                <Coffee className="size-12 p-4 text-white" />
              </div>
              <div className="absolute bottom-20 left-12 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-pink-300/30 animate-bounce delay-800">
                <Gem className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Premium Stats Section */}
        <section className="w-full py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/50 to-transparent"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 md:gap-12">
              <div className="flex flex-col items-center space-y-3 md:space-y-6 text-center group hover:scale-110 transition-all duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                    <Users className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-6xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  +500
                </div>
                <div className="text-gray-600 font-bold text-sm md:text-xl">مطعم متميز</div>
              </div>

              <div className="flex flex-col items-center space-y-3 md:space-y-6 text-center group hover:scale-110 transition-all duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                    <Globe className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-6xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  15
                </div>
                <div className="text-gray-600 font-bold text-sm md:text-xl">دولة عربية</div>
              </div>

              <div className="flex flex-col items-center space-y-3 md:space-y-6 text-center group hover:scale-110 transition-all duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                    <QrCode className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-6xl font-black bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  +50k
                </div>
                <div className="text-gray-600 font-bold text-sm md:text-xl">كود QR نشط</div>
              </div>

              <div className="flex flex-col items-center space-y-3 md:space-y-6 text-center group hover:scale-110 transition-all duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                    <Trophy className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-6xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  99.9%
                </div>
                <div className="text-gray-600 font-bold text-sm md:text-xl">ضمان التشغيل</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Premium Features Section */}
        <section id="features" className="w-full py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-rose-50/30"></div>

          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-20">
              <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-8 py-4 text-xl font-black backdrop-blur-xl shadow-lg">
                <Flame className="ml-3 h-6 w-6" />
                مميزات ثورية
              </Badge>
              <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                  أكثر من مجرد
                </span>
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
                  قائمة رقمية عادية
                </span>
              </h2>
              <p className="max-w-[900px] text-2xl text-gray-600 leading-relaxed font-light">
                اكتشف أحدث منصة رقمية لقوائم المطاعم، مصممة خصيصاً للسوق العربي المتطور.
              </p>
            </div>

            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-3">
              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-105 hover:-translate-y-4 rounded-3xl overflow-hidden border border-red-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-6 relative">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <QrCode className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    توليد أكواد QR بالذكاء الاصطناعي
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-600 leading-relaxed font-light">
                    إنشاء أكواد QR مذهلة ومخصصة حسب علامتك التجارية. تحليلات فورية لتتبع كل مسح وتفاعل العملاء.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-rose-500/25 transition-all duration-700 hover:scale-105 hover:-translate-y-4 rounded-3xl overflow-hidden border border-rose-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-6 relative">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <FileText className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    مصمم PDF فاخر
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-600 leading-relaxed font-light">
                    قوائم PDF احترافية مع خطوط عربية رائعة. قوالب مميزة مصممة من قبل أفضل المصممين العالميين.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-700 hover:scale-105 hover:-translate-y-4 rounded-3xl overflow-hidden border border-pink-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-6 relative">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Smartphone className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    أداء خاطف
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-600 leading-relaxed font-light">
                    أوقات تحميل أقل من ثانية على أي جهاز. محسّن لأسرع تجربة محمولة رآها عملاؤك.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-700 hover:scale-105 hover:-translate-y-4 rounded-3xl overflow-hidden border border-pink-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-6 relative">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Smartphone className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    أداء خاطف
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-600 leading-relaxed font-light">
                    أوقات تحميل أقل من ثانية على أي جهاز. محسّن لأسرع تجربة محمولة رآها عملاؤك.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-105 hover:-translate-y-4 rounded-3xl overflow-hidden border border-red-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-6 relative">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Languages className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    إتقان ثقافي
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-600 leading-relaxed font-light">
                    مبني من قبل خبراء عرب للسوق العربي. خط عربي مثالي، دعم RTL، وتكامل مع أنظمة الدفع المحلية.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-rose-500/25 transition-all duration-700 hover:scale-105 hover:-translate-y-4 rounded-3xl overflow-hidden border border-rose-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-6 relative">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-rose-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Zap className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    تحديث فوري لكل شيء
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-600 leading-relaxed font-light">
                    تحديث الأسعار والأصناف والأوصاف فورياً. تظهر التغييرات على الفور عبر جميع أجهزة العملاء.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* New Customer Success Stories Section */}
        <section className="w-full py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-white to-rose-50/30"></div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-20">
              <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-8 py-4 text-xl font-black backdrop-blur-xl">
                <Star className="ml-3 h-6 w-6" />
                قصص نجاح ملهمة
              </Badge>
              <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                  عملاؤنا يحققون
                </span>
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
                  نتائج استثنائية
                </span>
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-105 rounded-3xl p-8">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">مطعم الأصالة</h3>
                      <p className="text-red-600 font-semibold">الرياض، السعودية</p>
                    </div>
                  </div>
                  <blockquote className="text-lg text-gray-700 leading-relaxed">
                    "زادت مبيعاتنا بنسبة 45% خلال الشهر الأول من استخدام Menu-p. العملاء أصبحوا يطلبون أكثر لأن القائمة أصبحت واضحة وجذابة."
                  </blockquote>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-red-500 text-red-500" />
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-rose-500/25 transition-all duration-700 hover:scale-105 rounded-3xl p-8">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-red-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">كافيه المدينة</h3>
                      <p className="text-rose-600 font-semibold">دبي، الإمارات</p>
                    </div>
                  </div>
                  <blockquote className="text-lg text-gray-700 leading-relaxed">
                    "وفرنا آلاف الدراهم على طباعة القوائم وتوظيف موظفين إضافيين. النظام يدير نفسه تلقائياً!"
                  </blockquote>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-rose-500 text-rose-500" />
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-2xl hover:shadow-red-600/25 transition-all duration-700 hover:scale-105 rounded-3xl p-8">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                      <Rocket className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">مطعم البحر</h3>
                      <p className="text-red-600 font-semibold">الكويت</p>
                    </div>
                  </div>
                  <blockquote className="text-lg text-gray-700 leading-relaxed">
                    "أفضل استثمار في تاريخ مطعمنا. العملاء يمدحون سهولة الاستخدام ووضوح الصور والأسعار."
                  </blockquote>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-red-600 text-red-600" />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* New Pricing Section */}
        <section id="pricing" className="w-full py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/20"></div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-20">
              <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-8 py-4 text-xl font-black backdrop-blur-xl">
                <Crown className="ml-3 h-6 w-6" />
                خطط الاشتراك
              </Badge>
              <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                  اختر الخطة
                </span>
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
                  المناسبة لمطعمك
                </span>
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
              {/* Basic Plan */}
              <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-xl rounded-3xl p-8 relative">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">الخطة الأساسية</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-gray-900">99 ريال</span>
                    <span className="text-gray-600 font-semibold">/شهرياً</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">قائمة رقمية واحدة</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">كود QR مخصص</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">تحديثات فورية</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">دعم عبر البريد الإلكتروني</span>
                  </div>
                  <Button className="w-full mt-8 bg-gray-600 hover:bg-gray-700 text-white py-3">
                    ابدأ التجربة المجانية
                  </Button>
                </CardContent>
              </Card>

              {/* Professional Plan - Most Popular */}
              <Card className="border-0 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 relative border-2 border-red-500 scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-2 text-lg font-bold">
                    الأكثر شعبية
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">الخطة الاحترافية</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">199 ريال</span>
                    <span className="text-gray-600 font-semibold">/شهرياً</span>
                  </div>
                  <p className="text-sm text-red-600 font-semibold mt-2">وفر 20% سنوياً</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">5 قوائم رقمية</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">أكواد QR مخصصة بالكامل</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">تحليلات متقدمة</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">دعم هاتفي مباشر</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">قوالب PDF مميزة</span>
                  </div>
                  <Button className="w-full mt-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-3">
                    ابدأ الآن - تجربة مجانية
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-xl rounded-3xl p-8 relative">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">خطة المؤسسات</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-gray-900">399 ريال</span>
                    <span className="text-gray-600 font-semibold">/شهرياً</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">قوائم غير محدودة</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">تصميم مخصص بالكامل</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">API تكامل متقدم</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">مدير حساب مخصص</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CheckCircle className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">دعم أولوية 24/7</span>
                  </div>
                  <Button className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3">
                    تواصل معنا
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-16">
              <p className="text-xl text-gray-600 mb-6">جميع الخطط تشمل تجربة مجانية لمدة 14 يوم - بدون بطاقة ائتمان</p>
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Shield className="h-4 w-4" />
                  <span>SSL مجاني</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Globe className="h-4 w-4" />
                  <span>CDN عالمي</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="h-4 w-4" />
                  <span>نسخ احتياطية يومية</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced FAQ Section */}
        <section className="w-full py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-white to-rose-50/20"></div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-20">
              <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-8 py-4 text-xl font-black backdrop-blur-xl">
                <MenuIcon className="ml-3 h-6 w-6" />
                الأسئلة الشائعة
              </Badge>
              <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                  إجابات على
                </span>
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
                  استفساراتك
                </span>
              </h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-xl rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">كم يستغرق إعداد القائمة الرقمية؟</h3>
                <p className="text-gray-700 leading-relaxed">
                  يمكنك إعداد قائمتك الرقمية الأولى في أقل من 60 ثانية! فقط ارفع صور الأطباق، أضف الأسماء والأسعار، وستحصل على كود QR جاهز للاستخدام فوراً.
                </p>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-xl rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">هل يعمل النظام مع الهواتف القديمة؟</h3>
                <p className="text-gray-700 leading-relaxed">
                  نعم، نظامنا محسّن للعمل على جميع الأجهزة حتى الهواتف القديمة. لا يحتاج العملاء لتحميل أي تطبيق - فقط مسح كود QR وفتح القائمة في المتصفح.
                </p>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-xl rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">هل يمكنني تغيير الأسعار في أي وقت؟</h3>
                <p className="text-gray-700 leading-relaxed">
                  بالطبع! يمكنك تحديث الأسعار والأصناف والصور في أي وقت من لوحة التحكم. التغييرات تظهر فوراً على جميع أجهزة العملاء دون الحاجة لطباعة قوائم جديدة.
                </p>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-xl rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">ماذا لو انقطع الإنترنت؟</h3>
                <p className="text-gray-700 leading-relaxed">
                  لا مشكلة! يمكنك طباعة نسخة PDF احتياطية من قائمتك في أي وقت. كما نوفر كود QR احتياطي يعمل حتى مع اتصال إنترنت ضعيف.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Premium CTA Section with Red Theme */}
        <section className="w-full py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-600 via-red-500 to-red-700"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-12 text-center">
              <div className="space-y-8">
                <h2 className="text-5xl font-black tracking-tight sm:text-7xl text-white">
                  مستعد للسيطرة على السوق؟
                </h2>
                <p className="max-w-[800px] text-2xl text-red-100 leading-relaxed font-light">
                  انضم إلى النخبة من +500 مطعم مميز عبر المنطقة العربية. حوّل أعمالك بمنصتنا الثورية في الـ 60 ثانية القادمة.
                </p>
              </div>

              <div className="w-full max-w-lg space-y-6">
                <form className="flex gap-4" dir="ltr">
                  <Input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني المميز"
                    className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-blue-200 backdrop-blur-xl h-16 text-xl rounded-2xl text-right"
                    dir="rtl"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-white/25 transition-all duration-500 hover:scale-110 px-10 h-16 text-xl font-black rounded-2xl"
                  >
                    <Rocket className="ml-2 h-6 w-6" />
                    ابدأ الآن
                  </Button>
                </form>
                <p className="text-lg text-blue-200 font-semibold">
                  ⚡ بدون بطاقة ائتمان • تجربة مجانية 14 يوم • إلغاء في أي وقت • إعداد شخصي
                </p>
              </div>

              <div className="grid grid-cols-3 gap-12 pt-12">
                <div className="text-center">
                  <div className="text-4xl font-black text-white">60 ثانية</div>
                  <div className="text-blue-200 font-semibold text-lg">وقت الإعداد</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">24/7</div>
                  <div className="text-blue-200 font-semibold text-lg">دعم فني مميز</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">0 ريال</div>
                  <div className="text-blue-200 font-semibold text-lg">تكلفة الإعداد</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
  {/* Enhanced Premium Footer with Red Theme */}
<footer className="relative overflow-hidden">
  {/* Animated Background */}
  <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-rose-900"></div>
  <div className="absolute inset-0">
    <div className="absolute top-10 right-20 w-32 h-32 bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-10 left-20 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
    
    {/* Floating Icons */}
    <div className="absolute top-8 left-16 w-4 h-4 bg-red-400 rounded-full animate-bounce delay-300"></div>
    <div className="absolute bottom-12 right-24 w-3 h-3 bg-rose-400 rounded-full animate-bounce delay-700"></div>
    <div className="absolute top-20 right-1/3 w-2 h-2 bg-red-300 rounded-full animate-bounce delay-1000"></div>
  </div>

  {/* Main Footer Content */}
  <div className="relative z-10 container mx-auto px-4 md:px-6 py-20">
    {/* Top Section */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
      {/* Brand Section */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-red-600 to-rose-600 p-4 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <QrCode className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-black bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
              Menu-p
            </span>
            <div className="text-sm text-red-300 font-bold tracking-wider">PREMIUM EDITION</div>
          </div>
        </div>
        
        <p className="text-xl text-red-100 leading-relaxed font-light max-w-md">
          نثور في صناعة المطاعم العربية بالابتكار الرقمي المتطور. منصة شاملة لتحويل أعمالك إلى العصر الرقمي.
        </p>

        {/* Premium Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-red-100">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">ضمان 99.9%</span>
          </div>
          <div className="flex items-center gap-3 text-red-100">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">أمان مطلق</span>
          </div>
          <div className="flex items-center gap-3 text-red-100">
            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">دعم 24/7</span>
          </div>
          <div className="flex items-center gap-3 text-red-100">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">حلول مميزة</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-white mb-6">روابط سريعة</h3>
        <nav className="flex flex-col space-y-4">
          <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-lg group" href="#features">
            <span className="flex items-center gap-3">
              <ArrowLeft className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              المميزات الاحترافية
            </span>
          </Link>
          <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-lg group" href="#pricing">
            <span className="flex items-center gap-3">
              <ArrowLeft className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              خطط الأسعار
            </span>
          </Link>
          <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-lg group" href="#contact">
            <span className="flex items-center gap-3">
              <ArrowLeft className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              اتصل بفريقنا
            </span>
          </Link>
          <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-lg group" href="/demo">
            <span className="flex items-center gap-3">
              <Play className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              عرض توضيحي
            </span>
          </Link>
        </nav>
      </div>

      {/* Contact & Support */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-white mb-6">دعم مميز</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-red-100">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-red-400/30">
              <Globe className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <div className="font-bold text-white">متاح عالمياً</div>
              <div className="text-sm">15 دولة عربية</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-red-100">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-red-400/30">
              <Clock className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <div className="font-bold text-white">استجابة فورية</div>
              <div className="text-sm">أقل من 5 دقائق</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-red-100">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-red-400/30">
              <Users className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <div className="font-bold text-white">خبراء متخصصين</div>
              <div className="text-sm">فريق احترافي</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Premium Stats Bar */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-red-600/30">
      <div className="text-center group hover:scale-110 transition-all duration-500">
        <div className="text-4xl font-black text-white mb-2">+500</div>
        <div className="text-red-200 font-semibold">مطعم مميز</div>
      </div>
      <div className="text-center group hover:scale-110 transition-all duration-500">
        <div className="text-4xl font-black text-white mb-2">+50k</div>
        <div className="text-red-200 font-semibold">كود QR نشط</div>
      </div>
      <div className="text-center group hover:scale-110 transition-all duration-500">
        <div className="text-4xl font-black text-white mb-2">15</div>
        <div className="text-red-200 font-semibold">دولة عربية</div>
      </div>
      <div className="text-center group hover:scale-110 transition-all duration-500">
        <div className="text-4xl font-black text-white mb-2">99.9%</div>
        <div className="text-red-200 font-semibold">وقت التشغيل</div>
      </div>
    </div>

    {/* Bottom Section */}
    <div className="flex flex-col lg:flex-row justify-between items-center gap-8 pt-12">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <p className="text-red-100 font-semibold text-lg">
          © 2024 Menu-p Premium Edition. جميع الحقوق محفوظة.
        </p>
        <div className="flex items-center gap-2 bg-red-800/50 border border-red-600/30 rounded-full px-4 py-2 backdrop-blur-xl">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-100 font-bold">النظام يعمل بكامل طاقته</span>
        </div>
      </div>

      <nav className="flex flex-wrap gap-8 justify-center lg:justify-end">
        <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-lg hover:scale-110" href="/terms">
          شروط الخدمة
        </Link>
        <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-lg hover:scale-110" href="/privacy">
          سياسة الخصوصية
        </Link>
        <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-lg hover:scale-110" href="/support">
          الدعم المميز
        </Link>
        <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-lg hover:scale-110" href="/api">
          API للمطورين
        </Link>
      </nav>
    </div>

    {/* Premium Badge */}
    <div className="flex justify-center pt-8">
      <div className="flex items-center gap-3 bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-400/30 rounded-full px-8 py-4 backdrop-blur-xl">
        <Award className="h-6 w-6 text-red-300" />
        <span className="text-red-100 font-bold text-lg">منصة معتمدة ومرخصة رسمياً</span>
        <Sparkles className="h-6 w-6 text-red-300 animate-pulse" />
      </div>
    </div>
  </div>
</footer>
    </div>
  )
} 