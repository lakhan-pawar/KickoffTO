'use client'
import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'

const COMMENTATORS = [
  { id: 'the-voice', name: 'The Voice', monogram: 'CV', color: '#7c1d2e',
    description: 'Dramatic, theatrical commentary' },
  { id: 'el-maestro', name: 'El Maestro', monogram: 'EM', color: '#1e3a5f',
    description: 'Tactical analysis as narration' },
  { id: 'ultra', name: 'Ultra', monogram: 'UL', color: '#1a1a3a',
    description: 'Passionate fan perspective' },
  { id: 'aria-9', name: 'ARIA-9', monogram: 'A9', color: '#0a0a18',
    description: 'Cold, data-driven commentary' },
]

const MOCK_MATCH = {
  homeTeam: 'Argentina', awayTeam: 'France',
  homeScore: 2, awayScore: 1, minute: 67,
}

export default function RadioPage() {
  const [selectedCommentator, setSelectedCommentator] = useState(COMMENTATORS[0])
  const [lines, setLines] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [barHeights, setBarHeights] = useState([0.3, 0.5, 0.8, 0.4, 0.6])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const eqIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const linesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    linesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    if (isPlaying) {
      eqIntervalRef.current = setInterval(() => {
        setBarHeights(prev => prev.map(() => 0.2 + Math.random() * 0.8))
      }, 150)
    } else {
      if (eqIntervalRef.current) clearInterval(eqIntervalRef.current)
      setBarHeights([0.3, 0.5, 0.4, 0.3, 0.4])
    }
    return () => { if (eqIntervalRef.current) clearInterval(eqIntervalRef.current) }
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying) {
      generateLine()
      intervalRef.current = setInterval(generateLine, 30000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, selectedCommentator.id])

  async function generateLine() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/radio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: selectedCommentator.id,
          match: MOCK_MATCH,
        }),
      })
      const data = await res.json()
      if (data.line) {
        setLines(prev => [...prev.slice(-19), data.line])
      }
    } catch {}
    setLoading(false)
  }

  function togglePlay() {
    setIsPlaying(p => !p)
    if (!isPlaying && lines.length === 0) generateLine()
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 100px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 6,
        }}>
          KICKOFFTO RADIO
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
          AI-generated live commentary. Pick your voice. New line every 30 seconds.
        </p>

        {/* Commentator selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
          {COMMENTATORS.map(c => (
            <button
              key={c.id}
              onClick={() => { setSelectedCommentator(c); setLines([]) }}
              style={{
                background: selectedCommentator.id === c.id
                  ? 'var(--bg-elevated)' : 'var(--bg-card)',
                border: `1px solid ${selectedCommentator.id === c.id
                  ? c.color : 'var(--border)'}`,
                borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: c.color,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 11, color: 'rgba(255,255,255,0.85)', flexShrink: 0,
              }}>
                {c.monogram}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Now playing card */}
        <div style={{
          background: 'var(--bg-card)', border: `1px solid ${selectedCommentator.color}`,
          borderRadius: 12, padding: 20, marginBottom: 16,
          boxShadow: `0 8px 32px ${selectedCommentator.color}11`,
        }}>
          {/* Match info */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
              🇦🇷 ARG {MOCK_MATCH.homeScore}–{MOCK_MATCH.awayScore} FRA 🇫🇷
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'var(--green)', fontWeight: 700,
            }}>
              {isPlaying ? (
                <>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
                    display: 'inline-block',
                    animation: 'livePulse 1.5s ease-in-out infinite',
                  }} />
                  LIVE · {MOCK_MATCH.minute}&apos;
                </>
              ) : (
                <span style={{ color: 'var(--text-3)' }}>⏸ Paused</span>
              )}
            </div>
          </div>

          {/* Equaliser bars */}
          <div style={{
            display: 'flex', gap: 4, alignItems: 'flex-end',
            height: 48, justifyContent: 'center', marginBottom: 20,
          }}>
            {barHeights.map((h, i) => (
              <div key={i} style={{
                width: 6, borderRadius: 3,
                background: selectedCommentator.color,
                height: `${h * 100}%`,
                transition: 'height 0.15s ease',
                opacity: isPlaying ? 1 : 0.3,
              }} />
            ))}
          </div>

          {/* Play/pause button */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
            <button 
              onClick={togglePlay} 
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: selectedCommentator.color, color: '#fff',
                border: 'none', fontSize: 24, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 16px ${selectedCommentator.color}44`,
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button 
              onClick={generateLine} 
              disabled={loading || !isPlaying} 
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--bg-elevated)', color: loading ? 'var(--text-3)' : 'var(--text)',
                border: '1px solid var(--border)', fontSize: 20, cursor: isPlaying ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: !isPlaying ? 0.5 : 1,
              }}
            >
              ⏭
            </button>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
            {isPlaying
              ? loading ? 'Synthesizing line...' : 'Auto-generating every 30s · ⏭ to skip'
              : 'Press ▶ to listen live'}
          </div>
        </div>

        {/* Commentary lines */}
        {lines.length > 0 && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 16,
            maxHeight: 380, overflowY: 'auto',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
            }}>
              Station Log
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lines.map((line, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  opacity: i === lines.length - 1 ? 1 : 0.5,
                  transform: i === lines.length - 1 ? 'scale(1)' : 'scale(0.98)',
                  transformOrigin: 'left',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5,
                    background: selectedCommentator.color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: 8, color: '#fff', marginTop: 2,
                  }}>
                    {selectedCommentator.monogram}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                    {line}
                  </p>
                </div>
              ))}
              <div ref={linesEndRef} />
            </div>
          </div>
        )}

      </main>
      <BottomNav />
      <style jsx global>{`
        @keyframes livePulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
