"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface FontSettings {
  primaryFont: string
  secondaryFont: string
  fontSize: number
  lineHeight: number
  fontWeight: string
  textAlign: 'left' | 'center' | 'right'
  letterSpacing: number
  enableCustomFonts: boolean
}

interface FontSettingsProps {
  settings: FontSettings
  onSettingsChange: (settings: FontSettings) => void
  language?: string
  preview?: boolean
  className?: string
}

const DEFAULT_SETTINGS: FontSettings = {
  primaryFont: 'cairo',
  secondaryFont: 'noto-kufi-arabic',
  fontSize: 16,
  lineHeight: 1.5,
  fontWeight: '400',
  textAlign: 'right',
  letterSpacing: 0,
  enableCustomFonts: false
}

export default function FontSettings({
  settings = DEFAULT_SETTINGS,
  onSettingsChange,
  language = 'ar',
  preview = true,
  className = ''
}: FontSettingsProps) {
  const [previewText, setPreviewText] = useState(
    language === 'ar' 
      ? 'مرحباً بكم في مطعمنا الرائع! استمتعوا بتجربة طعام لا تُنسى مع أشهى الأطباق والمشروبات المتنوعة.'
      : 'Welcome to our amazing restaurant! Enjoy an unforgettable dining experience with delicious dishes and diverse beverages.'
  )

  const availableFonts = FONT_OPTIONS.filter(font => 
    font.supports.includes(language)
  )

  const primaryFont = FONT_OPTIONS.find(font => font.id === settings?.primaryFont) || availableFonts[0]
  const secondaryFont = FONT_OPTIONS.find(font => font.id === settings?.secondaryFont) || availableFonts[1]

  const handleSettingChange = (key: keyof FontSettings, value: any) => {
    onSettingsChange({
      ...DEFAULT_SETTINGS,
      ...settings,
      [key]: value
    })
  }

  const previewStyle = {
    fontFamily: primaryFont.family,
    fontSize: `${settings?.fontSize ?? DEFAULT_SETTINGS.fontSize}px`,
    lineHeight: settings?.lineHeight ?? DEFAULT_SETTINGS.lineHeight,
    fontWeight: settings?.fontWeight ?? DEFAULT_SETTINGS.fontWeight,
    textAlign: settings?.textAlign ?? DEFAULT_SETTINGS.textAlign,
    letterSpacing: `${settings?.letterSpacing ?? DEFAULT_SETTINGS.letterSpacing}px`,
    direction: language === 'ar' ? 'rtl' : 'ltr'
  } as const

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            إعدادات الخط / Font Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Font Selection */}
          <div className="space-y-2">
            <Label>الخط الأساسي / Primary Font</Label>
            <Select 
              value={settings?.primaryFont ?? DEFAULT_SETTINGS.primaryFont} 
              onValueChange={(value) => handleSettingChange('primaryFont', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFonts.map((font) => (
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

          {/* Secondary Font Selection */}
          <div className="space-y-2">
            <Label>الخط الثانوي / Secondary Font</Label>
            <Select 
              value={settings?.secondaryFont ?? DEFAULT_SETTINGS.secondaryFont} 
              onValueChange={(value) => handleSettingChange('secondaryFont', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFonts.map((font) => (
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

          {/* Font Size */}
          <div className="space-y-2">
            <Label>حجم الخط / Font Size: {settings?.fontSize ?? DEFAULT_SETTINGS.fontSize}px</Label>
            <Slider
              value={[settings?.fontSize ?? DEFAULT_SETTINGS.fontSize]}
              onValueChange={(value) => handleSettingChange('fontSize', value[0])}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label>سُمك الخط / Font Weight</Label>
            <Select 
              value={settings?.fontWeight ?? DEFAULT_SETTINGS.fontWeight} 
              onValueChange={(value) => handleSettingChange('fontWeight', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {primaryFont.weights.map((weight) => (
                  <SelectItem key={weight} value={weight}>
                    <span style={{ fontWeight: weight }}>
                      {weight === '400' ? 'Normal' : weight === '700' ? 'Bold' : weight}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label>ارتفاع السطر / Line Height: {settings.lineHeight}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={(value) => handleSettingChange('lineHeight', value[0])}
              min={1.2}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label>محاذاة النص / Text Alignment</Label>
            <div className="flex gap-2">
              <Button
                variant={settings.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('textAlign', 'left')}
              >
                <AlignLeft className="h-4 w-4" />
                يسار
              </Button>
              <Button
                variant={settings.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('textAlign', 'center')}
              >
                <AlignCenter className="h-4 w-4" />
                وسط
              </Button>
              <Button
                variant={settings.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('textAlign', 'right')}
              >
                <AlignRight className="h-4 w-4" />
                يمين
              </Button>
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label>التباعد بين الأحرف / Letter Spacing: {settings.letterSpacing}px</Label>
            <Slider
              value={[settings.letterSpacing]}
              onValueChange={(value) => handleSettingChange('letterSpacing', value[0])}
              min={-2}
              max={4}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Enable Custom Fonts */}
          <div className="flex items-center justify-between">
            <Label>تفعيل الخطوط المخصصة / Enable Custom Fonts</Label>
            <Switch
              checked={settings.enableCustomFonts}
              onCheckedChange={(checked) => handleSettingChange('enableCustomFonts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>معاينة / Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={language === 'ar' ? 'اكتب نصاً للمعاينة...' : 'Type text for preview...'}
              />
              <div 
                className="p-4 border rounded-md bg-background"
                style={previewStyle}
              >
                {previewText}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 