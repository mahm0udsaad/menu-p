import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  Menu,
  Smartphone,
  Zap,
  Users,
  BarChart3,
  Coffee,
  UtensilsCrossed,
  Star,
  Heart,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import PricingPlans from "@/components/pricing-plans";

export default async function HomeWithPricing() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  // Get user's restaurant data if logged in
  let restaurantData = null;
  if (user) {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', user.id)
      .single();
    restaurantData = restaurant;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 animate-bounce delay-100">
          <Coffee className="h-8 w-8 text-emerald-400/20" />
        </div>
        <div className="absolute top-40 left-32 animate-pulse delay-300">
          <UtensilsCrossed className="h-12 w-12 text-emerald-300/15" />
        </div>
        <div className="absolute top-60 right-1/3 animate-bounce delay-500">
          <QrCode className="h-10 w-10 text-emerald-500/20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-700">
          <Menu className="h-14 w-14 text-emerald-400/10" />
        </div>
        <div className="absolute bottom-60 right-20 animate-bounce delay-1000">
          <Smartphone className="h-8 w-8 text-emerald-300/20" />
        </div>
        <div className="absolute top-1/3 left-1/4 animate-pulse delay-200">
          <Star className="h-6 w-6 text-emerald-500/25" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <QrCode className="h-8 w-8 text-emerald-400" />
          <span className="text-2xl font-bold text-white">Menu-P</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:text-emerald-400">
                  <LayoutDashboard className="h-4 w-4 ml-2" />
                  لوحة التحكم
                </Button>
              </Link>
              <form action="/auth/signout" method="post">
                <Button variant="outline" className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-white">
                  تسجيل الخروج
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white hover:text-emerald-400">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  إنشاء حساب
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            قوائم طعام
            <span className="text-emerald-400 block">احترافية</span>
            في دقائق
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            أنشئ قوائم طعام جميلة وتفاعلية مع رموز QR للمطاعم والمقاهي. سهل، سريع، ومجاني للبدء.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg">
                  <LayoutDashboard className="h-5 w-5 ml-2" />
                  اذهب إلى لوحة التحكم
                </Button>
              </Link>
            ) : (
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg">
                  <Zap className="h-5 w-5 ml-2" />
                  ابدأ مجاناً الآن
                </Button>
              </Link>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-white px-8 py-4 text-lg"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Star className="h-5 w-5 ml-2" />
              عرض الأسعار
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <QrCode className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">رموز QR ذكية</h3>
              <p className="text-slate-300 leading-relaxed">
                أنشئ رموز QR مخصصة تربط عملاءك مباشرة بقائمة الطعام الرقمية
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <Smartphone className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">متوافق مع الجوال</h3>
              <p className="text-slate-300 leading-relaxed">
                قوائم طعام تعمل بشكل مثالي على جميع الأجهزة والشاشات
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">تحليلات متقدمة</h3>
              <p className="text-slate-300 leading-relaxed">
                تتبع أداء قائمة الطعام وتفاعل العملاء مع تقارير مفصلة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="text-center mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">500+</div>
              <div className="text-slate-300">مطعم ومقهى</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">10K+</div>
              <div className="text-slate-300">قائمة طعام</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">50K+</div>
              <div className="text-slate-300">رمز QR</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">99%</div>
              <div className="text-slate-300">رضا العملاء</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="relative z-10 bg-white">
        <PricingPlans 
          restaurantId={restaurantData?.id}
          userEmail={user?.email}
          userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <QrCode className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold text-white">Menu-P</span>
          </div>
          <p className="text-slate-400 mb-4">
            منصة إنشاء قوائم الطعام الرقمية الأولى في الشرق الأوسط
          </p>
          <div className="flex justify-center space-x-6 text-slate-400">
            <a href="#" className="hover:text-emerald-400 transition-colors">الدعم</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">الشروط</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">الخصوصية</a>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-slate-500">
            <p>&copy; 2024 Menu-P. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
