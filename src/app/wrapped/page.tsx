'use client'
import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'

interface WrappedStats {
  charactersChattedWith: string[]
  totalMessages: number
  predictionsSubmitted: number
  triviaScore: number
  triviaPlayed: number
  journalEntries: number
  chaosRuns: number
  topCharacter: string
  directorGenres: string[]
  whatIfScenarios: number
}

function getLocalStats(): WrappedStats {
  if (typeof window === 'undefined') return {
    charactersChattedWith: [], totalMessages: 0, predictionsSubmitted: 0,
    triviaScore: 0, triviaPlayed: 0, journalEntries: 0, chaosRuns: 0,
    topCharacter: '', directorGenres: [], whatIfScenarios: 0
  }

  const predictions = JSON.parse(localStorage.getItem('kt-predictions') ?? '{}')
  const journal = JSON.parse(localStorage.getItem('kt-journal') ?? '[]')

  // Count trivia plays across all days
  let triviaPlayed = 0
  let triviaScore = 0
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('kt-trivia-')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) ?? '{}')
        if (data.submitted) {
          triviaPlayed++
          // Count correct answers
          if (data.questions && data.answers) {
            data.questions.forEach((q: any, i: number) => {
              if (data.answers[i] === q.correct) triviaScore++
            })
          }
        }
      } catch (e) {}
    }
  })

  return {
    charactersChattedWith: ['El Maestro', 'The Voice'], // Mock for now or pull from chat history if stored
    totalMessages: 0,
    predictionsSubmitted: Object.keys(predictions).length,
    triviaScore,
    triviaPlayed,
    journalEntries: journal.length,
    chaosRuns: 0,
    topCharacter: 'El Maestro',
    directorGenres: [],
    whatIfScenarios: 0,
  }
}

