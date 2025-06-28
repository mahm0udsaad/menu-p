/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://menu-p.com', // Using direct URL instead of env variable
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
  additionalPaths: async (config) => {
    const paths = []
    
    try {
      // Add home page explicitly with high priority
      paths.push({
        loc: '/',
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      })
      
      paths.push({
        loc: '/auth/login',
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      })
      
      paths.push({
        loc: '/auth/sign-up', 
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      })
      
    } catch (error) {
      console.error('Error generating additional sitemap paths:', error)
    }
    
    return paths
  },
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