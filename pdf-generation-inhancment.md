# PDF Generation Performance Issues & Solutions

## Current Problems Identified

### 1. **Timeout Issues (30s limit exceeded)**
- `page.setContent()` is timing out waiting for `networkidle`
- External font loading from Google Fonts is blocking page load
- Heavy CSS animations and gradients are slowing rendering

### 2. **Font Loading Issues**
- Missing font file: `AvenirLTStd-Roman.ttf` (404 error)
- Google Fonts loading is unreliable in headless environment
- Font fallbacks are not properly configured

### 3. **Resource Loading Problems**
- External images (`/assets/menu-bg.jpeg`) may not load properly
- CSS background images causing render delays
- Network dependencies in headless environment

### 4. **Performance Bottlenecks**
- Complex CSS animations and transitions
- Large DOM structures with nested elements
- Heavy backdrop-filter and box-shadow effects

## Solutions to Implement

### 1. **Fix Timeout Issues**

**In `generatePDF()` method:**
```typescript
// Replace current setContent call
await page.setContent(htmlContent, { 
  waitUntil: 'domcontentloaded', // Change from 'networkidle' to 'domcontentloaded'
  timeout: 60000 // Increase timeout to 60s
});

// Add explicit wait for fonts to load
await page.evaluate(() => {
  return document.fonts.ready;
});
```

### 2. **Optimize Font Loading**

**In `getFontLinks()` method:**
```typescript
private getFontLinks(language: string, fontSettings?: any): string {
  // Use system fonts as primary with web fonts as fallback
  const systemFonts = language === 'ar' 
    ? '"Segoe UI", "Tahoma", "Arial Unicode MS", sans-serif'
    : '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif';
    
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Inter:wght@300;400;600;700&display=swap');
      
      body {
        font-family: ${systemFonts};
      }
      
      .font-loaded {
        font-family: ${language === 'ar' ? "'Cairo'" : "'Inter'"}, ${systemFonts};
      }
    </style>
    <script>
      // Load fonts asynchronously
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Inter:wght@300;400;600;700&display=swap';
      document.head.appendChild(link);
      
      // Apply font after load
      link.onload = () => {
        document.body.classList.add('font-loaded');
      };
    </script>
  `;
}
```

### 3. **Remove Heavy CSS Effects**

**In `getTemplateCSSByType()` for modern template:**
```css
/* Remove or simplify these performance-heavy properties */
.modern-template {
  /* Remove background-image for PDF generation */
  background: #f8f9fa; /* Use solid color instead */
}

.modern-container {
  /* Remove backdrop-filter - not needed for PDF */
  background: rgba(255, 255, 255, 0.95);
  /* Remove box-shadow for better performance */
}

.modern-header::before {
  /* Remove animation for PDF */
  display: none;
}

/* Remove all @keyframes animations */
```

### 4. **Optimize Image Handling**

**In template HTML generation:**
```typescript
// Replace background images with solid colors for PDF
private generateModernHTML(data: any, customizations: any, language: string): string {
  // ... existing code ...
  
  let html = `
    <div class="modern-container">
      <!-- Use solid background instead of image -->
      <header class="modern-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <!-- Remove ::before pseudo-element animations -->
  `;
  
  // ... rest of implementation
}
```

### 5. **Add Better Error Handling**

**In `generatePDF()` method:**
```typescript
async generatePDF(options: PDFGenerationOptions): Promise<Buffer> {
  let browser: Browser | null = null;
  
  try {
    console.log('🚀 Starting PDF generation with options:', {
      templateId: options.templateId,
      language: options.language,
      dataSize: JSON.stringify(options.data).length
    });
    
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
        '--disable-web-security', // Add this for local resources
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    
    // Disable images and fonts loading for faster generation
    await page.route('**/*', (route) => {
      const request = route.request();
      if (request.resourceType() === 'image' || request.resourceType() === 'font') {
        route.abort();
      } else {
        route.continue();
      }
    });

    try {
      const htmlContent = this.generateHTMLContent(options);
      
      console.log('📄 Setting HTML content...');
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      
      console.log('⏱️ Waiting for content to settle...');
      await page.waitForTimeout(1000); // Reduced wait time
      
      console.log('📄 Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        },
        printBackground: true,
        preferCSSPageSize: false,
        timeout: 30000 // Add PDF generation timeout
      });

      console.log('✅ PDF generated successfully');
      return pdfBuffer;

    } finally {
      await page.close();
    }
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('⚠️ Warning: Error closing browser:', closeError);
      }
    }
  }
}
```

### 6. **Simplify CSS for PDF Generation**

**Create a separate PDF-optimized CSS method:**
```typescript
private getPDFOptimizedCSS(): string {
  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      line-height: 1.4;
      color: #333;
      background: white;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    /* Remove all animations and transitions for PDF */
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
    
    /* Simplified layout styles */
    .pdf-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 15mm;
      background: white;
    }
    
    /* Basic typography */
    h1 { font-size: 24px; margin-bottom: 10px; }
    h2 { font-size: 20px; margin-bottom: 8px; }
    h3 { font-size: 16px; margin-bottom: 6px; }
    p { font-size: 14px; margin-bottom: 4px; }
    
    /* Simple menu item layout */
    .menu-item {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      margin-bottom: 4px;
      border-bottom: 1px solid #eee;
    }
    
    .item-name { font-weight: bold; }
    .item-price { color: #27ae60; font-weight: bold; }
  `;
}
```

### 7. **Add Retry Logic**

**Wrapper function with retry:**
```typescript
async generatePDFWithRetry(options: PDFGenerationOptions, maxRetries: number = 3): Promise<Buffer> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 PDF generation attempt ${attempt}/${maxRetries}`);
      return await this.generatePDF(options);
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
```

## Implementation Priority

1. **High Priority (Fix Immediately)**
   - Change `waitUntil` from `networkidle` to `domcontentloaded`
   - Remove external font dependencies
   - Disable image loading during PDF generation

2. **Medium Priority**
   - Implement retry logic
   - Add PDF-optimized CSS
   - Remove heavy CSS animations

3. **Low Priority**
   - Optimize HTML structure
   - Add better error reporting
   - Implement font fallback strategies

## Testing Recommendations

1. Test with different template types
2. Test with various data sizes (small, medium, large menus)
3. Test network timeout scenarios
4. Performance testing with concurrent requests
5. Memory usage monitoring

## Expected Performance Improvements

- **Generation time**: Reduce from 30s+ to 5-10s
- **Success rate**: Improve from current failures to 95%+
- **Resource usage**: Reduce memory footprint by 40-60%
- **Error rate**: Minimize timeout-related failures