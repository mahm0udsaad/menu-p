"use client"

import React, { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  presets?: string[]
}

const defaultPresets = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#d946ef'
]

export function ColorPicker({ color, onChange, presets = defaultPresets }: ColorPickerProps) {
  const [internalColor, setInternalColor] = useState(color)
  const debouncedColor = useDebounce(internalColor, 200)

  useEffect(() => {
    // Only propagate valid hex colors
    if (debouncedColor !== color && /^#([0-9A-F]{3}){1,2}$/i.test(debouncedColor)) {
      onChange(debouncedColor)
    }
  }, [debouncedColor, color, onChange])

  useEffect(() => {
    setInternalColor(color)
  }, [color])

  const handlePresetClick = (presetColor: string) => {
    setInternalColor(presetColor)
    onChange(presetColor) // Apply presets immediately without debounce
  }

  return (
    <div className="flex flex-col gap-3">
      <HexColorPicker 
        color={internalColor} 
        onChange={setInternalColor} 
        style={{ width: '100%' }} 
      />

      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-md border" 
          style={{ backgroundColor: internalColor }} 
        />
        <Input
          value={internalColor}
          onChange={(e) => setInternalColor(e.target.value)}
          className="flex-1"
          aria-label="Color hex value"
        />
      </div>

      <div className="grid grid-cols-6 gap-2">
        {presets.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            className={`w-full pt-[100%] relative rounded-md border-2 transition-transform ${
              internalColor.toLowerCase() === presetColor.toLowerCase() 
                ? 'border-blue-500 scale-110 ring-2 ring-blue-200' 
                : 'border-gray-200'
            }`}
            onClick={() => handlePresetClick(presetColor)}
            aria-label={`Select color ${presetColor}`}
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: presetColor }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}