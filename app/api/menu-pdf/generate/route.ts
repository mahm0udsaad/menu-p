import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { generatePDFFromMenuData } from "@/lib/playwright/pdf-generator"
import { PDFReactRenderer } from "@/lib/pdf-server-components/pdf-renderer"
import PDFTemplateFactory, { TemplateId } from "@/lib/pdf-server-components/pdf-template-factory"

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

    // Validate template ID
    const normalizedTemplateId = PDFTemplateFactory.normalizeTemplateId(templateId)
    console.log(`🎨 Generating PDF for menu ${menuId} with template '${normalizedTemplateId}'`)

    const supabase = createClient()

    // Fetch menu data from database
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", menuId)
      .single()

    if (restaurantError || !restaurant) {
      console.error("Restaurant not found:", restaurantError)
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Fetch menu categories and items
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

    // Check if we have a cached PDF and don't need to regenerate
    if (!forceRegenerate) {
      const { data: cachedPDF } = await supabase
        .from("menu_pdfs")
        .select("pdf_url, template_id, created_at")
        .eq("menu_id", menuId)
        .eq("template_id", normalizedTemplateId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (cachedPDF?.pdf_url) {
        const cacheAge = new Date().getTime() - new Date(cachedPDF.created_at).getTime()
        const maxCacheAge = 24 * 60 * 60 * 1000 // 24 hours

        if (cacheAge < maxCacheAge) {
          console.log(`📄 Using cached PDF for ${normalizedTemplateId} template`)
          return NextResponse.json({ 
            pdfUrl: cachedPDF.pdf_url,
            cached: true,
            templateId: normalizedTemplateId
          })
        }
      }
    }

    console.log(`🎯 Generating new PDF with React Server Components...`)

    // Generate PDF using React Server Components
    const renderOptions = {
      templateId: normalizedTemplateId,
      restaurant,
      categories: categories || [],
      language,
      customizations,
      format,
    }

    // Step 1: Render React component to HTML
    const htmlContent = await PDFReactRenderer.renderTemplate(renderOptions)

    // Step 2: Generate PDF from HTML using Playwright
    const pdfBuffer = await generatePDFFromMenuData({
      htmlContent,
      format: format as 'A4' | 'Letter',
      language,
    })

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty')
    }

    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`)

    // Step 3: Upload PDF to Supabase Storage
    const fileName = `menu-${menuId}-${normalizedTemplateId}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu-pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError)
      // Still return the PDF even if storage fails
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${restaurant.name}-menu.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
        }
      })
    }

    // Step 4: Get public URL
    const { data: urlData } = supabase.storage
      .from('menu-pdfs')
      .getPublicUrl(fileName)

    const pdfUrl = urlData.publicUrl

    // Step 5: Save PDF record to database
    await supabase
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

    console.log(`🎉 PDF successfully generated and cached: ${pdfUrl}`)

    return NextResponse.json({ 
      pdfUrl,
      templateId: normalizedTemplateId,
      cached: false,
      fileSize: pdfBuffer.length
    })

  } catch (error) {
    console.error("❌ Error generating PDF:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve available templates
export async function GET() {
  try {
    const templates = PDFTemplateFactory.getAllTemplates()
    
    return NextResponse.json({
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description
      })),
      defaultTemplate: 'classic'
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
} 