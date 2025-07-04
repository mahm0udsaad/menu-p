import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  ArrowLeft,
  Play,
  Crown,
  Rocket,
  Languages,
  Bolt, 
  Sandwich ,
  ChefHat,
  Utensils,
  Coffee,
} from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative w-full py-12 md:py-20 lg:py-24 overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center text-center space-y-8 md:space-y-12 max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4">
            <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 hover:from-red-200 hover:to-rose-200 border border-red-200 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold backdrop-blur-xl shadow-lg">
              <Crown className="ml-2 h-4 md:h-5 w-4 md:w-5 text-red-600" />
              المنصة الرقمية الأولى للمطاعم في المنطقة
            </Badge>
            <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-3 md:px-4 py-1 md:py-2 backdrop-blur-xl shadow-lg">
              <div className="w-2 md:w-3 h-2 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm text-green-700 font-bold">+500 مطعم نشط</span>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
                أنشئ قائمة طعام رقمية
              </span>
              <span className="bg-gradient-to-r from-red-600 via-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent block animate-pulse">
                PDF ورمز QR لمطعمك
              </span>
            </h1>

            <p className="max-w-4xl mx-auto text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed font-light">
              منصة ثورية لإنشاء أكواد QR وقوائم PDF مصممة خصيصاً للمطاعم والمقاهي العربية المتطورة.
              <span className="text-red-600 font-semibold"> اربح الوقت وحول أعمالك في 60 ثانية.</span>
            </p>
            <p className="max-w-4xl mx-auto text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed font-light">
              استخدم أفضل مولد قوائم PDF لإنشاء قائمة طعام احترافية. صمم قائمة رقمية فريدة لمطعمك مع كود QR قابل للطباعة.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-2xl">
            <div className="flex-1">
              <Button
                size="lg"
                asChild
                className="group bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 shadow-2xl hover:shadow-red-500/50 transition-all duration-500 text-lg md:text-xl px-6 md:px-12 py-4 md:py-6 border border-red-400/50 text-white w-full"
              >
                <Link href="/auth/sign-up">
                  <Rocket className="ml-3 h-5 md:h-6 w-5 md:w-6 group-hover:animate-bounce" />
                  اطلق قائمتك الرقمية
                  <ArrowLeft className="mr-3 h-5 md:h-6 w-5 md:w-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 backdrop-blur-xl transition-all duration-500 text-lg md:text-xl px-6 md:px-12 py-4 md:py-6 w-full shadow-lg hover:shadow-red-500/20"
              >
                <Play className="ml-3 h-5 md:h-6 w-5 md:w-6 group-hover:scale-125 transition-transform" />
                شاهد العرض التوضيحي
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8 pt-4 md:pt-8 w-full max-w-3xl">
            <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-3 text-gray-700 bg-white/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 md:h-5 w-3 md:w-5 text-white" />
              </div>
              <span className="font-bold text-sm md:text-lg">بدون تكلفة إعداد</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-3 text-gray-700 bg-white/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                <Languages className="h-3 md:h-5 w-3 md:w-5 text-white" />
              </div>
              <span className="font-bold text-sm md:text-lg">عربي + إنجليزي</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-3 text-gray-700 bg-white/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bolt className="h-3 md:h-5 w-3 md:w-5 text-white" />
              </div>
              <span className="font-bold text-sm md:text-lg">إعداد في 60 ثانية</span>
            </div>
          </div>
        </div>

        {/* Enhanced Floating Space Icons - Perfectly Centered */}
        <div className="absolute inset-0 pointer-events-none z-0">
              <div className="hidden md:flex absolute top-20 right-10 w-24 h-24 bg-gradient-to-r from-red-400 to-rose-400 rounded-3xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-red-300/30 animate-bounce delay-800">
                <ChefHat className="h-8 md:h-12 w-8 md:w-12 text-white" />
              </div>
              <div className="hidden md:flex absolute top-32 left-16 w-20 h-20 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-rose-300/30 animate-bounce delay-800">
                <Utensils className="h-8 md:h-10 w-8 md:w-10 text-white" />
              </div>
              <div className="hidden md:flex absolute bottom-32 right-16 w-22 h-22 bg-gradient-to-r from-red-400 to-rose-400 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-red-300/30 animate-bounce delay-800">
                <Coffee className="size-8 md:size-12 p-2 md:p-4 text-white" />
              </div>
              <div className="hidden md:flex absolute bottom-20 left-12 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-xl border border-pink-300/30 animate-bounce delay-800">
                <Sandwich className="size-6 md:size-12 text-white" />
              </div>
        </div>
      </div>
    </section>
  )
}