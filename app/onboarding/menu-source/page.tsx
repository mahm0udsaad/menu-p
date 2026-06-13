import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import MenuSourceChoice from "@/components/menu-source-choice"

export const dynamic = "force-dynamic"

export default async function MenuSourcePage({
  searchParams,
}: {
  searchParams: Promise<{ logo?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!restaurant) redirect("/onboarding")

  return <MenuSourceChoice logoFailed={resolvedParams.logo === "error"} />
}
