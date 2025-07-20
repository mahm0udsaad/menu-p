"use client"

import { VintageBakeryPreview } from "./vintage-bakery-preview"
import { MenuCustomizationPanel } from "./menu-customization-panel"
import { ReusableFloatingControls } from "./floating-controls"

export function VintageBakeryEditor() {
  return (
    <div className="flex min-h-screen">
      <MenuCustomizationPanel />
      <div className="flex-1">
        <VintageBakeryPreview />
      </div>
      <ReusableFloatingControls />
    </div>
  )
}
