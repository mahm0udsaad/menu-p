import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, Shield, Globe, Clock } from "lucide-react"

export default function PricingSection() {
  return (
    <section id="pricing" className="w-full py-16 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/20"></div>
      
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 text-center mb-12 md:mb-20">
          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-black backdrop-blur-xl">
            <Crown className="ml-3 h-5 md:h-6 w-5 md:w-6" />
            خطط الاشتراك
          </Badge>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
              اختر الخطة
            </span>
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
              المناسبة لمطعمك
            </span>
          </h2>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-lg md:shadow-xl rounded-2xl md:rounded-3xl p-6 md:p-8 relative">
            <CardHeader className="text-center pb-6 md:pb-8">
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">الخطة الأساسية</CardTitle>
              <div className="mt-2 md:mt-4">
                <span className="text-2xl md:text-4xl font-black text-gray-900">99 ريال</span>
                <span className="text-gray-600 font-semibold">/شهرياً</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-green-500" />
                <span className="text-sm md:text-base text-gray-700">قائمة رقمية واحدة</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-green-500" />
                <span className="text-sm md:text-base text-gray-700">كود QR مخصص</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-green-500" />
                <span className="text-sm md:text-base text-gray-700">تحديثات فورية</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-green-500" />
                <span className="text-sm md:text-base text-gray-700">دعم عبر البريد الإلكتروني</span>
              </div>
              <Button className="w-full mt-6 md:mt-8 bg-gray-600 hover:bg-gray-700 text-white py-2 md:py-3">
                ابدأ التجربة المجانية
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan - Most Popular */}
          <Card className="border-0 bg-white/95 backdrop-blur-2xl shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 relative border-2 border-red-500 scale-100 md:scale-105">
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 md:px-6 py-1 md:py-2 text-sm md:text-lg font-bold">
                الأكثر شعبية
              </Badge>
            </div>
            <CardHeader className="text-center pb-6 md:pb-8">
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">الخطة الاحترافية</CardTitle>
              <div className="mt-2 md:mt-4">
                <span className="text-2xl md:text-4xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">199 ريال</span>
                <span className="text-gray-600 font-semibold">/شهرياً</span>
              </div>
              <p className="text-xs md:text-sm text-red-600 font-semibold mt-1 md:mt-2">وفر 20% سنوياً</p>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-500" />
                <span className="text-sm md:text-base text-gray-700">5 قوائم رقمية</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-500" />
                <span className="text-sm md:text-base text-gray-700">أكواد QR مخصصة بالكامل</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-500" />
                <span className="text-sm md:text-base text-gray-700">تحليلات متقدمة</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-500" />
                <span className="text-sm md:text-base text-gray-700">دعم هاتفي مباشر</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-500" />
                <span className="text-sm md:text-base text-gray-700">قوالب PDF مميزة</span>
              </div>
              <Button className="w-full mt-6 md:mt-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-2 md:py-3">
                ابدأ الآن - تجربة مجانية
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-lg md:shadow-xl rounded-2xl md:rounded-3xl p-6 md:p-8 relative">
            <CardHeader className="text-center pb-6 md:pb-8">
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">خطة المؤسسات</CardTitle>
              <div className="mt-2 md:mt-4">
                <span className="text-2xl md:text-4xl font-black text-gray-900">399 ريال</span>
                <span className="text-gray-600 font-semibold">/شهرياً</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-600" />
                <span className="text-sm md:text-base text-gray-700">قوائم غير محدودة</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-600" />
                <span className="text-sm md:text-base text-gray-700">تصميم مخصص بالكامل</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-600" />
                <span className="text-sm md:text-base text-gray-700">API تكامل متقدم</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-600" />
                <span className="text-sm md:text-base text-gray-700">مدير حساب مخصص</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-red-600" />
                <span className="text-sm md:text-base text-gray-700">دعم أولوية 24/7</span>
              </div>
              <Button className="w-full mt-6 md:mt-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-2 md:py-3">
                تواصل معنا
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 md:mt-16">
          <p className="text-base md:text-xl text-gray-600 mb-4 md:mb-6">جميع الخطط تشمل تجربة مجانية لمدة 14 يوم - بدون بطاقة ائتمان</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-500">
            <div className="flex items-center space-x-1 md:space-x-2 space-x-reverse">
              <Shield className="h-3 md:h-4 w-3 md:w-4" />
              <span>SSL مجاني</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 space-x-reverse">
              <Globe className="h-3 md:h-4 w-3 md:w-4" />
              <span>CDN عالمي</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 space-x-reverse">
              <Clock className="h-3 md:h-4 w-3 md:w-4" />
              <span>نسخ احتياطية يومية</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
