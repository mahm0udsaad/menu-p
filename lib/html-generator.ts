import { escapeHTML, formatPrice, getSimplifiedCSS } from "@/lib/utils/html-helpers";

function getFontLinks(language: string): string {
  const systemFonts = language === 'ar'
    ? '"Segoe UI", "Tahoma", "Arial Unicode MS", sans-serif'
    : '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif';

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Inter:wght@300;400;600;700&display=swap');
      body { font-family: ${systemFonts}; }
      .font-loaded { font-family: ${language === 'ar' ? "'Cairo'" : "'Inter'"}, ${systemFonts}; }
    </style>
    <script>
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Inter:wght@300;400;600;700&display=swap';
      document.head.appendChild(link);
      link.onload = () => { document.body.classList.add('font-loaded'); };
    </script>
  `;
}

export function generateSimplifiedHTML(data: any, customizations: any, language: string, templateId: string): string {
  const { restaurant, categories } = data;
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language);
  
  // Validate data
  if (!restaurant || !categories || !Array.isArray(categories)) {
    throw new Error('Invalid restaurant or categories data');
  }
  
  // Generate simplified, robust HTML
  let html = `
    <div class="menu-container">
      <header class="menu-header">
      <h1 class="restaurant-name">${escapeHTML(restaurant.name)}</h1>
        <div class="header-divider"></div>
      </header>
      
      <main class="menu-content">
  `;
  
  categories.forEach((category: any) => {
    if (!category || !category.menu_items || !Array.isArray(category.menu_items) || category.menu_items.length === 0) return;
    
    html += `
      <section class="menu-section">
        <h2 class="section-title">${escapeHTML(category.name)}</h2>
        ${category.description ? `<p class="section-description">${escapeHTML(category.description)}</p>` : ''}
        
        <div class="menu-items">
    `;
    
    category.menu_items.forEach((item: any) => {
      if (!item || !item.is_available || item.price === null || item.price === undefined) return;
      
      html += `
        <div class="menu-item">
          <div class="item-info">
            <h3 class="item-name">${escapeHTML(item.name)}</h3>
            ${item.description ? `<p class="item-description">${escapeHTML(item.description)}</p>` : ''}
          </div>
          <div class="item-price">
            ${formatPrice(item.price, restaurant.currency || 'EGP', isRTL)}
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </section>
    `;
  });
  
      html += `
      </main>
      
      <footer class="menu-footer">
            <div class="footer-line"></div>
            <p class="footer-text">
              ${isRTL ? 'شكراً لاختياركم لنا' : 'Thank you for choosing us'}
            </p>
          </footer>
      </div>
    `;
    
    return html;
}

export function generateHTMLContent(options: any): string {
  try {
    const { data, language = 'ar', customizations } = options;
    
    // Validate required data
    if (!data || !data.restaurant || !data.categories) {
      throw new Error('Invalid data provided for PDF generation');
    }
    
    const isRTL = ['ar', 'fa', 'ur', 'he'].includes(language);
    const menuHTML = generateSimplifiedHTML(data, customizations, language, options.templateId);
    const customCSS = getSimplifiedCSS(customizations, language);
  
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <title>${escapeHTML(data.restaurant.name)} - Menu</title>
        <style>
          ${customCSS}
        </style>
        ${getFontLinks(language)}
      </head>
      <body>
          ${menuHTML}
        </body>
      </html>
    `;
    
    console.log('✅ Simplified HTML content generated successfully, length:', htmlContent.length);
    return htmlContent;
    
  } catch (error) {
    console.error('❌ Error generating HTML content:', error);
    
    // Return a simple fallback HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Menu Generation Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              text-align: center; 
              color: #333;
              background: white;
            }
            .error { 
              color: #e74c3c; 
              margin: 20px 0; 
              padding: 20px;
              border: 1px solid #e74c3c;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Menu Generation Error</h1>
            <p>An error occurred while generating the menu. Please try again.</p>
            <p>Error: ${error instanceof Error ? escapeHTML(error.message) : 'Unknown error'}</p>
          </div>
        </body>
      </html>
    `;
  }
}