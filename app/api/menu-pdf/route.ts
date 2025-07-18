import { NextRequest, NextResponse } from 'next/server';
import playwright from 'playwright-core';

export async function POST(req: NextRequest) {
  console.log('🚀 PDF API Route Called - Starting PDF generation...');
  
  let browser: any = null;
  let page: any = null;
  let context: any = null;

  try {
    console.log('📝 Parsing request JSON...');
    let requestData;
    try {
      requestData = await req.json();
      console.log('✅ Request JSON parsed successfully');
    } catch (jsonError) {
      console.error('❌ Failed to parse request JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { htmlContent } = requestData;

    if (!htmlContent) {
      return NextResponse.json(
        { error: 'htmlContent is required.' },
        { status: 400 }
      );
    }

    // Validate HTML content
    if (typeof htmlContent !== 'string' || htmlContent.trim().length < 50) {
      return NextResponse.json(
        { error: 'Invalid HTML content provided.' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting PDF generation...');
    console.log('📝 HTML content length:', htmlContent.length);

    // Environment-based browser configuration
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🔍 Is Development:', isDevelopment);
    
    let executablePath;
    let useLocalChromium = false;
    
    if (isDevelopment) {
      // For local development, use Playwright's built-in Chromium
      console.log('🔧 Using Playwright built-in Chromium for development');
      executablePath = undefined;
      useLocalChromium = true;
    } else {
      // For production, try to use @sparticuz/chromium
      console.log('🔧 Attempting to use @sparticuz/chromium for production');
      try {
        const { default: chromium } = await import('@sparticuz/chromium');
        executablePath = await chromium.executablePath();
        console.log('📍 Chromium executable path:', executablePath);
      } catch (error) {
        console.warn('⚠️ Failed to get executablePath from @sparticuz/chromium:', error);
        console.warn('⚠️ Falling back to default Playwright Chromium');
        executablePath = undefined;
        useLocalChromium = true;
      }
    }

    // Environment-specific chromium args
    let chromiumArgs;
    
    if (useLocalChromium) {
      // Simplified args for local development
      chromiumArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--headless',
        '--no-first-run',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps'
      ];
      console.log('🔧 Using simplified args for local development');
    } else {
      // Full serverless args for production
      chromiumArgs = [
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
        '--disable-translate',
        '--disable-sync',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-domain-reliability',
        '--disable-client-side-phishing-detection',
        '--disable-ipc-flooding-protection',
        '--run-all-compositor-stages-before-draw',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees'
      ];
      console.log('🔧 Using full serverless args for production');
    }

    // Launch browser with proper configuration
    console.log('🚀 Preparing to launch browser...');
    
    let browser: any;
    
    if (useLocalChromium) {
      // For local development, use Playwright's built-in Chromium
      console.log('🔧 Launching with Playwright built-in Chromium');
      try {
        browser = await playwright.chromium.launch({
          headless: true,
          args: chromiumArgs
        });
        console.log('🌐 Local Chromium launched successfully');
      } catch (launchError) {
        console.error('❌ Failed to launch local Chromium:', launchError);
        throw new Error(`Local Chromium launch failed: ${launchError instanceof Error ? launchError.message : 'Unknown error'}`);
      }
    } else {
      // For production, use @sparticuz/chromium executable
      console.log('🔧 Launching with @sparticuz/chromium');
      const launchOptions: any = {
        args: chromiumArgs,
        headless: true,
        executablePath: executablePath
      };
      
      console.log('🔧 Launch options:', JSON.stringify(launchOptions, null, 2));
      
      try {
        browser = await playwright.chromium.launch(launchOptions);
        console.log('🌐 Serverless Chromium launched successfully');
      } catch (launchError) {
        console.error('❌ Failed to launch serverless Chromium:', launchError);
        throw new Error(`Serverless Chromium launch failed: ${launchError instanceof Error ? launchError.message : 'Unknown error'}`);
      }
    }
    
    console.log('🔧 Creating browser context...');
    context = await browser.newContext({
      viewport: { width: 1200, height: 1600 },
      javaScriptEnabled: true,
    });
    console.log('✅ Browser context created successfully');
    
    console.log('📄 Creating new page...');
    page = await context.newPage();
    console.log('✅ Page created successfully');

    // Minimal resource blocking
    await page.route('**/*', (route: any) => {
      const request = route.request();
      const resourceType = request.resourceType();
      const url = request.url();
      
      // Only block problematic resources
      if (
        resourceType === 'websocket' ||
        url.includes('analytics') ||
        url.includes('ads') ||
        url.includes('tracking') ||
        url.includes('google-analytics') ||
        url.includes('facebook.com') ||
        url.includes('twitter.com') ||
        url.includes('doubleclick.net')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Set print media for better PDF generation
    await page.emulateMedia({ media: 'print' });

    console.log('📄 Processing HTML content...');

    // Create a simple, clean HTML structure
    const cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu PDF</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 14px;
            padding: 20px;
        }
        
        /* Remove all animations for PDF */
        *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
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
    ${htmlContent}
</body>
</html>`;

    console.log('📄 Setting HTML content...');

    // Set content with proper wait conditions
    await page.setContent(cleanHtml, { 
      waitUntil: 'domcontentloaded',
              timeout: parseInt(process.env.PDF_GENERATION_TIMEOUT || '30000')
    });

    console.log('⏱️ Waiting for content to stabilize...');
    
    // Wait for content to fully load
    try {
      await page.waitForLoadState('networkidle', { timeout: 8000 });
    } catch (error) {
      console.warn('⚠️ Network idle timeout, proceeding anyway');
    }

    // Additional wait for rendering to complete
    console.log('⏳ Waiting for rendering to complete...');
    await page.waitForTimeout(1500);

    console.log('📄 Generating PDF...');
    
    // Generate PDF with optimized settings
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { 
          top: '15mm', 
          right: '15mm', 
          bottom: '15mm', 
          left: '15mm' 
        },
        preferCSSPageSize: false,
        tagged: false, // Disable tagging for better compatibility
        outline: false,
        displayHeaderFooter: false,
      });
      console.log('✅ PDF buffer generated, size:', pdfBuffer.length, 'bytes');
    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    }

    // Enhanced PDF validation
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    // Validate PDF header
    const pdfBytes = Buffer.from(pdfBuffer);
    const pdfHeader = pdfBytes.toString('ascii', 0, 4);
    
    if (pdfHeader !== '%PDF') {
      console.error('❌ Invalid PDF header:', pdfHeader);
      console.error('❌ Buffer start (hex):', pdfBytes.toString('hex', 0, 20));
      console.error('❌ Buffer start (ascii):', pdfBytes.toString('ascii', 0, 50));
      throw new Error(`Generated file is not a valid PDF. Header: ${pdfHeader}`);
    }

    // Check for PDF trailer
    const pdfString = pdfBytes.toString('latin1'); // Use latin1 for binary data
    if (!pdfString.includes('%%EOF')) {
      console.error('❌ PDF missing EOF marker');
      throw new Error('Generated PDF is incomplete - missing EOF marker');
    }

    // Check minimum PDF size
    if (pdfBuffer.length < 1000) {
      console.error('❌ PDF too small:', pdfBuffer.length, 'bytes');
      throw new Error(`Generated PDF is too small: ${pdfBuffer.length} bytes`);
    }

    console.log('✅ PDF validation passed');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="menu.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Provide detailed error information
    let errorMessage = 'Failed to generate PDF';
    let errorDetails = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.message;
      
      // Check for common errors
      if (error.message.includes('Could not find browser executable')) {
        errorMessage = 'Browser executable not found';
        errorDetails = 'Chromium executable could not be located. This might be an environment configuration issue.';
      } else if (error.message.includes('spawn') || error.message.includes('ENOENT')) {
        errorMessage = 'Browser launch failed';
        errorDetails = 'Failed to launch browser. This might be due to missing dependencies or permissions.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        suggestion: 'Please check the server logs for more details. This might be a browser configuration issue.',
        environment: process.env.NODE_ENV || 'unknown'
      },
      { status: 500 }
    );
  } finally {
    // Cleanup resources in the correct order
    if (page) {
      try {
        console.log('🔚 Closing page...');
        await page.close();
      } catch (closeError) {
        console.warn('⚠️ Warning: Error closing page:', closeError);
      }
    }
    if (context) {
      try {
        console.log('🔚 Closing context...');
        await context.close();
      } catch (closeError) {
        console.warn('⚠️ Warning: Error closing context:', closeError);
      }
    }
    if (browser) {
      try {
        console.log('🔚 Closing browser...');
        await browser.close();
      } catch (closeError) {
        console.warn('⚠️ Warning: Error closing browser:', closeError);
      }
    }
  }
}