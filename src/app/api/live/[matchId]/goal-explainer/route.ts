import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'
import { getCache, setCache, CACHE_KEYS } from '@/lib/redis'

export const runtime = 'edge'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params
    const { goal } = await request.json()

    const cacheKey = CACHE_KEYS.goalExplainer(matchId, goal.id)
    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json({ cached: true, ...cached })

    const context = `Match: ${goal.homeTeam} ${goal.homeScore}-${goal.awayScore} ${goal.awayTeam}
Goal: ${goal.minute}' by ${goal.scorer} (${goal.teamCode})
Detail: ${goal.detail ?? 'No additional detail'}`

    // Generate El Maestro and The Voice responses in parallel
    const [maestro, voice] = await Promise.all([
      groqChat(
        [{ role: 'user', content: `${context}\nAnalyse this goal tactically in 2 sentences.` }],
        'llama-3.3-70b-versatile',
        120,
        'You are El Maestro, a tactical analyst. 2 sentences only. Reference specific tactical details.',
      ),
      groqChat(
        [{ role: 'user', content: `${context}\nDramatically narrate this goal in 2 sentences.` }],
        'llama-3.1-8b-instant',
        100,
        'You are The Voice, a dramatic commentator. 2 sentences only. Maximum emotion and theatre.',
      ),
    ])

    const result = {
      maestro: maestro.trim(),
      voice: voice.trim(),
      generatedAt: new Date().toISOString(),
    }

    // Cache permanently — goals don't change
    await setCache(cacheKey, result)

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
