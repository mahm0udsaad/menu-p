"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Type, Layers, ImageIcon, Plus, LayoutTemplate, Palette, Eye, Edit3, EyeOff } from "lucide-react"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import { cn } from "@/lib/utils"

interface FloatingControlButtonProps {
  onClick: () => void
  title: string
  icon: React.ReactNode
  className?: string
  disabled?: boolean
}

const FloatingControlButton: React.FC<FloatingControlButtonProps> = ({
  onClick,
  title,
  icon,
  className = "",
  disabled = false,
}) => {
  return (
    <div className="relative group">
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full w-12 h-12 flex items-center justify-center",
          "transition-all duration-200",
          "hover:scale-110 active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        aria-label={title}
      >
        {icon}
      </Button>
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {title}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  )
}

export const ReusableFloatingControls: React.FC = () => {
  const { state, actions } = useMenuEditor()

  const [showDesignModal, setShowDesignModal] = React.useState(false)
  const [showRowStylingModal, setShowRowStylingModal] = React.useState(false)
  const [showPageBackgroundModal, setShowPageBackgroundModal] = React.useState(false)
  const [showTemplateSwitcherModal, setShowTemplateSwitcherModal] = React.useState(false)
  const [showColorModal, setShowColorModal] = React.useState(false)
  const [isLoadingDummy, setIsLoadingDummy] = React.useState(false)

  const handleLoadDummyData = async () => {
    setIsLoadingDummy(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add dummy categories and items
    const sampleCategory1: import("@/contexts/menu-context").MenuCategory = {
      id: `category-${Date.now()}-1`,
      name: "Appetizers",
      description: "Start your meal with these delicious options",
      items: [
        {
          id: `item-${Date.now()}-1`,
          name: "Bruschetta",
          description: "Toasted bread with fresh tomatoes and basil",
          price: 8.99,
          currency: "$",
          isAvailable: true,
          isFeatured: false,
          dietaryInfo: ["vegetarian"],
        },
        {
          id: `item-${Date.now()}-2`,
          name: "Calamari Rings",
          description: "Crispy fried squid with marinara sauce",
          price: 12.99,
          currency: "$",
          isAvailable: true,
          isFeatured: true,
          dietaryInfo: [],
        },
      ],
    }

    const sampleCategory2: import("@/contexts/menu-context").MenuCategory = {
      id: `category-${Date.now()}-2`,
      name: "Main Courses",
      description: "Our signature dishes",
      items: [
        {
          id: `item-${Date.now()}-3`,
          name: "Grilled Salmon",
          description: "Fresh Atlantic salmon with lemon butter sauce",
          price: 24.99,
          currency: "$",
          isAvailable: true,
          isFeatured: true,
          dietaryInfo: ["gluten-free"],
        },
        {
          id: `item-${Date.now()}-4`,
          name: "Ribeye Steak",
          description: "12oz prime cut with garlic mashed potatoes",
          price: 32.99,
          currency: "$",
          isAvailable: true,
          isFeatured: false,
          dietaryInfo: [],
        },
      ],
    }

    actions.addCategory(sampleCategory1)
    actions.addCategory(sampleCategory2)

    setIsLoadingDummy(false)
  }

  // Preview/Edit toggle button - always visible
  const previewToggleButton = {
    id: "preview-toggle",
    title: state.isPreviewMode ? "Switch to Edit Mode" : "Switch to Preview Mode",
    icon: state.isPreviewMode ? <Edit3 className="h-5 w-5" /> : <Eye className="h-5 w-5" />,
    onClick: actions.togglePreviewMode,
    className: state.isPreviewMode
      ? "text-green-600 hover:text-green-700 hover:bg-green-100/50 bg-green-50"
      : "text-blue-600 hover:text-blue-700 hover:bg-blue-100/50",
  }

  // Other controls - only visible in edit mode
  const editControls = [
    {
      id: "design",
      title: "Font Settings",
      icon: <Type className="h-5 w-5" />,
      onClick: () => setShowDesignModal(true),
      className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50",
    },
    {
      id: "styling",
      title: "Element Design",
      icon: <Layers className="h-5 w-5" />,
      onClick: () => setShowRowStylingModal(true),
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-100/50",
    },
    {
      id: "background",
      title: "Page Background",
      icon: <ImageIcon className="h-5 w-5" />,
      onClick: () => setShowPageBackgroundModal(true),
      className: "text-orange-600 hover:text-orange-700 hover:bg-orange-100/50",
    },
    {
      id: "template",
      title: "Change Template",
      icon: <LayoutTemplate className="h-5 w-5" />,
      onClick: () => setShowTemplateSwitcherModal(true),
      className: "text-purple-600 hover:text-purple-700 hover:bg-purple-100/50",
    },
    {
      id: "colors",
      title: "Color Palette",
      icon: <Palette className="h-5 w-5" />,
      onClick: () => setShowColorModal(true),
      className: "text-pink-600 hover:text-pink-700 hover:bg-pink-100/50",
    },
    {
      id: "dummy-data",
      title: "Add Sample Data",
      icon: isLoadingDummy ? (
        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Plus className="h-5 w-5" />
      ),
      onClick: handleLoadDummyData,
      disabled: isLoadingDummy,
      className: "text-gray-600 hover:text-gray-700 hover:bg-gray-100/50",
    },
    {
      id: "toggle-edit-buttons",
      title: state.showEditButtons ? "Hide Edit Buttons" : "Show Edit Buttons",
      icon: state.showEditButtons ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />,
      onClick: actions.toggleEditButtons,
      className: state.showEditButtons
        ? "text-red-600 hover:text-red-700 hover:bg-red-100/50"
        : "text-green-600 hover:text-green-700 hover:bg-green-100/50",
    },
  ]

  // Show only preview toggle in preview mode, all controls in edit mode
  const visibleControls = state.isPreviewMode ? [previewToggleButton] : [previewToggleButton, ...editControls]

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm p-3 rounded-full border border-gray-200/50 shadow-lg">
          {visibleControls.map((control) => (
            <FloatingControlButton
              key={control.id}
              onClick={control.onClick}
              title={control.title}
              icon={control.icon}
              className={control.className}
              disabled={control.disabled}
            />
          ))}
        </div>
      </div>

      {/* Design Modal */}
      {showDesignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Font Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={state.customization.fontFamily}
                  onChange={(e) => actions.updateCustomization({ fontFamily: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="Inter">Inter</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lora">Lora</option>
                  <option value="Merriweather">Merriweather</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size: {state.customization.fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={state.customization.fontSize}
                  onChange={(e) => actions.updateCustomization({ fontSize: Number.parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowDesignModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Color Modal */}
      {showColorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Color Palette</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={state.customization.backgroundColor}
                    onChange={(e) => actions.updateCustomization({ backgroundColor: e.target.value })}
                    className="w-12 h-10 border rounded"
                  />
                  <input
                    type="text"
                    value={state.customization.backgroundColor}
                    onChange={(e) => actions.updateCustomization({ backgroundColor: e.target.value })}
                    className="flex-1 p-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={state.customization.textColor}
                    onChange={(e) => actions.updateCustomization({ textColor: e.target.value })}
                    className="w-12 h-10 border rounded"
                  />
                  <input
                    type="text"
                    value={state.customization.textColor}
                    onChange={(e) => actions.updateCustomization({ textColor: e.target.value })}
                    className="flex-1 p-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={state.customization.accentColor}
                    onChange={(e) => actions.updateCustomization({ accentColor: e.target.value })}
                    className="w-12 h-10 border rounded"
                  />
                  <input
                    type="text"
                    value={state.customization.accentColor}
                    onChange={(e) => actions.updateCustomization({ accentColor: e.target.value })}
                    className="flex-1 p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowColorModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Background Modal */}
      {showPageBackgroundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Page Background</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        actions.updateCustomization({ backgroundImage: event.target?.result as string })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>

              {state.customization.backgroundImage && (
                <Button
                  variant="outline"
                  onClick={() => actions.updateCustomization({ backgroundImage: null })}
                  className="w-full"
                >
                  Remove Background Image
                </Button>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowPageBackgroundModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Switcher Modal */}
      {showTemplateSwitcherModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Change Template</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "minimalist", name: "Minimalist" },
                { id: "luxury", name: "Luxury Dark" },
                { id: "coffee", name: "Coffee Shop" },
                { id: "vintage", name: "Vintage" },
                { id: "chalkboard", name: "Chalkboard" },
                { id: "botanical", name: "Botanical" },
                { id: "cocktail", name: "Cocktail Bar" },
                { id: "vintage-bakery", name: "Vintage Bakery" },
                { id: "fast-food", name: "Fast Food" },
                { id: "elegant-cocktail", name: "Elegant Cocktail" },
                { id: "sweet-treats", name: "Sweet Treats" },
              ].map((template) => (
                <Button
                  key={template.id}
                  variant={state.selectedTemplate === template.id ? "default" : "outline"}
                  onClick={() => {
                    actions.setTemplate(template.id)
                    setShowTemplateSwitcherModal(false)
                  }}
                  className="h-16 text-sm"
                >
                  {template.name}
                </Button>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowTemplateSwitcherModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ReusableFloatingControls
