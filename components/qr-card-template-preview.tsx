import React from "react"
import { QrCode } from "lucide-react"
import type { QrCardTemplateId } from "@/components/qr-card-templates"

export const qrTemplatePreviewPresets: Record<QrCardTemplateId, {
  bg: string
  text: string
  border: string
  borderOn: boolean
  logo: "none" | "top" | "middle" | "both"
  note: string
}> = {
  classic: { bg: "#F7F0E4", text: "#2C2118", border: "#DDC9A6", borderOn: true, logo: "top", note: "كريمي دافئ" },
  modern: { bg: "#15120F", text: "#F3ECE1", border: "#CBA35D", borderOn: false, logo: "middle", note: "أسود وذهبي" },
  elegant: { bg: "#143229", text: "#EFE4C9", border: "#C9A24B", borderOn: true, logo: "middle", note: "زمردي فاخر" },
  minimal: { bg: "#FFFFFF", text: "#1B1B1B", border: "#EDEDED", borderOn: true, logo: "none", note: "نظيف وبسيط" },
  playful: { bg: "#6E2230", text: "#F7E8D5", border: "#E2B86C", borderOn: false, logo: "top", note: "عنابي للطاولات" },
  vintage: { bg: "#F5E9D6", text: "#5C3924", border: "#A8763A", borderOn: true, logo: "top", note: "تراثي هادئ" },
}

interface QrTemplateExampleCardProps {
  templateId: QrCardTemplateId
  name: string
  restaurantName?: string
  selected?: boolean
  onClick?: () => void
  compact?: boolean
}

