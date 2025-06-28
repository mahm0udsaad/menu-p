import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { menuId: string } }
) {
  const { menuId } = params
  
  if (!menuId) {
    return new NextResponse("Menu ID is required", { status: 400 })
  }

  const supabase = createClient()

  // Try to find the published menu by ID
  const { data: publishedMenu, error } = await supabase
    .from("published_menus")
    .select("pdf_url, restaurant_id, menu_name")
    .eq("id", menuId)
    .single()

  if (error) {
    console.error("Error fetching menu:", error)
  }

  if (!publishedMenu || !publishedMenu.pdf_url) {
    console.error(`Menu not found or no PDF URL: ${menuId}`)
    // Return an HTML page that will notify the parent window
    return new NextResponse(
      `
      <html>
        <head>
          <title>Menu Not Found</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 400px;
              margin: 0 auto;
            }
            .error-icon {
              font-size: 48px;
              color: #e74c3c;
              margin-bottom: 20px;
            }
          </style>
          <script>
            window.parent.postMessage('pdf-error', '*');
            // Redirect to not found page after a short delay
            setTimeout(() => {
              window.parent.location.href = '/menus/${menuId}/not-found';
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">⚠️</div>
            <h2>القائمة غير موجودة</h2>
            <p>عذراً، لم نتمكن من العثور على القائمة المطلوبة</p>
            <p>سيتم إعادة توجيهك قريباً...</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
        status: 404,
      }
    );
  }

  try {
    // Fetch the PDF from Supabase storage URL
    const response = await fetch(publishedMenu.pdf_url, {
      headers: {
        'User-Agent': 'Menu-App/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('application/pdf')) {
      throw new Error(`Invalid content type: ${contentType}`)
    }
    
    // Get the PDF content as an array buffer
    const pdfBuffer = await response.arrayBuffer()
    
    if (pdfBuffer.byteLength === 0) {
      throw new Error('PDF file is empty')
    }
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${publishedMenu.menu_name || 'menu'}.pdf"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "X-Content-Type-Options": "nosniff"
      }
    })
  } catch (error) {
    console.error("Error fetching PDF:", error, "Menu ID:", menuId, "PDF URL:", publishedMenu.pdf_url)
    
    // Return an HTML page that will notify the parent window
    return new NextResponse(
      `
      <html>
        <head>
          <title>Error Loading Menu</title>
          <script>
            window.parent.postMessage('pdf-error', '*');
          </script>
        </head>
        <body>
          <p>Error loading menu. Redirecting...</p>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
        status: 500,
      }
    );
  }
} 