/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  generateRobotsTxt: true,
  exclude: [
    '/admin*',
    '/api*',
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/dashboard',
    '/menu-editor',
    '/payment-status',
    '/onboarding'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/auth/callback',
          '/auth/forgot-password',
          '/auth/reset-password',
          '/dashboard',
          '/menu-editor',
          '/payment-status',
          '/onboarding'
        ],
      },
    ],
  },
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
} 