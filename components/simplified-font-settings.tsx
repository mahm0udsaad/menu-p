"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Type } from "lucide-react"

interface FontOption {
  id: string
  name: string
  displayName: string
  family: string
  weights: string[]
  supports: string[]
  preview: string
}

const FONT_OPTIONS: FontOption[] = [
  {
    id: 'cairo',
    name: 'Cairo',
    displayName: 'Cairo (القاهرة)',
    family: 'Cairo, sans-serif',
    weights: ['300', '400', '500', '600', '700', '800', '900'],
    supports: ['ar', 'en'],
    preview: 'مرحباً بكم في مطعمنا Welcome to our restaurant'
  },
  {
    id: 'noto-kufi-arabic',
    name: 'Noto Kufi Arabic',
    displayName: 'Noto Kufi Arabic (نوتو كوفي)',
    family: 'Noto Kufi Arabic, sans-serif',
    weights: ['300', '400', '500', '600', '700', '800', '900'],
    supports: ['ar', 'en'],
    preview: 'مرحباً بكم في مطعمنا Welcome to our restaurant'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    displayName: 'Open Sans',
    family: 'Open Sans, sans-serif',
    weights: ['300', '400', '500', '600', '700', '800'],
    supports: ['en', 'ar'],
    preview: 'Welcome to our restaurant مرحباً بكم في مطعمنا'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    displayName: 'Roboto',
    family: 'Roboto, sans-serif',
    weights: ['300', '400', '500', '700', '900'],
    supports: ['en', 'ar'],
    preview: 'Welcome to our restaurant مرحباً بكم في مطعمنا'
  }
]

interface LanguageFontSettings {
  font: string
  weight: string
}

interface SimplifiedFontSettings {
  arabic: LanguageFontSettings
  english: LanguageFontSettings
}

interface SimplifiedFontSettingsProps {
  settings: SimplifiedFontSettings
  onSettingsChange: (settings: SimplifiedFontSettings) => void
  className?: string
}

const DEFAULT_SETTINGS: SimplifiedFontSettings = {
  arabic: { font: 'cairo', weight: '400' },
  english: { font: 'open-sans', weight: '400' }
}

export default function SimplifiedFontSettings({
  settings = DEFAULT_SETTINGS,
  onSettingsChange,
  className = ''
}: SimplifiedFontSettingsProps) {
  const [previewText] = useState({
    arabic: 'مرحباً بكم في مطعمنا الرائع! استمتعوا بتجربة طعام لا تُنسى مع أشهى الأطباق والمشروبات المتنوعة.',
    english: 'Welcome to our amazing restaurant! Enjoy an unforgettable dining experience with delicious dishes and diverse beverages.'
  })

  const arabicFonts = FONT_OPTIONS.filter(font => font.supports.includes('ar'))
  const englishFonts = FONT_OPTIONS.filter(font => font.supports.includes('en'))

  const selectedArabicFont = FONT_OPTIONS.find(font => font.id === settings.arabic.font) || arabicFonts[0]
  const selectedEnglishFont = FONT_OPTIONS.find(font => font.id === settings.english.font) || englishFonts[0]

  const handleLanguageSettingChange = (language: 'arabic' | 'english', key: 'font' | 'weight', value: string) => {
    onSettingsChange({
      ...settings,
      [language]: {
        ...settings[language],
        [key]: value
      }
    })
  }

  const getPreviewStyle = (language: 'arabic' | 'english') => {
    const fontSettings = settings[language]
    const selectedFont = language === 'arabic' ? selectedArabicFont : selectedEnglishFont
    
    return {
      fontFamily: selectedFont.family,
      fontWeight: fontSettings.weight,
      fontSize: '16px',
      lineHeight: '1.5',
      textAlign: language === 'arabic' ? 'right' : 'left',
      direction: language === 'arabic' ? 'rtl' : 'ltr',
      padding: '16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      marginTop: '8px'
    } as React.CSSProperties
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Preview - معاينة الخطوط
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Arabic Font Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800">الخط العربي</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الخط</Label>
                <Select 
                  value={settings.arabic.font} 
                  onValueChange={(value) => handleLanguageSettingChange('arabic', 'font', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {arabicFonts.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <div className="flex flex-col">
                          <span style={{ fontFamily: font.family }}>{font.displayName}</span>
                          <span className="text-xs text-muted-foreground" style={{ fontFamily: font.family }}>
                            {font.preview}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>سُمك الخط</Label>
                <Select 
                  value={settings.arabic.weight} 
                  onValueChange={(value) => handleLanguageSettingChange('arabic', 'weight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedArabicFont.weights.map((weight) => (
                      <SelectItem key={weight} value={weight}>
                        <span style={{ fontWeight: weight }}>
                          {weight === '300' ? 'خفيف' : 
                           weight === '400' ? 'عادي' : 
                           weight === '500' ? 'متوسط' : 
                           weight === '600' ? 'شبه سميك' : 
                           weight === '700' ? 'سميك' : 
                           weight === '800' ? 'سميك جداً' : 
                           weight === '900' ? 'أسود' : weight}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div style={getPreviewStyle('arabic')}>
              {previewText.arabic}
            </div>
          </div>

          {/* English Font Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800">English Font</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={settings.english.font} 
                  onValueChange={(value) => handleLanguageSettingChange('english', 'font', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {englishFonts.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <div className="flex flex-col">
                          <span style={{ fontFamily: font.family }}>{font.displayName}</span>
                          <span className="text-xs text-muted-foreground" style={{ fontFamily: font.family }}>
                            {font.preview}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select 
                  value={settings.english.weight} 
                  onValueChange={(value) => handleLanguageSettingChange('english', 'weight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEnglishFont.weights.map((weight) => (
                      <SelectItem key={weight} value={weight}>
                        <span style={{ fontWeight: weight }}>
                          {weight === '300' ? 'Light' : 
                           weight === '400' ? 'Normal' : 
                           weight === '500' ? 'Medium' : 
                           weight === '600' ? 'Semi Bold' : 
                           weight === '700' ? 'Bold' : 
                           weight === '800' ? 'Extra Bold' : 
                           weight === '900' ? 'Black' : weight}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div style={getPreviewStyle('english')}>
              {previewText.english}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export type { SimplifiedFontSettings, LanguageFontSettings } 