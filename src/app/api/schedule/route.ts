import { NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/redis'

export const runtime = 'edge'

// WC2026 league ID in API-Football (update when tournament registered)
const WC2026_LEAGUE_ID = 1 // FIFA World Cup

const MOCK_SCHEDULE = [
  {
    id: 'mock-arg-fra',
    homeTeam: { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
    awayTeam: { name: 'France', flag: '🇫🇷', code: 'FRA' },
    kickoff: '2026-06-14T20:00:00Z',
    round: 'Group A', venue: 'MetLife Stadium',
    status: 'scheduled',
  },
  {
    id: 'mock-bra-esp',
    homeTeam: { name: 'Brazil', flag: '🇧🇷', code: 'BRA' },
    awayTeam: { name: 'Spain', flag: '🇪🇸', code: 'ESP' },
    kickoff: '2026-06-16T20:00:00Z',
    round: 'Group C', venue: 'AT&T Stadium',
    status: 'scheduled',
  },
  {
    id: 'mock-can-tbd',
    homeTeam: { name: 'Canada', flag: '🇨🇦', code: 'CAN' },
    awayTeam: { name: 'Morocco', flag: '🇲🇦', code: 'MAR' },
    kickoff: '2026-06-18T20:00:00Z',
    round: 'Group B', venue: 'BMO Field, Toronto',
    status: 'scheduled',
  },
]

export async function GET() {
  const cached = await getCache('schedule:upcoming')
  if (cached) return NextResponse.json(cached)

  const apiKey = process.env.FOOTBALL_API_KEY_1

  if (!apiKey) {
    await setCache('schedule:upcoming', { fixtures: MOCK_SCHEDULE }, 3600)
    return NextResponse.json({ fixtures: MOCK_SCHEDULE, source: 'mock' })
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${WC2026_LEAGUE_ID}&season=2026&from=${today}&status=NS-1H-HT-2H`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    )

    if (!res.ok) throw new Error(`API error ${res.status}`)

    const data = await res.json()
    const fixtures = (data.response ?? []).slice(0, 10).map((f: any) => ({
      id: String(f.fixture?.id),
      homeTeam: {
        name: f.teams?.home?.name,
        code: f.teams?.home?.code,
        flag: '🏳️', // Flag mapped in frontend
      },
      awayTeam: {
        name: f.teams?.away?.name,
        code: f.teams?.away?.code,
        flag: '🏳️',
      },
      kickoff: f.fixture?.date,
      round: f.league?.round,
      venue: f.fixture?.venue?.name,
      status: 'scheduled',
    }))

    const result = { fixtures, source: 'api-football' }
    await setCache('schedule:upcoming', result, 3600)
    return NextResponse.json(result)
  } catch {
    await setCache('schedule:upcoming', { fixtures: MOCK_SCHEDULE }, 3600)
    return NextResponse.json({ fixtures: MOCK_SCHEDULE, source: 'mock-fallback' })
  }
}
