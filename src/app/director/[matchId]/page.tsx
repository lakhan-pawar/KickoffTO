import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { Ticker } from '@/components/ui/Ticker'
import { DirectorModeClient } from '@/components/director/DirectorModeClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ matchId: string }>
  searchParams: Promise<{ genre?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Hollywood Director Mode — KickoffTo',
    description: 'WC2026 matches retold as Hollywood screenplays.',
  }
}

// Mock match data — replace with real API data during tournament
function getMatchData(matchId: string) {
  const matches: Record<string, any> = {
    'mock-arg-fra': {
      id: 'mock-arg-fra',
      homeTeam: { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
      awayTeam: { name: 'France', flag: '🇫🇷', code: 'FRA' },
      homeScore: 2, awayScore: 1,
      status: 'finished', round: 'Group A',
      venue: 'MetLife Stadium',
      events: [
        { minute: 23, type: 'goal', team: 'ARG', player: 'L. Messi', detail: 'Left foot, 18 yards' },
        { minute: 45, type: 'goal', team: 'FRA', player: 'K. Mbappé', detail: 'Counter-attack, right foot' },
        { minute: 67, type: 'goal', team: 'ARG', player: 'L. Messi', detail: 'Penalty, bottom right' },
        { minute: 78, type: 'yellow', team: 'FRA', player: 'A. Tchouaméni', detail: 'Tactical foul' },
      ],
    },
  }
  return matches[matchId] ?? matches['mock-arg-fra']
}

export default async function DirectorPage({ params, searchParams }: PageProps) {
  const { matchId } = await params
  const { genre } = await searchParams
  const match = getMatchData(matchId)
  const initialGenre = genre ?? null

  return (
    <>
      <Navbar />
      <Ticker segments={[
        '🎬 Hollywood Director Mode · WC2026',
        'Every match is a different story',
        `${match.homeTeam.flag} ${match.homeTeam.name} vs ${match.awayTeam.flag} ${match.awayTeam.name}`,
      ]} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 100px' }}>
        <DirectorModeClient match={match} initialGenre={initialGenre} />
      </main>
      <BottomNav />
    </>
  )
}
