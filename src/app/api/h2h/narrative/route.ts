import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'
import { getCache, setCache } from '@/lib/redis'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { teamA, teamB, h2h } = await request.json()

    const cacheKey = `h2h:${[teamA, teamB].sort().join('-')}`
    const cached = await getCache<{ narrative: string }>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const prompt = `You are The Archive, a football historian.
Write a 3-sentence narrative about the football rivalry between ${teamA} and ${teamB}.
Head to head record: ${teamA} wins: ${h2h.w}, draws: ${h2h.d}, ${teamB} wins: ${h2h.l}
Last match: ${h2h.lastMatch}
Style: warm, historical, storytelling. Reference specific WC matches if relevant.
3 sentences only. No bullet points.`

    const narrative = await groqChat(
      [{ role: 'user', content: prompt }],
      'llama-3.3-70b-versatile',
      200,
    )

    const result = { narrative: narrative.trim() }
    await setCache(cacheKey, result, 86400 * 7) // Cache 7 days
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({
      narrative: 'The Archive is researching this historic rivalry. A detailed account will follow shortly.',
    })
  }
}
