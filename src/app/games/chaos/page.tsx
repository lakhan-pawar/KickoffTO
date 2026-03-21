'use client'
import { useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

const TEAMS = [
  { name: 'Argentina', flag: '🇦🇷' }, { name: 'France', flag: '🇫🇷' },
  { name: 'Brazil', flag: '🇧🇷' }, { name: 'England', flag: '🏴' },
  { name: 'Spain', flag: '🇪🇸' }, { name: 'Germany', flag: '🇩🇪' },
  { name: 'Portugal', flag: '🇵🇹' }, { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Canada', flag: '🇨🇦' }, { name: 'USA', flag: '🇺🇸' },
  { name: 'Mexico', flag: '🇲🇽' }, { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Japan', flag: '🇯🇵' }, { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Croatia', flag: '🇭🇷' }, { name: 'Uruguay', flag: '🇺🇾' },
]

function randomScore(): [number, number] {
  const r = Math.random()
  if (r < 0.15) return [0, 0]
  if (r < 0.3) return [1, 0]
  if (r < 0.45) return [0, 1]
  if (r < 0.55) return [1, 1]
  if (r < 0.65) return [2, 1]
  if (r < 0.75) return [1, 2]
  if (r < 0.82) return [2, 0]
  if (r < 0.89) return [0, 2]
  if (r < 0.93) return [3, 1]
  if (r < 0.97) return [2, 2]
  return [4, 0]
}

export default function ChaosPage() {
  const [results, setResults] = useState<Array<{
    home: typeof TEAMS[0], away: typeof TEAMS[0],
    homeScore: number, awayScore: number
  }>>([])
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  function runChaos() {
    const shuffled = [...TEAMS].sort(() => Math.random() - 0.5)
    const matches = []
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const [hs, as] = randomScore()
      matches.push({
        home: shuffled[i], away: shuffled[i + 1],
        homeScore: hs, awayScore: as,
      })
    }
    setResults(matches)
    setNarrative('')
    setGenerated(false)
  }

  async function generateNarrative() {
    if (results.length === 0) return
    setLoading(true)

    const matchSummary = results
      .map(m => `${m.home.name} ${m.homeScore}–${m.awayScore} ${m.away.name}`)
      .join(', ')

    const winner = results.reduce((best, match) => {
      const w = match.homeScore > match.awayScore ? match.home
        : match.awayScore > match.homeScore ? match.away : match.home
      return w
    }, results[0]?.home)

    try {
      const res = await fetch('/api/games/chaos-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: matchSummary, winner: winner?.name }),
      })
      const data = await res.json()
      setNarrative(data.narrative ?? 'The chaos has unfolded in ways no one predicted.')
      setGenerated(true)
    } catch {
      setNarrative('The chaos engine has spoken. The results were too shocking to narrate.')
      setGenerated(true)
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 100px' }}>
        <Link href="/games" style={{
          fontSize: 12, color: 'var(--green)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
        }}>
          ← Games
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 6 }}>
          CHAOS ENGINE
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
          Randomise WC2026. Groq writes the alternate history. Every run is different.
        </p>

        <button onClick={runChaos} style={{
          width: '100%', background: 'var(--green)', color: '#fff',
          border: 'none', borderRadius: 10, padding: '14px 20px',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 20,
        }}>
          🎲 Randomise the tournament
        </button>

        {results.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {results.map((match, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 14 }}>{match.home.flag}</span>
                  <span style={{ fontSize: 12, flex: 1, color: 'var(--text)' }}>{match.home.name}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums', color: 'var(--text)',
                    minWidth: 48, textAlign: 'center',
                  }}>
                    {match.homeScore}–{match.awayScore}
                  </span>
                  <span style={{ fontSize: 12, flex: 1, textAlign: 'right', color: 'var(--text)' }}>{match.away.name}</span>
                  <span style={{ fontSize: 14 }}>{match.away.flag}</span>
                </div>
              ))}
            </div>

            {!generated && (
              <button onClick={generateNarrative} disabled={loading} style={{
                width: '100%', background: loading ? 'var(--bg-elevated)' : 'var(--bg-card)',
                color: loading ? 'var(--text-3)' : 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 20px', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 12,
              }}>
                {loading ? 'Groq is writing the alternate history...' : '✍️ Generate AI narrative →'}
              </button>
            )}

            {narrative && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid #2a1a3a',
                borderRadius: '0 12px 12px 0',
                padding: 16, marginBottom: 12,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  MV · The Multiverse · Alternate timeline
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8,
                  fontStyle: 'italic', margin: 0 }}>
                  {narrative}
                </p>
              </div>
            )}

            <button onClick={runChaos} style={{
              width: '100%', background: 'var(--bg-elevated)',
              color: 'var(--text-2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 20px', fontSize: 13,
              cursor: 'pointer',
            }}>
              🔄 Randomise again
            </button>
          </>
        )}
      </main>
      <BottomNav />
    </>
  )
}
