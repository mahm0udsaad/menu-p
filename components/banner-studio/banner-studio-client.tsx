"use client"

/**
 * Banner Studio (Phase 5): gallery of saved banners + "new banner" → free-form
 * editor. Arabic-first, RTL. Banners are the editable cashier-top signage that
 * complements the PDF menu output.
 */

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBanner, deleteBanner } from "@/lib/actions/banners"
import type { BannerRecord } from "@/lib/banners/types"
import BannerGallery from "./banner-gallery"
import BannerEditor from "./banner-editor"
import type { BannerMenuCategory } from "./product-picker"

interface Props {
  restaurantName: string
  currency: string
  categories: BannerMenuCategory[]
  initialBanners: BannerRecord[]
}

export default function BannerStudioClient({ restaurantName, currency, categories, initialBanners }: Props) {
  const [banners, setBanners] = useState<BannerRecord[]>(initialBanners)
  const [editing, setEditing] = useState<BannerRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNew = async () => {
    setCreating(true)
    setError(null)
    const res = await createBanner({})
    setCreating(false)
    if (res.success && res.banner) {
      setBanners((b) => [res.banner!, ...b])
      setEditing(res.banner)
    } else {
      setError(res.error ?? "تعذر إنشاء البانر")
    }
  }

  const handleUpdated = (banner: BannerRecord) => {
    setBanners((b) => b.map((x) => (x.id === banner.id ? banner : x)))
    setEditing((cur: BannerRecord | null) => (cur && cur.id === banner.id ? banner : cur))
  }

  const handleDelete = async (id: string) => {
    setBanners((b) => b.filter((x) => x.id !== id))
    const res = await deleteBanner(id)
    if (!res.success) setError(res.error ?? "تعذر الحذف")
  }

  if (editing) {
    return (
      <BannerEditor
        banner={editing}
        categories={categories}
        currency={currency}
        onBack={() => setEditing(null)}
        onUpdated={handleUpdated}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="mb-2">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowRight className="h-4 w-4" /> العودة للوحة التحكم
          </Link>
        </div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">استوديو البانرات</h1>
            <p className="mt-1 text-sm text-gray-500">
              صمّم بانرات عروض احترافية لشاشة الكاشير — نص، ملصقات، ومنتجات من قائمتك، بسحب وإفلات.
            </p>
          </div>
          <Button onClick={handleNew} disabled={creating} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            بانر جديد
          </Button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

        {banners.length === 0 ? (
          <button
            onClick={handleNew}
            className="flex aspect-video w-full max-w-xl flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-gray-400 transition hover:border-indigo-400 hover:text-indigo-500"
          >
            <Plus className="h-10 w-10" />
            <span className="text-sm font-medium">أنشئ أول بانر لمطعمك</span>
          </button>
        ) : (
          <BannerGallery banners={banners} onOpen={setEditing} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}
