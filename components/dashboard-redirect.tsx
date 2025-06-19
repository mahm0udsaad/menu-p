"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Check if user has a restaurant profile
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (restaurant) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      }
    }

    checkUserAndRedirect()
  }, [router])

  return null // This component doesn't render anything
}
