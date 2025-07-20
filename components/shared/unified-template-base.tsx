import React from 'react'
import {
  SharedMenuHeader,
  SharedMenuCategory,
  SharedMenuFooter,
  SharedMenuContainer,
  SharedRestaurant,
  SharedMenuCategory as SharedCategory,
  SharedFontSettings,
  sharedUtils
} from './menu-components'

export interface UnifiedTemplateProps {
  restaurant: SharedRestaurant
  categories: SharedCategory[]
  language?: string
  fontSettings: SharedFontSettings
  customizations?: {
    pageBackgroundSettings?: any
    rowStyles?: any
    colorPalette?: {
      primary: string
      secondary: string
      accent: string
    }
  }
  isPdfGeneration?: boolean
  isPreview?: boolean
  showFooter?: boolean
  showImages?: boolean
  className?: string
}

/**
 * Unified Template Base Component
 * Provides consistent structure and styling for both preview and PDF templates
 * This ensures perfect consistency between what users see in preview and what gets generated in PDF
 */
export const UnifiedTemplateBase: React.FC<UnifiedTemplateProps> = ({
  restaurant,
  categories,
  language = 'ar',
  fontSettings,
  customizations = {},
  isPdfGeneration = false,
  isPreview = false,
  showFooter = true,
  showImages = true,
  className = ''
}) => {
  const isRTL = sharedUtils.isRTL(language)
  const currency = restaurant.currency || 'ر.س'

  // Get background style from customizations or use default
  const getBackgroundStyle = () => {
    if (customizations?.pageBackgroundSettings) {
      const { backgroundType, backgroundColor, backgroundImage, gradientFrom, gradientTo, gradientDirection } = customizations.pageBackgroundSettings
      
      if (backgroundType === 'solid') {
        return { backgroundColor: backgroundColor || '#ffffff' }
      } else if (backgroundType === 'gradient') {
        return { 
          background: `linear-gradient(${gradientDirection || 'to bottom'}, ${gradientFrom || '#ffffff'}, ${gradientTo || '#f3f4f6'})`
        }
      } else if (backgroundType === 'image' && backgroundImage) {
        return {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      }
    }
    
    // Default background
    return {
      backgroundImage: `url('/assets/menu-bg.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  const backgroundStyle = getBackgroundStyle()

  return (
    <div
      id={isPdfGeneration ? "pdf-template" : "preview-template"}
      className={`min-h-[1123px] p-8 relative ${className}`}
      style={backgroundStyle}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Container with semi-transparent overlay */}
      <div className="relative w-full min-h-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg max-w-2xl mx-auto">
        
        {/* Header */}
        <SharedMenuHeader
          restaurant={restaurant}
          language={language}
          fontSettings={fontSettings}
          isPdfGeneration={isPdfGeneration}
        />

        {/* Categories */}
        <div className="p-8 space-y-10">
          {categories.map((category) => (
            <SharedMenuCategory
              key={category.id}
              category={category}
              language={language}
              fontSettings={fontSettings}
              currency={currency}
              isPdfGeneration={isPdfGeneration}
              showImages={showImages}
            />
          ))}
        </div>

        {/* Footer */}
        {showFooter && (
          <SharedMenuFooter
            restaurant={restaurant}
            language={language}
            fontSettings={fontSettings}
            isPdfGeneration={isPdfGeneration}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Higher-Order Component for creating consistent templates
 * Wraps any template component with unified styling and structure
 */
export function withUnifiedTemplate<T extends UnifiedTemplateProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function UnifiedTemplateWrapper(props: T) {
    return (
      <UnifiedTemplateBase {...props}>
        <WrappedComponent {...props} />
      </UnifiedTemplateBase>
    )
  }
}

/**
 * Template configuration interface
 */
export interface TemplateConfig {
  id: string
  name: string
  description: string
  category: string
  features: string[]
  defaultSettings: {
    fontSettings: SharedFontSettings
    colorPalette: {
      primary: string
      secondary: string
      accent: string
    }
  }
}

/**
 * Template factory for creating consistent templates
 */
export class UnifiedTemplateFactory {
  /**
   * Create a template component with unified styling
   */
  static createTemplate(
    config: TemplateConfig,
    CustomComponent?: React.ComponentType<UnifiedTemplateProps>
  ): React.ComponentType<UnifiedTemplateProps> {
    if (CustomComponent) {
      return withUnifiedTemplate(CustomComponent)
    }
    
    // Return default unified template
    return UnifiedTemplateBase
  }

  /**
   * Apply template-specific customizations
   */
  static applyTemplateCustomizations(
    baseProps: UnifiedTemplateProps,
    config: TemplateConfig
  ): UnifiedTemplateProps {
    return {
      ...baseProps,
      fontSettings: {
        ...config.defaultSettings.fontSettings,
        ...baseProps.fontSettings
      },
      customizations: {
        ...baseProps.customizations,
        colorPalette: config.defaultSettings.colorPalette
      }
    }
  }
} 