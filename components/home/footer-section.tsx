import Link from "next/link"
import { QrCode, CheckCircle, Shield, Zap, Crown, Globe, Clock, Users, Award, Sparkles, ArrowLeft, Play } from "lucide-react"

export default function FooterSection() {
  return (
    <footer className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-rose-800 to-red-900"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-32 h-32 bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating Icons */}
        <div className="hidden sm:block absolute top-8 left-16 w-4 h-4 bg-red-400 rounded-full animate-bounce delay-300"></div>
        <div className="hidden sm:block absolute bottom-12 right-24 w-3 h-3 bg-rose-400 rounded-full animate-bounce delay-700"></div>
        <div className="hidden sm:block absolute top-20 right-1/3 w-2 h-2 bg-red-300 rounded-full animate-bounce delay-1000"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-red-600 to-rose-600 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
              <div>
                <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                  Menu-p
                </span>
                <div className="text-xs md:text-sm text-red-300 font-bold tracking-wider">PREMIUM EDITION</div>
              </div>
            </div>
            
            <p className="text-base md:text-xl text-red-100 leading-relaxed font-light max-w-md">
              نثور في صناعة المطاعم العربية بالابتكار الرقمي المتطور. منصة شاملة لتحويل أعمالك إلى العصر الرقمي.
            </p>

            {/* Premium Features */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 text-red-100">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 md:h-4 w-3 md:w-4 text-white" />
                </div>
                <span className="font-semibold text-sm md:text-base">ضمان 99.9%</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-red-100">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Shield className="h-3 md:h-4 w-3 md:w-4 text-white" />
                </div>
                <span className="font-semibold text-sm md:text-base">أمان مطلق</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-red-100">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Zap className="h-3 md:h-4 w-3 md:w-4 text-white" />
                </div>
                <span className="font-semibold text-sm md:text-base">دعم 24/7</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-red-100">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Crown className="h-3 md:h-4 w-3 md:w-4 text-white" />
                </div>
                <span className="font-semibold text-sm md:text-base">حلول مميزة</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-black text-white mb-4 md:mb-6">روابط سريعة</h3>
            <nav className="flex flex-col space-y-3 md:space-y-4">
              <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-base md:text-lg group" href="#features">
                <span className="flex items-center gap-2 md:gap-3">
                  <ArrowLeft className="h-3 md:h-4 w-3 md:w-4 group-hover:translate-x-1 transition-transform" />
                  المميزات الاحترافية
                </span>
              </Link>
              <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-base md:text-lg group" href="#pricing">
                <span className="flex items-center gap-2 md:gap-3">
                  <ArrowLeft className="h-3 md:h-4 w-3 md:w-4 group-hover:translate-x-1 transition-transform" />
                  خطط الأسعار
                </span>
              </Link>
              <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-base md:text-lg group" href="#contact">
                <span className="flex items-center gap-2 md:gap-3">
                  <ArrowLeft className="h-3 md:h-4 w-3 md:w-4 group-hover:translate-x-1 transition-transform" />
                  اتصل بفريقنا
                </span>
              </Link>
              <Link className="text-red-100 hover:text-white transition-all duration-300 hover:translate-x-2 font-semibold text-base md:text-lg group" href="/demo">
                <span className="flex items-center gap-2 md:gap-3">
                  <Play className="h-3 md:h-4 w-3 md:w-4 group-hover:translate-x-1 transition-transform" />
                  عرض توضيحي
                </span>
              </Link>
            </nav>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-black text-white mb-4 md:mb-6">دعم مميز</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4 text-red-100">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-xl border border-red-400/30">
                  <Globe className="h-4 md:h-5 w-4 md:w-5 text-red-300" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm md:text-base">متاح عالمياً</div>
                  <div className="text-xs md:text-sm">15 دولة عربية</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:gap-4 text-red-100">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-xl border border-red-400/30">
                  <Clock className="h-4 md:h-5 w-4 md:w-5 text-red-300" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm md:text-base">استجابة فورية</div>
                  <div className="text-xs md:text-sm">أقل من 5 دقائق</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:gap-4 text-red-100">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-xl border border-red-400/30">
                  <Users className="h-4 md:h-5 w-4 md:w-5 text-red-300" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm md:text-base">خبراء متخصصين</div>
                  <div className="text-xs md:text-sm">فريق احترافي</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-8 md:py-12 border-y border-red-600/30">
          <div className="text-center group hover:scale-105 transition-all duration-500">
            <div className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">+500</div>
            <div className="text-red-200 font-semibold text-xs md:text-sm lg:text-base">مطعم مميز</div>
          </div>
          <div className="text-center group hover:scale-105 transition-all duration-500">
            <div className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">+50k</div>
            <div className="text-red-200 font-semibold text-xs md:text-sm lg:text-base">كود QR نشط</div>
          </div>
          <div className="text-center group hover:scale-105 transition-all duration-500">
            <div className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">15</div>
            <div className="text-red-200 font-semibold text-xs md:text-sm lg:text-base">دولة عربية</div>
          </div>
          <div className="text-center group hover:scale-105 transition-all duration-500">
            <div className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">99.9%</div>
            <div className="text-red-200 font-semibold text-xs md:text-sm lg:text-base">وقت التشغيل</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8 pt-8 md:pt-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
            <p className="text-red-100 font-semibold text-sm md:text-lg">
              © 2024 Menu-p Premium Edition. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-2 bg-red-800/50 border border-red-600/30 rounded-full px-3 md:px-4 py-1 md:py-2 backdrop-blur-xl">
              <div className="w-2 md:w-3 h-2 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm text-red-100 font-bold">النظام يعمل بكامل طاقته</span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-4 md:gap-8 justify-center lg:justify-end">
            <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-sm md:text-lg hover:scale-105" href="/terms-of-service">
              شروط الخدمة
            </Link>
            <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-sm md:text-lg hover:scale-105" href="/privacy-policy">
              سياسة الخصوصية
            </Link>
            <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-sm md:text-lg hover:scale-105" href="/saas-support">
              الدعم المميز
            </Link>
            <Link className="text-red-200 hover:text-white transition-all duration-300 font-bold text-sm md:text-lg hover:scale-105" href="/about-creator">
              عن المطور
            </Link>
          </nav>
        </div>

        {/* Premium Badge */}
        <div className="flex justify-center pt-6 md:pt-8">
          <div className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-400/30 rounded-full px-4 md:px-8 py-2 md:py-4 backdrop-blur-xl">
            <Award className="h-4 md:h-6 w-4 md:w-6 text-red-300" />
            <span className="text-red-100 font-bold text-sm md:text-lg">منصة معتمدة ومرخصة رسمياً</span>
            <Sparkles className="h-4 md:h-6 w-4 md:w-6 text-red-300 animate-pulse" aria-label="Sparkles Icon" />
          </div>
        </div>
      </div>
    </footer>
  )
}
