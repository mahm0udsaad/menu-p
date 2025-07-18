"use client"

import { useEffect, useState } from 'react'
import { useTemplateData } from './TemplateDataProvider'
import FontLoader from './FontLoader'

interface TemplateBaseProps {
  children: React.ReactNode
  className?: string
}

export default function TemplateBase({ children, className = '' }: TemplateBaseProps) {
  const { data, loading, error } = useTemplateData()
  const [ready, setReady] = useState(false)

  const handleFontsLoaded = () => {
    setReady(true)
    // Signal to Playwright that the page is ready
    if (typeof window !== 'undefined') {
      (window as any).pageReady = true
    }
  }

  useEffect(() => {
    // Apply language direction
    if (data.language) {
      const isRTL = ['ar', 'fa', 'ur', 'he'].includes(data.language)
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', data.language)
    }
  }, [data.language])

  if (loading) {
    return (
      <div className="pdf-page flex items-center justify-center">
        <div className="text-gray-500">Loading template data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pdf-page flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <>
      <FontLoader 
        language={data.language || 'ar'}
        fontSettings={data.customizations?.fontSettings}
        onFontsLoaded={handleFontsLoaded}
      />
      <div className={`pdf-page ${className} ${ready ? 'font-loaded' : 'font-loading'}`}>
        {children}
      </div>
    </>
  )
} 