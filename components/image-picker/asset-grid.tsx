"use client"

/** Gallery grid for image assets: skeletons, empty state, selectable cards. */

import { Loader2, ImageOff, Sparkles, UploadCloud, Users } from "lucide-react"
import type { ImageAssetRecord } from "@/lib/actions/image-assets"

const STRINGS = {
  shared: "مشتركة",
  ai: "AI",
  uploaded: "مرفوعة",
  usedTimes: (n: number) => (n === 1 ? "استُخدمت مرة" : `استُخدمت ${n} مرات`),
} as const

export interface AssetGridProps {
  assets: Array<ImageAssetRecord & { score?: number }>
  loading: boolean
  selectingId: string | null
  onSelect: (asset: ImageAssetRecord) => void
  emptyTitle: string
  emptyHint: string
}

function AssetCard({
  asset,
  selecting,
  onSelect,
}: {
  asset: ImageAssetRecord & { score?: number }
  selecting: boolean
  onSelect: (asset: ImageAssetRecord) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      disabled={selecting}
      className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white text-right focus:outline-none focus:ring-2 focus:ring-rose-400 hover:border-rose-300 hover:shadow-md transition-all disabled:opacity-60"
    >
      <div className="aspect-square w-full bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.public_url}
          alt={asset.tags[0] ?? "صورة طبق"}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      {selecting && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-rose-600 animate-spin" />
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 text-white text-[10px] px-2 py-0.5">
          {asset.source === "ai" ? <Sparkles className="h-3 w-3" /> : <UploadCloud className="h-3 w-3" />}
          {asset.source === "ai" ? STRINGS.ai : STRINGS.uploaded}
        </span>
        {asset.restaurant_id === null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 text-white text-[10px] px-2 py-0.5">
            <Users className="h-3 w-3" />
            {STRINGS.shared}
          </span>
        )}
      </div>
      {asset.usage_count > 0 && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
          <span className="text-[10px] text-white/90">{STRINGS.usedTimes(asset.usage_count)}</span>
        </div>
      )}
    </button>
  )
}

export default function AssetGrid({ assets, loading, selectingId, onSelect, emptyTitle, emptyHint }: AssetGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
          <ImageOff className="h-7 w-7 text-rose-400" />
        </div>
        <p className="font-semibold text-gray-800">{emptyTitle}</p>
        <p className="text-sm text-gray-500 max-w-sm">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} selecting={selectingId === asset.id} onSelect={onSelect} />
      ))}
    </div>
  )
}
