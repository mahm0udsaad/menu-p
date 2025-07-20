"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DollarSign, Star, Utensils } from "lucide-react"
import type { MenuItem } from "@/types/menu"

interface MenuItemFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Omit<MenuItem, "id">) => void
  initialItem?: MenuItem
  mode: "create" | "edit"
}

export function MenuItemForm({ isOpen, onClose, onSave, initialItem, mode }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "",
    imageUrl: "",
    isAvailable: true,
    isFeatured: false,
    dietaryInfo: [] as ("vegan" | "vegetarian" | "gluten-free" | "spicy")[],
  })

  useEffect(() => {
    if (initialItem) {
      setFormData({
        name: initialItem.name,
        description: initialItem.description || "",
        price: initialItem.price,
        currency: initialItem.currency,
        imageUrl: initialItem.imageUrl || "",
        isAvailable: initialItem.isAvailable,
        isFeatured: initialItem.isFeatured,
        dietaryInfo: initialItem.dietaryInfo,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "",
        imageUrl: "",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      })
    }
  }, [initialItem, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleDietaryChange = (dietary: "vegan" | "vegetarian" | "gluten-free" | "spicy", checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dietaryInfo: checked ? [...prev.dietaryInfo, dietary] : prev.dietaryInfo.filter((item) => item !== dietary),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              {mode === "create" ? "Add New Menu Item" : "Edit Menu Item"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Grilled Fingerlings"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Grilled potatoes with a Western flair served with sauce of choice."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 p-4 bg-green-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Pricing
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                  placeholder="$"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 p-4 bg-amber-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-600" />
              Options
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="available"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isAvailable: !!checked }))}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: !!checked }))}
                />
                <Label htmlFor="featured">Featured Item</Label>
              </div>
            </div>
          </div>

          {/* Dietary Information */}
          <div className="space-y-4 p-4 bg-teal-50 rounded-xl">
            <h3 className="font-semibold text-gray-900">Dietary Information</h3>

            <div className="grid grid-cols-2 gap-3">
              {(["vegan", "vegetarian", "gluten-free", "spicy"] as const).map((dietary) => (
                <div key={dietary} className="flex items-center space-x-3">
                  <Checkbox
                    id={dietary}
                    checked={formData.dietaryInfo.includes(dietary)}
                    onCheckedChange={(checked) => handleDietaryChange(dietary, !!checked)}
                  />
                  <Label htmlFor={dietary} className="capitalize">
                    {dietary}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              {mode === "create" ? "Add Item" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
