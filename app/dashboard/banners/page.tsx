import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import BannerStudioClient from "@/components/banner-studio/banner-studio-client"
import type { BannerMenuCategory } from "@/components/banner-studio/product-picker"
import type { BannerRecord } from "@/lib/banners/types"

export const metadata = {
  title: "استوديو البانرات | Menu-P",
  description: "صمّم بانرات عروض احترافية لشاشة الكاشير — نص، ملصقات، ومنتجات من قائمتك",
}

export default async function BannerStudioPage() {
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

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name, menu_items(id, name, price, image_url, is_available, display_order)")
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  interface RawCategory {
    id: string
    name: string
    menu_items: Array<Record<string, unknown>> | null
  }

  const menuCategories: BannerMenuCategory[] = ((categories ?? []) as RawCategory[])
    .map((category) => ({
      id: category.id,
      name: category.name,
      items: (category.menu_items ?? [])
        .filter((item) => item.is_available !== false)
        .sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0))
        .map((item) => ({
          id: item.id as string,
          name: item.name as string,
          price: item.price == null ? null : Number(item.price),
          image_url: (item.image_url as string | null) ?? null,
        })),
    }))
    .filter((category) => category.items.length > 0)

  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(60)

  return (
    <BannerStudioClient
      restaurantName={restaurant.name}
      currency={restaurant.currency ?? "EGP"}
      categories={menuCategories}
      initialBanners={(banners ?? []) as BannerRecord[]}
    />
  )
}
