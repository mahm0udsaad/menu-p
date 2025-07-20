import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const metadataPath = path.join(process.cwd(), 'data', 'pdf-templates-metadata.json')
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)
    
    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Error serving template metadata:', error)
    return NextResponse.json(
      { error: 'Failed to load template metadata' },
      { status: 500 }
    )
  }
} 