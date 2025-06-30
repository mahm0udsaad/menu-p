import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, HandHeart, TrendingUp, Flag, Users, Zap, Shield, Heart, Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SaasSupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 text-gray-900 overflow-hidden" dir="rtl">
      {/* SEO Meta Tags (would be added in Head component) */}
      {/* 
      <Head>
        <title>دعم صناعة البرمجيات العربية | أهمية السااس العربي | Menu-p</title>
        <meta name="description" content="اكتشف أهمية دعم صناعة البرمجيات العربية والسااس المحلي. تعرف على كيفية بناء اقتصاد رقمي مستقل وتطوير الحلول التقنية العربية المبتكرة." />
        <meta name="keywords" content="البرمجيات العربية, السااس العربي, التكنولوجيا العربية, الاقتصاد الرقمي, الابتكار العربي, صناعة التقنية, دعم المطورين العرب" />
        <meta property="og:title" content="لماذا يجب دعم صناعة البرمجيات العربية؟" />
        <meta property="og:description" content="مقال شامل عن أهمية دعم الصناعة التقنية العربية وتأثيرها على الاقتصاد والمجتمع" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yoursite.com/arabic-saas-support" />
      </Head>
      */}

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-100/30 to-rose-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-red-300 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 left-32 w-1 h-1 bg-rose-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 right-1/3 w-3 h-3 bg-pink-300 rounded-full animate-bounce delay-1000"></div>
      </div>

      <main className="flex-1 relative z-10 py-8 md:py-16">
        <article className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <header className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-10 border border-red-200/50 mb-8">
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <Button variant="outline" asChild className="group border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 backdrop-blur-xl transition-all duration-500 hover:scale-105">
                  <Link href="/">
                    <ArrowLeft className="ml-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    العودة للصفحة الرئيسية
                  </Link>
                </Button>
                <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-4 py-2 text-sm font-black animate-pulse">
                  <HandHeart className="ml-2 h-4 w-4" />
                  دعم الصناعة العربية
                </Badge>
              </div>

              <p className="text-xl md:text-2xl text-center text-gray-600 mb-8 leading-relaxed font-medium">
                رحلة نحو بناء مستقبل تقني عربي مستقل ومزدهر
              </p>

              {/* Hero Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-8">
                <img 
                  src="https://t3.ftcdn.net/jpg/08/79/32/96/360_F_879329646_tKJIv79J9VoPI3WSXyd9KUQ6iCKGH2cX.jpg" 
                  alt="صناعة البرمجيات العربية والتكنولوجيا المتطورة" 
                  className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </header>

            {/* Main Content */}
            <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-10 border border-red-200/50">
              
              {/* Introduction */}
              <section className="mb-12">
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="text-xl md:text-2xl font-medium text-gray-800 mb-6 text-center border-r-4 border-red-500 pr-6 bg-red-50/50 p-6 rounded-xl">
                    <Heart className="inline ml-2 text-red-500 animate-pulse" />
                    في عالم يتسارع فيه التطور التكنولوجي، أصبحت صناعة البرمجيات قلب الاقتصاد الحديث النابض.
                  </p>
                  <p className="text-lg leading-relaxed">
                    وبينما تتجه الأنظار نحو الابتكارات العالمية، نجد أنفسنا أمام فرصة ذهبية لا تُعوض: 
                    <strong className="text-red-700"> بناء صناعة برمجيات عربية قوية ومستقلة</strong> تلبي احتياجاتنا وتعكس هويتنا الثقافية.
                    إن دعم هذه الصناعة ليس مجرد خيار، بل ضرورة حتمية لبناء مستقبل مزدهر ومستقل تقنياً.
                  </p>
                </div>
              </section>

              {/* Statistics Section */}
              <section className="mb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-red-100 to-rose-100 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-800">+40%</div>
                    <div className="text-sm text-red-600">نمو السوق السنوي</div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-100 to-pink-100 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Users className="h-8 w-8 text-rose-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-rose-800">50K+</div>
                    <div className="text-sm text-rose-600">مطور عربي</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-100 to-red-100 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Zap className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-pink-800">500+</div>
                    <div className="text-sm text-pink-600">شركة ناشئة</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-100 to-rose-100 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Globe className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-800">22</div>
                    <div className="text-sm text-red-600">دولة عربية</div>
                  </div>
                </div>
              </section>

              {/* Main Sections */}
              <section className="space-y-12">
                
                {/* Section 1: Independent Digital Economy */}
                <div className="bg-gradient-to-l from-red-50/50 to-transparent rounded-2xl p-8 border-r-4 border-red-500">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 flex items-center">
                    <Flag className="ml-3 text-red-600 animate-bounce" />
                    بناء اقتصاد رقمي مستقل ومزدهر
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                    <div>
                      <p className="text-lg leading-relaxed text-gray-700 mb-4">
                        عندما نختار المنتجات والحلول البرمجية المطورة محلياً، فإننا نشارك في 
                        <strong className="text-red-700"> ثورة حقيقية</strong> لبناء اقتصاد رقمي عربي قوي ومستقل.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                          <span>خلق آلاف فرص العمل للمواهب الشابة</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                          <span>تحفيز الابتكار والإبداع التقني</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                          <span>تقليل الاعتماد على الحلول الأجنبية</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                          <span>الحفاظ على الخصوصية الثقافية واللغوية</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <img 
                        src="https://www.shutterstock.com/image-photo/group-corporate-arab-businessmen-meeting-600nw-2422865751.jpg" 
                        alt="رجال أعمال عرب في اجتماع تقني" 
                        className="w-full h-64 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Customized Solutions */}
                <div className="bg-gradient-to-r from-rose-50/50 to-transparent rounded-2xl p-8 border-l-4 border-rose-500">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 flex items-center">
                    <Globe className="ml-3 text-rose-600 animate-spin-slow" />
                    حلول مصممة خصيصاً لواقعنا العربي
                  </h2>
                  
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="text-lg leading-relaxed mb-6">
                      المطورون العرب يمتلكون فهماً عميقاً للتحديات والفرص الفريدة في أسواقنا المحلية. 
                      إنهم <strong className="text-rose-700">الأقدر على تصميم حلول تقنية</strong> تتناغم مع احتياجاتنا الحقيقية.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-rose-200 hover:shadow-xl transition-all duration-300">
                        <div className="text-rose-600 mb-3">
                          <Globe className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-rose-800 mb-2">دعم اللغة العربية</h3>
                        <p className="text-sm text-gray-600">معالجة صحيحة ومتقدمة للنصوص العربية</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-rose-200 hover:shadow-xl transition-all duration-300">
                        <div className="text-rose-600 mb-3">
                          <Shield className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-rose-800 mb-2">أنظمة دفع محلية</h3>
                        <p className="text-sm text-gray-600">تكامل مع البنوك ووسائل الدفع العربية</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-rose-200 hover:shadow-xl transition-all duration-300">
                        <div className="text-rose-600 mb-3">
                          <Heart className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-rose-800 mb-2">احترام الثقافة</h3>
                        <p className="text-sm text-gray-600">مراعاة العادات والتقاليد المحلية</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Innovation and Competition */}
                <div className="bg-gradient-to-l from-pink-50/50 to-transparent rounded-2xl p-8 border-r-4 border-pink-500">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 flex items-center">
                    <TrendingUp className="ml-3 text-pink-600" />
                    تحفيز الابتكار والمنافسة الإيجابية
                  </h2>
                  
                  <p className="text-lg leading-relaxed text-gray-700 mb-6">
                    دعم الشركات الناشئة والمطورين المحليين يخلق بيئة تنافسية صحية تدفع الجميع 
                    للإبداع والتميز. هذا يؤدي إلى:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Star className="h-6 w-6 text-yellow-500 mt-1 ml-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-pink-800 mb-1">جودة أعلى</h4>
                          <p className="text-sm text-gray-600">منتجات وخدمات تلبي أعلى المعايير العالمية</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <TrendingUp className="h-6 w-6 text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-pink-800 mb-1">أسعار تنافسية</h4>
                          <p className="text-sm text-gray-600">حلول فعالة من حيث التكلفة</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Zap className="h-6 w-6 text-blue-500 mt-1 ml-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-pink-800 mb-1">ابتكار مستمر</h4>
                          <p className="text-sm text-gray-600">تطوير مستمر للميزات والوظائف</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Users className="h-6 w-6 text-purple-500 mt-1 ml-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-pink-800 mb-1">دعم أفضل</h4>
                          <p className="text-sm text-gray-600">خدمة عملاء محلية ومتفهمة</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action Section */}
                <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 animate-pulse">
                      كن جزءاً من التغيير
                    </h2>
                    <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-95">
                      باختيارك <strong>Menu-p</strong> والمنتجات العربية الأخرى، 
                      أنت تساهم في بناء مستقبل رقمي عربي مشرق ومستقل
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                      <Button asChild className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold rounded-xl hover:scale-105 transition-all duration-300">
                        <Link href="/">
                          <HandHeart className="ml-2 h-5 w-5" />
                          ابدأ رحلتك مع Menu-p
                        </Link>
                      </Button>
                      
                      <div className="flex items-center text-white/90">
                        <span className="text-sm">انضم إلى أكثر من</span>
                        <span className="font-bold text-lg mx-2">10,000+</span>
                        <span className="text-sm">مستخدم عربي</span>
                      </div>
                    </div>
                  </div>
                </div>

              </section>

              {/* Footer Message */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-center text-gray-600 italic">
                  "النجاح الحقيقي يأتي عندما نؤمن بقدراتنا ونستثمر في مواهبنا المحلية"
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}