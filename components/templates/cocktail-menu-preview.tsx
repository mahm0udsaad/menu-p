"use client"

import { useMenuEditor } from '@/contexts/menu-editor-context'
import { CocktailMenuBase } from './CocktailMenuBase'

export default function CocktailMenuPreview() {
  const {
    restaurant,
    categories,
    currentLanguage,
    appliedFontSettings,
    appliedPageBackgroundSettings,
    appliedRowStyles,
  } = useMenuEditor()

  const customizations = {
    fontSettings: appliedFontSettings,
    pageBackgroundSettings: appliedPageBackgroundSettings,
    rowStyles: appliedRowStyles,
  }

  return (
    <CocktailMenuBase
      restaurant={restaurant}
      categories={categories}
      language={currentLanguage}
      customizations={customizations}
      isPreview
    />
  )
}

export { CocktailMenuBase } from './CocktailMenuBase'
