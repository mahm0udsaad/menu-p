# Environment Configuration Guide

## 🔧 Setting up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# =============================================================================
# DOMAIN AND PORT CONFIGURATION
# =============================================================================

# Local Development Configuration
# Change these values for your local development environment
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3001
PORT=3001
NEXT_PUBLIC_PORT=3001

# For PDF Generation (should match NEXT_PUBLIC_APP_URL)
NEXT_PUBLIC_PDF_BASE_URL=http://localhost:3001

# Production Configuration (uncomment and update for production)
# NEXT_PUBLIC_APP_URL=https://your-domain.com
# NEXT_PUBLIC_SITE_URL=https://your-domain.com

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# =============================================================================
# PDF GENERATION CONFIGURATION
# =============================================================================

# PDF Generation Timeouts (in milliseconds)
PDF_GENERATION_TIMEOUT=30000
PDF_NAVIGATION_TIMEOUT=15000

# Playwright Configuration
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
RESEND_API_KEY=your_resend_api_key
SUPPORT_EMAIL=support@your-domain.com

# =============================================================================
# PAYMENT INTEGRATION
# =============================================================================
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_paymob_integration_id
PAYMOB_HMAC_SECRET=your_paymob_hmac_secret

# =============================================================================
# ENVIRONMENT SETTINGS
# =============================================================================
NODE_ENV=development
NEXT_PUBLIC_NODE_ENV=development
```

## 🚀 Quick Setup for Port 3001

To run your app on port 3001, add these to your `.env.local`:

```bash
PORT=3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_PDF_BASE_URL=http://localhost:3001
```

## 📋 Variable Descriptions

### Domain & Port Variables
- `PORT` - The port your Next.js dev server runs on
- `NEXT_PUBLIC_APP_URL` - Main application URL (used in API calls)
- `NEXT_PUBLIC_SITE_URL` - Site URL (used for redirects and emails)
- `NEXT_PUBLIC_PDF_BASE_URL` - Base URL for PDF generation

### PDF Generation Variables
- `PDF_GENERATION_TIMEOUT` - Maximum time for PDF generation (default: 30000ms)
- `PDF_NAVIGATION_TIMEOUT` - Maximum time for page navigation (default: 15000ms)
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` - Skip downloading browsers (set to true for Vercel)

## 🌍 Production Setup

For production deployment on Vercel:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
```

## ✅ Fixed Issues

- **PDF Template Selection**: Now using the new React Server Components system
- **Environment Variables**: All hardcoded URLs replaced with environment variables
- **Port Configuration**: Configurable port for development (3001, 3000, or any port)
- **Production Ready**: Proper fallbacks for Vercel deployment 