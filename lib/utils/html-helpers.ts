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

export function getSimplifiedCSS(customizations: any, language: string): string {
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