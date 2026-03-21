import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { Ticker } from '@/components/ui/Ticker'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fan Games — KickoffTo',
  description: 'Score predictor, bracket battle, daily trivia and chaos engine.',
}

const GAMES = [
  {
    href: '/games/predict',
    icon: '🎯',
    name: 'Score Predictor',
    desc: 'Pick exact scorelines for every match. Earn points for correct predictions.',
    cta: 'Start predicting →',
    available: true,
  },
  {
    href: '/games/bracket',
    icon: '🏆',
    name: 'Bracket Battle',
    desc: 'Build your full 48-team bracket. Compare with the global leaderboard.',
    cta: 'Build bracket →',
    available: true,
  },
  {
    href: '/games/trivia',
    icon: '🧠',
    name: 'Daily Trivia',
    desc: '5 new questions every day. WC history, tactics, and player knowledge.',
    cta: 'Play today\'s trivia →',
    available: true,
  },
  {
    href: '/games/chaos',
    icon: '🎲',
    name: 'Chaos Engine',
    desc: 'Randomise the entire tournament. AI writes the alternate history.',
    cta: 'Unleash chaos →',
    available: true,
  },
]

export default function GamesPage() {
  return (
    <>
      <Navbar />
      <Ticker segments={[
        '🎮 Fan games · WC2026 · KickoffTo',
        'Score predictor · Bracket battle · Daily trivia · Chaos engine',
      ]} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 100px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(24px, 4vw, 40px)',
          letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
        }}>
          FAN GAMES
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32 }}>
          Zero sign-up. Everything saves locally. All free.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14,
        }}>
          {GAMES.map(game => (
            <Link key={game.href} href={game.href} style={{ textDecoration: 'none' }}>
              <div className="card-hover" style={{
                background: 'var(--bg-card)',
                border: `1px solid ${game.available ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: 12, padding: 20, height: '100%',
                display: 'flex', flexDirection: 'column',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{game.icon}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 16,
                  fontWeight: 700, color: 'var(--text)', marginBottom: 8,
                }}>
                  {game.name}
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--text-2)',
                  lineHeight: 1.6, marginBottom: 16, flex: 1,
                }}>
                  {game.desc}
                </div>
                <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                  {game.cta}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
      <BottomNav />
    </>
  )
}
