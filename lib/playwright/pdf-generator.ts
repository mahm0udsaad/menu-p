import { Browser, chromium, Page, BrowserContext } from 'playwright-core';
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

import { generateHTMLContent } from "@/lib/html-generator";

// Enhanced browser management with better error handling
let _browserInstance: Browser | null = null;
let _browserInitPromise: Promise<Browser> | null = null;
let _browserContext: BrowserContext | null = null;
let _connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
const BROWSER_RESET_TIMEOUT = 5000; // 5 seconds

/**
 * Browser health check to ensure it's still responsive
 */
async function isBrowserHealthy(browser: Browser): Promise<boolean> {
  try {
    // Test if browser is still responsive
    const contexts = browser.contexts();
    return browser.isConnected() && contexts !== undefined;
  } catch {
    return false;
  }
}

/**
 * Force cleanup of browser resources
 */
async function forceCleanupBrowser(): Promise<void> {
  console.log('🧹 Force cleaning up browser resources...');
  
  try {
    if (_browserContext) {
      await _browserContext.close().catch(() => {});
      _browserContext = null;
    }
  } catch {}

  try {
    if (_browserInstance) {
      await _browserInstance.close().catch(() => {});
      _browserInstance = null;
    }
  } catch {}

  _browserInitPromise = null;
  _connectionAttempts = 0;
  
  console.log('✅ Browser cleanup completed');
}

/**
 * Get or create a fresh browser instance with better error handling
 */
