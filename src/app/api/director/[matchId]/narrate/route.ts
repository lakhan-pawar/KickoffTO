// src/app/api/director/[matchId]/narrate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/unrealspeech'

export const runtime = 'edge'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  // Await params if needed, though not directly used in the logic below
  // it ensures the route signature matches Next.js expectations
  await params 

  try {
    const { script, genre } = await request.json() as {
      script: string
      genre: string
    }

    if (!script) {
      return NextResponse.json({ error: 'No script provided' }, { status: 400 })
    }

    const result = await textToSpeech(script, genre)

    if (!result.audioUrl) {
      return NextResponse.json(
        { error: result.error ?? 'TTS failed', usedFallback: true },
        { status: 503 }
      )
    }

    return NextResponse.json({
      audioUrl: result.audioUrl,
      usedFallback: false,
    })

  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Narration failed' },
      { status: 500 }
    )
  }
}
