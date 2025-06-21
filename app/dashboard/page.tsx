import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDashboardData } from "@/lib/actions/menu"
import { getPublishedQrCards } from "@/lib/actions/qr-card-actions"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  // Fetch data on the server
  const result = await getDashboardData()

  if (result.error) {
    if (result.redirectTo) {
      redirect(result.redirectTo)
    }
    redirect("/auth/login")
  }

  if (!result.data) {
    redirect("/auth/login")
  }

  const { restaurant, publishedMenus, user } = result.data

  // Fetch published QR cards
  const qrCardsResult = await getPublishedQrCards()
  const publishedQrCards = qrCardsResult.data || []

  return (
    <DashboardClient 
      restaurant={restaurant}
      publishedMenus={publishedMenus}
      publishedQrCards={publishedQrCards}
      user={user}
    />
  )
}
