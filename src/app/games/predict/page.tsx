'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

const MATCHES = [
  { id: 'arg-fra', home: { name: 'Argentina', flag: '🇦🇷' }, away: { name: 'France', flag: '🇫🇷' }, round: 'Group A' },
  { id: 'bra-esp', home: { name: 'Brazil', flag: '🇧🇷' }, away: { name: 'Spain', flag: '🇪🇸' }, round: 'Group C' },
  { id: 'can-tbd', home: { name: 'Canada', flag: '🇨🇦' }, away: { name: 'Morocco', flag: '🇲🇦' }, round: 'Group B' },
  { id: 'eng-ger', home: { name: 'England', flag: '🏴' }, away: { name: 'Germany', flag: '🇩🇪' }, round: 'Group D' },
  { id: 'por-ned', home: { name: 'Portugal', flag: '🇵🇹' }, away: { name: 'Netherlands', flag: '🇳🇱' }, round: 'Group E' },
]

interface Prediction {
  homeScore: number
  awayScore: number
}

export default function PredictPage() {
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('kt-predictions')
    if (stored) setPredictions(JSON.parse(stored))
  }, [])

  function updatePrediction(matchId: string, side: 'homeScore' | 'awayScore', value: number) {
    const updated = {
      ...predictions,
      [matchId]: {
        ...predictions[matchId],
        homeScore: predictions[matchId]?.homeScore ?? 0,
        awayScore: predictions[matchId]?.awayScore ?? 0,
        [side]: Math.max(0, Math.min(20, value)),
      },
    }
    setPredictions(updated)
  }

  function savePredictions() {
    localStorage.setItem('kt-predictions', JSON.stringify(predictions))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 100px' }}>
        <Link href="/games" style={{
          fontSize: 12, color: 'var(--green)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
        }}>
          ← Games
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28,
          letterSpacing: -0.5, color: 'var(--text)', marginBottom: 6,
        }}>
          SCORE PREDICTOR
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
          Predict exact scorelines. Saves to your device — no account needed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {MATCHES.map(match => {
            const pred = predictions[match.id]
            return (
              <div key={match.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  {match.round}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Home team */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 20 }}>{match.home.flag}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                      {match.home.name}
                    </span>
                  </div>

                  {/* Score inputs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number" min="0" max="20"
                      value={pred?.homeScore ?? ''}
                      onChange={e => updatePrediction(match.id, 'homeScore', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      style={{
                        width: 52, height: 48, textAlign: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 24,
                        fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)', borderRadius: 8,
                        color: 'var(--text)', outline: 'none',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--green)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                    />
                    <span style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 700 }}>–</span>
                    <input
                      type="number" min="0" max="20"
                      value={pred?.awayScore ?? ''}
                      onChange={e => updatePrediction(match.id, 'awayScore', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      style={{
                        width: 52, height: 48, textAlign: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 24,
                        fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)', borderRadius: 8,
                        color: 'var(--text)', outline: 'none',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--green)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                    />
                  </div>

                  {/* Away team */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                      {match.away.name}
                    </span>
                    <span style={{ fontSize: 20 }}>{match.away.flag}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={savePredictions}
          style={{
            width: '100%', background: saved ? 'var(--bg-elevated)' : 'var(--green)',
            color: saved ? 'var(--green)' : '#fff',
            border: `1px solid ${saved ? 'var(--green)' : 'transparent'}`,
            borderRadius: 10, padding: '12px 20px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {saved ? '✓ Predictions saved!' : 'Save predictions →'}
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 8 }}>
          Saved to your device · No account needed
        </p>
      </main>
      <BottomNav />
    </>
  )
}
