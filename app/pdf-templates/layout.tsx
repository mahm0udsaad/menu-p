import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Templates',
  robots: 'noindex, nofollow',
}

export default function PDFTemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Cairo', 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .pdf-page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin: 0 auto;
              background: white;
              position: relative;
              overflow: hidden;
            }
            
            @media print {
              .pdf-page {
                margin: 0;
                box-shadow: none;
                width: 100%;
                min-height: 100vh;
              }
            }
            
            /* RTL Support */
            [dir="rtl"] {
              text-align: right;
            }
            
            [dir="ltr"] {
              text-align: left;
            }
            
            /* Font loading styles */
            .font-loading {
              visibility: hidden;
            }
            
            .font-loaded {
              visibility: visible;
            }
            
            /* Modern template styles */
            .modern-template {
              background-image: url('/assets/menu-bg.jpeg');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
            }
            
            .modern-container {
              position: relative;
              width: 100%;
              min-height: 100%;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(5px);
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .modern-header {
              text-align: center;
              padding: 40px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              position: relative;
              overflow: hidden;
            }
            
            .modern-logo {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 50%;
              border: 4px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }
            
            .modern-title {
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .modern-subtitle {
              font-size: 18px;
              font-weight: 300;
              opacity: 0.9;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            
            .modern-categories {
              padding: 30px;
              display: flex;
              flex-direction: column;
              gap: 40px;
            }
            
            .modern-category {
              background: rgba(255, 255, 255, 0.8);
              border-radius: 16px;
              padding: 30px;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              position: relative;
              overflow: hidden;
            }
            
            .modern-category::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #667eea, #764ba2);
            }
            
            .modern-category.category-left {
              margin-right: 10%;
            }
            
            .modern-category.category-right {
              margin-left: 10%;
            }
            
            .modern-category-header {
              margin-bottom: 25px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 15px;
            }
            
            .modern-category-name {
              font-size: 28px;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 8px;
            }
            
            .modern-category-desc {
              font-size: 16px;
              color: #7f8c8d;
              font-style: italic;
              opacity: 0.8;
            }
            
            .modern-items {
              display: grid;
              gap: 20px;
            }
            
            .modern-item {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 20px;
              background: rgba(255, 255, 255, 0.9);
              border-radius: 12px;
              border: 1px solid rgba(0, 0, 0, 0.05);
              position: relative;
              overflow: hidden;
            }
            
            .modern-item::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 4px;
              background: linear-gradient(135deg, #667eea, #764ba2);
            }
            
            .modern-item.featured {
              background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1));
              border-color: #ffc107;
              box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
            }
            
            .modern-item.featured::before {
              background: linear-gradient(135deg, #ffc107, #ff9800);
            }
            
            .modern-item-content {
              flex: 1;
              margin-right: 20px;
            }
            
            [dir="rtl"] .modern-item-content {
              margin-right: 0;
              margin-left: 20px;
            }
            
            .modern-item-name {
              font-size: 20px;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 8px;
              line-height: 1.3;
            }
            
            .modern-item-desc {
              font-size: 14px;
              color: #7f8c8d;
              line-height: 1.5;
              margin-bottom: 10px;
            }
            
            .modern-dietary-info {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              margin-top: 8px;
            }
            
            .modern-dietary-tag {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              padding: 4px 8px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .modern-item-price {
              font-size: 20px;
              font-weight: 700;
              color: #27ae60;
              white-space: nowrap;
            }
            
            .modern-footer {
              background: linear-gradient(135deg, #2c3e50, #34495e);
              color: white;
              text-align: center;
              padding: 30px;
              position: relative;
              overflow: hidden;
            }
            
            .modern-footer-pattern {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            }
            
            .modern-footer-text {
              font-size: 16px;
              font-weight: 300;
              opacity: 0.9;
              letter-spacing: 1px;
              position: relative;
              z-index: 2;
            }
            
            /* RTL Support for modern template */
            [dir="rtl"] .modern-category.category-left {
              margin-right: 0;
              margin-left: 10%;
            }
            
            [dir="rtl"] .modern-category.category-right {
              margin-left: 0;
              margin-right: 10%;
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
} 