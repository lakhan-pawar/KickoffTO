import { Navbar } from '@/components/ui/Navbar'
import { Ticker } from '@/components/ui/Ticker'
import { BottomNav } from '@/components/ui/BottomNav'
import { Countdown } from '@/components/ui/Countdown'
import { CharacterCard } from '@/components/ui/CharacterCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CHARACTERS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'KickoffTo — WC2026',
  description: "The internet's home for WC2026.",
}

export const revalidate = 30

const FEATURED_MATCHES = [
  {
    id: 'can-ven', homeTeam: { name: 'Canada', shortName: 'Canada', flag: '🇨🇦',
      kitColors: { home: ['#e31837'], away: ['#fff'] } },
    awayTeam: { name: 'Venezuela', shortName: 'Venezuela', flag: '🇻🇪',
      kitColors: { home: ['#cf142b'], away: ['#fff'] } },
    homeScore: null, awayScore: null, status: 'scheduled',
    round: 'Group L', venue: 'BMO Field, Toronto',
    kickoff: '2026-06-11T20:00:00Z',
  },
  {
    id: 'arg-chi', homeTeam: { name: 'Argentina', shortName: 'Argentina', flag: '🇦🇷',
      kitColors: { home: ['#75aadb'], away: ['#fff'] } },
    awayTeam: { name: 'Chile', shortName: 'Chile', flag: '🇨🇱',
      kitColors: { home: ['#d52b1e'], away: ['#fff'] } },
    homeScore: null, awayScore: null, status: 'scheduled',
    round: 'Group B', venue: 'MetLife Stadium',
    kickoff: '2026-06-13T15:00:00Z',
  },
  {
    id: 'esp-bra', homeTeam: { name: 'Spain', shortName: 'Spain', flag: '🇪🇸',
      kitColors: { home: ['#d4213d'], away: ['#ffc400'] } },
    awayTeam: { name: 'Brazil', shortName: 'Brazil', flag: '🇧🇷',
      kitColors: { home: ['#f7e03b'], away: ['#009c3b'] } },
    homeScore: null, awayScore: null, status: 'scheduled',
    round: 'Group G', venue: 'AT&T Stadium',
    kickoff: '2026-06-13T21:00:00Z',
  },
  {
    id: 'eng-can', homeTeam: { name: 'England', shortName: 'England', flag: '🏴',
      kitColors: { home: ['#cf081f'], away: ['#fff'] } },
    awayTeam: { name: 'Canada', shortName: 'Canada', flag: '🇨🇦',
      kitColors: { home: ['#e31837'], away: ['#fff'] } },
    homeScore: null, awayScore: null, status: 'scheduled',
    round: 'Group H', venue: 'Estadio Azteca',
    kickoff: '2026-06-14T18:00:00Z',
  },
]

const PULSE = [
  { value: '14.2k', label: 'Bluesky posts', icon: '🦋' },
  { value: '847',   label: 'News articles', icon: '📰' },
  { value: '2.1M',  label: 'YouTube views', icon: '▶️' },
]

const GAMES = [
  { href: '/games/predict',     emoji: '🎯', name: 'Predict',    color: '#16a34a' },
  { href: '/games/trivia',      emoji: '🧠', name: 'Trivia',     color: '#7c3aed' },
  { href: '/games/chaos',       emoji: '🎲', name: 'Chaos',      color: '#dc2626' },
  { href: '/games/dream-squad', emoji: '⚽', name: 'Dream XI',   color: '#0284c7' },
  { href: '/games/chant',       emoji: '📣', name: 'Chant',      color: '#d97706' },
  { href: '/characters/council',emoji: '⚡', name: 'Council',    color: '#9333ea' },
]

