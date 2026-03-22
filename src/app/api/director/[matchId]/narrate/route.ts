// src/app/api/director/[matchId]/narrate/route.ts
// Node.js runtime — NOT edge (needs Buffer for base64, longer timeout)
import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/deepgram-tts'

// No edge runtime — Node.js allows 60s timeout on Vercel hobby

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  try {
    const body = await request.json()
    const { script, genre } = body as { script: string; genre: string }

    if (!script?.trim()) {
      return NextResponse.json({ error: 'No script provided' }, { status: 400 })
    }

    const result = await textToSpeech(script, genre)

    if (!result.audioDataUri) {
      return NextResponse.json({
        audioDataUri: null,
        error: result.error ?? 'Audio generation failed',
        debug: {
          genre,
          scriptLength: script.length,
          keysConfigured: !!(
            process.env.DEEPGRAM_API_KEY_1 ||
            process.env.DEEPGRAM_API_KEY_2
          ),
        },
      })
    }

    return NextResponse.json({
      audioDataUri:   result.audioDataUri,
      voiceUsed:      result.voiceUsed,
      originalLength: result.originalLength,
      usedLength:     result.usedLength,
      error:          null,
    })

  } catch (err: unknown) {
    return NextResponse.json(
      { audioDataUri: null, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
