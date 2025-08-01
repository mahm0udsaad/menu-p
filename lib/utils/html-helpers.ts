export function escapeHTML(str: string | null | undefined): string {
    if (str === null || str === undefined) {
        return '';
    }
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function formatPrice(price: number, currency: string, isRTL: boolean): string {
  try {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return '0';
    
    // Simple price formatting without external dependencies
    const formattedPrice = `${numPrice.toFixed(2)} ${currency}`;
    return isRTL ? `${currency} ${numPrice.toFixed(2)}` : formattedPrice;
  } catch (error) {
    console.error('Error formatting price:', error);
    return `${price} ${currency}`;
  }
}

import { TemplateId } from '@/types/templates';

export function getSimplifiedCSS(customizations: any, language: string, templateId: TemplateId = 'classic'): string {
    const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language);
    
  let css = `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Remove all animations for PDF */
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
    
    /* Base body styles */
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      line-height: 1.6; 
      color: #333; 
      background: white; 
      font-size: 14px;
      padding: 20px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Container */
    .menu-container {
      max-width: 800px;
      margin: 0 auto; 
      background: white; 
    }
    
    /* Header */
    .menu-header { 
      text-align: center; 
      margin-bottom: 30px; 
      padding-bottom: 20px; 
      border-bottom: 2px solid #e0e0e0;
    }
    
    .restaurant-name { 
      font-size: 28px;
      font-weight: bold; 
      color: #2c3e50;
      margin-bottom: 10px; 
    }
    
    .header-divider {
      width: 60px;
      height: 3px;
      background: #3498db;
      margin: 0 auto;
    }
    
    /* Menu sections */
    .menu-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: bold; 
      color: #2c3e50;
      margin-bottom: 8px;
      padding-bottom: 5px; 
      border-bottom: 1px solid #e0e0e0;
    }
    
    .section-description {
      font-size: 14px; 
      color: #7f8c8d; 
      margin-bottom: 15px;
      font-style: italic; 
    }
    
    /* Menu items */
    .menu-items { 
      display: flex; 
      flex-direction: column; 
      gap: 10px;
    }
    
    .menu-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      padding: 12px; 
      background: #f8f9fa;
      border-radius: 6px;
      page-break-inside: avoid;
    }
    
    .item-info {
      flex: 1; 
      margin-right: 15px;
    }
    
    .item-name { 
      font-size: 16px;
      font-weight: bold; 
      color: #2c3e50; 
      margin-bottom: 4px;
    }
    
    .item-description { 
      font-size: 13px;
      color: #7f8c8d; 
    }
    
    .item-price { 
      font-size: 16px;
      font-weight: bold; 
      color: #27ae60; 
      white-space: nowrap; 
    }
    
    /* Footer */
    .menu-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    
    .footer-line {
      width: 60px;
      height: 2px;
      background: #3498db;
      margin: 0 auto 10px;
    }
    
    .footer-text {
      font-size: 13px;
      color: #7f8c8d;
      font-style: italic;
    }
    
    /* RTL support */
    ${isRTL ? `
      body {
        direction: rtl;
        text-align: right;
      }
      
      .item-info {
        margin-right: 0;
        margin-left: 15px;
      }
      
      .menu-item {
        flex-direction: row-reverse;
      }
    ` : `
      body { 
        direction: ltr;
        text-align: left;
      }
    `}
    
    /* Print optimization */
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .menu-section,
      .menu-item {
        page-break-inside: avoid;
      }
    }
  `;
  
  // Add template-specific styles
  switch (templateId) {
    case 'classic':
      css += `
        .menu-header { border-bottom: 2px solid #3498db; }
        .restaurant-name { color: #2980b9; }
      `;
      break;
    case 'cafe':
      css += `
        body { background-color: #f5f5dc; }
        .menu-header { border-bottom: 2px solid #8b4513; }
        .restaurant-name { color: #8b4513; font-family: 'Georgia', serif; }
      `;
      break;
    case 'modern':
      css += `
        body { font-family: 'Helvetica Neue', sans-serif; }
        .menu-header { border-bottom: none; }
        .restaurant-name { font-size: 36px; font-weight: 300; letter-spacing: 2px; }
      `;
      break;
    case 'painting':
        css += `
          body { background-color: #fdf5e6; }
          .menu-header { border-bottom: 2px solid #d2b48c; }
          .restaurant-name { color: #8b4513; font-family: 'Garamond', serif; font-style: italic; }
        `;
        break;
    case 'vintage':
        css += `
          body { background-color: #faf0e6; font-family: 'Courier New', monospace; }
          .menu-header { border-bottom: 1px dashed #333; }
          .restaurant-name { font-weight: bold; }
        `;
        break;
    case 'modern-coffee':
        css += `
          body { background-color: #f1f1f1; }
          .menu-header { border-bottom: 2px solid #444; }
          .restaurant-name { color: #333; font-family: 'Arial', sans-serif; text-transform: uppercase; }
        `;
        break;
    case 'fast-food':
        css += `
          body { background-color: #ffeb3b; }
          .menu-header { border-bottom: 3px solid #f44336; }
          .restaurant-name { color: #d32f2f; font-family: 'Impact', sans-serif; }
        `;
        break;
    case 'elegant-cocktail':
        css += `
          body { background-color: #1a1a1a; color: #fff; }
          .menu-header { border-bottom: 1px solid #fff; }
          .restaurant-name { color: #fff; font-family: 'Playfair Display', serif; }
        `;
        break;
    case 'sweet-treats':
        css += `
          body { background-color: #fff0f5; }
          .menu-header { border-bottom: 2px solid #ff69b4; }
          .restaurant-name { color: #ff1493; font-family: 'Comic Sans MS', cursive; }
        `;
        break;
    case 'luxury-menu':
        css += `
          body { background-color: #f8f8f8; }
          .menu-header { border-bottom: 2px solid #c0c0c0; }
          .restaurant-name { color: #333; font-family: 'Times New Roman', serif; font-weight: bold; }
        `;
        break;
    case 'simple-coffee':
        css += `
          body { background-color: #fff; }
          .menu-header { border-bottom: 1px solid #ccc; }
          .restaurant-.name { color: #555; font-family: 'Arial', sans-serif; }
        `;
        break;
    case 'borcelle-coffee':
        css += `
          body { background-color: #e6e6e6; }
          .menu-header { border-bottom: 2px solid #777; }
          .restaurant-name { color: #333; font-family: 'Verdana', sans-serif; }
        `;
        break;
    case 'chalkboard-coffee':
        css += `
          body { background-color: #333; color: #fff; }
          .menu-header { border-bottom: 1px solid #fff; }
          .restaurant-name { color: #fff; font-family: 'Permanent Marker', cursive; }
        `;
        break;
    case 'botanical-cafe':
        css += `
          body { background-color: #e8f5e9; }
          .menu-header { border-bottom: 2px solid #4caf50; }
          .restaurant-name { color: #2e7d32; font-family: 'Lora', serif; }
        `;
        break;
    case 'cocktail-menu':
        css += `
          body { background-color: #333; color: #fff; }
          .menu-header { border-bottom: 1px solid #fff; }
          .restaurant-name { color: #fff; font-family: 'Bebas Neue', cursive; }
        `;
        break;
    case 'vintage-bakery':
        css += `
          body { background-color: #fdf5e6; }
          .menu-header { border-bottom: 2px solid #d2b48c; }
          .restaurant-name { color: #8b4513; font-family: 'Garamond', serif; font-style: italic; }
        `;
        break;
    case 'vintage-coffee':
        css += `
          body { background-color: #faf0e6; font-family: 'Courier New', monospace; }
          .menu-header { border-bottom: 1px dashed #333; }
          .restaurant-name { font-weight: bold; }
        `;
        break;
    case 'interactive-menu':
        css += `
          /* Interactive menu styles are primarily for the web, so we provide a clean default for PDF */
          .menu-header { border-bottom: 2px solid #3498db; }
          .restaurant-name { color: #2980b9; }
        `;
        break;
    default:
      // Default styles for any other template
      css += `
        /* Generic styles */
        .menu-header {
          border-bottom: 2px solid #e0e0e0;
        }
        .restaurant-name {
          color: #2c3e50;
        }
      `;
  }

  // Add custom styles if provided
  if (customizations) {
    try {
      if (customizations.pageBackgroundSettings?.backgroundColor) {
        css += `body { background-color: ${customizations.pageBackgroundSettings.backgroundColor}; }`;
      }
      
      if (customizations.rowStyles) {
        const row = customizations.rowStyles;
        css += `
          .menu-item { 
            background-color: ${row.backgroundColor || '#f8f9fa'};
            border-radius: ${row.borderRadius || 6}px;
          }
          .item-name { color: ${row.itemColor || '#2c3e50'}; }
          .item-price { color: ${row.priceColor || '#27ae60'}; }
          .item-description { color: ${row.descriptionColor || '#7f8c8d'}; }
        `;
      }
    } catch (error) {
      console.warn('Error applying customizations:', error);
    }
  }
  
  return css;
}