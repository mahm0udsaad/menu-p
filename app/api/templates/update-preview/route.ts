import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { templateId, previewImageUrl } = await request.json()

    if (!templateId || !previewImageUrl) {
      return NextResponse.json(
        { error: 'Template ID and preview image URL are required' },
        { status: 400 }
      )
    }

    // Read the PDF templates metadata file
    const metadataPath = join(process.cwd(), 'data', 'pdf-templates-metadata.json')
    const metadataContent = await readFile(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)

    // Update the specific template's preview image URL
    if (metadata.templates[templateId]) {
      metadata.templates[templateId].previewImageUrl = previewImageUrl
      
      // Write the updated metadata back to the file
      await writeFile(metadataPath, JSON.stringify(metadata, null, 2))
      
      console.log(`✅ Updated preview image for template ${templateId}: ${previewImageUrl}`)
      
      return NextResponse.json({
        success: true,
        templateId,
        previewImageUrl
      })
    } else {
      return NextResponse.json(
        { error: `Template ${templateId} not found in metadata` },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error updating PDF template preview:', error)
    return NextResponse.json(
      { error: 'Failed to update PDF template preview' },
      { status: 500 }
    )
  }
} 