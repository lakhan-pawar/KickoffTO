import { NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/redis'
import { getLiveFixtures } from '@/lib/football'
import { mapApiFootballFixture } from '@/lib/football-api'

export const runtime = 'edge'

export async function GET() {
  // Check cache first (30 second TTL)
  const cached = await getCache<{ match: any }>('live:current-match')
  if (cached !== null) return NextResponse.json(cached)

  try {
    const data = await getLiveFixtures() as any
    const fixtures = data?.response ?? []

    if (fixtures.length === 0) {
      await setCache('live:current-match', { match: null }, 30)
      return NextResponse.json({ match: null })
    }

    // Pick the most important live match
    const mapped = fixtures.map(mapApiFootballFixture)
    const match = mapped[0] // First live match

    const result = { match }
    await setCache('live:current-match', result, 30)
    return NextResponse.json(result)
  } catch {
    // Return null, no live match found or error
    return NextResponse.json({ match: null })
  }
}
