'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatMatchTime } from '@/lib/timezone'

interface TeamInfo {
  name: string; shortName?: string; flag: string
  code?: string; kitColors?: { home: string[]; away: string[] }
}
interface MatchCardProps {
  match: {
    id: string; homeTeam: TeamInfo; awayTeam: TeamInfo
    homeScore: number | null; awayScore: number | null
    status: string; minute?: number | null
    round: string; venue: string; kickoff?: string
    intensity?: string
  }
}

function timeUntil(kickoff?: string): string {
  if (!kickoff) return ''
  const diff = new Date(kickoff).getTime() - Date.now()
  if (diff < 0) return ''
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  if (d > 0) return `In ${d}d`
  if (h > 0) return `In ${h}h`
  return 'Soon'
}

export function MatchCard({ match }: MatchCardProps) {
  const [showWatch, setShowWatch] = useState(false)
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const homeKit = match.homeTeam.kitColors?.home[0] ?? '#888'
  const awayKit = match.awayTeam.kitColors?.home[0] ?? '#555'
  const countdown = timeUntil(match.kickoff)
  const timeInfo = match.kickoff ? formatMatchTime(match.kickoff) : null

  return (
    <div style={{
      position: 'relative', borderRadius: 16, overflow: 'hidden',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      minWidth: 200, transition: 'transform 0.15s, box-shadow 0.15s'
    }}
    data-intensity={match.intensity ?? 'normal'}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement
      el.style.transform = 'translateY(-3px)'
      el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement
      el.style.transform = 'none'
      el.style.boxShadow = 'none'
    }}>

      {/* Kit colour band — THICK and vivid */}
      <div style={{ height: 6, display: 'flex' }}>
        <div style={{ flex: 1, background: homeKit }} />
        <div style={{ flex: 1, background: awayKit }} />
      </div>

      {/* Background flag blur — home left, away right */}
      <div style={{
        position: 'absolute', inset: '6px 0 0 0', display: 'flex',
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80, opacity: 0.07, filter: 'blur(4px)',
          transform: 'scale(1.2)',
        }}>
          {match.homeTeam.flag}
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80, opacity: 0.07, filter: 'blur(4px)',
          transform: 'scale(1.2)',
        }}>
          {match.awayTeam.flag}
        </div>
      </div>

      <div style={{ padding: '10px 14px 12px', position: 'relative' }}>
        {/* Round + status */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 10,
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
            {match.round}
          </span>
          {isLive ? (
            <span className="match-badge live">
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: '#f87171',
                animation: 'livePulse 1.2s ease-in-out infinite',
                display: 'inline-block',
              }} />
              {match.minute}&apos; LIVE
            </span>
          ) : isFinished ? (
            <span className="match-badge finished">FT</span>
          ) : timeInfo ? (
            <span className="match-badge upcoming">{timeInfo.relative}</span>
          ) : null}
        </div>

        {/* Teams + Score */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 8, marginBottom: 12,
        }}>
          {/* Home */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 4 }}>
              {match.homeTeam.flag}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {match.homeTeam.shortName ?? match.homeTeam.name.slice(0, 10)}
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            {(isLive || isFinished) ? (
              <div className="score-display match-score" style={{ fontSize: 32, color: 'var(--text)' }}>
                {match.homeScore ?? 0} – {match.awayScore ?? 0}
              </div>
            ) : (
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 18,
                fontWeight: 800, color: 'var(--text-3)',
              }}>
                vs
              </div>
            )}
          </div>

          {/* Away */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 4 }}>
              {match.awayTeam.flag}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {match.awayTeam.shortName ?? match.awayTeam.name.slice(0, 10)}
            </div>
          </div>
        </div>

        {/* Timezone Time */}
        {timeInfo && match.status === 'scheduled' && (
          <div style={{
            fontSize: 11, color: 'var(--text-3)',
            textAlign: 'center', marginBottom: 8,
          }}>
            {timeInfo.full}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/preview/${match.id}`} style={{
            flex: 1, textAlign: 'center', padding: '7px 6px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 11, color: 'var(--text-2)',
            textDecoration: 'none', fontWeight: 500,
          }}>
            Preview
          </Link>
          <Link href={`/live/${match.id}`} style={{
            flex: 1, textAlign: 'center', padding: '7px 6px',
            background: isLive ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'var(--bg-elevated)',
            border: `1px solid ${isLive ? 'transparent' : 'var(--border)'}`,
            borderRadius: 8, fontSize: 11,
            color: isLive ? '#fff' : 'var(--text-2)',
            textDecoration: 'none', fontWeight: isLive ? 700 : 500,
            boxShadow: isLive ? '0 2px 12px rgba(22,163,74,0.4)' : 'none',
          }}>
            {isLive ? '⚡ Live' : 'Live room'}
          </Link>
        </div>
      </div>
    </div>
  )
}
