"use client"

/**
 * Social Connect page shell: connect cards → composer → post history.
 * Holds accounts/posts state and refreshes them after connect/publish.
 * RTL, rose palette, Arabic copy (V2 house style).
 */

import { useCallback, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Share2, TriangleAlert } from "lucide-react"
import { listAccounts, listPosts } from "@/lib/actions/social"
import type { PosterCaptionData, SocialAccountPublic, SocialPostRecord } from "@/lib/social/types"
import ConnectCards from "./connect-cards"
import PostComposer from "./post-composer"
import PostHistory from "./post-history"

export interface ComposerMenu {
  id: string
  menu_name: string
  language_code: string
}

export interface ComposerPoster {
  id: string
  kind: "offer" | "greeting"
  title: string | null
  payload: { data?: PosterCaptionData & { mode?: "offer" | "greeting" } } | null
  final_image_url: string | null
}

const STRINGS = {
  title: "النشر على السوشيال",
  subtitle: "اربط حساباتك وانشر قائمتك وبوستراتك بضغطة واحدة",
  back: "العودة للوحة التحكم",
  connectedBanner: "تم ربط الحساب بنجاح ✅",
  errors: {
    denied: "تم إلغاء عملية الربط من طرفك",
    invalid_callback: "رابط الربط غير مكتمل — أعد المحاولة",
    auth_required: "سجّل الدخول ثم أعد محاولة الربط",
    not_owner: "هذا الربط يخص مطعماً آخر",
    store_failed: "تعذر حفظ بيانات الحساب — أعد المحاولة",
    callback_failed: "فشلت عملية الربط — أعد المحاولة",
    unknown_platform: "منصة غير معروفة",
  } as Record<string, string>,
} as const

export interface SocialClientProps {
  restaurantName: string
  currency: string
  initialAccounts: SocialAccountPublic[]
  initialPosts: SocialPostRecord[]
  menus: ComposerMenu[]
  posters: ComposerPoster[]
  initialPosterId: string | null
  connected: boolean
  errorCode: string | null
}

export default function SocialClient({
  restaurantName,
  currency,
  initialAccounts,
  initialPosts,
  menus,
  posters,
  initialPosterId,
  connected,
  errorCode,
}: SocialClientProps) {
  const [accounts, setAccounts] = useState<SocialAccountPublic[]>(initialAccounts)
  const [posts, setPosts] = useState<SocialPostRecord[]>(initialPosts)
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(() => {
    if (connected) return { kind: "ok", text: STRINGS.connectedBanner }
    if (errorCode) return { kind: "err", text: STRINGS.errors[errorCode] ?? STRINGS.errors.callback_failed }
    return null
  })

  const refreshAccounts = useCallback(async () => {
    const result = await listAccounts()
    if (result.success && result.accounts) setAccounts(result.accounts)
  }, [])

  const refreshPosts = useCallback(async () => {
    const result = await listPosts()
    if (result.success && result.posts) setPosts(result.posts)
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Share2 className="h-6 w-6 text-rose-600" />
              {STRINGS.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{STRINGS.subtitle}</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-rose-700 hover:underline">
            {STRINGS.back}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {banner && (
          <div
            role="status"
            className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-sm ${
              banner.kind === "ok"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span className="flex items-center gap-2">
              {banner.kind === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
              {banner.text}
            </span>
            <button onClick={() => setBanner(null)} className="text-xs underline">
              إغلاق
            </button>
          </div>
        )}

        <ConnectCards accounts={accounts} onChanged={refreshAccounts} />

        <PostComposer
          restaurantName={restaurantName}
          currency={currency}
          menus={menus}
          posters={posters}
          accounts={accounts.filter((a) => a.status === "connected")}
          initialPosterId={initialPosterId}
          onPublished={refreshPosts}
        />

        <PostHistory posts={posts} />
      </div>
    </div>
  )
}
