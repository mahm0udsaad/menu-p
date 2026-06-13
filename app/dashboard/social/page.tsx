import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SocialClient from "@/components/social/social-client"
import type { ComposerMenu, ComposerPoster } from "@/components/social/social-client"
import type { SocialAccountPublic, SocialPostRecord } from "@/lib/social/types"

export const metadata = {
  title: "النشر على السوشيال | Menu-P",
  description: "اربط فيسبوك وإنستغرام وتيك توك وانشر قائمتك وبوستراتك بضغطة واحدة",
}

interface PageProps {
  searchParams: Promise<{ connected?: string; error?: string; poster?: string }>
}

export default async function SocialPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, currency")
    .eq("user_id", user.id)
    .single()
  if (!restaurant) redirect("/onboarding")

  const [{ data: accounts }, { data: posts }, { data: menus }, { data: posters }] = await Promise.all([
    supabase
      .from("social_accounts")
      .select("id, platform, account_name, account_ref, status, token_expires_at, scopes, created_at")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("social_posts")
      .select(
        "id, social_account_id, target_kind, target_ref, caption, media_urls, status, posted_at, platform_post_id, error, created_at, account:social_accounts(platform, account_name)"
      )
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("published_menus")
      .select("id, menu_name, language_code")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("posters")
      .select("id, kind, title, payload, final_image_url")
      .eq("restaurant_id", restaurant.id)
      .eq("status", "ready")
      .order("created_at", { ascending: false }),
  ])

  return (
    <SocialClient
      restaurantName={restaurant.name as string}
      currency={(restaurant.currency as string | null) ?? "EGP"}
      initialAccounts={(accounts ?? []) as SocialAccountPublic[]}
      initialPosts={(posts ?? []) as unknown as SocialPostRecord[]}
      menus={(menus ?? []) as ComposerMenu[]}
      posters={(posters ?? []) as unknown as ComposerPoster[]}
      initialPosterId={params.poster ?? null}
      connected={params.connected === "1"}
      errorCode={params.error ?? null}
    />
  )
}
