'use client'
import { useEffect, useState } from 'react'
import type { Team } from '@/types'

interface MomentumBarProps {
  homeTeam: Team
  awayTeam: Team
  momentum: number // 0.0 = full home, 1.0 = full away, 0.5 = even
}

export function MomentumBar({ homeTeam, awayTeam, momentum }: MomentumBarProps) {
  const [animMomentum, setAnimMomentum] = useState(0.5)

  useEffect(() => {
    // Slight delay to trigger CSS transition
    const t = setTimeout(() => setAnimMomentum(momentum), 100)
    return () => clearTimeout(t)
  }, [momentum])

  const homeColor = homeTeam.kitColors.home[0] ?? '#888888'
  const awayColor = awayTeam.kitColors.home[0] ?? '#888888'
  const homePct = Math.round((1 - animMomentum) * 100)
  const awayPct = 100 - homePct

  const dominantSide = homePct > 55
    ? `${homeTeam.flag} ${homeTeam.shortName} dominating`
    : awayPct > 55
      ? `${awayTeam.flag} ${awayTeam.shortName} dominating`
      : 'Even'

  return (
    <div style={{
      margin: '8px 16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 12px',
    }}>
      {/* Labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 6,
      }}>
        <span>{homeTeam.flag} Momentum</span>
        <span style={{ color: 'var(--text-2)', fontSize: 9 }}>{dominantSide}</span>
      </div>

      {/* Bar track */}
      <div style={{
        height: 8, borderRadius: 4,
        background: 'var(--bg-elevated)',
        overflow: 'hidden', position: 'relative',
      }}>
        {/* Home side */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${homePct}%`,
          background: homeColor,
          borderRadius: '4px 0 0 4px',
          transition: 'width 600ms cubic-bezier(0.2, 1.4, 0.4, 1)',
          opacity: 0.85,
        }} />
        {/* Away side */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: `${awayPct}%`,
          background: awayColor,
          borderRadius: '0 4px 4px 0',
          transition: 'width 600ms cubic-bezier(0.2, 1.4, 0.4, 1)',
          opacity: 0.85,
        }} />
        {/* Center divider */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0,
          width: 2, background: 'var(--bg)', transform: 'translateX(-50%)',
        }} />
      </div>

      {/* Percentages */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 10, fontWeight: 600,
        color: 'var(--text-3)', marginTop: 4,
      }}>
        <span style={{ color: homeColor }}>{homePct}%</span>
        <span style={{ color: awayColor }}>{awayPct}%</span>
      </div>
    </div>
  )
}
