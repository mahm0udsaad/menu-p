import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { menuId: string } }
) {
  const { menuId } = params
  const supabase = createClient()

  // First try to find by menu ID
  let { data: publishedMenu, error } = await supabase
    .from("published_menus")
    .select("pdf_url, restaurant_id")
    .eq("id", menuId)
    .single()

  // If not found, try to find by restaurant ID (get the latest menu)
  if (error || !publishedMenu) {
    try {
      const { data: menuByRestaurant, error: restaurantError } = await supabase
        .from("published_menus")
        .select("pdf_url, restaurant_id")
        .eq("restaurant_id", menuId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      
      if (!restaurantError && menuByRestaurant) {
        publishedMenu = menuByRestaurant
      }
    } catch (e) {
      // Ignore errors from dummy client
      console.error("Error fetching menu by restaurant ID:", e)
    }
  }

  if (!publishedMenu) {
    // Return an HTML page that will notify the parent window
    return new NextResponse(
      `
      <html>
        <head>
          <title>Menu Not Found</title>
          <script>
            window.parent.postMessage('pdf-error', '*');
          </script>
        </head>
        <body>
          <p>Menu not found. Redirecting...</p>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
        status: 404,
      }
    );
  }

  try {
    // Fetch the PDF from Supabase storage URL
    const response = await fetch(publishedMenu.pdf_url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`)
    }
    
    // Get the PDF content as an array buffer
    const pdfBuffer = await response.arrayBuffer()
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=menu.pdf",
        "Cache-Control": "public, max-age=3600" // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error("Error fetching PDF:", error)
    
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