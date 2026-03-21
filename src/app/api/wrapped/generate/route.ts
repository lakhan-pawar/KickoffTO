import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { stats } = await request.json()

    const prompt = `You are The Archive, narrating a fan's WC2026 journey at KickoffTo.

Fan stats:
- Trivia games played: ${stats.triviaPlayed}
- Trivia correct answers: ${stats.triviaScore}
- Predictions submitted: ${stats.predictionsSubmitted}
- Journal entries: ${stats.journalEntries}
- Days until tournament: ${stats.daysUntilTournament ?? 'Tournament active'}

Write a personalised 3-sentence narrative about this fan's WC2026 engagement. 
Style: warm, celebrating their participation, slightly poetic. 
Reference specific numbers from their stats.
3 sentences only.`

    const narrative = await groqChat(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      180,
    )

    return NextResponse.json({ narrative: narrative.trim() })
  } catch {
    return NextResponse.json({ 
      narrative: 'Your WC2026 journey is just beginning. The predictions are filed, the trivia answered, and the story is yours to write. June 11 cannot come soon enough.',
    })
  }
}
