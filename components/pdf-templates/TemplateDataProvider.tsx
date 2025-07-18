"use client"

import { createContext, useContext, useEffect, useState } from 'react'

interface TemplateData {
  restaurant?: any
  categories?: any[]
  language?: string
  customizations?: {
    fontSettings?: any
    pageBackgroundSettings?: any
    rowStyles?: any
  }
}

interface TemplateContextType {
  data: TemplateData
  loading: boolean
  error: string | null
}

const TemplateContext = createContext<TemplateContextType>({
  data: {},
  loading: true,
  error: null
})

export function useTemplateData() {
  return useContext(TemplateContext)
}

export function TemplateDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TemplateData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Parse URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const dataParam = urlParams.get('data')
      const languageParam = urlParams.get('language') || 'ar'
      const customizationsParam = urlParams.get('customizations')

      let parsedData: any = {}
      let parsedCustomizations: any = {}

      if (dataParam) {
        parsedData = JSON.parse(decodeURIComponent(dataParam))
      }

      if (customizationsParam) {
        parsedCustomizations = JSON.parse(decodeURIComponent(customizationsParam))
      }

      setData({
        ...parsedData,
        language: languageParam,
        customizations: parsedCustomizations
      })

      setLoading(false)
    } catch (err) {
      console.error('Error parsing template data:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse template data')
      setLoading(false)
    }
  }, [])

  return (
    <TemplateContext.Provider value={{ data, loading, error }}>
      {children}
    </TemplateContext.Provider>
  )
} 