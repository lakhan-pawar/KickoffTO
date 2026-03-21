'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'

// Country positions on a simplified world map (x%, y% of SVG viewport)
const COUNTRY_NODES = [
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷', x: 32, y: 78, mentions: 0 },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', x: 34, y: 72, mentions: 0 },
  { code: 'FRA', name: 'France', flag: '🇫🇷', x: 49, y: 32, mentions: 0 },
  { code: 'ENG', name: 'England', flag: '🏴', x: 48, y: 28, mentions: 0 },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸', x: 47, y: 35, mentions: 0 },
  { code: 'GER', name: 'Germany', flag: '🇩🇪', x: 51, y: 30, mentions: 0 },
  { code: 'USA', name: 'USA', flag: '🇺🇸', x: 22, y: 38, mentions: 0 },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦', x: 20, y: 28, mentions: 0 },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽', x: 20, y: 44, mentions: 0 },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵', x: 80, y: 36, mentions: 0 },
  { code: 'KOR', name: 'South Korea', flag: '🇰🇷', x: 78, y: 34, mentions: 0 },
  { code: 'MAR', name: 'Morocco', flag: '🇲🇦', x: 48, y: 40, mentions: 0 },
  { code: 'SAU', name: 'Saudi Arabia', flag: '🇸🇦', x: 60, y: 42, mentions: 0 },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺', x: 78, y: 68, mentions: 0 },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱', x: 50, y: 29, mentions: 0 },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹', x: 45, y: 35, mentions: 0 },
]

function generateMockMentions() {
  const base = [8500, 7200, 6800, 5400, 4900, 4100, 9200, 3800, 4500,
    3200, 2800, 3600, 2100, 1800, 3400, 3100]
  return COUNTRY_NODES.map((c, i) => ({
    ...c,
    mentions: base[i] + Math.floor(Math.random() * 1000),
    sentiment: (['hype', 'debate', 'hype', 'hype', 'hype', 'debate',
      'hype', 'hype', 'hype', 'hype', 'hype', 'hype',
      'drama', 'hype', 'debate', 'hype'][i]) as 'hype' | 'debate' | 'drama',
  }))
}

const SENTIMENT_COLORS = {
  hype:   '#16a34a',
  debate: '#d97706',
  drama:  '#dc2626',
}

export default function HeatwavePage() {
  const [nodes, setNodes] = useState(generateMockMentions())
  const [selected, setSelected] = useState<typeof nodes[0] | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(generateMockMentions())
      setLastUpdated(new Date())
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const maxMentions = Math.max(...nodes.map(n => n.mentions))

  function circleRadius(mentions: number) {
    return 1 + (mentions / maxMentions) * 4
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 100px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(24px, 4vw, 40px)',
          letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
        }}>
          GLOBAL HEATWAVE
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 6 }}>
          Visualising WC2026 trending activity across the globe.
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 20 }}>
          Updated {lastUpdated.toLocaleTimeString()} ·
          🟢 Hype · 🟡 Debate · 🔴 Drama
        </p>

        {/* World map SVG */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 16, marginBottom: 16, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <svg
            viewBox="0 0 100 60"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <rect width="100" height="60" fill="#0a1628" opacity="0.4" rx="4" />

            {/* Continent shapes */}
            {/* NA */}
            <path d="M5 15 L25 15 L35 30 L25 50 L15 50 L5 30 Z" fill="#1a2a1a" opacity="0.6" />
            {/* SA */}
            <path d="M25 45 L40 45 L40 70 L25 70 Z" fill="#1a2a1a" opacity="0.6" />
            {/* EU */}
            <path d="M45 15 L60 15 L60 30 L45 30 Z" fill="#1a2a1a" opacity="0.6" />
            {/* AF */}
            <path d="M45 30 L65 30 L65 55 L45 55 Z" fill="#1a2a1a" opacity="0.6" />
            {/* AS */}
            <path d="M60 10 L95 10 L95 45 L60 45 Z" fill="#1a2a1a" opacity="0.6" />
            {/* OC */}
            <path d="M75 50 L95 50 L95 70 L75 70 Z" fill="#1a2a1a" opacity="0.6" />

            {/* Country activity circles */}
            {nodes.map(node => {
              const r = circleRadius(node.mentions)
              const color = SENTIMENT_COLORS[node.sentiment]
              const isSelected = selected?.code === node.code

              return (
                <g
                  key={node.code}
                  onClick={() => setSelected(isSelected ? null : node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulse ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 1.5}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.2"
                    opacity="0.3"
                  >
                    <animate attributeName="r" from={r} to={r+2} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Main circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={color}
                    opacity={isSelected ? 1 : 0.7}
                    stroke={isSelected ? '#fff' : 'none'}
                    strokeWidth={isSelected ? 0.3 : 0}
                  />
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected country detail */}
        {selected && (
          <div style={{
            background: 'var(--bg-card)', border: `1px solid ${SENTIMENT_COLORS[selected.sentiment]}`,
            borderRadius: 12, padding: 16, marginBottom: 16,
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 32 }}>{selected.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18,
                  fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                  {selected.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {selected.mentions.toLocaleString()} mentions today
                </div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 800,
                color: '#fff', background: SENTIMENT_COLORS[selected.sentiment],
                padding: '2px 8px', borderRadius: 4,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {selected.sentiment}
              </div>
            </div>
          </div>
        )}

        {/* Top countries leaderboard */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
          }}>
            Leaderboard
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...nodes]
              .sort((a, b) => b.mentions - a.mentions)
              .slice(0, 8)
              .map((node, i) => (
                <div key={node.code} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
                    minWidth: 16, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 20 }}>{node.flag}</span>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, flex: 1 }}>
                    {node.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      height: 4, width: 60,
                      background: 'var(--bg-elevated)',
                      borderRadius: 2, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${(node.mentions / maxMentions) * 100}%`,
                        background: SENTIMENT_COLORS[node.sentiment],
                      }} />
                    </div>
                    <span style={{
                      fontSize: 11, color: 'var(--text-2)',
                      fontVariantNumeric: 'tabular-nums', minWidth: 45,
                      textAlign: 'right', fontWeight: 600,
                    }}>
                      {(node.mentions / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </main>
      <BottomNav />
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