const PHASE1 = CHARACTERS.filter(c => c.phase === 1)

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Ticker segments={[
        '🏆 WC2026 · June 11 – July 19',
        '48 teams · 104 matches · CAN · MEX · USA',
        'kickoffto.com — your WC2026 home',
      ]} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 14px 72px' }}>

        {/* ── HERO countdown ─────────────────────────────── */}
        <section style={{
          padding: '20px 0 16px',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(22,163,74,0.12) 0%, transparent 70%)',
          marginBottom: 4,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--green)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 6, textAlign: 'center',
          }}>
            Tournament begins
          </div>
          <Countdown />
        </section>

        {/* ── Internet Pulse ──────────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
          }}>
            {PULSE.map(p => (
              <div key={p.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '12px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 20,
                  fontWeight: 900, color: 'var(--green)',
                  letterSpacing: -0.5, marginBottom: 2,
                }}>
                  {p.value}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Upcoming Matches (horizontal scroll) ───────── */}
        <section style={{ marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-title">Upcoming</span>
            <Link href="/schedule" className="section-more">See all →</Link>
          </div>
          <div className="h-scroll">
            {FEATURED_MATCHES.map(match => (
              <div key={match.id} style={{ width: 210 }}>
                {/* Inline match card for horizontal scroll */}
                <div style={{
                  borderRadius: 16, overflow: 'hidden',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                }}>
                  {/* Kit band */}
                  <div style={{ height: 5, display: 'flex' }}>
                    <div style={{ flex: 1, background: match.homeTeam.kitColors.home[0] }} />
                    <div style={{ flex: 1, background: match.awayTeam.kitColors.home[0] }} />
                  </div>

                  <div style={{ padding: '10px 12px' }}>
                    {/* Round */}
                    <div style={{
                      fontSize: 9, color: 'var(--text-3)', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      marginBottom: 8,
                    }}>
                      {match.round} · {match.venue.split(',')[0]}
                    </div>

                    {/* Teams */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 32 }}>{match.homeTeam.flag}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', marginTop: 3 }}>
                          {match.homeTeam.shortName}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 15,
                        fontWeight: 900, color: 'var(--text-3)',
                      }}>
                        vs
                      </div>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 32 }}>{match.awayTeam.flag}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', marginTop: 3 }}>
                          {match.awayTeam.shortName}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{
                      fontSize: 10, color: 'var(--green)', fontWeight: 600,
                      textAlign: 'center', marginBottom: 8,
                    }}>
                      {new Date(match.kickoff!).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </div>

                    {/* CTA */}
                    <Link href={`/live/${match.id}`} style={{
                      display: 'block', textAlign: 'center',
                      padding: '7px', borderRadius: 8,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      fontSize: 11, color: 'var(--text-2)',
                      textDecoration: 'none', fontWeight: 500,
                    }}>
                      Live room →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Characters (horizontal scroll) ─────────────── */}
        <section style={{ marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-title">AI Characters</span>
            <Link href="/characters" className="section-more">All 16 →</Link>
          </div>
          <div className="h-scroll">
            {PHASE1.map(char => (
              <CharacterCard key={char.id} character={char} size="md" />
            ))}
          </div>
        </section>

        {/* ── Fan Games (2×3 grid) ────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-title">Fan Games</span>
            <Link href="/games" className="section-more">See all →</Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}>
            {GAMES.map(game => (
              <Link key={game.href} href={game.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 8px',
                  textAlign: 'center',
                  transition: 'border-color 0.15s, transform 0.15s',
                  minHeight: 80,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
                >
                  <span style={{ fontSize: 26 }}>{game.emoji}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text)',
                    lineHeight: 1.2,
                  }}>
                    {game.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Quick explore ───────────────────────────────── */}
        <section style={{ marginBottom: 8 }}>
          <div className="section-header">
            <span className="section-title">Explore</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { href: '/groups', emoji: '📊', label: 'Groups', sub: '12 groups · 48 teams' },
              { href: '/history', emoji: '📜', label: 'WC History', sub: '1930 – 2026' },
              { href: '/cards', emoji: '🃏', label: 'Trading Cards', sub: 'Download PNG' },
              { href: '/director/mock-arg-fra', emoji: '🎬', label: 'Director Mode', sub: 'Match as screenplay' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: 'var(--text)',
                      marginBottom: 2,
                    }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <p style={{
          fontSize: 11, color: 'var(--text-3)', textAlign: 'center',
          padding: '16px 0',
        }}>
          Unofficial fan app · Not affiliated with FIFA ·{' '}
          <Link href="/privacy" style={{ color: 'var(--text-3)' }}>Privacy</Link>
        </p>
      </main>
      <BottomNav />
    </>
  )
}
