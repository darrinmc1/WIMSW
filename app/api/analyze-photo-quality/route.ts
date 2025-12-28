import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 30

/**
 * API Route: Analyze Photo Quality
 * Uses Gemini AI to analyze uploaded photos and provide specific feedback
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Remove data:image/... prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '')

    const prompt = `You are a professional photography quality analyzer for e-commerce product photos. 
Analyze this photo and provide specific, actionable feedback.

Evaluate: Sharpness, Lighting, Distance/Framing, Background, Angle, Label Visibility

Respond in EXACT JSON format (no markdown):
{
  "score": <number 0-100>,
  "overall": "<brief assessment>",
  "issues": [
    {
      "type": "<error|warning|success>",
      "message": "<what's the issue>",
      "suggestion": "<how to fix it>"
    }
  ]
}

Scoring: 90-100=Excellent, 75-89=Good, 60-74=Acceptable, 40-59=Poor, 0-39=Very Poor

Be specific:
- "Photo is too dark - take near window during daytime"
- "Image out of focus - hold steady and tap to focus"
- "Item too far - move 2-3 feet closer"
- "Cluttered background - use plain white/grey surface"

Provide 2-4 issues max, prioritize most important.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error('AI analysis failed')
    }

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!resultText) {
      throw new Error('No AI response')
    }

    let feedback
    try {
      const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim()
      feedback = JSON.parse(cleanedText)
    } catch {
      feedback = {
        score: 70,
        overall: 'Photo quality appears acceptable',
        issues: [{
          type: 'warning',
          message: 'Could not perform detailed analysis',
          suggestion: 'Ensure photo is clear, well-lit, and item is prominent'
        }]
      }
    }

    return NextResponse.json({ feedback })

  } catch (error) {
    console.error('Photo quality analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
