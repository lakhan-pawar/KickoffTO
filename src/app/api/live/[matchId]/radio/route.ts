import { NextRequest, NextResponse } from 'next/server'
import { groqChat, buildCharacterSystemPrompt } from '@/lib/groq'
import { CHARACTER_MAP } from '@/lib/constants'

export const runtime = 'edge'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  try {
    const { characterId, matchContext } = await request.json()
    const character = CHARACTER_MAP.get(characterId)
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    const systemPrompt = buildCharacterSystemPrompt(character)
    const userPrompt = `Generate exactly 2 sentences of live radio commentary for this WC2026 match.
Match: ${matchContext.homeTeam} vs ${matchContext.awayTeam}
Score: ${matchContext.score}
Minute: ${matchContext.minute ?? 'Unknown'}
Stay completely in character. 2 sentences only. No more.`

    const commentary = await groqChat(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      character.model,
      120,
    )

    return NextResponse.json({
      commentary: commentary.trim(),
      character: character.name,
      generatedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { commentary: 'The commentary feed is momentarily interrupted. Please try again.' },
      { status: 200 }
    )
  }
}
