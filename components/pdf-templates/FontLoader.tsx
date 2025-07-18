"use client"

import { useEffect, useState } from 'react'
import { generateFontFaceCSS, getFontFamilyForLanguage, getFontWeight } from '@/lib/pdf-templates/font-config'

interface FontLoaderProps {
  language: string
  fontSettings?: {
    arabic?: { font: string; weight: string }
    english?: { font: string; weight: string }
  }
  onFontsLoaded?: () => void
}

export default function FontLoader({ 
  language, 
  fontSettings, 
  onFontsLoaded 
}: FontLoaderProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Generate all font face CSS
        const fontFaceCSS = generateFontFaceCSS()
        
        // Additional CSS for font application
        const applicationCSS = `
          :root {
            --primary-font: '${getFontFamilyForLanguage(language)}', Arial, sans-serif;
            --font-weight-normal: ${fontSettings?.arabic?.weight ? getFontWeight(fontSettings.arabic.weight) : 400};
            --font-weight-bold: ${fontSettings?.arabic?.weight ? getFontWeight(fontSettings.arabic.weight) + 300 : 700};
          }
          
          body {
            font-family: var(--primary-font);
            font-weight: var(--font-weight-normal);
          }
          
          .font-arabic {
            font-family: '${fontSettings?.arabic?.font || 'Cairo'}', 'Noto Kufi Arabic', 'Almarai', Arial, sans-serif;
          }
          
          .font-english {
            font-family: '${fontSettings?.english?.font || 'Open Sans'}', 'Roboto', Arial, sans-serif;
          }
          
          h1, h2, h3, h4, h5, h6, .font-bold {
            font-weight: var(--font-weight-bold);
          }
          
          /* RTL specific styles */
          [dir="rtl"] {
            font-family: var(--primary-font);
          }
          
          [dir="ltr"] {
            font-family: '${fontSettings?.english?.font || 'Open Sans'}', 'Roboto', Arial, sans-serif;
          }
        `

        // Inject all styles
        const styleElement = document.createElement('style')
        styleElement.textContent = fontFaceCSS + '\n' + applicationCSS
        document.head.appendChild(styleElement)

        // Wait for fonts to load
        await document.fonts.ready

        // Additional delay to ensure fonts are fully applied
        setTimeout(() => {
          setFontsLoaded(true)
          onFontsLoaded?.()
          
          // Add font-loaded class to body
          document.body.classList.remove('font-loading')
          document.body.classList.add('font-loaded')
          
          console.log('✅ Fonts loaded successfully for language:', language)
        }, 1000)

      } catch (error) {
        console.error('Error loading fonts:', error)
        // Continue anyway
        setFontsLoaded(true)
        onFontsLoaded?.()
      }
    }

    // Add font-loading class initially
    document.body.classList.add('font-loading')
    
    loadFonts()
  }, [language, fontSettings, onFontsLoaded])

  return null
} 