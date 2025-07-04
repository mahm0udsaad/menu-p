import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, FileText, Smartphone, Languages, Zap, Flame } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full py-16 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-rose-50/30"></div>

      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 text-center mb-12 md:mb-20">
          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-black backdrop-blur-xl shadow-lg">
            <Flame className="ml-3 h-5 md:h-6 w-5 md:w-6" />
            مميزات ثورية
          </Badge>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
              أكثر من مجرد
            </span>
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
              قائمة رقمية عادية
            </span>
          </h2>
          <p className="max-w-[900px] text-lg md:text-2xl text-gray-600 leading-relaxed font-light">
            اكتشف أحدث منصة رقمية لقوائم المطاعم، مصممة خصيصاً للسوق العربي المتطور.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 md:gap-12 lg:grid-cols-3">
          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 hover:-translate-y-2 md:hover:-translate-y-4 rounded-2xl md:rounded-3xl overflow-hidden border border-red-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 md:pb-6 relative">
              <div className="relative mb-4 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500">
                  <QrCode className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                توليد أكواد QR بالذكاء الاصطناعي
              </CardTitle>
              <CardDescription className="text-base md:text-xl text-gray-600 leading-relaxed font-light">
                إنشاء أكواد QR مذهلة ومخصصة حسب علامتك التجارية. تحليلات فورية لتتبع كل مسح وتفاعل العملاء.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-rose-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 hover:-translate-y-2 md:hover:-translate-y-4 rounded-2xl md:rounded-3xl overflow-hidden border border-rose-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 md:pb-6 relative">
              <div className="relative mb-4 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500">
                  <FileText className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                مصمم PDF فاخر
              </CardTitle>
              <CardDescription className="text-base md:text-xl text-gray-600 leading-relaxed font-light">
                قوائم PDF احترافية مع خطوط عربية رائعة. قوالب مميزة مصممة من قبل أفضل المصممين العالميين.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-pink-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 hover:-translate-y-2 md:hover:-translate-y-4 rounded-2xl md:rounded-3xl overflow-hidden border border-pink-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 md:pb-6 relative">
              <div className="relative mb-4 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500">
                  <Smartphone className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                أداء خاطف
              </CardTitle>
              <CardDescription className="text-base md:text-xl text-gray-600 leading-relaxed font-light">
                أوقات تحميل أقل من ثانية على أي جهاز. محسّن لأسرع تجربة محمولة رآها عملاؤك.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-pink-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 hover:-translate-y-2 md:hover:-translate-y-4 rounded-2xl md:rounded-3xl overflow-hidden border border-pink-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 md:pb-6 relative">
              <div className="relative mb-4 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500">
                  <Smartphone className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                أداء خاطف
              </CardTitle>
              <CardDescription className="text-base md:text-xl text-gray-600 leading-relaxed font-light">
                أوقات تحميل أقل من ثانية على أي جهاز. محسّن لأسرع تجربة محمولة رآها عملاؤك.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 hover:-translate-y-2 md:hover:-translate-y-4 rounded-2xl md:rounded-3xl overflow-hidden border border-red-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 md:pb-6 relative">
              <div className="relative mb-4 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500">
                  <Languages className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                إتقان ثقافي
              </CardTitle>
              <CardDescription className="text-base md:text-xl text-gray-600 leading-relaxed font-light">
                مبني من قبل خبراء عرب للسوق العربي. خط عربي مثالي، دعم RTL، وتكامل مع أنظمة الدفع المحلية.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-rose-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 hover:-translate-y-2 md:hover:-translate-y-4 rounded-2xl md:rounded-3xl overflow-hidden border border-rose-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 md:pb-6 relative">
              <div className="relative mb-4 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500">
                  <Zap className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                تحديث فوري لكل شيء
              </CardTitle>
              <CardDescription className="text-base md:text-xl text-gray-600 leading-relaxed font-light">
                تحديث الأسعار والأصناف والأوصاف فورياً. تظهر التغييرات على الفور عبر جميع أجهزة العملاء.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}
