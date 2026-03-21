'use client'
import { useRef, useState } from 'react'
import type { MatchEvent } from '@/types'

interface MatchDNAProps {
  events: MatchEvent[]
  homeTeam: { name: string; color: string; flag: string }
  awayTeam: { name: string; color: string; flag: string }
  duration?: number
}

const EVENT_ICONS: Record<string, string> = {
  goal:   '⚽',
  yellow: '🟡',
  red:    '🟥',
  sub:    '↕',
  var:    '📺',
}

export function MatchDNA({
  events,
  homeTeam,
  awayTeam,
  duration = 90,
}: MatchDNAProps) {
  const [tooltip, setTooltip] = useState<{
    event: MatchEvent; x: number; y: number
  } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 560
  const H = 80
  const AXIS_Y = 40
  const HALF_H = 18

  function minuteToX(minute: number): number {
    return 20 + ((Math.min(minute, duration + 5) / (duration + 5)) * (W - 40))
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10, padding: '0 16px',
      }}>
        Match DNA
      </p>

      <div style={{ position: 'relative', overflowX: 'auto', padding: '0 16px' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', minWidth: 300 }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Home half background */}
          <rect x={20} y={AXIS_Y - HALF_H} width={(W - 40) / 2}
            height={HALF_H} fill={homeTeam.color} opacity={0.15} rx={2} />

          {/* Away half background */}
          <rect x={20 + (W - 40) / 2} y={AXIS_Y - HALF_H}
            width={(W - 40) / 2} height={HALF_H}
            fill={awayTeam.color} opacity={0.15} rx={2} />

          {/* Home half lower */}
          <rect x={20} y={AXIS_Y} width={(W - 40) / 2}
            height={HALF_H} fill={homeTeam.color} opacity={0.08} rx={2} />

          {/* Away half lower */}
          <rect x={20 + (W - 40) / 2} y={AXIS_Y}
            width={(W - 40) / 2} height={HALF_H}
            fill={awayTeam.color} opacity={0.08} rx={2} />

          {/* Centre line */}
          <line x1={W / 2} y1={AXIS_Y - HALF_H - 4}
            x2={W / 2} y2={AXIS_Y + HALF_H + 4}
            stroke="var(--border)" strokeWidth={1} />

          {/* Time axis */}
          <line x1={20} y1={AXIS_Y} x2={W - 20} y2={AXIS_Y}
            stroke="var(--border)" strokeWidth={0.5} />

          {/* Minute markers */}
          {[0, 15, 30, 45, 60, 75, 90].map(m => {
            const x = minuteToX(m)
            return (
              <g key={m}>
                <line x1={x} y1={AXIS_Y - 4} x2={x} y2={AXIS_Y + 4}
                  stroke="var(--border)" strokeWidth={0.5} />
                <text x={x} y={AXIS_Y + 14} textAnchor="middle"
                  fontSize={8} fill="var(--text-3)">{m}&apos;</text>
              </g>
            )
          })}

          {/* Team labels */}
          <text x={22} y={AXIS_Y - HALF_H - 6} fontSize={9}
            fill="var(--text-3)">{homeTeam.flag} {homeTeam.name}</text>
          <text x={W - 22} y={AXIS_Y - HALF_H - 6} fontSize={9}
            textAnchor="end" fill="var(--text-3)">{awayTeam.name} {awayTeam.flag}</text>

          {/* Events */}
          {events.map((event, i) => {
            const x = minuteToX(event.minute)
            const isHome = event.team === 'home'
            const y = isHome ? AXIS_Y - HALF_H / 2 : AXIS_Y + HALF_H / 2

            return (
              <g key={i} style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect()
                  if (rect) {
                    setTooltip({ event, x: e.clientX - rect.left, y: e.clientY - rect.top })
                  }
                }}>
                <circle cx={x} cy={y} r={8} fill="var(--bg-card)"
                  stroke={event.type === 'goal' ? 'var(--green)'
                    : event.type === 'yellow' ? '#d97706'
                    : event.type === 'red' ? '#dc2626' : 'var(--border)'}
                  strokeWidth={1.5} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={9}>
                  {EVENT_ICONS[event.type]}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: Math.min(tooltip.x, 240),
            top: tooltip.y - 60,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 10px',
            fontSize: 11, color: 'var(--text)',
            pointerEvents: 'none', zIndex: 10,
            whiteSpace: 'nowrap',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              {EVENT_ICONS[tooltip.event.type]} {tooltip.event.minute}&apos; · {tooltip.event.player}
            </div>
            <div style={{ color: 'var(--text-3)' }}>
              {tooltip.event.detail ?? tooltip.event.type}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
