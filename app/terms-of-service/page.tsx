import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Head from 'next/head';

export default function TermsOfServicePage() {
  return (
    <>
      <Head>
        <title>Terms of Service - Menu-p</title>
        <meta name="description" content="Read the terms of service for using Menu-p. Understand your rights and responsibilities." />
      </Head>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 text-gray-800" dir="rtl">
        <main className="flex-1 relative z-10 py-12 md:py-20">
          <article className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <header className="text-center mb-16">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center">
                        <ArrowLeft className="w-4 h-4 ml-2" />
                        <span>العودة إلى الرئيسية</span>
                    </Link>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                  شروط الخدمة
                </h1>
                <p className="text-lg text-gray-500 mt-4">آخر تحديث: 11 يوليو 2025</p>
              </header>

              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  مرحبًا بك في Menu-p. باستخدام خدماتنا، فإنك توافق على هذه الشروط. يرجى قراءتها بعناية.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. استخدام خدماتنا</h2>
                <p>
                  يجب عليك اتباع أي سياسات متاحة لك ضمن الخدمات. لا تسيء استخدام خدماتنا. على سبيل المثال، لا تتدخل في خدماتنا أو تحاول الوصول إليها باستخدام طريقة أخرى غير الواجهة والتعليمات التي نقدمها. يُحظر استخدام خدماتنا لأي غرض غير قانوني أو غير مصرح به.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. حسابك في Menu-p</h2>
                <p>
                  قد تحتاج إلى حساب Menu-p من أجل استخدام بعض خدماتنا. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور وتقييد الوصول إلى جهاز الكمبيوتر الخاص بك، وتوافق على قبول المسؤولية عن جميع الأنشطة التي تحدث تحت حسابك أو كلمة المرور الخاصة بك.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. المحتوى الخاص بك في خدماتنا</h2>
                <p>
                  تسمح لك بعض خدماتنا بتحميل المحتوى الخاص بك وتخزينه وإرساله واستلامه. أنت تحتفظ بملكية أي حقوق ملكية فكرية تمتلكها في هذا المحتوى. عند تحميل المحتوى أو إرساله بطريقة أخرى إلى خدماتنا، فإنك تمنح Menu-p ترخيصًا عالميًا لاستخدام هذا المحتوى وتخزينه وإعادة إنتاجه وتعديله وإنشاء أعمال مشتقة منه وتوصيله ونشره وأداءه وعرضه وتوزيعه. هذا الترخيص الذي تمنحه هو لغرض محدود وهو تشغيل خدماتنا والترويج لها وتحسينها وتطوير خدمات جديدة.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. المدفوعات والرسوم</h2>
                <p>
                  أنت توافق على دفع جميع الرسوم أو المصاريف المطبقة على حسابك بناءً على رسوم Menu-p وأسعارها وشروط الفوترة السارية في وقت استحقاق الرسم أو المصاريف. قد تتم معالجة المدفوعات من خلال معالجات دفع تابعة لجهات خارجية، وتخضع لشروط وأحكام تلك الجهات الخارجية.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. تعديل وإنهاء خدماتنا</h2>
                <p>
                  نحن نغير ونحسن خدماتنا باستمرار. قد نضيف أو نزيل وظائف أو ميزات، وقد نعلق أو نوقف خدمة بالكامل. يجوز لنا أيضًا إنهاء أو تعليق وصولك إلى جميع الخدمات أو جزء منها في أي وقت، بسبب أو بدون سبب، بإشعار أو بدون إشعار، بأثر فوري.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">6. إخلاء المسؤولية والضمانات</h2>
                <p>
                  نحن نقدم خدماتنا باستخدام مستوى معقول تجاريًا من المهارة والعناية ونأمل أن تستمتع باستخدامها. لكن هناك أشياء معينة لا نعد بها بشأن خدماتنا. بخلاف ما هو منصوص عليه صراحةً في هذه الشروط أو الشروط الإضافية، لا تقدم Menu-p ولا موردوها أو موزعوها أي وعود محددة بشأن الخدمات. على سبيل المثال، لا نقدم أي التزامات بشأن المحتوى الموجود في الخدمات أو الوظائف المحددة للخدمات أو موثوقيتها أو توفرها أو قدرتها على تلبية احتياجاتك. نحن نقدم الخدمات "كما هي".
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">7. القانون الحاكم</h2>
                <p>
                  تخضع هذه الشروط وتفسر وفقًا لقوانين جمهورية مصر العربية، دون اعتبار لتعارضها مع أحكام القانون.
                </p>
              </div>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}