import { NextRequest, NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/redis'
import { getMatchEvents } from '@/lib/football'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params

  // Check cache first (30s TTL for live events)
  const cacheKey = `events:${matchId}`
  const cached = await getCache(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  try {
    const data = await getMatchEvents(matchId)
    const result = {
      matchId,
      goals: [], // TODO: map API response to Goal type
      momentum: 0.5,
      updatedAt: new Date().toISOString(),
    }

    // Cache for 30 seconds
    await setCache(cacheKey, result, 30)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Events unavailable', goals: [], momentum: 0.5 },
      { status: 200 } // Return 200 with empty data — don't break the UI
    )
  }
}
