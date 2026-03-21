'use client'
import { useState, useRef, useEffect } from 'react'

interface Player {
  id: string
  name: string
  fullName: string
  position: string
  nationality: string
  flag: string
  club: string
  photo: string | null
  kitColors: string[]
  stats: { goals: number; assists: number; appearances: number; rating: number }
  rarity: 'bronze' | 'silver' | 'gold' | 'rainbow'
  number?: number
}

const RARITY_STYLES = {
  bronze:  { border: '#8b5a2b', glow: 'rgba(139,90,43,0.5)',  badge: '#cd7f32', label: 'Bronze'  },
  silver:  { border: '#708090', glow: 'rgba(112,128,144,0.4)', badge: '#c0c0c0', label: 'Silver'  },
  gold:    { border: '#d4a017', glow: 'rgba(212,160,23,0.6)',  badge: '#ffd700', label: 'Gold'    },
  rainbow: { border: '#9b59b6', glow: 'rgba(155,89,182,0.6)', badge: '#7c3aed', label: 'Rainbow' },
}

function getSerial(id: string): string {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return String(h).padStart(4, '0')
}

function StatBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          {label}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 800,
          color: '#fff', fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
      </div>
      <div style={{
        height: 4, borderRadius: 2,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          transition: 'width 1s ease-out',
        }} />
      </div>
    </div>
  )
}

