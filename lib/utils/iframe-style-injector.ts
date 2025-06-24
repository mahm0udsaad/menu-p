/**
 * Iframe Style Injector Utility
 * Handles multiple approaches to inject custom styles into Paymob iframe
 */

export interface StyleInjectionOptions {
  targetIframe?: HTMLIFrameElement;
  customCSS?: string;
  retryCount?: number;
  retryDelay?: number;
}

export class IframeStyleInjector {
  private static readonly DEFAULT_STYLES = `
    /* Dark theme for Paymob */
    body { 
      background: #0a384b !important; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      color: #f8fafc !important;
    }
    .payment-form-container, .payment-container, .main-container,
    .payment-form, .checkout-form { 
      background: #1e293b !important; 
      border-radius: 12px !important; 
      border: 1px solid #475569 !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      padding: 24px !important;
    }
    .form-group { 
      margin-bottom: 1.5rem !important; 
    }
    .form-control, input[type="text"], input[type="email"], input[type="tel"], 
    input[type="password"], input[type="number"], select,
    .card-number-input, .card-expiry-input, .card-cvc-input { 
      background: #334155 !important; 
      border: 1px solid #475569 !important; 
      border-radius: 8px !important; 
      color: #f8fafc !important; 
      padding: 12px 16px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
    }
    .form-control:focus, input:focus, select:focus { 
      border-color: #10b981 !important; 
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important; 
      outline: none !important;
    }
    .form-control::placeholder, input::placeholder {
      color: #94a3b8 !important;
    }
    .btn-primary, button[type="submit"], .submit-btn,
    .payment-btn, .proceed-btn { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; 
      border: none !important; 
      border-radius: 8px !important; 
      padding: 12px 24px !important; 
      font-weight: 600 !important;
      font-size: 16px !important;
      transition: all 0.2s ease !important;
      color: white !important;
    }
    .btn-primary:hover, button[type="submit"]:hover, .submit-btn:hover,
    .payment-btn:hover, .proceed-btn:hover { 
      background: linear-gradient(135deg, #059669 0%, #047857 100%) !important; 
      transform: translateY(-1px) !important;
    }
    .payment-header, .header { 
      background: #1e293b !important; 
      color: #f8fafc !important; 
      border-bottom: 1px solid #475569 !important;
      padding: 24px !important;
    }
    .payment-header h1, .payment-header h2, .header h1, .header h2 {
      color: #f8fafc !important;
      font-size: 24px !important;
      font-weight: 600 !important;
      margin-bottom: 8px !important;
    }
    .payment-header p, .header p {
      color: #94a3b8 !important;
      font-size: 14px !important;
    }
    .security-badge, .footer, .payment-footer {
      background: #0f172a !important;
      border-top: 1px solid #475569 !important;
      color: #94a3b8 !important;
    }
    .error-message, .error, .alert-danger {
      background: #fecaca !important;
      color: #dc2626 !important;
      border: 1px solid #f87171 !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
    }
    .success-message, .success, .alert-success {
      background: #dcfce7 !important;
      color: #16a34a !important;
      border: 1px solid #4ade80 !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
    }
    label {
      color: #e2e8f0 !important;
      font-weight: 500 !important;
      margin-bottom: 8px !important;
      display: block !important;
    }
    .card-input-container, .card-container {
      background: #334155 !important;
      border: 1px solid #475569 !important;
      border-radius: 8px !important;
      padding: 16px !important;
    }
    .payment-methods {
      background: #1e293b !important;
      border-radius: 8px !important;
      padding: 16px !important;
    }
    .payment-method-item {
      background: #334155 !important;
      border: 1px solid #475569 !important;
      border-radius: 8px !important;
      margin-bottom: 12px !important;
      transition: all 0.2s ease !important;
    }
    .payment-method-item:hover {
      border-color: #10b981 !important;
      background: #374151 !important;
    }
    .loading-spinner, .spinner {
      border-color: #475569 !important;
      border-top-color: #10b981 !important;
    }
    .amount-display, .total-amount, .price {
      color: #10b981 !important;
      font-weight: 600 !important;
      font-size: 18px !important;
    }
    /* Additional selectors for robustness */
    div[class*="payment"], div[class*="form"], div[class*="card"] {
      background-color: #1e293b !important;
    }
    input[class*="input"], input[class*="field"] {
      background: #334155 !important;
      border: 1px solid #475569 !important;
      color: #f8fafc !important;
    }
    button[class*="btn"], button[class*="button"] {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white !important;
    }
  `;

