"use client"

/**
 * Step 2 (greeting): occasion chips (Eid, Ramadan, Christmas, National Day…)
 * + custom occasion + smart default message (editable).
 */

import { useCallback, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { POSTER_OCCASIONS, defaultGreetingMessage } from "@/lib/posters/occasions"

const STRINGS = {
  heading: "ما المناسبة؟",
  custom: "مناسبة أخرى…",
  customPlaceholder: "اكتب اسم المناسبة (مثال: افتتاح الفرع الجديد)",
  messageLabel: "نص التهنئة",
  messageHint: "عدّل النص كما تحب — سيظهر كما هو على البوستر",
} as const

export interface GreetingStepProps {
  occasion: string
  message: string
  onOccasionChange: (value: string) => void
  onMessageChange: (value: string) => void
}

export default function GreetingStep({ occasion, message, onOccasionChange, onMessageChange }: GreetingStepProps) {
  const isKnown = POSTER_OCCASIONS.some((o) => o.label === occasion)
  const [customMode, setCustomMode] = useState(occasion.length > 0 && !isKnown)

  const pickOccasion = useCallback(
    (label: string) => {
      setCustomMode(false)
      onOccasionChange(label)
      onMessageChange(defaultGreetingMessage(label))
    },
    [onOccasionChange, onMessageChange]
  )

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">{STRINGS.heading}</h2>

      <div className="flex flex-wrap gap-2">
        {POSTER_OCCASIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickOccasion(item.label)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              !customMode && occasion === item.label
                ? "border-rose-600 bg-rose-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-rose-300"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setCustomMode(true)
            onOccasionChange("")
          }}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            customMode
              ? "border-rose-600 bg-rose-600 text-white"
              : "border-dashed border-gray-300 bg-white text-gray-500 hover:border-rose-300"
          }`}
        >
          {STRINGS.custom}
        </button>
      </div>

      {customMode && (
        <Input
          autoFocus
          value={occasion}
          onChange={(e) => {
            onOccasionChange(e.target.value)
            onMessageChange(e.target.value.trim() ? defaultGreetingMessage(e.target.value) : "")
          }}
          placeholder={STRINGS.customPlaceholder}
          maxLength={40}
          className="mt-3"
        />
      )}

      <div className="mt-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">{STRINGS.messageLabel}</label>
        <Textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
          maxLength={300}
          placeholder={STRINGS.messageHint}
        />
        <p className="mt-1 text-xs text-gray-400">{STRINGS.messageHint}</p>
      </div>
    </div>
  )
}
