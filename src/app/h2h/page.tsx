'use client'
import { useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'

const TEAMS = [
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { code: 'FRA', name: 'France', flag: '🇫🇷' },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ENG', name: 'England', flag: '🏴' },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { code: 'GER', name: 'Germany', flag: '🇩🇪' },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { code: 'USA', name: 'USA', flag: '🇺🇸' },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹' },
  { code: 'URU', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'CRO', name: 'Croatia', flag: '🇭🇷' },
  { code: 'MAR', name: 'Morocco', flag: '🇲🇦' },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
]

// Static H2H data — expand with real data from wc-history.json
const H2H_DATA: Record<string, { w: number; d: number; l: number; lastMatch: string }> = {
  'ARG-FRA': { w: 3, d: 1, l: 3, lastMatch: '2022 WC Final — France 3-3 Argentina (Argentina win on penalties)' },
  'BRA-ARG': { w: 4, d: 2, l: 2, lastMatch: '2021 Copa América Final — Argentina 1-0 Brazil' },
  'ENG-GER': { w: 3, d: 3, l: 4, lastMatch: '2010 WC R16 — Germany 4-1 England' },
  'ESP-BRA': { w: 2, d: 1, l: 3, lastMatch: '2013 Confed Cup Final — Brazil 3-0 Spain' },
}

function getH2H(teamA: string, teamB: string) {
  const key1 = `${teamA}-${teamB}`
  const key2 = `${teamB}-${teamA}`
  if (H2H_DATA[key1]) return { ...H2H_DATA[key1], perspective: teamA }
  if (H2H_DATA[key2]) {
    const d = H2H_DATA[key2]
    return { w: d.l, d: d.d, l: d.w, lastMatch: d.lastMatch, perspective: teamA }
  }
  return { w: 2, d: 1, l: 2, lastMatch: 'Multiple encounters in WC history', perspective: teamA }
}

export default function H2HPage() {
  const [teamA, setTeamA] = useState('ARG')
  const [teamB, setTeamB] = useState('FRA')
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const tA = TEAMS.find(t => t.code === teamA)!
  const tB = TEAMS.find(t => t.code === teamB)!
  const h2h = getH2H(teamA, teamB)
  const total = h2h.w + h2h.d + h2h.l || 1

  async function fetchNarrative() {
    setLoading(true)
    try {
      const res = await fetch('/api/h2h/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamA: tA.name,
          teamB: tB.name,
          h2h,
        }),
      })
      const data = await res.json()
      setNarrative(data.narrative ?? '')
    } catch {
      setNarrative('The Archive is researching this fixture. Try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 100px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(24px, 4vw, 40px)',
          letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
        }}>
          HEAD TO HEAD
        </h1>

        {/* Team selectors */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          gap: 12, alignItems: 'center', marginBottom: 24,
        }}>
          <select
            value={teamA}
            onChange={e => { setTeamA(e.target.value); setNarrative('') }}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 12px', fontSize: 14,
              color: 'var(--text)', cursor: 'pointer', outline: 'none',
            }}
          >
            {TEAMS.map(t => (
              <option key={t.code} value={t.code}>{t.flag} {t.name}</option>
            ))}
          </select>

          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
            color: 'var(--text-3)', textAlign: 'center',
          }}>
            vs
          </div>

          <select
            value={teamB}
            onChange={e => { setTeamB(e.target.value); setNarrative('') }}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 12px', fontSize: 14,
              color: 'var(--text)', cursor: 'pointer', outline: 'none',
            }}
          >
            {TEAMS.map(t => (
              <option key={t.code} value={t.code}>{t.flag} {t.name}</option>
            ))}
          </select>
        </div>

        {/* Big vs display */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '28px 20px', marginBottom: 16,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* Ghost flags */}
          <div style={{
            position: 'absolute', left: -10, top: -10,
            fontSize: 100, opacity: 0.05, lineHeight: 1,
            pointerEvents: 'none',
          }}>{tA.flag}</div>
          <div style={{
            position: 'absolute', right: -10, top: -10,
            fontSize: 100, opacity: 0.05, lineHeight: 1,
            pointerEvents: 'none',
          }}>{tB.flag}</div>

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 20, position: 'relative',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52 }}>{tA.flag}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16,
                fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {tA.name}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 28,
              fontWeight: 900, color: 'var(--text-3)',
            }}>
              vs
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52 }}>{tB.flag}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16,
                fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {tB.name}
              </div>
            </div>
          </div>
        </div>

        {/* W/D/L stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10, marginBottom: 16,
        }}>
          {[
            { label: `${tA.name} wins`, value: h2h.w, color: 'var(--green)' },
            { label: 'Draws', value: h2h.d, color: 'var(--text-3)' },
            { label: `${tB.name} wins`, value: h2h.l, color: 'var(--info)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 12px', textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 36,
                fontWeight: 900, fontVariantNumeric: 'tabular-nums',
                color: stat.color, marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)',
                fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Win % bar */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 16,
        }}>
          <div style={{ height: 8, borderRadius: 4, overflow: 'hidden',
            background: 'var(--bg-elevated)', display: 'flex' }}>
            <div style={{
              width: `${(h2h.w / total) * 100}%`,
              background: 'var(--green)',
            }} />
            <div style={{
              width: `${(h2h.d / total) * 100}%`,
              background: 'var(--border)',
            }} />
            <div style={{
              width: `${(h2h.l / total) * 100}%`,
              background: 'var(--info)',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 10, color: 'var(--text-3)', marginTop: 6,
          }}>
            <span>{tA.flag} {Math.round((h2h.w / total) * 100)}%</span>
            <span>Draws {Math.round((h2h.d / total) * 100)}%</span>
            <span>{Math.round((h2h.l / total) * 100)}% {tB.flag}</span>
          </div>
        </div>

        {/* Last match */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          fontSize: 12, color: 'var(--text-2)',
        }}>
          <span style={{ color: 'var(--text-3)', marginRight: 8,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em' }}>
            Last meeting
          </span>
          {h2h.lastMatch}
        </div>

        {/* Archive narration */}
        {narrative ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid #1a3a1a',
            borderRadius: '0 12px 12px 0',
            padding: 16, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: '#1a3a1a',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 9, color: 'rgba(255,255,255,0.85)',
              }}>AR</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>
                The Archive
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)',
              lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
              {narrative}
            </p>
          </div>
        ) : (
          <button
            onClick={fetchNarrative}
            disabled={loading}
            style={{
              width: '100%', background: loading
                ? 'var(--bg-elevated)' : 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid #1a3a1a',
              borderRadius: '0 12px 12px 0',
              padding: '14px 16px', fontSize: 13, fontWeight: 500,
              color: loading ? 'var(--text-3)' : 'var(--text)',
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'left', display: 'flex', gap: 10,
              alignItems: 'center',
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: 6, background: '#1a3a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 9, color: 'rgba(255,255,255,0.85)', flexShrink: 0,
            }}>AR</div>
            <span>
              {loading
                ? 'The Archive is researching this fixture...'
                : `Ask The Archive about ${tA.name} vs ${tB.name} history →`}
            </span>
          </button>
        )}

      </main>
      <BottomNav />
    </>
  )
}
