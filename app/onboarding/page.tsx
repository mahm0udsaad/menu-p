import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OnboardingForm from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user already has a restaurant profile
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("user_id", user.id).single()

  // If restaurant exists, redirect to dashboard
  if (restaurant) {
    redirect("/dashboard")
  }

  return <OnboardingForm />
}
