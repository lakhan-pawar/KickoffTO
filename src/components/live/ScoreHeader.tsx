'use client'
import type { Match } from '@/types'

interface ScoreHeaderProps {
  match: Match
}

export function ScoreHeader({ match }: ScoreHeaderProps) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  const scoreFontSize =
    match.intensity === 'historic' ? 56
    : match.intensity === 'big' ? 48
    : 40

  return (
    <div style={{
      background: isLive ? 'var(--green-tint)' : 'var(--bg-card)',
      borderBottom: `1px solid ${isLive ? 'rgba(22,163,74,0.3)' : 'var(--border)'}`,
      padding: '12px 16px',
      // Brand texture on header
      backgroundImage: `
        var(--brand-texture),
        ${isLive ? 'linear-gradient(transparent, transparent)' : 'none'}
      `,
    }}>

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        justifyContent: 'center', marginBottom: 10,
        fontSize: 11, fontWeight: 700,
        color: isLive ? 'var(--green)' : 'var(--text-3)',
      }}>
        {isLive && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--green)', display: 'inline-block',
            animation: 'livePulse 1.5s ease-in-out infinite',
          }} />
        )}
        {isLive
          ? `LIVE · ${match.minute}' · ${match.round}`
          : isFinished
            ? `FT · ${match.round}`
            : `UPCOMING · ${match.round}`}
      </div>

      {/* Teams + Score */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
      }}>

        {/* Home team */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4, flex: 1,
        }}>
          <span style={{ fontSize: 36 }}>{match.homeTeam.flag}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-2)',
            textAlign: 'center',
          }}>
            {match.homeTeam.shortName ?? match.homeTeam.name}
          </span>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: scoreFontSize,
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: -1.5,
            color: 'var(--text)',
            lineHeight: 1,
            // Goal ripple animation applied when new goal scored
          }}>
            {match.homeScore !== null ? match.homeScore : '–'}
            <span style={{ color: 'var(--text-3)', margin: '0 6px', fontWeight: 400 }}>
              –
            </span>
            {match.awayScore !== null ? match.awayScore : '–'}
          </div>
        </div>

        {/* Away team */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4, flex: 1,
        }}>
          <span style={{ fontSize: 36 }}>{match.awayTeam.flag}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-2)',
            textAlign: 'center',
          }}>
            {match.awayTeam.shortName ?? match.awayTeam.name}
          </span>
        </div>

      </div>

      {/* Venue */}
      <div style={{
        textAlign: 'center', fontSize: 10,
        color: 'var(--text-3)', marginTop: 8,
      }}>
        {match.venue}
      </div>

    </div>
  )
}
