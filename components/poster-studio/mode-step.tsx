"use client"

/** Step 1: pick poster mode — offer (products + prices) or greeting (occasion). */

import { BadgePercent, PartyPopper } from "lucide-react"
import type { PosterMode } from "@/lib/posters/poster-utils"

const STRINGS = {
  heading: "ما نوع البوستر؟",
  offerTitle: "عرض خاص",
  offerDescription: "اختر أصنافاً من قائمتك مع سعر قبل/بعد أو نسبة خصم",
  greetingTitle: "بطاقة تهنئة",
  greetingDescription: "تهنئة بمناسبة (عيد، رمضان، اليوم الوطني...) باسم مطعمك",
} as const

export interface ModeStepProps {
  onPick: (mode: PosterMode) => void
}

export default function ModeStep({ onPick }: ModeStepProps) {
  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-gray-900">{STRINGS.heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onPick("offer")}
          className="group rounded-2xl border-2 border-rose-100 p-6 text-right transition hover:border-rose-400 hover:bg-rose-50"
        >
          <BadgePercent className="mb-3 h-10 w-10 text-rose-600 transition group-hover:scale-110" />
          <h3 className="text-lg font-bold text-gray-900">{STRINGS.offerTitle}</h3>
          <p className="mt-1 text-sm text-gray-500">{STRINGS.offerDescription}</p>
        </button>
        <button
          type="button"
          onClick={() => onPick("greeting")}
          className="group rounded-2xl border-2 border-rose-100 p-6 text-right transition hover:border-rose-400 hover:bg-rose-50"
        >
          <PartyPopper className="mb-3 h-10 w-10 text-rose-600 transition group-hover:scale-110" />
          <h3 className="text-lg font-bold text-gray-900">{STRINGS.greetingTitle}</h3>
          <p className="mt-1 text-sm text-gray-500">{STRINGS.greetingDescription}</p>
        </button>
      </div>
    </div>
  )
}
