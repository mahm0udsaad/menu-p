"use client"
import { useMenuEditor } from "@/contexts/menu-editor-context"
import { BorcelleCoffeePreview } from "./borcelle-coffee-preview"
import { ReusableFloatingControls } from "./floating-controls"

export function BorcelleCoffeeEditor() {
  const { state, actions } = useMenuEditor()

  

  return (
    <div className="relative">
      <BorcelleCoffeePreview />
      <ReusableFloatingControls />
    </div>
  )
}
