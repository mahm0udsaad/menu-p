import { Browser, chromium, Page } from 'playwright-core';

interface PDFGenerationOptions {
  templateId: string;
  data: any;
  language?: string;
  customizations?: {
    fontSettings?: any;
    pageBackgroundSettings?: any;
    rowStyles?: any;
  };
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

function escapeHTML(str: string | null | undefined): string {
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

function formatPrice(price: number, currency: string, isRTL: boolean): string {
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

function generateSimplifiedHTML(data: any, customizations: any, language: string, templateId: string): string {
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

function getSimplifiedCSS(customizations: any, language: string): string {
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

export function generateHTMLContent(options: PDFGenerationOptions): string {
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

export class PlaywrightPDFGenerator {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
    return this.browser;
  }

  async generatePDF(options: PDFGenerationOptions): Promise<Buffer> {
    let browser: Browser | null = null;
    let page: Page | null = null;
    
    try {
      console.log('🚀 Starting PDF generation with simplified approach...');
      
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--run-all-compositor-stages-before-draw'
        ]
      });

      const context = await browser.newContext({
        viewport: { width: 1200, height: 1600 },
        javaScriptEnabled: true,
      });
      
      page = await context.newPage();

      // Minimal resource blocking - only block truly problematic resources
      await page.route('**/*', (route) => {
        const request = route.request();
        const resourceType = request.resourceType();
        const url = request.url();
        
        // Only block analytics, ads, and websockets
        if (
          resourceType === 'websocket' ||
          url.includes('analytics') ||
          url.includes('ads') ||
          url.includes('tracking') ||
          url.includes('google-analytics') ||
          url.includes('facebook.com') ||
          url.includes('twitter.com')
        ) {
          route.abort();
        } else {
          route.continue();
        }
      });

      // Set media type for better PDF generation
      await page.emulateMedia({ media: 'print' });

      // Generate HTML content
        const htmlContent = generateHTMLContent(options);
        
      if (!htmlContent || htmlContent.length < 100) {
        throw new Error('Generated HTML content is too short or empty');
      }
      
      console.log('📄 Setting HTML content...');
      
      // Set content with proper wait conditions
        await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: parseInt(process.env.PDF_GENERATION_TIMEOUT || '30000')
      });
      
      console.log('⏱️ Waiting for content to stabilize...');
      
      // Wait for content to fully load
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.warn('⚠️ Network idle timeout, proceeding anyway');
      });
      
      // Additional wait to ensure rendering is complete
      await page.waitForTimeout(2000);

        console.log('📄 Generating PDF...');
      
        const pdfBuffer = await page.pdf({
          format: options.format || 'A4',
          margin: options.margin || {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
          },
          printBackground: true,
          preferCSSPageSize: false,
        tagged: true,
        outline: false,
        displayHeaderFooter: false,
      });

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF generation returned empty buffer');
      }

      // Enhanced PDF validation
      const pdfBytes = Buffer.from(pdfBuffer);
      const pdfHeader = pdfBytes.toString('ascii', 0, 4);
      
      if (pdfHeader !== '%PDF') {
        throw new Error(`Generated file is not a valid PDF. Header: ${pdfHeader}`);
      }

      // Check for PDF trailer
      const pdfString = pdfBytes.toString('ascii');
      if (!pdfString.includes('%%EOF')) {
        throw new Error('Generated PDF is incomplete - missing EOF marker');
      }

      // Check minimum size for valid PDF
      if (pdfBuffer.length < 1000) {
        throw new Error(`Generated PDF is too small: ${pdfBuffer.length} bytes`);
      }

      console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      return pdfBuffer;

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn('⚠️ Warning: Error closing page:', closeError);
        }
      }
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.warn('⚠️ Warning: Error closing browser:', closeError);
        }
      }
    }
  }

  async generatePDFWithRetry(options: PDFGenerationOptions, maxRetries: number = 3): Promise<Buffer> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 PDF generation attempt ${attempt}/${maxRetries}`);
        return await this.generatePDF(options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  public async generatePDFFromHTML(htmlContent: string, options: { format?: 'A4' | 'Letter', margin?: any }): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();

    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      });

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF from HTML content:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  public isBrowserInitialized(): boolean {
    return this.browser !== null;
  }
}

interface GeneratePDFFromDataOptions {
  htmlContent: string;
  format?: 'A4' | 'Letter';
  language?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export async function generatePDFFromMenuData(options: GeneratePDFFromDataOptions): Promise<Buffer> {
  const { htmlContent, format = 'A4', margin } = options;
  
  const generator = await getPlaywrightPDFGenerator();
  
  try {
    return await generator.generatePDFFromHTML(htmlContent, {
      format,
      margin,
    });
  } catch (error) {
    console.error('Error generating PDF from HTML with Playwright:', error);
    throw new Error('Failed to generate PDF from provided HTML.');
  }
}

let generatorPromise: Promise<PlaywrightPDFGenerator> | null = null;

export async function getPlaywrightPDFGenerator(): Promise<PlaywrightPDFGenerator> {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      const generator = new PlaywrightPDFGenerator();
      await generator.initialize();
      // Add a check to ensure the browser was initialized successfully
      if (!generator.isBrowserInitialized()) {
        throw new Error('Playwright browser could not be initialized. This might be due to a missing dependency in the serverless environment.');
      }
      return generator;
    })();
  }
  return generatorPromise;
}

export async function cleanupPDFGenerator() {
  console.log('PDF generator cleanup called (no action needed with per-call instances)');
}