function FakeQr({ ink, paper = "#fff", compact = false }: { ink: string; paper?: string; compact?: boolean }) {
  const cells = compact ? 7 : 9
  const active = new Set([
    "0-0", "0-1", "1-0", "1-1", "0-7", "0-8", "1-7", "1-8", "7-0", "8-0", "7-1", "8-1",
    "2-3", "2-5", "3-2", "3-4", "3-6", "4-3", "4-5", "5-2", "5-6", "6-3", "6-4", "6-7",
    "7-4", "8-5", "5-8", "2-8",
  ])

  return (
    <div
      className="grid rounded-[8px] p-1.5 shadow-sm"
      style={{
        gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr))`,
        gap: compact ? 2 : 2.5,
        backgroundColor: paper,
      }}
    >
      {Array.from({ length: cells * cells }).map((_, index) => {
        const row = Math.floor(index / cells)
        const col = index % cells
        const on = active.has(`${row}-${col}`) || ((row * 3 + col * 5) % 11 === 0 && row > 1 && col > 1)
        return (
          <span
            key={`${row}-${col}`}
            className="aspect-square rounded-[2px]"
            style={{ backgroundColor: on ? ink : "transparent" }}
          />
        )
      })}
    </div>
  )
}

function Monogram({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <div
      className="grid h-7 w-7 place-items-center rounded-[8px] text-xs font-black shadow-sm"
      style={{ backgroundColor: bg, color: fg }}
    >
      {text.slice(0, 1)}
    </div>
  )
}

function PreviewFace({ templateId, restaurantName = "Menu-P", compact = false }: Pick<QrTemplateExampleCardProps, "templateId" | "restaurantName" | "compact">) {
  const preset = qrTemplatePreviewPresets[templateId]
  const title = restaurantName.length > 12 ? restaurantName.slice(0, 12) : restaurantName
  const qrSize = compact ? "h-16 w-16" : "h-20 w-20"

  if (templateId === "modern") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden rounded-[12px] p-3" style={{ backgroundColor: preset.bg, color: preset.text }}>
        <div className="absolute left-0 top-0 h-16 w-16 border-l border-t opacity-50" style={{ borderColor: preset.border }} />
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-black leading-none">{title}</div>
            <div className="mt-1 h-0.5 w-8 rounded-full" style={{ backgroundColor: preset.border }} />
          </div>
          <span className="text-[8px] font-bold tracking-[0.28em]" style={{ color: preset.border }}>MENU</span>
        </div>
        <div className="grid flex-1 place-items-center">
          <div className={`${qrSize} rounded-[12px] bg-white p-2`}>
            <FakeQr ink="#15120F" compact={compact} />
          </div>
        </div>
        <div className="text-center text-[10px] font-bold" style={{ color: preset.border }}>SCAN MENU</div>
      </div>
    )
  }

  if (templateId === "elegant") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden rounded-[12px] p-3" style={{ backgroundColor: preset.bg, color: preset.text, border: `1px solid ${preset.border}` }}>
        <div className="absolute right-2 top-2 h-5 w-5 rotate-45 border" style={{ borderColor: preset.border }} />
        <div className="absolute bottom-2 left-2 h-5 w-5 rotate-45 border" style={{ borderColor: preset.border }} />
        <div className="mx-auto text-center text-sm font-black">{title}</div>
        <div className="mx-auto mt-2 h-px w-14" style={{ backgroundColor: preset.border }} />
        <div className="grid flex-1 place-items-center">
          <div className={`${qrSize} rounded-[14px] p-2`} style={{ backgroundColor: "#EFE4C9" }}>
            <FakeQr ink="#143229" paper="#EFE4C9" compact={compact} />
          </div>
        </div>
        <div className="text-center text-[10px] font-bold">امسح القائمة</div>
      </div>
    )
  }

  if (templateId === "minimal") {
    return (
      <div className="flex h-full flex-col rounded-[12px] border bg-white p-3" style={{ color: preset.text, borderColor: preset.border }}>
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-[#9b9288]">
          <span>MENU</span>
          <span>QR</span>
        </div>
        <div className="grid flex-1 place-items-center">
          <div className={`${qrSize} rounded-[10px] border border-[#ededed] bg-white p-1.5`}>
            <FakeQr ink="#1B1B1B" compact={compact} />
          </div>
        </div>
        <div className="text-center text-xs font-black">{title}</div>
        <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-[#b03a2e]" />
      </div>
    )
  }

  if (templateId === "playful") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden rounded-[12px] p-3" style={{ backgroundColor: preset.bg, color: preset.text }}>
        <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full border" style={{ borderColor: preset.border }} />
        <div className="flex items-center justify-between">
          <Monogram text={title} bg={preset.border} fg={preset.bg} />
          <div className="rounded-full px-2 py-1 text-[10px] font-black" style={{ backgroundColor: preset.border, color: preset.bg }}>طاولة ٧</div>
        </div>
        <div className="grid flex-1 place-items-center">
          <div className={`${qrSize} rounded-[16px] p-2`} style={{ backgroundColor: "#F7E8D5" }}>
            <FakeQr ink="#6E2230" paper="#F7E8D5" compact={compact} />
          </div>
        </div>
        <div className="text-center text-[10px] font-bold">اطلب من طاولتك</div>
      </div>
    )
  }

  if (templateId === "vintage") {
    return (
      <div className="relative flex h-full flex-col rounded-[12px] p-3" style={{ backgroundColor: preset.bg, color: preset.text, border: `1px solid ${preset.border}` }}>
        <div className="absolute inset-2 rounded-[10px] border border-dashed opacity-50" style={{ borderColor: preset.border }} />
        <div className="relative text-center font-serif text-sm font-black">{title}</div>
        <div className="relative mx-auto mt-1 text-[8px] font-bold tracking-[0.24em]" style={{ color: preset.border }}>CAFE MENU</div>
        <div className="relative grid flex-1 place-items-center">
          <div className={`${qrSize} rotate-[-2deg] rounded-[10px] bg-white/80 p-2 shadow-sm`}>
            <FakeQr ink="#5C3924" paper="#fffaf0" compact={compact} />
          </div>
        </div>
        <div className="relative mx-auto rounded-full border px-3 py-1 text-[9px] font-bold" style={{ borderColor: preset.border }}>Scan</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-[12px] p-3" style={{ backgroundColor: preset.bg, color: preset.text, border: `1px solid ${preset.border}` }}>
      <div className="flex flex-col items-center gap-1">
        <Monogram text={title} bg="transparent" fg={preset.border} />
        <div className="text-center text-sm font-black">{title}</div>
        <div className="text-[8px] font-bold tracking-[0.32em]" style={{ color: preset.border }}>MENU</div>
      </div>
      <div className="my-2 flex items-center gap-2" style={{ color: preset.border }}>
        <span className="h-px flex-1 bg-current opacity-40" />
        <span className="h-1.5 w-1.5 rotate-45 bg-current" />
        <span className="h-px flex-1 bg-current opacity-40" />
      </div>
      <div className="grid flex-1 place-items-center">
        <div className={`${qrSize} rounded-[14px] bg-white p-2 shadow-sm`}>
          <FakeQr ink={preset.text} compact={compact} />
        </div>
      </div>
      <div className="text-center text-[10px] font-bold">امسح للاطلاع على القائمة</div>
    </div>
  )
}

export function QrTemplateExampleCard({
  templateId,
  name,
  restaurantName,
  selected = false,
  onClick,
  compact = false,
}: QrTemplateExampleCardProps) {
  const content = (
    <>
      <div className={compact ? "h-40" : "h-56"}>
        <PreviewFace templateId={templateId} restaurantName={restaurantName} compact={compact} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-[#2f2923]">{name}</div>
          <div className="mt-0.5 text-xs text-[#827466]">{qrTemplatePreviewPresets[templateId].note}</div>
        </div>
        {selected ? <span className="rounded-full bg-[#b03a2e] px-2 py-1 text-[10px] font-bold text-white">محدد</span> : null}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-[14px] border bg-white p-3 text-right transition-colors ${
          selected ? "border-[#b03a2e] shadow-sm" : "border-[#e2d3c1] hover:border-[#d0b8a0] hover:bg-[#fffaf6]"
        }`}
      >
        {content}
      </button>
    )
  }

  return (
    <div className="rounded-[14px] border border-[#e2d3c1] bg-white p-3">
      {content}
    </div>
  )
}
