import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import AnimatedBackground from "@/components/home/animated-background"
import HeaderSection from "@/components/home/header-section"
import HeroSection from "@/components/home/hero-section"
import StatsSection from "@/components/home/stats-section"
import FeaturesSection from "@/components/home/features-section"
import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"

const TestimonialsSection = dynamic(() => import("@/components/home/testimonials-section"), {
  loading: () => <Skeleton className="w-full h-[600px] rounded-xl" />
})

const PricingSection = dynamic(() => import("@/components/home/pricing-section"), {
  loading: () => <Skeleton className="w-full h-[800px] rounded-xl" />
})

const SaasSupportSection = dynamic(() => import("@/components/home/saas-support-section"), {
  loading: () => <Skeleton className="w-full h-[400px] rounded-xl" />
})

const FaqSection = dynamic(() => import("@/components/home/faq-section"), {
  loading: () => <Skeleton className="w-full h-[600px] rounded-xl" />
})

const CtaSection = dynamic(() => import("@/components/home/cta-section"), {
  loading: () => <Skeleton className="w-full h-[300px] rounded-xl" />
})

const FooterSection = dynamic(() => import("@/components/home/footer-section"), {
  loading: () => <Skeleton className="w-full h-[400px] rounded-xl" />
})

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LandingPage({ searchParams }: PageProps) {
  // Check if this is an auth callback - if so, redirect to callback handler immediately
  const code = (await searchParams)?.code as string
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 text-gray-900 overflow-hidden" dir="rtl">
      <AnimatedBackground />
      <HeaderSection user={user} />

      <main className="flex-1 relative z-10">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <SaasSupportSection />
        <FaqSection />
        <CtaSection />
      </main>

      <FooterSection />
    </div>
  )
}
