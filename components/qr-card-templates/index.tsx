import React from 'react'
import { resolveFontFamily } from '@/lib/font-config'

export interface RestaurantInfo {
  id: string
  name: string
  logo_url: string | null
}

export interface QrCardTemplateOptions {
  customText: string
  cardBgColor: string
  textColor: string
  qrCodeSize: number
  showBorder: boolean
  borderColor: string
  logoPosition: 'none' | 'top' | 'middle' | 'both'
  fontFamily?: string
}

export interface QrCardTemplateProps {
  restaurant: RestaurantInfo
  qrCodeDataUrl: string
  qrCodeUrl: string
  options: QrCardTemplateOptions
}

interface BaseProps extends QrCardTemplateProps {
  className?: string
  style?: React.CSSProperties
}

function BaseTemplate({ restaurant, qrCodeDataUrl, options, className = '', style = {} }: BaseProps) {
  const fontFamily = options.fontFamily ? resolveFontFamily(options.fontFamily) : undefined
  return (
    <div
      className={`min-h-[1123px] flex flex-col items-center justify-center p-24 ${className}`}
      style={{
        backgroundColor: options.cardBgColor,
        border: options.showBorder ? `2px solid ${options.borderColor}` : 'none',
        fontFamily,
        ...style,
      }}
    >
      {(options.logoPosition === 'top' || options.logoPosition === 'both') && restaurant.logo_url && (
        <img src={restaurant.logo_url} alt={restaurant.name} className="w-32 h-32 object-contain rounded-full mb-6" />
      )}
      <div className="relative mb-6">
        <img src={qrCodeDataUrl} alt="QR" style={{ width: options.qrCodeSize, height: options.qrCodeSize }} />
        {(options.logoPosition === 'middle' || options.logoPosition === 'both') && restaurant.logo_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={restaurant.logo_url} alt={restaurant.name} className="w-12 h-12 object-contain rounded-full" />
          </div>
        )}
      </div>
      <h2 className="text-3xl font-bold mb-2" style={{ color: options.textColor }}>{restaurant.name}</h2>
      <p className="text-lg text-center" style={{ color: options.textColor }}>{options.customText}</p>
    </div>
  )
}

export function ClassicTemplate(props: QrCardTemplateProps) {
  return <BaseTemplate {...props} />
}

export function ModernTemplate(props: QrCardTemplateProps) {
  return <BaseTemplate {...props} className="text-white" style={{ backgroundImage: 'linear-gradient(to bottom right,#1e3a8a,#9333ea)' }} />
}

export function ElegantTemplate(props: QrCardTemplateProps) {
  return <BaseTemplate {...props} className="text-gray-800" style={{ backgroundImage: 'linear-gradient(to bottom,#f0e7db,#e2d3c1)' }} />
}

export function MinimalTemplate(props: QrCardTemplateProps) {
  return <BaseTemplate {...props} className="text-gray-900" style={{ backgroundColor: '#f3f4f6' }} />
}

export function PlayfulTemplate(props: QrCardTemplateProps) {
  return <BaseTemplate {...props} className="text-white" style={{ backgroundImage: 'linear-gradient(135deg,#ec4899,#f97316)' }} />
}

export function VintageTemplate(props: QrCardTemplateProps) {
  return <BaseTemplate {...props} className="text-brown-900" style={{ backgroundColor: '#f5e9d6' }} />
}

export const qrCardTemplates = [
  { id: 'classic', name: 'كلاسيك', Component: ClassicTemplate },
  { id: 'modern', name: 'مودرن', Component: ModernTemplate },
  { id: 'elegant', name: 'أنيق', Component: ElegantTemplate },
  { id: 'minimal', name: 'بسيط', Component: MinimalTemplate },
  { id: 'playful', name: 'مرِح', Component: PlayfulTemplate },
  { id: 'vintage', name: 'عتيق', Component: VintageTemplate },
] as const

export type QrCardTemplateId = typeof qrCardTemplates[number]['id']
