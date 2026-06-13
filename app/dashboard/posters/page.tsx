import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PosterStudioClient from "@/components/poster-studio/poster-studio-client"
import type { PosterRecord } from "@/lib/actions/posters"

export const metadata = {
  title: "استوديو البوسترات | Menu-P",
  description: "أنشئ بوسترات عروض وتهنئة احترافية لمطعمك بالذكاء الاصطناعي — بدون مصمم",
}

export interface PosterMenuItem {
  id: string
  name: string
  price: number | null
  image_url: string | null
}

export interface PosterMenuCategory {
  id: string
  name: string
  items: PosterMenuItem[]
}

export default async function PosterStudioPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, name, logo_url, color_palette, currency")
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

  const menuCategories: PosterMenuCategory[] = ((categories ?? []) as RawCategory[])
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

  const { data: posters } = await supabase
    .from("posters")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(60)

  return (
    <PosterStudioClient
      restaurantName={restaurant.name}
      currency={restaurant.currency ?? "EGP"}
      categories={menuCategories}
      initialPosters={(posters ?? []) as PosterRecord[]}
    />
  )
}
