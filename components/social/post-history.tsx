"use client"

/**
 * Post history — latest posts with platform, target kind, status chip,
 * platform post id and the Arabic failure reason when a publish failed.
 */

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"
import { PLATFORM_LABELS, type PostTargetKind, type SocialPostRecord } from "@/lib/social/types"

const STRINGS = {
  heading: "سجل المنشورات",
  empty: "لا توجد منشورات بعد — أنشئ أول منشور من الأعلى",
  kinds: { menu: "القائمة كاملة", menu_page: "صفحة القائمة", poster: "بوستر", qr_code: "كود QR" } as Record<
    PostTargetKind,
    string
  >,
  status: {
    draft: "مسودة",
    scheduled: "مجدول",
    posting: "جارٍ النشر",
    posted: "تم النشر",
    failed: "فشل",
  } as Record<string, string>,
} as const

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  posting: "bg-amber-100 text-amber-800",
  posted: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function PostHistory({ posts }: { posts: SocialPostRecord[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-5 w-5 text-rose-600" />
          {STRINGS.heading}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">{STRINGS.empty}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-col gap-1 py-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge className={`${STATUS_CLASS[post.status] ?? ""} border-0 text-[11px]`}>
                    {STRINGS.status[post.status] ?? post.status}
                  </Badge>
                  <span className="font-medium text-gray-800">
                    {post.account ? PLATFORM_LABELS[post.account.platform] : "—"}
                    {post.account?.account_name ? ` — ${post.account.account_name}` : ""}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-600">{STRINGS.kinds[post.target_kind]}</span>
                  <span className="mr-auto text-xs text-gray-400">{formatDate(post.posted_at ?? post.created_at)}</span>
                </div>
                {post.caption && <p className="line-clamp-2 text-xs leading-5 text-gray-500">{post.caption}</p>}
                {post.status === "posted" && post.platform_post_id && (
                  <p className="text-[11px] text-gray-400" dir="ltr">
                    id: {post.platform_post_id}
                  </p>
                )}
                {post.status === "failed" && post.error && (
                  <p className="text-xs text-red-600">{post.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
