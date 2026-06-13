import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import MenuImportClient from "@/components/menu-import/import-client"

export const metadata = {
  title: "استيراد قائمة قديمة | Menu-P",
  description: "حوّل قائمتك القديمة (PDF أو صورة) إلى قائمة رقمية بالذكاء الاصطناعي",
}

export default async function MenuImportPage({
  searchParams,
}: {
  searchParams?: Promise<{ source?: string; url?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, name, currency")
    .eq("user_id", user.id)
    .single()

  if (error || !restaurant) redirect("/onboarding")

  return (
    <MenuImportClient
      restaurantId={restaurant.id}
      restaurantName={restaurant.name}
      currency={restaurant.currency ?? "EGP"}
      preferredSource={resolvedSearchParams?.source === "menus-sa" ? "menus-sa" : null}
      prefillUrl={resolvedSearchParams?.url || null}
    />
  )
}
