import { NextRequest, NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/redis'

export const runtime = 'edge'

const MOCK_EVENTS = [
  { id: 'evt-1', minute: 23, type: 'goal', team: 'home', player: 'L. Messi',
    detail: 'Left foot, 18 yards', assistedBy: 'J. Alvarez' },
  { id: 'evt-2', minute: 45, type: 'goal', team: 'away', player: 'K. Mbappé',
    detail: 'Counter-attack, right foot', assistedBy: null },
  { id: 'evt-3', minute: 67, type: 'goal', team: 'home', player: 'L. Messi',
    detail: 'Penalty, bottom right', assistedBy: null },
  { id: 'evt-4', minute: 78, type: 'yellow', team: 'away', player: 'A. Tchouaméni',
    detail: 'Tactical foul', assistedBy: null },
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params

  // Check cache (60 second TTL for live events)
  const cacheKey = `events:${matchId}`
  const cached = await getCache(cacheKey)
  if (cached) return NextResponse.json(cached)

  // Mock match IDs serve mock data
  if (matchId.startsWith('mock-')) {
    const result = { events: MOCK_EVENTS, matchId, source: 'mock' }
    await setCache(cacheKey, result, 60)
    return NextResponse.json(result)
  }

  // Real API-Football call
  const apiKey = process.env.FOOTBALL_API_KEY_1
    ?? process.env.FOOTBALL_API_KEY_2
    ?? process.env.FOOTBALL_API_KEY_3

  if (!apiKey) {
    return NextResponse.json(
      { events: MOCK_EVENTS, matchId, source: 'mock-fallback',
        error: 'No API key configured' }
    )
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    )

    if (!res.ok) throw new Error(`API error ${res.status}`)

    const data = await res.json()
    const events = (data.response ?? []).map((evt: any, i: number) => ({
      id: `evt-${i}`,
      minute: evt.time?.elapsed ?? 0,
      type: mapEventType(evt.type, evt.detail),
      team: evt.team?.name,
      player: evt.player?.name ?? 'Unknown',
      detail: evt.detail ?? '',
      assistedBy: evt.assist?.name ?? null,
    }))

    const result = { events, matchId, source: 'api-football' }
    await setCache(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { events: MOCK_EVENTS, matchId, source: 'mock-fallback', error: msg }
    )
  }
}

function mapEventType(type: string, detail: string): string {
  const t = type?.toLowerCase()
  const d = detail?.toLowerCase()
  if (t === 'goal') return 'goal'
  if (t === 'card' && d?.includes('yellow')) return 'yellow'
  if (t === 'card' && d?.includes('red')) return 'red'
  if (t === 'subst') return 'sub'
  if (t === 'var') return 'var'
  return 'event'
}
