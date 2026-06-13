"use client"

/**
 * Post composer: pick a target (full menu / menu page / poster / QR) →
 * Arabic caption auto-suggested (editable) → choose connected accounts →
 * publish. Menu & QR targets get a server-rendered QR PNG as media;
 * menu-page posts are link posts (Facebook only — IG/TikTok need images).
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Loader2, RefreshCcw, Send, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createPost, prepareMenuQr, type CreatePostOutcome } from "@/lib/actions/social"
import { buildAutoCaption } from "@/lib/social/captions"
import { PLATFORM_LABELS, type PostTarget, type PostTargetKind, type SocialAccountPublic } from "@/lib/social/types"
import type { ComposerMenu, ComposerPoster } from "./social-client"

const STRINGS = {
  heading: "منشور جديد",
  targetLabel: "ماذا تريد أن تنشر؟",
  kinds: { menu: "القائمة كاملة (رابط + QR)", menu_page: "صفحة القائمة (رابط)", poster: "بوستر", qr_code: "كود QR" },
  menuLabel: "اختر القائمة",
  posterLabel: "اختر البوستر",
  noMenus: "انشر قائمة أولاً من المحرر",
  noPosters: "لا توجد بوسترات جاهزة — أنشئ واحداً من استوديو البوسترات",
  captionLabel: "نص المنشور",
  regenerate: "إعادة اقتراح النص",
  accountsLabel: "انشر على",
  noAccounts: "اربط حساباً واحداً على الأقل أولاً",
  fbOnly: "نشر الروابط متاح على فيسبوك فقط",
  publish: "نشر الآن",
  publishing: "جارٍ النشر…",
  posted: "تم النشر",
  failed: "فشل",
} as const

export interface PostComposerProps {
  restaurantName: string
  currency: string
  menus: ComposerMenu[]
  posters: ComposerPoster[]
  accounts: SocialAccountPublic[]
  initialPosterId: string | null
  onPublished: () => Promise<void>
}

export default function PostComposer({
  restaurantName,
  currency,
  menus,
  posters,
  accounts,
  initialPosterId,
  onPublished,
}: PostComposerProps) {
  const preselectedPoster = initialPosterId && posters.some((p) => p.id === initialPosterId) ? initialPosterId : null
  const [targetKind, setTargetKind] = useState<PostTargetKind>(preselectedPoster ? "poster" : "menu")
  const [menuId, setMenuId] = useState<string>(menus[0]?.id ?? "")
  const [posterId, setPosterId] = useState<string>(preselectedPoster ?? posters[0]?.id ?? "")
  const [caption, setCaption] = useState("")
  const [captionTouched, setCaptionTouched] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [outcomes, setOutcomes] = useState<CreatePostOutcome[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const menuLink = useCallback(
    (id: string) => `${typeof window !== "undefined" ? window.location.origin : ""}/menus/${id}`,
    []
  )

  const target: PostTarget | null = useMemo(() => {
    if (targetKind === "poster") {
      const poster = posters.find((p) => p.id === posterId)
      if (!poster) return null
      const data = poster.payload?.data
      return {
        kind: "poster",
        posterId: poster.id,
        restaurantName,
        link: menus[0] ? menuLink(menus[0].id) : null,
        data: {
          kind: poster.kind,
          title: poster.title,
          headline: data?.headline ?? null,
          currency: data?.currency ?? currency,
          products: data?.products,
          occasion: data?.occasion,
          message: data?.message,
        },
      }
    }
    const menu = menus.find((m) => m.id === menuId)
    if (!menu) return null
    return { kind: targetKind, menuId: menu.id, menuName: menu.menu_name, link: menuLink(menu.id), restaurantName }
  }, [targetKind, posterId, menuId, posters, menus, restaurantName, currency, menuLink])

  useEffect(() => {
    if (!captionTouched && target) setCaption(buildAutoCaption(target))
  }, [target, captionTouched])

  const selectableAccounts = targetKind === "menu_page" ? accounts.filter((a) => a.platform === "meta_facebook") : accounts

  const toggleAccount = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handlePublish = async () => {
    if (!target) return
    setError(null)
    setOutcomes(null)
    setPublishing(true)
    try {
      let media: { type: "image" | "link"; urls: string[] }
      let targetRef: string | null
      if (target.kind === "poster") {
        const poster = posters.find((p) => p.id === target.posterId)
        if (!poster?.final_image_url) throw new Error("البوستر غير جاهز للنشر")
        media = { type: "image", urls: [poster.final_image_url] }
        targetRef = poster.id
      } else if (target.kind === "menu_page") {
        media = { type: "link", urls: [target.link] }
        targetRef = target.menuId
      } else {
        const qr = await prepareMenuQr(target.menuId, target.link)
        if (!qr.success || !qr.url) throw new Error(qr.error ?? "تعذر إنشاء صورة QR")
        media = { type: "image", urls: [qr.url] }
        targetRef = target.menuId
      }
      const validIds = selected.filter((id) => selectableAccounts.some((a) => a.id === id))
      const result = await createPost({ accountIds: validIds, targetKind, targetRef, caption, media })
      if (!result.success) {
        setError(result.error ?? "تعذر النشر")
        return
      }
      setOutcomes(result.outcomes ?? [])
      await onPublished()
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر النشر")
    } finally {
      setPublishing(false)
    }
  }

  const canPublish =
    !publishing && target !== null && caption.trim().length > 0 && selected.some((id) => selectableAccounts.some((a) => a.id === id))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="h-5 w-5 text-rose-600" />
          {STRINGS.heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{STRINGS.targetLabel}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STRINGS.kinds) as PostTargetKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => { setTargetKind(kind); setCaptionTouched(false); setOutcomes(null) }}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  targetKind === kind
                    ? "border-rose-600 bg-rose-50 font-medium text-rose-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"
                }`}
              >
                {STRINGS.kinds[kind]}
              </button>
            ))}
          </div>
        </div>

        {targetKind === "poster" ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{STRINGS.posterLabel}</p>
            {posters.length === 0 ? (
              <p className="text-sm text-gray-400">{STRINGS.noPosters}</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {posters.map((poster) => (
                  <button
                    key={poster.id}
                    type="button"
                    onClick={() => { setPosterId(poster.id); setCaptionTouched(false) }}
                    className={`w-24 overflow-hidden rounded-lg border-2 transition ${
                      posterId === poster.id ? "border-rose-600" : "border-transparent hover:border-rose-200"
                    }`}
                  >
                    {poster.final_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={poster.final_image_url} alt={poster.title ?? "بوستر"} className="h-24 w-24 object-cover" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center bg-gray-100 text-xs text-gray-400">—</div>
                    )}
                    <span className="block truncate bg-white px-1 py-0.5 text-[11px] text-gray-600">
                      {poster.title ?? (poster.kind === "offer" ? "عرض" : "تهنئة")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{STRINGS.menuLabel}</p>
            {menus.length === 0 ? (
              <p className="text-sm text-gray-400">{STRINGS.noMenus}</p>
            ) : (
              <select
                value={menuId}
                onChange={(e) => { setMenuId(e.target.value); setCaptionTouched(false) }}
                className="w-full max-w-sm rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.menu_name} ({menu.language_code})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{STRINGS.captionLabel}</p>
            <Button size="sm" variant="ghost" className="gap-1 text-xs text-rose-700" onClick={() => setCaptionTouched(false)}>
              <RefreshCcw className="h-3.5 w-3.5" />
              {STRINGS.regenerate}
            </Button>
          </div>
          <Textarea
            dir="rtl"
            rows={6}
            value={caption}
            onChange={(e) => { setCaption(e.target.value); setCaptionTouched(true) }}
            className="text-sm leading-6"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {STRINGS.accountsLabel}
            {targetKind === "menu_page" && <span className="mr-2 text-xs font-normal text-amber-600">({STRINGS.fbOnly})</span>}
          </p>
          {selectableAccounts.length === 0 ? (
            <p className="text-sm text-gray-400">{STRINGS.noAccounts}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectableAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => toggleAccount(account.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    selected.includes(account.id)
                      ? "border-rose-600 bg-rose-600 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-rose-300"
                  }`}
                >
                  {PLATFORM_LABELS[account.platform]} — {account.account_name ?? account.account_ref}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {outcomes && (
          <ul className="space-y-1 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm">
            {outcomes.map((o) => (
              <li key={o.accountId} className="flex items-center gap-2">
                {o.status === "posted" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">{PLATFORM_LABELS[o.platform]}</span>
                <span className="text-gray-500">{o.status === "posted" ? STRINGS.posted : (o.error ?? STRINGS.failed)}</span>
              </li>
            ))}
          </ul>
        )}

        <Button onClick={handlePublish} disabled={!canPublish} className="gap-2 bg-rose-600 text-white hover:bg-rose-700">
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {publishing ? STRINGS.publishing : STRINGS.publish}
        </Button>
      </CardContent>
    </Card>
  )
}
