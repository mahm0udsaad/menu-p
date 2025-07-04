import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Award, TrendingUp, Rocket } from "lucide-react"

export default function TestimonialsSection() {
  return (
    <section className="w-full py-16 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-white to-rose-50/30"></div>
      
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 text-center mb-12 md:mb-20">
          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-black backdrop-blur-xl">
            <Star className="ml-3 h-5 md:h-6 w-5 md:w-6" />
            قصص نجاح ملهمة
          </Badge>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
              عملاؤنا يحققون
            </span>
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
              نتائج استثنائية
            </span>
          </h2>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-red-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 rounded-2xl md:rounded-3xl p-6 md:p-8">
            <div className="flex flex-col space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3 md:space-x-4 space-x-reverse">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Award className="h-5 md:h-8 w-5 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">مطعم الأصالة</h3>
                  <p className="text-red-600 font-semibold text-sm md:text-base">الرياض، السعودية</p>
                </div>
              </div>
              <blockquote className="text-base md:text-lg text-gray-700 leading-relaxed">
                "زادت مبيعاتنا بنسبة 45% خلال الشهر الأول من استخدام Menu-p. العملاء أصبحوا يطلبون أكثر لأن القائمة أصبحت واضحة وجذابة."
              </blockquote>
              <div className="flex items-center space-x-1 space-x-reverse">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 md:h-5 w-4 md:w-5 fill-red-500 text-red-500" />
                ))}
              </div>
            </div>
          </Card>

          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-rose-500/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 rounded-2xl md:rounded-3xl p-6 md:p-8">
            <div className="flex flex-col space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3 md:space-x-4 space-x-reverse">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-rose-500 to-red-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 md:h-8 w-5 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">كافيه المدينة</h3>
                  <p className="text-rose-600 font-semibold text-sm md:text-base">دبي، الإمارات</p>
                </div>
              </div>
              <blockquote className="text-base md:text-lg text-gray-700 leading-relaxed">
                "وفرنا آلاف الدراهم على طباعة القوائم وتوظيف موظفين إضافيين. النظام يدير نفسه تلقائياً!"
              </blockquote>
              <div className="flex items-center space-x-1 space-x-reverse">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 md:h-5 w-4 md:w-5 fill-rose-500 text-rose-500" />
                ))}
              </div>
            </div>
          </Card>

          <Card className="group border-0 bg-white/90 backdrop-blur-2xl shadow-xl md:shadow-2xl hover:shadow-red-600/25 transition-all duration-700 hover:scale-100 md:hover:scale-105 rounded-2xl md:rounded-3xl p-6 md:p-8">
            <div className="flex flex-col space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3 md:space-x-4 space-x-reverse">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                  <Rocket className="h-5 md:h-8 w-5 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">مطعم البحر</h3>
                  <p className="text-red-600 font-semibold text-sm md:text-base">الكويت</p>
                </div>
              </div>
              <blockquote className="text-base md:text-lg text-gray-700 leading-relaxed">
                "أفضل استثمار في تاريخ مطعمنا. العملاء يمدحون سهولة الاستخدام ووضوح الصور والأسعار."
              </blockquote>
              <div className="flex items-center space-x-1 space-x-reverse">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 md:h-5 w-4 md:w-5 fill-red-600 text-red-600" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
