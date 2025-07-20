"use client"

import type React from "react"
import { memo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import { Palette, Type, RotateCcw, Plus, Trash2 } from "lucide-react"

const MenuCustomizationPanel = memo(() => {
  const {
    state,
    customization,
    updateCustomization,
    resetCustomization,
    addCategory,
    deleteCategory,
    addMenuItem,
    deleteMenuItem,
    updateMenuItem,
    updateCategory,
  } = useMenuEditor()

  const handleBackgroundColorChange = useCallback(
    (color: string) => {
      updateCustomization({ backgroundColor: color })
    },
    [updateCustomization],
  )

  const handleFontFamilyChange = useCallback(
    (fontFamily: string) => {
      updateCustomization({ fontFamily })
    },
    [updateCustomization],
  )

  const handleFontSizeChange = useCallback(
    (fontSize: number[]) => {
      updateCustomization({ fontSize: fontSize[0] })
    },
    [updateCustomization],
  )

  const handleTextColorChange = useCallback(
    (color: string) => {
      updateCustomization({ textColor: color })
    },
    [updateCustomization],
  )

  const handleAccentColorChange = useCallback(
    (color: string) => {
      updateCustomization({ accentColor: color })
    },
    [updateCustomization],
  )

  const handleBackgroundImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          updateCustomization({ backgroundImage: event.target?.result as string })
        }
        reader.readAsDataURL(file)
      }
    },
    [updateCustomization],
  )

  const handleAddCategory = useCallback(() => {
    addCategory({
      name: "New Category",
      description: "Category description",
      items: [],
    })
  }, [addCategory])

  const handleAddMenuItem = useCallback(
    (categoryId: string) => {
      addMenuItem(categoryId, {
        name: "New Item",
        description: "Item description",
        price: 0,
        currency: "$",
        isAvailable: true,
        isFeatured: false,
        dietaryInfo: [],
      })
    },
    [addMenuItem],
  )

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Design Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Background Color */}
            <div>
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bg-color"
                  type="color"
                  value={customization.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={customization.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="text-color"
                  type="color"
                  value={customization.textColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={customization.textColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="accent-color"
                  type="color"
                  value={customization.accentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={customization.accentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  placeholder="#d4af37"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Background Image */}
            <div>
              <Label htmlFor="bg-image">Background Image</Label>
              <Input
                id="bg-image"
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageChange}
                className="mt-1"
              />
              {customization.backgroundImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateCustomization({ backgroundImage: null })}
                  className="mt-2 w-full"
                >
                  Remove Image
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font Family */}
            <div>
              <Label>Font Family</Label>
              <Select value={customization.fontFamily} onValueChange={handleFontFamilyChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lora">Lora</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div>
              <Label>Font Size: {customization.fontSize}px</Label>
              <Slider
                value={[customization.fontSize]}
                onValueChange={handleFontSizeChange}
                min={12}
                max={24}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Menu Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Menu Content</span>
              <Button size="sm" onClick={handleAddCategory}>
                <Plus className="w-4 h-4 mr-1" />
                Category
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.menu.categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Input
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                    className="font-semibold"
                  />
                  <Button size="sm" variant="outline" onClick={() => deleteCategory(category.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <Input
                        value={item.name}
                        onChange={(e) => updateMenuItem(category.id, item.id, { name: e.target.value })}
                        className="flex-1 h-8"
                      />
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateMenuItem(category.id, item.id, { price: Number.parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 h-8"
                      />
                      <Button size="sm" variant="outline" onClick={() => deleteMenuItem(category.id, item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => handleAddMenuItem(category.id)} className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reset */}
        <Button variant="outline" onClick={resetCustomization} className="w-full bg-transparent">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Customization
        </Button>
      </div>
    </div>
  )
})

MenuCustomizationPanel.displayName = "MenuCustomizationPanel"

export { MenuCustomizationPanel }
