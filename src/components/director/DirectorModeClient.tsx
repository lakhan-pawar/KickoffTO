'use client'
import { useState } from 'react'

const GENRES = [
  { id: 'horror',  emoji: '🎃', name: 'Horror',  desc: 'A nightmare unfolding in 90 minutes', tint: 'rgba(220,38,38,0.04)' },
  { id: 'romance', emoji: '💕', name: 'Romance', desc: 'Love in the beautiful game', tint: 'rgba(244,63,94,0.04)' },
  { id: 'heist',   emoji: '💰', name: 'Heist',   desc: 'The perfect footballing robbery', tint: 'rgba(217,119,6,0.04)' },
  { id: 'scifi',   emoji: '🚀', name: 'Sci-Fi',  desc: 'Football in the far future', tint: 'rgba(37,99,235,0.04)' },
  { id: 'western', emoji: '🤠', name: 'Western', desc: 'A duel at high noon', tint: 'rgba(180,83,9,0.04)' },
  { id: 'comedy',  emoji: '😂', name: 'Comedy',  desc: 'When football gets absurd', tint: 'rgba(22,163,74,0.04)' },
]

interface MatchData {
  id: string
  homeTeam: { name: string; flag: string; code: string }
  awayTeam: { name: string; flag: string; code: string }
  homeScore: number
  awayScore: number
  status: string
  round: string
  venue: string
  events: Array<{
    minute: number
    type: string
    team: string
    player: string
    detail: string
  }>
}

interface DirectorModeClientProps {
  match: MatchData
  initialGenre: string | null
}

export function DirectorModeClient({ match, initialGenre }: DirectorModeClientProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(initialGenre)
  const [script, setScript] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function generateScript(genreId: string) {
    setSelectedGenre(genreId)
    setLoading(true)
    setError('')
    setScript('')

    try {
      const res = await fetch(`/api/director/${match.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: genreId,
          match: {
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            venue: match.venue,
            events: match.events,
          },
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      setScript(data.script ?? 'No script generated.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to generate script: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  function shareScript() {
    const url = `${window.location.origin}/director/${match.id}?genre=${selectedGenre}`
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const activeGenre = GENRES.find(g => g.id === selectedGenre)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: 'var(--green)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
        }}>
          Hollywood Director Mode
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(22px, 4vw, 36px)',
          letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
          lineHeight: 1.1,
        }}>
          {match.homeTeam.flag} {match.homeTeam.name} {match.homeScore}–{match.awayScore} {match.awayTeam.name} {match.awayTeam.flag}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          {match.round} · {match.venue} · Pick a genre to retell this match as a screenplay
        </p>
      </div>

      {/* Genre selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 8, marginBottom: 24,
      }}>
        {GENRES.map(genre => (
          <button
            key={genre.id}
            onClick={() => generateScript(genre.id)}
            disabled={loading}
            style={{
              background: selectedGenre === genre.id
                ? 'var(--bg-elevated)' : 'var(--bg-card)',
              border: `1px solid ${selectedGenre === genre.id
                ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 12, padding: '12px 10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'center', opacity: loading ? 0.6 : 1,
              transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--green)'
            }}
            onMouseLeave={e => {
              if (selectedGenre !== genre.id)
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 5 }}>{genre.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              {genre.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.3 }}>
              {genre.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '32px 20px', textAlign: 'center',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{activeGenre?.emoji}</div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
            Writing the {activeGenre?.name} screenplay...
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Groq is adapting {match.events.length} match events
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          fontSize: 13, color: 'var(--red-card)',
        }}>
          {error}
        </div>
      )}

      {/* Script output */}
      {script && !loading && (
        <div style={{
          background: activeGenre ? activeGenre.tint : 'transparent',
        }}>
          {/* Script header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 12,
          }}>
            <div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {activeGenre?.emoji} {activeGenre?.name} · KickoffTo Director Mode
              </span>
            </div>
            <button onClick={shareScript} style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`,
              color: copied ? 'var(--green)' : 'var(--text-3)',
              borderRadius: 8, padding: '6px 12px', fontSize: 11,
              fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {copied ? '✓ Link copied!' : '🔗 Share script'}
            </button>
          </div>

          {/* Screenplay */}
          <div style={{
            background: '#0d0d0d',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '24px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: 13, lineHeight: 1.8,
            color: '#e0e0e0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {script}
          </div>

          {/* Try another genre */}
          <div style={{
            display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap',
          }}>
            {GENRES.filter(g => g.id !== selectedGenre).slice(0, 3).map(g => (
              <button
                key={g.id}
                onClick={() => generateScript(g.id)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 12px',
                  fontSize: 11, color: 'var(--text-2)',
                  cursor: 'pointer',
                }}
              >
                {g.emoji} Try as {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Match events summary */}
      {!script && !loading && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
          }}>
            Match events · the raw material
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {match.events.map((event, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                fontSize: 12, color: 'var(--text-2)',
              }}>
                <span style={{
                  fontSize: 10, fontVariantNumeric: 'tabular-nums',
                  color: 'var(--text-3)', minWidth: 28,
                }}>
                  {event.minute}&apos;
                </span>
                <span style={{ fontSize: 14 }}>
                  {event.type === 'goal' ? '⚽'
                    : event.type === 'yellow' ? '🟡'
                    : event.type === 'red' ? '🟥' : '↕'}
                </span>
                <span style={{ flex: 1 }}>
                  {event.player}
                  <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>
                    · {event.team}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: 11, color: 'var(--text-3)', marginTop: 14,
            fontStyle: 'italic',
          }}>
            Pick a genre above — Groq will turn these events into a screenplay
          </p>
        </div>
      )}
    </div>
  )
}
