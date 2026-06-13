"use client"

/**
 * Poster gallery: rendered posters with download, delete and the
 * "نشر على السوشيال" button → /dashboard/social?poster={id} (the composer
 * preselects the poster — Phase 5 Social Connect).
 */

import { useCallback, useState } from "react"
import Link from "next/link"
import { Download, ImageIcon, Loader2, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { deletePoster, type PosterRecord } from "@/lib/actions/posters"

const STRINGS = {
  empty: "لا توجد بوسترات بعد — اضغط \"بوستر جديد\" لإنشاء أول بوستر",
  offer: "عرض",
  greeting: "تهنئة",
  failed: "فشل الإنشاء",
  generating: "قيد الإنشاء…",
  download: "تحميل",
  share: "نشر على السوشيال",
  shareNotReady: "يتاح النشر بعد اكتمال إنشاء البوستر",
  delete: "حذف",
  confirmDelete: "هل تريد حذف هذا البوستر نهائياً؟",
  deleteFailed: "تعذر حذف البوستر",
} as const

export interface PosterGalleryProps {
  posters: PosterRecord[]
  onPostersChange: (posters: PosterRecord[]) => void
}

export default function PosterGallery({ posters, onPostersChange }: PosterGalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDelete = useCallback(
    async (poster: PosterRecord) => {
      if (!window.confirm(STRINGS.confirmDelete)) return
      setErrorMessage(null)
      setDeletingId(poster.id)
      try {
        const result = await deletePoster(poster.id)
        if (!result.success) {
          setErrorMessage(result.error ?? STRINGS.deleteFailed)
          return
        }
        onPostersChange(posters.filter((p) => p.id !== poster.id))
      } catch {
        setErrorMessage(STRINGS.deleteFailed)
      } finally {
        setDeletingId(null)
      }
    },
    [posters, onPostersChange]
  )

  if (posters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white py-16 text-center">
        <ImageIcon className="h-12 w-12 text-rose-200" />
        <p className="text-gray-500">{STRINGS.empty}</p>
      </div>
    )
  }

  return (
    <div>
      {errorMessage && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posters.map((poster) => {
          const isStory = poster.payload?.size === "story"
          return (
            <article key={poster.id} className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
              <div className={`relative w-full bg-rose-50 ${isStory ? "aspect-[9/16]" : "aspect-square"}`}>
                {poster.status === "ready" && poster.final_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster.final_image_url}
                    alt={poster.title ?? ""}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : poster.status === "failed" ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500">
                    {STRINGS.failed}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Skeleton className="h-2/3 w-2/3 rounded-xl" />
                    <span className="text-xs text-gray-400">{STRINGS.generating}</span>
                  </div>
                )}
                <Badge className="absolute right-3 top-3 bg-rose-600 text-white hover:bg-rose-600">
                  {poster.kind === "offer" ? STRINGS.offer : STRINGS.greeting}
                </Badge>
              </div>
              <div className="space-y-2 p-4">
                <h3 className="truncate font-semibold text-gray-900">{poster.title ?? "بوستر"}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {poster.final_image_url && (
                    <a href={poster.final_image_url} download target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50">
                        <Download className="h-3.5 w-3.5" />
                        {STRINGS.download}
                      </Button>
                    </a>
                  )}
                  {poster.status === "ready" && poster.final_image_url ? (
                    <Link href={`/dashboard/social?poster=${poster.id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50">
                        <Share2 className="h-3.5 w-3.5" />
                        {STRINGS.share}
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" disabled title={STRINGS.shareNotReady} className="gap-1.5 text-gray-400">
                      <Share2 className="h-3.5 w-3.5" />
                      {STRINGS.share}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(poster)}
                    disabled={deletingId === poster.id}
                    className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    {deletingId === poster.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {STRINGS.delete}
                  </Button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
