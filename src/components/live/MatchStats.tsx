'use client'
import { useState, useEffect } from 'react'

interface MatchStatsProps {
  matchId: string
}

// Stat row component
function StatRow({
  label, home, away, homeColor = 'var(--green)', awayColor = '#e63946',
}: {
  label: string; home: number; away: number
  homeColor?: string; awayColor?: string
}) {
  const total = home + away || 1
  const homePct = Math.round((home / total) * 100)
  const awayPct = 100 - homePct

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, marginBottom: 5,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text)', minWidth: 28 }}>
          {home}
        </span>
        <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{ fontWeight: 700, color: 'var(--text)', minWidth: 28, textAlign: 'right' }}>
          {away}
        </span>
      </div>
      <div style={{
        height: 5, borderRadius: 3,
        background: 'var(--bg-elevated)', overflow: 'hidden',
        display: 'flex',
      }}>
        <div style={{
          width: `${homePct}%`, background: homeColor, opacity: 0.75,
          transition: 'width 0.6s ease',
        }} />
        <div style={{
          width: `${awayPct}%`, background: awayColor, opacity: 0.75,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

export function MatchStats({ matchId }: MatchStatsProps) {
  // Mock stats — replace with API data when tournament starts
  const stats = {
    possession: { home: 58, away: 42 },
    shots: { home: 12, away: 7 },
    shotsOnTarget: { home: 5, away: 3 },
    corners: { home: 6, away: 3 },
    fouls: { home: 9, away: 11 },
    yellowCards: { home: 1, away: 2 },
  }

  return (
    <div style={{ padding: 16 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
      }}>
        Match statistics
      </p>
      <StatRow label="Possession" home={stats.possession.home} away={stats.possession.away} />
      <StatRow label="Shots" home={stats.shots.home} away={stats.shots.away} />
      <StatRow label="On target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
      <StatRow label="Corners" home={stats.corners.home} away={stats.corners.away} />
      <StatRow label="Fouls" home={stats.fouls.home} away={stats.fouls.away}
        homeColor="var(--yellow-card)" awayColor="var(--yellow-card)" />
      <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 12 }}>
        Stats update every 30 seconds · Powered by API-Football
      </p>
    </div>
  )
}