export default function WrappedPage() {
  const [stats, setStats] = useState<WrappedStats | null>(null)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setStats(getLocalStats())
  }, [])

  async function generateNarrative() {
    if (!stats) return
    setLoading(true)
    try {
      const res = await fetch('/api/wrapped/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      })
      const data = await res.json()
      setNarrative(data.narrative ?? '')
    } catch {
      setNarrative('Your WC2026 journey has been unique. The stats tell only part of the story.')
    }
    setLoading(false)
  }

  function generateShareCard() {
    const canvas = canvasRef.current
    if (!canvas || !stats) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1920)
    grad.addColorStop(0, '#0a0a0a')
    grad.addColorStop(1, '#0d2010')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1920)

    // Green accent line
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(80, 200, 6, 200)

    // KickoffTo branding
    ctx.fillStyle = '#16a34a'
    ctx.font = 'bold 36px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('KickoffTo', 110, 260)
    ctx.fillStyle = '#5a5a5a'
    ctx.font = '28px system-ui'
    ctx.fillText('WC2026', 110, 306)

    // Big headline
    ctx.fillStyle = '#f5f5f5'
    ctx.font = 'bold 120px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('WC2026', 540, 560)
    ctx.fillStyle = '#16a34a'
    ctx.font = 'bold 80px system-ui'
    ctx.fillText('WRAPPED', 540, 660)

    // Stats
    const statItems = [
      { value: stats.triviaPlayed, label: 'trivia games played' },
      { value: stats.predictionsSubmitted, label: 'predictions made' },
      { value: stats.journalEntries, label: 'journal entries' },
      { value: stats.triviaScore, label: `correct trivia answers` },
    ]

    statItems.forEach((item, i) => {
      const y = 820 + i * 220
      ctx.fillStyle = '#16a34a'
      ctx.font = 'bold 100px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(String(item.value), 540, y)
      ctx.fillStyle = '#a0a0a0'
      ctx.font = '36px system-ui'
      ctx.fillText(item.label, 540, y + 50)
    })

    // URL watermark
    ctx.fillStyle = '#3a3a3a'
    ctx.font = '28px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('kickoffto.com', 540, 1860)

    // Download
    const link = document.createElement('a')
    link.download = 'kickoffto-wc2026-wrapped.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!stats) return null

  const daysUntilTournament = Math.max(0, Math.floor(
    (new Date('2026-06-11').getTime() - Date.now()) / 86400000
  ))
  const preTournament = daysUntilTournament > 0

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 100px' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0d2010 100%)',
          border: '1px solid var(--border)',
          borderRadius: 16, padding: '28px 24px', marginBottom: 20,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 100%, rgba(22,163,74,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--green)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
          }}>
            KickoffTo
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 48, letterSpacing: -1, color: 'var(--text)',
            lineHeight: 1, marginBottom: 4,
          }}>
            WC2026
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 32, letterSpacing: -0.5, color: 'var(--green)',
            marginBottom: 12,
          }}>
            WRAPPED
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {preTournament
              ? `${daysUntilTournament} days until the tournament · your pre-tournament activity`
              : 'Your WC2026 journey so far'}
          </p>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: 20,
        }}>
          {[
            {
              value: stats.triviaPlayed,
              label: 'Trivia games played',
              context: stats.triviaScore > 0
                ? `${stats.triviaScore} correct answers`
                : 'Start playing →',
              href: '/games/trivia',
            },
            {
              value: stats.predictionsSubmitted,
              label: 'Predictions made',
              context: 'Score predictor',
              href: '/games/predict',
            },
            {
              value: stats.journalEntries,
              label: 'Journal entries',
              context: 'Personal scrapbook',
              href: '/journal',
            },
            {
              value: preTournament ? daysUntilTournament : 0,
              label: preTournament ? 'Days until kickoff' : 'Tournament active',
              context: 'June 11 · Estadio Azteca',
              href: '/live',
            },
          ].map(stat => (
            <a key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 16,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 48,
                  fontWeight: 900, color: 'var(--text)',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 2 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {stat.context}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* AI narrative */}
        {narrative ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--green)',
            borderRadius: 12, padding: 20, marginBottom: 16,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'var(--green)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
            }}>
              Your WC2026 story
            </p>
            <p style={{
              fontSize: 14, color: 'var(--text)', lineHeight: 1.75,
              fontStyle: 'italic', margin: 0,
            }}>
              {narrative}
            </p>
          </div>
        ) : (
          <button
            onClick={generateNarrative}
            disabled={loading}
            style={{
              width: '100%', background: loading ? 'var(--bg-elevated)' : 'var(--green)',
              color: loading ? 'var(--text-3)' : '#fff',
              border: 'none', borderRadius: 12, padding: '14px 20px',
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
            }}
          >
            {loading ? 'Generating your WC2026 story...' : '✨ Generate my WC2026 story →'}
          </button>
        )}

        {/* Share card */}
        <button onClick={generateShareCard} style={{
          width: '100%', background: 'var(--bg-elevated)',
          border: '1px solid var(--border)', borderRadius: 12,
          padding: '12px 20px', fontSize: 13, fontWeight: 600,
          color: 'var(--text-2)', cursor: 'pointer', marginBottom: 16,
        }}>
          📱 Download 9:16 share card (Stories / Reels / TikTok)
        </button>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Activity links */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
          }}>
            Add more to your Wrapped
          </p>
          {[
            { href: '/games/trivia', label: 'Play daily trivia', icon: '🧠' },
            { href: '/games/predict', label: 'Make predictions', icon: '🎯' },
            { href: '/history', label: 'Explore the archive', icon: '📓' },
            { href: '/characters', label: 'Chat with characters', icon: '🎭' },
            { href: '/games/chaos', label: 'Explore chaos engine', icon: '🎲' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0', textDecoration: 'none',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--green)' }}>→</span>
            </a>
          ))}
        </div>

      </main>
      <BottomNav />
    </>
  )
}
