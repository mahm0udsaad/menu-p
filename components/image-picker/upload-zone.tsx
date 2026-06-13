"use client"

/** Compact drop-zone that uploads to storage AND registers the gallery row. */

import { useCallback, useRef, useState, type DragEvent } from "react"
import { AlertCircle, Loader2, UploadCloud } from "lucide-react"
import { uploadAsset, type ImageAssetRecord } from "@/lib/actions/image-assets"

const MAX_FILE_BYTES = 8 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const STRINGS = {
  dropTitle: "أو ارفع صورتك الخاصة",
  dropHint: "JPG أو PNG أو WebP — بحد أقصى 8 ميجابايت، وستُحفظ في المعرض",
  uploading: "جاري رفع الصورة...",
  badType: "نوع الصورة غير مدعوم — ارفع JPG أو PNG أو WebP",
  tooLarge: "حجم الصورة أكبر من 8 ميجابايت",
  failed: "تعذر رفع الصورة، حاول مرة أخرى",
} as const

export interface UploadZoneProps {
  /** Item name used to tag the uploaded asset for future recommendations. */
  itemName: string
  onUploaded: (asset: ImageAssetRecord) => void
}

export default function UploadZone({ itemName, onUploaded }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File | undefined) => {
      setError(null)
      if (!file || uploading) return
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(STRINGS.badType)
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(STRINGS.tooLarge)
        return
      }
      setUploading(true)
      try {
        const formData = new FormData()
        formData.set("file", file)
        formData.set("itemName", itemName)
        formData.set("kind", "menu_item")
        const result = await uploadAsset(formData)
        if (result.success && result.asset) {
          onUploaded(result.asset)
        } else {
          setError(result.error ?? STRINGS.failed)
        }
      } catch {
        setError(STRINGS.failed)
      } finally {
        setUploading(false)
      }
    },
    [itemName, onUploaded, uploading]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      void handleFile(e.dataTransfer.files?.[0])
    },
    [handleFile]
  )

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        aria-label={STRINGS.dropTitle}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl px-4 py-5 flex items-center justify-center gap-3 cursor-pointer transition-colors text-center ${
          dragging ? "border-rose-400 bg-rose-50" : "border-gray-300 bg-white hover:border-rose-300 hover:bg-rose-50/40"
        } ${uploading ? "opacity-70 cursor-wait" : ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 text-rose-600 animate-spin flex-shrink-0" />
            <span className="text-sm text-gray-700">{STRINGS.uploading}</span>
          </>
        ) : (
          <>
            <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UploadCloud className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{STRINGS.dropTitle}</p>
              <p className="text-xs text-gray-500">{STRINGS.dropHint}</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}
