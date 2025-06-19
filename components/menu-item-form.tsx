"use client"

import type React from "react"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, X } from "lucide-react"
import { addMenuItem, updateMenuItem } from "@/lib/actions/menu"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  category_id: string
  is_available: boolean
  is_featured: boolean
}

interface MenuItemFormProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  restaurantId: string
  item?: MenuItem | null
  onSuccess: () => void
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-emerald-600 hover:bg-emerald-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Updating..." : "Adding..."}
        </>
      ) : (
        <>{isEditing ? "Update Item" : "Add Item"}</>
      )}
    </Button>
  )
}

export default function MenuItemForm({
  isOpen,
  onClose,
  categoryId,
  restaurantId,
  item,
  onSuccess,
}: MenuItemFormProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(item?.image_url || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const isEditing = !!item

  const [state, formAction] = useActionState(isEditing ? updateMenuItem : addMenuItem, null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImageFile(null)
  }

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  // Handle successful form submission
  if (state?.success) {
    handleSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Hidden fields */}
          <input type="hidden" name="restaurantId" value={restaurantId} />
          <input type="hidden" name="categoryId" value={categoryId} />
          {isEditing && <input type="hidden" name="itemId" value={item.id} />}

          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm">
              {state.error}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Photo (Optional)</Label>
            <div className="flex items-center gap-3">
              {selectedImage ? (
                <div className="relative">
                  <Image
                    src={selectedImage || "/placeholder.svg?height=80&width=80"}
                    alt="Item preview"
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-slate-600 rounded-md text-sm hover:bg-slate-700"
                >
                  Choose Photo
                </Label>
              </div>
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Item Name *
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={item?.name || ""}
              placeholder="e.g., Cappuccino, Caesar Salad"
              required
              className="bg-slate-700 border-slate-600"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description || ""}
              placeholder="Brief description of the item..."
              rows={2}
              className="bg-slate-700 border-slate-600 resize-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Price
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item?.price || ""}
                placeholder="0.00"
                className="bg-slate-700 border-slate-600 pl-8"
              />
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_available" className="text-sm font-medium">
                Available
              </Label>
              <Switch id="is_available" name="is_available" defaultChecked={item?.is_available ?? true} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_featured" className="text-sm font-medium">
                Featured Item
              </Label>
              <Switch id="is_featured" name="is_featured" defaultChecked={item?.is_featured ?? false} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <div className="flex-1">
              <SubmitButton isEditing={isEditing} />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
