import { TemplateId, PDFTemplateProps } from './pdf-template-factory'

/**
 * HTML Template Generator
 * Generates HTML content for PDF templates without using React server rendering
 */
export class HTMLTemplateGenerator {
  
  /**
   * Generates HTML content for a specific template
   */
  static generateTemplate(templateId: TemplateId, props: PDFTemplateProps): string {
    const { restaurant, categories, language = 'ar', customizations = {} } = props
    
    const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language)
    const currency = restaurant.currency || 'ر.س'
    
    // Get page background style
    const pageBackgroundStyle = this.getPageBackgroundStyle(customizations?.pageBackgroundSettings)
    
    switch (templateId) {
      case 'modern':
        return this.generateModernTemplate(restaurant, categories, currency, isRTL, customizations, pageBackgroundStyle)
      case 'painting':
        return this.generatePaintingTemplate(restaurant, categories, currency, isRTL, customizations, pageBackgroundStyle)
      case 'vintage':
        return this.generateVintageTemplate(restaurant, categories, currency, isRTL, customizations, pageBackgroundStyle)
      case 'classic':
      case 'cafe':
      default:
        return this.generateCafeTemplate(restaurant, categories, currency, isRTL, customizations, pageBackgroundStyle)
    }
  }
  
  /**
   * Get page background style CSS
   */
  private static getPageBackgroundStyle(settings: any): string {
    if (!settings) return 'background-color: #ffffff;'
    
    const { backgroundType, backgroundColor, backgroundImage, gradientFrom, gradientTo, gradientDirection } = settings
    
    if (backgroundType === 'solid') {
      return `background-color: ${backgroundColor || '#ffffff'};`
    } else if (backgroundType === 'gradient') {
      return `background: linear-gradient(${gradientDirection || 'to bottom'}, ${gradientFrom || '#ffffff'}, ${gradientTo || '#f3f4f6'});`
    } else if (backgroundType === 'image' && backgroundImage) {
      return `background-image: url(${backgroundImage}); background-size: cover; background-position: center; background-repeat: no-repeat;`
    }
    
    return 'background-color: #ffffff;'
  }
  
  /**
   * Generate Cafe/Classic template HTML
   */
  private static generateCafeTemplate(restaurant: any, categories: any[], currency: string, isRTL: boolean, customizations: any, pageBackgroundStyle: string): string {
    const isEmpty = categories.length === 0
    
    const menuHeader = `
      <div style="background: white; padding: 2rem; display: flex; flex-direction: column;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 2rem;">
          ${restaurant.logo_url ? `
            <div style="width: 6rem; height: 6rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; background: #f9fafb; margin-bottom: 1rem;">
              <img src="${restaurant.logo_url}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          ` : `
            <div style="width: 6rem; height: 6rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f9fafb; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
              📷
            </div>
          `}
          <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.875rem; font-weight: bold; color: #111827; margin-bottom: 0.5rem;">${restaurant.name}</h2>
            <p style="font-size: 1.125rem; color: #6b7280;">${restaurant.category}</p>
          </div>
        </div>
      </div>
    `
    
    const menuItems = categories.map(category => `
      <div style="margin-bottom: 2rem; padding: 1.5rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.5rem; font-weight: bold; color: ${restaurant.color_palette?.primary || '#065f46'}; margin-bottom: 0.5rem;">
            ${category.name}
          </h3>
          ${category.description ? `<p style="color: #6b7280;">${category.description}</p>` : ''}
        </div>
        
        <div>
          ${category.menu_items?.filter((item: any) => item.is_available).map((item: any) => `
            <div style="border-bottom: 1px solid #e5e7eb; padding: 1rem 0;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: start; gap: 0.75rem;">
                    ${item.image_url ? `
                      <div style="width: 4rem; height: 4rem; border-radius: 0.5rem; overflow: hidden; background: #f3f4f6; flex-shrink: 0;">
                        <img src="${item.image_url}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                      </div>
                    ` : ''}
                    
                    <div style="flex: 1;">
                      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <h4 style="font-weight: 600; color: #111827; font-size: 1rem;">
                          ${item.name}
                        </h4>
                        ${item.is_featured ? `
                          <span style="background: #fef3c7; color: #92400e; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px;">
                            مميز
                          </span>
                        ` : ''}
                      </div>
                      
                      ${item.description ? `
                        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem;">
                          ${item.description}
                        </p>
                      ` : ''}
                      
                      ${item.dietary_info && item.dietary_info.length > 0 ? `
                        <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.5rem;">
                          ${item.dietary_info.map((info: string) => `
                            <span style="background: #dcfce7; color: #166534; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px;">
                              ${info}
                            </span>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
                
                ${item.price ? `
                  <div style="text-align: ${isRTL ? 'right' : 'left'}; margin-${isRTL ? 'right' : 'left'}: 1rem;">
                    <span style="font-weight: bold; font-size: 1.125rem; color: ${restaurant.color_palette?.primary || '#065f46'};">
                      ${item.price.toFixed(2)} ${currency}
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')
    
    const menuFooter = `
      <footer style="margin-top: 3rem; padding: 1.5rem; background: #f9fafb; text-align: center; color: #6b7280; font-size: 0.875rem;">
        <div style="margin-bottom: 0.5rem;">
          <p style="font-weight: 500;">${restaurant.address || '123 Foodie Lane, Flavor Town'}</p>
        </div>
        <div style="margin-bottom: 0.5rem;">
          <p>${restaurant.phone || '+1 (234) 567-890'}</p>
        </div>
        <div>
          <p>${restaurant.website || 'www.your-restaurant.com'}</p>
        </div>
      </footer>
    `
    
    return this.wrapInHTMLDocument(`
      ${menuHeader}
      <div style="padding: 1.5rem;">
        ${isEmpty ? `
          <div style="text-align: center; padding: 3rem 0;">
            <div style="color: #9ca3af; margin-bottom: 1rem;">
              <div style="margin: 0 auto; height: 6rem; width: 6rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                📄
              </div>
            </div>
            <h3 style="font-size: 1.125rem; font-weight: 500; color: #111827; margin-bottom: 0.5rem;">لا توجد أقسام في القائمة</h3>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">ابدأ بإضافة أقسام وعناصر لقائمتك</p>
          </div>
        ` : menuItems}
      </div>
      ${menuFooter}
    `, pageBackgroundStyle, isRTL)
  }
  
  /**
   * Generate Modern template HTML - matches ModernPreview.tsx exactly
   */
  private static generateModernTemplate(restaurant: any, categories: any[], currency: string, isRTL: boolean, customizations: any, pageBackgroundStyle: string): string {
    // Get font settings exactly like ModernPreview
    const fontSettings = customizations?.fontSettings || {}
    const isArabic = !isRTL || true // Default to Arabic styling
    const activeFontSettings = isArabic 
      ? fontSettings.arabic || { font: 'Arial', weight: 'normal' }
      : fontSettings.english || { font: 'Arial', weight: 'normal' }
    
    const fontName = activeFontSettings.font.replace(/\s/g, '_')

    // Filter valid items exactly like in the preview
    const getValidItems = (items: any[]) => {
      return items.filter(item => 
        item && 
        item.name && 
        item.is_available && 
        item.price !== null && 
        item.price !== undefined &&
        !isNaN(Number(item.price))
      )
    }

    // Format price exactly like in the preview
    const formatPrice = (price: number | null): string => {
      if (price === null || price === undefined) return ''
      try {
        const numPrice = Number(price)
        if (isNaN(numPrice)) return '0'
        return isRTL ? `${currency} ${numPrice.toFixed(2)}` : `${numPrice.toFixed(2)} ${currency}`
      } catch {
        return `${price} ${currency}`
      }
    }

    // Use menu-bg.jpeg background exactly like ModernPreview
    const backgroundStyle = `
      background-image: url('/assets/menu-bg.jpeg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    `

    return `
      <div 
        id="modern-preview" 
        style="min-height: 1123px; padding: 2rem; position: relative; ${backgroundStyle}" 
        dir="${isRTL ? 'rtl' : 'ltr'}"
      >
        <!-- Modern Container with semi-transparent overlay - exactly like ModernPreview -->
        <div style="position: relative; width: 100%; min-height: 100%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px); border-radius: 0.5rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 42rem; margin: 0 auto;">
          
          <!-- Simple Header - exactly like ModernPreview -->
          <header style="text-align: center; padding: 2rem; border-bottom: 2px solid #e5e7eb;">
            <div style="display: inline-block; margin-bottom: 1rem;">
              <img
                src="${restaurant?.logo_url || '/assets/menu-header.png'}"
                alt="Logo"
                style="width: 4rem; height: 4rem; margin: 0 auto; object-fit: cover; border-radius: 50%;"
              />
            </div>
            
            <h1 style="font-size: 3.75rem; font-weight: 700; margin-bottom: 0.5rem; color: #1f2937; letter-spacing: 0.1em; font-family: ${fontName}, Arial, sans-serif; font-weight: ${activeFontSettings.weight};">
              ${isArabic ? 'قائمة الطعام' : 'MENU'}
            </h1>
          </header>

          <!-- Categories - exactly like ModernPreview -->
          <div style="padding: 2rem; display: flex; flex-direction: column; gap: 2.5rem;">
            ${categories.map((category) => {
              const validItems = getValidItems(category.menu_items || [])
              
              if (validItems.length === 0) return ''

              return `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <!-- Category Title - exactly like ModernPreview -->
                  <h2 style="font-size: 1.25rem; font-weight: 600; color: #1f2937; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; border-bottom: 1px solid #d1d5db; padding-bottom: 0.5rem; font-family: ${fontName}, Arial, sans-serif; font-weight: ${activeFontSettings.weight};">
                    ${category.name}
                  </h2>
                  
                  <!-- Menu Items - exactly like ModernPreview -->
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${validItems.map((item) => `
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(4px); border-radius: 0.5rem; border: 1px solid rgba(229, 231, 235, 0.6); box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); page-break-inside: avoid; break-inside: avoid;">
                        <div style="flex: 1; min-width: 0;">
                          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem;">
                            <div style="flex: 1; min-width: 0;">
                              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <h3 style="font-weight: 600; color: #111827; font-size: 1rem; line-height: 1.25; font-family: ${fontName}, Arial, sans-serif; font-weight: ${activeFontSettings.weight};">
                                  ${item.name}
                                </h3>
                                ${item.is_featured ? `
                                  <span style="background: #fef3c7; color: #92400e; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 9999px; flex-shrink: 0;">
                                    ⭐
                                  </span>
                                ` : ''}
                              </div>
                              ${item.description ? `
                                <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.25; margin-bottom: 0.5rem;">
                                  ${item.description}
                                </p>
                              ` : ''}
                              ${item.dietary_info && item.dietary_info.length > 0 ? `
                                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem;">
                                                                     ${item.dietary_info.map((info: string) => `
                                    <span style="background: #dcfce7; color: #166534; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500;">
                                      ${info}
                                    </span>
                                  `).join('')}
                                </div>
                              ` : ''}
                            </div>
                            <div style="font-size: 1.125rem; font-weight: 700; color: #059669; white-space: nowrap; margin-left: 1rem;">
                              ${formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
      </div>
    `
  }
  
  /**
   * Generate Painting template HTML
   */
  private static generatePaintingTemplate(restaurant: any, categories: any[], currency: string, isRTL: boolean, customizations: any, pageBackgroundStyle: string): string {
    return `
      <div style="min-height: 100vh; background: linear-gradient(45deg, #fef7cd, #fef3c7); background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23d4af37" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23d4af37" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');">
        <div style="max-w-4xl; margin: 0 auto; padding: 3rem;">
          <!-- Artistic header with golden accents -->
          <div style="text-align: center; margin-bottom: 3rem; padding: 2rem; background: rgba(255,255,255,0.9); border-radius: 1rem; border: 3px solid #d4af37; box-shadow: 0 8px 32px rgba(212,175,55,0.3);">
            <div style="width: 80px; height: 80px; margin: 0 auto 1rem; border-radius: 50%; border: 3px solid #d4af37; background: #fef7cd; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
              🎨
            </div>
            <h1 style="font-family: serif; font-size: 2.5rem; color: #92400e; margin-bottom: 0.5rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
              ${restaurant.name}
            </h1>
            <p style="font-size: 1.125rem; color: #a16207; font-style: italic;">${restaurant.category}</p>
          </div>
          
          ${categories.map(category => `
            <div style="background: rgba(255,255,255,0.95); margin-bottom: 2rem; padding: 2rem; border-radius: 1rem; border: 2px solid #fbbf24; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
              <h2 style="font-family: serif; font-size: 1.75rem; color: #92400e; margin-bottom: 1.5rem; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 0.5rem;">
                ${category.name}
              </h2>
              
              ${category.menu_items?.filter((item: any) => item.is_available).map((item: any) => `
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px dotted #d4af37;">
                  <div style="flex: 1;">
                    <h3 style="font-size: 1.125rem; color: #92400e; margin-bottom: 0.25rem; font-weight: 600;">
                      ${item.name}
                    </h3>
                    ${item.description ? `
                      <p style="color: #a16207; font-size: 0.875rem; font-style: italic;">
                        ${item.description}
                      </p>
                    ` : ''}
                  </div>
                  ${item.price ? `
                    <div style="font-size: 1.25rem; font-weight: bold; color: #d4af37; margin-left: 1rem;">
                      ${item.price.toFixed(2)} ${currency}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `
  }
  
  /**
   * Generate Vintage template HTML
   */
  private static generateVintageTemplate(restaurant: any, categories: any[], currency: string, isRTL: boolean, customizations: any, pageBackgroundStyle: string): string {
    return `
      <div style="min-height: 100vh; background: #fefcf3; background-image: radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0); background-size: 20px 20px;">
        <div style="max-width: 4xl; margin: 0 auto; padding: 3rem;">
          <!-- Vintage header with ornate styling -->
          <div style="text-align: center; margin-bottom: 3rem; padding: 2rem; background: #fefcf3; border: 4px double #8b5e2b; border-radius: 0.5rem;">
            <div style="margin-bottom: 1rem;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏛️</div>
              <div style="height: 2px; background: linear-gradient(to right, transparent, #8b5e2b, transparent); margin: 1rem 0;"></div>
            </div>
            <h1 style="font-family: serif; font-size: 2.5rem; color: #4a3c2a; margin-bottom: 0.5rem; font-weight: 400; letter-spacing: 2px;">
              ${restaurant.name}
            </h1>
            <p style="font-family: serif; font-size: 1.125rem; color: #8b5e2b; font-style: italic; letter-spacing: 1px;">
              ${restaurant.category}
            </p>
            <div style="height: 2px; background: linear-gradient(to right, transparent, #8b5e2b, transparent); margin: 1rem 0;"></div>
          </div>
          
          <!-- Two-column layout for vintage feel -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            ${categories.map((category, index) => `
              <div style="background: #fefcf3; padding: 1.5rem; border: 2px solid #d2b48c; border-radius: 0.5rem; ${index % 2 === 1 ? 'margin-top: 2rem;' : ''}">
                <h2 style="font-family: serif; font-size: 1.5rem; color: #4a3c2a; margin-bottom: 1rem; text-align: center; border-bottom: 1px solid #d2b48c; padding-bottom: 0.5rem;">
                  ${category.name}
                </h2>
                
                ${category.menu_items?.filter((item: any) => item.is_available).map((item: any) => `
                  <div style="margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px dotted #d2b48c;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                      <div style="flex: 1;">
                        <h3 style="font-family: serif; font-size: 1rem; color: #4a3c2a; margin-bottom: 0.25rem; font-weight: 500;">
                          ${item.name}
                        </h3>
                        ${item.description ? `
                          <p style="color: #8b5e2b; font-size: 0.75rem; line-height: 1.3; font-style: italic;">
                            ${item.description}
                          </p>
                        ` : ''}
                      </div>
                      ${item.price ? `
                        <div style="font-family: serif; font-size: 1rem; font-weight: 600; color: #8b5e2b; margin-left: 0.75rem;">
                          ${item.price.toFixed(2)} ${currency}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }
  
  /**
   * Wrap content in complete HTML document
   */
  private static wrapInHTMLDocument(content: string, pageBackgroundStyle: string, isRTL: boolean): string {
    return `
<!DOCTYPE html>
<html lang="ar" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menu PDF</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      ${pageBackgroundStyle}
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div style="min-height: 100vh; ${pageBackgroundStyle}">
    <div style="max-width: 64rem; margin: 0 auto; padding: 1rem 2rem;">
      ${content}
    </div>
  </div>
</body>
</html>
    `
  }
}

// Export removed to avoid conflicts with named export 