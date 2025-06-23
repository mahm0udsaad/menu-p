import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
} from "lucide-react" // Added LayoutDashboard icon
import Link from "next/link"
import PaymentButton from "@/components/payment-button"

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function LandingPage({ searchParams }: PageProps) {
  console.log('🏠 [HOME] Landing page loading with searchParams:', searchParams)
  
  // Check if this is an auth callback - if so, redirect to callback handler immediately
  const code = searchParams?.code as string
  if (code) {
    console.log('🏠 [HOME] Auth code detected, redirecting to callback handler')
    const callbackUrl = `/auth/callback?code=${encodeURIComponent(code)}&next=/`
    redirect(callbackUrl)
  }
  
  // Get cookies (no await needed in App Router)
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  let restaurantData = null

  // Only fetch restaurant data if user exists to prevent UUID errors
  if (user?.id) {
    try {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (restaurantError) {
        console.error('Error fetching restaurant data:', restaurantError)
      } else {
        restaurantData = restaurant
      }
    } catch (error) {
      console.error('Error in restaurant fetch:', error)
    }
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
          <Star className="h-6 w-6 text-yellow-400/15" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-800">
          <Heart className="h-7 w-7 text-red-400/20" />
        </div>
        <div className="absolute top-1/2 right-10 animate-pulse delay-600">
          <BarChart3 className="h-9 w-9 text-emerald-400/15" />
        </div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <QrCode className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold text-white">Menu-p.com</span>
          </div>
          <div className="space-x-4 space-x-reverse">
            {user ? ( // Conditional rendering
              <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="ml-2 h-5 w-5" /> {/* Dashboard icon */}
                  لوحة التحكم
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-white hover:text-emerald-400" asChild>
                  <Link href="/auth/login">تسجيل الدخول</Link>
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/auth/sign-up">ابدأ الآن</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Animated Hero Content */}
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              قوائم طعام رقمية و <span className="text-emerald-400 animate-pulse">أكواد QR</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              حوّل مطعمك بقوائم طعام رقمية بدون لمس. أنشئ وخصص وشارك قائمة طعامك فوراً باستخدام أكواد QR
            </p>
            <div className="flex justify-center items-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                asChild
              >
                <Link href="/auth/sign-up">
                  <Zap className="ml-2 h-5 w-5" />
                  ابدأ تجربتك المجانية
                </Link>
              </Button>
             
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">كل ما تحتاجه لتجربة طعام عصرية</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">بسّط عمليات مطعمك مع حلولنا الشاملة للقوائم الرقمية</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="mb-4 animate-bounce">
                <QrCode className="h-12 w-12 text-emerald-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">قوائم أكواد QR</h3>
              <p className="text-slate-300">
                أنشئ أكواد QR فورية للوصول لقوائم الطعام بدون لمس. مثالي لتجربة طعام آمنة بعد الجائحة.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="mb-4 animate-pulse">
                <Smartphone className="h-12 w-12 text-emerald-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">محسّن للجوال</h3>
              <p className="text-slate-300">
                قوائم جميلة ومتجاوبة تعمل بشكل مثالي على أي جهاز. لا حاجة لتحميل تطبيقات.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="mb-4 animate-bounce delay-200">
                <Menu className="h-12 w-12 text-emerald-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">إدارة سهلة</h3>
              <p className="text-slate-300">حدّث قائمتك في الوقت الفعلي. أضف صور ووصوفات وأسعار بمحرر سهل الاستخدام.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="mb-4 animate-pulse delay-300">
                <Users className="h-12 w-12 text-emerald-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">رؤى العملاء</h3>
              <p className="text-slate-300">تتبع الأطباق الشائعة وتفضيلات العملاء لتحسين استراتيجية قائمتك.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="mb-4 animate-bounce delay-500">
                <BarChart3 className="h-12 w-12 text-emerald-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">لوحة تحليلات</h3>
              <p className="text-slate-300">تحليلات شاملة لفهم أداء قائمتك وسلوك العملاء.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="mb-4 animate-pulse delay-700">
                <Zap className="h-12 w-12 text-emerald-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">سريع البرق</h3>
              <p className="text-slate-300">تحميل فوري للقوائم والتحديثات. عملاؤك لن ينتظروا، وقائمتك كذلك.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">كيف يعمل؟</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">أنشئ قائمة طعامك الرقمية في 4 خطوات بسيطة</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute right-1/2 transform translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"></div>

            {/* Step 1 */}
            <div className="relative flex items-center mb-16 gap-x-2.5">
              <div className="flex-1 text-right pr-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur hover:bg-slate-800/70 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-white mb-3">1. إنشاء الحساب</h3>
                  <p className="text-slate-300 text-lg">سجل حسابك وأدخل معلومات مطعمك الأساسية</p>
                </div>
              </div>
              <div className="absolute right-1/2 transform -translate-x-1/2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 pl-8"></div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center mb-16 gap-x-2.5">
              <div className="flex-1 pr-8"></div>
              <div className="absolute right-1/2 transform -translate-x-1/2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                <Menu className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left pl-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur hover:bg-slate-800/70 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-white mb-3">2. إضافة الأطباق</h3>
                  <p className="text-slate-300 text-lg">أضف أطباقك مع الصور والأوصاف والأسعار</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center mb-16 gap-x-2.5">
              <div className="flex-1 text-right pr-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur hover:bg-slate-800/70 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-white mb-3">3. تخصيص التصميم</h3>
                  <p className="text-slate-300 text-lg">اختر القالب المناسب وخصص ألوان وتصميم قائمتك</p>
                </div>
              </div>
              <div className="absolute right-1/2 transform -translate-x-1/2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 pl-8"></div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-center gap-x-2.5">
              <div className="flex-1 pr-8"></div>
              <div className="absolute right-1/2 transform -translate-x-1/2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left pl-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur hover:bg-slate-800/70 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-white mb-3">4. نشر ومشاركة</h3>
                  <p className="text-slate-300 text-lg">احصل على كود QR واطبعه أو شاركه مع عملائك</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">خطط الأسعار</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">اختر الخطة المناسبة لاحتياجات مطعمك</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105 relative">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Menu className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">القائمة الأساسية</h3>
                <div className="text-4xl font-bold text-emerald-400 mb-2">$50</div>
                <p className="text-slate-400">دفعة واحدة</p>
              </div>

              <div className="space-y-4 mb-8 text-right">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">قائمة طعام واحدة</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">كود QR مخصص</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تحديثات غير محدودة</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">دعم فني أساسي</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-400 line-through">تحليلات مفصلة</span>
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-400 line-through">دعم متعدد اللغات</span>
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/auth/sign-up">ابدأ الآن</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-slate-800/50 border-emerald-500 backdrop-blur transform hover:scale-105 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 right-1/2 transform translate-x-1/2">
              <div className=" text-white px-4 py-1 rounded-full text-sm font-semibold bg-emerald-500">الأكثر شعبية</div>
            </div>

            <CardContent className="p-8 text-center bg-slate-800/50  rounded-xl">
              <div className="mb-6">
                <BarChart3 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">القائمة المتقدمة</h3>
                <div className="text-4xl font-bold text-emerald-400 mb-2">$80</div>
                <p className="text-slate-400">دفعة واحدة</p>
              </div>

              <div className="space-y-4 mb-8 text-right">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">قائمة طعام واحدة</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">كود QR مخصص</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تحديثات غير محدودة</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تحليلات مفصلة</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">دعم متعدد اللغات</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تخصيص التصميم</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">دعم فني متقدم</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
              </div>

              {user ? (
                <PaymentButton
                  amount={8000}
                  planName="Pro Plan"
                  restaurantId={restaurantData?.id}
                  userEmail={user?.email}
                  userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                />
              ) : (
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600" asChild>
                  <Link href="/auth/sign-up">ابدأ الآن</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105 relative">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">القائمة المميزة</h3>
                <div className="text-4xl font-bold text-yellow-400 mb-2">$250</div>
                <p className="text-slate-400">دفعة واحدة</p>
              </div>

              <div className="space-y-4 mb-8 text-right">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">حتى 10 قوائم مختلفة</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">أكواد QR متعددة</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تحديثات غير محدودة</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تحليلات متقدمة</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">دعم متعدد اللغات</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تخصيص كامل للتصميم</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">دعم فني مخصص 24/7</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-300">تدريب شخصي</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
              </div>

              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold" asChild>
                <Link href="/auth/sign-up">ابدأ الآن</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Note */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-lg">💡 جميع الخطط تشمل دفعة واحدة فقط - لا توجد رسوم شهرية!</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-12 text-center transform  duration-300 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">مستعد للتحول الرقمي؟</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            انضم لآلاف المطاعم التي تستخدم Menu-p.com بالفعل لإنشاء تجارب طعام أفضل.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-slate-100 text-lg px-8 py-4 transform transition-all duration-200 shadow-lg"
            asChild
          >
            <Link href="/auth/sign-up">ابدأ تجربتك المجانية</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-slate-700 relative z-10">
        <div className="text-center text-slate-400">
          <p>&copy; 2024 Menu-p.com. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}
