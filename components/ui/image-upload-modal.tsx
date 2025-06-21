"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => Promise<void>
  title: string
  description?: string
  currentImageUrl?: string | null
  isUploading?: boolean
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onUpload,
  title,
  description = "اختر صورة لتحميلها",
  currentImageUrl,
  isUploading = false,
}: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onClose()
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Image */}
          {currentImageUrl && !previewUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">الصورة الحالية:</label>
              <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden">
                <Image
                  src={currentImageUrl}
                  alt="Current image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* File Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {currentImageUrl ? "تحديث الصورة:" : "اختر صورة:"}
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 cursor-pointer transition-colors"
              >
                <Upload className="h-5 w-5 text-slate-500" />
                <span className="text-slate-600">
                  {selectedFile ? selectedFile.name : "اضغط لاختيار صورة"}
                </span>
              </label>
              {selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">معاينة:</label>
              <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* File Requirements */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>متطلبات الصورة:</p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>أقصى حجم: 5MB</li>
              <li>الأنواع المدعومة: JPG, PNG, WebP</li>
              <li>الأبعاد المُفضلة: 1200x400 بكسل</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الرفع...
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                رفع الصورة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 