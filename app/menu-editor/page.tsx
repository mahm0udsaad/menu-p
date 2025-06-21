import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getMenuData, getTemplates } from "@/lib/actions/menu"
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

  // Fetch menu data and templates on the server
  const [menuResult, templatesResult] = await Promise.all([
    getMenuData(restaurant.id),
    getTemplates(restaurant.category)
  ])

  // Handle any errors from data fetching
  if (menuResult.error) {
    console.error("Error fetching menu data:", menuResult.error)
  }

  if (templatesResult.error) {
    console.error("Error fetching templates:", templatesResult.error)
  }

  return (
    <MenuEditorClient 
      restaurant={restaurant}
      initialMenuData={menuResult.data || []}
      initialTemplates={templatesResult.data || []}
    />
  )
}
