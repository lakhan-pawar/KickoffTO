'use client'
import type { Match } from '@/types'
import { useState } from 'react'
import { WatchLiveSheet } from '@/components/live/WatchLiveSheet'
import { CanadaWatermark, isCanadaMatch } from '@/components/ui/CanadaMatchCard'

interface MatchCardProps {
  match: Match
  variant?: 'default' | 'compact'
  showButtons?: boolean
  onPreviewClick?: (matchId: string) => void
}

export function MatchCard({ match, variant = 'default', showButtons = true, onPreviewClick }: MatchCardProps) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const [showWatchSheet, setShowWatchSheet] = useState(false)
  const matchTitle = `${match.homeTeam.flag} ${match.homeTeam.name} vs ${match.awayTeam.flag} ${match.awayTeam.name}`

  const scoreSize = match.intensity === 'historic' ? 52
    : match.intensity === 'big' ? 44 : 36

  const canadaMatch = isCanadaMatch(
    match.homeTeam.code ?? '',
    match.awayTeam.code ?? ''
  )

  function formatCountdown(kickoff: string): string {
    const diff = new Date(kickoff).getTime() - Date.now()
    if (diff <= 0) return 'Starting soon'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `In ${hours}h`
    const mins = Math.floor((diff % 3600000) / 60000)
    return `In ${mins}m`
  }

  return (
    <div 
      className={canadaMatch ? 'canada-home-match' : ''}
      data-intensity={
        match.intensity === 'historic' ? 'historic' :
        match.intensity === 'big' ? 'big' : 'normal'
      }
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: isLive ? '3px solid var(--green)' : '1px solid var(--border)',
        borderRadius: isLive ? '0 12px 12px 0' : 12,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {canadaMatch && <CanadaWatermark opacity={0.02} />}
      {/* Ghost flag */}
      <div style={{
        position: 'absolute', right: -8, top: -8,
        fontSize: 72, opacity: 0.06, lineHeight: 1,
        pointerEvents: 'none', userSelect: 'none',
      }}>
        {match.homeTeam.flag}
      </div>

      {/* Header */}
      <div style={{
        padding: '8px 12px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
      }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)',
          textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {match.round} · {match.venue.split(',')[0]}
        </span>
        {isLive ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)',
            display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="animate-live" style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--green)', display: 'inline-block',
            }} />
            {match.minute}&apos;
          </span>
        ) : (
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
            {isFinished ? 'FT' : formatCountdown(match.kickoff)}
          </span>
        )}
      </div>

      {/* Teams + Scores */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { team: match.homeTeam, score: match.homeScore },
          { team: match.awayTeam, score: match.awayScore },
        ].map(({ team, score }) => (
          <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, width: 20, flexShrink: 0 }}>{team.flag}</span>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: 'var(--text)' }}>
              {team.name}
            </span>
            <span style={{
              fontSize: scoreSize, fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: score !== null ? 'var(--text)' : 'var(--border-hover)',
              minWidth: 20, textAlign: 'right',
            }}>
              {score !== null ? score : '–'}
            </span>
          </div>
        ))}
      </div>

      {/* Kit strip */}
      <div style={{ display: 'flex', gap: 3, padding: '0 12px 8px' }}>
        {match.homeTeam.kitColors.home.map((color, i) => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: color, opacity: 0.8 }} />
        ))}
        <div style={{ width: 8, flexShrink: 0 }} />
        {match.awayTeam.kitColors.home.map((color, i) => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: color, opacity: 0.8 }} />
        ))}
      </div>

      {/* Buttons */}
      {showButtons && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 6,
        }}>
          {isLive ? (
            <button
              onClick={() => setShowWatchSheet(true)}
              style={{
                flex: 1, background: 'var(--green)', color: '#fff', border: 'none',
                borderRadius: 7, padding: '6px 10px', fontSize: 10, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Watch live →
            </button>
          ) : (
            <button onClick={() => onPreviewClick?.(match.id)} style={{
              flex: 1, background: 'var(--bg-elevated)', color: 'var(--text-3)',
              border: '1px solid var(--border)', borderRadius: 7,
              padding: '6px 10px', fontSize: 10, cursor: 'pointer',
            }}>
              Preview
            </button>
          )}
          <button style={{
            background: 'var(--bg-elevated)', color: 'var(--text-3)',
            border: '1px solid var(--border)', borderRadius: 7,
            padding: '6px 10px', fontSize: 10, cursor: 'pointer',
          }}>
            Predict
          </button>
        </div>
      )}
      <WatchLiveSheet
        isOpen={showWatchSheet}
        onClose={() => setShowWatchSheet(false)}
        matchTitle={matchTitle}
      />
    </div>
  )
}
