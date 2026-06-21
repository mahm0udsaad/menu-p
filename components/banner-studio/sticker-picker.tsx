"use client"

import { useState } from "react"
import { STICKERS, STICKER_CATEGORIES, stickerSvg, type StickerCategory } from "@/lib/banners/stickers"
import PickerOverlay from "./picker-overlay"

interface Props {
  onPick: (stickerId: string) => void
  onClose: () => void
}

export default function StickerPicker({ onPick, onClose }: Props) {
  const [cat, setCat] = useState<StickerCategory>("badges")
  const items = STICKERS.filter((s) => s.category === cat)

  return (
    <PickerOverlay title="اختر ملصقاً" onClose={onClose}>
      <div className="mb-4 flex flex-wrap gap-2">
        {STICKER_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              cat === c.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s.id)}
            title={s.label}
            className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 p-4 transition hover:border-indigo-400 hover:bg-indigo-50"
            style={{ color: s.defaultColor }}
            dangerouslySetInnerHTML={{ __html: stickerSvg(s.id) }}
          />
        ))}
      </div>
    </PickerOverlay>
  )
}
