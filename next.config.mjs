/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase limit for PDF generation
    },
  },
  webpack: (config, { isServer }) => {
    // PDF.js worker configuration
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/build/pdf.worker.min.js': 'pdfjs-dist/build/pdf.worker.min.js',
      };
      
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[hash][ext][query]',
        },
      });
    }

    // Playwright configuration for serverless
    if (isServer) {
      config.externals.push({
        'playwright': 'commonjs playwright',
        '@playwright/test': 'commonjs @playwright/test'
      });
    }
    
    return config;
  },
}

export default nextConfig
