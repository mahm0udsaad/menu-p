import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

interface PageProps {
  params: Promise<{ menuId: string }>
}

/**
 * Compatibility route for old publish-dialog links and saved bookmarks.
 * The QR studio now lives inside the dashboard so users have one obvious
 * place to create and manage cards.
 */
export default async function LegacyQrDesignPage({ params }: PageProps) {
  const { menuId } = await params
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: menu } = await supabase
    .from("published_menus")
    .select("id, restaurant_id")
    .eq("id", menuId)
    .single()

  if (!menu) notFound()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("user_id")
    .eq("id", menu.restaurant_id)
    .single()

  if (!restaurant || restaurant.user_id !== user.id) redirect("/dashboard")

  redirect(`/dashboard?tab=qr-cards&menuId=${encodeURIComponent(menu.id)}`)
}
