import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'

export const runtime = 'edge'

const RADIO_PROMPTS: Record<string, string> = {
  'the-voice': `You are The Voice, a dramatic football commentator on KickoffTo Radio.
Generate ONE line of live commentary (2 sentences max) about the current match situation.
Style: theatrical, emotional, vivid. Like the best moments of a major final.`,
  'el-maestro': `You are El Maestro on KickoffTo Radio.
Generate ONE tactical observation about the current match (2 sentences max).
Style: precise, analytical, insightful. Reference specific tactical details.`,
  'ultra': `You are Ultra on KickoffTo Radio.
Generate ONE passionate fan commentary line (2 sentences max).
Style: excited, emotional, partisan. Like a fan watching the most important match of their life.`,
  'aria-9': `You are ARIA-9 on KickoffTo Radio.
Generate ONE data-driven commentary line (2 sentences max).
Style: cold, precise, statistical. Reference xG, possession percentages, or tactical metrics.`,
}

export async function POST(request: NextRequest) {
  try {
    const { characterId, match } = await request.json()

    const systemPrompt = RADIO_PROMPTS[characterId] ?? RADIO_PROMPTS['the-voice']

    const context = `Match: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}
Minute: ${match.minute ?? 'Unknown'}'
Generate your commentary now.`

    const line = await groqChat(
      [{ role: 'user', content: context }],
      'llama-3.1-8b-instant',
      100,
      systemPrompt,
    )

    return NextResponse.json({ line: line.trim() })
  } catch {
    return NextResponse.json({ 
      line: 'And the ball is in play as this extraordinary encounter continues...',
    })
  }
}
