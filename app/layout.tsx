import type React from "react"
import type { Metadata, Viewport } from "next"
import localFont from 'next/font/local'
import Script from "next/script"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const ibmPlexSansArabic = localFont({
  src: [
    { path: '../public/fonts/AR/Almarai/Almarai-Light.ttf', weight: '300', style: 'normal' },
    { path: '../public/fonts/AR/Almarai/Almarai-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/AR/Almarai/Almarai-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/AR/Almarai/Almarai-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-ibm-plex-sans-arabic',
})

const rubik = localFont({
  src: '../public/fonts/AR/Amiri/Amiri-Regular.ttf',
  variable: '--font-rubik',
})

const oswald = localFont({
  src: '../public/fonts/AR/Amiri/Amiri-Bold.ttf',
  variable: '--font-oswald',
})

// Advanced SEO Metadata for PDF Menu Generator
export const metadata: Metadata = {
  // Basic SEO
  title: {
    default: "Menu-p.com - مولد قوائم PDF وأكواد QR للمطاعم | قوائم رقمية احترافية",
    template: "%s | Menu-p.com"
  },
  description: "أنشئ قوائم طعام PDF احترافية مع أكواد QR للمطاعم والمقاهي. محرر سهل، تصاميم جذابة، تصدير PDF فوري، وأكواد QR قابلة للطباعة تجذب العملاء وتزيد المبيعات.",
  
  // Keywords for better search ranking
  keywords: [
    "مولد قوائم PDF",
    "قوائم طعام PDF", 
    "أكواد QR للمطاعam",
    "تصميم قوائم مطاعم PDF",
    "إنشاء قائمة طعام PDF",
    "محرر قوائم المطاعم",
    "قوائم رقمية للطباعة",
    "تصدير قائمة PDF",
    "أكواد QR قابلة للطباعة",
    "قوائم طعام احترافية",
    "منصة تصميم قوائم",
    "PDF menu generator",
    "restaurant PDF menu",
    "QR code menu maker",
    "digital menu creator",
    "printable restaurant menu",
    "menu design software",
    "PDF menu templates",
    "restaurant menu builder",
    "QR menu generator",
    "contactless menu PDF",
    "قائمة مطعم جاهزة للطباعة",
    "تصميم قوائم عربية",
    "قوائم مقاهي PDF"
  ],
  
  // Author and generator
  authors: [{ name: "Menu-p.com Team" }],
  creator: "Menu-p.com",
  publisher: "Menu-p.com",
  generator: "Next.js 15",
  
  // Canonical URL and alternates
  metadataBase: new URL("https://menu-p.com"),
  alternates: {
    canonical: "/",
    languages: {
      "ar-SA": "/",
      "en-US": "/en",
    },
  },
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    siteName: "Menu-p.com",
    title: "Menu-p.com - مولد قوائم PDF وأكواد QR للمطاعم",
    description: "أنشئ قوائم طعام PDF احترافية مع أكواد QR للمطاعم والمقاهي. محرر سهل، تصاميم جذابة، تصدير PDF فوري، وأكواد QR قابلة للطباعة.",
    url: "https://menu-p.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Menu-p.com - مولد قوائم PDF للمطاعم",
      },
    ],
    locale: "ar_SA",
    countryName: "Saudi Arabia",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@menup_com",
    creator: "@menup_com",
    title: "Menu-p.com - مولد قوائم PDF وأكواد QR للمطاعم",
    description: "أنشئ قوائم طعام PDF احترافية مع أكواد QR للمطاعم والمقاهي. محرر سهل، تصدير PDF فوري، وأكواد QR قابلة للطباعة.",
    images: ["/og-image.jpg"],
  },
  
  // App-specific metadata
  applicationName: "Menu-p.com",
  category: "business",
  classification: "Restaurant PDF Menu Generator",
  
  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Additional metadata
  other: {
    "google-site-verification": "your-google-verification-code",
    "msvalidate.01": "your-bing-verification-code",
  },
  
  // Apple-specific
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Menu-p.com",
  },
  
  // Format detection
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  
  // Verification
  verification: {
    google: "your-google-verification-code",
    other: {
      me: ["mailto:info@menu-p.com", "https://menu-p.com"],
    },
  },
}

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="language" content="Arabic" />
        <meta name="geo.region" content="SA" />
        <meta name="geo.country" content="Saudi Arabia" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/fav 3.png" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://menu-p.com" />
        
        {/* Hreflang for internationalization */}
        <link rel="alternate" hrefLang="ar" href="https://menu-p.com" />
        <link rel="alternate" hrefLang="en" href="https://menu-p.com/en" />
        <link rel="alternate" hrefLang="x-default" href="https://menu-p.com" />
      </head>
      
      <body className={cn("min-h-screen bg-background font-sans antialiased", ibmPlexSansArabic.variable, rubik.variable, oswald.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
          </div>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                direction: 'rtl',
                fontFamily: "'IBM Plex Sans Arabic', 'Rubik', sans-serif",
              },
            }}
          />
        </ThemeProvider>
        <Script
          id="json-ld-business"
          type="application/ld+json"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Menu-p.com",
              "description": "مولد قوائم PDF احترافية مع أكواد QR للمطاعم والمقاهي. منصة شاملة لتصميم وإنشاء قوائم طعام رقمية قابلة للطباعة",
              "url": "https://menu-p.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "SAR",
                "description": "خدمة مجانية لإنشاء قوائم PDF مع أكواد QR"
              },
              "provider": {
                "@type": "Organization",
                "name": "Menu-p.com",
                "url": "https://menu-p.com"
              },
              "featureList": [
                "إنشاء قوائم PDF احترافية",
                "توليد أكواد QR قابلة للطباعة",
                "محرر قوائم سهل الاستخدام",
                "تصاميم متعددة للقوائم",
                "تصدير PDF فوري",
                "دعم اللغة العربية",
                "تخصيص الألوان والخطوط",
                "قوائم متعددة اللغات"
              ],
              "screenshot": "https://menu-p.com/app-screenshot.jpg",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "250"
              }
            })
          }}
        />
        <Script
          id="json-ld-faq"
          type="application/ld+json"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "كيف أنشئ قائمة طعام PDF مع كود QR؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "سجل في Menu-p.com، أضف عناصر القائمة باستخدام المحرر السهل، اختر التصميم المناسب، ثم صدّر قائمتك كملف PDF مع كود QR قابل للطباعة."
                  }
                },
                {
                  "@type": "Question",
                  "name": "هل يمكنني طباعة القائمة وكود QR؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "نعم، تحصل على ملف PDF عالي الجودة قابل للطباعة مع كود QR مدمج، مناسب للطباعة على أي حجم ورق."
                  }
                },
                {
                  "@type": "Question",
                  "name": "هل أحتاج خبرة تقنية لاستخدام المنصة؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "لا، المنصة مصممة لتكون سهلة الاستخدام. يمكن لأي شخص إنشاء قائمة PDF احترافية في دقائق معدودة بدون أي خبرة تقنية."
                  }
                },
                {
                  "@type": "Question",
                  "name": "هل يمكنني تعديل القائمة بعد إنشائها؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "بالطبع! يمكنك تعديل قائمتك في أي وقت وإعادة تصدير ملف PDF جديد مع كود QR محدث."
                  }
                }
              ]
            })
          }}
        />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Menu-p.com",
              "url": "https://menu-p.com",
              "description": "مولد قوائم PDF احترافية مع أكواد QR للمطاعم والمقاهي",
              "inLanguage": "ar-SA",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://menu-p.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Menu-p.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://menu-p.com/logo.svg",
                  "width": 200,
                  "height": 60
                }
              }
            })
          }}
        />
      </body>
    </html>
  )
}
