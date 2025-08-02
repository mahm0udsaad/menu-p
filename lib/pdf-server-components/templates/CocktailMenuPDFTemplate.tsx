import React from 'react'
import { CocktailMenuBase, CocktailMenuBaseProps } from '@/components/templates/CocktailMenuBase'

export function CocktailMenuPDFTemplate(props: CocktailMenuBaseProps) {
  return <CocktailMenuBase {...props} isPreview={false} isPdfGeneration />
}

export default CocktailMenuPDFTemplate
