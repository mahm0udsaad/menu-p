import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Rocket, Shield, Clock, CreditCard, CheckCircle, Sparkles, Crown, Zap } from "lucide-react"

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Main Card Container */}
      <div className="w-11/12 mx-auto relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-3xl md:rounded-[3rem] shadow-2xl border border-gray-200/50 backdrop-blur-xl">
        
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 rounded-3xl md:rounded-[3rem] overflow-hidden">
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-red-200/40 to-rose-300/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-16 left-16 w-40 h-40 bg-gradient-to-br from-pink-200/40 to-red-200/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-xl animate-pulse delay-500"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}></div>
          </div>
        </div>

        <div className="relative container px-6 md:px-12 py-12 md:py-20">
          <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 text-center">
            
            {/* Header Section */}
            <div className="space-y-4 md:space-y-6 max-w-4xl">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 rounded-full px-4 py-2 backdrop-blur-xl shadow-lg">
                  <Crown className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 font-bold text-sm">العرض الحصري</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                مستعد للسيطرة على السوق؟
              </h2>
              <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                انضم إلى النخبة من <span className="font-bold text-red-600">+500 مطعم مميز</span> عبر المنطقة العربية. 
                حوّل أعمالك بمنصتنا الثورية في الـ <span className="font-bold text-red-600">60 ثانية</span> القادمة.
              </p>
            </div>

            {/* CTA Form */}
            <div className="w-full max-w-2xl space-y-6">
              <form className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-200" dir="ltr">
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني المميز"
                  className="flex-1 bg-transparent border-0 text-gray-800 placeholder:text-gray-500 h-14 md:h-16 text-lg md:text-xl rounded-xl md:rounded-2xl text-right focus:ring-0 focus:outline-none"
                  dir="rtl"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white shadow-xl hover:shadow-red-500/50 transition-all duration-500 hover:scale-105 px-6 md:px-10 h-14 md:h-16 text-lg md:text-xl font-bold rounded-xl md:rounded-2xl border border-red-400/50"
                >
                  <Rocket className="ml-2 h-5 md:h-6 w-5 md:w-6" />
                  ابدأ الآن
                </Button>
              </form>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>بدون بطاقة ائتمان</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>تجربة مجانية 14 يوم</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>إلغاء في أي وقت</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 pt-8 md:pt-12 w-full max-w-4xl">
              <div className="text-center p-4 md:p-6 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">60 ثانية</div>
                <div className="text-gray-600 font-semibold text-sm md:text-base mt-1">وقت الإعداد</div>
              </div>
              
              <div className="text-center p-4 md:p-6 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">24/7</div>
                <div className="text-gray-600 font-semibold text-sm md:text-base mt-1">دعم فني مميز</div>
              </div>
              
              <div className="text-center p-4 md:p-6 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">0 ريال</div>
                <div className="text-gray-600 font-semibold text-sm md:text-base mt-1">تكلفة الإعداد</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}