export function TradingCard({ player }: { player: Player }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const [photoSrc, setPhotoSrc] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState(false)
  const [description, setDescription] = useState('')
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [shimX, setShimX] = useState(50)
  const [shimY, setShimY] = useState(50)
  const [downloading, setDownloading] = useState(false)
  const [animStats, setAnimStats] = useState({ goals: 0, assists: 0, appearances: 0, rating: 0 })

  const rar = RARITY_STYLES[player.rarity]
  const kit0 = player.kitColors[0] ?? '#555'
  const kit1 = player.kitColors[1] ?? '#888'
  const serial = getSerial(player.id)

  // Fetch photo via API then load as img src
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/cards/${player.id}/photo`, {
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        const url = data.cutout ?? data.thumb ?? null
        if (!cancelled && url) {
          // Use proxied URL so img src works cross-origin
          setPhotoSrc(`/api/proxy/image?url=${encodeURIComponent(url)}`)
        }
      } catch {
        // photoSrc stays null — fallback renders
      }
    }
    load()
    return () => { cancelled = true }
  }, [player.id])

  // Stat count-up
  useEffect(() => {
    const target = player.stats
    const dur = 900
    const start = Date.now()
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setAnimStats({
        goals: Math.round(target.goals * e),
        assists: Math.round(target.assists * e),
        appearances: Math.round(target.appearances * e),
        rating: parseFloat((target.rating * e).toFixed(1)),
      })
      if (p >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [player.stats])

  // AI description
  useEffect(() => {
    fetch(`/api/cards/${player.id}/description`)
      .then(r => r.json())
      .then(d => setDescription(d.description ?? ''))
      .catch(() => setDescription(`${player.fullName} is one to watch at WC2026.`))
  }, [player.id, player.fullName])

  // Tilt handlers
  function onMove(x: number, y: number, rect: DOMRect) {
    const rx = (y - rect.top) / rect.height
    const ry = (x - rect.left) / rect.width
    setTiltX((rx - 0.5) * -16)
    setTiltY((ry - 0.5) * 16)
    setShimX(ry * 100)
    setShimY(rx * 100)
  }

  async function download() {
    setDownloading(true)
    try {
      // Dynamically import html2canvas only at download time
      const { default: html2canvas } = await import(
        /* webpackIgnore: true */ 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js'
      )
      const el = cardRef.current
      if (!el) return
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, allowTaint: false })
      const link = document.createElement('a')
      link.download = `kickoffto-${player.id}-wc2026.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('Download failed — try right-clicking the card and saving the image.')
    } finally {
      setDownloading(false)
    }
  }

  const CardFront = (
    <div style={{
      width: 300, borderRadius: 18, overflow: 'hidden',
      background: '#080808', userSelect: 'none',
      boxShadow: `0 0 0 1.5px ${rar.border}, 0 0 30px ${rar.glow}, 0 16px 48px rgba(0,0,0,0.8)`,
    }}>
      {/* Kit stripe */}
      <div style={{ height: 6, display: 'flex' }}>
        <div style={{ flex: 1, background: kit0 }} />
        <div style={{ flex: 1, background: kit1 }} />
      </div>

      {/* Photo area */}
      <div style={{
        height: 200, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(160deg, ${kit0}cc, ${kit0}44 60%, #080808)`,
      }}>
        {/* WC2026 badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 2,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          borderRadius: 7, padding: '3px 8px',
          fontSize: 10, color: '#16a34a', fontWeight: 700,
        }}>
          ⚽ WC2026
        </div>

        {/* Player number */}
        {player.number && (
          <div style={{
            position: 'absolute', top: 8, right: 8, zIndex: 2,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            borderRadius: 7, padding: '3px 8px',
            fontSize: 11, color: '#fff', fontWeight: 800,
          }}>
            #{player.number}
          </div>
        )}

        {/* Player photo or fallback */}
        {photoSrc && !photoError ? (
          <img
            src={photoSrc}
            alt={player.fullName}
            onError={() => setPhotoError(true)}
            style={{
              position: 'absolute', bottom: 0,
              left: '50%', transform: 'translateX(-50%)',
              height: '95%', width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 56, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
              {player.flag}
            </span>
            <span style={{
              fontSize: 22, color: 'rgba(255,255,255,0.15)',
              fontFamily: 'var(--font-display)', fontWeight: 900,
            }}>
              {player.position}
            </span>
          </div>
        )}

        {/* Vignette */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(transparent, #080808)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Player info */}
      <div style={{ padding: '12px 14px 0', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 20, color: '#f0f0f0', letterSpacing: -0.5, lineHeight: 1,
          marginBottom: 4,
        }}>
          {player.name}
        </div>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.45)',
          marginBottom: 2,
        }}>
          {player.flag} {player.position} · {player.nationality}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
          {player.club}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 0.5, background: 'rgba(255,255,255,0.06)', margin: '0 14px' }} />

      {/* Stats */}
      <div style={{ padding: '10px 14px' }}>
        <StatBar label="⚽ Goals"    value={animStats.goals}       max={20}  color={kit0} />
        <StatBar label="🎯 Assists"  value={animStats.assists}     max={20}  color={kit0} />
        <StatBar label="📅 Apps"     value={animStats.appearances} max={100} color={kit0} />
        {player.stats.rating > 0 && (
          <StatBar label="⭐ Rating"  value={animStats.rating}      max={10}  color={kit0} />
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: 9, fontWeight: 700,
            color: rar.badge, marginBottom: 2,
          }}>
            {rar.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
            #{serial}/10000
          </div>
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', textAlign: 'right' }}>
          kickoffto.com<br/>WC2026
        </div>
      </div>

      {/* Holographic shimmer overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 18,
        background: `
          radial-gradient(circle at ${shimX}% ${shimY}%,
            rgba(255,255,255,0.15) 0%, transparent 55%),
          repeating-linear-gradient(
            ${45 + shimX * 0.4}deg,
            rgba(255,0,150,0.04) 0px, rgba(0,200,255,0.04) 4px,
            rgba(0,255,180,0.04) 8px, rgba(255,220,0,0.04) 12px)`,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />
    </div>
  )

  const CardBack = (
    <div style={{
      width: 300, borderRadius: 18, overflow: 'hidden',
      background: '#080808', userSelect: 'none',
      boxShadow: `0 0 0 1.5px ${rar.border}, 0 0 30px ${rar.glow}, 0 16px 48px rgba(0,0,0,0.8)`,
    }}>
      <div style={{ height: 6, display: 'flex' }}>
        <div style={{ flex: 1, background: kit0 }} />
        <div style={{ flex: 1, background: kit1 }} />
      </div>
      <div style={{
        background: `linear-gradient(160deg, ${kit0}88, transparent)`,
        padding: '20px 16px',
      }}>
        <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 8 }}>
          {player.flag}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 18, color: '#f0f0f0', textAlign: 'center',
          marginBottom: 16,
        }}>
          {player.fullName}
        </div>
        <div style={{
          fontSize: 9, fontWeight: 700, color: 'var(--green)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
        }}>
          WC2026 STATS
        </div>
        {[
          { label: '⚽ Goals',       value: player.stats.goals },
          { label: '🎯 Assists',     value: player.stats.assists },
          { label: '📅 Appearances', value: player.stats.appearances },
          { label: '⭐ Rating',      value: player.stats.rating > 0 ? player.stats.rating.toFixed(1) : 'TBD' },
          { label: '🏟️ Club',        value: player.club },
          { label: '🌍 Nation',      value: player.nationality },
          { label: '📍 Position',    value: player.position },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0' }}>{String(s.value)}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: rar.badge, fontWeight: 700 }}>
          {rar.label.toUpperCase()} · #{serial}/10000
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>kickoffto.com</span>
      </div>
    </div>
  )

  return (
    <div>
      {/* 3D flip container */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        marginBottom: 16, perspective: '1000px',
      }}>
        <div
          ref={cardRef}
          onClick={() => setFlipped(f => !f)}
          onMouseMove={e => {
            const rect = cardRef.current?.getBoundingClientRect()
            if (rect) onMove(e.clientX, e.clientY, rect)
          }}
          onMouseLeave={() => { setTiltX(0); setTiltY(0); setShimX(50); setShimY(50) }}
          onTouchMove={e => {
            const rect = cardRef.current?.getBoundingClientRect()
            if (rect && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY, rect)
          }}
          style={{
            position: 'relative', cursor: 'pointer',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.55s cubic-bezier(0.4,0.2,0.2,1)',
            transform: `rotateY(${flipped ? 180 : 0}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          }}
        >
          {/* Front */}
          <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'relative' }}>
            {CardFront}
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
              borderRadius: 6, padding: '2px 8px',
              fontSize: 9, color: 'rgba(255,255,255,0.4)',
              pointerEvents: 'none',
            }}>
              Tap to flip
            </div>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}>
            {CardBack}
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
              borderRadius: 6, padding: '2px 8px',
              fontSize: 9, color: 'rgba(255,255,255,0.4)',
              pointerEvents: 'none',
            }}>
              Tap to flip back
            </div>
          </div>
        </div>
      </div>

      {/* AI description */}
      {description && (
        <div style={{
          background: 'var(--bg-card)',
          borderLeft: `3px solid ${kit0}`,
          border: '1px solid var(--border)',
          borderRadius: '0 12px 12px 0',
          padding: '12px 14px', marginBottom: 14,
        }}>
          <p style={{
            fontSize: 12, color: 'var(--text-2)',
            lineHeight: 1.65, fontStyle: 'italic', margin: 0,
          }}>
            &ldquo;{description}&rdquo;
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5, margin: '5px 0 0' }}>
            — El Maestro · KickoffTo WC2026
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={download}
          disabled={downloading}
          style={{
            flex: 2,
            background: `linear-gradient(135deg, ${kit0}, ${kit0}bb)`,
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '13px', fontSize: 14, fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.7 : 1,
            boxShadow: `0 4px 20px ${kit0}44`,
          }}
        >
          {downloading ? 'Saving...' : '↓ Download PNG'}
        </button>
        <button
          onClick={async () => {
            const url = `${window.location.origin}/cards/${player.id}`
            const text = `Check out my ${player.fullName} WC2026 card on KickoffTo 🃏\n${url}`
            if (navigator.share) {
              await navigator.share({ title: player.fullName, text, url })
            } else {
              await navigator.clipboard.writeText(text)
              alert('Link copied!')
            }
          }}
          style={{
            flex: 1, background: 'var(--bg-elevated)',
            color: 'var(--text-2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '13px', fontSize: 14, cursor: 'pointer',
          }}
        >
          Share
        </button>
      </div>

      <p style={{
        fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 8,
      }}>
        #{serial}/10000 · {rar.label} Edition
      </p>
    </div>
  )
}