  /**
   * Method 1: Direct DOM manipulation (requires same-origin or relaxed security)
   */
  static injectStylesDirect(iframe: HTMLIFrameElement, customCSS?: string): boolean {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return false;

      // Remove existing custom styles
      const existingStyle = iframeDoc.getElementById('custom-payment-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create and inject new styles
      const styleElement = iframeDoc.createElement('style');
      styleElement.id = 'custom-payment-styles';
      styleElement.innerHTML = customCSS || this.DEFAULT_STYLES;
      iframeDoc.head.appendChild(styleElement);

      console.log('✅ Successfully injected styles via direct DOM manipulation');
      return true;
    } catch (error) {
      console.log('❌ Direct DOM injection failed (CORS restriction):', error);
      return false;
    }
  }

  /**
   * Method 2: PostMessage communication
   */
  static injectStylesPostMessage(iframe: HTMLIFrameElement, customCSS?: string): boolean {
    try {
      const styles = customCSS || this.DEFAULT_STYLES;
      
      // Try multiple message formats
      const messages = [
        { type: 'INJECT_STYLES', styles },
        { type: 'APPLY_CUSTOM_CSS', css: styles },
        { type: 'PAYMOB_CUSTOM_THEME', theme: 'dark', styles },
        { action: 'injectCSS', payload: styles }
      ];

      messages.forEach(message => {
        iframe.contentWindow?.postMessage(message, '*');
      });

      console.log('📤 Sent style injection messages via PostMessage');
      return true;
    } catch (error) {
      console.log('❌ PostMessage injection failed:', error);
      return false;
    }
  }

  /**
   * Method 3: URL-based CSS injection (if supported by Paymob)
   */
  static createStyledIframeUrl(baseUrl: string, customCSS?: string): string {
    try {
      const styles = encodeURIComponent(customCSS || this.DEFAULT_STYLES);
      const urlParams = [
        `custom_css=${styles}`,
        `theme=dark`,
        `style_override=true`,
        `custom_theme=${styles}`
      ];

      // Try different parameter names that payment providers might support
      const url = new URL(baseUrl);
      urlParams.forEach(param => {
        const [key, value] = param.split('=');
        url.searchParams.set(key, value);
      });

      return url.toString();
    } catch (error) {
      console.log('❌ URL-based injection failed:', error);
      return baseUrl;
    }
  }

  /**
   * Method 4: CSS Filter overlay (visual approximation)
   */
  static applyVisualFilters(iframe: HTMLIFrameElement): void {
    // Apply CSS filters to approximate dark theme with emerald accent
    iframe.style.filter = `
      contrast(1.15) 
      brightness(0.75) 
      saturate(1.3) 
      hue-rotate(15deg)
      sepia(0.15)
      invert(0.1)
    `;
    iframe.style.transition = 'filter 0.3s ease';
    iframe.style.borderRadius = '12px';
    iframe.style.overflow = 'hidden';
    
    console.log('🎨 Applied enhanced visual filters to iframe');
  }

