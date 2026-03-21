import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { matches, winner } = await request.json()

    const prompt = `You are The Multiverse — an entity that observes alternate WC2026 timelines.
These randomised results just happened in one alternate timeline:
${matches}
The winner was: ${winner}

Write a dramatic 3-sentence alternate history narrative about this WC2026.
Mention 1-2 specific "shocking" results from the match list.
Sound like you are narrating from a parallel universe. Stay in character.
3 sentences maximum.`

    const narrative = await groqChat(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      200,
    )

    return NextResponse.json({ narrative: narrative.trim() })
  } catch {
    return NextResponse.json({
      narrative: 'In this timeline, the impossible became inevitable. The results defied every prediction. The Multiverse has witnessed stranger outcomes.',
    })
  }
}
