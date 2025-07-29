import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { generatePDFFromMenuData, checkBrowserHealth, resetBrowserInstance } from "@/lib/playwright/pdf-generator"
import { PDFReactRenderer } from "@/lib/pdf-server-components/pdf-renderer"
import PDFTemplateFactory from "@/lib/pdf-server-components/pdf-template-factory"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      menuId, 
      templateId = 'classic',
      language = 'ar',
      customizations = {},
      format = 'A4',
      forceRegenerate = false
    } = body

    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 })
    }

    // Check browser health before starting
    const healthCheck = await checkBrowserHealth()
    if (!healthCheck.healthy) {
      console.log(`⚕️ Browser unhealthy: ${healthCheck.details}. Resetting...`)
      await resetBrowserInstance()
    }

    // Validate template ID using the new async factory
    const normalizedTemplateId = await PDFTemplateFactory.normalizeTemplateId(templateId)
    console.log(`🎨 Generating PDF for menu ${menuId} with template '${normalizedTemplateId}'`)

    const supabase = createClient()

    // Fetch menu data from database with error handling
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", menuId)
      .single()

    if (restaurantError || !restaurant) {
      console.error("Restaurant not found:", restaurantError)
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Fetch menu categories and items with error handling
    const { data: categories, error: categoriesError } = await supabase
      .from("menu_categories")
      .select(`
        *,
        menu_items (*)
      `)
      .eq("restaurant_id", menuId)
      .order("display_order", { ascending: true })

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
      return NextResponse.json({ error: "Error fetching menu data" }, { status: 500 })
    }

    // Check for cached PDF with better cache validation
    if (!forceRegenerate) {
      try {
        const { data: cachedPDF } = await supabase
          .from("menu_pdfs")
          .select("pdf_url, template_id, created_at, file_size")
          .eq("menu_id", menuId)
          .eq("template_id", normalizedTemplateId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (cachedPDF?.pdf_url) {
          const cacheAge = new Date().getTime() - new Date(cachedPDF.created_at).getTime()
          const maxCacheAge = 24 * 60 * 60 * 1000 // 24 hours

          if (cacheAge < maxCacheAge) {
            console.log(`📄 Using cached PDF for ${normalizedTemplateId} template (${cachedPDF.file_size} bytes)`)
            return NextResponse.json({ 
              pdfUrl: cachedPDF.pdf_url,
              cached: true,
              templateId: normalizedTemplateId,
              fileSize: cachedPDF.file_size
            })
          } else {
            console.log(`⏰ Cached PDF expired (${Math.round(cacheAge / (60 * 60 * 1000))} hours old), regenerating...`)
          }
        }
      } catch (cacheCheckError) {
        console.warn("⚠️ Cache check failed, proceeding with generation:", cacheCheckError)
      }
    }

    console.log(`🎯 Generating new PDF with dynamic template loading...`)

    // Generate PDF using the enhanced async renderer with timeout
    const renderOptions = {
      templateId: normalizedTemplateId,
      restaurant,
      categories: categories || [],
      language,
      customizations,
      format,
    }

    let pdfBuffer: Buffer;
    let generationError: Error | null = null;

    try {
      // Step 1: Render template to HTML (with timeout)
      const renderPromise = PDFReactRenderer.renderTemplateWithReact(renderOptions)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Template rendering timeout')), 30000)
      })
      
      const htmlContent = await Promise.race([renderPromise, timeoutPromise])

      if (!htmlContent || htmlContent.length < 100) {
        throw new Error('Generated HTML content is invalid or too short')
      }

      // Step 2: Generate PDF from HTML using enhanced Playwright generator
      const pdfPromise = generatePDFFromMenuData({
        htmlContent,
        format: format as 'A4' | 'Letter',
        language,
      })
      
      const pdfTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('PDF generation timeout')), 45000)
      })

      pdfBuffer = await Promise.race([pdfPromise, pdfTimeoutPromise])

    } catch (error) {
      generationError = error as Error
      console.error(`❌ PDF generation failed:`, error)
      
      // Try browser reset and retry once
      try {
        console.log('🔄 Attempting browser reset and retry...')
        await resetBrowserInstance()
        
        const retryHtmlContent = await PDFReactRenderer.renderTemplateWithReact(renderOptions)
        pdfBuffer = await generatePDFFromMenuData({
          htmlContent: retryHtmlContent,
          format: format as 'A4' | 'Letter',
          language,
        })
        
        console.log('✅ PDF generation succeeded after retry')
      } catch (retryError) {
        console.error('❌ Retry also failed:', retryError)
        throw generationError || retryError
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty')
    }

    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`)

    // Step 3: Upload PDF to Supabase Storage with error handling
    const fileName = `menu-${menuId}-${normalizedTemplateId}-${Date.now()}.pdf`
    let pdfUrl: string | null = null;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-pdfs')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        })

      if (uploadError) {
        console.error('⚠️ Error uploading PDF to storage:', uploadError)
        throw uploadError
      }

      // Step 4: Get public URL
      const { data: urlData } = supabase.storage
        .from('menu-pdfs')
        .getPublicUrl(fileName)

      pdfUrl = urlData.publicUrl

      // Step 5: Save PDF record to database
      const { error: dbError } = await supabase
        .from("menu_pdfs")
        .insert({
          menu_id: menuId,
          template_id: normalizedTemplateId,
          pdf_url: pdfUrl,
          file_name: fileName,
          file_size: pdfBuffer.length,
          language,
          customizations,
        })

      if (dbError) {
        console.error('⚠️ Error saving PDF record to database:', dbError)
        // Don't fail the request if database save fails
      }

      console.log(`🎉 PDF successfully generated and cached: ${pdfUrl}`)

      return NextResponse.json({ 
        pdfUrl,
        templateId: normalizedTemplateId,
        cached: false,
        fileSize: pdfBuffer.length
      })

    } catch (storageError) {
      console.error('⚠️ Storage operation failed, returning PDF directly:', storageError)
      
      // Return PDF directly if storage fails
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${restaurant.name.replace(/[^a-zA-Z0-9]/g, '_')}-menu.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "no-cache"
        }
      })
    }

  } catch (error) {
    console.error("❌ Critical error in PDF generation:", error)
    
    // Enhanced error response with details
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const isTimeoutError = errorMessage.includes('timeout')
    const isBrowserError = errorMessage.includes('browser') || errorMessage.includes('Target page, context or browser has been closed')
    
    let statusCode = 500
    let clientError = "Failed to generate PDF"
    
    if (isTimeoutError) {
      statusCode = 504
      clientError = "PDF generation timed out. Please try again."
    } else if (isBrowserError) {
      statusCode = 503
      clientError = "PDF service temporarily unavailable. Please try again."
      
      // Reset browser for next request
      resetBrowserInstance().catch(resetError => {
        console.error('Failed to reset browser after error:', resetError)
      })
    }
    
    return NextResponse.json(
      { 
        error: clientError,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        retryable: isTimeoutError || isBrowserError
      },
      { status: statusCode }
    )
  }
}

// Enhanced GET endpoint with health check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const healthCheck = searchParams.get('health')
    
    if (healthCheck === 'true') {
      // Return browser health status
      const health = await checkBrowserHealth()
      return NextResponse.json({
        browserHealth: health,
        timestamp: new Date().toISOString()
      })
    }

    // Use the new async factory to get templates
    const templates = await PDFTemplateFactory.getAllTemplates()
    const categories = await PDFTemplateFactory.getCategories()
    
    return NextResponse.json({
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        features: template.features
      })),
      categories: categories.map(category => ({
        id: category.name.toLowerCase().replace(/\s+/g, '-'),
        name: category.name,
        description: category.description
      })),
      defaultTemplate: await PDFTemplateFactory.normalizeTemplateId(),
      serverStatus: 'healthy'
    })
  } catch (error) {
    console.error("Error in GET endpoint:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch templates",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}