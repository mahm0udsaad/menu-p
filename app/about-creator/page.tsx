import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, Linkedin, Mail, Rocket, Users, Zap, Shield, Heart, Star, Flag, Globe, TrendingUp, Code, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Head from 'next/head';

export default function AboutCreatorPageV2() {
  return (
    <>
      <Head>
        <title>محمود سعد - قصة Menu-p | رؤية لمستقبل التكنولوجيا العربية</title>
        <meta name="description" content="اكتشف قصة محمود سعد، المطور المصري ومبتكر Menu-p. رحلة من الشغف بالتكنولوجيا إلى مهمة لتمكين المطاعم المحلية وبناء مستقبل واعد للاقتصاد الرقمي العربي."
        />
        <meta name="keywords" content="محمود سعد, مبتكر Menu-p, قصة نجاح, مطور مصري, تكنولوجيا عربية, دعم الشركات المحلية, اقتصاد رقمي عربي, برمجيات للمطاعم" />
        <meta property="og:title" content="محمود سعد - قصة Menu-p | رؤية لمستقبل التكنولوجيا العربية" />
        <meta property="og:description" content="انضم إلى محمود سعد في رحلته لبناء Menu-p واكتشف كيف يمكن للتكنولوجيا المحلية أن تصنع فرقًا حقيقيًا في عالمنا العربي."
        />
        <meta property="og:image" content="/og-image-about-creator.jpg" />
        <meta property="og:url" content="https://menu-p.com/about-creator" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 text-gray-800 overflow-hidden" dir="rtl">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 opacity-50">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-full max-w-4xl bg-red-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <main className="flex-1 relative z-10 py-12 md:py-20">
          <article className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* --- Header --- */}
              <header className="text-center mb-16">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center">
                        <ArrowLeft className="w-4 h-4 ml-2" />
                        <span>العودة إلى الرئيسية</span>
                    </Link>
                </div>
                <Avatar className="w-36 h-36 mx-auto mb-6 ring-4 ring-white ring-offset-4 ring-offset-gray-100 shadow-lg">
                  <AvatarImage src="/placeholder-user.jpg" alt="محمود سعد، مبتكر Menu-p" />
                  <AvatarFallback>م س</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                  محمود سعد
                </h1>
                <p className="text-xl md:text-2xl text-red-600 mt-3 font-medium">
                  مطور برمجيات، ومؤسس Menu-p
                </p>
              </header>

              {/* --- The Spark Section --- */}
              <section className="mb-20 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200/80">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
                  الشرارة التي أضاءت الطريق
                </h2>
                <div className="text-center max-w-3xl mx-auto">
                    <p className="text-lg text-gray-600 leading-relaxed">
                        "في أحد الأيام، كنت أجلس في مطعمي المفضل، أرى صاحبه، وهو صديق عزيز، يكافح مع نظام قوائم قديم ومكلف. كان محبطًا من التعقيدات والقيود. في تلك اللحظة، لم أرَ مجرد مشكلة، بل رأيت فرصة. فرصة لبناء شيء أفضل، شيء أبسط، شيء يخدم أصحاب المشاريع الصغيرة مثله. كانت تلك هي اللحظة التي وُلدت فيها فكرة Menu-p."
                    </p>
                    <p className="mt-4 font-semibold text-red-700">- محمود سعد</p>
                </div>
              </section>

              {/* --- Mission Section --- */}
              <section className="mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">مهمتي: بناء تكنولوجيا عربية بمعايير عالمية</h2>
                    <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">أنا أؤمن بأن الموهبة العربية قادرة على المنافسة عالميًا. مهمتي هي بناء أدوات لا تحل مشاكل حقيقية فحسب، بل تلهم أيضًا جيلاً جديدًا من المطورين والمبتكرين العرب.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 hover:shadow-red-100 hover:-translate-y-2 transition-all duration-300">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <Globe className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">تمكين محلي</h3>
                    <p className="text-gray-600">توفير أدوات قوية للشركات الصغيرة والمتوسطة في منطقتنا للنمو والازدهار.</p>
                  </div>
                  <div className="text-center p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 hover:shadow-red-100 hover:-translate-y-2 transition-all duration-300">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <Award className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">جودة عالمية</h3>
                    <p className="text-gray-600">إثبات أن المنتجات المصنوعة في العالم العربي يمكن أن تنافس الأفضل في العالم.</p>
                  </div>
                  <div className="text-center p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 hover:shadow-red-100 hover:-translate-y-2 transition-all duration-300">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <TrendingUp className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">اقتصاد رقمي</h3>
                    <p className="text-gray-600">المساهمة في بناء اقتصاد رقمي عربي قوي ومستقل ومبتكر.</p>
                  </div>
                </div>
              </section>

              {/* --- Vision Section --- */}
              <section className="mb-20 bg-gray-900 text-white rounded-2xl p-10 md:p-12 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">رؤيتي للمستقبل</h2>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto">Menu-p هو البداية فقط. رؤيتي هي إنشاء نظام بيئي متكامل من الحلول الرقمية التي تساعد الشركات العربية على النجاح. من التحليلات الذكية إلى أدوات التسويق المبتكرة، المستقبل الذي أبني من أجله هو مستقبل تكون فيه التكنولوجيا في متناول الجميع.</p>
                </div>
              </section>

              {/* --- Connect Section --- */}
              <section className="text-center bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-10 md:p-12 text-white shadow-2xl">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">لنتواصل ونبني معًا</h2>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                  سواء كنت صاحب مطعم، مطورًا، أو مجرد شخص يؤمن بمستقبل التكنولوجيا في عالمنا العربي، يسعدني أن أسمع منك. دعنا نشكل المستقبل، معًا.
                </p>
                <div className="flex justify-center items-center space-x-6 mb-8">
                  <a href="mailto:saad@menu-p.com" className="text-white hover:text-red-200 transition-colors"><Mail className="w-7 h-7" /></a>
                  <a href="https://github.com/saad" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-200 transition-colors"><Github className="w-7 h-7" /></a>
                  <a href="https://linkedin.com/in/saad" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-200 transition-colors"><Linkedin className="w-7 h-7" /></a>
                </div>
                <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <a href="mailto:saad@menu-p.com">تواصل معي</a>
                </Button>
              </section>

            </div>
          </article>
        </main>
      </div>
    </>
  );
}