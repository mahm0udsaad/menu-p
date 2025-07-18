/**
 * Centralized environment configuration
 * Handles all domain, port, and URL settings for development and production
 */

// Get the base URL for the application
export const getBaseUrl = (): string => {
  // Check for explicit environment variables first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Development fallback with configurable port
  const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'
  return `http://localhost:${port}`
}

// Get the PDF generation base URL (can be different from main app URL)
export const getPDFBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_PDF_BASE_URL || getBaseUrl()
}

// Get the site URL for redirects and emails
export const getSiteUrl = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || getBaseUrl()
}

// Environment configuration object
export const envConfig = {
  // URLs
  baseUrl: getBaseUrl(),
  siteUrl: getSiteUrl(),
  pdfBaseUrl: getPDFBaseUrl(),
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Ports
  port: process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001',
  
  // PDF Generation
  pdfTimeout: parseInt(process.env.PDF_GENERATION_TIMEOUT || '30000'),
  pdfNavigationTimeout: parseInt(process.env.PDF_NAVIGATION_TIMEOUT || '15000'),
  
  // Playwright
  skipBrowserDownload: process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === 'true',
} as const

// Default export
export default envConfig 