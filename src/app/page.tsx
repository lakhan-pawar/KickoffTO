import { Navbar } from '@/components/ui/Navbar'
import { Ticker } from '@/components/ui/Ticker'
import { MatchCard } from '@/components/ui/MatchCard'
import { CharacterCard } from '@/components/ui/CharacterCard'
import { BottomNav } from '@/components/ui/BottomNav'
import { MiniPlayer } from '@/components/ui/MiniPlayer'
import { CHARACTERS } from '@/lib/constants'
import { getLiveFixtures, getUpcomingFixtures } from '@/lib/football'
import { mapApiFootballFixture } from '@/lib/football-api'
import { Countdown } from '@/components/ui/Countdown'
import { AdUnit } from '@/components/ads/AdUnit'
import type { Match } from '@/types'
import Link from 'next/link'

// Revalidate every 30 seconds for live data
export const revalidate = 30

// Static ticker segments (live match data injected server-side)
const TICKER_SEGMENTS = [
  '🏆 WC2026 · June 11 – July 19, 2026',
  '48 teams · 104 matches · 3 host nations',
  '🇨🇦 Canada · 🇲🇽 Mexico · 🇺🇸 USA',
  'kickoffto.com — the internet\'s home for WC2026',
]

// Mock match data for pre-tournament (replace with real API data when live)
const MOCK_UPCOMING_MATCHES = [
  {
    id: 'mock-arg-fra',
    homeTeam: {
      id: 'arg', name: 'Argentina', shortName: 'ARG', code: 'ARG',
      flag: '🇦🇷', confederation: 'CONMEBOL' as const,
      kitColors: { home: ['#75aadb', '#ffffff'], away: ['#ffffff', '#75aadb'] },
    },
    awayTeam: {
      id: 'fra', name: 'France', shortName: 'FRA', code: 'FRA',
      flag: '🇫🇷', confederation: 'UEFA' as const,
      kitColors: { home: ['#003087', '#ffffff', '#e63946'], away: ['#ffffff', '#003087'] },
    },
    homeScore: null, awayScore: null,
    status: 'scheduled' as const, minute: null,
    round: 'Group A', venue: 'MetLife Stadium, NJ',
    kickoff: new Date(Date.now() + 2 * 86400000).toISOString(),
    intensity: 'normal' as const,
  },
  {
    id: 'mock-bra-esp',
    homeTeam: {
      id: 'bra', name: 'Brazil', shortName: 'BRA', code: 'BRA',
      flag: '🇧🇷', confederation: 'CONMEBOL' as const,
      kitColors: { home: ['#f5d000', '#009c3b'], away: ['#2b65ef', '#f5d000'] },
    },
    awayTeam: {
      id: 'esp', name: 'Spain', shortName: 'ESP', code: 'ESP',
      flag: '🇪🇸', confederation: 'UEFA' as const,
      kitColors: { home: ['#c60b1e', '#f1bf00'], away: ['#2b65ef', '#ffffff'] },
    },
    homeScore: null, awayScore: null,
    status: 'scheduled' as const, minute: null,
    round: 'Group C', venue: 'AT&T Stadium, TX',
    kickoff: new Date(Date.now() + 4 * 86400000).toISOString(),
    intensity: 'normal' as const,
  },
  {
    id: 'mock-can-tbd',
    homeTeam: {
      id: 'can', name: 'Canada', shortName: 'CAN', code: 'CAN',
      flag: '🇨🇦', confederation: 'CONCACAF' as const,
      kitColors: { home: ['#e31837', '#ffffff'], away: ['#ffffff', '#e31837'] },
    },
    awayTeam: {
      id: 'tbd', name: 'TBD', shortName: 'TBD', code: 'TBD',
      flag: '🏳️', confederation: 'UEFA' as const,
      kitColors: { home: ['#888888', '#ffffff'], away: ['#ffffff', '#888888'] },
    },
    homeScore: null, awayScore: null,
    status: 'scheduled' as const, minute: null,
    round: 'Group B', venue: 'BMO Field, Toronto',
    kickoff: new Date(Date.now() + 6 * 86400000).toISOString(),
    intensity: 'normal' as const,
  },
]

// Phase 1 characters only
const PHASE1_CHARACTERS = CHARACTERS.filter(c => c.phase === 1)

