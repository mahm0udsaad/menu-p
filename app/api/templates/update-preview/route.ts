import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { templateId, previewImageUrl } = await request.json()

    if (!templateId || !previewImageUrl) {
      return NextResponse.json(
        { error: 'Missing templateId or previewImageUrl' },
        { status: 400 }
      )
    }

    // Read the current metadata file
    const metadataPath = path.join(process.cwd(), 'data', 'pdf-templates-metadata.json')
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)

    // Check if template exists
    if (!metadata.templates[templateId]) {
      return NextResponse.json(
        { error: `Template ${templateId} not found` },
        { status: 404 }
      )
    }

    // Update the template with the preview image URL
    metadata.templates[templateId].previewImageUrl = previewImageUrl

    // Write the updated metadata back to the file
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: `Preview image updated for template ${templateId}`,
      templateId,
      previewImageUrl
    })

  } catch (error) {
    console.error('Error updating template preview:', error)
    return NextResponse.json(
      { error: 'Failed to update template preview' },
      { status: 500 }
    )
  }
} 