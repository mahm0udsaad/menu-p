"use client"

import { useState } from "react"
import { TemplateSelector } from "./template-selector"
import { InteractiveMenuEditor } from "./interactive-menu-editor"
import { LuxuryMenuEditor } from "./luxury-menu-editor"
import { ModernCoffeeEditor } from "./modern-coffee-editor"
import { VintageCoffeeEditor } from "./vintage-coffee-editor"
import { ChalkboardCoffeeEditor } from "./chalkboard-coffee-editor"
import { BotanicalCafeEditor } from "./botanical-cafe-editor"
import { CocktailMenuEditor } from "./cocktail-menu-editor"
import { VintageBakeryEditor } from "./vintage-bakery-editor"
import { FastFoodMenuPreview } from "./fast-food-menu-preview"
import { ElegantCocktailMenuPreview } from "./elegant-cocktail-menu-preview"
import { SweetTreatsMenuPreview } from "./sweet-treats-menu-preview"
import { SimpleCoffeeEditor } from "./simple-coffee-editor"
import { BorcelleCoffeeEditor } from "./borcelle-coffee-editor"
import { ReusableFloatingControls } from "./floating-controls"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Palette } from "lucide-react"

export function MenuEditorApp() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleBackToSelector = () => {
    setSelectedTemplate(null)
  }

  const renderEditor = () => {
    switch (selectedTemplate) {
      case "minimalist":
        return <InteractiveMenuEditor />
      case "luxury":
        return <LuxuryMenuEditor />
      case "coffee":
        return <ModernCoffeeEditor />
      case "vintage":
        return <VintageCoffeeEditor />
      case "chalkboard":
        return <ChalkboardCoffeeEditor />
      case "botanical":
        return <BotanicalCafeEditor />
      case "cocktail":
        return <CocktailMenuEditor />
      case "vintage-bakery":
        return <VintageBakeryEditor />
      case "fast-food":
        return <FastFoodMenuPreview />
      case "elegant-cocktail":
        return <ElegantCocktailMenuPreview />
      case "sweet-treats":
        return <SweetTreatsMenuPreview />
      case "simple-coffee":
        return <SimpleCoffeeEditor />
      case "borcelle-coffee":
        return <BorcelleCoffeeEditor />
      default:
        return null
    }
  }

  if (!selectedTemplate) {
    return <TemplateSelector onSelectTemplate={handleSelectTemplate} />
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={handleBackToSelector}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white shadow-lg"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
      </div>

      {/* Template Badge */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {selectedTemplate?.replace("-", " ")} Template
            </span>
          </div>
        </div>
      </div>

      {/* Floating Controls */}
      <ReusableFloatingControls />

      {/* Editor */}
      {renderEditor()}
    </div>
  )
}
