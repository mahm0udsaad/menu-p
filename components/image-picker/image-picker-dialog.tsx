"use client"

/**
 * Item image picker (Phase 3): three tabs —
 *   مقترحة  — gallery recommendations for this exact item (reuse before generate)
 *   المعرض  — searchable own + shared asset gallery, with an upload drop-zone
 *   توليد   — AI generation with live preview / regenerate / style hint
 * Selecting any asset bumps its usage_count and returns public_url to the caller.
 */

import { useCallback, useEffect, useState } from "react"
import { Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
// `useAsset` is a server action, not a React hook — aliased so the
// rules-of-hooks lint does not flag calls from inside callbacks.
import {
  findAssets,
  recommendForItem,
  useAsset as markAssetUsed,
  type ImageAssetRecord,
} from "@/lib/actions/image-assets"
import AssetGrid from "./asset-grid"
import GenerateTab from "./generate-tab"
import UploadZone from "./upload-zone"

const STRINGS = {
  title: "صورة الطبق",
  description: "اختر صورة من المقترحات أو المعرض، أو ولّد صورة جديدة بالذكاء الاصطناعي",
  tabRecommended: "مقترحة",
  tabGallery: "المعرض",
  tabGenerate: "توليد بالذكاء الاصطناعي",
  searchPlaceholder: "ابحث في المعرض: شاورما، قهوة تركي...",
  recommendedEmptyTitle: "لا توجد صور مطابقة لهذا الطبق بعد",
  recommendedEmptyHint: "جرّب تبويب «توليد بالذكاء الاصطناعي» — وستُحفظ الصورة في معرضك لإعادة استخدامها",
  galleryEmptyTitle: "معرضك فارغ حتى الآن",
  galleryEmptyHint: "كل صورة تولّدها أو ترفعها تُضاف هنا تلقائياً لتعيد استخدامها في أي طبق",
  searchEmptyTitle: "لا توجد نتائج لهذا البحث",
  searchEmptyHint: "جرّب كلمة أبسط، أو ولّد صورة جديدة من تبويب التوليد",
  selectFailed: "تعذر اختيار الصورة، حاول مرة أخرى",
} as const

export interface ImagePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Item name (Arabic) — drives recommendations, tags and the AI prompt. */
  itemName: string
  itemNameEn?: string | null
  description?: string | null
  /** Receives the chosen asset's public URL. */
  onSelect: (publicUrl: string) => void | Promise<void>
}

export default function ImagePickerDialog({
  open,
  onOpenChange,
  itemName,
  itemNameEn,
  description,
  onSelect,
}: ImagePickerDialogProps) {
  const [recommended, setRecommended] = useState<ImageAssetRecord[]>([])
  const [loadingRecommended, setLoadingRecommended] = useState(false)
  const [gallery, setGallery] = useState<ImageAssetRecord[]>([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [query, setQuery] = useState("")
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [selectError, setSelectError] = useState<string | null>(null)

  // Recommendations: instant on open, keyed to the item name
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoadingRecommended(true)
    recommendForItem({ itemName, itemNameEn: itemNameEn ?? null })
      .then((res) => {
        if (!cancelled) setRecommended(res.success ? res.assets ?? [] : [])
      })
      .finally(() => !cancelled && setLoadingRecommended(false))
    return () => {
      cancelled = true
    }
  }, [open, itemName, itemNameEn])

  // Gallery: debounced search
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoadingGallery(true)
    const timer = setTimeout(() => {
      findAssets({ query: query.trim() || undefined, kind: "menu_item" })
        .then((res) => {
          if (!cancelled) setGallery(res.success ? res.assets ?? [] : [])
        })
        .finally(() => !cancelled && setLoadingGallery(false))
    }, query ? 350 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, query])

  const handlePick = useCallback(
    async (asset: ImageAssetRecord) => {
      setSelectingId(asset.id)
      setSelectError(null)
      try {
        const used = await markAssetUsed(asset.id)
        await onSelect(used.publicUrl ?? asset.public_url)
        onOpenChange(false)
      } catch {
        setSelectError(STRINGS.selectFailed)
      } finally {
        setSelectingId(null)
      }
    },
    [onSelect, onOpenChange]
  )

  const handleUploaded = useCallback(
    (asset: ImageAssetRecord) => {
      setGallery((prev) => [asset, ...prev])
      void handlePick(asset)
    },
    [handlePick]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-rose-700">
            {STRINGS.title}
            {itemName.trim() ? `: ${itemName}` : ""}
          </DialogTitle>
          <DialogDescription>{STRINGS.description}</DialogDescription>
        </DialogHeader>

        {selectError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{selectError}</p>
        )}

        <Tabs defaultValue="recommended" dir="rtl" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-rose-50">
            <TabsTrigger value="recommended">{STRINGS.tabRecommended}</TabsTrigger>
            <TabsTrigger value="gallery">{STRINGS.tabGallery}</TabsTrigger>
            <TabsTrigger value="generate">{STRINGS.tabGenerate}</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="mt-4">
            <AssetGrid
              assets={recommended}
              loading={loadingRecommended}
              selectingId={selectingId}
              onSelect={handlePick}
              emptyTitle={STRINGS.recommendedEmptyTitle}
              emptyHint={STRINGS.recommendedEmptyHint}
            />
          </TabsContent>

          <TabsContent value="gallery" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={STRINGS.searchPlaceholder}
                className="pr-9"
              />
            </div>
            <AssetGrid
              assets={gallery}
              loading={loadingGallery}
              selectingId={selectingId}
              onSelect={handlePick}
              emptyTitle={query ? STRINGS.searchEmptyTitle : STRINGS.galleryEmptyTitle}
              emptyHint={query ? STRINGS.searchEmptyHint : STRINGS.galleryEmptyHint}
            />
            <UploadZone itemName={itemName} onUploaded={handleUploaded} />
          </TabsContent>

          <TabsContent value="generate" className="mt-4">
            <GenerateTab
              itemName={itemName}
              itemNameEn={itemNameEn}
              description={description}
              selecting={selectingId !== null}
              onUse={handlePick}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
