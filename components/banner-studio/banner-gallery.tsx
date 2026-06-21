"use client"

import type { CSSProperties } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { backgroundStyle, geometryStyle, innerHtml, visualStyle } from "@/lib/banners/render"
import { BANNER_SIZES, type BannerDoc, type BannerRecord } from "@/lib/banners/types"

/** Static, non-interactive preview of a banner document. */
export function BannerThumb({ doc }: { doc: BannerDoc }) {
  const { width, height } = BANNER_SIZES[doc.size] ?? BANNER_SIZES["screen-16x9"]
  const elements = [...(doc.elements ?? [])].sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
  return (
    <div
      dir="rtl"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${width} / ${height}`,
        containerType: "size",
        overflow: "hidden",
        pointerEvents: "none",
        ...(backgroundStyle(doc.background) as CSSProperties),
      }}
    >
      {elements.map((el) => (
        <div key={el.id} style={geometryStyle(el) as CSSProperties}>
          <div style={visualStyle(el) as CSSProperties} dangerouslySetInnerHTML={{ __html: innerHtml(el) }} />
        </div>
      ))}
    </div>
  )
}

export default function BannerGallery({
  banners,
  onOpen,
  onDelete,
}: {
  banners: BannerRecord[]
  onOpen: (banner: BannerRecord) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {banners.map((banner) => (
        <div key={banner.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
          <button onClick={() => onOpen(banner)} className="block w-full">
            <BannerThumb doc={banner.doc} />
          </button>
          <div className="flex items-center justify-between gap-2 p-3">
            <span className="truncate text-sm font-medium text-gray-700">{banner.title ?? "بانر"}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onOpen(banner)} className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600" title="تعديل">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(banner.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="حذف">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
