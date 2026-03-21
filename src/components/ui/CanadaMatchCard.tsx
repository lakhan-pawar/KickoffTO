'use client'

// Maple leaf SVG path (simplified)
const MAPLE_LEAF_PATH = `M 50,5
  L 60,25 L 80,20 L 70,35 L 85,40
  L 70,45 L 75,65 L 55,55 L 50,75
  L 45,55 L 25,65 L 30,45 L 15,40
  L 30,35 L 20,20 L 40,25 Z`

interface CanadaWatermarkProps {
  opacity?: number
}

export function CanadaWatermark({ opacity = 0.02 }: CanadaWatermarkProps) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', borderRadius: 'inherit',
    }}>
      <svg
        viewBox="0 0 100 80"
        style={{
          position: 'absolute', right: -10, top: -10,
          width: 120, height: 96, opacity,
        }}
      >
        <path d={MAPLE_LEAF_PATH} fill="#e31837" />
      </svg>
    </div>
  )
}

export function isCanadaMatch(homeTeamCode: string, awayTeamCode: string): boolean {
  return homeTeamCode === 'CAN' || awayTeamCode === 'CAN'
}
