import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu as MenuIcon } from "lucide-react"

export default function FaqSection() {
  return (
    <section className="w-full py-16 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-white to-rose-50/20"></div>
      
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 text-center mb-12 md:mb-20">
          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-black backdrop-blur-xl">
            <MenuIcon className="ml-3 h-5 md:h-6 w-5 md:w-6" />
            الأسئلة الشائعة
          </Badge>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block">
              إجابات على
            </span>
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent block">
              استفساراتك
            </span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-lg md:shadow-xl rounded-xl md:rounded-2xl p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">كم يستغرق إعداد القائمة الرقمية؟</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              يمكنك إعداد قائمتك الرقمية الأولى في أقل من 60 ثانية! فقط ارفع صور الأطباق، أضف الأسماء والأسعار، وستحصل على كود QR جاهز للاستخدام فوراً.
            </p>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-lg md:shadow-xl rounded-xl md:rounded-2xl p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">هل يعمل النظام مع الهواتف القديمة؟</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              نعم، نظامنا محسّن للعمل على جميع الأجهزة حتى الهواتف القديمة. لا يحتاج العملاء لتحميل أي تطبيق - فقط مسح كود QR وفتح القائمة في المتصفح.
            </p>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-lg md:shadow-xl rounded-xl md:rounded-2xl p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">هل يمكنني تغيير الأسعار في أي وقت؟</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              بالطبع! يمكنك تحديث الأسعار والأصناف والصور في أي وقت من لوحة التحكم. التغييرات تظهر فوراً على جميع أجهزة العملاء دون الحاجة لطباعة قوائم جديدة.
            </p>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-2xl shadow-lg md:shadow-xl rounded-xl md:rounded-2xl p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">ماذا لو انقطع الإنترنت؟</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              لا مشكلة! يمكنك طباعة نسخة PDF احتياطية من قائمتك في أي وقت. كما نوفر كود QR احتياطي يعمل حتى مع اتصال إنترنت ضعيف.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
