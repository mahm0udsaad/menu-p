"use client"

/** Right-side inspector: edits the currently selected element's content + style. */

import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Trash2,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Replace,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BannerElement, ProductElement, TextElement, TextAlign } from "@/lib/banners/types"

interface Props {
  element: BannerElement
  onUpdate: (patch: Partial<BannerElement>) => void
  onDelete: () => void
  onDuplicate: () => void
  onBringFront: () => void
  onSendBack: () => void
  onChangeProduct: () => void
  onChangeSticker: () => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </label>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-9 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
    />
  )
}

function NumberSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-32 accent-indigo-600"
    />
  )
}

export default function ElementInspector(props: Props) {
  const { element: el, onUpdate } = props

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto p-4 text-right" dir="rtl">
      {/* actions */}
      <div className="mb-2 flex items-center justify-between gap-1">
        <span className="text-sm font-bold text-gray-800">
          {el.type === "text" ? "نص" : el.type === "product" ? "منتج" : el.type === "sticker" ? "ملصق" : "صورة"}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="إلى الأمام" onClick={props.onBringFront}>
            <ArrowUpToLine className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="إلى الخلف" onClick={props.onSendBack}>
            <ArrowDownToLine className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="تكرار" onClick={props.onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            title="حذف"
            onClick={props.onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* TEXT */}
      {el.type === "text" && (
        <div className="space-y-1 pt-2">
          <textarea
            value={el.text}
            onChange={(e) => onUpdate({ text: e.target.value } as Partial<TextElement>)}
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-400 focus:outline-none"
            placeholder="اكتب النص"
          />
          <Row label="المحاذاة">
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              {([
                ["right", AlignRight],
                ["center", AlignCenter],
                ["left", AlignLeft],
              ] as Array<[TextAlign, typeof AlignRight]>).map(([a, Icon]) => (
                <button
                  key={a}
                  onClick={() => onUpdate({ align: a } as Partial<TextElement>)}
                  className={`p-1.5 ${el.align === a ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </Row>
          <Row label="الخط">
            <select
              value={el.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value as TextElement["fontFamily"] } as Partial<TextElement>)}
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
            >
              <option value="Cairo">القاهرة</option>
              <option value="Amiri">أميري</option>
            </select>
          </Row>
          <Row label="السماكة">
            <select
              value={el.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) } as Partial<TextElement>)}
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
            >
              <option value={400}>عادي</option>
              <option value={600}>متوسط</option>
              <option value={800}>عريض</option>
              <option value={900}>أسود</option>
            </select>
          </Row>
          <Row label="الحجم">
            <NumberSlider value={el.fontSizePct} min={2} max={28} step={0.5} onChange={(v) => onUpdate({ fontSizePct: v } as Partial<TextElement>)} />
          </Row>
          <Row label="اللون">
            <ColorInput value={el.color} onChange={(v) => onUpdate({ color: v } as Partial<TextElement>)} />
          </Row>
          <Row label="خلفية النص">
            <input
              type="checkbox"
              checked={!!el.bg}
              onChange={(e) => onUpdate({ bg: e.target.checked ? "#000000" : null } as Partial<TextElement>)}
              className="h-4 w-4 accent-indigo-600"
            />
            {el.bg && <ColorInput value={el.bg} onChange={(v) => onUpdate({ bg: v } as Partial<TextElement>)} />}
          </Row>
          <Row label="ظل">
            <input
              type="checkbox"
              checked={!!el.shadow}
              onChange={(e) => onUpdate({ shadow: e.target.checked } as Partial<TextElement>)}
              className="h-4 w-4 accent-indigo-600"
            />
          </Row>
        </div>
      )}

      {/* PRODUCT */}
      {el.type === "product" && (
        <div className="space-y-1 pt-2">
          <Button variant="outline" size="sm" className="mb-1 w-full gap-2" onClick={props.onChangeProduct}>
            <Replace className="h-4 w-4" /> تغيير المنتج
          </Button>
          <Row label="الاسم">
            <input
              value={el.name}
              onChange={(e) => onUpdate({ name: e.target.value } as Partial<ProductElement>)}
              className="w-32 rounded-lg border border-gray-200 px-2 py-1 text-sm"
            />
          </Row>
          <Row label="السعر">
            <input
              type="number"
              value={el.price ?? ""}
              onChange={(e) => onUpdate({ price: e.target.value === "" ? null : Number(e.target.value) } as Partial<ProductElement>)}
              className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm"
            />
          </Row>
          <Row label="السعر القديم">
            <input
              type="number"
              value={el.oldPrice ?? ""}
              onChange={(e) => onUpdate({ oldPrice: e.target.value === "" ? null : Number(e.target.value) } as Partial<ProductElement>)}
              className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm"
            />
          </Row>
          <Row label="التصميم">
            <select
              value={el.layout}
              onChange={(e) => onUpdate({ layout: e.target.value as ProductElement["layout"] } as Partial<ProductElement>)}
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
            >
              <option value="card">بطاقة</option>
              <option value="row">صف</option>
              <option value="image">صورة فقط</option>
            </select>
          </Row>
          <Row label="إظهار السعر">
            <input
              type="checkbox"
              checked={el.showPrice}
              onChange={(e) => onUpdate({ showPrice: e.target.checked } as Partial<ProductElement>)}
              className="h-4 w-4 accent-indigo-600"
            />
          </Row>
          <Row label="حجم النص">
            <NumberSlider value={el.fontSizePct} min={1.5} max={12} step={0.25} onChange={(v) => onUpdate({ fontSizePct: v } as Partial<ProductElement>)} />
          </Row>
          <Row label="لون النص">
            <ColorInput value={el.color} onChange={(v) => onUpdate({ color: v } as Partial<ProductElement>)} />
          </Row>
          <Row label="لون السعر">
            <ColorInput value={el.accent} onChange={(v) => onUpdate({ accent: v } as Partial<ProductElement>)} />
          </Row>
          <Row label="خلفية البطاقة">
            <input
              type="checkbox"
              checked={!!el.bg}
              onChange={(e) => onUpdate({ bg: e.target.checked ? "rgba(0,0,0,0.28)" : null } as Partial<ProductElement>)}
              className="h-4 w-4 accent-indigo-600"
            />
          </Row>
        </div>
      )}

      {/* STICKER */}
      {el.type === "sticker" && (
        <div className="space-y-1 pt-2">
          <Button variant="outline" size="sm" className="mb-1 w-full gap-2" onClick={props.onChangeSticker}>
            <Replace className="h-4 w-4" /> تغيير الملصق
          </Button>
          <Row label="اللون">
            <ColorInput value={el.color ?? "#f59e0b"} onChange={(v) => onUpdate({ color: v })} />
          </Row>
        </div>
      )}

      {/* IMAGE */}
      {el.type === "image" && (
        <div className="space-y-1 pt-2">
          <Row label="ملء الإطار">
            <select
              value={el.fit}
              onChange={(e) => onUpdate({ fit: e.target.value as "cover" | "contain" })}
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
            >
              <option value="cover">تغطية</option>
              <option value="contain">احتواء</option>
            </select>
          </Row>
          <Row label="استدارة الحواف">
            <NumberSlider value={el.radiusPct ?? 0} min={0} max={20} step={0.5} onChange={(v) => onUpdate({ radiusPct: v })} />
          </Row>
        </div>
      )}

      <div className="my-2 h-px bg-gray-100" />

      {/* common transform */}
      <Row label="دوران">
        <NumberSlider value={el.rotation || 0} min={-180} max={180} onChange={(v) => onUpdate({ rotation: v })} />
      </Row>
      <Row label="الشفافية">
        <NumberSlider value={Math.round((el.opacity ?? 1) * 100)} min={10} max={100} onChange={(v) => onUpdate({ opacity: v / 100 })} />
      </Row>
    </div>
  )
}
