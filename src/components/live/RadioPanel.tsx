'use client'
import { useState, useEffect } from 'react'
import type { Match } from '@/types'

interface RadioPanelProps {
  matchId: string
  match: Match
}

const RADIO_CHARACTERS = [
  { id: 'the-voice', monogram: 'CV', color: '#7c1d2e', name: 'The Voice' },
  { id: 'el-maestro', monogram: 'EM', color: '#1e3a5f', name: 'El Maestro' },
  { id: 'ultra', monogram: 'UL', color: '#1a1a3a', name: 'Ultra' },
]

export function RadioPanel({ matchId, match }: RadioPanelProps) {
  const [commentary, setCommentary] = useState<string>(
    `Welcome to KickoffTo Radio. ${match.homeTeam.flag} ${match.homeTeam.name} take on ${match.awayTeam.flag} ${match.awayTeam.name}. The atmosphere here is electric. The commentary will begin momentarily.`
  )
  const [currentChar, setCurrentChar] = useState(RADIO_CHARACTERS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  async function fetchCommentary() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/live/${matchId}/radio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: currentChar.id,
          matchContext: {
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            score: `${match.homeScore ?? 0}-${match.awayScore ?? 0}`,
            minute: match.minute,
          },
        }),
      })
      if (!res.ok) throw new Error('Radio API failed')
      const data = await res.json()
      setCommentary(data.commentary)
    } catch {
      setCommentary(`The radio connection is momentarily interrupted. Standby — ${currentChar.name} will return.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>

      {/* Character selector */}
      <div style={{ marginBottom: 16 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
        }}>
          Choose commentator
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {RADIO_CHARACTERS.map(char => (
            <button
              key={char.id}
              onClick={() => setCurrentChar(char)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 12px',
                background: currentChar.id === char.id
                  ? 'var(--bg-elevated)' : 'transparent',
                border: `1px solid ${currentChar.id === char.id
                  ? char.color : 'var(--border)'}`,
                borderRadius: 8, cursor: 'pointer',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: char.color,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 9, color: 'rgba(255,255,255,0.85)',
              }}>
                {char.monogram}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: 'var(--text-2)',
              }}>
                {char.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Radio player card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: 16,
      }}>
        {/* Equalizer bars */}
        <div style={{
          display: 'flex', gap: 3, alignItems: 'flex-end',
          height: 28, marginBottom: 12,
        }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: 4, borderRadius: 2,
              background: isLoading ? 'var(--border)' : 'var(--green)',
              animation: isLoading
                ? 'none'
                : `eqBar 0.7s ease-in-out ${i * 0.1}s infinite alternate`,
              height: isLoading ? 3 : undefined,
              minHeight: 3,
            }} />
          ))}
          <span style={{
            fontSize: 11, color: 'var(--text-3)', marginLeft: 8,
          }}>
            {isLoading ? 'Generating...' : `${currentChar.name} · On air`}
          </span>
        </div>

        {/* Commentary text */}
        <p style={{
          fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8,
          fontStyle: 'italic', marginBottom: 14,
        }}>
          &ldquo;{commentary}&rdquo;
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={fetchCommentary}
            disabled={isLoading}
            style={{
              flex: 1, background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '9px 16px', fontSize: 12, fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Generating...' : '🎙️ Generate commentary'}
          </button>
        </div>
      </div>

      <p style={{
        fontSize: 10, color: 'var(--text-3)',
        textAlign: 'center', marginTop: 10,
      }}>
        AI-generated · refreshes on demand · voice mode coming soon
      </p>
    </div>
  )
}
