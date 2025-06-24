import { google } from "@ai-sdk/google"

export async function GET() {
  try {
    // Check if API key exists
    const hasApiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    
    // Try to initialize the model
    let modelStatus = 'unknown'
    try {
      const model = google('gemini-2.0-flash-exp')
      modelStatus = 'initialized'
    } catch (error) {
      modelStatus = `error: ${error instanceof Error ? error.message : 'unknown'}`
    }

    const config = {
      hasApiKey,
      apiKeyLength: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0,
      modelStatus,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    console.log('🔍 Configuration check:', config)

    return Response.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('❌ Configuration check failed:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 