export default async function HomePage() {
  let liveMatches: Match[] = []
  let upcomingMatches: Match[] = MOCK_UPCOMING_MATCHES

  try {
    const liveData = await getLiveFixtures() as any
    if (liveData?.response?.length > 0) {
      liveMatches = liveData.response
        .map(mapApiFootballFixture)
        .filter((m: Match) => m.status === 'live')
    }
  } catch {}

  try {
    if (liveMatches.length === 0) {
      const upcomingData = await getUpcomingFixtures(3) as any
      if (upcomingData?.response?.length > 0) {
        upcomingMatches = upcomingData.response.map(mapApiFootballFixture)
      }
    }
  } catch {}

  const hasLive = liveMatches.length > 0
  const displayMatches = hasLive ? liveMatches : upcomingMatches

  // Tournament countdown
  const tournamentStart = new Date('2026-06-11T20:00:00Z')
  const now = new Date()
  const daysUntil = Math.max(0, Math.floor((tournamentStart.getTime() - now.getTime()) / 86400000))

  return (
    <>
      <Navbar isLive={hasLive} />
      <Ticker segments={[
        ...TICKER_SEGMENTS,
        '🏆 WC2026 starts June 11',
      ]} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 100px' }}>

        {/* Hero */}
        <section style={{ padding: '48px 0 40px', textAlign: 'center' }}
                 className="brand-texture">
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(28px, 6vw, 52px)',
            letterSpacing: -1, lineHeight: 1.05, marginBottom: 14, color: 'var(--text)',
          }}>
            THE BEAUTIFUL GAME,<br />
            <span style={{ color: 'var(--green)' }}>REIMAGINED</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 28,
            lineHeight: 1.6, maxWidth: 480, margin: '0 auto 28px' }}>
            16 AI characters. Live match rooms. Fan games. Your WC2026 in one place.
          </p>
          <div style={{ marginBottom: 40 }}>
            <Countdown />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link href="/characters" style={{
              background: 'var(--green)', color: '#fff', textDecoration: 'none',
              padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            }}>
              Meet the characters →
            </Link>
            <Link href="/live" style={{
              background: 'var(--bg-elevated)', color: 'var(--text)',
              border: '1px solid var(--border)', textDecoration: 'none',
              padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
            }}>
              Watch live →
            </Link>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Zero sign-up · 100% free · Works on mobile
          </p>
        </section>

        {/* Internet Pulse strip */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Internet pulse · right now
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { num: '14.2k', label: 'Bluesky posts · last hour', accent: 'var(--green)' },
              { num: '847',   label: 'News articles · today',    accent: 'var(--yellow-card)' },
              { num: '2.1M',  label: 'YouTube views · today',    accent: 'var(--red-card)' },
            ].map(card => (
              <div key={card.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '12px 14px',
                borderLeft: `3px solid ${card.accent}`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums', color: 'var(--text)', marginBottom: 3,
                }}>
                  {card.num}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{card.label}</div>
              </div>
            ))}
          </div>
        </section>

        <AdUnit slot="1234567890" format="auto" />

        {/* Matches */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            {hasLive ? 'Live now' : 'Upcoming matches'}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
            overflowX: 'auto',
          }}>
            {displayMatches.map(match => (
              <MatchCard key={match.id} match={match as any} showButtons />
            ))}
          </div>
        </section>

        <AdUnit slot="0987654321" format="rectangle" />

        {/* Character spotlight */}
        <section style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 20, marginBottom: 32,
          display: 'flex', gap: 16, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: '#1e3a5f',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
            color: 'rgba(255,255,255,0.85)',
          }}>
            EM
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Today&apos;s featured character
            </p>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18,
              fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
              El Maestro
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>
              Tactical Analyst · Strategy
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 12, fontSize: 11, color: 'var(--green)' }}>
              <span className="animate-live" style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--green)', display: 'inline-block',
              }} />
              Online · Ready
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6,
              fontStyle: 'italic', marginBottom: 14 }}>
              &ldquo;The 4-3-3 without a true pivot will be exposed on the counter.
              Argentina&apos;s biggest vulnerability in WC2026 is exactly the space
              De Paul leaves when he drives forward. France know exactly where to look.&rdquo;
            </p>
            <Link href="/characters/el-maestro" style={{
              background: 'var(--green)', color: '#fff', textDecoration: 'none',
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              display: 'inline-block',
            }}>
              Chat with El Maestro →
            </Link>
          </div>
        </section>

        {/* Characters grid */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Characters
            </p>
            <Link href="/characters" style={{
              fontSize: 11, color: 'var(--green)', textDecoration: 'none',
            }}>
              All 16 →
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 8,
          }}>
            {PHASE1_CHARACTERS.slice(0, 8).map(char => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </section>

        {/* Fan Games */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Fan games
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { icon: '🎯', name: 'Score Predictor', desc: 'Pick exact scorelines', href: '/games/predict' },
              { icon: '🏆', name: 'Bracket Battle',  desc: 'Full 48-team bracket',   href: '/games/bracket' },
              { icon: '🧠', name: 'Daily Trivia',    desc: '5 questions · daily',    href: '/games/trivia' },
              { icon: '🎲', name: 'Chaos Engine',    desc: 'Randomise the tournament', href: '/games/chaos' },
            ].map(game => (
              <Link key={game.href} href={game.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: 16, cursor: 'pointer',
                }} className="card-hover">
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{game.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {game.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{game.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: 40, paddingTop: 20,
          borderTop: '1px solid var(--border)',
          fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 2,
        }}>
          Unofficial fan app · Not affiliated with FIFA<br />
          KickoffTo may earn commission from affiliate links ·{' '}
          <Link href="/privacy" style={{ color: 'var(--text-3)' }}>Privacy</Link>
        </footer>

      </main>

      {/* MiniPlayer — handles own visibility/fetching */}
      <MiniPlayer />

      {/* Bottom nav (mobile) */}
      <BottomNav />
    </>
  )
}