  /**
   * Method 5: Mutation Observer for dynamic injection
   */
  static observeAndInject(iframe: HTMLIFrameElement, customCSS?: string): void {
    try {
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) return;

      const observer = new MutationObserver(() => {
        this.injectStylesDirect(iframe, customCSS);
      });

      observer.observe(iframeDoc.body, {
        childList: true,
        subtree: true,
        attributes: true
      });

      console.log('👁️ Started mutation observer for style injection');
    } catch (error) {
      console.log('❌ Mutation observer setup failed:', error);
    }
  }

  /**
   * Comprehensive injection strategy - tries multiple methods
   */
  static injectWithFallbacks(options: StyleInjectionOptions): void {
    const { targetIframe, customCSS, retryCount = 3, retryDelay = 1000 } = options;
    
    if (!targetIframe) {
      console.error('Target iframe not provided');
      return;
    }

    let attempts = 0;
    const tryInject = () => {
      attempts++;
      console.log(`🔄 Style injection attempt ${attempts}/${retryCount}`);

      // Method 1: Direct DOM manipulation
      if (this.injectStylesDirect(targetIframe, customCSS)) return;

      // Method 2: PostMessage
      this.injectStylesPostMessage(targetIframe, customCSS);

      // Method 3: Visual filters as fallback
      this.applyVisualFilters(targetIframe);

      // Method 4: Mutation observer for persistence
      this.observeAndInject(targetIframe, customCSS);

      // Retry if needed
      if (attempts < retryCount) {
        setTimeout(tryInject, retryDelay);
      } else {
        console.log('⚠️ All injection methods attempted');
      }
    };

    // Start injection after iframe loads
    if (targetIframe.contentDocument?.readyState === 'complete') {
      tryInject();
    } else {
      targetIframe.addEventListener('load', tryInject);
    }
  }

  /**
   * Listen for PostMessage responses from iframe
   */
  static setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'STYLES_APPLIED') {
        console.log('✅ Iframe confirmed styles were applied');
      }
      if (event.data.type === 'PAYMOB_READY') {
        console.log('📋 Paymob iframe is ready for styling');
      }
    });
  }

  /**
   * Generate CSS based on your existing design tokens
   */
  static generateCustomCSS(theme: 'dark' | 'light' = 'dark'): string {
    const colors = theme === 'dark' ? {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#475569',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      primary: '#10b981',
      primaryHover: '#059669',
      error: '#dc2626',
      success: '#16a34a'
    } : {
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      border: '#e2e8f0',
      text: '#1e293b',
      textMuted: '#64748b',
      primary: '#10b981',
      primaryHover: '#059669',
      error: '#dc2626',
      success: '#16a34a'
    };

    return `
      body { background: ${colors.background} !important; color: ${colors.text} !important; }
      .payment-form-container, .payment-container { background: ${colors.surface} !important; border: 1px solid ${colors.border} !important; }
      .form-control, input { background: ${colors.surfaceHover} !important; border: 1px solid ${colors.border} !important; color: ${colors.text} !important; }
      .btn-primary, button[type="submit"] { background: ${colors.primary} !important; color: white !important; }
      .btn-primary:hover { background: ${colors.primaryHover} !important; }
      label { color: ${colors.text} !important; }
      .error-message { color: ${colors.error} !important; }
      .success-message { color: ${colors.success} !important; }
    `;
  }
}

// Export for easier use
export const injectPaymobStyles = (iframe: HTMLIFrameElement) => {
  // Method 1: Direct DOM manipulation (if same-origin)
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      const styleElement = iframeDoc.createElement('style');
      styleElement.innerHTML = `
        body { 
          background: #0f172a !important; 
          color: #f8fafc !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
        .payment-form-container { background: #1e293b !important; }
        .form-control, input { background: #334155 !important; color: #f8fafc !important; }
        .btn-primary { background: #10b981 !important; }
      `;
      iframeDoc.head.appendChild(styleElement);
      console.log('✅ Direct CSS injection successful');
      return true;
    }
  } catch (error) {
    console.log('❌ Direct injection failed, trying alternatives...');
  }

  // Method 2: PostMessage
  iframe.contentWindow?.postMessage({
    type: 'INJECT_STYLES',
    styles: `
      body { background: #0f172a !important; color: #f8fafc !important; }
      .payment-form-container { background: #1e293b !important; }
      .form-control, input { background: #334155 !important; color: #f8fafc !important; }
      .btn-primary { background: #10b981 !important; }
    `
  }, '*');

  // Method 3: Visual filters as fallback
  iframe.style.filter = 'contrast(1.1) brightness(0.9) saturate(1.1)';
  iframe.style.transition = 'filter 0.3s ease';
  
  console.log('🎨 Applied visual filters as fallback');
  return false;
};

// Setup global message listener
if (typeof window !== 'undefined') {
  IframeStyleInjector.setupMessageListener();
} 