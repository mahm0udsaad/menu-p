import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MenuEditorClient from "@/components/menu-editor-client"

export default async function MenuEditorPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get restaurant profile
  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("user_id", user.id).single()

  if (!restaurant) {
    redirect("/onboarding")
  }

  return <MenuEditorClient restaurant={restaurant} />
}
