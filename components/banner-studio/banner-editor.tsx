"use client"

/**
 * Banner editor hub: canvas + toolbar + inspector + product/sticker pickers,
 * with debounced autosave and PNG/PDF/social export.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  Type,
  ShoppingBag,
  Sticker as StickerIcon,
  Image as ImageIcon,
  Download,
  Check,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveBanner, exportBannerAction, type BannerActionResult } from "@/lib/actions/banners"
import { makeText, makeProduct, makeSticker, topZ } from "@/lib/banners/factory"
import { backgroundStyle } from "@/lib/banners/render"
import {
  BANNER_EXPORTS,
  type BannerBackground,
  type BannerDoc,
  type BannerElement,
  type BannerExportTarget,
  type BannerRecord,
  type ProductElement,
} from "@/lib/banners/types"
import BannerCanvas from "./banner-canvas"
import ElementInspector from "./element-inspector"
import ProductPicker, { type BannerMenuCategory, type BannerMenuItem } from "./product-picker"
import StickerPicker from "./sticker-picker"

type PickerMode = "add-product" | "change-product" | "add-sticker" | "change-sticker" | null
type SaveState = "idle" | "saving" | "saved" | "error"

interface Props {
  banner: BannerRecord
  categories: BannerMenuCategory[]
  currency: string
  onBack: () => void
  onUpdated: (banner: BannerRecord) => void
}

export default function BannerEditor({ banner, categories, currency, onBack, onUpdated }: Props) {
  const [doc, setDoc] = useState<BannerDoc>(banner.doc)
  const [title, setTitle] = useState<string>(banner.title ?? "بانر جديد")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [picker, setPicker] = useState<PickerMode>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [exporting, setExporting] = useState<BannerExportTarget | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstRender = useRef(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // keep latest callback/values without re-arming the autosave effect (whose
  // only triggers must be doc/title changes, not parent re-renders)
  const onUpdatedRef = useRef(onUpdated)
  onUpdatedRef.current = onUpdated
  const titleRef = useRef(title)
  titleRef.current = title

  const selected = doc.elements.find((e) => e.id === selectedId) ?? null

  // ── debounced autosave (fires on doc/title edits only) ──────────────────────
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setSaveState("saving")
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const res: BannerActionResult = await saveBanner({ id: banner.id, title: titleRef.current, doc })
      if (res.success && res.banner) {
        setSaveState("saved")
        onUpdatedRef.current(res.banner)
      } else {
        setSaveState("error")
        setError(res.error ?? "تعذر الحفظ")
      }
    }, 1000)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [doc, title, banner.id])

  // ── element ops ─────────────────────────────────────────────────────────────
  const updateElement = useCallback((id: string, patch: Partial<BannerElement>) => {
    setDoc((d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as BannerElement) : e)) }))
  }, [])

  const addElement = useCallback((el: BannerElement) => {
    setDoc((d) => ({ ...d, elements: [...d.elements, el] }))
    setSelectedId(el.id)
  }, [])

  const removeElement = useCallback((id: string) => {
    setDoc((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) }))
    setSelectedId(null)
  }, [])

  const duplicateElement = useCallback((id: string) => {
    setDoc((d) => {
      const el = d.elements.find((e) => e.id === id)
      if (!el) return d
      const copy = { ...el, id: `${el.type}_${Math.random().toString(36).slice(2, 8)}`, x: el.x + 3, y: el.y + 3, z: topZ(d.elements) } as BannerElement
      setSelectedId(copy.id)
      return { ...d, elements: [...d.elements, copy] }
    })
  }, [])

  const restack = useCallback((id: string, dir: "front" | "back") => {
    setDoc((d) => {
      const zs = d.elements.map((e) => e.z ?? 0)
      const z = dir === "front" ? Math.max(...zs, 0) + 1 : Math.min(...zs, 0) - 1
      return { ...d, elements: d.elements.map((e) => (e.id === id ? { ...e, z } : e)) }
    })
  }, [])

  // ── add buttons ─────────────────────────────────────────────────────────────
  const addText = () => addElement(makeText(topZ(doc.elements)))
  const addStickerClick = () => setPicker("add-sticker")
  const addProductClick = () => setPicker("add-product")

  const productFromItem = (item: BannerMenuItem): Partial<ProductElement> => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.image_url,
    currency,
  })

  const onPickProduct = (item: BannerMenuItem) => {
    if (picker === "change-product" && selected?.type === "product") {
      updateElement(selected.id, productFromItem(item))
    } else {
      addElement(makeProduct(topZ(doc.elements), productFromItem(item)))
    }
    setPicker(null)
  }

  const onPickSticker = (stickerId: string) => {
    if (picker === "change-sticker" && selected?.type === "sticker") {
      updateElement(selected.id, { stickerId })
    } else {
      addElement(makeSticker(topZ(doc.elements), stickerId))
    }
    setPicker(null)
  }

  // ── background ──────────────────────────────────────────────────────────────
  const setBackground = (patch: Partial<BannerBackground>) =>
    setDoc((d) => ({ ...d, background: { ...d.background, ...patch } }))

  // ── export ──────────────────────────────────────────────────────────────────
  const doExport = async (target: BannerExportTarget) => {
    setExportOpen(false)
    setExporting(target)
    setError(null)
    // make sure latest doc is persisted before rendering
    await saveBanner({ id: banner.id, title, doc })
    const res = await exportBannerAction({ id: banner.id, target })
    setExporting(null)
    if (res.success && res.url) {
      window.open(res.url, "_blank")
    } else {
      setError(res.error ?? "تعذر التصدير")
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col" dir="rtl">
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={onBack}>
            <ArrowRight className="h-4 w-4" /> رجوع
          </Button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-44 rounded-lg border border-transparent px-2 py-1 text-sm font-bold text-gray-800 hover:border-gray-200 focus:border-indigo-400 focus:outline-none"
          />
          <span className="flex items-center gap-1 text-xs text-gray-400">
            {saveState === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
            {saveState === "saving" ? "جارٍ الحفظ..." : saveState === "saved" ? <><Check className="h-3 w-3 text-green-500" /> تم الحفظ</> : ""}
          </span>
        </div>

        <div className="relative">
          <Button onClick={() => setExportOpen((v) => !v)} disabled={!!exporting} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            تصدير
          </Button>
          {exportOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
              {(Object.keys(BANNER_EXPORTS) as BannerExportTarget[]).map((t) => (
                <button
                  key={t}
                  onClick={() => doExport(t)}
                  className="block w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-indigo-50"
                >
                  {BANNER_EXPORTS[t].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 px-4 py-2 text-center text-sm text-red-600">{error}</div>}

      <div className="flex flex-1 overflow-hidden">
        {/* tool rail */}
        <div className="flex w-16 flex-col items-center gap-1 border-l border-gray-100 bg-white py-4">
          {[
            { icon: Type, label: "نص", onClick: addText },
            { icon: ShoppingBag, label: "منتج", onClick: addProductClick },
            { icon: StickerIcon, label: "ملصق", onClick: addStickerClick },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex w-14 flex-col items-center gap-1 rounded-lg py-2 text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>

        {/* canvas */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-6">
          <div className="w-full max-w-4xl shadow-xl">
            <BannerCanvas
              doc={doc}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={updateElement}
              onCommit={() => setSaveState("saving")}
            />
          </div>
        </div>

        {/* right panel */}
        <div className="w-72 border-r border-gray-100 bg-white">
          {selected ? (
            <ElementInspector
              element={selected}
              onUpdate={(patch) => updateElement(selected.id, patch)}
              onDelete={() => removeElement(selected.id)}
              onDuplicate={() => duplicateElement(selected.id)}
              onBringFront={() => restack(selected.id, "front")}
              onSendBack={() => restack(selected.id, "back")}
              onChangeProduct={() => setPicker("change-product")}
              onChangeSticker={() => setPicker("change-sticker")}
            />
          ) : (
            <BackgroundPanel background={doc.background} onChange={setBackground} />
          )}
        </div>
      </div>

      {(picker === "add-product" || picker === "change-product") && (
        <ProductPicker categories={categories} currency={currency} onPick={onPickProduct} onClose={() => setPicker(null)} />
      )}
      {(picker === "add-sticker" || picker === "change-sticker") && (
        <StickerPicker onPick={onPickSticker} onClose={() => setPicker(null)} />
      )}
    </div>
  )
}

function BackgroundPanel({
  background,
  onChange,
}: {
  background: BannerBackground
  onChange: (patch: Partial<BannerBackground>) => void
}) {
  const hex = (v: string | undefined, fb: string) => (/^#[0-9a-fA-F]{6}$/.test(v ?? "") ? (v as string) : fb)
  return (
    <div className="space-y-4 p-4 text-right" dir="rtl">
      <h3 className="text-sm font-bold text-gray-800">الخلفية</h3>
      <div
        className="h-20 w-full rounded-xl border border-gray-200"
        style={backgroundStyle(background) as React.CSSProperties}
      />
      <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm">
        {(["solid", "gradient", "image"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onChange({ type: t })}
            className={`flex-1 py-1.5 ${background.type === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}
          >
            {t === "solid" ? "لون" : t === "gradient" ? "تدرّج" : "صورة"}
          </button>
        ))}
      </div>

      {background.type === "solid" && (
        <label className="flex items-center justify-between">
          <span className="text-xs text-gray-500">اللون</span>
          <input type="color" value={hex(background.color, "#7f1d1d")} onChange={(e) => onChange({ color: e.target.value })} className="h-8 w-12 rounded border p-0.5" />
        </label>
      )}

      {background.type === "gradient" && (
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="text-xs text-gray-500">من</span>
            <input type="color" value={hex(background.gradientFrom, "#7f1d1d")} onChange={(e) => onChange({ gradientFrom: e.target.value })} className="h-8 w-12 rounded border p-0.5" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-xs text-gray-500">إلى</span>
            <input type="color" value={hex(background.gradientTo, "#b91c1c")} onChange={(e) => onChange({ gradientTo: e.target.value })} className="h-8 w-12 rounded border p-0.5" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-xs text-gray-500">الاتجاه</span>
            <input
              type="range"
              min={0}
              max={360}
              value={background.gradientAngle ?? 135}
              onChange={(e) => onChange({ gradientAngle: Number(e.target.value) })}
              className="w-32 accent-indigo-600"
            />
          </label>
        </div>
      )}

      {background.type === "image" && (
        <input
          value={background.imageUrl ?? ""}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="رابط صورة الخلفية"
          className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
        />
      )}

      <p className="pt-2 text-xs text-gray-400">اضغط على أي عنصر في البانر لتعديله، أو استخدم الأدوات على اليمين لإضافة نص ومنتجات وملصقات.</p>
    </div>
  )
}
