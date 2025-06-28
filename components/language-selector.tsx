"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
}

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl'
  }
]

interface LanguageSelectorProps {
  selectedLanguage?: string
  onLanguageChange: (languageCode: string) => void
  availableLanguages?: string[]
  showLabel?: boolean
  variant?: 'default' | 'compact' | 'button'
  className?: string
}

export default function LanguageSelector({
  selectedLanguage = 'ar',
  onLanguageChange,
  availableLanguages,
  showLabel = true,
  variant = 'default',
  className = ''
}: LanguageSelectorProps) {
  const languages = availableLanguages 
    ? SUPPORTED_LANGUAGES.filter(lang => availableLanguages.includes(lang.code))
    : SUPPORTED_LANGUAGES

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0]

  if (variant === 'button') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={selectedLanguage === language.code ? "default" : "ghost"}
            size="sm"
            onClick={() => onLanguageChange(language.code)}
            className={`flex items-center gap-2 ${
              selectedLanguage === language.code 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            }`}
          >
            <span className="text-sm">{language.flag}</span>
            <span className="text-xs font-medium">{language.nativeName}</span>
          </Button>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-sm">{currentLanguage.flag}</span>
                <span className="text-xs">{currentLanguage.code.toUpperCase()}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span>{language.flag}</span>
                  <span>{language.nativeName}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">اللغة / Language</label>
        </div>
      )}
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-3">
              <span className="text-lg">{currentLanguage.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{currentLanguage.nativeName}</span>
                <span className="text-xs text-muted-foreground">{currentLanguage.name}</span>
              </div>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{language.name}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {languages.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {languages.map((language) => (
            <Badge 
              key={language.code}
              variant={selectedLanguage === language.code ? "default" : "secondary"}
              className="text-xs"
            >
              {language.flag} {language.code.toUpperCase()}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
} 