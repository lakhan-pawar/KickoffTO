// src/app/api/director/[matchId]/narrate/route.ts
// Node.js runtime — NOT edge (needs Buffer for base64 conversion)
import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/unrealspeech'

// No edge runtime — Node.js allows Buffer and longer timeout (60s)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  await params // Ensure Next.js 16 compatibility

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
      })
    }

    return NextResponse.json({
      audioDataUri: result.audioDataUri,
      voiceUsed: result.voiceUsed,
      error: null,
    })

  } catch (err: unknown) {
    return NextResponse.json(
      { audioDataUri: null, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
