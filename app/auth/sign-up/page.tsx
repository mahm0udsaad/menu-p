import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/signup-form"
import { Coffee, UtensilsCrossed, QrCode, Menu, Smartphone, Star, Heart, BarChart3 } from "lucide-react"

export default async function SignUpPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <h1 className="text-2xl font-bold mb-4 text-white">اربط Supabase للبدء</h1>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 animate-bounce delay-100">
          <Coffee className="h-8 w-8 text-emerald-400/10" />
        </div>
        <div className="absolute top-40 left-32 animate-pulse delay-300">
          <UtensilsCrossed className="h-12 w-12 text-emerald-300/10" />
        </div>
        <div className="absolute top-60 right-1/3 animate-bounce delay-500">
          <QrCode className="h-10 w-10 text-emerald-500/10" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-700">
          <Menu className="h-14 w-14 text-emerald-400/10" />
        </div>
        <div className="absolute bottom-60 right-20 animate-bounce delay-1000">
          <Smartphone className="h-8 w-8 text-emerald-300/10" />
        </div>
        <div className="absolute top-1/3 left-1/4 animate-pulse delay-200">
          <Star className="h-6 w-6 text-yellow-400/10" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-800">
          <Heart className="h-7 w-7 text-red-400/10" />
        </div>
        <div className="absolute top-1/2 right-10 animate-pulse delay-600">
          <BarChart3 className="h-9 w-9 text-emerald-400/10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <SignUpForm />
      </div>
    </div>
  )
}
