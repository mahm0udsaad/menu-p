import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const templateId = formData.get('templateId') as string
    const imageFile = formData.get('image') as File

    if (!templateId || !imageFile) {
      return NextResponse.json(
        { error: 'Template ID and image file are required' },
        { status: 400 }
      )
    }

    // Create the previews directory if it doesn't exist
    const previewsDir = join(process.cwd(), 'public', 'previews')
    try {
      await mkdir(previewsDir, { recursive: true })
    } catch (error) {
      console.error('Error creating previews directory:', error)
    }

    // Convert the file to buffer
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename
    const filename = `${templateId}-preview.png`
    const filePath = join(previewsDir, filename)

    // Save the file
    await writeFile(filePath, buffer)

    // Return the public URL
    const imageUrl = `/previews/${filename}`

    console.log(`✅ Saved preview image for template ${templateId}: ${imageUrl}`)

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
      templateId
    })

  } catch (error) {
    console.error('Error saving preview image:', error)
    return NextResponse.json(
      { error: 'Failed to save preview image' },
      { status: 500 }
    )
  }
} 