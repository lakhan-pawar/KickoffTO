import { Suspense } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { LiveMatchRoom } from '@/components/live/LiveMatchRoom'
import { getLiveFixtures, getUpcomingFixtures } from '@/lib/football'
import type { Metadata } from 'next'
import type { Match } from '@/types'

// Use a dynamic param for matchId
interface PageProps {
  params: Promise<{ matchId: string }>
}

export const revalidate = 30

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { matchId } = await params
  return {
    title: `Live Match ${matchId} — KickoffTo`,
    description: 'Live WC2026 match with AI commentary, crowd reactions and real-time analysis.',
  }
}

// Mock match for development (replace with real API data during tournament)
function getMockMatch(matchId: string): Match {
  return {
    id: matchId,
    homeTeam: {
      id: 'arg', name: 'Argentina', shortName: 'ARG', code: 'ARG',
      flag: '🇦🇷', confederation: 'CONMEBOL',
      kitColors: { home: ['#75aadb', '#ffffff'], away: ['#ffffff', '#75aadb'] },
    },
    awayTeam: {
      id: 'fra', name: 'France', shortName: 'FRA', code: 'FRA',
      flag: '🇫🇷', confederation: 'UEFA',
      kitColors: { home: ['#003087', '#ffffff', '#e63946'], away: ['#ffffff', '#003087'] },
    },
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    minute: 67,
    round: 'Group A',
    venue: 'MetLife Stadium, East Rutherford NJ',
    kickoff: new Date(Date.now() - 67 * 60000).toISOString(),
    intensity: 'big',
  }
}

export default async function LiveMatchPage({ params }: PageProps) {
  const { matchId } = await params
  
  // Try to get real match data
  let match: Match
  try {
    // TODO: map real API response to Match type
    // const data = await getLiveFixtures()
    match = getMockMatch(matchId)
  } catch {
    match = getMockMatch(matchId)
  }

  const isLive = match.status === 'live'

  return (
    <>
      <Navbar isLive={isLive} />

      <main style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 120 }}>
        <Suspense fallback={<LiveMatchSkeleton />}>
          <LiveMatchRoom match={match} />
        </Suspense>
      </main>

      <BottomNav />
    </>
  )
}

function LiveMatchSkeleton() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{
        height: 140, background: 'var(--bg-elevated)',
        borderRadius: 12, marginBottom: 12,
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      <div style={{
        height: 60, background: 'var(--bg-elevated)',
        borderRadius: 12, marginBottom: 12,
      }} />
    </div>
  )
}