async function getBrowserInstance(): Promise<Browser> {
  // Check if current browser is healthy
  if (_browserInstance && await isBrowserHealthy(_browserInstance)) {
    return _browserInstance;
  }

  // If browser is unhealthy, force cleanup
  if (_browserInstance) {
    console.log('⚠️ Browser instance is unhealthy, forcing cleanup...');
    await forceCleanupBrowser();
  }

  // If we're already initializing, wait for it
  if (_browserInitPromise) {
    try {
      return await _browserInitPromise;
    } catch {
      // If initialization failed, reset and try again
      _browserInitPromise = null;
    }
  }

  // Check connection attempts
  if (_connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    throw new Error(`Failed to establish browser connection after ${MAX_CONNECTION_ATTEMPTS} attempts`);
  }

  _connectionAttempts++;
  console.log(`🚀 Launching browser instance (attempt ${_connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);

  _browserInitPromise = chromium.launch({
    headless: true,
    timeout: 30000, // 30 second timeout
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-webgl',
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
      '--run-all-compositor-stages-before-draw',
      '--disable-ipc-flooding-protection',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--use-mock-keychain',
      '--disable-component-update'
    ]
  });

  try {
    _browserInstance = await _browserInitPromise;
    
    // Setup disconnect handler
    _browserInstance.on('disconnected', () => {
      console.warn('⚠️ Playwright browser disconnected unexpectedly');
      _browserInstance = null;
      _browserContext = null;
      _browserInitPromise = null;
    });

    // Reset connection attempts on success
    _connectionAttempts = 0;
    
    console.log('✅ Playwright browser instance launched successfully');
    return _browserInstance;
  } catch (error) {
    console.error('❌ Failed to launch browser:', error);
    _browserInstance = null;
    _browserInitPromise = null;
    throw error;
  }
}

/**
 * Get or create a browser context with better lifecycle management
 */
async function getBrowserContext(): Promise<BrowserContext> {
  const browser = await getBrowserInstance();
  
  // Check if current context is still valid
  if (_browserContext && !_browserContext.pages().length) {
    try {
      // Test context by creating a test page
      const testPage = await _browserContext.newPage();
      await testPage.close();
      return _browserContext;
    } catch {
      // Context is invalid, close it
      try {
        await _browserContext.close();
      } catch {}
      _browserContext = null;
    }
  }

  // Create new context
  console.log('🔄 Creating new browser context...');
  // Default viewport roughly equal to A4 at 96 DPI. The exact size for each
  // PDF export is set on the page level based on the requested format, but we
  // still provide a sane default here to avoid an excessively tall viewport
  // that would make CSS 100vh larger than a single PDF page and cause blank
  // trailing space.
  _browserContext = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    javaScriptEnabled: true,
    ignoreHTTPSErrors: true,
  });

  return _browserContext;
}

/**
 * Enhanced asset routing with better error handling
 */
async function setupAssetRouting(page: Page): Promise<void> {
  await page.route('**/*', (route) => {
    const request = route.request();
    const resourceType = request.resourceType();
    const url = request.url();
    
    try {
      // Serve local static assets from filesystem
      const baseUrl = envConfig.baseUrl;
      
      // Font files
      if (url.includes('/fonts/') || url.includes('/public/fonts/')) {
        const fontPath = url.replace(baseUrl, '').replace('/public', '');
        const filePath = path.join(process.cwd(), 'public', fontPath);
        route.fulfill({ path: filePath }).catch(() => {
          console.warn(`⚠️ Font not found: ${filePath}`);
          route.continue().catch(() => {});
        });
        return;
      }
      
      // Image assets
      if (url.includes('/assets/') || url.includes('/public/assets/')) {
        const assetPath = url.replace(baseUrl, '').replace('/public', '');
        const filePath = path.join(process.cwd(), 'public', assetPath);
        route.fulfill({ path: filePath }).catch(() => {
          console.warn(`⚠️ Asset not found: ${filePath}`);
          route.continue().catch(() => {});
        });
        return;
      }
      
      // Global CSS
      if (url.includes('/globals.css') || url.endsWith('.css')) {
        const cssPath = url.replace(baseUrl, '');
        const filePath = path.join(process.cwd(), 'app', cssPath);
        route.fulfill({ path: filePath }).catch(() => {
          console.warn(`⚠️ CSS not found: ${filePath}`);
          route.continue().catch(() => {});
        });
        return;
      }
      
      // Block problematic resources
      if (
        resourceType === 'websocket' ||
        url.includes('analytics') ||
        url.includes('ads') ||
        url.includes('tracking') ||
        url.includes('google-analytics') ||
        url.includes('facebook.com') ||
        url.includes('twitter.com')
      ) {
        route.abort().catch(() => {});
      } else {
        route.continue().catch(() => {});
      }
    } catch (error) {
      // Fallback to continue if routing fails
      route.continue().catch(() => {});
    }
  });
}

export class PlaywrightPDFGenerator {
  
  async generatePDF(options: PDFGenerationOptions): Promise<Buffer> {
    return this.generatePDFWithRetry(options, 2);
  }

  async generatePDFWithRetry(options: PDFGenerationOptions, maxRetries: number = 2): Promise<Buffer> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 PDF generation attempt ${attempt}/${maxRetries}`);
        return await this.generatePDFInternal(options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');
        
        // Force cleanup on error
        await forceCleanupBrowser();
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  private async generatePDFInternal(options: PDFGenerationOptions): Promise<Buffer> {
    let page: Page | null = null;
    
    try {
      console.log('🚀 Starting PDF generation with enhanced browser management...');
      
      const context = await getBrowserContext();
      page = await context.newPage();

      // Ensure the viewport matches the intended PDF format so that CSS units
      // like 100vh align with the printed page height. This prevents partial
      // spillover creating a new blank page.
      const viewportByFormat = (format: 'A4' | 'Letter' | undefined) => {
        switch (format) {
          case 'Letter':
            // 8.5in x 11in at 96 DPI => 816 x 1056
            return { width: 816, height: 1056 };
          case 'A4':
          default:
            // 210mm x 297mm ≈ 8.27in x 11.69in at 96 DPI => ~794 x 1123
            return { width: 794, height: 1123 };
        }
      };
      const vp = viewportByFormat(options.format);
      await page.setViewportSize(vp);

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
      
      // Set content with proper wait conditions and timeout
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
        timeout: envConfig.pdfTimeout || 30000
      });

      try {
        await page.evaluate(() => document.fonts.ready);
      } catch {}

      try {
        await page.evaluate(() => document.fonts.ready);
      } catch {}
      
      console.log('⏱️ Waiting for content to stabilize...');
      
      // Wait for content to fully load with timeout handling
      await Promise.race([
        page.waitForLoadState('networkidle', { timeout: 10000 }),
        new Promise(resolve => setTimeout(resolve, 10000))
      ]);
      
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
        // Prefer CSS page size when provided; otherwise Playwright uses the
        // format above. Keeping this true helps if templates specify @page.
        preferCSSPageSize: true,
        tagged: true,
        outline: false,
        displayHeaderFooter: false,
      });

      return this.validatePDFBuffer(pdfBuffer);

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
    }
  }

  public async generatePDFFromHTML(htmlContent: string, options: { format?: 'A4' | 'Letter', margin?: any }): Promise<Buffer> {
    return this.generatePDFFromHTMLWithRetry(htmlContent, options, 2);
  }

  async generatePDFFromHTMLWithRetry(htmlContent: string, options: { format?: 'A4' | 'Letter', margin?: any }, maxRetries: number = 2): Promise<Buffer> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 PDF from HTML generation attempt ${attempt}/${maxRetries}`);
        return await this.generatePDFFromHTMLInternal(htmlContent, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ HTML PDF attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');
        
        // Force cleanup on error
        await forceCleanupBrowser();
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  private async generatePDFFromHTMLInternal(htmlContent: string, options: { format?: 'A4' | 'Letter', margin?: any }): Promise<Buffer> {
    let page: Page | null = null;

    try {
      console.log('🚀 Starting PDF generation from HTML with enhanced browser management...');
      
      const context = await getBrowserContext();
      page = await context.newPage();

      // Align viewport to requested output page size so 100vh equals one page.
      const viewportByFormat = (format: 'A4' | 'Letter' | undefined) => {
        switch (format) {
          case 'Letter':
            return { width: 816, height: 1056 };
          case 'A4':
          default:
            return { width: 794, height: 1123 };
        }
      };
      const vp = viewportByFormat(options.format);
      await page.setViewportSize(vp);
      
      // Setup enhanced asset routing
      await setupAssetRouting(page);
      
      // Ensure the provided HTML has zero default margins and a full document wrapper
      const isFullDocument = /<html[\s\S]*>/i.test(htmlContent);
      const wrappedHtml = isFullDocument
        ? htmlContent
        : `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>html,body{margin:0;padding:0} @page{margin:0}</style></head><body style="margin:0;padding:0">${htmlContent}</body></html>`;

      // Set content with timeout handling
      await page.setContent(wrappedHtml, { 
        waitUntil: 'domcontentloaded',
        timeout: envConfig.pdfTimeout || 30000
      });

      try {
        await page.evaluate(() => document.fonts.ready);
      } catch {}
      // Wait for network idle with fallback
      await Promise.race([
        page.waitForLoadState('networkidle', { timeout: 10000 }),
        new Promise(resolve => setTimeout(resolve, 10000))
      ]);

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        preferCSSPageSize: true,
      });

      return this.validatePDFBuffer(pdfBuffer);
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
    }
  }

  private validatePDFBuffer(pdfBuffer: Buffer): Buffer {
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
  }
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
 * Enhanced cleanup function with timeout
 */
export async function cleanupPDFGenerator(): Promise<void> {
  console.log('🔄 Starting PDF generator cleanup...');
  
  const cleanupPromise = forceCleanupBrowser();
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('⏰ Cleanup timeout reached, forcing completion');
      resolve();
    }, BROWSER_RESET_TIMEOUT);
  });

  try {
    await Promise.race([cleanupPromise, timeoutPromise]);
    console.log('✅ PDF generator cleanup completed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    // Force reset even if cleanup fails
    _browserInstance = null;
    _browserContext = null;
    _browserInitPromise = null;
    _connectionAttempts = 0;
  }
}

/**
 * Force reset with timeout
 */
export async function resetBrowserInstance(): Promise<void> {
  console.log('🔄 Resetting browser instance...');
  await cleanupPDFGenerator();
  console.log('✅ Browser instance reset complete');
}

/**
 * Health check for the current browser instance
 */
export async function checkBrowserHealth(): Promise<{ healthy: boolean; details: string }> {
  if (!_browserInstance) {
    return { healthy: false, details: 'No browser instance' };
  }

  const isHealthy = await isBrowserHealthy(_browserInstance);
  return { 
    healthy: isHealthy, 
    details: isHealthy ? 'Browser is healthy' : 'Browser is disconnected or unresponsive'
  };
}
