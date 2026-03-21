// src/app/api/director/[matchId]/narrate/route.ts
// NO edge runtime — needs Node.js for longer timeout (60s on Vercel)
import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/unrealspeech'

// Do NOT add: export const runtime = 'edge'
// Node.js runtime allows up to 60s on Vercel hobby plan

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

    if (!result.audioUrl) {
      // Return 200 with error info — client handles it gracefully
      return NextResponse.json({
        audioUrl: null,
        error: result.error ?? 'TTS generation failed',
        rawResponse: result.rawResponse,
        debug: {
          genre,
          scriptLength: script.length,
          keysConfigured: !!(
            process.env.UNREAL_SPEECH_API_KEY_1 ||
            process.env.UNREAL_SPEECH_API_KEY_2 ||
            process.env.UNREAL_SPEECH_API_KEY_3
          ),
        },
      })
    }

    return NextResponse.json({
      audioUrl: result.audioUrl,
      error: null,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { audioUrl: null, error: message },
      { status: 500 }
    )
  }
}
