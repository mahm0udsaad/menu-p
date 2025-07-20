"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, X } from "lucide-react"
import type { MenuItem } from "@/types/menu"

interface InlineItemFormProps {
  initialItem?: MenuItem
  onSave: (item: Omit<MenuItem, "id">) => void
  onCancel: () => void
  isSpecialCategory?: boolean
}

export function InlineItemForm({ initialItem, onSave, onCancel, isSpecialCategory = false }: InlineItemFormProps) {
  const [formData, setFormData] = useState({
    name: initialItem?.name || "",
    description: initialItem?.description || "",
    price: initialItem?.price || 0,
    currency: initialItem?.currency || "$",
    imageUrl: initialItem?.imageUrl || "",
    isAvailable: initialItem?.isAvailable ?? true,
    isFeatured: initialItem?.isFeatured ?? false,
    dietaryInfo: initialItem?.dietaryInfo || ([] as ("vegan" | "vegetarian" | "gluten-free" | "spicy")[]),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSave(formData)
  }

  const handleDietaryChange = (dietary: "vegan" | "vegetarian" | "gluten-free" | "spicy", checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dietaryInfo: checked ? [...prev.dietaryInfo, dietary] : prev.dietaryInfo.filter((item) => item !== dietary),
    }))
  }

  const inputClassName = "bg-yellow-600/20 border-yellow-600/50 text-yellow-200 placeholder-yellow-200/50"
  const labelClassName = "text-yellow-200/90"

  return (
    <div className="p-4 rounded-lg border-2 border-dashed border-yellow-600/30 bg-yellow-600/10">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name" className={`text-sm ${labelClassName}`}>
              Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Item name"
              className={`text-sm ${inputClassName}`}
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="price" className={`text-sm ${labelClassName}`}>
                Price *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                className={`text-sm ${inputClassName}`}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency" className={`text-sm ${labelClassName}`}>
                Currency
              </Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                placeholder="$"
                className={`text-sm ${inputClassName}`}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className={`text-sm ${labelClassName}`}>
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Item description"
            rows={2}
            className={`text-sm resize-none ${inputClassName}`}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isAvailable: !!checked }))}
              className="border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-black"
            />
            <Label htmlFor="available" className={`text-sm ${labelClassName}`}>
              Available
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: !!checked }))}
              className="border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-black"
            />
            <Label htmlFor="featured" className={`text-sm ${labelClassName}`}>
              Featured
            </Label>
          </div>
        </div>

        <div>
          <Label className={`text-sm ${labelClassName}`}>Dietary Info</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(["vegan", "vegetarian", "gluten-free", "spicy"] as const).map((dietary) => (
              <div key={dietary} className="flex items-center space-x-2">
                <Checkbox
                  id={dietary}
                  checked={formData.dietaryInfo.includes(dietary)}
                  onCheckedChange={(checked) => handleDietaryChange(dietary, !!checked)}
                  className="border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-black"
                />
                <Label htmlFor={dietary} className={`text-xs capitalize ${labelClassName}`}>
                  {dietary}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" size="sm" className="bg-yellow-600 text-black hover:bg-yellow-700 font-semibold">
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10 bg-transparent"
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
