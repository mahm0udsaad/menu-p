import { Browser, chromium, Page } from 'playwright-core';
import path from 'path';
import { envConfig } from '@/lib/config/env';

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

import { generateHTMLContent } from "@/lib/html-generator";

// Shared browser instance for better performance
let _browserInstance: Browser | null = null;
let _browserInitPromise: Promise<Browser> | null = null;

/**
 * Get or create a shared Playwright browser instance
 * This significantly improves performance by reusing the browser across multiple PDF generations
 */
async function getBrowserInstance(): Promise<Browser> {
  if (_browserInstance) {
    return _browserInstance;
  }

  if (_browserInitPromise) {
    return _browserInitPromise;
  }

  _browserInitPromise = chromium.launch({
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

  try {
    _browserInstance = await _browserInitPromise;
    
    // Handle browser disconnection
    _browserInstance.on('disconnected', () => {
      console.warn('⚠️ Playwright browser disconnected. Resetting instance.');
      _browserInstance = null;
      _browserInitPromise = null;
    });

    console.log('🚀 Playwright browser instance launched and cached');
    return _browserInstance;
  } catch (error) {
    _browserInstance = null;
    _browserInitPromise = null;
    throw error;
  }
}

/**
 * Enhanced asset routing for Playwright
 * Serves local static assets (fonts, images, CSS) directly from filesystem
 */
async function setupAssetRouting(page: Page): Promise<void> {
  await page.route('**/*', (route) => {
    const request = route.request();
    const resourceType = request.resourceType();
    const url = request.url();
    
    // Serve local static assets from filesystem
    const baseUrl = envConfig.baseUrl;
    
    // Font files
    if (url.includes('/fonts/') || url.includes('/public/fonts/')) {
      const fontPath = url.replace(baseUrl, '').replace('/public', '');
      const filePath = path.join(process.cwd(), 'public', fontPath);
      route.fulfill({ path: filePath }).catch(() => {
        console.warn(`⚠️ Font not found: ${filePath}`);
        route.continue();
      });
      return;
    }
    
    // Image assets
    if (url.includes('/assets/') || url.includes('/public/assets/')) {
      const assetPath = url.replace(baseUrl, '').replace('/public', '');
      const filePath = path.join(process.cwd(), 'public', assetPath);
      route.fulfill({ path: filePath }).catch(() => {
        console.warn(`⚠️ Asset not found: ${filePath}`);
        route.continue();
      });
      return;
    }
    
    // Global CSS
    if (url.includes('/globals.css') || url.endsWith('.css')) {
      const cssPath = url.replace(baseUrl, '');
      const filePath = path.join(process.cwd(), 'app', cssPath);
      route.fulfill({ path: filePath }).catch(() => {
        console.warn(`⚠️ CSS not found: ${filePath}`);
        route.continue();
      });
      return;
    }
    
    // Block analytics, ads, and websockets
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
}

export class PlaywrightPDFGenerator {
  async generatePDF(options: PDFGenerationOptions): Promise<Buffer> {
    let page: Page | null = null;
    
    try {
      console.log('🚀 Starting PDF generation with shared browser...');
      
      const browser = await getBrowserInstance();
      const context = await browser.newContext({
        viewport: { width: 1200, height: 1600 },
        javaScriptEnabled: true,
      });
      
      page = await context.newPage();

      // Setup enhanced asset routing
      await setupAssetRouting(page);

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
        timeout: envConfig.pdfTimeout
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
      // Note: We don't close the browser here - it's reused
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
    let page: Page | null = null;

    try {
      console.log('🚀 Starting PDF generation from HTML with shared browser...');
      
      const browser = await getBrowserInstance();
      const context = await browser.newContext({
        viewport: { width: 1200, height: 1600 },
        javaScriptEnabled: true,
      });

      page = await context.newPage();
      
      // Setup enhanced asset routing
      await setupAssetRouting(page);
      
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle',
        timeout: envConfig.pdfTimeout
      });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      });

      console.log(`✅ PDF generated successfully from HTML, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF from HTML content:', error);
      throw error;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn('⚠️ Warning: Error closing page (from generatePDFFromHTML):', closeError);
        }
      }
      // Note: We don't close the browser here - it's reused
    }
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
  
  const generator = new PlaywrightPDFGenerator();
  
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

/**
 * Cleanup function to close the shared browser instance
 * Call this during application shutdown or when browser needs to be reset
 */
export async function cleanupPDFGenerator() {
  if (_browserInstance) {
    console.log('🔄 Closing shared Playwright browser instance...');
    try {
      await _browserInstance.close();
      _browserInstance = null;
      _browserInitPromise = null;
      console.log('✅ Playwright browser instance closed successfully.');
    } catch (error) {
      console.error('❌ Error closing Playwright browser instance:', error);
      // Reset state even if close fails
      _browserInstance = null;
      _browserInitPromise = null;
    }
  } else {
    console.log('ℹ️ No browser instance to cleanup');
  }
}

/**
 * Force reset the browser instance (useful for debugging or memory management)
 */
export async function resetBrowserInstance() {
  await cleanupPDFGenerator();
  console.log('🔄 Browser instance reset complete');
}