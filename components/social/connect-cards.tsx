"use client"

/**
 * Connection cards — one per provider (Meta covers FB page + IG account,
 * TikTok standalone). Shows each linked account with a status badge and a
 * disconnect button; connecting redirects to the adapter's OAuth URL
 * (mock mode loops straight back to our callback).
 */

import { useState } from "react"
import { Facebook, Instagram, Link2, Loader2, Music2, Unlink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { connectAccount, disconnectAccount } from "@/lib/actions/social"
import { PLATFORM_LABELS, type SocialAccountPublic, type SocialPlatform, type SocialProvider } from "@/lib/social/types"

const STRINGS = {
  heading: "الحسابات المرتبطة",
  metaTitle: "فيسبوك وإنستغرام (Meta)",
  metaHint: "ربط واحد يجلب صفحة فيسبوك وحساب إنستغرام المرتبط بها",
  tiktokTitle: "تيك توك",
  tiktokHint: "نشر صور مباشر عبر Content Posting API",
  connect: "ربط الحساب",
  connecting: "جارٍ التحويل…",
  disconnect: "إلغاء الربط",
  confirmDisconnect: "هل تريد إلغاء ربط هذا الحساب؟",
  none: "لا يوجد حساب مرتبط بعد",
  status: { connected: "متصل", expired: "منتهي الصلاحية", revoked: "ملغي" } as Record<string, string>,
} as const

const STATUS_CLASS: Record<string, string> = {
  connected: "bg-green-100 text-green-800",
  expired: "bg-amber-100 text-amber-800",
  revoked: "bg-gray-100 text-gray-500",
}

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "meta_facebook") return <Facebook className="h-4 w-4 text-blue-600" />
  if (platform === "meta_instagram") return <Instagram className="h-4 w-4 text-pink-600" />
  return <Music2 className="h-4 w-4 text-gray-900" />
}

export interface ConnectCardsProps {
  accounts: SocialAccountPublic[]
  onChanged: () => Promise<void>
}

export default function ConnectCards({ accounts, onChanged }: ConnectCardsProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async (provider: SocialProvider) => {
    setError(null)
    setBusy(`connect-${provider}`)
    try {
      const result = await connectAccount(provider)
      if (result.success && result.url) {
        window.location.href = result.url
        return
      }
      setError(result.error ?? "تعذر بدء عملية الربط")
    } catch {
      setError("تعذر بدء عملية الربط")
    } finally {
      setBusy(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    if (!window.confirm(STRINGS.confirmDisconnect)) return
    setError(null)
    setBusy(`disconnect-${accountId}`)
    try {
      const result = await disconnectAccount(accountId)
      if (!result.success) setError(result.error ?? "تعذر إلغاء الربط")
      await onChanged()
    } finally {
      setBusy(null)
    }
  }

  const renderAccounts = (platforms: SocialPlatform[]) => {
    const rows = accounts.filter((a) => platforms.includes(a.platform))
    if (rows.length === 0) return <p className="text-sm text-gray-400">{STRINGS.none}</p>
    return (
      <ul className="space-y-2">
        {rows.map((account) => (
          <li key={account.id} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <PlatformIcon platform={account.platform} />
              <span className="truncate font-medium text-gray-800">
                {account.account_name ?? PLATFORM_LABELS[account.platform]}
              </span>
              <Badge className={`${STATUS_CLASS[account.status] ?? ""} border-0 text-[11px]`}>
                {STRINGS.status[account.status] ?? account.status}
              </Badge>
            </span>
            {account.status === "connected" && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-xs text-gray-500 hover:text-red-600"
                disabled={busy === `disconnect-${account.id}`}
                onClick={() => handleDisconnect(account.id)}
              >
                {busy === `disconnect-${account.id}` ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Unlink className="h-3.5 w-3.5" />
                )}
                {STRINGS.disconnect}
              </Button>
            )}
          </li>
        ))}
      </ul>
    )
  }

  const connectButton = (provider: SocialProvider) => (
    <Button
      size="sm"
      className="gap-1.5 bg-rose-600 text-white hover:bg-rose-700"
      disabled={busy === `connect-${provider}`}
      onClick={() => handleConnect(provider)}
    >
      {busy === `connect-${provider}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
      {busy === `connect-${provider}` ? STRINGS.connecting : STRINGS.connect}
    </Button>
  )

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{STRINGS.heading}</h2>
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Facebook className="h-5 w-5 text-blue-600" />
              <Instagram className="h-5 w-5 text-pink-600" />
              {STRINGS.metaTitle}
            </CardTitle>
            {connectButton("meta")}
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-gray-400">{STRINGS.metaHint}</p>
            {renderAccounts(["meta_facebook", "meta_instagram"])}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Music2 className="h-5 w-5 text-gray-900" />
              {STRINGS.tiktokTitle}
            </CardTitle>
            {connectButton("tiktok")}
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-gray-400">{STRINGS.tiktokHint}</p>
            {renderAccounts(["tiktok"])}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
